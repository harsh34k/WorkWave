import { Server } from "socket.io";

export function socketServer(httpServer: any) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
    },
  });
  const onlineUsers = new Map();
  // making http connection
  io.on("connection", (socket) => {
    // taking user id and mapping it with their current socket id
    socket.on("user-connected", (data) => {
      if (data?.user?.id) {
        onlineUsers.set(data?.user?.id, socket.id);
      }
    });
    // handling disconnection--> removing user from onlineUsers list
    socket.on("disconnect", () => {
      onlineUsers.forEach((value, key, map) => {
        if (value == socket.id) {
          onlineUsers.delete(key);
        }
      });
    });
    // listening to message send and and transferring message to the user
    socket.on("message-send", (data) => {
      if (onlineUsers.has(data.to)) {
        io.to(onlineUsers.get(data.to)).emit("message-recieved", {
          message: data.message,
          from: data.from,
        });
      }
    });
    // checking if the given user is online or not
    socket.on("user-online-request", (data) => {
      if (data?.requestFor && onlineUsers.has(data?.requestFor)) {
        io.to(socket.id).emit("user-online-response", {
          online: true,
          id: data?.requestFor,
        });
      }
    });
  });
}
