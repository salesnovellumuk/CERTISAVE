# blog/serializers.py
from rest_framework import serializers
from .models import BlogPost, Category, Tag
from django.contrib.auth.models import User


class AuthorSerializer(serializers.ModelSerializer):
    """Serializer for blog post author"""
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name']


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for categories"""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 
            'name', 
            'slug', 
            'description',
            'meta_title',
            'meta_description',
            'post_count',
        ]
    
    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class TagSerializer(serializers.ModelSerializer):
    """Serializer for tags"""
    post_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Tag
        fields = ['id', 'name', 'slug', 'description', 'post_count']
    
    def get_post_count(self, obj):
        return obj.posts.filter(status='published').count()


class BlogPostSerializer(serializers.ModelSerializer):
    """Serializer for blog post list view"""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)  # Changed from SerializerMethodField
    featured_image_url = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'author',
            'category',
            'tags',
            'featured_image_url',
            'featured_image_alt',
            'date_published',
            'read_time',
            'views',
            'featured',
            'url'
        ]
    
    def get_featured_image_url(self, obj):
        """Return full URL for featured image"""
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None
    
    def get_url(self, obj):
        """Return full URL to blog post"""
        return obj.get_absolute_url()


class BlogPostDetailSerializer(serializers.ModelSerializer):
    """Serializer for blog post detail view with full SEO data"""
    author = AuthorSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    tags = TagSerializer(many=True, read_only=True)  # Changed from SerializerMethodField
    featured_image_url = serializers.SerializerMethodField()
    og_image_url = serializers.SerializerMethodField()
    url = serializers.SerializerMethodField()
    canonical_url_full = serializers.SerializerMethodField()
    
    class Meta:
        model = BlogPost
        fields = [
            'id',
            'title',
            'slug',
            'excerpt',
            'content',
            'author',
            'category',
            'tags',
            'featured_image_url',
            'featured_image_alt',
            'meta_title',
            'meta_description',
            'meta_keywords',
            'canonical_url',
            'canonical_url_full',
            'og_title',
            'og_description',
            'og_image_url',
            'schema_type',
            'date_published',
            'date_updated',
            'read_time',
            'views',
            'featured',
            'url'
        ]
    
    def get_featured_image_url(self, obj):
        """Return full URL for featured image"""
        if obj.featured_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.featured_image.url)
            return obj.featured_image.url
        return None
    
    def get_og_image_url(self, obj):
        """Return full URL for OG image"""
        og_image = obj.get_og_image()
        if og_image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(og_image.url)
            return og_image.url
        return None
    
    def get_url(self, obj):
        """Return full URL to blog post"""
        return obj.get_absolute_url()
    
    def get_canonical_url_full(self, obj):
        """Return canonical URL or build from request"""
        if obj.canonical_url:
            return obj.canonical_url
        request = self.context.get('request')
        if request:
            return request.build_absolute_uri(obj.get_absolute_url())
        return obj.get_absolute_url()