export interface TokenPayload {
  sub: string;
  username: string;
  name: string;
  roles: string[];       // ['ROLE_ADMIN'] | ['ROLE_USER'] | ['ROLE_PROFESOR']
  firstLogin: boolean;
  token_type: string;
  exp: number;
  iat: number;
  isGoogleUser: boolean;
}

export interface LoginPayload {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token:  string;
  refresh_token: string;
}

export interface RegisterPayload {
  username: string;
  password: string;
  roles:    string[];
}