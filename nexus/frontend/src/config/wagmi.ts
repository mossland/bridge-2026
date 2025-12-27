import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, sepolia, goerli } from 'wagmi/chains';

// Moss Coin Contract Address
export const MOSS_COIN_ADDRESS = '0x8bbfe65e31b348cd823c62e02ad8c19a84d' as const;

export const config = getDefaultConfig({
  appName: 'BRIDGE 2026 — Moss Coin DAO',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
  chains: [mainnet, sepolia, goerli],
  ssr: true,
});

