# middleware/utils.py
from django.core.cache import cache
from django.conf import settings

def get_client_ip(request):
    """Extract client IP from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0].strip()
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def is_ip_whitelisted(ip):
    """Check if IP is in whitelist"""
    whitelist = getattr(settings, 'RATE_LIMITER_CONFIG', {}).get('WHITELIST_IPS', [])
    return ip in whitelist

def is_ip_blacklisted(ip):
    """Check if IP is in blacklist"""
    blacklist = getattr(settings, 'RATE_LIMITER_CONFIG', {}).get('BLACKLIST_IPS', [])
    return ip in blacklist

def block_ip(ip, duration=3600, reason="Manual block"):
    """Manually block an IP"""
    cache.set(f"blocked:{ip}", True, duration)
    cache.set(f"block_reason:{ip}", reason, duration)
    return True

def unblock_ip(ip):
    """Manually unblock an IP"""
    cache.delete(f"blocked:{ip}")
    cache.delete(f"block_reason:{ip}")
    cache.delete(f"violations:{ip}")
    cache.delete(f"failed_login:{ip}")
    return True

def get_blocked_ips():
    """Get list of currently blocked IPs"""
    blocked_ips = []
    if hasattr(cache, '_cache'):
        client = cache._cache.get_client()
        keys = client.keys('blocked:*')
        for key in keys:
            ip = key.decode('utf-8').replace('blocked:', '')
            ttl = client.ttl(key)
            reason = cache.get(f"block_reason:{ip}", "Rate limit violation")
            blocked_ips.append({
                'ip': ip,
                'ttl': ttl,
                'reason': reason
            })
    return blocked_ips