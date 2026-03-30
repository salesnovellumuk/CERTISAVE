# blog/models.py
from django.db import models
from django.utils.text import slugify
from django.urls import reverse
from django.contrib.auth.models import User
from django.utils import timezone


class Category(models.Model):
    """Blog post categories"""
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True, blank=True)
    description = models.TextField(blank=True, help_text="Category description for SEO")
    meta_title = models.CharField(max_length=60, blank=True, help_text="SEO title (60 chars max)")
    meta_description = models.CharField(max_length=160, blank=True, help_text="SEO meta description (160 chars max)")
    
    class Meta:
        verbose_name_plural = "Categories"
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return f'/blog/category/{self.slug}'


class Tag(models.Model):
    """Blog post tags - fully dynamic"""
    name = models.CharField(max_length=100, unique=True, help_text="Tag display name")
    slug = models.SlugField(max_length=100, unique=True, blank=True, help_text="URL-friendly slug")
    description = models.TextField(blank=True, help_text="Tag description")
    
    class Meta:
        ordering = ['name']
    
    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.name
    
    def get_absolute_url(self):
        return f'/blog/tag/{self.slug}'


class BlogPost(models.Model):
    """Main blog post model with full SEO capabilities"""
    
    # Basic Info
    title = models.CharField(max_length=200, help_text="Post title (appears in H1)")
    slug = models.SlugField(max_length=200, unique=True, blank=True, help_text="URL-friendly version of title")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='blog_posts')
    
    # Content
    excerpt = models.TextField(max_length=300, help_text="Short description (300 chars max) - used in previews and meta description")
    content = models.TextField(help_text="Full blog post content (supports HTML)")
    
    # Categorization
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='posts')
    tags = models.ManyToManyField(Tag, blank=True, related_name='posts', help_text="Select multiple tags")
    
    # Media
    featured_image = models.ImageField(
        upload_to='blog/images/%Y/%m/', 
        blank=True, 
        null=True, 
        help_text="Main post image (1200x630px recommended for social sharing)"
    )
    featured_image_alt = models.CharField(max_length=200, blank=True, help_text="Alt text for featured image (important for SEO & accessibility)")
    
    # SEO Fields
    meta_title = models.CharField(max_length=60, blank=True, help_text="SEO title (60 chars max). Leave blank to use post title.")
    meta_description = models.CharField(max_length=160, blank=True, help_text="SEO meta description (160 chars max). Leave blank to use excerpt.")
    meta_keywords = models.CharField(max_length=255, blank=True, help_text="Comma-separated keywords (optional, less important nowadays)")
    canonical_url = models.URLField(blank=True, help_text="Canonical URL (leave blank to use default)")
    
    # Open Graph / Social Media
    og_title = models.CharField(max_length=100, blank=True, help_text="Open Graph title for social sharing (leave blank to use post title)")
    og_description = models.CharField(max_length=200, blank=True, help_text="Open Graph description (leave blank to use excerpt)")
    og_image = models.ImageField(
        upload_to='blog/og_images/', 
        blank=True, 
        null=True, 
        help_text="Custom Open Graph image (1200x630px)"
    )
    
    # Publishing
    status = models.CharField(max_length=10, choices=[
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('archived', 'Archived')
    ], default='draft')
    featured = models.BooleanField(default=False, help_text="Show this post in featured section")
    date_created = models.DateTimeField(auto_now_add=True)
    date_updated = models.DateTimeField(auto_now=True)
    date_published = models.DateTimeField(null=True, blank=True, help_text="Schedule publication date")
    
    # Analytics
    read_time = models.IntegerField(default=5, help_text="Estimated read time in minutes")
    views = models.IntegerField(default=0, help_text="Number of views")
    
    # Schema.org structured data
    schema_type = models.CharField(max_length=50, default='Article', choices=[
        ('Article', 'Article'),
        ('BlogPosting', 'Blog Posting'),
        ('NewsArticle', 'News Article'),
        ('TechArticle', 'Tech Article')
    ])
    
    class Meta:
        ordering = ['-date_published', '-date_created']
        indexes = [
            models.Index(fields=['-date_published']),
            models.Index(fields=['slug']),
            models.Index(fields=['status']),
        ]
    
    def save(self, *args, **kwargs):
        # Auto-generate slug from title if not provided
        if not self.slug:
            self.slug = slugify(self.title)
        
        # Auto-calculate read time based on content (avg 200 words per minute)
        if self.content:
            word_count = len(self.content.split())
            self.read_time = max(1, round(word_count / 200))
        
        # Auto-set publication date when status changes to published
        if self.status == 'published' and not self.date_published:
            self.date_published = timezone.now()
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.title
    
    def get_absolute_url(self):
        return f'/blog/{self.slug}'
    
    def get_meta_title(self):
        """Return meta title or fall back to post title"""
        return self.meta_title or self.title
    
    def get_meta_description(self):
        """Return meta description or fall back to excerpt"""
        return self.meta_description or self.excerpt
    
    def get_og_title(self):
        """Return OG title or fall back to post title"""
        return self.og_title or self.title
    
    def get_og_description(self):
        """Return OG description or fall back to excerpt"""
        return self.og_description or self.excerpt
    
    def get_og_image(self):
        """Return OG image or fall back to featured image"""
        return self.og_image or self.featured_image
    
    def increment_views(self):
        """Increment view count"""
        self.views += 1
        self.save(update_fields=['views'])
    
    @property
    def is_published(self):
        """Check if post is published and date is not in future"""
        if self.status != 'published':
            return False
        if self.date_published and self.date_published > timezone.now():
            return False
        return True