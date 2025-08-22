import React, { useState, useEffect, useCallback, useRef } from "react";

import Loader from "../Loaders/Loader.jsx";
import BlogCard2 from "../BlogCard/BlogCard.jsx";
import "../App.css";
function Blogs({
  apiKey,
  theme,
  apiEndpoint,
  heading = "Discover Our Blog",
  subheading = "Explore insights, tutorials, and stories from our community",
}) {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [blogs, setBlogs] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBlogs: 0,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const observerRef = useRef();
  const lastBlogRef = useRef();

  const fetchBlogs = async (page = 1, append = false) => {
    if (!apiKey) {
      console.error("API key is required to fetch blogs");
      setLoading(false);
      return;
    }

    try {
      const isInitialLoad = page === 1;
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(
        `${apiEndpoint}/api/token/blogs?page=${page}`,
        {
          method: "GET",
          headers: {
            "x-api-key": apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      const data = res.data || {};
      if (append) {
        setBlogs((prev) => [...prev, ...(data.blogs || [])]);
      } else {
        setBlogs(data.blogs || []);
      }

      setPagination(
        data.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalBlogs: 0,
          limit: 10,
          hasNextPage: false,
          hasPrevPage: false,
        }
      );

      setError(null);
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
      setError("Failed to load blogs. Please try again later.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Intersection Observer for infinite scroll
  const lastBlogElementRef = useCallback(
    (node) => {
      if (loading || loadingMore) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && pagination.hasNextPage) {
            fetchBlogs(pagination.currentPage + 1, true);
          }
        },
        {
          rootMargin: "100px", // Load more when 100px from bottom
        }
      );

      if (node) {
        observerRef.current.observe(node);
      }
    },
    [loading, loadingMore, pagination.hasNextPage, pagination.currentPage]
  );

  useEffect(() => {
    if (apiKey) {
      fetchBlogs(1, false);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [apiKey]);

  // Filter blogs based on search query
  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.meta.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (blog.tags &&
        blog.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  if (loading) {
    return (
      <div className="irada-widget irada-blogs-page" data-theme={theme}>
        <Loader theme={theme} />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "var(--irada-spacing-xl)",
          textAlign: "center",
          color: "var(--irada-text)",
        }}
      >
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="irada-widget irada-blogs-page" data-theme={theme}>
      <div id="blogs">
        <div className="ir-recommended-blogs">
          {/* Enhanced Header Section */}
          <div className="ir-blogs-header">
            <div className="ir-blogs-header-content">
              <div className="ir-blogs-title-section">
                <h1 className="ir-blogs-main-title">{heading}</h1>
                <p className="ir-blogs-subtitle">{subheading}</p>
                <div className="ir-blogs-stats">
                  <span className="ir-stat-item">
                    <strong>{pagination.totalBlogs}</strong> articles
                  </span>
                  <span className="ir-stat-divider">•</span>
                  <span className="ir-stat-item">
                    <strong>{pagination.totalPages}</strong> pages
                  </span>
                </div>
              </div>

              {/* Search Section */}
              <div className="ir-blogs-controls">
                <div className="ir-search-container">
                  <div className="ir-search-input-wrapper">
                    <svg
                      className="ir-search-icon"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search articles, tags, or categories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="ir-search-input"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="ir-clear-search"
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Info */}
          {searchQuery && (
            <div className="ir-search-results-info">
              <p>
                Showing {filteredBlogs.length} of {blogs.length} results for "
                {searchQuery}"
              </p>
            </div>
          )}

          <div className="ir-recommended-blogs-list">
            {filteredBlogs.map((blog, index) => {
              const isLastElement = index === filteredBlogs.length - 1;

              return (
                <div
                  key={blog._id}
                  ref={isLastElement ? lastBlogElementRef : null}
                >
                  <BlogCard2 theme={theme} blog={blog} />
                </div>
              );
            })}
          </div>

          {loadingMore && (
            <div className="ir-loading-more">
              <div className="ir-dot-spinner">
                <div className="ir-dot-spinner__dot"></div>
                <div className="ir-dot-spinner__dot"></div>
                <div className="ir-dot-spinner__dot"></div>
                <div className="ir-dot-spinner__dot"></div>
                <div className="ir-dot-spinner__dot"></div>
                <div className="ir-dot-spinner__dot"></div>
                <div className="ir-dot-spinner__dot"></div>
                <div className="ir-dot-spinner__dot"></div>
              </div>
            </div>
          )}

          {!pagination.hasNextPage && filteredBlogs.length > 0 && (
            <div className="ir-end-message">
              <p>You've reached the end of all blogs</p>
            </div>
          )}

          {filteredBlogs.length === 0 && !loading && (
            <div className="ir-no-results">
              <div className="ir-no-results-content">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <h3>No results found</h3>
                <p>Try adjusting your search terms</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Blogs;
