/* eslint-disable prettier/prettier */
export interface ListKnightsFilter {
  page?: number
  pageSize?: number
  term?: string | null
}

export interface ListKnightsResponse {
  total: any
  currentPage: number
  pageSize: number
  data: any
}