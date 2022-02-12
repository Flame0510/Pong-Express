import { matches } from './../data/matches';
import express from "express";
import uuid4 from "uuid4";
import { IUser } from "../models/user";
import { users } from "../data/users";
import { sessions } from "../data/sessions";

const router = express.Router();

router.post(
  "/login",
  ({ body: { username, password } }: { body: IUser }, res) => {
    if (
      users.findIndex(
        (user: IUser) =>
          user.username === username && user.password === password
      ) === -1
    ) {
      res.status(404).json({ message: "Wrong Credentials" });
    } else {
      const session = { id: uuid4(), username, password };
      sessions.push(session);
      res.status(200).json(session);
    }
  }
);

export default router;
