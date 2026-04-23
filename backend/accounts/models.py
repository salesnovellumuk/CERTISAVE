from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta


class Company(models.Model):
    PLAN_CHOICES = [
        ('starter', 'Starter'),
        ('growth', 'Growth'),
    ]

    PLAN_LIMITS = {
        'starter': 15,
        'growth': 50,
    }

    name = models.CharField(max_length=255)
    employee_count = models.PositiveIntegerField(default=0)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    stripe_payment_method_id = models.CharField(max_length=255, blank=True)
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    plan = models.CharField(max_length=20, choices=PLAN_CHOICES, blank=True)
    subscription_active = models.BooleanField(default=True)
    preferred_providers = models.TextField(blank=True)
    billing_address = models.CharField(max_length=255, blank=True)
    purchase_order_required = models.BooleanField(default=False)
    purchase_order_number = models.CharField(max_length=100, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    cancel_reason   = models.CharField(max_length=100, blank=True)
    cancel_feedback = models.TextField(blank=True)
    

    class Meta:
        verbose_name_plural = 'companies'

    def __str__(self):
        return self.name

    @property
    def employee_limit(self):
        return self.PLAN_LIMITS.get(self.plan, 15)

    @property
    def at_employee_limit(self):
        return self.employees.count() >= self.employee_limit


class User(AbstractUser):
    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='users'
    )

    def __str__(self):
        return self.email


class CertType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    renewal_period_days = models.PositiveIntegerField(
        help_text='Validity in days for renewal or standard application'
    )
    first_application_days = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text='Validity in days for first ever application if different from renewal (e.g. CSCS Green Card)'
    )
    renewable = models.BooleanField(
        default=True,
        help_text='Can this cert be renewed or does it require a new application?'
    )
    renewal_window_days = models.PositiveIntegerField(
        default=180,
        help_text='How many days before expiry the renewal window opens'
    )
    booking_instructions = models.TextField(
        blank=True,
        help_text='Internal notes on how to book this cert type — provider, cost, what info is needed etc.'
    )
    required_fields = models.JSONField(
        default=list,
        blank=True,
        help_text='List of extra fields required to book this cert e.g. ["card_number", "occupation", "card_type"]'
    )

    def __str__(self):
        return self.name


class Employee(models.Model):
    TITLE_CHOICES = [
        ('Mr', 'Mr'),
        ('Mrs', 'Mrs'),
        ('Ms', 'Ms'),
        ('Miss', 'Miss'),
        ('Dr', 'Dr'),
        ('Prof', 'Prof'),
    ]

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name='employees'
    )
    title = models.CharField(max_length=10, choices=TITLE_CHOICES, blank=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    ni_number = models.CharField(max_length=20, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address_line_1 = models.CharField(max_length=255, blank=True)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    postcode = models.CharField(max_length=10, blank=True)

    # Employment
    job_title = models.CharField(max_length=100, blank=True)
    employment_start_date = models.DateField(null=True, blank=True)

    # Emergency contact
    emergency_contact_name = models.CharField(max_length=100, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, blank=True)

    # Training profile
    citb_test_id = models.CharField(max_length=50, blank=True, help_text='CITB HS&E test ID, required for CSCS renewals')
    preferred_providers = models.TextField(blank=True, help_text='Any preferred training providers')
    preferred_travel_distance = models.PositiveIntegerField(null=True, blank=True, help_text='Max travel distance in miles for training')
    driving_licence = models.BooleanField(default=False)
    own_transport = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        parts = [self.title, self.first_name, self.middle_name, self.last_name]
        return ' '.join(p for p in parts if p).strip()

    @property
    def legal_name(self):
        parts = [self.first_name, self.middle_name, self.last_name]
        return ' '.join(p for p in parts if p).strip()


class Cert(models.Model):
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name='certs'
    )
    cert_type = models.ForeignKey(
        CertType,
        on_delete=models.PROTECT,
        related_name='certs'
    )
    issue_date = models.DateField()
    certificate_number = models.CharField(max_length=100, blank=True, help_text='Card or cert ref number once issued')
    is_first_application = models.BooleanField(
        default=False,
        help_text='Is this the employee\'s first ever application for this cert? Affects validity period.'
    )
    rebook_triggered = models.BooleanField(default=False)
    rebook_triggered_at = models.DateTimeField(null=True, blank=True)
    custom_cert_name = models.CharField(
        max_length=255,
        blank=True,
        help_text='For cert types not in the standard list'
    )
    extras = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional cert-specific fields e.g. categories, logbook, preferred location'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['employee', 'cert_type'],
                name='unique_employee_cert_type'
            )
        ]
        ordering = ['issue_date']

    def __str__(self):
        return f"{self.employee.full_name} - {self.cert_type.name} (issued {self.issue_date})"

    @property
    def expiry_date(self):
        if self.is_first_application and self.cert_type.first_application_days:
            return self.issue_date + timedelta(days=self.cert_type.first_application_days)
        return self.issue_date + timedelta(days=self.cert_type.renewal_period_days)

    @property
    def days_until_expiry(self):
        return (self.expiry_date - timezone.now().date()).days

    @property
    def in_renewal_window(self):
        days = self.days_until_expiry
        return -self.cert_type.renewal_window_days <= days <= self.cert_type.renewal_window_days

    @property
    def is_lapsed(self):
        return self.days_until_expiry < -self.cert_type.renewal_window_days

    @property
    def status(self):
        if self.rebook_triggered:
            return 'rebooked'
        days = self.days_until_expiry
        window = self.cert_type.renewal_window_days
        if days < -window:
            return 'lapsed'
        if days < 0:
            return 'expired'
        if days <= window:
            return 'renewal_due'
        return 'active'

    @property
    def is_expired(self):
        return self.days_until_expiry < 0

    @property
    def is_expiring_soon(self):
        days = self.days_until_expiry
        return 0 <= days <= self.cert_type.renewal_window_days

    @classmethod
    def trigger_rebook(cls, cert_id):
        from django.db import transaction
        with transaction.atomic():
            cert = cls.objects.select_for_update().get(id=cert_id)
            if cert.rebook_triggered:
                return False
            cert.rebook_triggered = True
            cert.rebook_triggered_at = timezone.now()
            cert.save(update_fields=['rebook_triggered', 'rebook_triggered_at'])
            return True


class BookedCourse(models.Model):
    cert = models.ForeignKey(
        Cert,
        on_delete=models.CASCADE,
        related_name='booked_courses'
    )
    course_date = models.DateField()
    course_time = models.TimeField(null=True, blank=True)
    provider = models.CharField(max_length=255, blank=True)
    location = models.CharField(max_length=255, blank=True)
    booking_reference = models.CharField(max_length=100, blank=True)
    additional_info = models.TextField(blank=True, help_text='Parking, what to bring, instructions etc.')
    cost = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.cert} - booked {self.course_date}"


class Notification(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    body = models.TextField(blank=True)
    read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    @classmethod
    def purge_old(cls):
        cutoff = timezone.now() - timedelta(days=90)
        cls.objects.filter(created_at__lt=cutoff).delete()


class ChangeRequest(models.Model):
    booking = models.ForeignKey(
        BookedCourse,
        on_delete=models.CASCADE,
        related_name='change_requests'
    )
    preferred_date = models.DateField()
    preferred_time = models.TimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved = models.BooleanField(default=False)

    def __str__(self):
        return f"Change request for {self.booking} — {self.preferred_date}"