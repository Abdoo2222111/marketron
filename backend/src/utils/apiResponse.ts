export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const successResponse = <T = any>(
  data: T,
  message?: string,
  pagination?: PaginationMeta
): ApiResponse<T> => {
  return {
    success: true,
    data,
    message,
    pagination,
  };
};

export const errorResponse = (error: string): ApiResponse => {
  return {
    success: false,
    error,
  };
};

export const paginationMeta = (
  page: number,
  limit: number,
  total: number
): PaginationMeta => {
  const totalPages = Math.ceil(total / limit);
  return {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
};
