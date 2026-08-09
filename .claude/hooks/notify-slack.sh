#!/bin/bash
# Claude Code 이벤트를 Slack Incoming Webhook으로 전송한다.
# 인자: permission(권한 요청) | stop(작업 완료)
# stdin으로 훅 이벤트 JSON을 받아 message 필드가 있으면 함께 전송한다.
# SLACK_WEBHOOK_URL 환경변수가 없으면 조용히 종료한다.
set -uo pipefail

KIND="${1:-}"
PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# stdin에 훅 이벤트 JSON이 오면 message 필드를 추출한다 (없으면 빈 문자열)
HOOK_INPUT="$(cat)"
CLAUDE_MESSAGE=""
if [ -n "$HOOK_INPUT" ] && command -v jq >/dev/null 2>&1; then
  CLAUDE_MESSAGE=$(printf '%s' "$HOOK_INPUT" | jq -r '.message // empty' 2>/dev/null)
fi

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

TEXT="프로젝트명 : ${PROJECT_NAME}
상태 : ${STATUS}
알림시간 : ${NOTIFIED_AT}"
if [ -n "$CLAUDE_MESSAGE" ]; then
  TEXT="${TEXT}
메시지 : ${CLAUDE_MESSAGE}"
fi

if command -v jq >/dev/null 2>&1; then
  PAYLOAD=$(jq -n --arg text "$TEXT" '{text: $text}')
else
  # jq 없을 때: JSON 문자열 특수문자(백슬래시, 큰따옴표, 개행)를 이스케이프한다
  ESCAPED_TEXT=$(printf '%s' "$TEXT" | sed 's/\\/\\\\/g; s/"/\\"/g' | awk '{printf "%s\\n", $0}')
  ESCAPED_TEXT="${ESCAPED_TEXT%\\n}"
  PAYLOAD="{\"text\": \"${ESCAPED_TEXT}\"}"
fi

curl -sf -X POST -H 'Content-type: application/json' \
  --data "$PAYLOAD" \
  "$WEBHOOK_URL" >/dev/null 2>&1

exit 0
