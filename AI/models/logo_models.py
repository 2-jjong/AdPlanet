from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum

class LogoStyle(str, Enum):
    """로고 스타일 enum"""
    SIMPLE = "SIMPLE"
    MONO = "MONO"
    PUNK = "PUNK"
    CARTOON = "CARTOON"

class LogoRequest(BaseModel):
    """로고 생성 요청 DTO"""
    prompt: str = Field(..., description="로고 생성 프롬프트", min_length=1, max_length=1000)
    style: LogoStyle = Field(default=LogoStyle.SIMPLE, description="로고 스타일")
    width: Optional[int] = Field(default=800, description="이미지 너비", ge=100, le=2000)
    height: Optional[int] = Field(default=600, description="이미지 높이", ge=100, le=2000)

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Create a modern, minimalist logo with clean typography",
                "style": "SIMPLE",
                "width": 800,
                "height": 600
            }
        }

