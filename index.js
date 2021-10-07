require("dotenv").config();
const Pusher = require("pusher");
const tmi = require("tmi.js");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const client = new tmi.Client({
  identity: {
    username: "vibey_bot",
    password: process.env.TWITCH_PASS,
  },
  connection: {
    secure: true,
  },
  channels: ["opti_21"],
});

client.connect();

client.on("message", async (channel, tags, message, self) => {
  // Ignore echoed messages.
  if (self) return;

  if (message[0] !== "!") return;
  let parsedM = message.trim().split(" ");
  let command = parsedM[0].slice(1).toLowerCase();

  if (command === "tr") {
    const reqStr = parsedM.slice(1).join(" ");
    const request = {
      message: reqStr,
      requester: tags.username,
    };

    try {
      pusher.trigger("requests", "new-request", request);
      client.say(channel, `${tags.username} requested ${reqStr}`);
    } catch (err) {
      console.error(err);
    }
  }
});
