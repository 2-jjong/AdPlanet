import apiClient from "./apiClient";
import type { ApiResponse } from "../types/api";
import type { CreatePosterRequest, AssignPosterTagsRequest, PosterGroupListQuery } from "./dto/poster.request";
import type { Poster, PosterTag, PosterDetail, PosterCopy, PosterGroupItem, PosterJobStatus, PosterGroupDetail } from "./dto/poster.response";

/** 포스터 생성 (multipart/form-data) */
export async function createPoster(req: CreatePosterRequest): Promise<ApiResponse<Poster>> {
  const form = new FormData();
  form.append("request", JSON.stringify(req.request));
  if (req.sketchImage) form.append("sketchImage", req.sketchImage);
  if (req.productImage) form.append("productImage", req.productImage);
  if (req.modelImage) form.append("modelImage", req.modelImage);
  if (req.skeletonImage) form.append("skeletonImage", req.skeletonImage);
  if (req.previousImage) form.append("previousImage", req.previousImage);

  const { data } = await apiClient.post<ApiResponse<Poster>>(
    "/api/posters",
    form,
    {
      headers: { "Content-Type": "multipart/form-data" },
      params: { style: req.style },
    }
  );
  return data;
}

/** 포스터 태그 목록 조회 */
export async function getAllPosterTags(): Promise<ApiResponse<PosterTag[]>> {
  const { data } = await apiClient.get<ApiResponse<PosterTag[]>>(
    "/api/posters/tags"
  );
  return data;
}

/** 포스터 태그 지정 */
export async function assignPosterTags(
  body: AssignPosterTagsRequest
): Promise<ApiResponse<null>> {
  const { data } = await apiClient.post<ApiResponse<null>>(
    "/api/posters/tags",
    body
  );
  return data;
}

/** 포스터 저장 (이미지 업로드) */
export async function savePoster(image: File): Promise<ApiResponse<PosterDetail>> {
  const form = new FormData();
  form.append('image', image);

  const { data } = await apiClient.post<ApiResponse<PosterDetail>>(
    '/api/posters/save',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return data;
}

/** 포스터 단건 조회 */
export async function getPoster(
  posterId: number
): Promise<ApiResponse<PosterDetail>> {
  const { data } = await apiClient.get<ApiResponse<PosterDetail>>(
    `/api/posters/${posterId}`
  );
  return data;
}

/** 포스터 다운로드 */


/** 포스터 문구 생성 */
export async function generatePosterCopy(
  posterId: number
): Promise<ApiResponse<PosterCopy>> {
  const { data } = await apiClient.get<ApiResponse<PosterCopy>>(
    `/api/posters/${posterId}/copy`
  );
  return data;
}

/** 포스터 생성 작업 상태 조회 */
export async function getPosterJob(
    jobId: string
  ): Promise<ApiResponse<PosterJobStatus>> {
    const { data } = await apiClient.get<ApiResponse<PosterJobStatus>>(
      `/api/posters/jobs/${jobId}`
    );
    return data;
  }
  

/** 포스터 그룹 목록 조회 */
export async function getPosterGroups(
  params: PosterGroupListQuery
): Promise<ApiResponse<PosterGroupItem[]>> {
  const { data } = await apiClient.get<ApiResponse<PosterGroupItem[]>>(
    `/api/posters/group`,
    { params }
  );
  return data;
}

/** 특정 포스터 그룹 상세 조회 */
export async function getPosterGroupDetail(
  groupId: number
): Promise<ApiResponse<PosterGroupDetail>> {
  const { data } = await apiClient.get<ApiResponse<PosterGroupDetail>>(
    `/api/posters/group/${groupId}`
  );
  return data;
}

