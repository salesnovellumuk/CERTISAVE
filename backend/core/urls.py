from django.contrib import admin
from django.urls import path, include, re_path
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.contrib.sitemaps.views import sitemap
from core.sitemaps import CertisaveSitemap

# Change the default admin URL
admin.site.site_url = '/dashboard/'

# Sitemaps configuration
sitemaps = {
    'static': CertisaveSitemap,
}

urlpatterns = [
    # Changed from 'admin/' to a more secure, non-obvious path
    path('dashboard/control-panel/', admin.site.urls),

    # Sitemap (MUST come before catch-all routes)
    path('sitemap.xml', sitemap, {'sitemaps': sitemaps}, name='sitemap'),

    path('api/', include('api.urls')),  # Your API URLs

    # Explicit route for robots.txt
    path('robots.txt', serve, {
        'document_root': settings.STATIC_ROOT,
        'path': 'robots.txt'
    }),

    # Assets serving
    re_path(r'^assets/(?P<path>.*)$', serve, {'document_root': settings.VITE_APP_DIR / 'assets'}),

    # Catch-all route for React app (LAST)
    re_path(r'^.*$', TemplateView.as_view(template_name='index.html')),
]

# For development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)