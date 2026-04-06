-- =========================================================
-- AutoForge AI — Redshift Data Warehouse Schema
-- =========================================================

-- Fact table: Every build event (loaded from S3 via COPY/Glue)
CREATE TABLE IF NOT EXISTS fact_builds (
    build_id        VARCHAR(36)   NOT NULL,
    user_id         VARCHAR(36)   NOT NULL,
    build_name      VARCHAR(100),
    body_type       VARCHAR(20),
    engine          VARCHAR(30),
    turbo           BOOLEAN       DEFAULT FALSE,
    transmission    VARCHAR(20),
    spoiler         VARCHAR(20),
    wheels          VARCHAR(20),
    suspension      VARCHAR(20),
    brakes          VARCHAR(20),
    exhaust         VARCHAR(20),
    aero_kit        VARCHAR(20),
    weight_reduction VARCHAR(20),
    color           VARCHAR(10),
    horsepower      FLOAT,
    torque          FLOAT,
    weight          FLOAT,
    top_speed       FLOAT,
    acceleration    FLOAT,
    handling        FLOAT,
    performance_score FLOAT,
    car_class       VARCHAR(1),
    snapshot_timestamp TIMESTAMP   DEFAULT GETDATE(),
    PRIMARY KEY (build_id, snapshot_timestamp)
)
DISTSTYLE KEY
DISTKEY (user_id)
SORTKEY (snapshot_timestamp);


-- Dimension table: Users
CREATE TABLE IF NOT EXISTS dim_users (
    user_id     VARCHAR(36)   PRIMARY KEY,
    username    VARCHAR(50)   NOT NULL,
    email       VARCHAR(255),
    created_at  TIMESTAMP     DEFAULT GETDATE()
)
DISTSTYLE ALL;


-- Materialized view: Class distribution aggregate
CREATE TABLE IF NOT EXISTS agg_class_distribution (
    car_class   VARCHAR(1)   PRIMARY KEY,
    build_count INTEGER,
    percentage  FLOAT,
    last_updated TIMESTAMP   DEFAULT GETDATE()
)
DISTSTYLE ALL;


-- Materialized view: Leaderboard (top builds)
CREATE TABLE IF NOT EXISTS agg_leaderboard (
    rank_position     INTEGER,
    user_id           VARCHAR(36),
    username          VARCHAR(50),
    build_id          VARCHAR(36),
    build_name        VARCHAR(100),
    performance_score FLOAT,
    car_class         VARCHAR(1),
    last_updated      TIMESTAMP DEFAULT GETDATE()
)
DISTSTYLE ALL
SORTKEY (rank_position);


-- Materialized view: Daily trends
CREATE TABLE IF NOT EXISTS agg_daily_trends (
    trend_date   DATE         PRIMARY KEY,
    avg_score    FLOAT,
    build_count  INTEGER,
    new_users    INTEGER      DEFAULT 0,
    last_updated TIMESTAMP    DEFAULT GETDATE()
)
DISTSTYLE ALL
SORTKEY (trend_date);
