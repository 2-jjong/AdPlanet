import { useMutation } from '@tanstack/react-query';
import { createPoster } from '../../../services/posterService';
import type { CreatePosterRequest, PosterStyle } from '../../../services/dto/poster.request';
import type { ApiResponse } from '../../../types/api';
import type { PosterJobStatus } from '../../../services/dto/poster.response';

export type UiPosterStyle = 'clean' | 'punk' | 'cartoon' | 'monochrome' | undefined;

function mapUiStyleToPosterStyle(ui: UiPosterStyle): PosterStyle | undefined {
  if (!ui) return undefined;
  switch (ui) {
    case 'monochrome':
      return 'MONO';
    default:
      return 'SIMPLE';
  }
}

export interface CreatePosterParams {
  groupId?: number;
  title: string;
  content?: string;
  prompt: string;
  style?: UiPosterStyle;
  images?: {
    person?: File | null;
    product?: File | null;
    sketch?: File | null;
    skeleton?: File | null;
    previous?: File | null;
  };
}

export function useCreatePosterMutation() {
  return useMutation<ApiResponse<PosterJobStatus>, unknown, CreatePosterParams>({
    mutationFn: async (params: CreatePosterParams) => {
      const req: CreatePosterRequest = {
        style: mapUiStyleToPosterStyle(params.style),
        request: {
          ...(params.groupId ? { groupId: params.groupId } : {}),
          title: params.title,
          content: params.content,
          prompt: params.prompt,
        },
        modelImage: params.images?.person ?? null,
        productImage: params.images?.product ?? null,
        sketchImage: params.images?.sketch ?? null,
        skeletonImage: params.images?.skeleton ?? null,
        previousImage: params.images?.previous ?? null,
      };

      return createPoster(req);
    },
  });
}


