//@ts-check
import dotenv from "dotenv";
dotenv.config();
import tmi from "tmi.js";

const client = new tmi.Client({
  identity: {
    username: "vibey_bot",
    password: process.env.TWITCH_PASS,
  },
  connection: {
    secure: true,
  },
  channels: ["veryhandsomebilly"],
});

client.connect();

client.on("message", async (channel, tags, message, userstate, self) => {
  // Ignore echoed messages.
  if (self) return;

  if (message[0] !== "!") return;
  const parsedM = message.trim().split(" ");
  const command = parsedM[0].slice(1).toLowerCase();
  const badges = tags.badges || {};
  const isBroadcaster = badges.broadcaster;
  const isMod = badges.moderator;
  const isModUp = isMod || isBroadcaster;

  if (command === "tr" || command === "sr") {
    const reqStr = parsedM.slice(1).join(" ");

    client.say(channel, `${tags.username} requested ${reqStr}`);
  }
});
