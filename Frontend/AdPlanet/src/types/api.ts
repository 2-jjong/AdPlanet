// src/types/api.ts

/**
 * 모든 API에 대한 공통 응답(Response) DTO
 * @template T 실제 데이터의 타입
 */
export interface ApiResponse<T> {
  code: string;      // 응답 코드 (예: "SUCCESS", "AUTH_ERROR")
  data: T;           // 실제 데이터
  message?: string;  // 응답 메시지
}