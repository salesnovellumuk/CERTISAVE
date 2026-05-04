from django.contrib.auth import authenticate
from django.conf import settings
from django.db import transaction
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from rest_framework.permissions import BasePermission
from rest_framework.authtoken.models import Token
from accounts.models import Company, Employee, Cert, CertType, BookedCourse, Notification, ChangeRequest
from accounts.notifications import notify
from .serializers import (
    RegisterSerializer,
    CompanySerializer,
    EmployeeListSerializer,
    EmployeeDetailSerializer,
    CertSerializer,
    CertTypeSerializer,
    BookedCourseSerializer,
    NotificationSerializer,
    ChangeRequestSerializer,
)

PRICE_IDS = {
    'solo':    settings.STRIPE_SOLO_PRICE_ID,
    'starter': settings.STRIPE_STARTER_PRICE_ID,
    'growth':  settings.STRIPE_GROWTH_PRICE_ID,
}

VALID_PLANS = ['solo', 'starter', 'growth']


class NotSoloOrReadOnly(BasePermission):
    """Solo users can read and update existing records but can't create or delete."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS', 'PATCH', 'PUT'):
            return True
        if not request.user.is_authenticated or not request.user.company:
            return False
        return not request.user.company.is_solo


#-------------------------------------------------------------------------------------------------------
#-------------------------------------------------------------------------------------------------------
#AUTH START
#-------------------------------------------------------------------------------------------------------
#-------------------------------------------------------------------------------------------------------

class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import stripe
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    user = serializer.save()
                    token, _ = Token.objects.get_or_create(user=user)
                    setup_intent = stripe.SetupIntent.create(
                        customer=user.company.stripe_customer_id,
                        payment_method_types=['card'],
                        usage='off_session',
                        metadata={'company_id': user.company.id}
                    )
            except Exception as e:
                return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

            response = Response({
                'client_secret': setup_intent.client_secret,
                'user': {
                    'id':         user.id,
                    'email':      user.email,
                    'first_name': user.first_name,
                    'last_name':  user.last_name,
                    'company':    user.company.name,
                    'company_id': user.company.id,
                    'plan':       user.company.plan,
                }
            }, status=status.HTTP_201_CREATED)

            response.set_cookie(
                'auth_token',
                token.key,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=60 * 60 * 24 * 30,
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            token, _ = Token.objects.get_or_create(user=user)
            response = Response({
                'user': {
                    'first_name': user.first_name,
                    'last_name':  user.last_name,
                    'email':      user.email,
                }
            })
            response.set_cookie(
                'auth_token',
                token.key,
                httponly=True,
                secure=not settings.DEBUG,
                samesite='Lax',
                max_age=60 * 60 * 24 * 30,
            )
            return response
        return Response(
            {'error': 'Invalid credentials'},
            status=status.HTTP_401_UNAUTHORIZED
        )


class LogoutView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        response = Response({'status': 'ok'})
        response.delete_cookie('auth_token')
        return response


class CompanyView(generics.RetrieveUpdateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user.company

    def perform_update(self, serializer):
        import stripe
        company = serializer.save()
        if company.stripe_customer_id:
            try:
                stripe.Customer.modify(
                    company.stripe_customer_id,
                    name=company.name,
                )
            except Exception:
                pass

#-------------------------------------------------------------------------------------------------------
#-------------------------------------------------------------------------------------------------------
#AUTH END
#-------------------------------------------------------------------------------------------------------
#-------------------------------------------------------------------------------------------------------


class EmployeeListView(generics.ListCreateAPIView):
    serializer_class = EmployeeListSerializer
    permission_classes = [permissions.IsAuthenticated, NotSoloOrReadOnly]

    def get_queryset(self):
        return Employee.objects.filter(
            company=self.request.user.company
        ).prefetch_related('certs')

    def perform_create(self, serializer):
        company = self.request.user.company
        if company.at_employee_limit:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('plan_limit_reached')
        employee = serializer.save(company=company)
        notify(
            company,
            'New team member added',
            f'{employee.full_name} has been added to your team.'
        )
        count = company.employees.count()
        limit = company.employee_limit
        if count == limit:
            notify(
                company,
                'Employee limit reached',
                f'You\'ve reached your {limit} employee limit on the {company.plan.capitalize()} plan. Upgrade to Growth to add more.'
            )
        elif count == round(limit * 0.8):
            notify(
                company,
                'Approaching employee limit',
                f'You have {count} of {limit} employees used. You\'re getting close to your plan limit.'
            )


class EmployeeDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = EmployeeDetailSerializer
    permission_classes = [permissions.IsAuthenticated, NotSoloOrReadOnly]

    def get_queryset(self):
        return Employee.objects.filter(company=self.request.user.company)

    def perform_update(self, serializer):
        employee = serializer.save()
        notify(
            self.request.user.company,
            'Team member updated',
            f'{employee.full_name}\'s details have been updated.'
        )

    def perform_destroy(self, instance):
        notify(
            self.request.user.company,
            'Team member removed',
            f'{instance.full_name} has been removed from your team.'
        )
        instance.delete()


class CertListView(generics.ListCreateAPIView):
    serializer_class = CertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cert.objects.filter(
            employee__company=self.request.user.company
        ).select_related('cert_type', 'employee')

    def perform_create(self, serializer):
        cert = serializer.save()
        notify(
            cert.employee.company,
            'Certificate added',
            f'{cert.cert_type.name} added for {cert.employee.full_name}.'
        )


class CertDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CertSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Cert.objects.filter(employee__company=self.request.user.company)

    def perform_update(self, serializer):
        cert = serializer.save()
        notify(
            cert.employee.company,
            'Certificate updated',
            f'{cert.cert_type.name} for {cert.employee.full_name} has been updated.'
        )

    def perform_destroy(self, instance):
        notify(
            instance.employee.company,
            'Certificate removed',
            f'{instance.cert_type.name} removed for {instance.employee.full_name}.'
        )
        instance.delete()


class CertTypeListView(generics.ListAPIView):
    serializer_class = CertTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = CertType.objects.all()


class BookedCourseListView(generics.ListAPIView):
    serializer_class = BookedCourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BookedCourse.objects.filter(
            cert__employee__company=self.request.user.company
        ).select_related('cert__employee', 'cert__cert_type').order_by('course_date')


class BookedCourseDetailView(generics.RetrieveAPIView):
    serializer_class = BookedCourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return BookedCourse.objects.filter(
            cert__employee__company=self.request.user.company
        ).select_related('cert__employee', 'cert__cert_type')


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        company = user.company
        return Response({
            'first_name': user.first_name,
            'last_name':  user.last_name,
            'email':      user.email,
            'company':    company.name if company else '',
            'plan':       company.plan if company else '',
            'is_solo':    company.is_solo if company else False,
        })


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            company=self.request.user.company
        ).order_by('-created_at')


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            n = Notification.objects.get(pk=pk, company=request.user.company)
            n.read = True
            n.save()
            return Response({'status': 'ok'})
        except Notification.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)


class ChangeRequestCreateView(generics.CreateAPIView):
    serializer_class = ChangeRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        booking_id = self.request.data.get('booking')
        try:
            booking = BookedCourse.objects.get(
                pk=booking_id,
                cert__employee__company=self.request.user.company
            )
        except BookedCourse.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied()

        change_request = serializer.save()
        notify(
            self.request.user.company,
            f'Change request received for {booking.cert.employee.full_name}',
            f'Requested new date: {change_request.preferred_date}'
            + (f' at {change_request.preferred_time}' if change_request.preferred_time else '')
            + (f'. Notes: {change_request.notes}' if change_request.notes else '')
        )


class SetupCompleteView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import stripe

        company = request.user.company
        payment_method_id = request.data.get('payment_method_id')

        if not payment_method_id:
            return Response({'error': 'payment_method_id required'}, status=status.HTTP_400_BAD_REQUEST)

        price_id = PRICE_IDS.get(company.plan)
        if not price_id:
            return Response({'error': 'Invalid plan'}, status=status.HTTP_400_BAD_REQUEST)

        stripe.PaymentMethod.attach(
            payment_method_id,
            customer=company.stripe_customer_id,
        )

        stripe.Customer.modify(
            company.stripe_customer_id,
            invoice_settings={'default_payment_method': payment_method_id},
        )

        subscription = stripe.Subscription.create(
            customer=company.stripe_customer_id,
            items=[{'price': price_id}],
            default_payment_method=payment_method_id,
            expand=['latest_invoice.payment_intent'],
        )

        company.stripe_payment_method_id = payment_method_id
        company.stripe_subscription_id = subscription.id
        company.save(update_fields=['stripe_payment_method_id', 'stripe_subscription_id'])

        return Response({'status': 'ok', 'subscription_id': subscription.id})


class CancelSubscriptionView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import stripe
        company = request.user.company

        if not company.stripe_subscription_id:
            return Response({'error': 'No active subscription'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stripe.Subscription.modify(
                company.stripe_subscription_id,
                cancel_at_period_end=True
            )
            company.subscription_active = False
            company.cancel_reason   = request.data.get('reason', '')
            company.cancel_feedback = request.data.get('feedback', '')
            company.save(update_fields=['subscription_active', 'cancel_reason', 'cancel_feedback'])
            return Response({'status': 'ok'})
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ResubscribeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import stripe
        company = request.user.company

        if not company.stripe_subscription_id:
            return Response({'error': 'No subscription found'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            stripe.Subscription.modify(
                company.stripe_subscription_id,
                cancel_at_period_end=False
            )
            company.subscription_active = True
            company.cancel_reason   = ''
            company.cancel_feedback = ''
            company.save(update_fields=['subscription_active', 'cancel_reason', 'cancel_feedback'])
            notify(
                company,
                'Subscription reactivated',
                'Your Certisave subscription has been reactivated. Welcome back!'
            )
            return Response({'status': 'ok'})
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class UpgradePlanView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import stripe

        company = request.user.company
        new_plan = request.data.get('plan')

        if new_plan not in VALID_PLANS:
            return Response({'error': 'Invalid plan'}, status=status.HTTP_400_BAD_REQUEST)

        if company.plan == new_plan:
            return Response({'error': 'Already on this plan'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            subscription = stripe.Subscription.retrieve(company.stripe_subscription_id)
            stripe.Subscription.modify(
                company.stripe_subscription_id,
                items=[{
                    'id': subscription['items']['data'][0]['id'],
                    'price': PRICE_IDS[new_plan],
                }],
                proration_behavior='always_invoice',
            )
            company.plan = new_plan
            company.save(update_fields=['plan'])
            return Response({'status': 'ok', 'plan': new_plan})
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ChargeCompanyView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        import stripe
        company = request.user.company
        amount = request.data.get('amount')
        description = request.data.get('description', 'Course booking')

        if not amount:
            return Response({'error': 'amount required'}, status=status.HTTP_400_BAD_REQUEST)

        if not company.stripe_customer_id or not company.stripe_payment_method_id:
            return Response({'error': 'No payment method on file'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            intent = stripe.PaymentIntent.create(
                amount=int(amount),
                currency='gbp',
                customer=company.stripe_customer_id,
                payment_method=company.stripe_payment_method_id,
                off_session=True,
                confirm=True,
                description=description,
                metadata={'company_id': company.id}
            )
            return Response({'status': 'ok', 'payment_intent_id': intent.id})
        except stripe.error.CardError as e:
            return Response({'error': e.user_message}, status=status.HTTP_402_PAYMENT_REQUIRED)
        except stripe.error.StripeError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class StripeWebhookView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        import stripe

        payload = request.body
        sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except ValueError:
            return Response(status=400)
        except stripe.error.SignatureVerificationError:
            return Response(status=400)

        event_type = event['type']
        obj = event['data']['object']

        if event_type == 'invoice.payment_failed':
            subscription_id = obj.get('subscription')
            if subscription_id:
                try:
                    company = Company.objects.get(stripe_subscription_id=subscription_id)
                    company.subscription_active = False
                    company.save(update_fields=['subscription_active'])
                    notify(
                        company,
                        'Payment failed',
                        'Your last payment failed. Please update your payment details to keep your account active.'
                    )
                except Company.DoesNotExist:
                    pass

        elif event_type == 'invoice.payment_succeeded':
            subscription_id = obj.get('subscription')
            if subscription_id:
                try:
                    company = Company.objects.get(stripe_subscription_id=subscription_id)
                    company.subscription_active = True
                    company.save(update_fields=['subscription_active'])
                except Company.DoesNotExist:
                    pass

        elif event_type == 'customer.subscription.deleted':
            subscription_id = obj.get('id')
            if subscription_id:
                try:
                    company = Company.objects.get(stripe_subscription_id=subscription_id)
                    company.subscription_active = False
                    company.save(update_fields=['subscription_active'])
                except Company.DoesNotExist:
                    pass

        elif event_type == 'customer.subscription.updated':
            subscription_id = obj.get('id')
            if subscription_id:
                try:
                    company = Company.objects.get(stripe_subscription_id=subscription_id)
                    if not obj.get('cancel_at_period_end', False):
                        company.subscription_active = True
                        company.save(update_fields=['subscription_active'])
                except Company.DoesNotExist:
                    pass

        return Response({'status': 'ok'})