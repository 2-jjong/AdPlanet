// src/services/dto/watermark.dto.ts

export interface WatermarkDetectResult {
  verified: boolean;
  reason?: string;
  [key: string]: unknown;
}


