import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';
import { toFormData } from 'axios';
import type { WatermarkDetectionReq, WatermarkDetectionRes } from './dto/watermark.dto';

/** 워터마크 탐지 */
export async function detectWatermark (req:WatermarkDetectionReq): Promise<ApiResponse<WatermarkDetectionRes>> {
  
  const formData=toFormData(req);

  const {data}=await apiClient.post<ApiResponse<WatermarkDetectionRes>>(
    "/api/watermarks/detection",
    formData,
    {headers:{'Content-Type': 'multipart/form-data'}}
  ) 
  return data;
}
