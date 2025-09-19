import { useMutation, useQuery } from "@tanstack/react-query";
import type { LogoDownloadRequest } from "../../../services/dto/logo.dto";
import { logoDownload } from "../../../services/logoService";
import type { ApiResponse } from "../../../types/api";

export function useLogoDownload() {
  return useMutation<ApiResponse<string>, Error, LogoDownloadRequest>({
    mutationFn: (req) => logoDownload(req),
  });
}
