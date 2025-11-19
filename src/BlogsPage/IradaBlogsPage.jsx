// App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Blogs from "./Blogs.jsx";
import BlogRead from "../BlogReader/BlogRead.jsx";
import "../App.css";
function IradaBlogsPage({
  apiKey,
  theme = "light",
  heading = "Discover Our Blog",
  subheading = "Explore insights, tutorials, and stories from our community",
  homeRoute = "/",
}) {
  if (!apiKey) return <div>API key is required</div>;

  const apiEndpoint = "https://iradaapi.sohaibaftab.dev";

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
            homeRoute={homeRoute}
          />
        }
      />
      <Route
        path="blog/:slug"
        element={
          <BlogRead
            theme={theme}
            apiKey={apiKey}
            apiEndpoint={apiEndpoint}
            homeRoute={homeRoute}
          />
        }
      />
    </Routes>
  );
}

export { IradaBlogsPage };
