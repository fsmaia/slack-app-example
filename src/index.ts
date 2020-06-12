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
  triggerId: string
): Promise<WebAPICallResult> => {
  return web.views.open({
    token: botAccessToken,
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

    return openStartDiscussionModal(payload.trigger_id);
  }
);

slackInteractions.action({ type: 'button' }, (payload, respond) => {
  console.log('button clicked', payload);

  const value = payload.actions[0].value;

  if (value === 'yes') {
    return respond({
      text: 'Embrace yourselves. The endless thread is coming!',
      response_type: 'ephemeral',
    });
  }

  if (value === 'no') {
    return respond({
      text:
        'No discussions in the way. Every little thing is gonna be alright...',
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
    { body: { challenge, text, type, ...body } }: express.Request,
    res: express.Response
  ) => {
    console.log(body);

    if (type === 'url_verification') {
      res.status(200).send({ challenge });
    }

    if (type === 'app_mention' && typeof text === 'string') {
      if (text.match('hey')) {
        res.status(200).send('Ho!');
      }

      if (text.match('ping')) {
        res.status(200).send('Pong!');
      }

      res.status(200).send('What do you mean?');
    }
  }
);

app.post(
  '/commands',
  async (
    {
      body: { channel_id, command, response_url, text, trigger_id, user_name },
    }: express.Request,
    res: express.Response
  ) => {
    try {
      console.log('Command received: ', command);

      const webhook = new IncomingWebhook(response_url as string);

      if (command === Command.ANNOUNCE) {
        await web.chat.postMessage({
          channel: channel_id,
          text: `:loudspeaker: *BREAKING NEWS! @${user_name} has something important to say!* :loudspeaker:\n${text}`,
        });

        await webhook.send({
          text: 'I have spread the word for you!',
        });

        return res.send(200);
      }

      if (command === Command.START_DISCUSSION) {
        await openStartDiscussionModal(trigger_id);

        return res.status(200).send('Discussion started');
      }

      if (command === Command.POLL) {
        await web.chat.postMessage({
          channel: channel_id,
          text: '',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text:
                  '*Time to express yourself by voting! Share your thoughts :tada:*',
              },
            },
            { type: 'divider' },
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text,
              },
            },
            { type: 'divider' },
            {
              type: 'actions',
              elements: [
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: ':thumbsup: Oh, yeah!!',
                    emoji: true,
                  },
                  value: 'agree',
                },
                {
                  type: 'button',
                  text: {
                    type: 'plain_text',
                    text: ':thumbsdown: Oh, really??',
                    emoji: true,
                  },
                  value: 'disagree',
                },
              ],
            },
          ],
        });

        return res.status(200).send('May the odds ever be in your favor!');
      }
    } catch (e) {
      console.log('Command failed: ', e);
    }
  }
);

app.listen(port, () =>
  console.log(`Slack app example service listening at @${port}`)
);
