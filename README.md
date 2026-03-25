# 🏎️ RevCraft — Cloud-Native Car Builder & Analytics Platform

A production-grade AI-powered car customization platform with real-time 3D building, AI insights, performance scoring, class rankings, and cloud-native analytics.

## ⚡ Quick Start

### Prerequisites
- **Node.js** 18+
- **Python** 3.11+
- **Docker** (optional, for full stack)

### Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt

# Copy environment variables
cp ../.env.example ../.env

# Start server
uvicorn main:app --reload --port 8000
# → http://localhost:8000/docs
```

### Docker Compose (Full Stack)
```bash
cp .env.example .env
docker-compose up
# Frontend: http://localhost:3000
# Backend:  http://localhost:8000
# S3 Mock:  http://localhost:4566
```

---

## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend   │────▶│   Backend   │────▶│ PostgreSQL  │
│   Next.js    │     │   FastAPI   │     │    (RDS)    │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
              ┌──────────┐ ┌──────────┐
              │ Amazon   │ │  OpenAI  │
              │   S3     │ │   API    │
              └────┬─────┘ └──────────┘
                   │
              ┌────▼─────┐
              │  Glue /  │
              │  COPY    │
              └────┬─────┘
                   │
              ┌────▼─────┐
              │ Redshift │
              │ Analytics│
              └──────────┘
```

### Data Flow
1. User modifies car → Frontend sends config to Backend
2. Backend calculates performance → Returns stats + class
3. On save → Write to PostgreSQL (live) + S3 (snapshot)
4. Scheduled ETL → Glue/COPY loads S3 data into Redshift
5. Analytics API → Cached queries from Redshift aggregations

---

## 📁 Project Structure

```
RevCraft/
├── frontend/                   # Next.js 15 + React Three Fiber
│   └── src/
│       ├── app/               # Pages (App Router)
│       │   ├── page.tsx       # Landing page
│       │   ├── builder/       # 3D car builder
│       │   ├── garage/        # Saved builds
│       │   ├── analytics/     # Analytics dashboard
│       │   └── leaderboard/   # Rankings
│       ├── components/        # React components
│       │   ├── CarCanvas.tsx   # Three.js viewport
│       │   ├── CarModel.tsx    # 3D car geometry
│       │   ├── ConfigPanel.tsx # Configurator
│       │   ├── StatsPanel.tsx  # Performance stats
│       │   └── ...
│       └── lib/
│           ├── api.ts         # API client
│           └── store.ts       # Zustand state
│
├── backend/                   # FastAPI (Python)
│   ├── main.py               # App entry point
│   ├── config.py             # Settings
│   ├── database.py           # SQLAlchemy setup
│   ├── models.py             # ORM models
│   ├── schemas.py            # Pydantic schemas
│   ├── scoring.py            # Performance engine
│   ├── ai_engine.py          # OpenAI integration
│   ├── s3_service.py         # S3 data lake
│   ├── auth.py               # JWT authentication
│   └── routes/
│       ├── auth.py           # Auth endpoints
│       ├── builds.py         # CRUD builds
│       ├── scoring.py        # Stat calculator
│       ├── ai.py             # AI insights
│       └── analytics.py      # Analytics queries
│
├── infra/                     # Infrastructure as Code
│   ├── architecture.md        # Architecture docs
│   ├── cloudformation/
│   │   └── template.yaml      # AWS CloudFormation
│   └── redshift/
│       ├── create_tables.sql  # Warehouse DDL
│       └── etl_queries.sql    # S3 → Redshift ETL
│
├── docker-compose.yml         # Local dev stack
└── .env.example               # Environment template
```

---

## 🎮 Features

| Feature | Description |
|---------|-------------|
| **3D Car Builder** | Interactive Three.js viewport with 6 body types, 12 engines, and full part configurator |
| **Performance Scoring** | Real-time stat calculation: HP, torque, weight, top speed, acceleration, handling |
| **Class Rankings** | D → S tier system based on weighted performance score |
| **AI Insights** | OpenAI-powered build analysis with upgrade suggestions |
| **Garage System** | Save, load, and manage unlimited builds |
| **Analytics Dashboard** | Class distribution, trends, popular configs (powered by Redshift) |
| **Leaderboard** | Global rankings by performance score |

---

## 🏁 Class System

| Class | Score Range | Description |
|-------|-----------|-------------|
| **D** | < 300 | Economy builds |
| **C** | 300–449 | Street-level performance |
| **B** | 450–599 | Sport-class builds |
| **A** | 600–749 | High-performance machines |
| **S** | ≥ 750 | Elite, top-tier engineering |

**Score Formula:**
```
Score = 0.35·HP + 0.20·Speed + 0.15·Handling + 0.15·Acceleration + 0.10·Torque − 0.05·Weight
```
*(All stats normalized to 0–1000 range)*

---

## ☁️ AWS Services

| Service | Purpose |
|---------|---------|
| **RDS PostgreSQL** | Transactional database (users, live builds) |
| **Amazon S3** | Data lake (build snapshots, activity logs) |
| **Amazon Redshift** | Analytics warehouse (aggregations, leaderboard) |
| **AWS Glue** | ETL pipeline (S3 → Redshift) |
| **ECS / EC2** | Backend compute |
| **CloudFront + S3** | Frontend hosting |

---

## 🧠 API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Register new user |
| `POST` | `/auth/login` | Login (JWT) |
| `POST` | `/scoring/calculate` | Calculate stats (stateless) |
| `POST` | `/builds` | Create build |
| `GET` | `/builds` | List user builds |
| `GET` | `/builds/{id}` | Get build details |
| `PUT` | `/builds/{id}` | Update build |
| `DELETE` | `/builds/{id}` | Delete build |
| `POST` | `/ai/insights` | Generate AI analysis |
| `GET` | `/analytics/leaderboard` | Top builds |
| `GET` | `/analytics/class-distribution` | Class stats |
| `GET` | `/analytics/trends` | Score trends |
| `GET` | `/analytics/stats` | Platform overview |

---

