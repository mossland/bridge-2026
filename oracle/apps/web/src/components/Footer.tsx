"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";

export function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>{t("footer.experimental")}</span>
          </div>
          <p className="text-sm text-gray-500">
            {t("footer.poweredBy")} · {t("footer.mossland")}
          </p>
        </div>
      </div>
    </footer>
  );
}



