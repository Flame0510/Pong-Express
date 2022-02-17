import { sessions } from "../data/sessions";

const checkToken = (
  { headers: { authorization } }: any,
  res: any,
  next: any
) => {
  const token =
    authorization?.includes("Bearer") &&
    authorization?.substring(authorization.lastIndexOf("Bearer ") + 7);

  const session = sessions.find((session) => session.token === token);

  return token
    ? session
      ? ((res.locals.checkTokenResponse = {
          id: session.id,
          userId: session.userId,
          token,
        }),
        next())
      : res.status(401).json({ message: "Wrong or Invalid Token" })
    : res.status(404).json({ message: "Token not found" });
};

export default checkToken;
