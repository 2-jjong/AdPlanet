import { useQuery } from "@tanstack/react-query";
import type { LogoTag } from "../../../../services/dto/logo.dto";
import { getAllLogoTags } from "../../../../services/logoService";
import type { ApiResponse } from "../../../../types/api";

export function useGetTags() {
  return useQuery<ApiResponse<LogoTag[]>, Error>({
    queryKey: ["tags"],
    queryFn: () => getAllLogoTags(),
  });
}
