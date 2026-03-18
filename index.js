// 1. Load the "Secret Safe" (.env file)
require('dotenv').config();

// 2. Import the necessary parts from the Discord library
const { Client, GatewayIntentBits, Events } = require('discord.js');

// 3. Import our custom logic from the handler file
const { startSenecaProcess, handleInteraction } = require('./senecaHandler');

// 4. Create the Bot Client and tell it what it's allowed to see (Intents)
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Allows bot to see servers
        GatewayIntentBits.GuildMessages,    // Allows bot to see messages
        GatewayIntentBits.MessageContent    // Allows bot to read what the message says
    ]
});

// 5. Run this code once when the bot successfully connects to Discord
client.once(Events.ClientReady, (readyClient) => {
    console.log(`✅ Success! Logged in as: ${readyClient.user.tag}`);
    console.log(`Type !seneca in your server to begin.`);
});

// 6. Listen for the "!seneca" command in chat
client.on(Events.MessageCreate, async (message) => {
    // Ignore messages from other bots
    if (message.author.bot) return;

    if (message.content.toLowerCase() === '!seneca') {
        try {
            await startSenecaProcess(message);
        } catch (error) {
            console.error('Error starting Seneca process:', error);
            await message.reply('❌ Something went wrong starting the menu.');
        }
    }
});

// 7. Listen for "Interactions" (Button clicks, Select menus, Modal submissions)
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        // Send the interaction to our handler file to be processed
        await handleInteraction(interaction);
    } catch (error) {
        console.error('Interaction Error:', error);
        
        // If something breaks, try to tell the user quietly (ephemeral)
        const errorMessage = '❌ An error occurred while processing your request.';
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: errorMessage, ephemeral: true });
        } else {
            await interaction.reply({ content: errorMessage, ephemeral: true });
        }
    }
});

// 8. Log the bot in using the token saved in your .env file
client.login(process.env.DISCORD_TOKEN);
