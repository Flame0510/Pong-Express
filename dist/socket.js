"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketConnection = void 0;
var app_1 = require("./app");
var socketList_1 = require("./data/socketList");
var socketConnection = function () {
    try {
        app_1.io.on("connection", function (socket) {
            socket.on("login", function (_a) {
                var id = _a.id, userId = _a.userId;
                return socketList_1.socketList.push({ id: id, userId: userId, socket: socket.id });
            });
            socket.on("join-match", function (matchId) {
                socket.join(matchId);
                console.log("MATCH ID: ", matchId);
            });
            socket.on("disconnect", function () {
                var socketListIndex = socketList_1.socketList.findIndex(function (socketListItem) { return socketListItem.socket === socket.id; });
                socketListIndex !== -1 && socketList_1.socketList.splice(socketListIndex);
            });
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.socketConnection = socketConnection;
