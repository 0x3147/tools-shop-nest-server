interface UserInfo {
  postId: number | bigint

  username: string

  email: string

  isAdmin: boolean

  isFrozen: boolean

  createTime: Date
}

export class LoginUserVo {
  userInfo: UserInfo

  token: string
}
