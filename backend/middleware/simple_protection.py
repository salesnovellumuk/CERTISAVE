import logging
from django.core.cache import cache
from django.http import HttpResponse

logger = logging.getLogger(__name__)


class SimpleProtection:
    """Dead simple bot protection"""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if (
            request.path.startswith('/dashboard/control-panel') or
            request.path.startswith('/static') or
            request.path.startswith('/favicon') or
            request.META.get('REMOTE_ADDR') in ('127.0.0.1', '::1')
        ):
            return self.get_response(request)

        ip = request.META.get('REMOTE_ADDR')
        key = f'ip:{ip}'
        count = cache.get(key, 0) + 1

        if count > 300:
            logger.warning(f'Rate limit exceeded — IP: {ip}, path: {request.path}, count: {count}')
            return HttpResponse('Blocked', status=403)

        cache.set(key, count, 60)  # 300 requests per minute

        ua = request.META.get('HTTP_USER_AGENT', '').lower()
        if ('bot' in ua or 'scan' in ua or 'curl' in ua) and 'linkedinbot' not in ua:
            logger.warning(f'Blocked suspicious user agent — IP: {ip}, UA: {ua}, path: {request.path}')
            return HttpResponse('Blocked', status=403)

        return self.get_response(request)