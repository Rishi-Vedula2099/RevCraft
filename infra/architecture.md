# AutoForge AI — AWS Architecture

## System Architecture Diagram

```mermaid
graph TB
    subgraph "Frontend"
        FE["Next.js App<br/>(Vercel / CloudFront+S3)"]
    end

    subgraph "Compute Layer"
        API["FastAPI Backend<br/>(ECS / EC2)"]
    end

    subgraph "Transactional System"
        RDS["Amazon RDS<br/>PostgreSQL 16"]
    end

    subgraph "Data Lake"
        S3["Amazon S3<br/>Build Snapshots + Logs"]
    end

    subgraph "Data Warehouse"
        RS["Amazon Redshift<br/>Analytics Tables"]
    end

    subgraph "AI Layer"
        AI["OpenAI API<br/>GPT-4o-mini"]
    end

    subgraph "ETL Pipeline"
        GLUE["AWS Glue / COPY<br/>Scheduled Jobs"]
    end

    FE -->|REST API| API
    API -->|Read/Write| RDS
    API -->|Store Snapshots| S3
    API -->|AI Insights| AI
    S3 -->|Batch Load| GLUE
    GLUE -->|Transform + Load| RS
    API -.->|Cached Analytics| RS
```

## Data Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant PostgreSQL
    participant S3
    participant Glue
    participant Redshift

    User->>Frontend: Modify car config
    Frontend->>Backend: POST /scoring/calculate
    Backend->>Backend: Calculate performance stats
    Backend-->>Frontend: Return stats + class

    User->>Frontend: Save build
    Frontend->>Backend: POST /builds
    Backend->>PostgreSQL: Save build (latest state)
    Backend->>S3: Store JSON snapshot (gzip)
    Backend-->>Frontend: Build saved

    Note over Glue: Scheduled (hourly/daily)
    Glue->>S3: Read new snapshots
    Glue->>Redshift: COPY + Transform
    Glue->>Redshift: Refresh aggregations

    Frontend->>Backend: GET /analytics/*
    Backend->>Redshift: Query cached aggregations
    Backend-->>Frontend: Analytics data
```

## S3 Data Lake Structure

```
s3://revcraft-data-lake/
├── builds/
│   └── {user_id}/
│       └── {build_id}/
│           └── {timestamp}.json.gz
├── logs/
│   └── {user_id}/
│       └── {date}/
│           └── {timestamp}_{action}.json.gz
└── exports/
    └── users/
        └── users_export.json
```

## Redshift Schema

| Table | Type | Purpose |
|-------|------|---------|
| `fact_builds` | Fact | Every build snapshot (dist by user_id, sort by timestamp) |
| `dim_users` | Dimension | User lookup (dist ALL) |
| `agg_class_distribution` | Aggregate | Class counts + percentages |
| `agg_leaderboard` | Aggregate | Top 100 builds ranked |
| `agg_daily_trends` | Aggregate | Daily avg scores + build counts |
