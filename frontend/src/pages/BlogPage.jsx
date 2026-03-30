// src/pages/BlogPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { blogApi, categoryApi, tagApi } from '../utils/api';
import './styles/blogpage.css';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          ...(selectedCategory && { category: selectedCategory }),
          ...(selectedTag && { tag: selectedTag }),
          ...(searchQuery && { search: searchQuery }),
        };
        const data = await blogApi.getPosts(params);
        setPosts(data.results || data);
        setPagination({
          count: data.count,
          next: data.next,
          previous: data.previous,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [currentPage, selectedCategory, selectedTag, searchQuery]);

  // Fetch categories and tags on mount
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          categoryApi.getCategories(),
          tagApi.getTags(),
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (err) {
        console.error('Error fetching filters:', err);
      }
    };

    fetchFilters();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleCategoryChange = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setSelectedTag('');
    setCurrentPage(1);
  };

  const handleTagChange = (tagSlug) => {
    setSelectedTag(tagSlug);
    setSelectedCategory('');
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedTag('');
    setSearchQuery('');
    setCurrentPage(1);
  };

  return (
    <div className="blog-page">
      {/* Hero Section */}
      <section className="blog-hero">
        <div className="blog-hero-content">
          <h1 className="blog-hero-title">Blog</h1>
          <p className="blog-hero-description">
            Insights, tips, and guides for modern web development and digital marketing
          </p>
        </div>
      </section>

      <div className="blog-container">
        {/* Sidebar Filters */}
        <aside className="blog-sidebar">
          {/* Search */}
          <div className="filter-section">
            <h3 className="filter-title">Search</h3>
            <form onSubmit={handleSearch} className="search-form">
              <input
                type="text"
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-button">
                Search
              </button>
            </form>
          </div>

          {/* Categories */}
          <div className="filter-section">
            <h3 className="filter-title">Categories</h3>
            <div className="filter-list">
              <button
                className={`filter-item ${!selectedCategory ? 'active' : ''}`}
                onClick={() => setSelectedCategory('')}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`filter-item ${selectedCategory === category.slug ? 'active' : ''}`}
                  onClick={() => handleCategoryChange(category.slug)}
                >
                  {category.name}
                  <span className="filter-count">({category.post_count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tags */}
          <div className="filter-section">
            <h3 className="filter-title">Tags</h3>
            <div className="tag-list">
              {tags.map((tag) => (
                <button
                  key={tag.id}
                  className={`tag-item ${selectedTag === tag.slug ? 'active' : ''}`}
                  onClick={() => handleTagChange(tag.slug)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {(selectedCategory || selectedTag || searchQuery) && (
            <button onClick={clearFilters} className="clear-filters">
              Clear All Filters
            </button>
          )}
        </aside>

        {/* Main Content */}
        <main className="blog-main">
          {/* Active Filters Display */}
          {(selectedCategory || selectedTag || searchQuery) && (
            <div className="active-filters">
              <span className="active-filters-label">Filtering by:</span>
              {searchQuery && (
                <span className="active-filter-tag">
                  Search: "{searchQuery}"
                </span>
              )}
              {selectedCategory && (
                <span className="active-filter-tag">
                  Category: {categories.find(c => c.slug === selectedCategory)?.name}
                </span>
              )}
              {selectedTag && (
                <span className="active-filter-tag">
                  Tag: {tags.find(t => t.slug === selectedTag)?.name}
                </span>
              )}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="blog-loading">
              <div className="loading-spinner"></div>
              <p>Loading posts...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="blog-error">
              <p>Error loading posts: {error}</p>
            </div>
          )}

          {/* Posts Grid - Inline Preview Cards */}
          {!loading && !error && posts.length > 0 && (
            <>
              <div className="blog-grid">
                {posts.map((post) => (
                  <article key={post.id} className="blog-preview">
                    {/* Featured Image */}
                    {post.featured_image_url && (
                      <Link to={`/blog/${post.slug}`} className="preview-image-link">
                        <img
                          src={post.featured_image_url}
                          alt={post.featured_image_alt || post.title}
                          className="preview-image"
                        />
                      </Link>
                    )}

                    <div className="preview-content">
                      {/* Category Badge */}
                      {post.category && (
                        <Link 
                          to={`/blog?category=${post.category.slug}`}
                          className="preview-category"
                        >
                          {post.category.name}
                        </Link>
                      )}

                      {/* Title */}
                      <Link to={`/blog/${post.slug}`} className="preview-title-link">
                        <h2 className="preview-title">{post.title}</h2>
                      </Link>

                      {/* Excerpt */}
                      <p className="preview-excerpt">{post.excerpt}</p>

                      {/* Meta Info */}
                      <div className="preview-meta">
                        <div className="preview-meta-item">
                          <span className="preview-author">
                            By {post.author.first_name || post.author.username}
                          </span>
                        </div>
                        <div className="preview-meta-item">
                          <span className="preview-date">
                            {formatDate(post.date_published)}
                          </span>
                        </div>
                        <div className="preview-meta-item">
                          <span className="preview-read-time">
                            {post.read_time} min read
                          </span>
                        </div>
                      </div>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="preview-tags">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Link
                              key={tag.id}
                              to={`/blog?tag=${tag.slug}`}
                              className="preview-tag"
                            >
                              {tag.name}
                            </Link>
                          ))}
                        </div>
                      )}

                      {/* Read More Link */}
                      <Link to={`/blog/${post.slug}`} className="preview-read-more">
                        Read More →
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {pagination && pagination.count > 9 && (
                <div className="blog-pagination">
                  <button
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    disabled={!pagination.previous}
                    className="pagination-button"
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {Math.ceil(pagination.count / 9)}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    disabled={!pagination.next}
                    className="pagination-button"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}

          {/* No Results */}
          {!loading && !error && posts.length === 0 && (
            <div className="blog-no-results">
              <h3>No posts found</h3>
              <p>Try adjusting your filters or search query</p>
              <button onClick={clearFilters} className="clear-filters">
                Clear Filters
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}