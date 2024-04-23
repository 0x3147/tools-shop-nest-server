type TagInfo = {
  postId: number | bigint

  name: string

  createdAt: Date
}

export class TagList {
  tableData: TagInfo[]
  total: number
  currentPage: number
  lastPage: number
}
