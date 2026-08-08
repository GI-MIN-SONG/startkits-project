---
description: "배포 전 코드 품질을 자동으로 점검합니다 (lint, format, 타입체크, 빌드)"
allowed-tools:
  [
    "Bash(npm run lint:*)",
    "Bash(npm run format:check:*)",
    "Bash(npx tsc:*)",
    "Bash(npm run build:*)",
    "Bash(git status:*)",
  ]
---

# Claude 명령어: Deploy Check

배포 전 코드 품질을 자동으로 점검합니다.

## 사용법

```
/deploy-check
```

## 프로세스

아래 4개 검사를 순서대로 실행한다. 각 단계가 끝날 때마다 성공/실패를
확인하고, 실패 시 로그와 원인을 보여준 뒤 다음 단계를 계속 진행할지
사용자에게 확인한다.

1. `npm run lint` — ESLint 검사
2. `npm run format:check` — Prettier 포맷 검사
3. `npx tsc --noEmit` — 타입 체크
4. `npm run build` — 프로덕션 빌드

## 결과 리포트 포맷

모든 검사가 끝나면 아래와 같은 체크리스트 형태로 요약한다.

```
- [x] Lint
- [x] Format
- [ ] Type Check (실패: <원인 요약>)
- [ ] Build (미실행: 이전 단계 실패로 중단)
```

전체 통과 시 "배포 가능" 문구로 마무리하고, 하나라도 실패하면
"배포 전 수정 필요" 문구와 함께 실패 원인을 요약한다.

## 참고사항

- 이 프로젝트는 테스트 프레임워크가 설정되어 있지 않으므로 테스트 실행
  단계는 포함하지 않는다.
- 실패한 항목을 임의로 자동 수정하지 않는다. 원인만 보고하고, 수정은
  사용자 승인 후 별도로 진행한다.
