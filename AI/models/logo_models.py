from pydantic import BaseModel, Field
from typing import Optional

class LogoRequest(BaseModel):
    """로고 생성 요청 DTO"""
    title: str = Field(..., description="로고 제목", min_length=1, max_length=100)
    content: str = Field(..., description="로고 내용", min_length=1, max_length=500)
    prompt: str = Field(..., description="로고 생성 프롬프트", min_length=1, max_length=1000)
    width: Optional[int] = Field(default=800, description="이미지 너비", ge=100, le=2000)
    height: Optional[int] = Field(default=600, description="이미지 높이", ge=100, le=2000)

    class Config:
        json_schema_extra = {
            "example": {
                "title": "My Company Logo",
                "content": "Innovative Solutions for Tomorrow",
                "prompt": "Create a modern, minimalist logo with clean typography",
                "width": 800,
                "height": 600
            }
        }

