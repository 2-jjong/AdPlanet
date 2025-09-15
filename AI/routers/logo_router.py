from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import uuid
import asyncio
import os
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import textwrap
from models.logo_models import LogoRequest

router = APIRouter()

async def load_dummy_logo_image() -> bytes:
    """
    더미 로고 이미지를 로드하는 함수
    """
    # dummy_images 폴더의 logo.png 파일 로드
    dummy_path = os.path.join("dummy_images", "logo.png")
    
    if not os.path.exists(dummy_path):
        raise HTTPException(
            status_code=500, 
            detail=f"더미 로고 이미지 파일을 찾을 수 없습니다: {dummy_path}"
        )
    
    try:
        with open(dummy_path, "rb") as f:
            return f.read()
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"더미 로고 이미지 파일을 읽는 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/generate")
async def generate_logo(request: LogoRequest):
    """
    로고 이미지를 생성하고 파일로 반환하는 API
    """
    try:
        # 입력 검증
        if not request.title.strip():
            raise HTTPException(status_code=400, detail="제목은 필수입니다.")
        
        if not request.content.strip():
            raise HTTPException(status_code=400, detail="내용은 필수입니다.")
        
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="프롬프트는 필수입니다.")
        
        # 로고 생성 시뮬레이션 (2초 대기)
        await asyncio.sleep(2)
        
        # 더미 로고 이미지 로드
        image_bytes = await load_dummy_logo_image()
        
        # 고유한 파일명 생성
        file_id = str(uuid.uuid4())[:8]
        filename = f"logo_{file_id}.png"
        
        # 이미지를 직접 반환
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Filename": filename,
                "X-File-ID": file_id
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 생성 중 오류가 발생했습니다: {str(e)}")
