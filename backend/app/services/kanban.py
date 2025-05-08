from sqlalchemy.orm import Session, joinedload
from ..models.kanban import KanbanBoard, KanbanColumn, KanbanTask, Tag, TaskTag
from ..schemas.kanban import BoardCreate, BoardUpdate, ColumnCreate, ColumnUpdate, TaskCreate, TaskUpdate, TagCreate
from fastapi import HTTPException, status
from typing import List, Optional

# Board services
def get_boards(db: Session, skip: int = 0, limit: int = 100):
    boards = db.query(KanbanBoard).offset(skip).limit(limit).all()
    result = []
    for board in boards:
        result.append({
            "id": board.id,
            "name": board.name,
            "description": board.description,
            "created_at": board.created_at,
            "updated_at": board.updated_at
        })
    return result

def get_board(db: Session, board_id: int):
    board = db.query(KanbanBoard).filter(KanbanBoard.id == board_id).first()
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    
    # Convertir a diccionario
    return {
        "id": board.id,
        "name": board.name,
        "description": board.description,
        "created_at": board.created_at,
        "updated_at": board.updated_at,
        "columns": []
    }

def get_board_with_columns(db: Session, board_id: int):
    board = db.query(KanbanBoard).options(
        joinedload(KanbanBoard.columns).joinedload(KanbanColumn.tasks)
    ).filter(KanbanBoard.id == board_id).first()
    
    if not board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    
    columns_dict = []
    for column in board.columns:
        tasks_dict = []
        for task in column.tasks:
            tasks_dict.append({
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "status": task.status,
                "priority": task.priority,
                "order": task.order,
                "column_id": task.column_id,
                "created_at": task.created_at,
                "updated_at": task.updated_at,
                "due_date": task.due_date,
                "tags": []
            })
        
        columns_dict.append({
            "id": column.id,
            "name": column.name,
            "order": column.order,
            "board_id": column.board_id,
            "created_at": column.created_at,
            "updated_at": column.updated_at,
            "tasks": tasks_dict
        })
    
    return {
        "id": board.id,
        "name": board.name,
        "description": board.description,
        "created_at": board.created_at,
        "updated_at": board.updated_at,
        "columns": columns_dict
    }

def create_board(db: Session, board: BoardCreate):
    db_board = KanbanBoard(**board.dict())
    db.add(db_board)
    db.commit()
    db.refresh(db_board)
    
    return {
        "id": db_board.id,
        "name": db_board.name,
        "description": db_board.description,
        "created_at": db_board.created_at,
        "updated_at": db_board.updated_at,
        "columns": []
    }

def update_board(db: Session, board_id: int, board: BoardUpdate):
    db_board = get_board(db, board_id)
    
    # Obtener el objeto original antes de modificarlo
    original_board = db.query(KanbanBoard).filter(KanbanBoard.id == board_id).first()
    
    update_data = board.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(original_board, key, value)
        
    db.commit()
    db.refresh(original_board)
    
    # Devolver diccionario explícito
    return {
        "id": original_board.id,
        "name": original_board.name,
        "description": original_board.description,
        "created_at": original_board.created_at,
        "updated_at": original_board.updated_at,
        "columns": []
    }

def delete_board(db: Session, board_id: int):
    db_board = db.query(KanbanBoard).filter(KanbanBoard.id == board_id).first()
    if not db_board:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Board not found")
    
    db.delete(db_board)
    db.commit()
    return {"message": "Board successfully deleted"}

# Column services
def get_columns(db: Session, board_id: int):
    columns = db.query(KanbanColumn).filter(KanbanColumn.board_id == board_id).order_by(KanbanColumn.order).all()
    
    # Convertir a lista de diccionarios
    result = []
    for column in columns:
        result.append({
            "id": column.id,
            "name": column.name,
            "order": column.order,
            "board_id": column.board_id,
            "created_at": column.created_at,
            "updated_at": column.updated_at,
            "tasks": []
        })
    return result

def get_column(db: Session, column_id: int):
    column = db.query(KanbanColumn).filter(KanbanColumn.id == column_id).first()
    if not column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    
    # Convertir a diccionario
    return {
        "id": column.id,
        "name": column.name,
        "order": column.order,
        "board_id": column.board_id,
        "created_at": column.created_at,
        "updated_at": column.updated_at,
        "tasks": []
    }

def create_column(db: Session, column: ColumnCreate):
    db_column = KanbanColumn(**column.dict())
    db.add(db_column)
    db.commit()
    db.refresh(db_column)
    
    return {
        "id": db_column.id,
        "name": db_column.name,
        "order": db_column.order,
        "board_id": db_column.board_id,
        "created_at": db_column.created_at,
        "updated_at": db_column.updated_at,
        "tasks": []
    }

def update_column(db: Session, column_id: int, column: ColumnUpdate):
    db_column = db.query(KanbanColumn).filter(KanbanColumn.id == column_id).first()
    if not db_column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    
    update_data = column.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_column, key, value)
        
    db.commit()
    db.refresh(db_column)
    
    # Devolver diccionario explícito
    return {
        "id": db_column.id,
        "name": db_column.name,
        "order": db_column.order,
        "board_id": db_column.board_id,
        "created_at": db_column.created_at,
        "updated_at": db_column.updated_at,
        "tasks": []
    }

def delete_column(db: Session, column_id: int):
    db_column = db.query(KanbanColumn).filter(KanbanColumn.id == column_id).first()
    if not db_column:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Column not found")
    
    db.delete(db_column)
    db.commit()
    return {"message": "Column successfully deleted"}

# Task services
def get_tasks(db: Session, column_id: Optional[int] = None, skip: int = 0, limit: int = 100):
    query = db.query(KanbanTask)
    if column_id:
        query = query.filter(KanbanTask.column_id == column_id)
    
    tasks = query.order_by(KanbanTask.order).offset(skip).limit(limit).all()
    
    # Convertir a lista de diccionarios
    result = []
    for task in tasks:
        result.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "order": task.order,
            "column_id": task.column_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "due_date": task.due_date,
            "tags": []
        })
    return result

def get_all_tasks(db: Session, skip: int = 0, limit: int = 1000):
    """Get all tasks across all columns"""
    tasks = db.query(KanbanTask).offset(skip).limit(limit).all()
    
    # Convertir a lista de diccionarios
    result = []
    for task in tasks:
        result.append({
            "id": task.id,
            "title": task.title,
            "description": task.description,
            "status": task.status,
            "priority": task.priority,
            "order": task.order,
            "column_id": task.column_id,
            "created_at": task.created_at,
            "updated_at": task.updated_at,
            "due_date": task.due_date,
            "tags": []
        })
    return result

def get_task(db: Session, task_id: int):
    task = db.query(KanbanTask).filter(KanbanTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    # Convertir a diccionario
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "priority": task.priority,
        "order": task.order,
        "column_id": task.column_id,
        "created_at": task.created_at,
        "updated_at": task.updated_at,
        "due_date": task.due_date,
        "tags": []
    }

def create_task(db: Session, task: TaskCreate):
    db_task = KanbanTask(**task.dict())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    return {
        "id": db_task.id,
        "title": db_task.title,
        "description": db_task.description,
        "status": db_task.status,
        "priority": db_task.priority,
        "order": db_task.order,
        "column_id": db_task.column_id,
        "created_at": db_task.created_at,
        "updated_at": db_task.updated_at,
        "due_date": db_task.due_date,
        "tags": [] 
    }

def update_task(db: Session, task_id: int, task: TaskUpdate):
    db_task = db.query(KanbanTask).filter(KanbanTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    update_data = task.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_task, key, value)
        
    db.commit()
    db.refresh(db_task)
    
    # Devolver diccionario explícito
    return {
        "id": db_task.id,
        "title": db_task.title,
        "description": db_task.description,
        "status": db_task.status,
        "priority": db_task.priority,
        "order": db_task.order,
        "column_id": db_task.column_id,
        "created_at": db_task.created_at,
        "updated_at": db_task.updated_at,
        "due_date": db_task.due_date,
        "tags": []
    }

def delete_task(db: Session, task_id: int):
    db_task = db.query(KanbanTask).filter(KanbanTask.id == task_id).first()
    if not db_task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    
    db.delete(db_task)
    db.commit()
    return {"message": "Task successfully deleted"}

# Tag services
def get_tags(db: Session, skip: int = 0, limit: int = 100):
    tags = db.query(Tag).offset(skip).limit(limit).all()
    
    # Convertir a lista de diccionarios
    result = []
    for tag in tags:
        result.append({
            "id": tag.id,
            "name": tag.name,
            "color": tag.color
        })
    return result

def get_tag(db: Session, tag_id: int):
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    
    # Convertir a diccionario
    return {
        "id": tag.id,
        "name": tag.name,
        "color": tag.color
    }

def create_tag(db: Session, tag: TagCreate):
    db_tag = Tag(**tag.dict())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    
    # Devolver diccionario explícito
    return {
        "id": db_tag.id,
        "name": db_tag.name,
        "color": db_tag.color
    }

def add_tag_to_task(db: Session, task_id: int, tag_id: int):
    # Check if task and tag exist
    task = db.query(KanbanTask).filter(KanbanTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
        
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not found")
    
    # Check if the relation already exists
    existing = db.query(TaskTag).filter(
        TaskTag.task_id == task_id,
        TaskTag.tag_id == tag_id
    ).first()
    
    if existing:
        return {"message": "Tag already added to task"}
    
    # Create the relation
    task_tag = TaskTag(task_id=task_id, tag_id=tag_id)
    db.add(task_tag)
    db.commit()
    return {"message": "Tag successfully added to task"}

def remove_tag_from_task(db: Session, task_id: int, tag_id: int):
    task_tag = db.query(TaskTag).filter(
        TaskTag.task_id == task_id,
        TaskTag.tag_id == tag_id
    ).first()
    
    if not task_tag:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Tag not assigned to task")
    
    db.delete(task_tag)
    db.commit()
    return {"message": "Tag successfully removed from task"}