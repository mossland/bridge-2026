/**
 * Blockchain Utilities
 * 
 * 블록체인 상호작용을 위한 유틸리티 함수들입니다.
 */

import { parseEther, formatEther } from 'viem';
import { MOSS_COIN_ADDRESS } from '@/config/contracts';

/**
 * Moss Coin 잔액을 조회합니다.
 */
export async function getMossCoinBalance(
  address: string,
  publicClient: any
): Promise<number> {
  try {
    const balance = await publicClient.readContract({
      address: MOSS_COIN_ADDRESS as `0x${string}`,
      abi: [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'owner', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
        },
      ],
      functionName: 'balanceOf',
      args: [address as `0x${string}`],
    });

    return parseFloat(formatEther(balance as bigint));
  } catch (error) {
    console.error('Error getting Moss Coin balance:', error);
    return 0;
  }
}

/**
 * 투표 트랜잭션을 서명하고 전송합니다.
 */
export async function castVoteTransaction(
  proposalId: string,
  choice: 'yes' | 'no' | 'abstain',
  walletClient: any,
  account: `0x${string}`
): Promise<`0x${string}`> {
  // TODO: 실제 투표 컨트랙트 주소 및 ABI 사용
  // 현재는 예시로 BridgeLog 컨트랙트에 이벤트를 기록하는 방식
  
  // 실제로는 거버넌스 컨트랙트의 vote 함수를 호출해야 합니다
  // 예시:
  // const hash = await walletClient.writeContract({
  //   address: GOVERNANCE_CONTRACT_ADDRESS,
  //   abi: GOVERNANCE_ABI,
  //   functionName: 'vote',
  //   args: [proposalId, choice === 'yes' ? 1 : choice === 'no' ? 0 : 2],
  //   account,
  // });

  // TODO: 실제 거버넌스 컨트랙트의 vote 함수 호출
  // 현재는 투표를 API에만 기록하고, 추후 컨트랙트가 배포되면 연동
  
  // 임시: 투표 데이터를 서명하여 검증 가능하게 만들기
  // 실제로는 거버넌스 컨트랙트가 배포되면 아래와 같이 호출:
  // const hash = await walletClient.writeContract({
  //   address: GOVERNANCE_CONTRACT_ADDRESS,
  //   abi: GOVERNANCE_ABI,
  //   functionName: 'vote',
  //   args: [proposalId, choice === 'yes' ? 1 : choice === 'no' ? 0 : 2],
  //   account,
  // });

  // 현재는 빈 해시 반환 (API에서만 기록)
  throw new Error('Governance contract not deployed yet. Voting is recorded via API only.');
}

/**
 * 트랜잭션 영수증을 기다립니다.
 */
export async function waitForTransaction(
  hash: `0x${string}`,
  publicClient: any
): Promise<any> {
  return publicClient.waitForTransactionReceipt({ hash });
}

