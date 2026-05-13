from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select
from sqlalchemy.orm import Session

from .database import Base, SessionLocal, engine
from .models import Entry
from .schemas import EntryCreate, EntryOut, EntryUpdate

app = FastAPI(title="Atlas Workspace")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)


def get_session() -> Session:
    return SessionLocal()


@app.get("/entries", response_model=list[EntryOut])
def list_entries() -> list[EntryOut]:
    with get_session() as session:
        entries = session.execute(select(Entry).order_by(Entry.id.desc())).scalars().all()
        return entries


@app.post("/entries", response_model=EntryOut)
def create_entry(payload: EntryCreate) -> EntryOut:
    with get_session() as session:
        entry = Entry(
            title=payload.title,
            details=payload.details,
            category=payload.category,
            status=payload.status,
            priority=payload.priority,
            due_date=payload.due_date,
            tags=payload.tags,
        )
        session.add(entry)
        session.commit()
        session.refresh(entry)
        return entry


@app.put("/entries/{entry_id}", response_model=EntryOut)
def update_entry(entry_id: int, payload: EntryUpdate) -> EntryOut:
    with get_session() as session:
        entry = session.get(Entry, entry_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Entry not found")
        entry.title = payload.title
        entry.details = payload.details
        entry.category = payload.category
        entry.status = payload.status
        entry.priority = payload.priority
        entry.due_date = payload.due_date
        entry.tags = payload.tags
        session.commit()
        session.refresh(entry)
        return entry


@app.delete("/entries/{entry_id}")
def delete_entry(entry_id: int) -> dict:
    with get_session() as session:
        entry = session.get(Entry, entry_id)
        if not entry:
            raise HTTPException(status_code=404, detail="Entry not found")
        session.delete(entry)
        session.commit()
        return {"status": "deleted"}
