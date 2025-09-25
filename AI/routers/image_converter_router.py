from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import uuid
from PIL import Image
from pydantic import BaseModel
from enum import Enum
import urllib.parse

router = APIRouter()

class ImageFormat(str, Enum):
    """이미지 포맷 enum"""
    JPG = "jpg"
    JPEG = "jpeg"
    SVG = "svg"

class ImageConvertRequest(BaseModel):
    """이미지 변환 요청 DTO"""
    target_format: ImageFormat = ImageFormat.JPG
    quality: Optional[int] = 95  # JPG 품질 (1-100)
    
    class Config:
        json_schema_extra = {
            "example": {
                "target_format": "jpg",
                "quality": 95
            }
        }

def convert_png_to_jpg(image_bytes: bytes, quality: int = 95) -> bytes:
    """
    PNG 이미지를 JPG로 변환하는 함수
    """
    try:
        # PIL Image로 로드
        image = Image.open(io.BytesIO(image_bytes))
        
        # RGBA를 RGB로 변환 (JPG는 투명도 지원 안함)
        if image.mode in ('RGBA', 'LA', 'P'):
            # 흰색 배경으로 합성
            background = Image.new('RGB', image.size, (255, 255, 255))
            if image.mode == 'P':
                image = image.convert('RGBA')
            background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
            image = background
        elif image.mode != 'RGB':
            image = image.convert('RGB')
        
        # JPG로 변환
        output = io.BytesIO()
        image.save(output, format='JPEG', quality=quality, optimize=True)
        return output.getvalue()
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"JPG 변환 중 오류가 발생했습니다: {str(e)}"
        )

def convert_png_to_svg(image_bytes: bytes) -> bytes:
    """
    PNG 이미지를 SVG로 변환하는 함수 (Base64 인코딩된 SVG)
    """
    try:
        import base64
        
        # PNG를 Base64로 인코딩
        base64_string = base64.b64encode(image_bytes).decode('utf-8')
        
        # SVG 템플릿 생성
        image = Image.open(io.BytesIO(image_bytes))
        width, height = image.size
        
        svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{width}" height="{height}" xmlns="http://www.w3.org/2000/svg">
    <image href="data:image/png;base64,{base64_string}" width="{width}" height="{height}"/>
</svg>'''
        
        # UTF-8로 인코딩하여 반환
        return svg_content.encode('utf-8')
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"SVG 변환 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/convert")
async def convert_image(
    file: UploadFile = File(...),
    target_format: ImageFormat = ImageFormat.JPG,
    quality: int = 95
):
    """
    PNG 이미지를 JPG 또는 SVG로 변환하는 API
    """
    try:
        # 파일 검증
        if not file.filename:
            raise HTTPException(status_code=400, detail="파일명이 없습니다.")
        
        # 파일 크기 제한 (10MB)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="파일 크기는 10MB를 초과할 수 없습니다.")
        
        # 파일 읽기
        file_content = await file.read()
        
        # PNG 파일인지 확인
        try:
            image = Image.open(io.BytesIO(file_content))
            if image.format != 'PNG':
                raise HTTPException(status_code=400, detail="PNG 파일만 변환 가능합니다.")
        except Exception:
            raise HTTPException(status_code=400, detail="유효하지 않은 이미지 파일입니다.")
        
        # 변환 실행
        if target_format in [ImageFormat.JPG, ImageFormat.JPEG]:
            # JPG 품질 검증
            if not (1 <= quality <= 100):
                raise HTTPException(status_code=400, detail="품질은 1-100 사이의 값이어야 합니다.")
            
            converted_bytes = convert_png_to_jpg(file_content, quality)
            media_type = "image/jpeg"
            file_extension = "jpg"
            
        elif target_format == ImageFormat.SVG:
            converted_bytes = convert_png_to_svg(file_content)
            media_type = "image/svg+xml"
            file_extension = "svg"
            
        else:
            raise HTTPException(status_code=400, detail="지원하지 않는 변환 형식입니다.")
        
        # 고유한 파일명 생성 (ASCII만 사용)
        file_id = str(uuid.uuid4())[:8]
        filename = f"converted_image_{file_id}.{file_extension}"
        
        # 변환된 이미지 반환
        return StreamingResponse(
            io.BytesIO(converted_bytes),
            media_type=media_type,
            headers={
                "Content-Disposition": f"attachment; filename={filename}",
                "X-Filename": filename,
                "X-File-ID": file_id,
                "X-Original-Format": "PNG",
                "X-Target-Format": target_format.value.upper()
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"이미지 변환 중 오류가 발생했습니다: {str(e)}")
