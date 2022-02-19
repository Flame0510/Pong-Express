import express from "express";
import { createServer } from "http";

import cors from "cors";

import { Server } from "socket.io";

import { socketConnection } from "./socket";

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

socketConnection();

import auth from "./routes/auth";
import matches from "./routes/matches";

app.use("/auth", auth);
app.use("/matches", matches);

httpServer.listen(process.env.PORT || 3000);
