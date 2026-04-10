import request from "../request";

export const apiSignIn = async (email: string, password: string) => {
  const response = await request.post("/api/user/users/auth", { email, password });
  return response.data;
};

export const apiSignOut = async () => {
  const response = await request.post("/api/user/users/auth/logout");
  return response.data;
};

export const apiGetUser = async () => {
  const response = await request.get("/api/user/users/me");
  return response.data;
};
