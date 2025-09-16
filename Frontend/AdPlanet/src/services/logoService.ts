import apiClient from './apiClient';
import type { ApiResponse } from '../types/api';

export interface LogoListItem {
  id?: string | number;
  name?: string;
  [key: string]: unknown;
}

export const fetchLogos = async (): Promise<ApiResponse<LogoListItem[]>> => {
  const res = await apiClient.get<ApiResponse<LogoListItem[]>>('/api/logos');
  return res.data as ApiResponse<LogoListItem[]>;
};


