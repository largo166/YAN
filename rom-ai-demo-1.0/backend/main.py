from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.cloud import ensure_cloud_root
from app.database import init_db
from app.database import SessionLocal
from app.services import ensure_digital_employees
from app.routes.agents import router as agents_router
from app.routes.boss import router as boss_router
from app.routes.dashboard import router as dashboard_router
from app.routes.designers import router as designers_router
from app.routes.health import router as health_router
from app.routes.knowledge import router as knowledge_router
from app.routes.projects import router as projects_router
from app.routes.meetings import router as meetings_router
from app.routes.tasks import router as tasks_router
from app.routes.skill_cards import router as skill_cards_router
from app.routes.team import router as team_router
from app.routes.tech_points import router as tech_points_router


app = FastAPI(
    title="RMO-Ai Backend",
    description="以 Project 为中心的智能设计工作台后端",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5175", "http://localhost:5175", "http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(projects_router)
app.include_router(knowledge_router)
app.include_router(agents_router)
app.include_router(designers_router)
app.include_router(dashboard_router)
app.include_router(meetings_router)
app.include_router(tasks_router)
app.include_router(skill_cards_router)
app.include_router(team_router)
app.include_router(boss_router)
app.include_router(tech_points_router)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    settings.upload_root_path.mkdir(parents=True, exist_ok=True)
    ensure_cloud_root()
    db = SessionLocal()
    try:
        ensure_digital_employees(db)
    finally:
        db.close()
