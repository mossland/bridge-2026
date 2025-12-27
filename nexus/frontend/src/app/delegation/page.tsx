import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function DelegationPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-moss-600">Delegation</h1>
            <p className="text-gray-600 mt-2">
              정책 기반 위임으로 에이전트에게 투표 권한을 위임하세요
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
            Delegation Console은 현재 개발 중입니다. 곧 위임 정책을 설정할 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}

