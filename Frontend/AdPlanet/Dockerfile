FROM node:20-alpine as builder
# 작업 위치 지정
WORKDIR /app

# 캐시 최적화 
COPY package*.json ./
RUN npm ci
# 소스 코드 복사 & 빌드 
COPY . .
RUN npm run build

# 런타임 단계 (Nginx)
FROM nginx:1.27-alpine
# SPA 라우탕/캐시 설정 포함한 서버 블록만 추가 
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 정적 파일 복사 
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]