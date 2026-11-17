-- ============================================================================
-- Migration: V2 - Fix orphaned defect reported_by references
-- Description: Resolves orphaned foreign key references in the defect table
--              where reported_by points to non-existent employee records.
-- ============================================================================

-- Step 1: Insert a placeholder employee for orphaned references
-- This preserves historical data while fixing referential integrity
INSERT INTO employee (id, employee_number, first_name, last_name, email, department, position, hire_date, status, created_at)
VALUES (2, 'UNKNOWN-002', 'Unknown', 'Reporter', NULL, 'N/A', 'Unknown Reporter', CURRENT_DATE, 'INACTIVE', NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 2: Reset the sequence to avoid conflicts with future inserts
SELECT setval('employee_id_seq', (SELECT MAX(id) FROM employee));

-- Step 3: Add proper foreign key constraint with ON DELETE SET NULL
-- This prevents future orphaned references by automatically nullifying
-- the reference when an employee is deleted
ALTER TABLE defect
DROP CONSTRAINT IF EXISTS fk_defect_reported_by;

ALTER TABLE defect
ADD CONSTRAINT fk_defect_reported_by
FOREIGN KEY (reported_by) REFERENCES employee(id)
ON DELETE SET NULL;

-- ============================================================================
-- Verification queries (run after migration to confirm success)
-- ============================================================================
-- SELECT COUNT(*) AS orphaned_defects FROM defect
-- WHERE reported_by NOT IN (SELECT id FROM employee);
-- Expected result: 0
-- ============================================================================
