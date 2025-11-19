import React, { useState } from "react";

const MessageForm = ({
  theme = "light",
  apiKey,
  heading = "Get in Touch",
  subheading = "Send us a message and we'll get back to you as soon as possible.",
  placeholderName = "Your name",
  placeholderEmail = "Your email",
  placeholderMessage = "Your message...",
  buttonText = "Send Message",
  onSuccess,
  onError,
}) => {
  const apiEndpoint = "https://iradaapi.sohaibaftab.dev";
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!apiKey || !apiEndpoint) {
      console.error("API key and endpoint are required");
      if (onError) onError("Configuration error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiEndpoint}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          senderEmail: formData.email.trim(),
          name: formData.name.trim(),
          message: formData.message.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Reset form on success
      setFormData({
        name: "",
        email: "",
        message: "",
      });
      setErrors({});

      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      if (onError) {
        onError(error.message || "Failed to send message");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="irada-widget ir-irada-message-form" data-theme={theme}>
      <div className="ir-message-form-container">
        {(heading || subheading) && (
          <div className="ir-message-form-header">
            {heading && <h2 className="ir-message-form-title">{heading}</h2>}
            {subheading && (
              <p className="ir-message-form-subtitle">{subheading}</p>
            )}
          </div>
        )}

        <form className="ir-message-form" onSubmit={handleSubmit}>
          <div className="ir-form-row">
            <div className="ir-form-field">
              <label htmlFor="name" className="ir-form-label">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={placeholderName}
                className={`ir-form-input ${errors.name ? "error" : ""}`}
                disabled={loading}
              />
              {errors.name && (
                <span className="ir-error-message">{errors.name}</span>
              )}
            </div>

            <div className="ir-form-field">
              <label htmlFor="email" className="ir-form-label">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={placeholderEmail}
                className={`ir-form-input ${errors.email ? "error" : ""}`}
                disabled={loading}
              />
              {errors.email && (
                <span className="ir-error-message">{errors.email}</span>
              )}
            </div>
          </div>

          <div className="ir-form-field">
            <label htmlFor="message" className="ir-form-label">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder={placeholderMessage}
              className={`ir-form-textarea ${errors.message ? "error" : ""}`}
              rows={5}
              disabled={loading}
            />
            {errors.message && (
              <span className="ir-error-message">{errors.message}</span>
            )}
          </div>

          <button type="submit" className="ir-submit-button" disabled={loading}>
            {loading ? (
              <div className="ir-loading-spinner">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
              </div>
            ) : (
              <>
                {buttonText}
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 2L11 13" />
                  <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageForm;
