import { io } from "./app";
import { socketList } from "./data/socketList";

export const socketConnection = () => {
  try {
    io.on("connection", (socket) => {
      socket.on("login", ({ id, userId }) =>
        socketList.push({ id, userId, socket: socket.id })
      );

      socket.on("join-match", (matchId) => {
        socket.join(matchId);

        console.log("MATCH ID: ", matchId);
      });

      socket.on("disconnect", () => {
        const socketListIndex = socketList.findIndex(
          (socketListItem) => socketListItem.socket === socket.id
        );

        socketListIndex !== -1 && socketList.splice(socketListIndex);
      });
    });
  } catch (error) {
    console.log(error);
  }
};
