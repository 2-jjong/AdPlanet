from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import logo_router, poster_router, image_converter_router

app = FastAPI(
    title="이미지 생성 및 변환 API",
    description="로고 이미지 생성, 포스터 생성, 이미지 변환 API",
    version="1.0.0"
)

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 프로덕션에서는 특정 도메인으로 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 라우터 등록
app.include_router(logo_router.router, prefix="/api/logo", tags=["로고 생성"])
app.include_router(poster_router.router, prefix="/api/poster", tags=["포스터 생성"])
app.include_router(image_converter_router.router, prefix="/api/converter", tags=["이미지 변환"])

@app.get("/") 
async def root():
    return {"message": "이미지 생성 API 서버가 실행 중입니다."} 

