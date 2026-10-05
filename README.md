# Campus Lost & Found Portal

An AI-powered Campus Lost & Found Portal built with Next.js, FastAPI, and PostgreSQL.

## Features (Phase 1)
- Report Lost and Found Items
- Feed with Filters
- Item Detail Page
- PostgreSQL Database with SQLAlchemy Models

## Setup Instructions (Under 10 Commands)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Rithik-1010/LOST_AND_FOUND.git
   cd LOST_AND_FOUND
   ```

2. **Environment Variables**:
   ```bash
   cp .env.example .env
   # Edit .env and configure your Google Client ID and any necessary secrets.
   ```

3. **Start the Database (and optionally backend) via Docker**:
   ```bash
   docker-compose up -d
   ```

4. **Initialize Database (if not running backend in docker)**:
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: .\venv\Scripts\activate
   pip install -r requirements.txt
   alembic revision --autogenerate -m "Initial migration"
   alembic upgrade head
   uvicorn app.main:app --reload
   ```

5. **Start the Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

Visit `http://localhost:3000` to see the portal.
Visit `http://localhost:8000/docs` to see the FastAPI Swagger docs.

## Future Scope
- AI-based semantic text and image matching.
- Auto-fill forms from images.
- Chat system for secure communication.
- QR tag system.
- Campus heatmap analytics.
