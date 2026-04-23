from django.db import migrations

CERT_TYPES = [
    ("IPAF (PAL Card)", 1825),
    ("CSCS Card", 1825),
    ("CSCS Labourer Card", 730),
    ("First Aid at Work", 1095),
    ("Emergency First Aid at Work", 1095),
    ("PASMA", 1825),
    ("SMSTS", 1825),
    ("SSSTS", 1825),
    ("Asbestos Awareness", 365),
    ("Manual Handling", 1095),
    ("Working at Height", 1095),
    ("NPORS", 1825),
    ("Street Works (NRSWA)", 1825),
    ("Gas Safe", 365),
    ("OFTEC", 365),
    ("Confined Space", 1095),
]


def add_cert_types(apps, schema_editor):
    CertType = apps.get_model('accounts', 'CertType')
    for name, days in CERT_TYPES:
        CertType.objects.get_or_create(
            name=name,
            defaults={'renewal_period_days': days}
        )


def remove_cert_types(apps, schema_editor):
    CertType = apps.get_model('accounts', 'CertType')
    CertType.objects.filter(name__in=[ct[0] for ct in CERT_TYPES]).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(add_cert_types, remove_cert_types),
    ]