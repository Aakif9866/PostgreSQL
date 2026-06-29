import arcjet, { tokenBucket, shield, detectBot, slidingWindow } from "@arcjet/node";

// rate limiting and bot detection

import "dotenv/config";

// init arcjet
export  const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics: ["ip.src"],
  rules: [
    // shield protects your app from common attacks e.g. SQL injection, XSS, CSRF attacks
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      // block all bots except search engines
      allow: [
        "CATEGORY:SEARCH_ENGINE",
        // see the full list at https://arcjet.com/bot-list
      ],
    }),
    // rate limiting
    // alternate to this we can also use sliding window protocol
    tokenBucket({
      mode: "LIVE",
      refillRate: 30,
      interval: 5,
      capacity: 20,
    }),
  ],
});
