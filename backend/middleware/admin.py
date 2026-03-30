from django.contrib import admin

# Register your models here.
# middleware/admin.py
from django.contrib import admin
from django.core.cache import cache
from django.contrib import messages

class RateLimitAdmin(admin.ModelAdmin):
    """
    Dummy admin for rate limit management in Django admin
    """
    def changelist_view(self, request, extra_context=None):
        # Add custom actions
        if 'clear_all' in request.POST:
            cache.clear()
            messages.success(request, 'All rate limits cleared')
        
        extra_context = extra_context or {}
        
        # Get stats if Redis is available
        if hasattr(cache, '_cache'):
            client = cache._cache.get_client()
            extra_context.update({
                'blocked_ips': len(client.keys('blocked:*')),
                'active_limits': len(client.keys('rate_limit:*')),
                'violations': len(client.keys('violations:*')),
            })
        
        return super().changelist_view(request, extra_context)

# You could register this with a proxy model if needed