import express from "express";
import { createServer } from "http";

import cors from "cors";

import { Server } from "socket.io";

export const io = new Server(4000, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

io.on("connection", (socket) => console.log(socket.id));

const app = express();
app.use(express.json());
app.use(cors({ origin: true }));

const httpServer = createServer(app);

import auth from "./routes/auth";
import matches from "./routes/matches";

app.use("/auth", auth);
app.use("/matches", matches);

httpServer.listen(3000);