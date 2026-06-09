# -*- coding: utf-8 -*-
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.database import get_db
from app.mock_data import MOCK_TEAM_MEMBERS

router = APIRouter(prefix="/api/projects/{project_id}/team", tags=["team"])


def _get_project_or_404(db: Session, project_id: str) -> models.Project:
    project = crud.get_project(db, project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project


@router.get("", response_model=list[schemas.TeamAssignmentOut])
def get_project_team(project_id: str, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    return list(db.scalars(
        select(models.TeamAssignment)
        .where(models.TeamAssignment.project_id == project_id)
        .order_by(models.TeamAssignment.created_at)
    ))


@router.post("", response_model=schemas.TeamAssignmentOut, status_code=201)
def add_team_member(project_id: str, payload: schemas.TeamAssignmentCreate, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    assignment = models.TeamAssignment(project_id=project_id, **payload.model_dump())
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.put("/{assignment_id}", response_model=schemas.TeamAssignmentOut)
def update_team_member(
    project_id: str,
    assignment_id: str,
    payload: schemas.TeamAssignmentUpdate,
    db: Session = Depends(get_db),
):
    _get_project_or_404(db, project_id)
    assignment = db.scalar(select(models.TeamAssignment).where(models.TeamAssignment.id == assignment_id))
    if not assignment:
        raise HTTPException(status_code=404, detail="团队分工记录不存在")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(assignment, key, value)
    db.commit()
    db.refresh(assignment)
    return assignment


@router.delete("/{assignment_id}", status_code=204)
def remove_team_member(project_id: str, assignment_id: str, db: Session = Depends(get_db)):
    _get_project_or_404(db, project_id)
    assignment = db.scalar(select(models.TeamAssignment).where(models.TeamAssignment.id == assignment_id))
    if not assignment:
        raise HTTPException(status_code=404, detail="团队分工记录不存在")
    db.delete(assignment)
    db.commit()


@router.get("/members")
def get_all_members(db: Session = Depends(get_db)):
    """获取所有成员（人类 + AI数字员工）"""
    human_members = [
        {"id": "human-1", "name": "张工", "type": "human", "role": "总图负责人"},
        {"id": "human-2", "name": "李工", "type": "human", "role": "立面负责人"},
        {"id": "human-3", "name": "王工", "type": "human", "role": "项目经理"},
    ]
    ai_members = list(db.scalars(select(models.DigitalEmployee).order_by(models.DigitalEmployee.name)))
    ai_list = [
        {"id": f"ai-{e.avatar}", "name": e.name, "type": "ai", "role": e.role}
        for e in ai_members
    ]
    return {"members": human_members + ai_list}
