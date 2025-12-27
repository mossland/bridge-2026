"use client";

import { useAccount } from "wagmi";
import { useMOCBalance, useMOCInfo, useVotingPower } from "@/hooks/useMOC";
import { formatMOC, formatNumber } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  Vote,
  CheckCircle,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  href,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend?: string;
  href?: string;
}) {
  const content = (
    <div className="card hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
          {trend && (
            <p className="mt-1 text-sm text-moss-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-1" />
              {trend}
            </p>
          )}
        </div>
        <div className="p-3 bg-moss-50 rounded-lg">
          <Icon className="w-6 h-6 text-moss-600" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function WalletInfo() {
  const { address, isConnected } = useAccount();
  const { balance, isLoading: balanceLoading } = useMOCBalance();
  const { decimals } = useMOCInfo();
  const { formatted: votingPower } = useVotingPower();

  if (!isConnected) {
    return (
      <div className="card bg-gradient-to-r from-moss-600 to-moss-700 text-white">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">지갑을 연결하세요</h3>
            <p className="text-moss-100">
              MOC 토큰으로 거버넌스에 참여할 수 있습니다
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-r from-moss-600 to-moss-700 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-lg">
            <Wallet className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">My Voting Power</h3>
            <p className="text-2xl font-bold mt-1">
              {balanceLoading
                ? "Loading..."
                : balance && decimals
                  ? formatMOC(balance, decimals)
                  : "0 MOC"}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-moss-100">투표권</p>
          <p className="text-xl font-semibold">{votingPower} votes</p>
        </div>
      </div>
    </div>
  );
}

function RecentActivity() {
  // Mock data - in production, this would come from the API
  const activities = [
    {
      id: 1,
      type: "signal",
      title: "참여율 이상 감지",
      time: "5분 전",
      severity: "high",
    },
    {
      id: 2,
      type: "proposal",
      title: "커뮤니티 이벤트 예산 승인",
      time: "1시간 전",
      status: "passed",
    },
    {
      id: 3,
      type: "issue",
      title: "가스비 최적화 필요",
      time: "3시간 전",
      severity: "medium",
    },
    {
      id: 4,
      type: "outcome",
      title: "Q4 마케팅 캠페인 KPI 달성",
      time: "1일 전",
      success: true,
    },
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">최근 활동</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-center space-x-3">
              {activity.type === "signal" && (
                <Activity className="w-5 h-5 text-blue-500" />
              )}
              {activity.type === "proposal" && (
                <Vote className="w-5 h-5 text-purple-500" />
              )}
              {activity.type === "issue" && (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              )}
              {activity.type === "outcome" && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </div>
            {activity.severity && (
              <span
                className={`badge ${
                  activity.severity === "high"
                    ? "bg-red-50 text-red-700"
                    : "bg-yellow-50 text-yellow-700"
                }`}
              >
                {activity.severity}
              </span>
            )}
            {activity.status && (
              <span className="badge bg-green-50 text-green-700">
                {activity.status}
              </span>
            )}
            {activity.success !== undefined && (
              <span className="badge bg-green-50 text-green-700">성공</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-gray-500">
          BRIDGE 2026 거버넌스 현황을 한눈에 확인하세요
        </p>
      </div>

      {/* Wallet Info */}
      <WalletInfo />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Signals"
          value={128}
          icon={Activity}
          trend="+12 today"
          href="/signals"
        />
        <StatCard
          title="Open Issues"
          value={5}
          icon={AlertTriangle}
          trend="2 urgent"
          href="/issues"
        />
        <StatCard
          title="Active Proposals"
          value={3}
          icon={Vote}
          trend="1 ending soon"
          href="/proposals"
        />
        <StatCard
          title="Delegators"
          value={47}
          icon={Users}
          href="/delegation"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />

        {/* Quick Actions */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            빠른 실행
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/signals" className="btn-secondary text-center">
              신호 확인
            </Link>
            <Link href="/issues" className="btn-secondary text-center">
              이슈 탐색
            </Link>
            <Link href="/proposals" className="btn-primary text-center">
              제안 투표
            </Link>
            <Link href="/delegation" className="btn-secondary text-center">
              위임 설정
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
