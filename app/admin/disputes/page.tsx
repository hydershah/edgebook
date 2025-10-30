"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import Modal from "@/components/admin/Modal";
import ToastNotification from "@/components/admin/ToastNotification";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

interface Toast {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

interface DisputeResolution {
  disputeId: string;
  correctResult: string;
  resolution: string;
  refund: boolean;
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("OPEN");
  const [resolveModal, setResolveModal] = useState<{
    isOpen: boolean;
    disputeId: string | null;
  }>({ isOpen: false, disputeId: null });
  const [resolutionData, setResolutionData] = useState<{
    correctResult: string;
    resolution: string;
    refund: boolean;
  }>({
    correctResult: "",
    resolution: "",
    refund: false,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const loadDisputes = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append("status", filter);

      const res = await fetch(`/api/admin/disputes?${params}`);
      const data = await res.json();
      setDisputes(data.disputes || []);
    } catch (error) {
      console.error("Error loading disputes:", error);
    }
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    loadDisputes();
  }, [loadDisputes]);

  const openResolveModal = (disputeId: string) => {
    setResolveModal({ isOpen: true, disputeId });
    setResolutionData({
      correctResult: "",
      resolution: "",
      refund: false,
    });
  };

  const closeResolveModal = () => {
    setResolveModal({ isOpen: false, disputeId: null });
    setResolutionData({
      correctResult: "",
      resolution: "",
      refund: false,
    });
    setActionLoading(false);
  };

  const handleResolve = async () => {
    if (!resolveModal.disputeId) return;

    if (!resolutionData.correctResult) {
      setToast({
        type: "error",
        message: "Please select a correct result",
      });
      return;
    }

    if (!resolutionData.resolution.trim()) {
      setToast({
        type: "error",
        message: "Please provide resolution notes",
      });
      return;
    }

    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/disputes/${resolveModal.disputeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correctResult: resolutionData.correctResult,
          resolution: resolutionData.resolution,
          refund: resolutionData.refund,
        }),
      });

      if (res.ok) {
        setToast({
          type: "success",
          message: "Dispute resolved successfully",
        });
        loadDisputes();
        closeResolveModal();
      } else {
        const error = await res.json();
        setToast({
          type: "error",
          message: error.error || "Failed to resolve dispute",
        });
      }
    } catch (error) {
      console.error("Error resolving dispute:", error);
      setToast({
        type: "error",
        message: "Failed to resolve dispute",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Dispute Management
        </h1>
        <p className="text-gray-600 mt-1">
          Handle pick result disputes
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {["OPEN", "INVESTIGATING", "RESOLVED", "REJECTED", "ESCALATED"].map(
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
                  {status}
                </button>
              )
            )}
          </nav>
        </div>
      </div>

      {/* Disputes Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Pick
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Current Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Reason
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
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
            ) : disputes.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No disputes found
                </td>
              </tr>
            ) : (
              disputes.map((dispute) => (
                <tr
                  key={dispute.id}
                  className="hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {dispute.pick?.matchup || "Unknown Pick"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {dispute.pick?.sport}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {dispute.user?.username || "Unknown"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={dispute.pick?.status} type="pick" />
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-900 max-w-xs truncate">
                      {dispute.reason}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={dispute.status} type="dispute" />
                  </td>
                  <td className="px-6 py-4">
                    {dispute.status === "OPEN" ||
                    dispute.status === "INVESTIGATING" ? (
                      <button
                        onClick={() => openResolveModal(dispute.id)}
                        className="text-primary hover:text-blue-900 text-sm font-medium transition-colors"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-sm text-gray-500">
                        {dispute.status === "RESOLVED" ? (
                          <CheckCircle className="h-5 w-5 text-green-600 inline" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-600 inline" />
                        )}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-900">
              Dispute Resolution Guide
            </h3>
            <p className="text-sm text-blue-700 mt-1">
              Review the pick details and evidence provided. Verify the game result
              from official sources. Update the pick status to the correct result
              (WON, LOST, or PUSH) and decide if refunds should be issued.
            </p>
          </div>
        </div>
      </div>

      {/* Resolve Dispute Modal */}
      <Modal
        isOpen={resolveModal.isOpen}
        onClose={closeResolveModal}
        title="Resolve Dispute"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Review the dispute details and provide the correct result. This action
            will update the pick status and notify all affected users.
          </p>

          {/* Correct Result */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correct Result <span className="text-red-500">*</span>
            </label>
            <select
              value={resolutionData.correctResult}
              onChange={(e) =>
                setResolutionData((prev) => ({
                  ...prev,
                  correctResult: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={actionLoading}
            >
              <option value="">Select correct result</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
              <option value="PUSH">PUSH</option>
            </select>
          </div>

          {/* Resolution Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resolution Notes <span className="text-red-500">*</span>
            </label>
            <textarea
              value={resolutionData.resolution}
              onChange={(e) =>
                setResolutionData((prev) => ({
                  ...prev,
                  resolution: e.target.value,
                }))
              }
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Explain the resolution and provide any relevant details or sources..."
              disabled={actionLoading}
            />
          </div>

          {/* Refund Option */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="refund"
              checked={resolutionData.refund}
              onChange={(e) =>
                setResolutionData((prev) => ({
                  ...prev,
                  refund: e.target.checked,
                }))
              }
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              disabled={actionLoading}
            />
            <label
              htmlFor="refund"
              className="text-sm font-medium text-gray-700"
            >
              Issue refunds to buyers
            </label>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 space-y-3 space-y-reverse sm:space-y-0 pt-4 border-t border-gray-200">
            <button
              onClick={closeResolveModal}
              disabled={actionLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              disabled={actionLoading}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {actionLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Resolving...
                </>
              ) : (
                "Resolve Dispute"
              )}
            </button>
          </div>
        </div>
      </Modal>

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
