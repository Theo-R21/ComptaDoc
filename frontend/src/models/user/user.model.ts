export class UserModel {
  id: number;
  first_name: string;
  last_name: string;
  email: string;

  constructor(
    id: number = 0,
    first_name: string = "",
    last_name: string = "",
    email: string = "",
  ) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
  }
}

export class UserInfoModel {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  last_login: Date;
  date_joined: Date;
  is_active: boolean;
  is_superuser: boolean;

  constructor(
    id: number = 0,
    first_name: string = "",
    last_name: string = "",
    username: string = "",
    last_login: Date = new Date(),
    date_joined: Date = new Date(),
    is_active: boolean = false,
    is_superuser: boolean = false,
    email: string = "",
  ) {
    this.id = id;
    this.first_name = first_name;
    this.last_name = last_name;
    this.username = username;
    this.last_login = last_login;
    this.date_joined = date_joined;
    this.is_active = is_active;
    this.is_superuser = is_superuser;
    this.email = email;
  }
}

