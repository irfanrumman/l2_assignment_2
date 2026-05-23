export interface IUser {
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
}

export interface ILogUser {
  email: string;
  password: string;
}
