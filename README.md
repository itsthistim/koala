## 🐨 About
[koala](https://discord.com/api/oauth2/authorize?client_id=796034058740170813&permissions=387136&scope=bot%20applications.commands) is a multi-purpose Discord written with the [Sapphire Discord.js Framework](https://www.sapphirejs.dev/) that I wrote for my friends. It's one of my first coding projects and it already saw multiple rewrites in its lifespan.

## 🚀 Getting started
Create a new application on the [Discord Developer Portal](https://discord.com/developers/applications) and add a bot to it. As soon as you have a bot application, set up the following:
- Enable the following Privileged Gateway Intents in the bot tab:
  - Message Content Intent
  - Server Members Intent
  - Presence Intent

- To invite your bot, go to the OAuth2 tab and go to the URL Generator. Select the following scopes:
  - `bot`
  - `applications.commands`
- Give it the needed permissions (or just give it Administrator permissions if you're lazy) and invite your bot using the generated URL.

When your bot is in your server, you can start setting up this project. Clone the repository and install the dependencies:
```
git clone https://github.com/itsthistim/koala.git
cd koala
npm install
```

Now create a `.env` file and fill the variables as in [`.env.example`](https://github.com/itsthistim/koala/blob/master/.env.example). You'll need to switch out the values based on your own setup.

Finally the bot is ready to be started. Run `npm run start` or `npm run dev` to start the bot.

If you run into any issues, feel free to open an issue on this repository or contact me on Discord (`thistim`).
