// src/components/BlogPreview.jsx
import { Link } from 'react-router-dom';
import './styles/blogpreview.css';

export default function BlogPreview({ post }) {
  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <article className="blog-preview">
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
  );
}