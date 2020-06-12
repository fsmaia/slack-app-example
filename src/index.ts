import express = require('express');
import dotenv = require('dotenv');

dotenv.config();

const port: string | number = process.env.PORT || 5000;

const botAccessToken = process.env.BOT_ACCESS_TOKEN;
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const signingSecret = process.env.SIGNING_SECRET;

if (!botAccessToken || !clientId || !clientSecret || !signingSecret) {
  throw new Error(
    'Proper environment variables must be provided! Refer to the project README.'
  );
}

const app = express();

app.use(express.json());

app.listen(port, () =>
  console.log(`Slack app example service listening at @${port}`)
);
