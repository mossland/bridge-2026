# Configuration

BRIDGE 2026의 전역 설정을 관리합니다.

## 환경 변수

다음 환경 변수를 설정할 수 있습니다:

### Blockchain
- `RPC_URL`: 이더리움 RPC URL
- `NETWORK_ID`: 네트워크 ID (1: 메인넷, 5: Goerli, 11155111: Sepolia)
- `BRIDGE_LOG_CONTRACT_ADDRESS`: BridgeLog 컨트랙트 주소

### LLM
- `GEMINI_API_KEY`: Gemini API 키
- `LLM_MODEL`: 사용할 모델 이름 (기본: gemini-pro)
- `LLM_TEMPERATURE`: 온도 설정 (기본: 0.7)

### Agora
- `AGORA_API_URL`: Agora API URL
- `AGORA_API_KEY`: Agora API 키

### Database
- `DATABASE_URL`: PostgreSQL 연결 문자열
- 또는 개별 설정:
  - `DB_HOST`: 데이터베이스 호스트
  - `DB_PORT`: 포트
  - `DB_NAME`: 데이터베이스 이름
  - `DB_USER`: 사용자 이름
  - `DB_PASSWORD`: 비밀번호

### Collectors
- `COLLECTOR_INTERVAL`: 수집 간격 (밀리초, 기본: 60000)
- `ENABLED_COLLECTORS`: 활성화할 수집기 목록 (쉼표로 구분)

### Logging
- `LOG_LEVEL`: 로그 레벨 (debug, info, warn, error)
- `FILE_LOGGING`: 파일 로깅 활성화 (true/false)
- `LOG_PATH`: 로그 파일 경로

## 사용 예제

```typescript
import { getConfig, initializeConfig } from '@bridge-2026/shared/config';

// 환경 변수에서 설정 로드
initializeConfig();

// 설정 가져오기
const config = getConfig();
console.log(config.blockchain.rpcUrl);
console.log(config.llm.geminiApiKey);

// 설정 업데이트
updateConfig({
  logging: {
    level: 'debug',
  },
});
```









