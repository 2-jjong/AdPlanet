import { useMutation } from "@tanstack/react-query";
import type {
  WatermarkDetectionRes,
  WatermarkDetectionReq,
} from "../../../services/dto/watermark.dto";
import { detectWatermark } from "../../../services/watermarkService";
import type { ApiResponse } from "../../../types/api";

export function useDetectWatermark() {
  return useMutation<ApiResponse<WatermarkDetectionRes>, Error, WatermarkDetectionReq>({
    mutationFn: detectWatermark,
  });
}
