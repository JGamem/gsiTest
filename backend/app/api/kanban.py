
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..db.base import get_db
from ..schemas.kanban import (
    Board, BoardCreate, BoardUpdate, BoardSummary,
    Column, ColumnCreate, ColumnUpdate,
    Task, TaskCreate, TaskUpdate,
    Tag, TagCreate
)
from ..services import kanban as kanban_service

router = APIRouter()

# Board endpoints
@router.post("/boards/", response_model=Board, status_code=201)
def create_board(board: BoardCreate, db: Session = Depends(get_db)):
    """Create a new Kanban board"""
    return kanban_service.create_board(db=db, board=board)

@router.get("/boards/", response_model=List[BoardSummary])
def read_boards(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all Kanban boards summary"""
    return kanban_service.get_boards(db=db, skip=skip, limit=limit)

@router.get("/boards/{board_id}", response_model=Board)
def read_board(board_id: int, db: Session = Depends(get_db)):
    """Get a specific Kanban board with all its columns and tasks"""
    return kanban_service.get_board_with_columns(db=db, board_id=board_id)

@router.put("/boards/{board_id}", response_model=Board)
def update_board(board_id: int, board: BoardUpdate, db: Session = Depends(get_db)):
    """Update a specific Kanban board"""
    return kanban_service.update_board(db=db, board_id=board_id, board=board)

@router.delete("/boards/{board_id}")
def delete_board(board_id: int, db: Session = Depends(get_db)):
    """Delete a specific Kanban board"""
    return kanban_service.delete_board(db=db, board_id=board_id)

# Column endpoints
@router.post("/columns/", response_model=Column, status_code=201)
def create_column(column: ColumnCreate, db: Session = Depends(get_db)):
    """Create a new column in a board"""
    return kanban_service.create_column(db=db, column=column)

@router.get("/boards/{board_id}/columns/", response_model=List[Column])
def read_columns(board_id: int, db: Session = Depends(get_db)):
    """Get all columns for a specific board"""
    return kanban_service.get_columns(db=db, board_id=board_id)

@router.put("/columns/{column_id}", response_model=Column)
def update_column(column_id: int, column: ColumnUpdate, db: Session = Depends(get_db)):
    """Update a specific column"""
    return kanban_service.update_column(db=db, column_id=column_id, column=column)

@router.delete("/columns/{column_id}")
def delete_column(column_id: int, db: Session = Depends(get_db)):
    """Delete a specific column"""
    return kanban_service.delete_column(db=db, column_id=column_id)

# Task endpoints
@router.post("/tasks/", response_model=Task, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task in a column"""
    return kanban_service.create_task(db=db, task=task)

@router.get("/tasks/", response_model=List[Task])
def read_tasks(column_id: Optional[int] = None, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tasks, optionally filtered by column"""
    return kanban_service.get_tasks(db=db, column_id=column_id, skip=skip, limit=limit)

@router.get("/tasks/all", response_model=List[Task])
def read_all_tasks(skip: int = 0, limit: int = 1000, db: Session = Depends(get_db)):
    """Get all tasks across all columns"""
    return kanban_service.get_all_tasks(db=db, skip=skip, limit=limit)

@router.get("/tasks/{task_id}", response_model=Task)
def read_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task"""
    return kanban_service.get_task(db=db, task_id=task_id)

@router.put("/tasks/{task_id}", response_model=Task)
def update_task(task_id: int, task: TaskUpdate, db: Session = Depends(get_db)):
    """Update a specific task"""
    return kanban_service.update_task(db=db, task_id=task_id, task=task)

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """Delete a specific task"""
    return kanban_service.delete_task(db=db, task_id=task_id)

@router.post("/boards/", response_model=Board, status_code=201)
def create_board(board: BoardCreate, db: Session = Depends(get_db)):
    """Create a new Kanban board"""
    return kanban_service.create_board(db=db, board=board)

# Tag endpoints
@router.post("/tags/", response_model=Tag, status_code=201)
def create_tag(tag: TagCreate, db: Session = Depends(get_db)):
    """Create a new tag"""
    return kanban_service.create_tag(db=db, tag=tag)

@router.get("/tags/", response_model=List[Tag])
def read_tags(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tags"""
    return kanban_service.get_tags(db=db, skip=skip, limit=limit)

@router.post("/tasks/{task_id}/tags/{tag_id}")
def add_tag_to_task(task_id: int, tag_id: int, db: Session = Depends(get_db)):
    """Add a tag to a task"""
    return kanban_service.add_tag_to_task(db=db, task_id=task_id, tag_id=tag_id)

@router.delete("/tasks/{task_id}/tags/{tag_id}")
def remove_tag_from_task(task_id: int, tag_id: int, db: Session = Depends(get_db)):
    """Remove a tag from a task"""
    return kanban_service.remove_tag_from_task(db=db, task_id=task_id, tag_id=tag_id)