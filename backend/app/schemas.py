from datetime import date
from typing import Optional

from pydantic import BaseModel


class EntryBase(BaseModel):
    title: str
    details: Optional[str] = None
    category: str = "task"
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[date] = None
    tags: Optional[str] = None


class EntryCreate(EntryBase):
    pass


class EntryUpdate(EntryBase):
    pass


class EntryOut(EntryBase):
    id: int

    class Config:
        from_attributes = True
