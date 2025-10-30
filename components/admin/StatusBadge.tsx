interface StatusBadgeProps {
  status: string;
  type?: "user" | "pick" | "report" | "payout" | "dispute";
}

const statusConfig: Record<string, Record<string, { label: string; color: string }>> = {
  user: {
    ACTIVE: { label: "Active", color: "bg-green-100 text-green-800" },
    SUSPENDED: { label: "Suspended", color: "bg-yellow-100 text-yellow-800" },
    BANNED: { label: "Banned", color: "bg-red-100 text-red-800" },
    UNDER_REVIEW: { label: "Under Review", color: "bg-purple-100 text-purple-800" },
    RESTRICTED: { label: "Restricted", color: "bg-orange-100 text-orange-800" },
  },
  pick: {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    WON: { label: "Won", color: "bg-green-100 text-green-800" },
    LOST: { label: "Lost", color: "bg-red-100 text-red-800" },
    PUSH: { label: "Push", color: "bg-gray-100 text-gray-800" },
    APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
    PENDING_REVIEW: { label: "Pending Review", color: "bg-yellow-100 text-yellow-800" },
    FLAGGED: { label: "Flagged", color: "bg-red-100 text-red-800" },
    REMOVED: { label: "Removed", color: "bg-gray-100 text-gray-800" },
    AUTO_FLAGGED: { label: "Auto Flagged", color: "bg-orange-100 text-orange-800" },
  },
  report: {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    UNDER_REVIEW: { label: "Under Review", color: "bg-blue-100 text-blue-800" },
    RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-800" },
    DISMISSED: { label: "Dismissed", color: "bg-gray-100 text-gray-800" },
  },
  payout: {
    PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    UNDER_REVIEW: { label: "Under Review", color: "bg-blue-100 text-blue-800" },
    APPROVED: { label: "Approved", color: "bg-green-100 text-green-800" },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
    PROCESSING: { label: "Processing", color: "bg-purple-100 text-purple-800" },
    PAID: { label: "Paid", color: "bg-green-100 text-green-800" },
    FAILED: { label: "Failed", color: "bg-red-100 text-red-800" },
  },
  dispute: {
    OPEN: { label: "Open", color: "bg-yellow-100 text-yellow-800" },
    INVESTIGATING: { label: "Investigating", color: "bg-blue-100 text-blue-800" },
    RESOLVED: { label: "Resolved", color: "bg-green-100 text-green-800" },
    REJECTED: { label: "Rejected", color: "bg-red-100 text-red-800" },
    ESCALATED: { label: "Escalated", color: "bg-purple-100 text-purple-800" },
  },
};

export default function StatusBadge({ status, type = "user" }: StatusBadgeProps) {
  const config = statusConfig[type]?.[status] || {
    label: status,
    color: "bg-gray-100 text-gray-800",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
    >
      {config.label}
    </span>
  );
}
