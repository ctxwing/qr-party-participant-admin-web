-- Enable RLS on alerts table if not already enabled
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow authenticated users to read alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to update alerts" ON alerts;
DROP POLICY IF EXISTS "Allow authenticated users to insert alerts" ON alerts;

-- Policy: SELECT - Allow all authenticated users to read alerts
CREATE POLICY "Allow authenticated users to read alerts"
ON alerts
FOR SELECT
TO authenticated
USING (true);

-- Policy: UPDATE - Allow all authenticated users to update alerts
CREATE POLICY "Allow authenticated users to update alerts"
ON alerts
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: INSERT - Allow all authenticated users to insert alerts
CREATE POLICY "Allow authenticated users to insert alerts"
ON alerts
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: DELETE - Allow all authenticated users to delete alerts
CREATE POLICY "Allow authenticated users to delete alerts"
ON alerts
FOR DELETE
TO authenticated
USING (true);
