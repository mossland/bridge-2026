"use client";

import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { MOC_TOKEN_ADDRESS, MOC_TOKEN_ABI } from "@/lib/config";

export function useMOCBalance() {
  const { address } = useAccount();

  const { data, isLoading, error } = useReadContract({
    address: MOC_TOKEN_ADDRESS,
    abi: MOC_TOKEN_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: {
      enabled: !!address,
    },
  });

  return {
    balance: data as bigint | undefined,
    isLoading,
    error,
  };
}

export function useMOCInfo() {
  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: MOC_TOKEN_ADDRESS,
        abi: MOC_TOKEN_ABI,
        functionName: "name",
      },
      {
        address: MOC_TOKEN_ADDRESS,
        abi: MOC_TOKEN_ABI,
        functionName: "symbol",
      },
      {
        address: MOC_TOKEN_ADDRESS,
        abi: MOC_TOKEN_ABI,
        functionName: "decimals",
      },
      {
        address: MOC_TOKEN_ADDRESS,
        abi: MOC_TOKEN_ABI,
        functionName: "totalSupply",
      },
    ],
  });

  return {
    name: data?.[0]?.result as string | undefined,
    symbol: data?.[1]?.result as string | undefined,
    decimals: data?.[2]?.result as number | undefined,
    totalSupply: data?.[3]?.result as bigint | undefined,
    isLoading,
    error,
  };
}

export function useVotingPower() {
  const { balance } = useMOCBalance();
  const { decimals } = useMOCInfo();

  if (!balance || !decimals) {
    return { votingPower: 0n, formatted: "0" };
  }

  // Voting power = MOC balance (1 MOC = 1 vote)
  return {
    votingPower: balance,
    formatted: (Number(balance) / 10 ** decimals).toFixed(2),
  };
}
