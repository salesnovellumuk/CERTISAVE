// src/utils/api.js

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Generic fetch wrapper with error handling
const apiFetch = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
};

// Blog Posts API
export const blogApi = {
  // Get all posts with optional filters
  getPosts: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiFetch(`/blog/posts/${queryString ? `?${queryString}` : ''}`);
  },

  // Get single post by slug
  getPost: (slug) => apiFetch(`/blog/posts/${slug}/`),

  // Get featured posts
  getFeaturedPosts: () => apiFetch('/blog/posts/featured/'),

  // Get recent posts
  getRecentPosts: (limit = 5) => apiFetch(`/blog/posts/recent/?limit=${limit}`),

  // Get popular posts
  getPopularPosts: (limit = 5) => apiFetch(`/blog/posts/popular/?limit=${limit}`),

  // Get related posts for a specific post
  getRelatedPosts: (slug) => apiFetch(`/blog/posts/${slug}/related/`),

  // Search posts
  searchPosts: (query, page = 1) => {
    return apiFetch(`/blog/posts/?search=${encodeURIComponent(query)}&page=${page}`);
  },

  // Filter by category
  getPostsByCategory: (categorySlug, page = 1) => {
    return apiFetch(`/blog/posts/?category=${categorySlug}&page=${page}`);
  },

  // Filter by tag
  getPostsByTag: (tagSlug, page = 1) => {
    return apiFetch(`/blog/posts/?tag=${tagSlug}&page=${page}`);
  },
};

// Categories API
export const categoryApi = {
  // Get all categories
  getCategories: () => apiFetch('/blog/categories/'),

  // Get single category by slug
  getCategory: (slug) => apiFetch(`/blog/categories/${slug}/`),
};

// Tags API
export const tagApi = {
  // Get all tags
  getTags: () => apiFetch('/blog/tags/'),

  // Get single tag by slug
  getTag: (slug) => apiFetch(`/blog/tags/${slug}/`),
};

export default {
  blog: blogApi,
  categories: categoryApi,
  tags: tagApi,
};