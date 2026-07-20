-- A schedule targets exactly one of device or group. num_nonnulls counts the
-- non-null target columns; requiring exactly 1 rejects both invalid states
-- (orphan — both null; ambiguous — both set) in a single rule. Existing rows
-- already satisfy this (device schedules set device_id; group schedules set
-- group_id), so the constraint applies without a data rewrite.
ALTER TABLE "schedule" ADD CONSTRAINT "schedule_exactly_one_target_check" CHECK (num_nonnulls("device_id", "group_id") = 1);
