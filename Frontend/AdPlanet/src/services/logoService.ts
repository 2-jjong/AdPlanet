import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../types/api";
import apiClient from "./apiClient";
import type {
  LogoListQuery,
  CreateLogoRequest,
  AssignLogoTagsRequest,
  AddLogoTag,
  LogoDownloadRequest,
} from "./dto/logo.request";
import type {
  LogoListItem,
  LogoDetail,
  CiGuideline,
  LogoTag,
  Logo,
  AssignedLogoTag,
} from "./dto/logo.response";

/** 로고 태그 부여 (일괄) */
export async function assignLogoTags(
  logoId: number,
  body: AssignLogoTagsRequest
): Promise<ApiResponse<AssignedLogoTag[]>> {
  const { data } = await apiClient.put<ApiResponse<AssignedLogoTag[]>>(
    `/api/logos/${logoId}/tags`,
    body
  );
  return data;
}

/** 로고 목록 */
export async function getLogoList(
  params: LogoListQuery
): Promise<ApiResponse<LogoListItem[]>> {
  const query: Record<string, any> = {};
  if (params.order) query.order = params.order; // NEWEST는 생략 가능
  if (params.tagIds && params.tagIds.length > 0) {
    query.tagIds = params.tagIds.join(","); // CSV로 고정
  }
  const { data } = await apiClient.get<ApiResponse<LogoListItem[]>>(
    "/api/logos",
    { params: query }
  );
  return data;
}

/** 로고 생성 */
export async function createLogo(
  req: CreateLogoRequest
): Promise<ApiResponse<Logo>> {
  const { style, ...body } = req;
  const { data } = await apiClient.post<ApiResponse<Logo>>("/api/logos", body, {
    params: { style },
  });
  return data;
}

/** CI 가이드라인 조회 */
export async function getCiGuideline(
  logoId: number
): Promise<ApiResponse<CiGuideline>> {
  const { data } = await apiClient.get<ApiResponse<CiGuideline>>(
    `/api/logos/${logoId}/ci-guideline`
  );
  return data;
}

/** CI 가이드라인 생성 */
export async function createCiGuideline(
  logoId: number
): Promise<ApiResponse<unknown>> {
  const { data } = await apiClient.post<ApiResponse<unknown>>(
    `/api/logos/${logoId}/ci-guideline`
  );
  return data;
}

/** 로고 태그 목록 조회 */
export async function getAllLogoTags(): Promise<ApiResponse<LogoTag[]>> {
  const { data } = await apiClient.get<ApiResponse<LogoTag[]>>(
    "/api/logos/tags"
  );
  return data;
}

/** 태그 생성(단일) */
export async function addLogoTag(
  req: AddLogoTag
): Promise<ApiResponse<LogoTag>> {
  const { data } = await apiClient.post<ApiResponse<LogoTag>>(
    "/api/logos/tags",
    req
  );
  return data;
}

/** 로고 상세 조회 */
export async function getLogoDetail(
  logoId: number
): Promise<ApiResponse<LogoDetail>> {
  const { data } = await apiClient.get<ApiResponse<LogoDetail>>(
    `/api/logos/${logoId}`
  );
  return data;
}

/** 로고 다운로드 */
export async function logoDownload(
  req: LogoDownloadRequest
): Promise<AxiosResponse<Blob>> {
  const res = await apiClient.get(`/api/logos/${req.logoId}/download`, {
    params: { format: "png" },
    responseType: "blob",
  });
  console.log("다운로드 응답", res);
  return await apiClient.get<Blob>(`/api/logos/${req.logoId}/download`, {
    params: { format: req.format },
    responseType: "blob",
  });
}
