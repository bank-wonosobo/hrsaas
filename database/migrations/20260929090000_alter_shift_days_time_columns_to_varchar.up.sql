ALTER TABLE shift_days
    ALTER COLUMN check_in TYPE VARCHAR(8)
    USING CASE
        WHEN check_in IS NULL THEN NULL
        ELSE to_char(to_timestamp(check_in / 1000.0) AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS')
    END,
    ALTER COLUMN check_out TYPE VARCHAR(8)
    USING CASE
        WHEN check_out IS NULL THEN NULL
        ELSE to_char(to_timestamp(check_out / 1000.0) AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS')
    END,
    ALTER COLUMN break_start TYPE VARCHAR(8)
    USING CASE
        WHEN break_start IS NULL THEN NULL
        ELSE to_char(to_timestamp(break_start / 1000.0) AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS')
    END,
    ALTER COLUMN break_end TYPE VARCHAR(8)
    USING CASE
        WHEN break_end IS NULL THEN NULL
        ELSE to_char(to_timestamp(break_end / 1000.0) AT TIME ZONE 'Asia/Jakarta', 'HH24:MI:SS')
    END;
