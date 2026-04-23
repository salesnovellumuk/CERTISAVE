from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.urls import path
from django.shortcuts import redirect, render
from django.contrib import messages
from django.utils import timezone
from .models import Company, User, CertType, Employee, Cert, BookedCourse, Notification, ChangeRequest
from accounts.notifications import notify
import stripe
from django.conf import settings

BASE = '/dashboard/control-panel'


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Company', {'fields': ('company',)}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Company', {'fields': ('company',)}),
    )


@admin.register(Cert)
class CertAdmin(admin.ModelAdmin):
    list_display = ['employee', 'cert_type', 'employee_company', 'issue_date', 'get_expiry_date', 'get_days_until_expiry', 'status', 'rebook_triggered', 'get_extras_summary', 'charge_button']
    list_filter = ['cert_type', 'rebook_triggered', 'employee__company']
    readonly_fields = ['get_expiry_date', 'get_days_until_expiry', 'get_extras_summary']

    def employee_company(self, obj):
        return obj.employee.company.name
    employee_company.short_description = 'Company'

    def get_expiry_date(self, obj):
        return obj.expiry_date
    get_expiry_date.short_description = 'Expiry date'

    def get_days_until_expiry(self, obj):
        days = obj.days_until_expiry
        if days < 0:
            return f'{abs(days)} days overdue'
        return f'{days} days left'
    get_days_until_expiry.short_description = 'Days until expiry'

    def get_extras_summary(self, obj):
        if not obj.extras:
            return '—'
        parts = []
        if obj.extras.get('card_categories'):
            parts.append(f"Categories: {', '.join(obj.extras['card_categories'])}")
        if 'logbook_entries' in obj.extras:
            complete = '✓' if obj.extras.get('logbook_complete') else '✗'
            parts.append(f"Logbook: {obj.extras['logbook_entries']}/60 {complete}")
        if obj.extras.get('level'):
            parts.append(f"Level: {obj.extras['level']}")
        if obj.extras.get('categories'):
            parts.append(f"Categories: {', '.join(obj.extras['categories'])}")
        return ' | '.join(parts) if parts else '—'
    get_extras_summary.short_description = 'Cert Details'

    def charge_button(self, obj):
        from django.utils.html import format_html
        if obj.rebook_triggered:
            return format_html('<span style="color:#94a3b8;font-size:12px;">Already booked</span>')
        return format_html(
            '<a class="button" href="{}/accounts/cert/{}/charge/">Charge & Book</a>',
            BASE, obj.id
        )
    charge_button.short_description = 'Action'

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('<int:cert_id>/charge/', self.admin_site.admin_view(self.charge_view), name='cert-charge'),
        ]
        return custom_urls + urls

    def charge_view(self, request, cert_id):
        cert = Cert.objects.select_related('employee__company', 'cert_type').get(pk=cert_id)
        company = cert.employee.company

        if cert.rebook_triggered:
            messages.error(request, 'This cert has already been rebooked — charge blocked.')
            return redirect(f'{BASE}/accounts/cert/')

        if request.method == 'POST':
            amount_str = request.POST.get('amount', '')
            try:
                amount_pence = int(float(amount_str) * 100)
            except ValueError:
                messages.error(request, 'Invalid amount.')
                return redirect(f'{BASE}/accounts/cert/{cert_id}/charge/')

            # Cap at £5,000 to prevent typos causing massive charges
            if amount_pence <= 0 or amount_pence > 500000:
                messages.error(request, 'Amount must be between £0.01 and £5,000.')
                return redirect(f'{BASE}/accounts/cert/{cert_id}/charge/')

            if not company.stripe_customer_id or not company.stripe_payment_method_id:
                messages.error(request, f'{company.name} has no payment method on file.')
                return redirect(f'{BASE}/accounts/cert/')

            try:
                stripe.api_key = settings.STRIPE_SECRET_KEY

                intent = stripe.PaymentIntent.create(
                    amount=amount_pence,
                    currency='gbp',
                    customer=company.stripe_customer_id,
                    payment_method=company.stripe_payment_method_id,
                    off_session=True,
                    confirm=True,
                    description=f'{cert.cert_type.name} renewal - {cert.employee.full_name}',
                    metadata={'company_id': company.id, 'cert_id': cert.id}
                )

                BookedCourse.objects.create(
                    cert=cert,
                    course_date=request.POST.get('course_date'),
                    course_time=request.POST.get('course_time') or None,
                    provider=request.POST.get('provider', ''),
                    location=request.POST.get('location', ''),
                    booking_reference=request.POST.get('booking_reference', ''),
                    additional_info=request.POST.get('additional_info', ''),
                    cost=float(amount_str),
                    notes=request.POST.get('notes', '') or f'Charged via Stripe: {intent.id}',
                )

                cert.rebook_triggered = True
                cert.rebook_triggered_at = timezone.now()
                cert.save(update_fields=['rebook_triggered', 'rebook_triggered_at'])

                notify(
                    company,
                    f'Course booked for {cert.employee.full_name}',
                    f'{cert.cert_type.name} renewal has been booked and £{amount_str} charged to your card.'
                )

                messages.success(request, f'✓ Charged £{amount_str} to {company.name} for {cert.employee.full_name} — {cert.cert_type.name}')
                return redirect(f'{BASE}/accounts/cert/')

            except stripe.error.CardError as e:
                messages.error(request, f'Card declined: {e.user_message}')
                return redirect(f'{BASE}/accounts/cert/{cert_id}/charge/')
            except stripe.error.StripeError as e:
                messages.error(request, f'Stripe error: {str(e)}')
                return redirect(f'{BASE}/accounts/cert/{cert_id}/charge/')

        return render(request, 'admin/cert_charge.html', {
            'cert': cert,
            'company': company,
            'base': BASE,
        })


@admin.register(BookedCourse)
class BookedCourseAdmin(admin.ModelAdmin):
    list_display = ['cert', 'course_date', 'course_time', 'provider', 'location', 'cost']

    def has_add_permission(self, request):
        return False

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        if not change:
            notify(
                obj.cert.employee.company,
                f'Course booked for {obj.cert.employee.full_name}',
                f'{obj.cert.cert_type.name} on {obj.course_date} at {obj.provider or "TBC"}'
            )
        else:
            notify(
                obj.cert.employee.company,
                f'Booking updated for {obj.cert.employee.full_name}',
                f'{obj.cert.cert_type.name} on {obj.course_date} at {obj.provider or "TBC"}'
            )

    def delete_model(self, request, obj):
        notify(
            obj.cert.employee.company,
            f'Booking cancelled for {obj.cert.employee.full_name}',
            f'{obj.cert.cert_type.name} booked for {obj.course_date} has been cancelled.'
        )
        super().delete_model(request, obj)


@admin.action(description='Resolve & notify company')
def resolve_change_request(modeladmin, request, queryset):
    for cr in queryset.filter(resolved=False):
        booking = cr.booking
        booking.course_date = cr.preferred_date
        if cr.preferred_time:
            booking.course_time = cr.preferred_time
        booking.save()
        cr.resolved = True
        cr.save()
        notify(
            booking.cert.employee.company,
            f'Booking updated for {booking.cert.employee.full_name}',
            f'Your {booking.cert.cert_type.name} course has been rescheduled to {cr.preferred_date}'
            + (f' at {cr.preferred_time}' if cr.preferred_time else '') + '.'
        )


@admin.register(ChangeRequest)
class ChangeRequestAdmin(admin.ModelAdmin):
    actions = [resolve_change_request]
    list_display = ['booking', 'preferred_date', 'preferred_time', 'resolved', 'created_at']
    list_filter = ['resolved']
    readonly_fields = ['booking', 'preferred_date', 'preferred_time', 'notes', 'created_at']


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['company', 'title', 'read', 'created_at']
    list_filter = ['read', 'company']


admin.site.register(Company)
admin.site.register(User, CustomUserAdmin)
admin.site.register(CertType)
admin.site.register(Employee)