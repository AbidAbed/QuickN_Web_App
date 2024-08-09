import { io } from "socket.io-client";
// const socket = io("wss://novel-era.co:3002");
// const socket = io("wss://novel-era.co:3002");

// const socket = io("wss://novel-era.co:3002");

const socket = io("http://localhost:8900");

export default socket;
