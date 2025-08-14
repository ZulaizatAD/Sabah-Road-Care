import React, { useState } from "react";
import { toast } from "react-toastify";
import "./ContactUs.css";

export default function ContactUs() {
  const [contactFormData, setContactFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });

  const [contactFormErrors, setContactFormErrors] = useState({});
  const [isContactSubmitting, setIsContactSubmitting] = useState(false);

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

    // First name validation
    if (!contactFormData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (contactFormData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last name validation
    if (!contactFormData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (contactFormData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
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
      // Prepare email data
      const emailData = {
        to: "krewlzewl@gmail.com",
        subject: `[Sabah Road Care] ${contactFormData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #33e611, #2bc20f); padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">Sabah Road Care - Contact Form</h1>
            </div>
            
            <div style="padding: 30px; background: #f9f9f9;">
              <h2 style="color: #333; border-bottom: 2px solid #33e611; padding-bottom: 10px;">
                New Contact Form Submission
              </h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>From:</strong> ${contactFormData.firstName} ${contactFormData.lastName}</p>
                <p><strong>Email:</strong> ${contactFormData.email}</p>
                <p><strong>Category:</strong> ${supportCategories.find(cat => cat.value === contactFormData.category)?.label}</p>
                <p><strong>Subject:</strong> ${contactFormData.subject}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px;">
                <h3 style="color: #333; margin-top: 0;">Message:</h3>
                <p style="line-height: 1.6; color: #555;">${contactFormData.message}</p>
              </div>
              
              <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
                <p style="margin: 0; font-size: 12px; color: #666;">
                  This message was sent from the Sabah Road Care contact form on ${new Date().toLocaleString()}.
                </p>
              </div>
            </div>
          </div>
        `,
      };

      // TODO: Replace with actual email service (EmailJS, Formspree, etc.)
      // For now, simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Example using EmailJS (you'll need to set this up):
      /*
      const response = await emailjs.send(
        'YOUR_SERVICE_ID',
        'YOUR_TEMPLATE_ID',
        {
          from_name: `${contactFormData.firstName} ${contactFormData.lastName}`,
          from_email: contactFormData.email,
          subject: contactFormData.subject,
          category: supportCategories.find(cat => cat.value === contactFormData.category)?.label,
          message: contactFormData.message,
          to_email: 'krewlzewl@gmail.com'
        },
        'YOUR_PUBLIC_KEY'
      );
      */

      toast.success("Message sent successfully! We'll get back to you soon.", {
        position: "top-right",
        autoClose: 5000,
      });

      // Reset form
      setContactFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });

    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Failed to send message. Please try again or email us directly at krewlzewl@gmail.com");
    } finally {
      setIsContactSubmitting(false);
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
                <div className={`contact-us-input-group ${contactFormErrors.firstName ? 'contact-us-error' : ''}`}>
                  <label className="contact-us-label">First Name *</label>
                  <input
                    className="contact-us-input"
                    type="text"
                    name="firstName"
                    value={contactFormData.firstName}
                    onChange={handleContactChange}
                    placeholder="Enter your first name"
                    disabled={isContactSubmitting}
                  />
                  {contactFormErrors.firstName && (
                    <span className="contact-us-error-message">{contactFormErrors.firstName}</span>
                  )}
                </div>

                <div className={`contact-us-input-group ${contactFormErrors.lastName ? 'contact-us-error' : ''}`}>
                  <label className="contact-us-label">Last Name *</label>
                  <input
                    className="contact-us-input"
                    type="text"
                    name="lastName"
                    value={contactFormData.lastName}
                    onChange={handleContactChange}
                    placeholder="Enter your last name"
                    disabled={isContactSubmitting}
                  />
                  {contactFormErrors.lastName && (
                    <span className="contact-us-error-message">{contactFormErrors.lastName}</span>
                  )}
                </div>
              </div>

              <div className={`contact-us-input-group ${contactFormErrors.email ? 'contact-us-error' : ''}`}>
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
                  <span className="contact-us-error-message">{contactFormErrors.email}</span>
                )}
              </div>

              <div className={`contact-us-input-group ${contactFormErrors.category ? 'contact-us-error' : ''}`}>
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
                  <span className="contact-us-error-message">{contactFormErrors.category}</span>
                )}
              </div>

              <div className={`contact-us-input-group ${contactFormErrors.subject ? 'contact-us-error' : ''}`}>
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
                  <span className="contact-us-error-message">{contactFormErrors.subject}</span>
                )}
              </div>

              <div className={`contact-us-input-group ${contactFormErrors.message ? 'contact-us-error' : ''}`}>
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
                  <span className="contact-us-error-message">{contactFormErrors.message}</span>
                )}
              </div>

              <button 
                type="submit" 
                className={`contact-us-submit-btn ${isContactSubmitting ? 'contact-us-loading' : ''}`}
                disabled={isContactSubmitting}
              >
                {isContactSubmitting ? (
                  <>
                    <span className="contact-us-loading-spinner"></span>
                    Sending Message...
                  </>
                ) : (
                  'SEND MESSAGE'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Additional Information */}
        <div className="contact-us-additional-info">
          <div className="contact-us-faq-link">
            <h3>Looking for quick answers?</h3>
            <p>Check our FAQ section for common questions and solutions.</p>
            <button className="contact-us-faq-btn" onClick={() => window.location.href = '/faqs'}>
              Visit FAQ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
