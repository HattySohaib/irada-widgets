import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import GhostLoader from "../Loaders/GhostLoader.jsx";
import "../App.css";
// Format date to readable format
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format number with K/M suffix
const formatNumber = (num) => {
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const FeaturedBlogsCarousel = ({ theme, apiKey }) => {
  const apiEndpoint = "https://iradaapi.sohaibaftab.dev";
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const autoScrollInterval = useRef(null);

  // Fetch featured blogs
  useEffect(() => {
    const fetchFeaturedBlogs = async () => {
      if (!apiKey) {
        console.error("API key is required to fetch featured blogs");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `${apiEndpoint}/api/token/blogs?featured=true`,
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
        setBlogs(data.blogs || []);
      } catch (error) {
        console.error("Failed to fetch featured blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedBlogs();
  }, [apiKey, apiEndpoint]);

  // Auto-scroll effect
  useEffect(() => {
    if (!isInteracting && blogs.length > 1) {
      autoScrollInterval.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % blogs.length);
      }, 5000); // Change slide every 5 seconds
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [isInteracting, blogs.length]);

  const nextSlide = () => {
    setCurrentIndex((currentIndex + 1) % blogs.length);
  };

  const prevSlide = () => {
    setCurrentIndex((currentIndex - 1 + blogs.length) % blogs.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleTouchStart = (e) => {
    setIsInteracting(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const touchDiff = touchStartX.current - touchEndX.current;
    if (touchDiff > 60) {
      // Swiped left
      nextSlide();
    } else if (touchDiff < -60) {
      // Swiped right
      prevSlide();
    }
    setIsInteracting(false);
  };

  const handleMouseEnter = () => {
    setIsInteracting(true);
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
    }
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
  };

  if (loading) {
    return (
      <div
        className="irada-widget ir-irada-featured-carousel"
        data-theme={theme}
      >
        <div className="ir-carousel-container">
          <div className="ir-carousel-container">
            <div className="ir-loading-skeleton">
              <div
                className="ir-skeleton-card"
                style={{ height: "400px" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div
        className="irada-widget ir-irada-featured-carousel"
        data-theme={theme}
      >
        <div className="ir-carousel-container">
          <div className="ir-carousel-container">
            <div style={{ padding: "2rem", textAlign: "center" }}>
              <p>No featured blogs available.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="irada-widget ir-irada-featured-carousel" data-theme={theme}>
      <div className="ir-carousel-container">
        <div
          className="ir-carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            className="ir-carousel-inner"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {blogs.map((blog, index) => (
              <div className="ir-carousel-item" key={blog._id || index}>
                <FeaturedBlogSlide blog={blog} />
              </div>
            ))}
          </div>

          {blogs.length > 1 && (
            <div className="ir-carousel-controls">
              <button className="ir-carousel-control prev" onClick={prevSlide}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="15,18 9,12 15,6"></polyline>
                </svg>
              </button>
              <button className="ir-carousel-control next" onClick={nextSlide}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="9,18 15,12 9,6"></polyline>
                </svg>
              </button>
            </div>
          )}
        </div>

        {blogs.length > 1 && (
          <div className="ir-carousel-pagination">
            {blogs.map((_, index) => (
              <button
                key={index}
                className={`ir-carousel-dot ${
                  index === currentIndex ? "active" : ""
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const FeaturedBlogSlide = ({ blog }) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleImageLoaded = () => {
    setIsLoading(false);
  };

  return (
    <Link to={`/blogs/blog/${blog.slug}`} className="ir-featured-blog-slide">
      <div className="ir-featured-blog-image">
        {isLoading && (
          <GhostLoader width="100%" height="100%" radius="0" theme="dark" />
        )}
        <img
          onLoad={handleImageLoaded}
          style={{ display: isLoading ? "none" : "block" }}
          src={blog.banner}
          alt={blog.title}
        />
        <div className="ir-featured-blog-overlay" />
      </div>

      <div className="ir-featured-blog-content">
        <div className="ir-featured-blog-badges">
          <div className="ir-featured-category-badge">{blog.category}</div>
          {blog.tags && blog.tags.length > 0 && (
            <>
              <span className="ir-featured-badge-separator">•</span>
              <div className="ir-featured-blog-tags">
                {blog.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="ir-featured-blog-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="ir-featured-blog-info">
          <h2 className="ir-featured-blog-title">{blog.title}</h2>
          <p className="ir-featured-blog-meta">{blog.meta}</p>

          <div className="ir-featured-blog-details">
            <div className="ir-featured-blog-author">
              <span className="ir-author-name">
                @{blog.author?.username || "Anonymous"}
              </span>
            </div>

            <div className="ir-featured-blog-stats">
              <div className="ir-stat-item">
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
                {formatNumber(blog.viewsCount || 0)}
              </div>
              <div className="ir-stat-item">
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
                {formatNumber(blog.likesCount || 0)}
              </div>
              <span className="ir-publish-date">
                {formatDate(blog.publishedAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FeaturedBlogsCarousel;
