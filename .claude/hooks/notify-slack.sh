#!/bin/bash
# Claude Code 이벤트를 Slack Incoming Webhook으로 전송한다.
# 인자: permission(권한 요청) | stop(작업 완료)
# SLACK_WEBHOOK_URL 환경변수가 없으면 조용히 종료한다.
set -uo pipefail

KIND="${1:-}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"

# 환경변수에 없으면 프로젝트 루트의 .env에서 읽는다
if [ -z "$WEBHOOK_URL" ] && [ -f "$PROJECT_DIR/.env" ]; then
  WEBHOOK_URL=$(grep -m1 '^SLACK_WEBHOOK_URL=' "$PROJECT_DIR/.env" | cut -d '=' -f2- | tr -d '"'"'"' \r')
fi

if [ -z "$WEBHOOK_URL" ]; then
  exit 0
fi

PROJECT_NAME=$(basename "$PROJECT_DIR")
NOTIFIED_AT=$(date '+%Y-%m-%d %H:%M:%S')

case "$KIND" in
  permission)
    STATUS="🔐 권한 승인 대기 중"
    ;;
  stop)
    STATUS="✅ 작업 완료"
    ;;
  *)
    exit 0
    ;;
esac

TEXT="프로젝트명 : ${PROJECT_NAME}\n상태 : ${STATUS}\n알림시간 : ${NOTIFIED_AT}"

curl -sf -X POST -H 'Content-type: application/json' \
  --data "{\"text\": \"$TEXT\"}" \
  "$WEBHOOK_URL" >/dev/null 2>&1

exit 0
