const { createClient } = require('@supabase/supabase-js');

const url = 'https://hlbgedbgycamzvbbykdc.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhsYmdlZGJneWNhbXp2YmJ5a2RjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Njc3NTY3NCwiZXhwIjoyMDkyMzUxNjc0fQ.H070aaprmraI_r9mnJ-iQ_2hD_xfqWxTnHDmRDwS32Y';

const supabase = createClient(url, serviceKey);

async function setupRLS() {
  console.log('RLS 정책 설정 중...');

  const sql = `
-- Enable RLS on alerts table
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow authenticated users to update alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow authenticated users to insert alerts" ON public.alerts;
DROP POLICY IF EXISTS "Allow authenticated users to delete alerts" ON public.alerts;

-- Create policies
CREATE POLICY "Allow authenticated users to read alerts"
ON public.alerts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to update alerts"
ON public.alerts FOR UPDATE TO authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Allow authenticated users to insert alerts"
ON public.alerts FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to delete alerts"
ON public.alerts FOR DELETE TO authenticated USING (true);
  `;

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql });

    if (error) {
      console.error('❌ 에러:', error);
    } else {
      console.log('✅ RLS 정책 설정 완료!');
      console.log(data);
    }
  } catch (err) {
    console.error('❌ 실행 실패:', err.message);
  }
}

setupRLS();
