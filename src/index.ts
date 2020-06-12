import { createMessageAdapter } from '@slack/interactive-messages';
import { IncomingWebhook } from '@slack/webhook';
import { WebClient, WebAPICallResult } from '@slack/web-api';
import express = require('express');
import dotenv = require('dotenv');
import bodyParser = require('body-parser');

enum Command {
  ANNOUNCE = '/announce',
  POLL = '/poll',
  START_DISCUSSION = '/start_discussion',
}

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

const web = new WebClient(botAccessToken);

const slackInteractions = createMessageAdapter(signingSecret);

const openStartDiscussionModal = async (
  token: string,
  triggerId: string
): Promise<WebAPICallResult> => {
  return web.views.open({
    token,
    trigger_id: triggerId,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Start discussion',
      },
      close: {
        type: 'plain_text',
        text: 'Close',
      },
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: 'Do you really want to discuss? :thinking:',
          },
        },
        {
          type: 'actions',
          elements: [
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: ':thumbsup: Yes, I have so much to say!',
                emoji: true,
              },
              value: 'yes',
            },
            {
              type: 'button',
              text: {
                type: 'plain_text',
                text: ':thumbsdown: No, let it be.',
                emoji: true,
              },
              value: 'no',
            },
          ],
        },
      ],
    },
  });
};

slackInteractions.shortcut(
  { callbackId: 'start_discussion', type: 'shortcut' },
  (payload) => {
    console.log('start_discussion', payload);

    return openStartDiscussionModal(botAccessToken, payload.trigger_id);
  }
);

slackInteractions.action({ type: 'button' }, (payload, respond) => {
  if (payload.value === 'yes') {
    respond({
      text: 'Embrace yourselves. The endless thread is coming!',
      response_type: 'ephemeral',
    });
  } else {
    respond({
      text: 'Every little thing is gonna be alright...',
      response_type: 'ephemeral ',
    });
  }
});

app.use('/interactivity', slackInteractions.requestListener());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post(
  '/event-listener',
  (
    { body: { challenge, payload } }: express.Request,
    res: express.Response
  ) => {
    console.log('event listener', payload);

    res.status(200).send({
      challenge,
    });
  }
);

app.post(
  '/commands',
  async (
    {
      body: {
        access_token,
        channel_id,
        command,
        response_url,
        text,
        trigger_id,
        user_name,
      },
    }: express.Request,
    res: express.Response
  ) => {
    try {
      console.log('Command received: ', command);

      const webhook = new IncomingWebhook(response_url as string);

      if (command === Command.ANNOUNCE) {
        await web.chat.postMessage({
          text: `:loudspeaker: *BREAKING NEWS! @${user_name} has something important to say!* :loudspeaker:\n${text}`,
          channel: channel_id,
        });

        await webhook.send({
          text: 'I have spread the word for you!',
        });
      } else if (command === Command.START_DISCUSSION) {
        await openStartDiscussionModal(access_token, trigger_id);
      }

      res.status(200).send('Command received');
    } catch (e) {
      console.log('Could not send announcement: ', e);
    }
  }
);

app.listen(port, () =>
  console.log(`Slack app example service listening at @${port}`)
);
