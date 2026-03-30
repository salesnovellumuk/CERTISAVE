from django.contrib.sitemaps import Sitemap


class CertisaveSitemap(Sitemap):
    protocol = 'https'

    def items(self):
        return [
            ('home',        1.0, 'weekly'),
            ('about',       0.8, 'monthly'),
            ('how-it-works', 0.8, 'monthly'),
            ('pricing',     0.9, 'monthly'),
            ('faq',         0.7, 'monthly'),
            ('contact',     0.7, 'monthly'),
        ]

    def location(self, item):
        return f"/{item[0]}/" if item[0] != 'home' else '/'

    def priority(self, item):
        return item[1]

    def changefreq(self, item):
        return item[2]