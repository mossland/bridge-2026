import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';

export default function RealityFeedPage() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-moss-600">Reality Feed</h1>
            <p className="text-gray-600 mt-2">
              실세계 신호를 실시간으로 모니터링합니다
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
            Reality Feed는 현재 개발 중입니다. 곧 신호 데이터를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    </main>
  );
}

