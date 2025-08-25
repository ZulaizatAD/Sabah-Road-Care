import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDistanceToNow, format } from "date-fns";
import { getUserReports } from "../../services/historyApi";
import QuickAction from "../../components/QuickAction/QuickAction";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import "./ReportHistory.css";

const ReportHistory = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
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
  const reportsPerPage = 8;

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
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await getUserReports();
        const priorityMap = ["Low", "Medium", "High", "Critical"];
        const mapped = (response || []).map((report) => ({
          id: report.case_id,
          documentNumber: report.case_id,
          title: report.description || "Pothole Report",
          location:
            typeof report.location === "string"
              ? report.location
              : report.location?.address || "",
          district: report.district,
          submissionDate: report.date_created,
          lastUpdated: report.last_date_status_update,
          status: report.status,
          priority: priorityMap[report.priority] || "Low",
          severity: report.severity,
          description: report.description || "",
          similarReports: Array.isArray(report.similar_reports)
            ? report.similar_reports.length
            : report.similar_reports || 0,
          completionDate:
            report.status === "Completed"
              ? report.last_date_status_update
              : null,
        }));
        setReports(mapped);
        setFilteredReports(mapped);
      } catch (error) {
        toast.error("Failed to load reports");
        console.error("Error fetching reports:", error);
        setReports([]);
        setFilteredReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
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
        case "priority": {
          const priorityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
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
    try {
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
      a.download = `report-history-${
        new Date().toISOString().split("T")[0]
      }.csv`;
      a.click();

      toast.success("📥 Report exported successfully!", {
        position: "top-right",
        autoClose: 2000,
      });
    } catch (error) {
      console.error("Export to CSV failed:", error);
      toast.error("Failed to export report. Please try again.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  if (loading) {
    return (
      <div className="report-history">
        <div className="main-content">
          <LoadingSpinner size="large" message="Loading your reports..." />
        </div>
        <div className="sidebar-history">
          <QuickAction />
        </div>
      </div>
    );
  }

  return (
    <div className="report-history">
      {/* Left Side - Main Content */}
      <div className="main-content">
        {/* Header */}
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
                      {format(new Date(report.submissionDate), "MMM dd, yyyy")}
                      <small className="time-ago">
                        (
                        {formatDistanceToNow(new Date(report.submissionDate), {
                          addSuffix: true,
                        })}
                        )
                      </small>
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Last Updated:</span>
                    <span className="detail-value">
                      {format(new Date(report.lastUpdated), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Similar Reports:</span>
                    <span className="detail-value">
                      {report.similarReports}
                    </span>
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

      {/* Right Side - Quick Actions */}
      <div className="sidebar-history">
        <QuickAction />
      </div>
    </div>
  );
};

export default ReportHistory;
