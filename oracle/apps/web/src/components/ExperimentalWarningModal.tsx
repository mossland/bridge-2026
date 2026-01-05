"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";

export function ExperimentalWarningModal() {
  const t = useTranslations("experimental");
  const [isOpen, setIsOpen] = useState(false);
  const [hasSeen, setHasSeen] = useState(false);

  useEffect(() => {
    // localStorage에서 확인
    const seen = localStorage.getItem("experimental-warning-seen");
    if (!seen) {
      setIsOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("experimental-warning-seen", "true");
    setHasSeen(true);
    setIsOpen(false);
  };

  if (!isOpen || hasSeen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">
                {t("modal.title")}
              </h2>
            </div>
            <button
              onClick={handleAccept}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded">
            <p className="text-sm text-amber-900 font-medium">
              {t("modal.intro")}
            </p>
          </div>

          <div className="space-y-3">
            <WarningItem
              icon="⚠️"
              title={t("modal.warnings.service.title")}
              description={t("modal.warnings.service.description")}
            />
            <WarningItem
              icon="🗑️"
              title={t("modal.warnings.data.title")}
              description={t("modal.warnings.data.description")}
            />
            <WarningItem
              icon="⚖️"
              title={t("modal.warnings.governance.title")}
              description={t("modal.warnings.governance.description")}
            />
            <WarningItem
              icon="📋"
              title={t("modal.warnings.decisions.title")}
              description={t("modal.warnings.decisions.description")}
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-600">
              {t("modal.footer")}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={handleAccept}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t("modal.accept")}
          </button>
        </div>
      </div>
    </div>
  );
}

function WarningItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start space-x-3">
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}



