from django.contrib.sitemaps import Sitemap
from .models import BlogPost

class StaticPagesSitemap(Sitemap):
    protocol = 'https'
    
    def items(self):
        return [
            ('home', 1.0, 'weekly'),
            ('services', 0.9, 'weekly'),
            ('portfolio', 0.8, 'weekly'),
            ('blog', 0.9, 'daily'),
            ('contact', 0.7, 'monthly'),
        ]
    
    def location(self, item):
        page_name = item[0]
        return '/' if page_name == 'home' else f"/{page_name}"
    
    def priority(self, item):
        return item[1]
    
    def changefreq(self, item):
        return item[2]


class BlogPostSitemap(Sitemap):
    protocol = 'https'
    changefreq = 'weekly'
    priority = 0.8
    
    def items(self):
        return BlogPost.objects.filter(status='published').order_by('-published_date')
    
    def lastmod(self, obj):
        return obj.updated_at
    
    def location(self, obj):
        return f"/blog/{obj.slug}"