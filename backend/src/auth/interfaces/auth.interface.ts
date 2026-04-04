export interface JwtPayload {
  sub: string; // Subject: ID do usuário no MongoDB
  name: string;
  phone: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    phone: string;
  };
}
