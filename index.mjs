import { Server } from "socket.io";

const io = new Server({ cors: "http://localhost:5173/" });

let onlineUsers = [];
let usersAreChatting = [];

io.on("connection", (socket) => {
  console.log("new connection", socket.id);

  socket.on("addNewUser", ({ userId, email }) => {
    !onlineUsers.some((user) => user.userId === userId) &&
      onlineUsers.push({
        userId,
        email,
        socketId: socket.id,
      });
    console.log("onlineUsers", onlineUsers);

    io.emit("getOnlineUsers", onlineUsers);
  });

  socket.on("sendMessage", ({ message, recipientId }) => {
    console.log(
      "sendMessage ------------------------------------->>>",
      message,
      recipientId
    );
    const user = onlineUsers.find((user) => user.userId === recipientId);
    console.log("user ------------------------------------->>>",user)

    if (user) {
      io.to(user.socketId).emit("getMessage", message);
    }
  });

  socket.on("chatting", ({ chatId, email }) => {
    console.log("chatting with id : " + chatId);
    console.log("email : " + email);
    !usersAreChatting.some(
      (chatting) => chatId === chatting?.chatId && email === chatting?.email
    ) &&
      usersAreChatting.push({
        chatId,
        email,
        socketId: socket.id,
      });
    console.log("usersAreChatting", usersAreChatting);
  });

  socket.on("typing", ({ chatId, email }) => {
    console.log("Someone Texting...");

    const bothUsersReadyToChat = usersAreChatting.some(
      (user) => user.chatId === chatId && user.email !== email
    );

    console.log("bothUsersReadyToChat ", bothUsersReadyToChat);

    if (!bothUsersReadyToChat) {
      return;
    }

    const userRecipient = usersAreChatting.filter((user) => {
      return user.chatId === chatId && user.email !== email;
    })[0];
    console.log("userRecipient", userRecipient);
    io.to(userRecipient.socketId).emit("someoneTypingToYou");
  });

  socket.on("senderStopTyping", ({ chatId, email }) => {
    const bothUsersReadyToChat = usersAreChatting.some(
      (user) => user.chatId === chatId && user.email !== email
    );

    console.log("bothUsersReadyToChat ", bothUsersReadyToChat);

    if (!bothUsersReadyToChat) {
      return;
    }

    const userRecipient = usersAreChatting.filter((user) => {
      return user.chatId === chatId && user.email !== email;
    })[0];
    console.log("userRecipient", userRecipient);
    io.to(userRecipient.socketId).emit("leaveTypingToYou");
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
    // onlineUsers.map((user)=>{
    //     console.log("TEST : ", socket.id , user.socketId)
    // })
    onlineUsers = onlineUsers.filter((user) => {
      return user.socketId !== socket.id;
    });
    usersAreChatting = usersAreChatting.filter((user) => {
      return user.socketId !== socket.id;
    });
    console.log("onlineUsers in disconnect", onlineUsers);
    io.emit("getOnlineUsers", onlineUsers);
  });
});

io.listen(3000);
