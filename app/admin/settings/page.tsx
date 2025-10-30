"use client";

import { useState } from "react";
import ToastNotification from "@/components/admin/ToastNotification";
import { Save, AlertCircle } from "lucide-react";

interface Toast {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    platformFee: 15,
    minPickPrice: 5,
    maxPickPrice: 500,
    maintenanceMode: false,
    allowNewRegistrations: true,
    requireEmailVerification: true,
    minTrustScoreForPremium: 70,
    autoFlagThreshold: 3,
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: Implement settings save API
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setToast({
        type: "success",
        message: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      setToast({
        type: "error",
        message: "Failed to save settings",
      });
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Platform Settings
        </h1>
        <p className="text-gray-600 mt-1">
          Configure platform-wide settings and features
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-900">
              Caution
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              Changes to these settings will affect all users and the entire
              platform. Please be careful when making modifications.
            </p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Financial Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Financial Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Platform Fee (%)
              </label>
              <input
                type="number"
                value={settings.platformFee}
                onChange={(e) =>
                  setSettings({ ...settings, platformFee: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentage fee charged on each pick purchase
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Pick Price ($)
              </label>
              <input
                type="number"
                value={settings.minPickPrice}
                onChange={(e) =>
                  setSettings({ ...settings, minPickPrice: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Pick Price ($)
              </label>
              <input
                type="number"
                value={settings.maxPickPrice}
                onChange={(e) =>
                  setSettings({ ...settings, maxPickPrice: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                min="1"
              />
            </div>
          </div>
        </div>

        {/* User Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            User Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Allow New Registrations
                </label>
                <p className="text-xs text-gray-500">
                  Users can create new accounts
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowNewRegistrations}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    allowNewRegistrations: e.target.checked,
                  })
                }
                className="h-5 w-5 text-primary rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Require Email Verification
                </label>
                <p className="text-xs text-gray-500">
                  Users must verify email before posting
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireEmailVerification}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    requireEmailVerification: e.target.checked,
                  })
                }
                className="h-5 w-5 text-primary rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Trust Score for Premium
              </label>
              <input
                type="number"
                value={settings.minTrustScoreForPremium}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    minTrustScoreForPremium: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                min="0"
                max="100"
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum trust score required to sell premium picks
              </p>
            </div>
          </div>
        </div>

        {/* Moderation Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Moderation Settings
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Auto-Flag Threshold
              </label>
              <input
                type="number"
                value={settings.autoFlagThreshold}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    autoFlagThreshold: Number(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
                min="1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Number of reports before content is auto-flagged
              </p>
            </div>
          </div>
        </div>

        {/* System Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            System Settings
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Maintenance Mode
                </label>
                <p className="text-xs text-gray-500">
                  Disable access for non-admin users
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    maintenanceMode: e.target.checked,
                  })
                }
                className="h-5 w-5 text-primary rounded"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors flex items-center space-x-2 disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          <span>{saving ? "Saving..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Note */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Settings API implementation is pending. This UI
          demonstrates the intended functionality. Connect to{" "}
          <code className="bg-gray-200 px-1 rounded">
            /api/admin/settings
          </code>{" "}
          endpoint when ready.
        </p>
      </div>

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
