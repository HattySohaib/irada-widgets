import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Loader from "../Loaders/Loader.jsx";
import GhostLoader from "../Loaders/GhostLoader.jsx";
import "../App.css";
// Calculate reading time based on content length
const calculateReadingTime = (content) => {
  if (!content) return 0;
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

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

// Format relative time
const formatRelativeTime = (dateString) => {
  if (!dateString) return "";
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
  if (!num) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

// Generate table of contents from HTML content
const generateTableOfContents = (content) => {
  if (!content) return [];

  // Create a temporary div to parse the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  // Find all heading elements (h1, h2, h3, h4, h5, h6)
  const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6");

  const toc = [];
  headings.forEach((heading, index) => {
    // Generate a unique ID for the heading
    const text = heading.textContent.trim();
    const tagName = heading.tagName.toLowerCase();

    // Create a slug from the text for better IDs
    const slug = text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const id = heading.id || `heading-${slug}-${index}`;

    toc.push({
      id,
      text,
      level: parseInt(heading.tagName.charAt(1)),
      tagName,
    });
  });

  return toc;
};

// Process content to add IDs to headings
const processContentWithIds = (content, toc) => {
  if (!content || !toc.length) return content;

  // Create a temporary div to parse and modify the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = content;

  // Find all heading elements and add IDs
  const headings = tempDiv.querySelectorAll("h1, h2, h3, h4, h5, h6");

  headings.forEach((heading, index) => {
    // Find the corresponding TOC item
    const tocItem = toc.find(
      (item) =>
        item.text === heading.textContent.trim() &&
        item.tagName === heading.tagName.toLowerCase()
    );

    if (tocItem && !heading.id) {
      heading.id = tocItem.id;
    }
  });

  return tempDiv.innerHTML;
};

function BlogRead({ theme, apiKey, apiEndpoint }) {
  const { slug } = useParams();
  const location = useLocation();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgLoading, setImgLoading] = useState(true);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [tableOfContents, setTableOfContents] = useState([]);
  const [showTOC, setShowTOC] = useState(false);
  const [processedContent, setProcessedContent] = useState("");
  const [similarBlogs, setSimilarBlogs] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Determine the correct back path based on current location
  const getBackPath = () => {
    if (location.pathname.includes("/blogs/")) {
      return "/blogs";
    }
    return "/";
  };

  const fetchBlogDetails = async () => {
    if (!apiKey) {
      console.error("API key is required to fetch blog details");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiEndpoint}/api/blogs/${slug}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const res = await response.json();
      const data = res.data || {};
      console.log(data);
      setBlog(data);

      // Generate table of contents from the blog content
      if (data.content) {
        const toc = generateTableOfContents(data.content);
        console.log("Generated TOC:", toc);
        setTableOfContents(toc);

        // Process content to add IDs to headings
        const processed = processContentWithIds(data.content, toc);
        console.log("Processed content length:", processed.length);
        setProcessedContent(processed);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch blog details:", error);
      setLoading(false);
    }
  };

  const fetchSimilarBlogs = async () => {
    if (!apiKey || !blog) return;

    setLoadingSimilar(true);
    try {
      // First try to get blogs with same category
      const categoryParams = new URLSearchParams();
      categoryParams.append("limit", "10");
      categoryParams.append("category", blog.category);

      const categoryResponse = await fetch(
        `${apiEndpoint}/api/blogs?${categoryParams.toString()}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      let similarBlogs = [];

      if (categoryResponse.ok) {
        const res = await categoryResponse.json();
        const blogs = res.data?.blogs || [];
        // Filter out the current blog
        const categoryMatches = blogs.filter((b) => b.slug !== slug);
        similarBlogs = [...categoryMatches];
      }

      // If we don't have enough blogs with same category, try to find blogs with 2+ common tags
      if (similarBlogs.length < 5 && blog.tags && blog.tags.length >= 2) {
        try {
          // Get all blogs to filter by tags
          const allBlogsResponse = await fetch(
            `${apiEndpoint}/api/blogs?limit=20`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (allBlogsResponse.ok) {
            const res = await allBlogsResponse.json();
            const allBlogs = res.data?.blogs || [];

            // Find blogs with 2+ common tags
            const tagMatches = allBlogs.filter((b) => {
              if (b.slug === slug) return false; // Exclude current blog
              if (b.category === blog.category) return false; // Skip if already in category matches

              if (b.tags && blog.tags) {
                const commonTags = b.tags.filter((tag) =>
                  blog.tags.includes(tag)
                );
                return commonTags.length >= 2;
              }
              return false;
            });

            // Add tag matches to similar blogs
            similarBlogs = [...similarBlogs, ...tagMatches];
          }
        } catch (tagError) {
          console.error("Failed to fetch blogs by tags:", tagError);
        }
      }

      // Limit to 5 and set the state
      setSimilarBlogs(similarBlogs.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch similar blogs:", error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  useEffect(() => {
    if (slug && apiKey) fetchBlogDetails();
  }, [slug, apiKey]);

  useEffect(() => {
    if (blog) {
      fetchSimilarBlogs();
    }
  }, [blog]);

  const handleImageLoaded = () => {
    setImgLoading(false);
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = blog?.title || "";
    const text = blog?.meta || "";

    let shareUrl = "";
    switch (platform) {
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
          title
        )}&url=${encodeURIComponent(url)}`;
        break;
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
          url
        )}`;
        break;
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          url
        )}`;
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        setShowShareMenu(false);
        return;
      default:
        return;
    }

    window.open(shareUrl, "_blank", "width=600,height=400");
    setShowShareMenu(false);
  };

  if (loading) return <Loader theme={theme} />;

  if (!blog) {
    return (
      <div className="irada-widget irada-blogs-page" data-theme={theme}>
        <div className="blog-error">
          <div className="blog-error-content">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <h2>Blog Not Found</h2>
            <p>
              The blog post you're looking for doesn't exist or has been
              removed.
            </p>
            <Link to={getBackPath()} className="back-link">
              ← Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(blog?.content);
  const publishedDate = formatDate(blog?.publishedAt);
  const updatedDate = formatDate(blog?.updatedAt);
  const isUpdated =
    blog?.updatedAt &&
    blog?.publishedAt &&
    new Date(blog.updatedAt) > new Date(blog.publishedAt);

  return (
    <div className="irada-widget irada-blogs-page" data-theme={theme}>
      <div id="blog-read">
        {/* Banner Section */}
        <div className="blog-banner">
          {imgLoading && (
            <GhostLoader
              width={"100%"}
              height={"50vh"}
              radius={"0"}
              theme={theme}
            />
          )}
          <img
            style={{ display: imgLoading ? "none" : "block" }}
            onLoad={handleImageLoaded}
            src={blog?.banner}
            alt={blog?.title || "Blog banner"}
          />
        </div>

        {/* Blog Header Section */}
        <div className="blog-header-section">
          <div className="blog-header-content">
            <div className="blog-header-badges">
              <div className="blog-category-badge">{blog?.category}</div>
              <div className="blog-views-badge">
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
                {formatNumber(blog?.viewsCount || 0)} views
              </div>
            </div>
            <h1 className="blog-title">{blog?.title}</h1>
            <p className="blog-subtitle">{blog?.meta}</p>

            {/* Author and Meta Info */}
            <div className="blog-meta">
              <div className="author-info">
                {blog?.author?.profileImageUrl && (
                  <img
                    src={blog?.author?.profileImageUrl}
                    alt={blog?.author?.username || "Author"}
                    className="author-avatar"
                  />
                )}
                <div className="author-details">
                  <span className="author-name">
                    {blog?.author?.username || "Anonymous"}
                  </span>
                  <div className="publish-info">
                    <span className="publish-date">{publishedDate}</span>
                    {isUpdated && (
                      <span className="update-info">
                        {" "}
                        · Updated {formatRelativeTime(blog?.updatedAt)}
                      </span>
                    )}
                    <span className="reading-time">
                      {" "}
                      · {readingTime} min read
                    </span>
                  </div>
                </div>
              </div>

              {/* Share Button */}
              <div className="share-container">
                <button
                  className="share-button"
                  onClick={() => setShowShareMenu(!showShareMenu)}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Share
                </button>

                {showShareMenu && (
                  <div className="share-menu">
                    <button
                      onClick={() => handleShare("twitter")}
                      className="share-option"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                      </svg>
                      Twitter
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="share-option"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </button>
                    <button
                      onClick={() => handleShare("facebook")}
                      className="share-option"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="share-option"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <rect
                          x="9"
                          y="9"
                          width="13"
                          height="13"
                          rx="2"
                          ry="2"
                        />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy Link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="blog-content-wrapper">
          <div className="blog-content-container">
            {/* Tags */}
            {blog?.tags && blog.tags.length > 0 && (
              <div className="blog-tags-section">
                {blog.tags.map((tag, index) => (
                  <span key={index} className="blog-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <div className="blog-toc-section">
                <div className="toc-header">
                  <h3 className="toc-title">Table of Contents</h3>
                  <button
                    className="toc-toggle"
                    onClick={() => setShowTOC(!showTOC)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      style={{
                        transform: showTOC ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      <polyline points="6,9 12,15 18,9"></polyline>
                    </svg>
                  </button>
                </div>

                {showTOC && (
                  <nav className="toc-nav">
                    <ul className="toc-list">
                      {tableOfContents.map((item, index) => (
                        <li
                          key={index}
                          className={`toc-item toc-level-${item.level}`}
                        >
                          <a
                            href={`#${item.id}`}
                            className="toc-link"
                            onClick={(e) => {
                              e.preventDefault();
                              const element = document.getElementById(item.id);
                              console.log(
                                "TOC click:",
                                item.id,
                                "Element found:",
                                !!element
                              );
                              if (element) {
                                element.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              } else {
                                console.log(
                                  "Element not found for ID:",
                                  item.id
                                );
                                // Try to find by text content as fallback
                                const headings = document.querySelectorAll(
                                  "h1, h2, h3, h4, h5, h6"
                                );
                                const matchingHeading = Array.from(
                                  headings
                                ).find(
                                  (h) => h.textContent.trim() === item.text
                                );
                                if (matchingHeading) {
                                  console.log(
                                    "Found by text content, scrolling to:",
                                    matchingHeading
                                  );
                                  matchingHeading.scrollIntoView({
                                    behavior: "smooth",
                                    block: "start",
                                  });
                                }
                              }
                            }}
                          >
                            {item.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </nav>
                )}
              </div>
            )}

            {/* Blog Content */}
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{
                __html: processedContent || blog?.content,
              }}
            />
          </div>
        </div>

        {/* Similar Blogs Section - Full Width */}
        <div className="similar-blogs-section">
          <div className="similar-blogs-container">
            <h2 className="similar-blogs-title">Similar Articles</h2>

            {loadingSimilar ? (
              <div className="similar-blogs-loading">
                <div className="loading-skeleton">
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                  <div className="skeleton-card"></div>
                </div>
              </div>
            ) : similarBlogs.length > 0 ? (
              <div className="similar-blogs-grid">
                {similarBlogs.map((similarBlog, index) => (
                  <Link
                    key={similarBlog._id || index}
                    to={`${getBackPath()}/blog/${similarBlog.slug}`}
                    className="similar-blog-card"
                  >
                    <div className="similar-blog-content">
                      <div className="similar-blog-header">
                        <div className="similar-blog-category">
                          {similarBlog.category}
                        </div>
                        <div className="similar-blog-views">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                          {formatNumber(similarBlog.viewsCount || 0)}
                        </div>
                      </div>
                      <h3 className="similar-blog-title">
                        {similarBlog.title}
                      </h3>
                      <p className="similar-blog-meta">{similarBlog.meta}</p>
                      <div className="similar-blog-meta-info">
                        <span className="similar-blog-author">
                          {similarBlog.author?.username || "Anonymous"}
                        </span>
                        <span className="similar-blog-date">
                          {formatDate(similarBlog.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="no-similar-blogs">
                <p>No similar articles found.</p>
              </div>
            )}

            {/* Back to Blogs Button */}
            <div className="similar-blogs-footer">
              <Link to={getBackPath()} className="back-to-blogs">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12,19 5,12 12,5" />
                </svg>
                Back to Blogs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BlogRead;
