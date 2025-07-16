import React from "react";

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: "white",
      borderTop: "1px solid #e5e7eb",
      marginTop: "40px",
    },
    footerContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      fontSize: "14px",
      color: "#6b7280",
    },
    footerLinks: {
      display: "flex",
      gap: "15px",
      alignItems: "center",
    },
    footerLink: {
      color: "#6b7280",
      textDecoration: "none",
      transition: "color 0.2s",
    },
    separator: {
      color: "#d1d5db",
    },
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.footerContent}>
        <div>© Example2</div>
        <div style={styles.footerLinks}>
          <a href="#" style={styles.footerLink}>
            Contact Us
          </a>
          <span style={styles.separator}>|</span>
          <a href="#" style={styles.footerLink}>
            Privacy Policy
          </a>
          <span style={styles.separator}>|</span>
          <a href="#" style={styles.footerLink}>
            Terms and Conditions
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
