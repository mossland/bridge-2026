"use client";

// Demo mode hooks - wallet functionality disabled

export function useMOCBalance() {
  return {
    balance: BigInt(1000000) * BigInt(10 ** 18), // Demo: 1M MOC
    isLoading: false,
    error: null,
  };
}

export function useMOCInfo() {
  return {
    name: "Mossland",
    symbol: "MOC",
    decimals: 18,
    totalSupply: BigInt(500000000) * BigInt(10 ** 18),
    isLoading: false,
    error: null,
  };
}

export function useVotingPower() {
  return {
    votingPower: BigInt(1000000) * BigInt(10 ** 18),
    formatted: "1,000,000",
  };
}

// Demo account hook
export function useAccount() {
  return {
    address: "0xDemo...User" as `0x${string}`,
    isConnected: true,
  };
}
