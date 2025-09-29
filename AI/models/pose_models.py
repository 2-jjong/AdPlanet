from PIL import Image
from controlnet_aux import OpenposeDetector
import os

def load_and_resize_image(image_path, target_size=(1024, 1024)):
    """이미지를 로드하고 리사이즈하는 함수"""
    image = Image.open(image_path).convert("RGB")
    image = image.resize(target_size, Image.Resampling.LANCZOS)
    return image

def extract_pose_keypoints(image):
    """이미지에서 포즈 키포인트를 추출하는 함수"""
    openpose_detector = OpenposeDetector.from_pretrained('lllyasviel/Annotators')
    pose_image = openpose_detector(image)
    return pose_image

def process_pose_detection(image_path, output_path=None):
    """포즈 감지 전체 프로세스를 실행하는 함수"""
    # 이미지 처리
    image = load_and_resize_image(image_path)
    pose = extract_pose_keypoints(image)

    # 출력 경로가 지정되지 않으면 기본 경로 사용
    if output_path is None:
        base_name = os.path.splitext(os.path.basename(image_path))[0]
        output_path = f"./data/pose_{base_name}.png"

    # 포즈 이미지 저장
    pose.save(output_path)

    return pose, output_path