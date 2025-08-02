import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportHistory.css";

const ReportHistory = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [filters, setFilters] = useState({
    status: "all",
    district: "all",
    priority: "all",
  });
  const [sortBy, setSortBy] = useState("date-desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState("grid");
  const reportsPerPage = 9;

  // Dummy data
  const dummyReports = [
    {
      id: 1,
      documentNumber: "RPT-2024-001",
      title: "Large Pothole on Main Road",
      location: "Jalan Tuaran, Kota Kinabalu",
      district: "Kota Kinabalu",
      submissionDate: "2024-01-15",
      lastUpdated: "2024-01-20",
      status: "Completed",
      priority: "High",
      severity: "Severe",
      description: "Large pothole causing traffic disruption on main road",
      similarReports: 5,
      completionDate: "2024-01-20",
    },
    {
      id: 2,
      documentNumber: "RPT-2024-002",
      title: "Medium Pothole Near School",
      location: "Jalan Coastal Highway, Sandakan",
      district: "Sandakan",
      submissionDate: "2024-01-14",
      lastUpdated: "2024-01-18",
      status: "In Progress",
      priority: "Medium",
      severity: "Moderate",
      description: "Pothole near school area affecting student safety",
      similarReports: 3,
      completionDate: null,
    },
    {
      id: 3,
      documentNumber: "RPT-2024-003",
      title: "Small Pothole on Residential Street",
      location: "Jalan Penampang, Penampang",
      district: "Penampang",
      submissionDate: "2024-01-13",
      lastUpdated: "2024-01-16",
      status: "Approved",
      priority: "Low",
      severity: "Minor",
      description: "Small pothole on quiet residential street",
      similarReports: 1,
      completionDate: null,
    },
    {
      id: 4,
      documentNumber: "RPT-2024-004",
      title: "Critical Road Damage",
      location: "Jalan Beaufort, Beaufort",
      district: "Beaufort",
      submissionDate: "2024-01-12",
      lastUpdated: "2024-01-15",
      status: "Under Review",
      priority: "Critical",
      severity: "Severe",
      description: "Major road damage requiring immediate attention",
      similarReports: 8,
      completionDate: null,
    },
    {
      id: 5,
      documentNumber: "RPT-2024-005",
      title: "Multiple Small Potholes",
      location: "Jalan Ranau, Ranau",
      district: "Ranau",
      submissionDate: "2024-01-11",
      lastUpdated: "2024-01-14",
      status: "Rejected",
      priority: "Low",
      severity: "Minor",
      description: "Multiple small potholes reported in the area",
      similarReports: 2,
      completionDate: null,
    },
    {
      id: 6,
      documentNumber: "RPT-2024-006",
      title: "Highway Pothole Emergency",
      location: "Jalan Kota Kinabalu-Sandakan Highway",
      district: "Kota Kinabalu",
      submissionDate: "2024-01-10",
      lastUpdated: "2024-01-12",
      status: "Completed",
      priority: "Critical",
      severity: "Severe",
      description: "Emergency pothole repair on major highway",
      similarReports: 12,
      completionDate: "2024-01-12",
    },
    {
      id: 7,
      documentNumber: "RPT-2024-007",
      title: "Deep Pothole at Traffic Light",
      location: "Jalan Lintas, Kota Kinabalu",
      district: "Kota Kinabalu",
      submissionDate: "2024-01-09",
      lastUpdated: "2024-01-11",
      status: "In Progress",
      priority: "High",
      severity: "Severe",
      description:
        "Deep pothole at busy traffic intersection causing vehicle damage",
      similarReports: 7,
      completionDate: null,
    },
    {
      id: 8,
      documentNumber: "RPT-2024-008",
      title: "Road Surface Deterioration",
      location: "Jalan Semporna, Semporna",
      district: "Semporna",
      submissionDate: "2024-01-08",
      lastUpdated: "2024-01-10",
      status: "Approved",
      priority: "Medium",
      severity: "Moderate",
      description: "Multiple cracks and small potholes forming on main road",
      similarReports: 4,
      completionDate: null,
    },
    {
      id: 9,
      documentNumber: "RPT-2024-009",
      title: "Pothole Near Hospital",
      location: "Jalan Hospital, Tawau",
      district: "Tawau",
      submissionDate: "2024-01-07",
      lastUpdated: "2024-01-09",
      status: "Under Review",
      priority: "High",
      severity: "Moderate",
      description:
        "Pothole affecting ambulance access to hospital emergency entrance",
      similarReports: 6,
      completionDate: null,
    },
    {
      id: 10,
      documentNumber: "RPT-2024-010",
      title: "Minor Road Crack",
      location: "Jalan Kudat, Kudat",
      district: "Kudat",
      submissionDate: "2024-01-06",
      lastUpdated: "2024-01-08",
      status: "Completed",
      priority: "Low",
      severity: "Minor",
      description:
        "Small crack in road surface, preventive maintenance completed",
      similarReports: 1,
      completionDate: "2024-01-08",
    },
    {
      id: 11,
      documentNumber: "RPT-2024-011",
      title: "Large Pothole at Bus Stop",
      location: "Jalan Lahad Datu, Lahad Datu",
      district: "Lahad Datu",
      submissionDate: "2024-01-05",
      lastUpdated: "2024-01-07",
      status: "In Progress",
      priority: "Medium",
      severity: "Moderate",
      description: "Pothole at bus stop area affecting public transportation",
      similarReports: 3,
      completionDate: null,
    },
    {
      id: 12,
      documentNumber: "RPT-2024-012",
      title: "Critical Bridge Approach Damage",
      location: "Jalan Keningau Bridge, Keningau",
      district: "Keningau",
      submissionDate: "2024-01-04",
      lastUpdated: "2024-01-06",
      status: "Under Review",
      priority: "Critical",
      severity: "Severe",
      description:
        "Severe road damage at bridge approach requiring urgent attention",
      similarReports: 9,
      completionDate: null,
    },
  ];

  const districts = [
    "Kota Kinabalu",
    "Sandakan",
    "Tawau",
    "Penampang",
    "Beaufort",
    "Ranau",
    "Semporna",
    "Kudat",
    "Lahad Datu",
    "Keningau",
  ];
  const statuses = [
    "Under Review",
    "Approved",
    "In Progress",
    "Completed",
    "Rejected",
  ];
  const priorities = ["Low", "Medium", "High", "Critical"];

  useEffect(() => {
    setReports(dummyReports);
    setFilteredReports(dummyReports);
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let filtered = reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "all" || report.status === filters.status;
      const matchesDistrict =
        filters.district === "all" || report.district === filters.district;
      const matchesPriority =
        filters.priority === "all" || report.priority === filters.priority;

      return (
        matchesSearch && matchesStatus && matchesDistrict && matchesPriority
      );
    });

    // Sort functionality
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.submissionDate) - new Date(a.submissionDate);
        case "date-asc":
          return new Date(a.submissionDate) - new Date(b.submissionDate);
        case "priority":
          const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [reports, filters, searchTerm, sortBy]);

  // Pagination
  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstReport,
    indexOfLastReport
  );
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "completed";
      case "In Progress":
        return "in-progress";
      case "Approved":
        return "approved";
      case "Under Review":
        return "under-review";
      case "Rejected":
        return "rejected";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "critical";
      case "High":
        return "high";
      case "Medium":
        return "medium";
      case "Low":
        return "low";
      default:
        return "default";
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      [
        "Document Number",
        "Title",
        "Location",
        "Status",
        "Priority",
        "Submission Date",
      ],
      ...filteredReports.map((report) => [
        report.documentNumber,
        report.title,
        report.location,
        report.status,
        report.priority,
        report.submissionDate,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report-history.csv";
    a.click();
  };

  return (
    <div className="report-history">
      <header className="history-page-header">
        <div className="history-header-content">
          <div className="header-title">
            <h1>Report History</h1>
            <p>View and track all your submitted reports.</p>
          </div>
          <button
            className="new-report-btn"
            onClick={() => navigate("/homepage")}
          >
            + Submit New Report
          </button>
        </div>
      </header>

      {/* Filters and Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search reports by title, location, or document number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            aria-label="Search reports"
            id="search-input"
          />
          <span className="search-icon" aria-hidden="true">
            🔍
          </span>
        </div>

        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="all">All Status</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <select
            value={filters.district}
            onChange={(e) => handleFilterChange("district", e.target.value)}
          >
            <option value="all">All Districts</option>
            {districts.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange("priority", e.target.value)}
          >
            <option value="all">All Priority</option>
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="date-desc">Latest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
            onClick={() => setViewMode("grid")}
          >
            ⊞ Grid
          </button>
          <button
            className={`view-btn ${viewMode === "list" ? "active" : ""}`}
            onClick={() => setViewMode("list")}
          >
            ☰ List
          </button>
          <button className="export-btn" onClick={exportToCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Results Info */}
      <div className="results-info">
        <p>
          Showing {currentReports.length} of {filteredReports.length} reports
        </p>
      </div>

      {/* Reports Grid/List */}
      <div className={`reports-container ${viewMode}`}>
        {currentReports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="history-card-header">
              <div className="report-number">#{report.documentNumber}</div>
              <div className="report-badges">
                <span
                  className={`status-badge ${getStatusColor(report.status)}`}
                >
                  {report.status}
                </span>
                <span
                  className={`priority-badge ${getPriorityColor(
                    report.priority
                  )}`}
                >
                  {report.priority}
                </span>
              </div>
            </div>

            <div className="report-content">
              <h3 className="report-title">{report.title}</h3>
              <p className="report-location">📍 {report.location}</p>
              <p className="report-description">{report.description}</p>

              <div className="report-details">
                <div className="detail-item">
                  <span className="detail-label">Submitted:</span>
                  <span className="detail-value">
                    {new Date(report.submissionDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Similar Reports:</span>
                  <span className="detail-value">{report.similarReports}</span>
                </div>
              </div>

              <div className="report-meta">
                {report.completionDate && (
                  <div className="meta-item">
                    <span className="meta-icon">✅</span>
                    <span className="meta-text">
                      Completed:{" "}
                      {new Date(report.completionDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="similar-reports">
                <span className="similar-count">
                  📊 {report.similarReports} similar report
                  {report.similarReports !== 1 ? "s" : ""} submitted
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="page-btn"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="page-numbers">
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={`page-number ${
                  currentPage === index + 1 ? "active" : ""
                }`}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <button
            className="page-btn"
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No reports found</h3>
          <p>Try adjusting your search criteria or filters</p>
          <button
            className="create-report-btn"
            onClick={() => navigate("/report")}
          >
            Create Your First Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportHistory;
