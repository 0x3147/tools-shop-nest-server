interface tableData {
  username: string
  email: string
  isAdmin: boolean
  isFrozen: boolean
  createTime: Date
}

export class QueryUserListVo {
  tableData: tableData[]
  total: number
  currentPage: number
}
