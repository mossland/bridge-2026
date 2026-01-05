"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, X } from "lucide-react";

export function ExperimentalBanner() {
  const t = useTranslations("experimental");
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-red-50 border-b-2 border-amber-400 sticky top-0 z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 animate-pulse" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-semibold text-amber-900">
                {t("banner.title")}
              </p>
              <p className="text-xs sm:text-sm text-amber-800 mt-0.5 line-clamp-1">
                {t("banner.subtitle")}
              </p>
            </div>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="ml-3 flex-shrink-0 p-1.5 rounded-lg hover:bg-amber-100 transition-colors"
            aria-label={t("banner.dismiss")}
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700" />
          </button>
        </div>
      </div>
    </div>
  );
}



