from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import StreamingResponse
from typing import Optional, Union
import io
import uuid
import asyncio
import os
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import textwrap
router = APIRouter()

async def load_dummy_poster_image() -> bytes:
    """
    더미 포스터 이미지를 로드하는 함수
    """
    # dummy_images 폴더의 poster.jpg 파일 로드
    dummy_path = os.path.join("dummy_images", "poster.jpg")
    
    if not os.path.exists(dummy_path):
        raise HTTPException(
            status_code=500, 
            detail=f"더미 포스터 이미지 파일을 찾을 수 없습니다: {dummy_path}"
        )
    
    try:
        with open(dummy_path, "rb") as f:
            return f.read()
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"더미 포스터 이미지 파일을 읽는 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/generate")
# 1. Pydantic 모델 대신 각 필드를 Form과 File로 직접 받도록 수정합니다.
async def generate_poster(
    # --- 텍스트 및 숫자 필드는 Form으로 받습니다. ---
    title: str = Form(..., description="포스터 제목", min_length=1, max_length=100),
    content: str = Form(..., description="포스터 내용", min_length=1, max_length=50),
    prompt: str = Form(..., description="포스터 생성 프롬프트", min_length=1, max_length=150),
    width: int = Form(default=1024, description="이미지 너비", ge=100, le=1024),
    height: int = Form(default=1024, description="이미지 높이", ge=100, le=1024),
    
    person_image: Optional[Union[UploadFile, str]] = File(None, description="인물 사진"),
    product_image: Optional[Union[UploadFile, str]] = File(None, description="제품 이미지"),
    sketch_image: Optional[Union[UploadFile, str]] = File(None, description="스케치 이미지")
):
    """
    포스터 이미지를 생성하고 파일로 반환하는 API (이미지 파일 업로드 포함)
    """
    try:
        # 빈 문자열로 전달된 파일 필드들을 None으로 처리
        if isinstance(person_image, str) and person_image == "":
            person_image = None
        elif person_image and hasattr(person_image, 'filename') and person_image.filename == "":
            person_image = None
            
        if isinstance(product_image, str) and product_image == "":
            product_image = None
        elif product_image and hasattr(product_image, 'filename') and product_image.filename == "":
            product_image = None
            
        if isinstance(sketch_image, str) and sketch_image == "":
            sketch_image = None
        elif sketch_image and hasattr(sketch_image, 'filename') and sketch_image.filename == "":
            sketch_image = None
            
        # 2. request 객체 대신 직접 파라미터 변수를 사용합니다.
        # 예: request.title -> title
        if not title.strip():
            raise HTTPException(status_code=400, detail="제목은 필수입니다.")
        
        if not content.strip():
            raise HTTPException(status_code=400, detail="내용은 필수입니다.")
        
        if not prompt.strip():
            raise HTTPException(status_code=400, detail="프롬프트는 필수입니다.")
            
        # 업로드된 파일 정보 로깅
        uploaded_files = []
        if person_image:
            uploaded_files.append(f"인물 사진: {person_image.filename}")
        if product_image:
            uploaded_files.append(f"상품 사진: {product_image.filename}")
        if sketch_image:
            uploaded_files.append(f"스케치 사진: {sketch_image.filename}")
        
        print(f"업로드된 파일들: {uploaded_files}")
        
        # 포스터 생성 시뮬레이션
        await asyncio.sleep(10)
        
        image_bytes = await load_dummy_poster_image()
        
        file_id = str(uuid.uuid4())[:8]
        filename = f"poster_{file_id}.jpg"
        
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/jpeg",
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Filename": filename,
                "X-File-ID": file_id,
                "X-Uploaded-Files": ", ".join(uploaded_files) if uploaded_files else "None"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 생성 중 오류가 발생했습니다: {str(e)}")
