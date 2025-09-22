import { useMutation } from "@tanstack/react-query";
import type {
  AssignLogoTagsRequest,
  LogoTag,
} from "../../../../services/dto/logo.dto";
import { assignLogoTags, createLogo } from "../../../../services/logoService";
import type { ApiResponse } from "../../../../types/api";
import type { AssignedLogoTag } from "../../../../services/dto/logo.response";

export function useTagSave(logoId: number) {
  return useMutation<
    ApiResponse<AssignedLogoTag[]>,
    Error,
    AssignLogoTagsRequest
  >({
    mutationFn: (body) => assignLogoTags(logoId, body),
  });
}
