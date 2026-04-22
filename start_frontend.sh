#!/bin/bash

# Medical Ad Compliance Checker - Frontend 서버 시작 스크립트

FRONTEND_PORT=56300
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "Medical Ad Compliance - Frontend 서버 시작"
echo "=========================================="
echo ""

# ====================================
# Frontend 프로세스 정리
# ====================================
echo "1. Frontend 프로세스 확인 (포트 $FRONTEND_PORT)..."
echo "   → 프로젝트 디렉토리: $PROJECT_DIR"

FRONTEND_KILLED=false
for pid in $(pgrep -f "next dev.*$FRONTEND_PORT" 2>/dev/null); do
    PROC_CWD=$(readlink /proc/$pid/cwd 2>/dev/null)
    if [[ "$PROC_CWD" == "$PROJECT_DIR"* ]]; then
        echo "   ✓ 현재 디렉토리의 next dev 프로세스 발견: PID $pid"
        kill $pid 2>/dev/null || true
        FRONTEND_KILLED=true
    fi
done

if [ "$FRONTEND_KILLED" = true ]; then
    sleep 2
    echo "   ✓ Frontend 프로세스 종료 완료"
else
    echo "   ✓ 현재 디렉토리의 next dev 프로세스가 없습니다"
fi

# ====================================
# 포트 확인
# ====================================
echo ""
echo "2. 포트 $FRONTEND_PORT 확인..."
PID=$(lsof -ti:$FRONTEND_PORT 2>/dev/null)

if [ -n "$PID" ]; then
    echo "   ⚠ 포트 사용 중: PID $PID"
    kill -9 $PID 2>/dev/null
    sleep 1
    echo "   ✓ 프로세스 종료 완료"
else
    echo "   ✓ 포트 사용 가능"
fi

# ====================================
# 환경 확인
# ====================================
echo ""
echo "3. 환경 확인..."

if [ ! -d "$PROJECT_DIR/project_source/frontend/node_modules" ]; then
    echo "   ✗ node_modules가 없습니다!"
    echo "   → project_source/frontend 디렉토리에서 'npm install'을 실행하세요."
    exit 1
fi
echo "   ✓ node_modules 존재"

if [ ! -f "$PROJECT_DIR/project_source/frontend/.env.local" ]; then
    echo "   ⚠ .env.local 파일이 없습니다"
    echo "   → project_source/frontend/.env.local 파일을 생성하세요."
fi

# ====================================
# 프로세스 정리 대기
# ====================================
echo ""
echo "4. 프로세스 정리 대기..."
sleep 1
echo "   ✓ 대기 완료"

# ====================================
# 서버 시작
# ====================================
echo ""
echo "5. Frontend 서버 시작..."
echo "   → 포트: $FRONTEND_PORT"
echo "   → URL: http://localhost:$FRONTEND_PORT"
echo ""
echo "=========================================="
echo "서버가 시작됩니다..."
echo "종료하려면 Ctrl+C를 누르세요"
echo "=========================================="
echo ""

# 포어그라운드 실행
cd "$PROJECT_DIR/project_source/frontend"
npm run dev
