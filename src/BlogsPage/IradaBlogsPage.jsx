// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Blogs from "./Blogs.jsx";
import BlogRead from "../BlogReader/BlogRead.jsx";
import "../App.css";
function IradaBlogsPage({
  apiKey,
  theme = "light",
  apiEndpoint = "https://bloggestapi.sohaibaftab.me",
  heading = "Discover Our Blog",
  subheading = "Explore insights, tutorials, and stories from our community",
}) {
  if (!apiKey) return <div>API key is required</div>;

  return (
    <Routes>
      <Route
        index
        path="/"
        element={
          <Blogs
            heading={heading}
            subheading={subheading}
            apiKey={apiKey}
            theme={theme}
            apiEndpoint={apiEndpoint}
          />
        }
      />
      <Route
        path="blog/:slug"
        element={
          <BlogRead theme={theme} apiKey={apiKey} apiEndpoint={apiEndpoint} />
        }
      />
    </Routes>
  );
}

export { IradaBlogsPage };
