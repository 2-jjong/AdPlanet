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
    # 현재 스크립트 파일의 디렉토리를 기준으로 절대 경로 구성
    current_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    dummy_path = os.path.join(current_dir, "dummy_images", "poster.png")
    
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
    prompt: str = Form(..., description="포스터 생성 프롬프트", min_length=1, max_length=250),
    person_image: Optional[Union[UploadFile, str]] = File(None, description="인물 사진"),
    product_image: Optional[Union[UploadFile, str]] = File(None, description="제품 이미지"),
    pose_image: Optional[Union[UploadFile, str]] = File(None, description="포즈 이미지")
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
            
        if isinstance(pose_image, str) and pose_image == "":
            pose_image = None
        elif pose_image and hasattr(pose_image, 'filename') and pose_image.filename == "":
            pose_image = None
        
        if not prompt.strip():
            raise HTTPException(status_code=400, detail="프롬프트는 필수입니다.")
            
        # 업로드된 파일 정보 로깅
        uploaded_files = []
        if person_image:
            uploaded_files.append(f"person image: {person_image.filename}")
        if product_image:
            uploaded_files.append(f"product image: {product_image.filename}")
        if pose_image:
            uploaded_files.append(f"pose image: {pose_image.filename}")
        
        print(f"업로드된 파일들: {uploaded_files}")
    
        
        image_bytes = await load_dummy_poster_image()
        
        file_id = str(uuid.uuid4())[:8]
        filename = f"poster_{file_id}.png"
        
        return StreamingResponse(
            io.BytesIO(image_bytes),
            media_type="image/png",
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



@router.post("/edit")
async def edit_poster(
    prompt: str = Form(..., description="포스터 수정 프롬프트", min_length=1, max_length=150),
    image: UploadFile = File(..., description="편집할 이미지 파일")
):
    """
    업로드된 단일 이미지를 받아 간단 편집(검증/형식 유지) 후 반환하는 API
    - 필수 필드: prompt, image
    - 현재는 베이스라인으로 입력 이미지를 그대로 반환합니다.
    """
    try:
        if not prompt.strip():
            raise HTTPException(status_code=400, detail="프롬프트는 필수입니다.")

        if not image or not getattr(image, 'filename', None):
            raise HTTPException(status_code=400, detail="이미지 파일은 필수입니다.")

        # 파일 읽기
        image_bytes = await image.read()
        if not image_bytes:
            raise HTTPException(status_code=400, detail="이미지 파일이 비어 있습니다.")

        # 이미지 검증 및 최소 전처리
        try:
            pil_image = Image.open(io.BytesIO(image_bytes))
        except Exception:
            raise HTTPException(status_code=400, detail="유효하지 않은 이미지 파일입니다.")

        # 원본 포맷 유지(가능 시), JPEG 투명 채널 보정
        original_format = (pil_image.format or "PNG").upper()
        if original_format in ("JPG", "JPEG"):
            if pil_image.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', pil_image.size, (255, 255, 255))
                if pil_image.mode == 'P':
                    pil_image = pil_image.convert('RGBA')
                background.paste(pil_image, mask=pil_image.split()[-1] if pil_image.mode == 'RGBA' else None)
                pil_image = background
            save_format = "JPEG"
            media_type = "image/jpeg"
            file_ext = "jpg"
        else:
            # PNG 기본
            if pil_image.mode == 'P':
                pil_image = pil_image.convert('RGBA')
            save_format = "PNG"
            media_type = "image/png"
            file_ext = "png"

        output = io.BytesIO()
        pil_image.save(output, format=save_format)
        edited_bytes = output.getvalue()

        file_id = str(uuid.uuid4())[:8]
        filename = f"edited_poster_{file_id}.{file_ext}"

        return StreamingResponse(
            io.BytesIO(edited_bytes),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Filename": filename,
                "X-File-ID": file_id
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 편집 중 오류가 발생했습니다: {str(e)}")
