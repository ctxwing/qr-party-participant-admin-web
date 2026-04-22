# start.sh 작성 가이드

## 개요

프로젝트의 개발 서버를 안전하고 편리하게 기동할 수 있는 스크립트를 작성합니다.

## 프로젝트 구조에 따른 스크립트 분리

### 1. Backend/Frontend 구분이 **있는** 경우

**스크립트 구성:**
- `start_backend.sh` - Backend 서버 실행
- `start_frontend.sh` - Frontend 서버 실행

**실행 방법:**
```bash
# 터미널 1
./start_backend.sh
# Ctrl+C로 종료

# 터미널 2
./start_frontend.sh
# Ctrl+C로 종료
```

**왜 분리하나요?**
- 각 서버를 **포어그라운드**로 실행하여 로그를 직접 확인
- **Ctrl+C**로 즉시 종료 가능
- 독립적인 재시작 가능 (한쪽만 재시작 필요 시)
- 각 터미널에서 실시간 로그 모니터링

### 2. Backend/Frontend 구분이 **없는** 경우

**스크립트 구성:**
- `start.sh` - 단일 서버 실행

**실행 방법:**
```bash
./start.sh
# Ctrl+C로 종료
```

## 핵심 원칙

### ✅ 반드시 지켜야 할 사항

1. **현재 디렉토리 기반 프로세스 필터링**
   - `/proc/$pid/cwd` 심볼릭 링크를 통해 작업 디렉토리 확인
   - 현재 프로젝트 디렉토리에서 실행된 프로세스만 종료
   - 다른 개발자나 VSCode의 프로세스 보호

2. **포어그라운드 실행**
   - 백그라운드(`&`) 실행 금지
   - `nohup` 사용 금지
   - 실시간 로그 확인 가능

3. **Ctrl+C로 정상 종료**
   - 포어그라운드 실행으로 Ctrl+C 시그널 자동 수신
   - 깔끔한 종료 보장

### ❌ 절대 하지 말아야 할 사항

**위험한 kill 예시:**
```bash
# ❌ 포트만으로 무분별하게 kill - 매우 위험!
lsof -ti :52300 | xargs kill -9

# ❌ 프로세스명만으로 kill - 다른 프로젝트까지 종료!
pkill -f "next dev"
```

**위험한 이유:**
- VSCode에서 개발 중인 다른 프로젝트의 프로세스까지 종료
- 같은 포트/명령어를 사용하는 다른 개발자의 작업 중단
- 예기치 않은 데이터 손실 가능

### ✅ 안전한 kill 방법

```bash
# ✅ 현재 디렉토리 + 프로세스명 + 포트로 필터링
for pid in $(pgrep -f 'next dev.*52300' 2>/dev/null); do
    PROC_CWD=$(readlink /proc/$pid/cwd 2>/dev/null)
    if [[ "$PROC_CWD" == "$PROJECT_DIR"* ]]; then
        kill $pid 2>/dev/null || true
    fi
done
```

## 샘플 코드

### 케이스 1: 단일 서버 프로젝트 (start.sh)

**프로젝트 구조:**
```
project/
├── start.sh          ← 이 파일
├── .env
├── package.json
└── ...
```

**start.sh:**
```bash
#!/bin/bash

# [프로젝트명] - 개발 서버 시작 스크립트
# 현재 디렉토리의 프로세스를 종료하고 새로 시작합니다.

PORT=52300
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "[프로젝트명] - 서버 시작"
echo "=========================================="
echo ""

# ====================================
# 프로세스 정리
# ====================================
echo "1. 프로세스 확인 (포트 $PORT)..."
echo "   → 프로젝트 디렉토리: $PROJECT_DIR"

# 현재 디렉토리에서 실행 중인 프로세스만 종료
echo "   → 포트 $PORT를 사용하는 프로세스 검색 중..."
KILLED=false
for pid in $(pgrep -f 'next dev.*'$PORT 2>/dev/null); do
    PROC_CWD=$(readlink /proc/$pid/cwd 2>/dev/null)
    if [[ "$PROC_CWD" == "$PROJECT_DIR"* ]]; then
        echo "   ✓ 현재 디렉토리의 프로세스 발견: PID $pid"
        echo "   → 프로세스 종료 중..."
        kill $pid 2>/dev/null || true
        KILLED=true
    fi
done

if [ "$KILLED" = true ]; then
    sleep 2
    echo "   ✓ 프로세스 종료 완료"
else
    echo "   ✓ 현재 디렉토리의 프로세스가 없습니다"
fi

# ====================================
# 포트 확인 (추가 안전장치)
# ====================================
echo ""
echo "2. 포트 $PORT 사용 중인 프로세스 확인..."
PID=$(lsof -ti:$PORT 2>/dev/null)

if [ -n "$PID" ]; then
    echo "   ⚠ 포트 $PORT에서 다른 프로세스 실행 중: PID $PID"
    echo "   → 강제 프로세스 종료 중..."
    kill -9 $PID 2>/dev/null
    sleep 1
    echo "   ✓ 프로세스 종료 완료"
else
    echo "   ✓ 포트 $PORT는 사용 가능합니다"
fi

# ====================================
# 환경 확인
# ====================================
echo ""
echo "3. 환경 확인..."

if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "   ⚠ node_modules가 없습니다!"
    echo "   → npm install을 실행하세요."
    exit 1
fi
echo "   ✓ node_modules 존재"

if [ ! -f "$PROJECT_DIR/.env" ]; then
    echo "   ⚠ .env 파일이 없습니다!"
    echo "   → .env 파일을 생성하세요."
fi

# ====================================
# 프로세스 정리 대기
# ====================================
echo ""
echo "4. 프로세스 정리 대기..."
sleep 2
echo "   ✓ 대기 완료"

# ====================================
# 서버 시작
# ====================================
echo ""
echo "5. 개발 서버 시작..."
echo "   → 포트: $PORT"
echo "   → URL: http://localhost:$PORT"
echo "   → 프로세스 격리: /proc/\$pid/cwd 기반"
echo ""
echo "=========================================="
echo "서버가 시작됩니다..."
echo "종료하려면 Ctrl+C를 누르세요"
echo "=========================================="
echo ""

# 포어그라운드 실행 (Ctrl+C로 종료 가능)
cd "$PROJECT_DIR"
npm run dev
```

---

### 케이스 2: Backend/Frontend 분리 프로젝트

**프로젝트 구조:**
```
project/
├── start_backend.sh   ← Backend 실행
├── start_frontend.sh  ← Frontend 실행
├── backend/
│   ├── .env
│   ├── pyproject.toml (또는 package.json)
│   └── src/
└── frontend/
    ├── package.json
    └── ...
```

#### start_backend.sh

```bash
#!/bin/bash

# [프로젝트명] - Backend 서버 시작 스크립트

BACKEND_PORT=56800
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "Backend 서버 시작"
echo "=========================================="
echo ""

# ====================================
# Backend 프로세스 정리
# ====================================
echo "1. Backend 프로세스 확인 (포트 $BACKEND_PORT)..."
echo "   → 프로젝트 디렉토리: $PROJECT_DIR"

BACKEND_KILLED=false
for pid in $(pgrep -f "python.*src\.main" 2>/dev/null); do
    PROC_CWD=$(readlink /proc/$pid/cwd 2>/dev/null)
    if [[ "$PROC_CWD" == "$PROJECT_DIR"* ]]; then
        echo "   ✓ 현재 디렉토리의 python 프로세스 발견: PID $pid"
        kill $pid 2>/dev/null || true
        BACKEND_KILLED=true
    fi
done

if [ "$BACKEND_KILLED" = true ]; then
    sleep 2
    echo "   ✓ Backend 프로세스 종료 완료"
else
    echo "   ✓ 현재 디렉토리의 python 프로세스가 없습니다"
fi

# ====================================
# 포트 확인
# ====================================
echo ""
echo "2. 포트 $BACKEND_PORT 확인..."
PID=$(lsof -ti:$BACKEND_PORT 2>/dev/null)

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

if [ ! -d "$PROJECT_DIR/backend/.venv" ]; then
    echo "   ✗ Python 가상환경이 없습니다!"
    echo "   → backend 디렉토리에서 'uv venv && uv sync'를 실행하세요."
    exit 1
fi
echo "   ✓ Python 가상환경 존재"

# ====================================
# 서버 시작
# ====================================
echo ""
echo "4. Backend 서버 시작..."
echo "   → 포트: $BACKEND_PORT"
echo "   → URL: http://localhost:$BACKEND_PORT"
echo ""
echo "=========================================="
echo "종료하려면 Ctrl+C를 누르세요"
echo "=========================================="
echo ""

# 포어그라운드 실행
cd "$PROJECT_DIR/backend"
uv run python -m src.main
```

#### start_frontend.sh

```bash
#!/bin/bash

# [프로젝트명] - Frontend 서버 시작 스크립트

FRONTEND_PORT=56300
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "Frontend 서버 시작"
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

if [ ! -d "$PROJECT_DIR/frontend/node_modules" ]; then
    echo "   ✗ node_modules가 없습니다!"
    echo "   → frontend 디렉토리에서 'npm install'을 실행하세요."
    exit 1
fi
echo "   ✓ node_modules 존재"

# ====================================
# 서버 시작
# ====================================
echo ""
echo "4. Frontend 서버 시작..."
echo "   → 포트: $FRONTEND_PORT"
echo "   → URL: http://localhost:$FRONTEND_PORT"
echo ""
echo "=========================================="
echo "종료하려면 Ctrl+C를 누르세요"
echo "=========================================="
echo ""

# 포어그라운드 실행
cd "$PROJECT_DIR/frontend"
npm run dev
```

---

## 주의사항

1. **샘플 코드는 예시입니다**
   - 포트 번호는 프로젝트에 맞게 수정
   - 프로세스 검색 패턴은 실제 실행 명령어에 맞게 조정
   - 환경 변수 및 디렉토리 구조 확인

2. **실행 권한 부여**
   ```bash
   chmod +x start.sh
   # 또는
   chmod +x start_backend.sh start_frontend.sh
   ```

3. **프로젝트별 커스터마이징**
   - Python: `uv run python -m src.main`
   - Node.js: `npm run dev`, `npx next dev`
   - Go: `go run main.go`
   - 등등... 프로젝트에 맞게 수정

4. **Constitution 규칙 준수**
   - 반드시 Constitution에 정의된 포트 번호 사용
   - Constitution에 정의된 실행 명령어 사용
