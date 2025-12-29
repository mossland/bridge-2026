"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { cn } from "@/lib/utils";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { RealtimeIndicator } from "./RealtimeIndicator";
import {
  Activity,
  AlertTriangle,
  Vote,
  Users,
  BarChart3,
  Home,
} from "lucide-react";

const navigationKeys = [
  { key: "dashboard", href: "/", icon: Home },
  { key: "signals", href: "/signals", icon: Activity },
  { key: "issues", href: "/issues", icon: AlertTriangle },
  { key: "proposals", href: "/proposals", icon: Vote },
  { key: "delegation", href: "/delegation", icon: Users },
  { key: "outcomes", href: "/outcomes", icon: BarChart3 },
] as const;

export function Header() {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-moss-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="font-bold text-xl text-gray-900">BRIDGE 2026</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationKeys.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-moss-50 text-moss-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{t(item.key)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Realtime, Language & Wallet */}
          <div className="flex items-center space-x-3">
            <RealtimeIndicator />
            <LanguageSwitcher />
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus={{
                smallScreen: "avatar",
                largeScreen: "full",
              }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
