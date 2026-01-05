# Policy-based Delegation 설계

## 개요

정책 기반 위임(Policy-based Delegation)은 사용자가 에이전트에게 투표 권한을 위임하되, **안전장치를 통해 무제한 자동투표를 방지**하는 시스템입니다.

## 핵심 원칙

- ❌ **무제한 자동투표 금지**: 에이전트가 모든 제안에 자동으로 투표하는 것은 절대 금지
- ✅ **정책 기반 제한**: 명시적인 정책에 따라 위임 범위를 제한
- ✅ **사용자 제어**: 언제든지 위임을 취소하거나 정책을 수정 가능
- ✅ **투명성**: 모든 위임 투표는 공개적으로 추적 가능

## DelegationPolicy 스키마

```typescript
interface DelegationPolicy {
  // 기본 정보
  wallet: string;              // 위임자 지갑 주소
  agent_id: string;            // 위임 대상 에이전트 ID
  created_at: number;          // 생성 시간
  updated_at: number;          // 마지막 업데이트 시간
  
  // 범위 제한 (Scope)
  scope: {
    categories?: string[];     // 허용 카테고리 (예: ['governance', 'treasury'])
    tags?: string[];           // 허용 태그
    exclude_categories?: string[]; // 제외 카테고리
    exclude_tags?: string[];  // 제외 태그
  };
  
  // 예산 제한
  max_budget_per_month?: number;  // 월별 최대 예산 (USD 또는 토큰)
  max_budget_per_proposal?: number; // 제안당 최대 예산
  
  // 긴급안건 제외
  no_vote_on_emergency: boolean;  // 긴급안건에는 투표 안 함
  
  // 대기 시간 (Cooldown)
  cooldown_window_hours: number;   // 위임 투표 후 N시간 대기
  
  // 거부권 (Veto)
  veto_enabled: boolean;           // 거부권 활성화
  veto_notification: boolean;     // 거부 시 알림
  
  // 추가 안전장치
  require_human_review_above?: number; // 예산이 N 이상이면 사람 검토 필요
  max_votes_per_day?: number;     // 일일 최대 투표 수
}
```

## 안전장치 (Safety Mechanisms)

### 1. 카테고리 제한

```typescript
// 예시: 거버넌스와 재무 카테고리만 위임
{
  scope: {
    categories: ['governance', 'treasury'],
    exclude_categories: ['security', 'emergency']
  }
}
```

### 2. 예산 상한

```typescript
// 예시: 월 10,000 USD 이하만 자동 투표
{
  max_budget_per_month: 10000,
  max_budget_per_proposal: 1000,
  require_human_review_above: 5000  // 5,000 이상은 사람 검토 필요
}
```

### 3. 긴급안건 제외

```typescript
{
  no_vote_on_emergency: true  // 긴급안건은 항상 사람이 직접 투표
}
```

### 4. 거부권/대기시간

```typescript
{
  veto_enabled: true,
  veto_notification: true,
  cooldown_window_hours: 24  // 위임 투표 후 24시간 대기
}
```

### 5. 일일 투표 제한

```typescript
{
  max_votes_per_day: 5  // 하루 최대 5개 제안에만 자동 투표
}
```

## 위임 투표 프로세스

1. **제안 수신**: 에이전트가 Decision Packet을 받음
2. **정책 검증**: DelegationPolicy와 매칭
   - 카테고리/태그 확인
   - 예산 제한 확인
   - 긴급안건 여부 확인
   - 일일 투표 제한 확인
3. **투표 결정**: 정책을 통과하면 에이전트가 투표
4. **알림**: 위임자가 선택한 경우 알림 전송
5. **기록**: 모든 위임 투표는 온체인/오프체인에 기록

## 거부권 (Veto) 프로세스

1. **위임 투표 후**: 사용자가 거부권을 행사할 수 있는 기간 제공
2. **거부 시**: 투표를 취소하고 반대 투표로 변경 가능
3. **알림**: 거부권 행사 시 위임자에게 알림

## MVP 구현 범위

### 포함

- 기본 DelegationPolicy 스키마
- 카테고리/태그 기반 필터링
- 예산 상한
- 긴급안건 제외
- 거부권 (기본)

### 제외 (2026 H2 이후)

- 복잡한 조건부 정책 (AND/OR 논리)
- 시간대별 정책
- 다중 에이전트 위임 전략

## 보안 고려사항

1. **스마트 컨트랙트 검증**: DelegationPolicy는 스마트 컨트랙트에서도 검증
2. **서명 검증**: 위임 정책 변경은 서명 필요
3. **감사 로그**: 모든 위임 투표는 불변 로그에 기록
4. **정기 검토**: 위임 정책은 정기적으로 사용자에게 재확인 요청









