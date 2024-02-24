interface UserInfo {
  postId: number | bigint

  username: string

  email: string

  isAdmin: boolean

  createTime: Date

  member: boolean
}

export class LoginUserVo {
  userInfo: UserInfo

  accessToken: string

  refreshToken: string
}
