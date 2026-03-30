# blog/views.py
from django.shortcuts import render
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.utils import timezone
from django.db.models import Q
from .models import BlogPost, Category, Tag
from .serializers import BlogPostSerializer, BlogPostDetailSerializer, CategorySerializer, TagSerializer


class BlogPagination(PageNumberPagination):
    """Custom pagination for blog posts"""
    page_size = 9
    page_size_query_param = 'page_size'
    max_page_size = 50


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for blog categories
    GET /api/blog/categories/ - List all categories
    GET /api/blog/categories/{slug}/ - Get category details
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    lookup_field = 'slug'


class TagViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for blog tags
    GET /api/blog/tags/ - List all tags
    GET /api/blog/tags/{slug}/ - Get tag details
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    lookup_field = 'slug'


class BlogPostViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for blog posts with filtering, search, and pagination
    
    GET /api/blog/posts/ - List all published posts
    GET /api/blog/posts/{slug}/ - Get single post detail
    GET /api/blog/posts/featured/ - Get featured posts
    GET /api/blog/posts/?category=solar-renewable - Filter by category slug
    GET /api/blog/posts/?tag=solar-pv - Filter by tag slug
    GET /api/blog/posts/?search=solar - Search posts
    """
    queryset = BlogPost.objects.filter(
        status='published',
        date_published__lte=timezone.now()
    ).select_related('author', 'category').prefetch_related('tags')
    
    serializer_class = BlogPostSerializer
    lookup_field = 'slug'
    pagination_class = BlogPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'excerpt', 'content']
    ordering_fields = ['date_published', 'views', 'read_time']
    ordering = ['-date_published']
    
    def get_serializer_class(self):
        """Use detailed serializer for single post view"""
        if self.action == 'retrieve':
            return BlogPostDetailSerializer
        return BlogPostSerializer
    
    def get_queryset(self):
        """
        Filter queryset based on query parameters
        """
        queryset = super().get_queryset()
        
        # Filter by category slug
        category_slug = self.request.query_params.get('category', None)
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Filter by tag slug
        tag_slug = self.request.query_params.get('tag', None)
        if tag_slug:
            queryset = queryset.filter(tags__slug=tag_slug)
        
        # Filter featured posts
        featured = self.request.query_params.get('featured', None)
        if featured and featured.lower() == 'true':
            queryset = queryset.filter(featured=True)
        
        return queryset.distinct()
    
    def retrieve(self, request, *args, **kwargs):
        """
        Override retrieve to increment view count
        """
        instance = self.get_object()
        instance.increment_views()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured blog posts
        GET /api/blog/posts/featured/
        """
        featured_posts = self.get_queryset().filter(featured=True)[:6]
        serializer = self.get_serializer(featured_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """
        Get most recent blog posts
        GET /api/blog/posts/recent/?limit=5
        """
        limit = int(request.query_params.get('limit', 5))
        recent_posts = self.get_queryset()[:limit]
        serializer = self.get_serializer(recent_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get most viewed blog posts
        GET /api/blog/posts/popular/?limit=5
        """
        limit = int(request.query_params.get('limit', 5))
        popular_posts = self.get_queryset().order_by('-views')[:limit]
        serializer = self.get_serializer(popular_posts, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """
        Get related posts based on category and tags
        GET /api/blog/posts/{slug}/related/
        """
        post = self.get_object()
        
        # Get posts from same category or with overlapping tags
        related_posts = BlogPost.objects.filter(
            status='published',
            date_published__lte=timezone.now()
        ).exclude(
            id=post.id
        )
        
        # Filter by same category or shared tags
        if post.category:
            related_posts = related_posts.filter(
                Q(category=post.category) | Q(tags__in=post.tags.all())
            )
        else:
            related_posts = related_posts.filter(tags__in=post.tags.all())
        
        related_posts = related_posts.distinct()[:4]
        
        serializer = self.get_serializer(related_posts, many=True)
        return Response(serializer.data)