import express from "express";
import uuid4 from "uuid4";
import { User } from "../models/user";
import { users } from "../data/users";
import { sessions } from "../data/sessions";

import jwt from "jsonwebtoken";
import checkToken from "../middlewares/checkToken";

const router = express.Router();

router.post(
  "/sign-up",
  ({ body: { username, password } }: { body: User }, res) => {
    if (users.find((user: User) => user.username === username)) {
      res.status(409).json({
        message:
          "There is another user with this username, please use another username",
      });
    } else {
      const user = { id: uuid4(), username, password };
      users.push(user), res.status(200).json(user);
    }
  }
);

router.post(
  "/login",
  ({ body: { username, password } }: { body: User }, res) => {
    const user = users.find(
      (user: User) => user.username === username && user.password === password
    );

    if (user) {
      const session = {
        id: uuid4(),
        userId: user.id,
        token: jwt.sign({ data: Math.floor(Date.now() / 1000) }, username),
        lastAccess: new Date()
          .toLocaleString()
          .split("/")
          .join("-")
          .split(",")
          .join(" -"),
      };

      sessions.push(session);
      res.status(200).json(session);
    } else {
      res.status(404).json({ message: "Wrong Credentials" });
    }
  }
);

router.get("/sessions", checkToken, (_, res) => res.status(200).json(sessions));

router.get("/token", checkToken, (_, res) => {
  res.status(200).json(res.locals.checkTokenResponse);
});

router.get("/session", checkToken, (_, res) =>
  res
    .status(200)
    .json(
      sessions.find(
        ({ userId }) => res.locals.checkTokenResponse.userId === userId
      )
    )
);

router.get("/me", checkToken, (_, res) =>
  res
    .status(200)
    .json(users.find(({ id }) => res.locals.checkTokenResponse.userId === id))
);

export default router;
