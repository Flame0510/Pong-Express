import express from "express";
import { createServer } from "http";

import cors from "cors";

import { Server } from "socket.io";

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:8100",
  },
});

io.on("connection", (socket) => socket.join("match1"));

import auth from "./routes/auth";
import matches from "./routes/matches";

app.use("/auth", auth);
app.use("/matches", matches);

httpServer.listen(process.env.PORT || 5000);
