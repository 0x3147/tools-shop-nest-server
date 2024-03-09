interface UserInfo {
  postId: number | bigint

  username: string

  email: string

  isAdmin: boolean

  roles: string[]

  permissions: string[]

  createTime: Date
}

export class LoginUserVo {
  userInfo: UserInfo

  token: string
}
