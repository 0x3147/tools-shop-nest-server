type ProductInfo = {
  postId: number | bigint

  name: string

  tags: string[]

  imageUrl: string

  description: string

  downloadUrl: string
}

export class AdminProdList {
  tableData: ProductInfo[]
  total: number
  currentPage: number
  lastPage: number
}