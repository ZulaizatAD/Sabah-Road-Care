import React from 'react'

// Reusable wrapper component for form sections
// Provide styling consistent and errorhandling for form fields
const FormSection = ({ title, children, error}) => {
  return (
    <div className="form-section">
        <h3 className="section-title">{title}</h3>
        <div className="section-content">
            {children}
        </div>
        {/* Conditional render error message if error exists */}
        {error && <div className="error-message">{error}</div>}
    </div>
  );
};

export default FormSection;