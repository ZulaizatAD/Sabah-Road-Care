import React from "react";

const Header = () => {
  const styles = {
    header: {
      backgroundColor: "white",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
      position: "sticky",
      top: 0,
      zIndex: 100,
    },
    headerContent: {
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "0 20px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      height: "70px",
    },
    logo: {
      backgroundColor: "#d1d5db",
      padding: "10px 20px",
      borderRadius: "6px",
    },
    logoText: {
      fontWeight: "600",
      color: "#374151",
      fontSize: "16px",
    },
    nav: {
      display: "flex",
      gap: "30px",
    },
    navLink: {
      color: "#374151",
      textDecoration: "none",
      fontWeight: "500",
      fontSize: "16px",
      transition: "color 0.2s",
    },
    navLinkActive: {
      color: "#111827",
      fontWeight: "600",
    },
  };

  return (
    <header style={styles.header}>
      <div style={styles.headerContent}>
        <div style={styles.logo}>
          <span style={styles.logoText}>Tex Example1</span>
        </div>
        <nav style={styles.nav}>
          <a href="#" style={{ ...styles.navLink, ...styles.navLinkActive }}>
            Dashboard
          </a>
          <a href="#" style={styles.navLink}>
            Information
          </a>
          <a href="#" style={styles.navLink}>
            Profile
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
