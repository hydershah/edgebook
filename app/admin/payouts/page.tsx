"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import ConfirmModal from "@/components/admin/ConfirmModal";
import InputModal from "@/components/admin/InputModal";
import ToastNotification from "@/components/admin/ToastNotification";
import { DollarSign, Check, X, Eye } from "lucide-react";

interface Toast {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING");
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    payoutId: string | null;
    action: "approve" | "reject" | null;
  }>({ isOpen: false, payoutId: null, action: null });
  const [inputModal, setInputModal] = useState<{
    isOpen: boolean;
    payoutId: string | null;
  }>({ isOpen: false, payoutId: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  useEffect(() => {
    loadPayouts();
  }, [filter]);

  const loadPayouts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter) params.append("status", filter);

      const res = await fetch(`/api/admin/payouts?${params}`);
      const data = await res.json();
      setPayouts(data.payouts || []);
    } catch (error) {
      console.error("Error loading payouts:", error);
    }
    setLoading(false);
  };

  const openConfirmModal = (payoutId: string, action: "approve" | "reject") => {
    if (action === "reject") {
      setInputModal({ isOpen: true, payoutId });
    } else {
      setConfirmModal({ isOpen: true, payoutId, action });
    }
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, payoutId: null, action: null });
    setActionLoading(false);
  };

  const closeInputModal = () => {
    setInputModal({ isOpen: false, payoutId: null });
    setActionLoading(false);
  };

  const handleApprove = async () => {
    if (!confirmModal.payoutId) return;

    setActionLoading(true);

    try {
      const res = await fetch(
        `/api/admin/payouts/${confirmModal.payoutId}?action=approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        }
      );

      if (res.ok) {
        setToast({
          type: "success",
          message: "Payout approved successfully",
        });
        loadPayouts();
        setSelectedPayout(null);
        closeConfirmModal();
      } else {
        const error = await res.json();
        setToast({
          type: "error",
          message: error.error || "Failed to approve payout",
        });
      }
    } catch (error) {
      console.error("Error approving payout:", error);
      setToast({
        type: "error",
        message: "Failed to approve payout",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    if (!inputModal.payoutId) return;

    setActionLoading(true);

    try {
      const res = await fetch(
        `/api/admin/payouts/${inputModal.payoutId}?action=reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reason }),
        }
      );

      if (res.ok) {
        setToast({
          type: "success",
          message: "Payout rejected successfully",
        });
        loadPayouts();
        setSelectedPayout(null);
        closeInputModal();
      } else {
        const error = await res.json();
        setToast({
          type: "error",
          message: error.error || "Failed to reject payout",
        });
      }
    } catch (error) {
      console.error("Error rejecting payout:", error);
      setToast({
        type: "error",
        message: "Failed to reject payout",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Payout Management
        </h1>
        <p className="text-gray-600 mt-1">
          Review and approve creator payouts
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {["PENDING", "UNDER_REVIEW", "APPROVED", "REJECTED", "PAID"].map(
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

      {/* Payouts List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* List */}
        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : payouts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No payouts found</p>
            </div>
          ) : (
            payouts.map((payout) => (
              <div
                key={payout.id}
                className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${
                  selectedPayout?.id === payout.id ? "ring-2 ring-blue-500" : ""
                }`}
                onClick={() => setSelectedPayout(payout)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {payout.user?.username || "Unknown User"}
                      </h3>
                      <StatusBadge status={payout.status} type="payout" />
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {payout.user?.email}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">
                          Period
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {payout.period}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Picks Sold
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {payout.picksSold}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Total Revenue
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          ${payout.totalRevenue.toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">
                          Net Amount
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          ${payout.netAmount.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Eye className="h-5 w-5 text-gray-400 ml-4" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Detail Panel */}
        <div className="lg:col-span-1">
          {selectedPayout ? (
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payout Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Creator
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPayout.user?.username}
                    <br />
                    <span className="text-xs text-gray-500">
                      {selectedPayout.user?.email}
                    </span>
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Earnings Breakdown
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Total Revenue
                      </span>
                      <span className="font-medium text-gray-900">
                        ${selectedPayout.totalRevenue.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        Platform Fee
                      </span>
                      <span className="font-medium text-red-600">
                        -${selectedPayout.platformFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="font-semibold text-gray-900">
                        Net Payout
                      </span>
                      <span className="font-bold text-green-600">
                        ${selectedPayout.netAmount.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Period
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPayout.period}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Picks Sold
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedPayout.picksSold}
                  </p>
                </div>

                {selectedPayout.status === "PENDING" ||
                selectedPayout.status === "UNDER_REVIEW" ? (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => openConfirmModal(selectedPayout.id, "approve")}
                      className="w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Check className="h-4 w-4" />
                      <span>Approve Payout</span>
                    </button>
                    <button
                      onClick={() => openConfirmModal(selectedPayout.id, "reject")}
                      className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Reject Payout</span>
                    </button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-gray-200">
                    <StatusBadge status={selectedPayout.status} type="payout" />
                    {selectedPayout.reviewNotes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {selectedPayout.reviewNotes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-center text-gray-500">
                Select a payout to view details
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Approve Confirm Modal */}
      {confirmModal.action === "approve" && (
        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleApprove}
          title="Approve Payout?"
          message="This will approve the payout and mark it for processing. The creator will be notified."
          confirmText="Approve Payout"
          variant="success"
          isLoading={actionLoading}
        />
      )}

      {/* Reject Input Modal */}
      <InputModal
        isOpen={inputModal.isOpen}
        onClose={closeInputModal}
        onConfirm={handleReject}
        title="Reject Payout"
        description="Please provide a reason for rejecting this payout. The creator will be notified with this reason."
        placeholder="Enter rejection reason..."
        confirmText="Reject Payout"
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
