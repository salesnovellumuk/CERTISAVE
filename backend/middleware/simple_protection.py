# middleware/simple_protection.py
from django.core.cache import cache
from django.http import HttpResponse


class SimpleProtection:
    """Dead simple bot protection"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        ip = request.META.get('REMOTE_ADDR')
        
        # Block if more than 10 requests in 5 minutes
        key = f'ip:{ip}'
        count = cache.get(key, 0) + 1
        
        if count > 15:
            return HttpResponse('Blocked', status=403)
        
        cache.set(key, count, 300)  # 5 minutes
        
        # Block obvious bots
        ua = request.META.get('HTTP_USER_AGENT', '').lower()
        if 'bot' in ua or 'scan' in ua or 'curl' in ua:
            return HttpResponse('Blocked', status=403)
        
        return self.get_response(request)