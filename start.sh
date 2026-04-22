#!/bin/bash

# QR Party Participant Admin - Frontend 서버 시작 스크립트

FRONTEND_PORT=59500
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_DIR="$PROJECT_DIR/prj_source/frontend"

echo "=========================================="
echo "QR Party Participant Admin - 서버 시작"
echo "=========================================="
echo ""

# ====================================
# Frontend 프로세스 정리 (현재 디렉토리 전용)
# ====================================
echo "1. Frontend 프로세스 확인 (포트 $FRONTEND_PORT)..."
echo "   → 앱 디렉토리: $APP_DIR"

FRONTEND_KILLED=false
# 현재 포트를 사용 중인 프로세스 중 이 프로젝트 디렉토리 소속인 것만 종료
for pid in $(lsof -t -i:$FRONTEND_PORT 2>/dev/null); do
    PROC_CWD=$(readlink /proc/$pid/cwd 2>/dev/null)
    if [[ "$PROC_CWD" == "$PROJECT_DIR"* ]]; then
        echo "   ✓ 현재 프로젝트의 프로세스 발견: PID $pid"
        kill $pid 2>/dev/null || true
        FRONTEND_KILLED=true
    fi
done

if [ "$FRONTEND_KILLED" = true ]; then
    sleep 2
    echo "   ✓ 기존 프로세스 종료 완료"
else
    echo "   ✓ 현재 프로젝트의 구동 중인 프로세스가 없습니다"
fi

# ====================================
# 서버 기동
# ====================================
echo ""
echo "2. 서버 기동 중 (포트 $FRONTEND_PORT)..."
cd "$APP_DIR" || exit

# Bun을 사용하여 Next.js 서버 실행
# 백그라운드 실행을 원하시면 끝에 & 를 붙이세요.
bun run dev --port $FRONTEND_PORT

echo ""
echo "=========================================="
echo "서버가 중단되었습니다."
echo "=========================================="
