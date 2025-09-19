// 서버 DTO 묶음을 request/response로 분리하고, 이 파일에서는 재노출만 합니다.
export type { LogoListQuery, CreateLogoRequest, AddLogoTag, LogoStyle,AssignLogoTagsRequest, LogoDownloadRequest } from "./logo.request";

export type { LogoListItem, LogoDetail, LogoTag, CiGuideline, Logo } from "./logo.response";
