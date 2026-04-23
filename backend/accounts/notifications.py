from .models import Notification

def notify(company, title, body=''):
    Notification.objects.create(company=company, title=title, body=body)