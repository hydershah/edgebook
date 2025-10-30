"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmModal from "@/components/admin/ConfirmModal";
import ToastNotification from "@/components/admin/ToastNotification";
import { AlertCircle, CheckCircle, X, Eye } from "lucide-react";

interface Toast {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export default function ModerationPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    reportId: string | null;
    action: "remove" | "dismiss" | null;
  }>({ isOpen: false, reportId: null, action: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append("status", filter);
      params.append("sortBy", "priority");

      const res = await fetch(`/api/admin/reports?${params}`);
      const data = await res.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error("Error loading reports:", error);
    }
    setLoading(false);
  };

  const openConfirmModal = (reportId: string, action: "remove" | "dismiss") => {
    setConfirmModal({ isOpen: true, reportId, action });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, reportId: null, action: null });
    setActionLoading(false);
  };

  const handleResolve = async () => {
    if (!confirmModal.reportId || !confirmModal.action) return;

    setActionLoading(true);

    try {
      const resolution =
        confirmModal.action === "dismiss"
          ? "Report dismissed - no violation found"
          : "Content removed for policy violation";

      const res = await fetch(
        `/api/admin/reports/${confirmModal.reportId}/resolve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            resolution,
            action:
              confirmModal.action === "dismiss" ? "dismiss" : "remove_content",
            notes: `Action taken by admin: ${confirmModal.action}`,
          }),
        }
      );

      if (res.ok) {
        setToast({
          type: "success",
          message: `Report ${confirmModal.action}ed successfully`,
        });
        loadReports();
        setSelectedReport(null);
        closeConfirmModal();
      } else {
        const error = await res.json();
        setToast({
          type: "error",
          message: error.error || "Failed to resolve report",
        });
      }
    } catch (error) {
      console.error(`Error resolving report:`, error);
      setToast({
        type: "error",
        message: "Failed to resolve report",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Moderation Queue
        </h1>
        <p className="text-gray-600 mt-1">
          Review and action reported content
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {["PENDING", "UNDER_REVIEW", "RESOLVED", "DISMISSED"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    filter === status
                      ? "border-blue-500 text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      {/* Reports List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Reports List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : reports.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                No reports found
              </p>
            </div>
          ) : (
            reports.map((report) => (
              <div
                key={report.id}
                className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedReport?.id === report.id
                    ? "ring-2 ring-blue-500"
                    : ""
                }`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <StatusBadge status={report.status} type="report" />
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded ${
                          report.priority === "CRITICAL"
                            ? "bg-red-100 text-red-800"
                            : report.priority === "HIGH"
                            ? "bg-orange-100 text-orange-800"
                            : report.priority === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {report.targetType}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      {report.reason.replace("_", " ")}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">
                      {report.description || "No description provided"}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span>
                        Reported by: {report.reporter?.username || "Unknown"}
                      </span>
                      <span>
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Report Details Panel */}
        <div className="lg:col-span-1">
          {selectedReport ? (
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Report Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Reason
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedReport.reason.replace("_", " ")}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Description
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedReport.description || "No description"}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Target
                  </label>
                  <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">
                      {selectedReport.targetType}
                    </p>
                    {selectedReport.target && (
                      <p className="text-sm text-gray-900">
                        {selectedReport.target.matchup ||
                          selectedReport.target.content ||
                          selectedReport.target.username ||
                          "Target content"}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Reporter
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedReport.reporter?.username || "Unknown"}
                    <br />
                    <span className="text-xs text-gray-500">
                      {selectedReport.reporter?.email}
                    </span>
                  </p>
                </div>

                {selectedReport.status === "PENDING" && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() =>
                        openConfirmModal(selectedReport.id, "remove")
                      }
                      className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Remove Content</span>
                    </button>
                    <button
                      onClick={() =>
                        openConfirmModal(selectedReport.id, "dismiss")
                      }
                      className="w-full py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Dismiss Report</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center text-gray-500">
                Select a report to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      {confirmModal.action && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleResolve}
          title={
            confirmModal.action === "remove"
              ? "Remove Content?"
              : "Dismiss Report?"
          }
          message={
            confirmModal.action === "remove"
              ? "This will remove the reported content and mark the report as resolved. This action cannot be undone."
              : "This will dismiss the report without taking any action. The report will be marked as dismissed."
          }
          confirmText={
            confirmModal.action === "remove" ? "Remove Content" : "Dismiss"
          }
          variant={confirmModal.action === "remove" ? "danger" : "info"}
          isLoading={actionLoading}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
