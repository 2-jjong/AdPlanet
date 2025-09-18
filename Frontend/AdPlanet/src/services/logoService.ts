import {
  // DTO 함수 & 타입
  fetchLogoList,
  fetchLogoDetailById,
  fetchCiGuidelineByLogoId,
  createCiGuideline as createCiGuidelineApi,
  fetchLogoTags,
  type LogoListItem,
  type LogoDetail,
  type CiGuideline,
  type LogoTag,
  type LogoListQuery,
} from "./dto/logo.dto";

// API 성공 코드 헬퍼
const ok = (code?: string) => code === "S0000";

/** 로고 목록 */
export async function getLogoList(
  params: LogoListQuery
): Promise<LogoListItem[]> {
  const res = await fetchLogoList(params); // ApiResponse<LogoListItem[]>
  if (!ok(res.code) || !Array.isArray(res.data)) {
    throw new Error(res.message || `API ${res.code}`);
  }
  return res.data; // 가공 없음
}

/** 로고 상세 */
export async function getLogoDetail(logoId: number): Promise<LogoDetail> {
  const res = await fetchLogoDetailById(logoId); // ApiResponse<LogoDetail>
  if (!ok(res.code) || !res.data) {
    throw new Error(res.message || `API ${res.code}`);
  }
  return res.data; // 가공 없음 (id는 필요 시 호출부에서 보유)
}

/** CI 가이드라인 */
export async function getCiGuideline(logoId: number): Promise<CiGuideline> {
  const res = await fetchCiGuidelineByLogoId(logoId); // ApiResponse<CiGuideline>
  if (!ok(res.code)) {
    throw new Error(res.message || `API ${res.code}`);
  }
  return (res.data ?? {}) as CiGuideline; // 서버가 null/undefined 줄 수 있으니 빈 객체 fallback
}

/** CI 가이드라인 생성 */
export async function createCiGuideline(logoId: number): Promise<void> {
  const res = await createCiGuidelineApi(logoId); // ApiResponse<unknown>
  if (!ok(res.code)) {
    throw new Error(res.message || `API ${res.code}`);
  }
}

/** 태그 목록 */
export async function getAllLogoTags(): Promise<LogoTag[]> {
  const res = await fetchLogoTags(); // ApiResponse<LogoTag[]>
  if (!ok(res.code) || !Array.isArray(res.data)) {
    throw new Error(res.message || `API ${res.code}`);
  }
  return res.data; // 가공 없음
}
