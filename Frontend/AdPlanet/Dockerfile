FROM node:22.17.0-slim as builder
# 작업 위치 지정
WORKDIR /app

# 캐시 최적화 
COPY package*.json ./
RUN npm ci
# 소스 코드 복사 & 빌드 
COPY . .
# Jenkins에서 build-arg로 넘어온 값 받기
ARG VITE_SSAFY_CLIENT_ID
ARG VITE_SSAFY_REDIRECT_URI
ARG VITE_SSAFY_OAUTH_URL
ARG VITE_API_BASE_URL

# ENV로 노출 → npm run build 시 Vite가 VITE_*를 읽음
ENV VITE_SSAFY_CLIENT_ID=${VITE_SSAFY_CLIENT_ID}
ENV VITE_SSAFY_REDIRECT_URI=${VITE_SSAFY_REDIRECT_URI}
ENV VITE_SSAFY_OAUTH_URL=${VITE_SSAFY_OAUTH_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

# 런타임 단계 (Nginx)
FROM nginx:1.27-alpine
# SPA 라우팅/캐시 설정 포함한 서버 블록만 추가 
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 정적 파일 복사 
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]