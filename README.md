# slack-app-example

This repository is a Node.js (Express) server that powers a full-featured example Slack application for demonstration purposes.

## Getting started

- Install the dependencies

```bash
npm install
```

- Start the service

```bash
npm start
```

## Setting up the environment

The following environment variables must be provided:

| Variable              | Description                             |
| --------------------- | --------------------------------------- |
| `BOT_ACCESS_TOKEN`    | Application bot user OAuth access token |
| `CHANNEL_WEBHOOK_URL` | Application main channel webhook URL    |
| `CLIENT_ID`           | Application client id                   |
| `CLIENT_SECRET`       | Application client secret               |
| `SIGNING_SECRET`      | Application signing secret              |

Reference: https://api.slack.com/docs/oauth

## Features

### Event subscriptions

This server holds an event subscription listener in `/event-listener`, which allows the application to listen to Slack configured events.

In this example it will be mentions to the application bot.

Reference: https://api.slack.com/events

### Slash commands

This server holds a command listener in `/commands`, which allows the application to listen to slash commands (e.g. `/start`).

In this example the following commands will be handled:

| Command               | Description             | Server endpoint            |
| --------------------- | ----------------------- | -------------------------- |
| `/announce <message>` | Creates an announcement | /commands/announce         |
| `/poll <question>`    | Starts a poll           | /commands/poll             |
| `/start_discussion`   | Starts a discussion     | /commands/start_discussion |

Reference: https://api.slack.com/interactivity/slash-commands

### Interactivity

This server holds an interactive endpoint in `/interactivity`, which allows the application to have interactions with shortcuts, modals, or interactive components.

In this example the `Starts a discussion` shortcut will be handled.

Reference: https://api.slack.com/messaging/interactivity

#### Useful links

- Block kit builder: https://api.slack.com/tools/block-kit-builder

#### Registered shortcuts

| Name               | Description         | Callback ID      |
| ------------------ | ------------------- | ---------------- |
| Start a discussion | Starts a discussion | start_discussion |
