interface AuthState {
  username: string,
  userId: string,
  jwt: string,
}

interface AuthPayload {
  username: string,
  userId: string,
  jwt: string,
};

export type {
  AuthState,
  AuthPayload,
};