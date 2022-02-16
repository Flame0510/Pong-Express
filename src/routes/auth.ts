import express from "express";
import uuid4 from "uuid4";
import { User } from "../models/user";
import { users } from "../data/users";
import { sessions } from "../data/sessions";

const router = express.Router();

router.post(
  "/login",
  ({ body: { username, password } }: { body: User }, res) => {
    const user = users.find(
      (user: User) => user.username === username && user.password === password
    );

    if (user) {
      const session = { id: uuid4(), userId: user.id, username, password };
      sessions.push(session);
      res.status(200).json(session);
    } else {
      res.status(404).json({ message: "Wrong Credentials" });
    }
  }
);

router.get("/sessions", (_, res) => res.status(200).json(sessions));

router.get("/me/:playerId", ({ params: { playerId } }, res) => {
  const user = sessions.find(({ id }) => id === playerId);

  console.log(playerId);

  res
    .status(user ? 200 : 404)
    .json(users ? user : { message: "Not logged user" });
});

export default router;
