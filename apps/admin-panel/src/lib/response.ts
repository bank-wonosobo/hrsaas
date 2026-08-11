export type ResponseData<T> = {
  message: string;
  success: boolean;
  data: T;
};

export type ResponseDataArr<T> = {
  message: string;
  success: boolean;
  data: T[];
};

export type Paging = {
  page: number;
  size: number;
  total_item: number;
  total_page: number;
};

export type PaginatedData<T> = {
  paging: Paging;
  data: T[];
};
