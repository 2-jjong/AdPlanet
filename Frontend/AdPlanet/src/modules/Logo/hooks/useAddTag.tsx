import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AddLogoTag, LogoTag } from "../../../services/dto/logo.dto";
import { addLogoTag } from "../../../services/logoService";
import type { ApiResponse } from "../../../types/api";

export function useAddTag() {
  const queryClient = useQueryClient(); //전역 queryClient 가져오기

  return useMutation<ApiResponse<LogoTag>, Error, AddLogoTag>({
    mutationFn: addLogoTag,
    onSuccess: (res) => {
      if (res?.code === "S0000" && res.data) {
        queryClient.setQueryData<ApiResponse<LogoTag[]>>(["tags"], (oldData) =>
          oldData
            ? { ...oldData, data: [...oldData.data, res.data] }
            : { code: "S0000", data: [res.data] }
        );
      }
    },
  });
}
