import uuid4 from "uuid4";
import express from "express";
import { matches } from "../data/matches";
import { users } from "../data/users";

const router = express.Router();

router.get("/:id", ({ params: { id } }: { params: { id: string } }, res) => {
  const match = matches.find((match) => match.id === id);

  res
    .status(match ? 200 : 404)
    .json(match ? match : { message: "Match not found" });
});

router.post("/create", ({ headers: { id } }, res) => {
  if (users.find((user) => user.id === id)) {
    const match = {
      id: uuid4(),
      player1: id,
      player2: null,
      player1Position: 200,
      player2Position: 200,
      ballPosition: { x: 200, y: 200 },
    };
    matches.push(match);

    res.status(200).json(match);
  } else {
    res.status(404).json({ message: "Wrong ID" });
  }
});

router.post("/:id/play", ({ params: { id } }, res) => {
  const matchIndex = matches.findIndex((match) => match.id === id);
  if (matchIndex !== -1) {
    let player1Position = matches[matchIndex].player1Position;
    let player2Position = matches[matchIndex].player2Position;
    const ballPosition = matches[matchIndex].ballPosition;

    let ballXDirection = 1;
    let ballYDirection = 1;

    let player2Direction = 1;

    const playerWidth = 100;
    const playerHeight = 20;

    const windowWidth: number = 300;
    const windowHeight: number = 600;

    const ballMoving = () => {
      const position = {
        x:
          ballXDirection > 0
            ? ballPosition.x < windowWidth - 20
              ? ballPosition.x++
              : (ballXDirection = -1)
            : ballPosition.x-- > 0
            ? ballPosition.x--
            : (ballXDirection = 1),
        y:
          ballYDirection > 0
            ? ballPosition.y > windowHeight - (playerHeight + 30) &&
              ballPosition.x > player1Position &&
              ballPosition.x < player1Position + playerWidth
              ? (ballYDirection = -1)
              : ballPosition.y < windowHeight - 20
              ? ballPosition.y++
              : (ballYDirection = -1)
            : ballPosition.y-- < playerHeight + 20 &&
              ballPosition.x > player2Position &&
              ballPosition.x < player2Position + playerWidth
            ? (ballYDirection = 1)
            : ballPosition.y-- > 0
            ? ballPosition.y--
            : (ballYDirection = 1),
      };

      matches[matchIndex].ballPosition = position;
    };

    const player2AutoMoving = () => {
      const position =
        player2Direction > 0
          ? player2Position + playerWidth < windowWidth
            ? player2Position++
            : (player2Direction = -1)
          : player2Position-- > 0
          ? player2Position--
          : (player2Direction = 1);

      matches[matchIndex].player2Position = position;
    };

    setInterval(() => {
      ballMoving();
      //player2AutoMoving();
    }, 1);
  }
});

router.post(
  "/:id/move",
  ({ params: { id }, body: { playerPosition } }, res) => {
    const matchIndex = matches.findIndex((match) => match.id === id);
    if (matchIndex !== -1) {
      matches[matchIndex].player1Position = playerPosition;
      matches[matchIndex].player2Position = 200 - playerPosition;

      res.status(200).json(matches[matchIndex]);
    } else {
      res.status(404).json({ message: "Match not found" });
    }
  }
);

export default router;
