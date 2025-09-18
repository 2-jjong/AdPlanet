import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import type { WatermarkDetectResult } from './dto/watermark.dto';

export const detectWatermark = async (file: File): Promise<ApiResponse<WatermarkDetectResult>> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<ApiResponse<WatermarkDetectResult>>(
    '/api/watermarks',
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );

  return response.data as ApiResponse<WatermarkDetectResult>;
};


