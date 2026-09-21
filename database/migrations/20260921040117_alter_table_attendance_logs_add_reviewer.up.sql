ALTER TABLE attendance_logs
  ADD COLUMN reviewed_at BIGINT,
  ADD COLUMN reviewed_by VARCHAR(36),
  ADD COLUMN reject_reason TEXT;