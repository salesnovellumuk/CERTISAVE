// src/pages/BlogPostDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogApi } from '../utils/api';
import './styles/blogpostdetail.css';

export default function BlogPostDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const data = await blogApi.getPost(slug);
        setPost(data);
        
        // Fetch related posts
        const related = await blogApi.getRelatedPosts(slug);
        setRelatedPosts(related);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
      window.scrollTo(0, 0);
    }
  }, [slug]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="blog-post-loading">
        <div className="loading-spinner"></div>
        <p>Loading post...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="blog-post-error">
        <h2>Error Loading Post</h2>
        <p>{error}</p>
        <Link to="/blog" className="back-button">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="blog-post-error">
        <h2>Post Not Found</h2>
        <p>The post you're looking for doesn't exist.</p>
        <Link to="/blog" className="back-button">
          ← Back to Blog
        </Link>
      </div>
    );
  }

  return (
    <div className="blog-post-detail">
      {/* Back Button */}
      <div className="back-button-container">
        <Link to="/blog" className="back-button">
          ← Back to Blog
        </Link>
      </div>

      {/* Featured Image */}
      {post.featured_image_url && (
        <div className="post-hero-image">
          <img 
            src={post.featured_image_url} 
            alt={post.featured_image_alt || post.title}
          />
        </div>
      )}

      {/* Main Content */}
      <article className="post-article">
        <div className="post-header">
          {/* Category */}
          {post.category && (
            <Link 
              to={`/blog?category=${post.category.slug}`}
              className="post-category"
            >
              {post.category.name}
            </Link>
          )}

          {/* Title */}
          <h1 className="post-title">{post.title}</h1>

          {/* Meta Info */}
          <div className="post-meta">
            <div className="post-meta-item">
              <span className="post-author">
                By {post.author.first_name || post.author.username}
              </span>
            </div>
            <div className="post-meta-divider">•</div>
            <div className="post-meta-item">
              <span className="post-date">
                {formatDate(post.date_published)}
              </span>
            </div>
            <div className="post-meta-divider">•</div>
            <div className="post-meta-item">
              <span className="post-read-time">
                {post.read_time} min read
              </span>
            </div>
            <div className="post-meta-divider">•</div>
            <div className="post-meta-item">
              <span className="post-views">
                {post.views} views
              </span>
            </div>
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="post-tags">
              {post.tags.map((tag) => (
                <Link
                  key={tag.id}
                  to={`/blog?tag=${tag.slug}`}
                  className="post-tag"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div className="post-excerpt">
          <p>{post.excerpt}</p>
        </div>

        {/* Main Content */}
        <div 
          className="post-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Last Updated */}
        {post.date_updated && (
          <div className="post-updated">
            Last updated: {formatDate(post.date_updated)}
          </div>
        )}
      </article>

      {/* Related Posts - Simple Cards */}
      {relatedPosts && relatedPosts.length > 0 && (
        <section className="related-posts">
          <h2 className="related-posts-title">Related Posts</h2>
          <div className="related-posts-grid">
            {relatedPosts.map((relatedPost) => (
              <Link 
                key={relatedPost.id} 
                to={`/blog/${relatedPost.slug}`}
                className="related-post-card"
              >
                {relatedPost.featured_image_url && (
                  <img 
                    src={relatedPost.featured_image_url} 
                    alt={relatedPost.title}
                    className="related-post-image"
                  />
                )}
                <div className="related-post-content">
                  <h3 className="related-post-title">{relatedPost.title}</h3>
                  <p className="related-post-excerpt">{relatedPost.excerpt}</p>
                  <span className="related-post-read">Read More →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to Blog CTA */}
      <div className="post-footer">
        <Link to="/blog" className="back-button-large">
          ← Browse More Articles
        </Link>
      </div>
    </div>
  );
}