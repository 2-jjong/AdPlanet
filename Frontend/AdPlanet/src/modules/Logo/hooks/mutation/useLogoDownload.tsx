import { useMutation, useQuery } from "@tanstack/react-query";
import type { LogoDownloadRequest } from "../../../../services/dto/logo.dto";
import { logoDownload } from "../../../../services/logoService";
import type { AxiosResponse } from "axios";

export function useLogoDownload() {
  return useMutation<AxiosResponse<Blob>, Error, LogoDownloadRequest>({
    mutationFn: (req) => logoDownload(req),
  });
}
