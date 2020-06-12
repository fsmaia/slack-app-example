import express = require('express');
import dotenv = require('dotenv');

dotenv.config();

const port: string | number = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.listen(port, () =>
  console.log(`Slack app example service listening at @${port}`)
);
