from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from enum import Enum

# Enums
class TaskStatus(str, Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"

class TaskPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

# Tag schemas
class TagBase(BaseModel):
    name: str
    color: str = "#3498db"

class TagCreate(TagBase):
    pass

class Tag(TagBase):
    id: int
    
    class Config:
        from_attributes = True

# Task schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    order: int = 0
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    column_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    order: Optional[int] = None
    column_id: Optional[int] = None
    due_date: Optional[datetime] = None

class Task(TaskBase):
    id: int
    column_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tags: List[Tag] = []
    
    class Config:
        from_attributes = True

# Column schemas
class ColumnBase(BaseModel):
    name: str
    order: int = 0

class ColumnCreate(ColumnBase):
    board_id: int

class ColumnUpdate(BaseModel):
    name: Optional[str] = None
    order: Optional[int] = None

class Column(ColumnBase):
    id: int
    board_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    tasks: List[Task] = []
    
    model_config = {"from_attributes": True}

# Board schemas
class BoardBase(BaseModel):
    name: str
    description: Optional[str] = None

class BoardCreate(BoardBase):
    pass

class BoardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class Board(BoardBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    columns: List[Column] = []
    
    class Config:
        from_attributes = True
        orm_mode = True
        
class BoardSummary(BoardBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        orm_mode = True