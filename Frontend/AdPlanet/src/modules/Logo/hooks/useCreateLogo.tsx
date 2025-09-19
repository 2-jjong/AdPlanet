import { useMutation } from "@tanstack/react-query";
import type { CreateLogoRequest, Logo } from "../../../services/dto/logo.dto";
import { createLogo } from "../../../services/logoService";
import type { ApiResponse } from "../../../types/api";

export function useCreateLogo() {
  return useMutation<ApiResponse<Logo>, Error, CreateLogoRequest>({
    mutationFn: createLogo,
  });
}
