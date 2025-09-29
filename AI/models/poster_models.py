import torch
from diffusers import QwenImageEditPlusPipeline
from diffusers.utils import load_image
from PIL import Image
import os

from nunchaku import NunchakuQwenImageTransformer2DModel
from nunchaku.utils import get_gpu_memory, get_precision
from .pose_models import extract_pose_keypoints, load_and_resize_image

rank = 128

def load_qwen_model():
    """Qwen 이미지 편집 모델을 로드하는 함수"""
    print("Qwen 모델 로드 중...")

    transformer = NunchakuQwenImageTransformer2DModel.from_pretrained(
        f"nunchaku-tech/nunchaku-qwen-image-edit-2509/svdq-{get_precision()}_r{rank}-qwen-image-edit-2509.safetensors"
    )

    pipeline = QwenImageEditPlusPipeline.from_pretrained(
        "Qwen/Qwen-Image-Edit-2509", transformer=transformer, torch_dtype=torch.bfloat16
    )

    if get_gpu_memory() > 18:
        pipeline.enable_model_cpu_offload()
    else:
        # use per-layer offloading for low VRAM. This only requires 3-4GB of VRAM.
        transformer.set_offload(
            True, use_pin_memory=False, num_blocks_on_gpu=1
        )  # increase num_blocks_on_gpu if you have more VRAM
        pipeline._exclude_from_cpu_offload.append("transformer")
        pipeline.enable_sequential_cpu_offload()

    pipeline = pipeline.to("cuda")
    print("Qwen 모델 로드 완료")
    return pipeline

# 전역 변수로 모델 인스턴스 저장 (싱글톤 패턴)
_qwen_pipeline = None

def get_qwen_pipeline():
    """Qwen 파이프라인을 가져오는 함수"""
    global _qwen_pipeline
    if _qwen_pipeline is None:
        _qwen_pipeline = load_qwen_model()
    return _qwen_pipeline

def generate_poster_with_qwen(prompt, person_image_path=None, product_image_path=None, pose_image_path=None, output_path="./data/result.png"):
    """Qwen 모델을 사용해 포스터를 생성하는 함수"""
    pipeline = get_qwen_pipeline()

    # 이미지 로드 및 전처리
    images = []
    if person_image_path and os.path.exists(person_image_path):
        image1 = load_image(person_image_path)
        image1 = image1.convert("RGB")
        images.append(image1)

    if product_image_path and os.path.exists(product_image_path):
        image2 = load_image(product_image_path)
        image2 = image2.convert("RGB")
        images.append(image2)

    if pose_image_path and os.path.exists(pose_image_path):
        # 포즈 이미지는 pose_models로 전처리
        original_image = load_and_resize_image(pose_image_path)
        image3 = extract_pose_keypoints(original_image)
        images.append(image3)

    if len(images) < 2:
        raise ValueError("최소 2개의 이미지가 필요합니다")

    # 기본 프롬프트가 없으면 이미지 개수에 따라 설정
    if not prompt:
        if len(images) == 2:
            prompt = "Realistic advertisement photo of the man from image 1 confidently holding the product from image 2 at its original size, as if promoting the product. Natural pose, bright studio lighting, professional, clean background."
        else:
            prompt = "Realistic advertisement photo of the man from image 1 confidently holding the product from image 2 at its original size, following the pose from image 3. Natural pose, bright studio lighting, professional, clean background."

    inputs = {
        "image": images,
        "prompt": prompt,
        "true_cfg_scale": 4.0,
        "negative_prompt": "low quality, blurry, pixelated, distorted, ugly, deformed, text, watermark, words, letters, noise",
        "num_inference_steps": 40,
        "height": 1024,
        "width": 1024,
    }

    output = pipeline(**inputs)
    output_image = output.images[0]
    output_image.save(output_path)

    return output_image, output_path