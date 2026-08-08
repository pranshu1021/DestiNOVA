import { io } from "socket.io-client";
import AsyncStorage from "@react-native-async-storage/async-storage";

let socket = null;

const SOCKET_URL = "http://192.168.1.3:5000";

export const initSocket = async () => {
  if (socket) {
    return socket;
  }

  const token = await AsyncStorage.getItem("token");
  socket = io(SOCKET_URL, {
    transports: ["websocket"],
    auth: {
      token,
    },
  });

  socket.on("connect_error", (err) => {
    console.log("Socket connect error:", err.message);
  });

  return socket;
};

export const getSocket = () => socket;
