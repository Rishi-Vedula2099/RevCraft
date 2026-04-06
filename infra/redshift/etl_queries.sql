-- =========================================================
-- AutoForge AI — ETL: S3 → Redshift Pipeline
-- =========================================================

-- Step 1: COPY build snapshots from S3 into fact_builds
-- Run via Glue job or scheduled Lambda
COPY fact_builds
FROM 's3://revcraft-data-lake/builds/'
IAM_ROLE 'arn:aws:iam::ACCOUNT_ID:role/RedshiftS3ReadRole'
FORMAT AS JSON 'auto'
GZIP
TIMEFORMAT 'auto'
TRUNCATECOLUMNS
MAXERROR 100;


-- Step 2: Refresh dim_users from latest RDS export
COPY dim_users
FROM 's3://revcraft-data-lake/exports/users/'
IAM_ROLE 'arn:aws:iam::ACCOUNT_ID:role/RedshiftS3ReadRole'
FORMAT AS JSON 'auto'
TRUNCATECOLUMNS;


-- Step 3: Refresh aggregation tables

-- 3a: Class distribution
BEGIN;
DELETE FROM agg_class_distribution;

INSERT INTO agg_class_distribution (car_class, build_count, percentage, last_updated)
SELECT
    car_class,
    COUNT(DISTINCT build_id) AS build_count,
    ROUND(COUNT(DISTINCT build_id) * 100.0 / NULLIF((SELECT COUNT(DISTINCT build_id) FROM fact_builds), 0), 1) AS percentage,
    GETDATE()
FROM fact_builds
GROUP BY car_class;
COMMIT;


-- 3b: Leaderboard (latest snapshot per build, top 100)
BEGIN;
DELETE FROM agg_leaderboard;

INSERT INTO agg_leaderboard (rank_position, user_id, username, build_id, build_name, performance_score, car_class, last_updated)
SELECT
    ROW_NUMBER() OVER (ORDER BY fb.performance_score DESC) AS rank_position,
    fb.user_id,
    du.username,
    fb.build_id,
    fb.build_name,
    fb.performance_score,
    fb.car_class,
    GETDATE()
FROM (
    SELECT *,
        ROW_NUMBER() OVER (PARTITION BY build_id ORDER BY snapshot_timestamp DESC) AS rn
    FROM fact_builds
) fb
JOIN dim_users du ON fb.user_id = du.user_id
WHERE fb.rn = 1
ORDER BY fb.performance_score DESC
LIMIT 100;
COMMIT;


-- 3c: Daily trends (last 90 days)
BEGIN;
DELETE FROM agg_daily_trends;

INSERT INTO agg_daily_trends (trend_date, avg_score, build_count, last_updated)
SELECT
    DATE(snapshot_timestamp) AS trend_date,
    ROUND(AVG(performance_score), 1) AS avg_score,
    COUNT(DISTINCT build_id) AS build_count,
    GETDATE()
FROM fact_builds
WHERE snapshot_timestamp >= DATEADD(day, -90, GETDATE())
GROUP BY DATE(snapshot_timestamp)
ORDER BY trend_date;
COMMIT;


-- =========================================================
-- Useful Analytics Queries
-- =========================================================

-- Top S-Class builds
SELECT username, build_name, performance_score
FROM agg_leaderboard
WHERE car_class = 'S'
ORDER BY performance_score DESC
LIMIT 20;

-- Most popular engine choices
SELECT engine, COUNT(*) AS usage_count
FROM fact_builds
GROUP BY engine
ORDER BY usage_count DESC
LIMIT 10;

-- Average score by body type
SELECT body_type, ROUND(AVG(performance_score), 1) AS avg_score, COUNT(*) AS count
FROM fact_builds
GROUP BY body_type
ORDER BY avg_score DESC;

-- Users with most builds
SELECT du.username, COUNT(DISTINCT fb.build_id) AS build_count
FROM fact_builds fb
JOIN dim_users du ON fb.user_id = du.user_id
GROUP BY du.username
ORDER BY build_count DESC
LIMIT 20;
