import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import emailjs from "@emailjs/browser";
import "./ContactUs.css";

export default function ContactUs() {
  const [contactFormData, setContactFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const validateEmailJSConfig = () => {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.error("EmailJS configuration missing:", {
        serviceId: !!serviceId,
        templateId: !!templateId,
        publicKey: !!publicKey,
      });
      return false;
    }
    return true;
  };

  const [contactFormErrors, setContactFormErrors] = useState({});
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);

  useEffect(() => {
    if (!validateEmailJSConfig()) {
      toast.warning(
        "Email service not configured. Contact form may not work properly."
      );
    }
  }, []);

  // Support categories
  const supportCategories = [
    { value: "", label: "Select Category" },
    { value: "bug-report", label: "Bug Report" },
    { value: "feature-request", label: "Feature Request" },
    { value: "technical-support", label: "Technical Support" },
    { value: "account-issue", label: "Account Issue" },
    { value: "feedback", label: "General Feedback" },
    { value: "other", label: "Other" },
  ];

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactFormData({ ...contactFormData, [name]: value });

    // Clear error when user starts typing
    if (contactFormErrors[name]) {
      setContactFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateContactForm = () => {
    const newErrors = {};

    // Name validation
    if (!contactFormData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (contactFormData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!contactFormData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(contactFormData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Subject validation
    if (!contactFormData.subject.trim()) {
      newErrors.subject = "Subject is required";
    } else if (contactFormData.subject.trim().length < 5) {
      newErrors.subject = "Subject must be at least 5 characters";
    }

    // Category validation
    if (!contactFormData.category) {
      newErrors.category = "Please select a category";
    }

    // Message validation
    if (!contactFormData.message.trim()) {
      newErrors.message = "Message is required";
    } else if (contactFormData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    setContactFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!validateContactForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsContactSubmitting(true);

    try {
      // Prepare template parameters for EmailJS
      const templateParams = {
        from_name: contactFormData.name,
        from_email: contactFormData.email,
        to_email: "krewlzewl@gmail.com",
        subject: contactFormData.subject,
        category:
          supportCategories.find(
            (cat) => cat.value === contactFormData.category
          )?.label || "General",
        message: contactFormData.message,
        reply_to: contactFormData.email,
        submission_date: new Date().toLocaleString(),
        user_agent: navigator.userAgent,
      };

      // Send email using EmailJS
      const response = await emailjs.send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAILJS_PUBLIC_KEY
      );

      console.log("EmailJS response:", response);

      if (response.status === 200) {
        toast.success(
          "Message sent successfully! We'll get back to you soon.",
          {
            position: "top-right",
            autoClose: 5000,
          }
        );

        // Reset form
        setContactFormData({
          name: "",
          email: "",
          subject: "",
          category: "",
          message: "",
        });
      } else {
        throw new Error("EmailJS response not successful");
      }
    } catch (error) {
      console.error("Contact form error:", error);

      const errorMessage = getEmailJSErrorMessage(error);
      toast.error(errorMessage);

      // Fallback message with direct email (only for non-rate-limiting errors)
      if (error.status !== 429) {
        setTimeout(() => {
          toast.info("You can also email us directly at krewlzewl@gmail.com", {
            autoClose: 8000,
          });
        }, 2000);
      }
    } finally {
      setIsContactSubmitting(false);
    }
  };

  const getEmailJSErrorMessage = (error) => {
    switch (error.status) {
      case 400:
        return "Invalid email configuration. Please contact support.";
      case 402:
        return "Email service temporarily unavailable. Please try again later.";
      case 422:
        return "Invalid form data. Please check your inputs and try again.";
      case 429:
        return "Too many requests. Please wait a moment and try again.";
      default:
        return "Failed to send message. Please try again or contact us directly.";
    }
  };

  return (
    <div className="contact-us-page">
      <div className="contact-us-container">
        <div className="contact-us-header">
          <h1 className="contact-us-title">CONTACT US</h1>
          <p className="contact-us-subtitle">
            Have questions, feedback, or need support? We're here to help!
          </p>
        </div>

        <div className="contact-us-content">
          {/* Contact Information */}
          <div className="contact-us-info">
            <div className="contact-us-info-card">
              <div className="contact-us-info-icon">📧</div>
              <h3>Email Us</h3>
              <p>krewlzewl@gmail.com</p>
              <span>We typically respond within 24 hours</span>
            </div>

            <div className="contact-us-info-card">
              <div className="contact-us-info-icon">🕒</div>
              <h3>Response Time</h3>
              <p>24-48 hours</p>
              <span>Monday to Friday</span>
            </div>

            <div className="contact-us-info-card">
              <div className="contact-us-info-icon">🛠️</div>
              <h3>Support Types</h3>
              <p>Technical & General</p>
              <span>Bug reports, feature requests, feedback</span>
            </div>
          </div>

          {/* Contact Form */}
          <div className="contact-us-form-wrapper">
            <form className="contact-us-form" onSubmit={handleContactSubmit}>
              <div className="contact-us-name-fields">
                <div
                  className={`contact-us-input-group ${
                    contactFormErrors.name ? "contact-us-error" : ""
                  }`}
                >
                  <label className="contact-us-label">Your Name *</label>
                  <input
                    className="contact-us-input"
                    type="text"
                    name="name"
                    value={contactFormData.name}
                    onChange={handleContactChange}
                    placeholder="Enter your name"
                    disabled={isContactSubmitting}
                  />
                  {contactFormErrors.name && (
                    <span className="contact-us-error-message">
                      {contactFormErrors.name}
                    </span>
                  )}
                </div>
              </div>

              <div
                className={`contact-us-input-group ${
                  contactFormErrors.email ? "contact-us-error" : ""
                }`}
              >
                <label className="contact-us-label">Email Address *</label>
                <input
                  className="contact-us-input"
                  type="email"
                  name="email"
                  value={contactFormData.email}
                  onChange={handleContactChange}
                  placeholder="Enter your email address"
                  disabled={isContactSubmitting}
                />
                {contactFormErrors.email && (
                  <span className="contact-us-error-message">
                    {contactFormErrors.email}
                  </span>
                )}
              </div>

              <div
                className={`contact-us-input-group ${
                  contactFormErrors.category ? "contact-us-error" : ""
                }`}
              >
                <label className="contact-us-label">Category *</label>
                <select
                  className="contact-us-select"
                  name="category"
                  value={contactFormData.category}
                  onChange={handleContactChange}
                  disabled={isContactSubmitting}
                >
                  {supportCategories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                {contactFormErrors.category && (
                  <span className="contact-us-error-message">
                    {contactFormErrors.category}
                  </span>
                )}
              </div>

              <div
                className={`contact-us-input-group ${
                  contactFormErrors.subject ? "contact-us-error" : ""
                }`}
              >
                <label className="contact-us-label">Subject *</label>
                <input
                  className="contact-us-input"
                  type="text"
                  name="subject"
                  value={contactFormData.subject}
                  onChange={handleContactChange}
                  placeholder="Brief description of your inquiry"
                  disabled={isContactSubmitting}
                />
                {contactFormErrors.subject && (
                  <span className="contact-us-error-message">
                    {contactFormErrors.subject}
                  </span>
                )}
              </div>

              <div
                className={`contact-us-input-group ${
                  contactFormErrors.message ? "contact-us-error" : ""
                }`}
              >
                <label className="contact-us-label">Message *</label>
                <textarea
                  className="contact-us-textarea"
                  name="message"
                  rows="6"
                  value={contactFormData.message}
                  onChange={handleContactChange}
                  placeholder="Please provide details about your inquiry, issue, or feedback..."
                  disabled={isContactSubmitting}
                />
                <div className="contact-us-char-count">
                  {contactFormData.message.length}/1000
                </div>
                {contactFormErrors.message && (
                  <span className="contact-us-error-message">
                    {contactFormErrors.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className={`contact-us-submit-btn ${
                  isContactSubmitting ? "contact-us-loading" : ""
                }`}
                disabled={isContactSubmitting}
              >
                {isContactSubmitting ? (
                  <>
                    <span className="contact-us-loading-spinner"></span>
                    Sending Message...
                  </>
                ) : (
                  "SEND MESSAGE"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
