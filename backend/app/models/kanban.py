from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..db.base import Base

class TaskStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"

class TaskPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class KanbanBoard(Base):
    __tablename__ = "kanban_boards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    columns = relationship("KanbanColumn", back_populates="board", cascade="all, delete-orphan")

class KanbanColumn(Base):
    __tablename__ = "kanban_columns"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    order = Column(Integer, default=0)
    board_id = Column(Integer, ForeignKey("kanban_boards.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    board = relationship("KanbanBoard", back_populates="columns")
    tasks = relationship("KanbanTask", back_populates="column", cascade="all, delete-orphan")

class KanbanTask(Base):
    __tablename__ = "kanban_tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Enum(TaskStatus), default=TaskStatus.TODO)
    priority = Column(Enum(TaskPriority), default=TaskPriority.MEDIUM)
    order = Column(Integer, default=0)
    column_id = Column(Integer, ForeignKey("kanban_columns.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    due_date = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    column = relationship("KanbanColumn", back_populates="tasks")
    tags = relationship("TaskTag", back_populates="task", cascade="all, delete-orphan")

class Tag(Base):
    __tablename__ = "tags"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), nullable=False, unique=True)
    color = Column(String(7), nullable=False, default="#3498db")  # Hex color code
    
    # Relationships
    task_tags = relationship("TaskTag", back_populates="tag", cascade="all, delete-orphan")

class TaskTag(Base):
    __tablename__ = "task_tags"
    
    task_id = Column(Integer, ForeignKey("kanban_tasks.id"), primary_key=True)
    tag_id = Column(Integer, ForeignKey("tags.id"), primary_key=True)
    
    # Relationships
    task = relationship("KanbanTask", back_populates="tags")
    tag = relationship("Tag", back_populates="task_tags")