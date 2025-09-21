from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import uuid
import asyncio
import os
import torch
from diffusers import DiffusionPipeline
from PIL import Image
import gc
from models.logo_models import LogoRequest, LogoStyle

router = APIRouter()

# 전역 변수로 파이프라인 저장 (메모리 효율성을 위해)
_pipeline = None

def get_pipeline():
    """
    Stable Diffusion XL 파이프라인을 가져오거나 생성하는 함수
    """
    global _pipeline
    
    if _pipeline is None:
        try:
            # 1. 베이스 SDXL 모델 로드
            _pipeline = DiffusionPipeline.from_pretrained(
                "stabilityai/stable-diffusion-xl-base-1.0",
                torch_dtype=torch.float16,
                variant="fp16",
                use_safetensors=True
            ).to("cuda")
            
            # 2. LoRA 가중치 적용
            lora_path = os.path.join("assets", "lora", "LogoRedmondV2-Logo-LogoRedmAF.safetensors")
            if os.path.exists(lora_path):
                _pipeline.load_lora_weights(lora_path)
            else:
                print(f"Warning: LoRA 파일을 찾을 수 없습니다: {lora_path}")
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Stable Diffusion 모델 로드 중 오류가 발생했습니다: {str(e)}"
            )
    
    return _pipeline

async def generate_logo_image(prompt: str, negative_prompt: str, style: LogoStyle, width: int = 800, height: int = 600) -> bytes:
    """
    Stable Diffusion XL을 사용하여 실제 로고 이미지를 생성하는 함수
    """
    try:
        # 파이프라인 가져오기
        pipe = get_pipeline()
        
        # 3. 프롬프트 및 생성 파라미터 설정 (LoRA 트리거 포함)
        lora_trigger = "logo, logoredmaf"  # LoRA 트리거 단어
        
        # 스타일에 따른 추가 프롬프트 설정
        style_prompts = {
            LogoStyle.SIMPLE: "simple, clean, minimalist, modern",
            LogoStyle.MONO: "monochrome, black and white, grayscale, elegant",
            LogoStyle.PUNK: "punk, edgy, bold, rebellious, dark",
            LogoStyle.CARTOON: "cartoon, colorful, playful, fun, animated"
        }
        
        style_prompt = style_prompts.get(style, "simple, clean")
        enhanced_prompt = f"{lora_trigger}, {prompt}, {style_prompt}, award-winning photograph, masterpiece, best quality, insanely detailed, photorealistic, 8K UHD"
        
        enhanced_negative_prompt = f"{negative_prompt}, painting, drawing, illustration, cartoon, 3d render, anime, blurry, low resolution, ugly, deformed, disfigured, text, watermark, signature, people, oversaturated, bad composition"
        
        # 4. 이미지 생성
        image = pipe(
            prompt=enhanced_prompt,
            negative_prompt=enhanced_negative_prompt,
            num_inference_steps=40,
            guidance_scale=7.5,
            width=width,
            height=height
        ).images[0]
        
        # 5. PIL Image를 bytes로 변환
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # 메모리 정리
        del image
        gc.collect()
        torch.cuda.empty_cache()
        
        return img_byte_arr
        
    except Exception as e:
        # 메모리 정리
        gc.collect()
        torch.cuda.empty_cache()
        raise HTTPException(
            status_code=500,
            detail=f"이미지 생성 중 오류가 발생했습니다: {str(e)}"
        )

@router.post("/generate")
async def generate_logo(request: LogoRequest):
    """
    Stable Diffusion XL을 사용하여 실제 로고 이미지를 생성하고 파일로 반환하는 API
    """
    try:
        # 입력 검증
        if not request.title.strip():
            raise HTTPException(status_code=400, detail="제목은 필수입니다.")
        
        if not request.content.strip():
            raise HTTPException(status_code=400, detail="내용은 필수입니다.")
        
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="프롬프트는 필수입니다.")
        
        # 기본 네거티브 프롬프트 설정
        negative_prompt = "painting, drawing, illustration, cartoon, 3d render, anime, blurry, low resolution, ugly, deformed, disfigured, text, watermark, signature, people, oversaturated, bad composition"
        
        # 실제 로고 이미지 생성
        image_bytes = await generate_logo_image(
            prompt=request.prompt,
            negative_prompt=negative_prompt,
            style=request.style,
            width=request.width,
            height=request.height
        )
        
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
