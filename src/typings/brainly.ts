export type UserActiveBanDetailsDataType = {
  type: string;
  givenBy: {
    link: string;
    nick: string;
  };
  expiresIn: string;
};

export type UserWarnDataType = {
  time: string;
  reason: string;
  content: string;
  taskId: number;
  warner: string;
  active: boolean;
}

export type UserDataType = {
  nick: string;
  points: number;
  presence: string;
  avatar: string;
  ranks: string[];
  bansCount: number;
  warns: UserWarnDataType[];
  activeBan?: UserActiveBanDetailsDataType;
}