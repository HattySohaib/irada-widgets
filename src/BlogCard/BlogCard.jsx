import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import GhostLoader from "../Loaders/GhostLoader.jsx";
import "../App.css";

export const truncate = (str, n) => {
  if (!str) return "";
  return str?.length > n ? str.substr(0, n - 1) + "..." : str;
};

// Format date to relative time (e.g., "2 days ago")
const formatRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 2592000)
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  if (diffInSeconds < 31536000)
    return `${Math.floor(diffInSeconds / 2592000)}mo ago`;
  return `${Math.floor(diffInSeconds / 31536000)}y ago`;
};

// Format number with K/M suffix
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

function BlogCard2({ blog, theme }) {
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  const handleImageLoaded = () => {
    setIsLoading(false);
  };

  // Determine the correct path based on current location
  const getBlogPath = () => {
    // Always use the current path + /blog/slug format
    const currentPath = location.pathname;
    if (currentPath.endsWith("/blogs")) {
      return `${currentPath}/blog/${blog?.slug}`;
    }
    return `/blog/${blog?.slug}`;
  };

  return (
    <Link to={getBlogPath()} key={blog._id} className="ir-recommended-blog">
      {isLoading && (
        <GhostLoader width={"100%"} height={"200px"} theme={theme} />
      )}
      <img
        onLoad={handleImageLoaded}
        style={{ display: isLoading ? "none" : "block" }}
        src={blog?.banner}
        alt={blog?.title || "Blog image"}
      />

      <div className="ir-blog-text">
        <div className="ir-blog-header">
          <span className="ir-blog-category">{blog?.category}</span>
        </div>

        <h3 className="ir-blog-title">{truncate(blog.title, 60)}</h3>
        <p>{truncate(blog.meta, 100)}</p>

        {blog?.tags && blog.tags.length > 0 && (
          <div className="ir-blog-tags">
            {blog.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="ir-blog-tag">
                {tag}
              </span>
            ))}
            {blog.tags.length > 3 && (
              <span className="ir-blog-tag-more">+{blog.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>

      <div className="ir-details">
        <div className="ir-blog-stats">
          <span className="ir-stat-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {formatNumber(blog?.viewsCount || 0)}
          </span>
          <span className="ir-stat-item">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {formatNumber(blog?.likesCount || 0)}
          </span>
        </div>
        <span className="ir-blog-date">
          {formatRelativeTime(blog?.updatedAt || blog?.publishedAt)}
        </span>
      </div>
    </Link>
  );
}

export default BlogCard2;
