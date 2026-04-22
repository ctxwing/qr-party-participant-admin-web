#!/usr/bin/env bash
# /home/ctxwing/docker-ctx/lancer/photo-refine-ai-ochestrator-saas/2_ctx/gstack/init_gstack.sh

GSTACK_SRC="/home/ctxwing/gstack"
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
SKILL_DEST="$PROJECT_ROOT/.agent/skills"
STATE_DIR="$PROJECT_ROOT/.agent/gstack-state"

echo "🔍 gstack 연결 시작 (Target: $PROJECT_ROOT)"
mkdir -p "$SKILL_DEST"
mkdir -p "$STATE_DIR"

if [ ! -d "$GSTACK_SRC/.agents/skills" ]; then
    echo "❌ 에러: gstack 저장소를 찾을 수 없습니다."
    exit 1
fi

for skill_path in "$GSTACK_SRC"/.agents/skills/*; do
    if [ ! -d "$skill_path" ]; then continue; fi
    
    skill_name=$(basename "$skill_path")
    target_dir="$SKILL_DEST/$skill_name"
    
    rm -rf "$target_dir"
    mkdir -p "$target_dir"
    
    if [ -f "$skill_path/SKILL.md" ]; then
        cp "$skill_path/SKILL.md" "$target_dir/SKILL.md"
        
        # [독립성] 환경변수 주입 (가장 안전한 방식: 첫 번째 bash 블록 뒤에 추가)
        sed -i 's#```bash#```bash\nexport GSTACK_STATE_DIR="'"$STATE_DIR"'"#' "$target_dir/SKILL.md"
        
        # [업그레이드 대응] 바이너리 링크
        [ -d "$skill_path/bin" ] && ln -s "$skill_path/bin" "$target_dir/bin"
        [ -d "$skill_path/scripts" ] && ln -s "$skill_path/scripts" "$target_dir/scripts"
        [ -d "$skill_path/utils" ] && ln -s "$skill_path/utils" "$target_dir/utils"
        
        echo "✅ 추가됨: /$skill_name"
    fi
done

echo "🚀 설정 완료!"
echo "📜 설계 이력 관리 경로: $STATE_DIR"
