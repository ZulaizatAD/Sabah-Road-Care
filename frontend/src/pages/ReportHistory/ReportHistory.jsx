import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { formatDistanceToNow, format } from "date-fns";
import { getUserReports } from "../../services/history";
import QuickAction from "../../components/QuickAction/QuickAction";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import "./ReportHistory.css";

const ReportHistory = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "all",
    district: "all",
    severity: "all",
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
  const severities = ["Low", "Medium", "High", "Critical"];

  // Fetch reports from backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const data = await getUserReports();
        setReports(data || []);
      } catch (error) {
        toast.error("Failed to load reports");
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Apply filters + search + sorting
  const filteredReports = reports
    .filter((report) => {
      const matchesSearch =
        report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.district?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filters.status === "all" || report.status === filters.status;
      const matchesDistrict =
        filters.district === "all" || report.district === filters.district;
      const matchesSeverity =
        filters.severity === "all" || report.severity === filters.severity;

      return (
        matchesSearch && matchesStatus && matchesDistrict && matchesSeverity
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date_created) - new Date(a.date_created);
        case "date-asc":
          return new Date(a.date_created) - new Date(b.date_created);
        case "severity":
          const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 };
          return severityOrder[b.severity] - severityOrder[a.severity];
        case "status":
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

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

  const getSeverityColor = (severity) => {
    switch (severity) {
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

        {/* Controls */}
        <div className="controls-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search reports..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
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
              value={filters.severity}
              onChange={(e) => handleFilterChange("severity", e.target.value)}
            >
              <option value="all">All Severity</option>
              {severities.map((severity) => (
                <option key={severity} value={severity}>
                  {severity}
                </option>
              ))}
            </select>

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Latest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="severity">Severity</option>
              <option value="status">Status</option>
            </select>
          </div>
        </div>

        {/* Reports */}
        <div className={`reports-container ${viewMode}`}>
          {currentReports.map((report) => (
            <div key={report.case_id} className="report-card">
              <div className="history-card-header">
                <div className="report-number">#{report.case_id}</div>
                <div className="report-badges">
                  <span
                    className={`status-badge ${getStatusColor(report.status)}`}
                  >
                    {report.status}
                  </span>
                  <span
                    className={`severity-badge ${getSeverityColor(
                      report.severity
                    )}`}
                  >
                    {report.severity}
                  </span>
                </div>
              </div>

              <div className="report-content">
                <h3 className="report-title">District: {report.district}</h3>
                <p className="report-description">{report.description}</p>

                <div className="report-details">
                  <div className="detail-item">
                    <span className="detail-label">Submitted:</span>
                    <span className="detail-value">
                      {format(new Date(report.date_created), "MMM dd, yyyy")} (
                      {formatDistanceToNow(new Date(report.date_created), {
                        addSuffix: true,
                      })}
                      )
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReports.length === 0 && (
          <div className="empty-state">
            <h3>No reports found</h3>
            <button
              className="create-report-btn"
              onClick={() => navigate("/report")}
            >
              Create Your First Report
            </button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              ← Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index + 1}
                className={currentPage === index + 1 ? "active" : ""}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </button>
            ))}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next →
            </button>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="sidebar-history">
        <QuickAction />
      </div>
    </div>
  );
};

export default ReportHistory;
