"use client";

import { useEffect, useState, useCallback } from "react";
import StatusBadge from "@/components/admin/StatusBadge";
import ActionModal from "@/components/admin/ActionModal";
import ToastNotification from "@/components/admin/ToastNotification";
import { Search, Filter, Ban, AlertTriangle, Mail, Trash2, ShieldCheck, CheckCircle } from "lucide-react";
import Link from "next/link";
import ConfirmModal from "@/components/admin/ConfirmModal";

type ActionType = "warn" | "suspend" | "ban" | "delete" | "unban" | "unsuspend" | null;

interface Toast {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [actionModal, setActionModal] = useState<{
    isOpen: boolean;
    userId: string | null;
    action: ActionType;
  }>({ isOpen: false, userId: null, action: null });
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: string | null;
  }>({ isOpen: false, userId: null });
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (roleFilter) params.append("role", roleFilter);
      if (searchTerm) params.append("search", searchTerm);

      const res = await fetch(`/api/admin/users?${params}`);
      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
    }
    setLoading(false);
  }, [statusFilter, roleFilter, searchTerm]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const openActionModal = (userId: string, action: ActionType) => {
    if (action === "delete") {
      setConfirmModal({ isOpen: true, userId });
    } else {
      setActionModal({ isOpen: true, userId, action });
    }
  };

  const closeActionModal = () => {
    setActionModal({ isOpen: false, userId: null, action: null });
    setActionLoading(false);
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, userId: null });
    setActionLoading(false);
  };

  const handleAction = async (data: {
    reason: string;
    duration?: number;
    notes?: string;
  }) => {
    if (!actionModal.userId || !actionModal.action) return;

    setActionLoading(true);

    try {
      // Unban and unsuspend use DELETE, others use POST
      const isUndoAction = actionModal.action === "unban" || actionModal.action === "unsuspend";
      const endpoint = isUndoAction
        ? actionModal.action === "unban" ? "ban" : "suspend"
        : actionModal.action;

      const res = await fetch(
        `/api/admin/users/${actionModal.userId}/${endpoint}`,
        {
          method: isUndoAction ? "DELETE" : "POST",
          headers: isUndoAction ? {} : { "Content-Type": "application/json" },
          body: isUndoAction ? undefined : JSON.stringify({
            reason: data.reason,
            duration: data.duration || 7,
            notes: data.notes,
          }),
        }
      );

      if (res.ok) {
        setToast({
          type: "success",
          message: `User ${actionModal.action}ed successfully`,
        });
        loadUsers();
        closeActionModal();
      } else {
        const error = await res.json();
        setToast({
          type: "error",
          message: error.error || `Failed to ${actionModal.action} user`,
        });
      }
    } catch (error) {
      console.error(`Error ${actionModal.action}ing user:`, error);
      setToast({
        type: "error",
        message: `Failed to ${actionModal.action} user`,
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmModal.userId) return;

    setActionLoading(true);

    try {
      const res = await fetch(`/api/admin/users/${confirmModal.userId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setToast({
          type: "success",
          message: "User deleted successfully",
        });
        loadUsers();
        closeConfirmModal();
      } else {
        const error = await res.json();
        setToast({
          type: "error",
          message: error.error || "Failed to delete user",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setToast({
        type: "error",
        message: "Failed to delete user",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            User Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage users, roles, and permissions
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by email, username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
              />
            </div>
          </form>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="BANNED">Banned</option>
            <option value="UNDER_REVIEW">Under Review</option>
          </select>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
          >
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="ADMIN">Admin</option>
            <option value="MODERATOR">Moderator</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trust Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Warnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">
                              {user.username?.[0]?.toUpperCase() || "U"}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <Link
                            href={`/admin/users/${user.id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                          >
                            {user.username || "No username"}
                          </Link>
                          <div className="text-sm text-gray-500">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={user.accountStatus} type="user" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`text-sm font-medium ${
                            user.trustScore >= 70
                              ? "text-green-600"
                              : user.trustScore >= 40
                              ? "text-yellow-600"
                              : "text-red-600"
                          }`}
                        >
                          {user.trustScore}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {user.warningCount}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {/* Warn button - always show */}
                        <button
                          onClick={() => openActionModal(user.id, "warn")}
                          className="text-yellow-600 hover:text-yellow-900 transition-colors"
                          title="Warn User"
                        >
                          <AlertTriangle className="h-5 w-5" />
                        </button>

                        {/* Suspend/Unsuspend toggle */}
                        {user.accountStatus === "SUSPENDED" ? (
                          <button
                            onClick={() => openActionModal(user.id, "unsuspend")}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Unsuspend User"
                          >
                            <CheckCircle className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openActionModal(user.id, "suspend")}
                            className="text-orange-600 hover:text-orange-900 transition-colors"
                            title="Suspend User"
                          >
                            <Mail className="h-5 w-5" />
                          </button>
                        )}

                        {/* Ban/Unban toggle */}
                        {user.accountStatus === "BANNED" ? (
                          <button
                            onClick={() => openActionModal(user.id, "unban")}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Unban User"
                          >
                            <ShieldCheck className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => openActionModal(user.id, "ban")}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Ban User"
                          >
                            <Ban className="h-5 w-5" />
                          </button>
                        )}

                        {/* Delete button - always show */}
                        <button
                          onClick={() => openActionModal(user.id, "delete")}
                          className="text-red-700 hover:text-red-900 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Modal */}
      {actionModal.action && actionModal.action !== "delete" && (
        <ActionModal
          isOpen={actionModal.isOpen}
          onClose={closeActionModal}
          onConfirm={handleAction}
          title={`${actionModal.action.charAt(0).toUpperCase() + actionModal.action.slice(1)} User`}
          description={
            actionModal.action === "unban" || actionModal.action === "unsuspend"
              ? `Are you sure you want to ${actionModal.action} this user? This will restore their account access.`
              : `Provide a reason for ${actionModal.action}ing this user. This action will be logged in the audit system.`
          }
          requireReason={actionModal.action !== "unban" && actionModal.action !== "unsuspend"}
          requireDuration={actionModal.action === "suspend"}
          requireNotes={actionModal.action !== "unban" && actionModal.action !== "unsuspend"}
          confirmText={
            actionModal.action === "ban" ? "Ban User" :
            actionModal.action === "unban" ? "Unban User" :
            actionModal.action === "suspend" ? "Suspend User" :
            actionModal.action === "unsuspend" ? "Unsuspend User" :
            "Warn User"
          }
          variant={
            actionModal.action === "ban" ? "danger" :
            actionModal.action === "unban" || actionModal.action === "unsuspend" ? "success" :
            "warning"
          }
          isLoading={actionLoading}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={handleDelete}
        title="Delete User"
        message="Are you sure you want to permanently delete this user? This action cannot be undone and will remove all their data including picks, comments, and transactions."
        confirmText="Delete User"
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
