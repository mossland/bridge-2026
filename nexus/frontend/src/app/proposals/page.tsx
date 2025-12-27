import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function ProposalsPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-moss-600">Proposals</h1>
            <p className="text-gray-600 mt-2">
              AI Assisted Proposal을 검토하고 투표하세요
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-moss-600 hover:text-moss-700"
            >
              ← 홈
            </Link>
            <ConnectButton />
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-600">
            Proposals는 현재 개발 중입니다. 곧 제안 목록과 투표 기능을 사용할 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}

