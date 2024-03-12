interface tableData {
  username: string
  email: string
  isFrozen: boolean
  createTime: Date
}

export class QueryUserListVo {
  tableData: tableData[]
  total: number
  currentPage: number
  lastPage: number
}
