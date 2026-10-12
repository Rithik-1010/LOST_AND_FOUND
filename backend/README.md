# Campus Lost & Found — Backend API

FastAPI backend service powering the Campus Lost & Found Portal. Built with **FastAPI**, **SQLAlchemy (Async)**, and **Alembic**.

---

## 🚀 Features

- **Asynchronous Database ORM**: Powered by SQLAlchemy 2.0 with eager loading for clean serialization.
- **RESTful Endpoints**: Full CRUD for items, categories, campus zones, ownership claims, and student profiles.
- **Image Upload Support**: Static file storage for photos of lost/found items.
- **Interactive OpenAPI Documentation**: Swagger UI out-of-the-box.
- **Database Migrations & Seeding**: Pre-configured Alembic migrations and custom dataset generator.

---

## 🛠️ Setup & Running

### 1. Create Virtual Environment & Install Dependencies
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
pip install email-validator
```

### 2. Run Database Migrations
```bash
alembic upgrade head
```

### 3. Seed Database
```bash
python seed.py
```

### 4. Start Development Server
```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

---

## 📡 API Documentation
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
- **Health Check**: `GET /health`
