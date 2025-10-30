"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmModal from "@/components/admin/ConfirmModal";
import ToastNotification from "@/components/admin/ToastNotification";
import { Trash2 } from "lucide-react";

interface Toast {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export default function PicksManagementPage() {
  const [picks, setPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    pickId: string | null;
  }>({ isOpen: false, pickId: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const loadPicks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append("moderationStatus", filter);

      const res = await fetch(`/api/admin/picks?${params}`);
      const data = await res.json();
      setPicks(data.picks || []);
    } catch (error) {
      console.error("Error loading picks:", error);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadPicks();
  }, [loadPicks]);

  const openConfirmModal = (pickId: string) => {
    setConfirmModal({ isOpen: true, pickId });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, pickId: null });
    setActionLoading(false);
  };

  const handleDelete = async () => {
    if (!confirmModal.pickId) return;

    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/picks/${confirmModal.pickId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setToast({
          type: "success",
          message: "Pick deleted successfully",
        });
        loadPicks();
        closeConfirmModal();
      } else {
        const error = await res.json();
        setToast({
          type: "error",
          message: error.error || "Failed to delete pick",
        });
      }
    } catch (error) {
      console.error("Error deleting pick:", error);
      setToast({
        type: "error",
        message: "Failed to delete pick",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Picks Management
        </h1>
        <p className="text-gray-600 mt-1">
          View and manage picks (all picks are auto-approved)
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="">All Picks</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="FLAGGED">Flagged</option>
            <option value="AUTO_FLAGGED">Auto Flagged</option>
            <option value="APPROVED">Approved</option>
            <option value="REMOVED">Removed</option>
          </select>
        </div>
      </div>

      {/* Picks Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pick
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Creator
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Moderation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reports
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
            ) : picks.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No picks found
                </td>
              </tr>
            ) : (
              picks.map((pick) => (
                <tr key={pick.id} className="hover:bg-gray-50/50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {pick.matchup}
                      </div>
                      <div className="text-xs text-gray-500">
                        {pick.sport} • {pick.pickType}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {pick.user?.username || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={pick.status} type="pick" />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={pick.moderationStatus} type="pick" />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        pick.reportCount > 0 ? "text-red-600" : "text-gray-500"
                      }`}
                    >
                      {pick.reportCount}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openConfirmModal(pick.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete Pick"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
        title="Delete Pick?"
        message="This will permanently delete the pick from the platform. This action cannot be undone."
        confirmText="Delete Pick"
        variant="danger"
        isLoading={actionLoading}
      />

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
