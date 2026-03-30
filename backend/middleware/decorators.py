# decorators.py - Rate limiting decorators and mixins
# Place in: yourapp/middleware/decorators.py

from functools import wraps
from django.core.cache import cache
from django.http import JsonResponse
from django.views import View

# Decorator for function-based views
def rate_limit(rate='10/minute', key=None):
    """
    Decorator for rate limiting specific views
    
    Usage:
        @rate_limit(rate='5/minute')
        def my_view(request):
            return HttpResponse("Hello")
    
    Args:
        rate: String in format 'requests/period' (e.g., '5/minute', '100/hour')
        key: Optional custom key for tracking (defaults to IP:path)
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            # Get client identifier
            x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
            if x_forwarded_for:
                ip = x_forwarded_for.split(',')[0].strip()
            else:
                ip = request.META.get('REMOTE_ADDR')
            
            client_id = key or f"{ip}:{request.path}"
            
            # Parse rate
            limit, period = rate.split('/')
            limit = int(limit)
            period_seconds = {
                'second': 1, 
                'minute': 60, 
                'hour': 3600, 
                'day': 86400
            }.get(period, 60)
            
            # Check rate limit
            cache_key = f"view_rate_limit:{client_id}"
            request_count = cache.get(cache_key, 0)
            
            if request_count >= limit:
                return JsonResponse({
                    'error': 'Rate limit exceeded for this endpoint',
                    'retry_after': period_seconds
                }, status=429)
            
            # Increment and continue
            cache.set(cache_key, request_count + 1, period_seconds)
            return view_func(request, *args, **kwargs)
        
        return wrapped_view
    return decorator


# Class-based view mixin
class RateLimitMixin:
    """
    Mixin for class-based views to add rate limiting
    
    Usage:
        class MyView(RateLimitMixin, View):
            rate_limit = '10/minute'
            
            def get(self, request):
                return HttpResponse("Hello")
    """
    rate_limit = '10/minute'
    
    def dispatch(self, request, *args, **kwargs):
        # Get client identifier
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        client_id = f"{ip}:{request.path}"
        
        # Parse rate
        limit, period = self.rate_limit.split('/')
        limit = int(limit)
        period_seconds = {
            'second': 1, 
            'minute': 60, 
            'hour': 3600, 
            'day': 86400
        }.get(period, 60)
        
        # Check rate limit
        cache_key = f"cbv_rate_limit:{client_id}"
        request_count = cache.get(cache_key, 0)
        
        if request_count >= limit:
            return JsonResponse({
                'error': 'Rate limit exceeded',
                'retry_after': period_seconds
            }, status=429)
        
        # Increment and continue
        cache.set(cache_key, request_count + 1, period_seconds)
        return super().dispatch(request, *args, **kwargs)


# Advanced decorator with user-based limiting
def user_rate_limit(rate='10/minute', anonymous_rate='5/minute'):
    """
    Rate limit with different limits for authenticated vs anonymous users
    
    Usage:
        @user_rate_limit(rate='20/minute', anonymous_rate='5/minute')
        def my_view(request):
            return HttpResponse("Hello")
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapped_view(request, *args, **kwargs):
            # Determine rate based on authentication
            if request.user.is_authenticated:
                actual_rate = rate
                client_id = f"user_{request.user.id}:{request.path}"
            else:
                actual_rate = anonymous_rate
                # Get IP for anonymous users
                x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
                if x_forwarded_for:
                    ip = x_forwarded_for.split(',')[0].strip()
                else:
                    ip = request.META.get('REMOTE_ADDR')
                client_id = f"anon_{ip}:{request.path}"
            
            # Parse rate
            limit, period = actual_rate.split('/')
            limit = int(limit)
            period_seconds = {
                'second': 1, 
                'minute': 60, 
                'hour': 3600, 
                'day': 86400
            }.get(period, 60)
            
            # Check rate limit
            cache_key = f"user_rate_limit:{client_id}"
            request_count = cache.get(cache_key, 0)
            
            if request_count >= limit:
                return JsonResponse({
                    'error': 'Rate limit exceeded',
                    'retry_after': period_seconds,
                    'authenticated': request.user.is_authenticated
                }, status=429)
            
            # Increment and continue
            cache.set(cache_key, request_count + 1, period_seconds)
            return view_func(request, *args, **kwargs)
        
        return wrapped_view
    return decorator


# Method-specific rate limiting for class-based views
class MethodRateLimitMixin:
    """
    Different rate limits for different HTTP methods
    
    Usage:
        class MyAPIView(MethodRateLimitMixin, View):
            method_rate_limits = {
                'GET': '100/hour',
                'POST': '10/hour',
                'DELETE': '5/hour'
            }
    """
    method_rate_limits = {
        'GET': '100/hour',
        'POST': '20/hour',
        'PUT': '20/hour',
        'DELETE': '10/hour'
    }
    
    def dispatch(self, request, *args, **kwargs):
        # Get rate limit for method
        rate_limit = self.method_rate_limits.get(
            request.method, 
            '10/hour'  # Default fallback
        )
        
        # Get client identifier
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        client_id = f"{ip}:{request.method}:{request.path}"
        
        # Parse rate
        limit, period = rate_limit.split('/')
        limit = int(limit)
        period_seconds = {
            'second': 1, 
            'minute': 60, 
            'hour': 3600, 
            'day': 86400
        }.get(period, 60)
        
        # Check rate limit
        cache_key = f"method_rate_limit:{client_id}"
        request_count = cache.get(cache_key, 0)
        
        if request_count >= limit:
            return JsonResponse({
                'error': f'Rate limit exceeded for {request.method} requests',
                'retry_after': period_seconds
            }, status=429)
        
        # Increment and continue
        cache.set(cache_key, request_count + 1, period_seconds)
        return super().dispatch(request, *args, **kwargs)