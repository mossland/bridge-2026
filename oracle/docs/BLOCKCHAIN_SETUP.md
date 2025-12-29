# BRIDGE 2026 블록체인 연동 가이드

이 문서는 BRIDGE 2026 Oracle의 블록체인 연동 설정 방법을 설명합니다.

---

## 목차

1. [사전 요구사항](#1-사전-요구사항)
2. [MOC 토큰 서비스 활성화](#2-moc-토큰-서비스-활성화)
3. [스마트 컨트랙트 배포](#3-스마트-컨트랙트-배포)
4. [온체인 거버넌스 활성화](#4-온체인-거버넌스-활성화)
5. [환경 변수 전체 설정](#5-환경-변수-전체-설정)
6. [테스트 및 검증](#6-테스트-및-검증)
7. [문제 해결](#7-문제-해결)

---

## 1. 사전 요구사항

### 필수 도구
- Node.js 18+
- pnpm
- Ethereum 지갑 (MetaMask 등)
- 테스트넷/메인넷 ETH (가스비용)

### RPC 프로바이더
다음 중 하나의 RPC 프로바이더 계정이 필요합니다:
- [Alchemy](https://www.alchemy.com/) (권장)
- [Infura](https://infura.io/)
- [QuickNode](https://www.quicknode.com/)

---

## 2. MOC 토큰 서비스 활성화

MOC 토큰 서비스는 투표자의 MOC 잔액을 확인하여 투표 자격을 검증합니다.

### MOC 토큰 정보
| 항목 | 값 |
|------|-----|
| 네트워크 | Ethereum Mainnet |
| 컨트랙트 주소 | `0x8bbfe65e31b348cd823c62e02ad8c19a84dd0dab` |
| 토큰 심볼 | MOC |
| 소수점 | 18 |
| Etherscan | [링크](https://etherscan.io/token/0x8bbfe65e31b348cd823c62e02ad8c19a84dd0dab) |

### 2.1 RPC URL 발급

#### Alchemy 사용 시
1. [Alchemy Dashboard](https://dashboard.alchemy.com/) 접속
2. "Create App" 클릭
3. Network: **Ethereum Mainnet** 선택
4. 생성된 앱에서 **API Key** 복사

```
https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

#### Infura 사용 시
1. [Infura Dashboard](https://infura.io/dashboard) 접속
2. "Create New Key" 클릭
3. Network: **Web3 API** 선택
4. Ethereum Mainnet 엔드포인트 복사

```
https://mainnet.infura.io/v3/YOUR_PROJECT_ID
```

### 2.2 환경 변수 설정

`apps/api/.env` 파일에 추가:

```bash
# MOC 토큰 잔액 조회용 (Ethereum Mainnet RPC)
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### 2.3 서비스 확인

서버 시작 시 다음 메시지가 표시되면 활성화 성공:

```
🪙 MOC token service enabled (0x8bbfe65e31b348cd823c62e02ad8c19a84dd0dab)
```

### 2.4 API 테스트

```bash
# MOC 잔액 조회
curl http://localhost:4000/api/blockchain/moc/0xYOUR_ADDRESS

# 응답 예시
{
  "address": "0x...",
  "balance": "1000000000000000000000",
  "formatted": "1000.00",
  "isHolder": true,
  "canVote": true
}
```

---

## 3. 스마트 컨트랙트 배포

### 3.1 컨트랙트 구조

```
packages/contracts/
├── src/
│   ├── OracleGovernance.sol   # 거버넌스 컨트랙트
│   └── OracleToken.sol        # 거버넌스 토큰 (선택)
├── scripts/
│   └── deploy.ts              # 배포 스크립트
└── hardhat.config.ts          # Hardhat 설정
```

### 3.2 컨트랙트 빌드

```bash
cd oracle
pnpm --filter @oracle/contracts build
```

### 3.3 로컬 테스트넷 배포 (Hardhat)

#### 로컬 노드 실행
```bash
# 터미널 1: 로컬 노드 실행
cd packages/contracts
npx hardhat node
```

#### 컨트랙트 배포
```bash
# 터미널 2: 배포
pnpm --filter @oracle/contracts deploy:local
```

출력 예시:
```
Deploying contracts with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
OracleToken deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3
OracleGovernance deployed to: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 3.4 Sepolia 테스트넷 배포

#### 환경 변수 설정
`packages/contracts/.env` 파일 생성:

```bash
# Sepolia 테스트넷 설정
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

> ⚠️ **주의**: 프라이빗 키는 절대로 Git에 커밋하지 마세요!

#### Sepolia ETH 획득
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)

#### 배포 실행
```bash
pnpm --filter @oracle/contracts deploy:sepolia
```

### 3.5 Ethereum Mainnet 배포

> ⚠️ **경고**: 메인넷 배포는 실제 ETH가 필요합니다. 테스트넷에서 충분히 테스트 후 진행하세요.

#### 환경 변수 설정
```bash
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE
```

#### hardhat.config.ts 수정
```typescript
// 메인넷 네트워크 추가
mainnet: {
  url: process.env.MAINNET_RPC_URL || "",
  accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  chainId: 1,
},
```

#### 배포 스크립트 실행
```bash
npx hardhat run scripts/deploy.ts --network mainnet
```

---

## 4. 온체인 거버넌스 활성화

### 4.1 API 환경 변수 설정

`apps/api/.env` 파일에 추가:

```bash
# 블록체인 연동 설정
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY  # 또는 메인넷
GOVERNANCE_CONTRACT_ADDRESS=0x...deployed_address...
ORACLE_PRIVATE_KEY=0x...your_private_key...
CHAIN_ID=11155111  # Sepolia: 11155111, Mainnet: 1, Hardhat: 31337
```

### 4.2 컨트랙트 역할 설정

배포된 컨트랙트에서 Oracle 서버 계정에 필요한 역할을 부여해야 합니다:

```javascript
// 역할 부여 스크립트 (scripts/grant-roles.ts)
import { ethers } from "hardhat";

async function main() {
  const governanceAddress = "0x...your_governance_address...";
  const oracleAccount = "0x...your_oracle_account...";

  const governance = await ethers.getContractAt("OracleGovernance", governanceAddress);

  // 역할 해시
  const PROPOSER_ROLE = ethers.keccak256(ethers.toUtf8Bytes("PROPOSER_ROLE"));
  const EXECUTOR_ROLE = ethers.keccak256(ethers.toUtf8Bytes("EXECUTOR_ROLE"));
  const ORACLE_ROLE = ethers.keccak256(ethers.toUtf8Bytes("ORACLE_ROLE"));

  // 역할 부여
  await governance.grantRole(PROPOSER_ROLE, oracleAccount);
  await governance.grantRole(EXECUTOR_ROLE, oracleAccount);
  await governance.grantRole(ORACLE_ROLE, oracleAccount);

  console.log("Roles granted to:", oracleAccount);
}

main();
```

실행:
```bash
npx hardhat run scripts/grant-roles.ts --network sepolia
```

### 4.3 서비스 확인

서버 시작 시 다음 메시지가 표시되면 활성화 성공:

```
🔗 Blockchain service enabled:
   Chain: Sepolia (11155111)
   Contract: 0x...
   Account: 0x...
```

---

## 5. 환경 변수 전체 설정

### apps/api/.env 전체 예시

```bash
# ===== 서버 설정 =====
PORT=4000

# ===== 외부 API 키 =====
ETHERSCAN_API_KEY=your_etherscan_api_key
GITHUB_TOKEN=your_github_token
TWITTER_BEARER_TOKEN=your_twitter_token

# ===== LLM 설정 =====
ANTHROPIC_API_KEY=your_anthropic_key
LLM_PROVIDER=anthropic
LLM_MODEL=claude-sonnet-4-20250514

# ===== 신호 수집 설정 =====
SIGNAL_LANGUAGE=ko
SIGNAL_COLLECT_INTERVAL=60
ISSUE_DETECT_INTERVAL=300

# ===== 블록체인 연동 (MOC 토큰) =====
# Ethereum Mainnet RPC - MOC 잔액 조회용
MAINNET_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# ===== 블록체인 연동 (거버넌스 컨트랙트) =====
# 거버넌스 컨트랙트 네트워크 RPC
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_API_KEY

# 배포된 OracleGovernance 컨트랙트 주소
GOVERNANCE_CONTRACT_ADDRESS=0x...

# Oracle 서버 서명 계정 프라이빗 키 (0x 포함)
ORACLE_PRIVATE_KEY=0x...

# 체인 ID (1: Mainnet, 11155111: Sepolia, 31337: Hardhat)
CHAIN_ID=11155111
```

---

## 6. 테스트 및 검증

### 6.1 블록체인 상태 확인

```bash
curl http://localhost:4000/api/blockchain/status
```

응답:
```json
{
  "enabled": true,
  "mocEnabled": true,
  "proposalCount": 0
}
```

### 6.2 MOC 잔액 확인

```bash
curl http://localhost:4000/api/blockchain/moc/0xYOUR_ADDRESS
```

### 6.3 투표 자격 확인

```bash
curl http://localhost:4000/api/blockchain/verify-voter/0xYOUR_ADDRESS
```

### 6.4 투표 테스트

```bash
# 제안 생성 후 투표
curl -X POST http://localhost:4000/api/proposals/PROPOSAL_ID/vote \
  -H "Content-Type: application/json" \
  -d '{
    "voter": "0xMOC_HOLDER_ADDRESS",
    "choice": "for",
    "reason": "Test vote"
  }'
```

성공 응답:
```json
{
  "vote": {
    "id": "...",
    "proposalId": "...",
    "voter": "0x...",
    "choice": "for",
    "weight": "1000000000000000000000"
  },
  "txHash": "0x...",  // 온체인 기록 시
  "mocBalance": "1000.00"
}
```

비홀더 시도 시:
```json
{
  "error": "Address 0x... is not a MOC holder. Only MOC token holders can vote.",
  "code": "NOT_MOC_HOLDER"
}
```

---

## 7. 문제 해결

### MOC 서비스가 활성화되지 않음

```
⚠️  MOC token service disabled: Missing MAINNET_RPC_URL
```

**해결**: `MAINNET_RPC_URL` 환경 변수 확인

### 블록체인 서비스가 활성화되지 않음

```
⚠️  Blockchain service disabled: Missing RPC_URL, ORACLE_PRIVATE_KEY, or GOVERNANCE_CONTRACT_ADDRESS
```

**해결**: 세 가지 환경 변수 모두 설정되었는지 확인

### RPC 연결 오류

```
Error: could not detect network
```

**해결**:
1. RPC URL이 올바른지 확인
2. API 키가 유효한지 확인
3. 네트워크 연결 상태 확인

### 컨트랙트 호출 실패

```
Error: execution reverted
```

**해결**:
1. 컨트랙트 주소가 올바른지 확인
2. 계정에 필요한 역할이 부여되었는지 확인
3. 충분한 가스비가 있는지 확인

### 투표 권한 오류

```
Error: Address is not a MOC holder
```

**해결**: 해당 주소가 실제로 MOC 토큰을 보유하고 있는지 확인

---

## 참고 자료

- [MOC Token on Etherscan](https://etherscan.io/token/0x8bbfe65e31b348cd823c62e02ad8c19a84dd0dab)
- [Hardhat Documentation](https://hardhat.org/docs)
- [Viem Documentation](https://viem.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)

---

## 보안 주의사항

1. **프라이빗 키 보안**: `.env` 파일은 절대 Git에 커밋하지 마세요
2. **역할 관리**: 컨트랙트 역할은 신뢰할 수 있는 계정에만 부여하세요
3. **테스트넷 우선**: 메인넷 배포 전 테스트넷에서 충분히 검증하세요
4. **감사**: 프로덕션 전 스마트 컨트랙트 보안 감사를 권장합니다
