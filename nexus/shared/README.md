# Shared

Shared는 모든 레이어에서 공유하는 타입, 유틸리티, 설정을 포함하는 공통 모듈입니다.

## 개요

이 디렉토리는 BRIDGE 2026의 모든 레이어에서 공통으로 사용되는 코드를 포함합니다.

## 구조

- `types/`: TypeScript 타입 정의 (Signal, Issue, DecisionPacket, Proposal, Outcome 등)
- `utils/`: 공통 유틸리티 함수 (암호화, 검증, 포맷팅 등)
- `config/`: 공통 설정 및 상수

## 사용 방법

각 레이어는 이 공통 모듈을 의존성으로 참조하여 일관된 타입과 유틸리티를 사용합니다.

