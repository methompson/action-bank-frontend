import { StoreType } from '../store';

export const isLoggedIn = (state: StoreType): boolean => {
  return state.auth.username.length > 0
    && state.auth.userId.length > 0
    && state.auth.jwt.length > 0;
};

export const selectAuthData = (state: StoreType) => {
  return {
    username: state.auth.username,
    userId: state.auth.userId,
    jwt: state.auth.jwt,
  };
};