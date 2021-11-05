import dotenv from "dotenv";
dotenv.config();
import tmi from "tmi.js";
import Pusher from "pusher";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://kumfyagspvlguifdxmnu.supabase.co";
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

  if (isModUp && command === "setpressups") {
    const numStr = parsedM.slice(1).join(" ");

    const { data, error } = await supabase
      .from("pressups")
      .update({ count: parseInt(numStr) })
      .match({ id: 1 });

    if (!error) {
      client.say(channel, `${tags.username} Pressups updated`);
    } else {
      console.error(error);
      client.say(channel, "Error setting Pressups");
    }
  }

  if (command === "pressupc") {
    let { data: pressups, error } = await supabase
      .from("pressups")
      .select("*")
      .eq("id", 1);

    if (!error) {
      let pressupsCount = pressups[0].count;
      client.say(channel, `Billy has to do ${pressupsCount} pressups`);
    }
  }
});
