# SKILL: Supabase Mastery (전문가 활용 가이드)

본 문서는 Supabase를 활용하여 고성능, 고보안의 애플리케이션을 구축하기 위한 전문가 수준의 스킬셋을 정의합니다.

## 1. 데이터 아키텍처 및 쿼리 최적화
- **정확한 타입 정의**: `npx supabase gen types typescript`를 활용하여 DB 스키마와 100% 일치하는 Typescript 타입을 자동 생성하고 적용하십시오.
- **RPC(Remote Procedure Calls) 활용**: 복잡한 비즈니스 로직이나 여러 테이블을 조인하는 대규모 연산은 클라이언트가 아닌 데이터베이스 내부의 SQL Function(RPC)으로 처리하여 네트워크 오버헤드를 줄이십시오.

## 2. RLS (Row Level Security) 설계 원칙
- **최소 권한 원칙**: 모든 테이블은 기본적으로 `Enable RLS`가 켜져 있어야 합니다.
- **익명 사용자 정책**: 
    ```sql
    -- 예시: 익명 사용자에게 읽기 권한만 부여
    CREATE POLICY "Allow anon read access" ON "public"."messages"
    FOR SELECT TO anon USING (true);
    ```
- **관리자 우회**: `service_role` 키를 사용하는 서버 사이드 로직은 RLS를 무시하므로, 클라이언트 사이드에서는 반드시 `anon` 키만 사용하도록 엄격히 분리하십시오.

## 3. 실시간(Realtime) 구독 최적화
- **필터링 구독**: 모든 변경 사항을 구독하지 말고, 필요한 ID나 조건으로 필터를 걸어 구독하십시오.
    ```typescript
    supabase.channel('room-1')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'messages',
        filter: 'room_id=eq.1' // 특정 데이터만 구독
      }, callback)
      .subscribe();
    ```
- **채널 관리**: 컴포넌트 언마운트 시 반드시 `supabase.removeChannel()`을 호출하여 메모리 누수와 불필요한 서버 연결을 방지하십시오.

## 4. 보안 및 운영 모범 사례
- **API Key 노출 주의**: `.env.local`의 `NEXT_PUBLIC_` 키는 클라이언트에 노출되므로, 민감한 작업은 반드시 접두사 없는 환경 변수를 사용하는 Server Actions에서 처리하십시오.
- **Connection Pooling**: 대규모 트래픽 발생 시 Direct Connection 대신 Supabase에서 제공하는 **Transaction Pooler (Port 6543)**를 사용하여 DB 커넥션 부족 오류를 방지하십시오.

---
**작성자**: Antigravity (AI Assistant)
**최종 업데이트**: 2026-04-22
