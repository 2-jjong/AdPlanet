from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
import io
import uuid
import asyncio
import os
import torch
# DPMSolverMultistepScheduler 추가
from diffusers import DiffusionPipeline, DPMSolverMultistepScheduler
from PIL import Image
import gc
from models.logo_models import LogoRequest, LogoStyle
import tempfile

router = APIRouter()

# 전역 변수로 파이프라인 저장 (메모리 효율성을 위해)
_pipeline = None

def load_lora_with_filter(pipe, lora_path: str, adapter_name: str = None) -> bool:
    """
    LoRA 로딩 시 Diffusers가 지원하지 않는 레이어(예: label_emb)를 필터링하여 로드 시도.
    adapter_name 미지원 환경도 고려하여 폴백 처리.
    """
    if not os.path.exists(lora_path):
        print(f"Warning: LoRA 파일을 찾을 수 없습니다: {lora_path}")
        return False

    # 1차: 그대로 로드 시도
    try:
        if adapter_name is not None:
            pipe.load_lora_weights(lora_path, adapter_name=adapter_name)
        else:
            pipe.load_lora_weights(lora_path)
        return True
    except TypeError:
        # adapter_name 미지원 -> adapter 없이 로드 재시도
        try:
            pipe.load_lora_weights(lora_path)
            return True
        except Exception as e:
            print(f"Info: LoRA 기본 로드 실패, 필터링 시도 예정: {e}")
    except Exception as e:
        print(f"Info: LoRA 로드 실패, 필터링 시도 예정: {e}")

    # 2차: safetensors를 열어 미지원 키 필터링 후 임시 파일로 저장하여 로드
    try:
        try:
            from safetensors.torch import load_file, save_file
        except Exception as e:
            print(f"Warning: safetensors 모듈을 사용할 수 없어 필터링을 건너뜁니다: {e}")
            return False

        tensors = load_file(lora_path)
        # label_emb 등 미지원 키 제거
        filtered = {k: v for k, v in tensors.items() if "label_emb" not in k}
        if not filtered:
            print("Warning: 필터링 후 남는 LoRA 키가 없습니다.")
            return False

        tmp_dir = os.path.join(tempfile.gettempdir(), "lora_filtered")
        os.makedirs(tmp_dir, exist_ok=True)
        tmp_path = os.path.join(tmp_dir, os.path.basename(lora_path) + ".filtered.safetensors")
        save_file(filtered, tmp_path)

        if adapter_name is not None:
            try:
                pipe.load_lora_weights(tmp_path, adapter_name=adapter_name)
            except TypeError:
                pipe.load_lora_weights(tmp_path)
        else:
            pipe.load_lora_weights(tmp_path)
        return True
    except Exception as e:
        print(f"Warning: LoRA 필터링 로드 실패: {e}")
        return False

def get_pipeline():
    """
    Stable Diffusion XL 파이프라인을 가져오거나 생성하는 함수 (샘플러 수정됨)
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
            )

            # 2. DPM++ 2M SDE Karras 샘플러 설정
            _pipeline.scheduler = DPMSolverMultistepScheduler.from_config(
                _pipeline.scheduler.config,
                use_karras_sigmas=True,
                algorithm_type="sde-dpmsolver++"  # SDE Karras 설정
            )
            
            _pipeline.to("cuda")

            # 초기화 시 SIMPLE LoRA는 항상 로드해 둡니다. (기본 어댑터)
            simple_lora_path = os.path.join("assets", "lora", "LogoRedmondV2-Logo-LogoRedmAF.safetensors")
            if not load_lora_with_filter(_pipeline, simple_lora_path, adapter_name="simple"):
                print("Warning: SIMPLE LoRA 기본 로드 실패")

            # 기본은 비활성화하고, 요청 시 활성화
            try:
                _pipeline.disable_lora()
            except Exception:
                pass
                
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Stable Diffusion 모델 로드 중 오류가 발생했습니다: {str(e)}"
            )
    
    return _pipeline

async def generate_logo_image(prompt: str, negative_prompt: str, style: LogoStyle, width: int = 800, height: int = 600) -> bytes:
    """
    Stable Diffusion XL을 사용하여 실제 로고 이미지를 생성하는 함수 (수정된 버전)
    """
    try:
        # 파이프라인 가져오기
        pipe = get_pipeline()

        # 1. 스타일에 따른 프롬프트 및 LoRA 설정
        lora_adapter_name = None
        lora_trigger = ""
        
        style_prompts = {
            LogoStyle.SIMPLE: "simple, clean, minimalist, modern",
            LogoStyle.MONO: "monochrome, black and white, grayscale, elegant",
            LogoStyle.PUNK: "punk, edgy, bold, rebellious, dark",
            LogoStyle.CARTOON: "cartoon, colorful, playful, fun, animated"
        }
        style_prompt = style_prompts.get(style, "simple, clean")

        # 2. 스타일에 맞춰 사용할 LoRA 어댑터 이름과 트리거 단어 결정
        if style == LogoStyle.SIMPLE:
            lora_adapter_name = "simple"
            lora_trigger = "logo, logoredmaf"
        elif style == LogoStyle.MONO:
            lora_adapter_name = "mono"
            lora_trigger = "logo, only black and white"
        elif style == LogoStyle.CARTOON: 
            lora_adapter_name = "cartoon"
            lora_trigger = "logomkrdsxl, vector, logo"
        elif style == LogoStyle.PUNK: 
            lora_adapter_name = "punk"
            lora_trigger = "logo, logoredmaf, cyberpunk, punk"
            
        
        # 3. 결정된 LoRA 활성화 (요청 스타일에 해당하는 것만 로드)
        # 전역으로 미리 로드하지 않고, 여기서 필요한 것만 로드/활성화
        style_to_lora_path = {
            LogoStyle.SIMPLE: os.path.join("assets", "lora", "LogoRedmondV2-Logo-LogoRedmAF.safetensors"),
            LogoStyle.MONO: os.path.join("assets", "lora", "mono_logo.safetensors"),
            LogoStyle.CARTOON: os.path.join("assets", "lora", "logomkrdsxl.safetensors"),
        }

        # 항상 먼저 비활성화하여 잔여 어댑터 영향 제거
        try:
            if hasattr(pipe, "disable_lora"):
                pipe.disable_lora()
        except Exception:
            pass

        # 항상 simple 어댑터를 기본으로 포함
        active_adapters = []
        adapter_weights = [1.0]

        # 스타일 전용 어댑터를 추가
        if lora_adapter_name and lora_adapter_name != "simple":
            active_adapters.append(lora_adapter_name)
            adapter_weights.append(1.0)

        # 필요 시 해당 스타일 LoRA 파일을 로드
        for adapter in active_adapters:
            # simple은 초기화 시 로드했지만, 누락/미지원인 경우를 대비해 재확인
            if adapter == "simple":
                lora_path = style_to_lora_path.get(LogoStyle.SIMPLE)
            elif adapter == "mono":
                lora_path = style_to_lora_path.get(LogoStyle.MONO)
            elif adapter == "cartoon":
                lora_path = style_to_lora_path.get(LogoStyle.CARTOON)
            else:
                lora_path = None

            if lora_path:
                # 어댑터 세팅 전에, 아직 로드 안 되어 있으면 로드 시도
                try:
                    if hasattr(pipe, "set_adapters"):
                        # set_adapters 사용 시에는 사전 로드가 되어 있어야 함. 실패하면 로드 시도
                        pipe.set_adapters([adapter], adapter_weights=[1.0])
                    else:
                        raise Exception("set_adapters not available")
                except Exception:
                    # 해당 어댑터 로드 시도 (필터 포함)
                    load_lora_with_filter(pipe, lora_path, adapter_name=adapter)

        # 모든 대상 어댑터를 한 번에 활성화
        if hasattr(pipe, "set_adapters"):
            try:
                pipe.set_adapters(active_adapters, adapter_weights=adapter_weights)
            except Exception:
                # 구버전: enable_lora로 대체
                try:
                    if hasattr(pipe, "enable_lora"):
                        pipe.enable_lora()
                except Exception:
                    pass
        else:
            # 구버전: enable_lora만 수행
            try:
                if hasattr(pipe, "enable_lora"):
                    pipe.enable_lora()
            except Exception:
                pass

        # 4. 프롬프트 조립 (로라 트리거만 사용)
        prompt_parts = [lora_trigger, prompt]
        enhanced_prompt = ", ".join(p for p in prompt_parts if p)

        # 네거티브 프롬프트 조립
        base_negative_prompt = negative_prompt # API에서 받은 기본 네거티브 사용
        if style == LogoStyle.MONO:
            mono_extra_negative = "text, watermark, blurry, deformed, depth of field, realistic, 3d render, outline, extra leg"
            base_negative_prompt = f"{base_negative_prompt}, {mono_extra_negative}"
        
        #... (print 문들은 생략) ...

        # 5. 이미지 생성
        image = pipe(
            prompt=enhanced_prompt, # enhanced_prompt 사용
            negative_prompt=base_negative_prompt,
            num_inference_steps=30,
            guidance_scale=7,
            width=width,
            height=height
        ).images[0]
        
        # PIL Image를 bytes로 변환
        img_byte_arr = io.BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        # 메모리 정리
        del image
        gc.collect()
        torch.cuda.empty_cache()
        
        return img_byte_arr
        
    except Exception as e:
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
        if not request.prompt.strip():
            raise HTTPException(status_code=400, detail="프롬프트는 필수입니다.")

        # 기본 네거티브 프롬프트 설정
        negative_prompt = "text, letter, text logo, bad art, ugly, deformed, watermark, duplicated"
        print(request.prompt)
        print()
        print()
        print()
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