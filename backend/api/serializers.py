from rest_framework import serializers
from accounts.models import Company, Employee, Cert, CertType, BookedCourse, Notification, ChangeRequest
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

User = get_user_model()


class CertTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CertType
        fields = ['id', 'name', 'renewal_period_days', 'first_application_days', 'renewable', 'renewal_window_days']


class CertSerializer(serializers.ModelSerializer):
    cert_type_name = serializers.CharField(source='cert_type.name', read_only=True)
    employee_name = serializers.CharField(source='employee.full_name', read_only=True)
    days_until_expiry = serializers.SerializerMethodField()
    is_expiring_soon = serializers.SerializerMethodField()
    is_expired = serializers.SerializerMethodField()
    expiry_date = serializers.DateField(read_only=True)
    status = serializers.CharField(read_only=True)

    class Meta:
        model = Cert
        fields = [
            'id',
            'employee',
            'cert_type',
            'cert_type_name',
            'employee_name',
            'issue_date',
            'expiry_date',
            'status',
            'is_first_application',
            'rebook_triggered',
            'rebook_triggered_at',
            'custom_cert_name',
            'certificate_number',
            'extras',
            'notes',
            'days_until_expiry',
            'is_expiring_soon',
            'is_expired',
        ]

    def get_days_until_expiry(self, obj):
        return obj.days_until_expiry

    def get_is_expiring_soon(self, obj):
        return obj.is_expiring_soon

    def get_is_expired(self, obj):
        return obj.is_expired


class EmployeeListSerializer(serializers.ModelSerializer):
    cert_count = serializers.SerializerMethodField()
    expiring_soon_count = serializers.SerializerMethodField()
    expired_count = serializers.SerializerMethodField()

    class Meta:
        model = Employee
        fields = [
            'id',
            'title',
            'first_name',
            'middle_name',
            'last_name',
            'full_name',
            'email',
            'phone',
            'ni_number',
            'date_of_birth',
            'address_line_1',
            'city',
            'postcode',
            'job_title',
            'citb_test_id',
            'cert_count',
            'expiring_soon_count',
            'expired_count',
        ]
        read_only_fields = ['full_name', 'cert_count', 'expiring_soon_count', 'expired_count']

    def get_cert_count(self, obj):
        return obj.certs.count()

    def get_expiring_soon_count(self, obj):
        return sum(1 for c in obj.certs.all() if c.is_expiring_soon)

    def get_expired_count(self, obj):
        return sum(1 for c in obj.certs.all() if c.is_expired)


class EmployeeDetailSerializer(serializers.ModelSerializer):
    certs = CertSerializer(many=True, read_only=True)
    legal_name = serializers.CharField(read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id',
            'title',
            'first_name',
            'middle_name',
            'last_name',
            'full_name',
            'legal_name',
            'email',
            'phone',
            'ni_number',
            'date_of_birth',
            'address_line_1',
            'address_line_2',
            'city',
            'postcode',
            'job_title',
            'employment_start_date',
            'emergency_contact_name',
            'emergency_contact_phone',
            'citb_test_id',
            'preferred_providers',
            'preferred_travel_distance',
            'driving_licence',
            'own_transport',
            'certs',
        ]
        read_only_fields = ['full_name', 'legal_name']


class CompanySerializer(serializers.ModelSerializer):
    total_employees = serializers.SerializerMethodField()
    total_certs = serializers.SerializerMethodField()
    expiring_soon = serializers.SerializerMethodField()
    expired = serializers.SerializerMethodField()
    employee_limit = serializers.IntegerField(read_only=True)
    at_employee_limit = serializers.BooleanField(read_only=True)

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'plan',
            'subscription_active',
            'employee_count',
            'employee_limit',
            'at_employee_limit',
            'total_employees',
            'total_certs',
            'expiring_soon',
            'expired',
        ]

    def get_total_employees(self, obj):
        return obj.employees.count()

    def get_total_certs(self, obj):
        return Cert.objects.filter(employee__company=obj).count()

    def get_expiring_soon(self, obj):
        certs = Cert.objects.filter(employee__company=obj)
        return sum(1 for c in certs if c.is_expiring_soon)

    def get_expired(self, obj):
        certs = Cert.objects.filter(employee__company=obj)
        return sum(1 for c in certs if c.is_expired)


class BookedCourseSerializer(serializers.ModelSerializer):
    employee_name = serializers.CharField(source='cert.employee.full_name', read_only=True)
    cert_type_name = serializers.CharField(source='cert.cert_type.name', read_only=True)
    employee_id = serializers.IntegerField(source='cert.employee.id', read_only=True)

    class Meta:
        model = BookedCourse
        fields = [
            'id',
            'cert',
            'employee_id',
            'employee_name',
            'cert_type_name',
            'course_date',
            'course_time',
            'provider',
            'location',
            'booking_reference',
            'additional_info',
            'cost',
            'notes',
            'created_at',
        ]
        read_only_fields = ['employee_name', 'cert_type_name', 'employee_id', 'created_at']


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'title', 'body', 'read', 'created_at']
        read_only_fields = ['created_at']


class ChangeRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChangeRequest
        fields = ['id', 'booking', 'preferred_date', 'preferred_time', 'notes', 'created_at', 'resolved']
        read_only_fields = ['created_at', 'resolved']


class RegisterSerializer(serializers.Serializer):
    first_name   = serializers.CharField(max_length=150)
    last_name    = serializers.CharField(max_length=150)
    email        = serializers.EmailField()
    password     = serializers.CharField(write_only=True, validators=[validate_password])
    company_name = serializers.CharField(max_length=255)
    plan         = serializers.ChoiceField(choices=['starter', 'growth'])

    def validate_email(self, value):
        value = value.lower()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("An account with this email already exists.")
        return value

    def create(self, validated_data):
        import stripe
        company = Company.objects.create(
            name=validated_data['company_name'],
            plan=validated_data['plan'],
        )
        user = User.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            company=company,
            is_staff=False,
            is_superuser=False,
        )
        stripe_customer = stripe.Customer.create(
            email=validated_data['email'],
            name=validated_data['company_name'],
            metadata={'company_id': company.id}
        )
        company.stripe_customer_id = stripe_customer.id
        company.save(update_fields=['stripe_customer_id'])
        return user