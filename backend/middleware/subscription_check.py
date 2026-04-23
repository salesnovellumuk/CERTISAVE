from django.http import JsonResponse
from rest_framework.authtoken.models import Token

EXEMPT_PATHS = [
    '/api/login/',
    '/api/register/',
    '/api/logout/',
    '/api/me/',
    '/api/company/',
    '/api/payments/',
]

class SubscriptionCheck:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith('/api/'):
            exempt = any(request.path.startswith(p) for p in EXEMPT_PATHS)
            if not exempt:
                # Check cookie first, fall back to header
                token_key = request.COOKIES.get('auth_token')
                if not token_key:
                    auth = request.META.get('HTTP_AUTHORIZATION', '')
                    if auth.startswith('Token '):
                        token_key = auth.split(' ')[1]

                if token_key:
                    try:
                        token = Token.objects.select_related('user__company').get(key=token_key)
                        company = token.user.company
                        if company and not company.subscription_active:
                            return JsonResponse(
                                {'error': 'subscription_inactive'},
                                status=402
                            )
                    except Token.DoesNotExist:
                        pass

        return self.get_response(request)