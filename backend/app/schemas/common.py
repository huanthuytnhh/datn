from pydantic import BaseModel
from typing import Generic, List, TypeVar

T = TypeVar("T")


class Paginated(BaseModel, Generic[T]):
    items: List[T]
    total: int
    page: int
    limit: int


class MessageResponse(BaseModel):
    message: str
