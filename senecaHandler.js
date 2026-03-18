const { 
    ActionRowBuilder, ButtonBuilder, ButtonStyle, 
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder,
    ModalBuilder, TextInputBuilder, TextInputStyle, 
    EmbedBuilder, ComponentType 
} = require('discord.js');
const axios = require('axios');

// Settings for the bot's appearance
const EMBED_COLOR = 0x3574cf;

/**
 * STEP 1: Show the initial Login Button
 * Triggered by "!seneca" in index.js
 */
async function startSenecaProcess(message) {
    const loginBtn = new ButtonBuilder()
        .setCustomId("seneca_open_login")
        .setLabel('Login to Seneca')
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(loginBtn);

    const embed = new EmbedBuilder()
        .setTitle('Seneca Autocompleter')
        .setDescription('Welcome! Please log in to your Seneca account to view your assignments.')
        .setColor(EMBED_COLOR)
        .setFooter({ text: 'Automated Homework Assistant' });

    await message.reply({ embeds: [embed], components: [row] });
}

/**
 * STEP 2: Handle all button clicks and form submits
 */
async function handleInteraction(interaction) {
    
    // --- 2A: User clicks "Login to Seneca" Button ---
    if (interaction.customId === 'seneca_open_login') {
        const modal = new ModalBuilder()
            .setCustomId('seneca_login_modal')
            .setTitle('Seneca Authentication');

        const emailInput = new TextInputBuilder()
            .setCustomId('email')
            .setLabel("Seneca Email")
            .setPlaceholder('example@school.com')
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        const passInput = new TextInputBuilder()
            .setCustomId('password')
            .setLabel("Seneca Password")
            .setStyle(TextInputStyle.Short)
            .setRequired(true);

        modal.addComponents(
            new ActionRowBuilder().addComponents(emailInput),
            new ActionRowBuilder().addComponents(passInput)
        );

        await interaction.showModal(modal);
    }

    // --- 2B: User submits the Login Modal ---
    if (interaction.customId === 'seneca_login_modal') {
        await interaction.deferReply({ ephemeral: true });

        const email = interaction.fields.getTextInputValue('email');
        const password = interaction.fields.getTextInputValue('password');

        // Logic Note: Here is where you would normally call your Puppeteer login function
        // For now, we simulate a successful login and fetch assignments
        try {
            // Mocking a successful login token
            const authToken = "MOCK_TOKEN_12345"; 
            
            // Show the homework selection menu
            await showHomeworkMenu(interaction, authToken);
        } catch (err) {
            await interaction.editReply('❌ Failed to login. Please check your details.');
        }
    }

    // --- 2C: User selects a Homework from the dropdown ---
    if (interaction.isStringSelectMenu() && interaction.customId === 'homework_select') {
        await interaction.deferUpdate();
        const selectedId = interaction.values[0];
        
        // Start the "Automation" visual progress
        await startAutomationProgress(interaction, selectedId);
    }
}

/**
 * STEP 3: Fetch and show the homework list
 */
async function showHomeworkMenu(interaction, token) {
    const embed = new EmbedBuilder()
        .setTitle('📋 Your Assignments')
        .setDescription('Select a homework task from the menu below to complete it automatically.')
        .setColor(EMBED_COLOR);

    // In a real app, you'd fetch this from the Seneca API using the token
    const select = new StringSelectMenuBuilder()
        .setCustomId('homework_select')
        .setPlaceholder('Choose a task...')
        .addOptions(
            new StringSelectMenuOptionBuilder().setLabel('Biology: Cells').setValue('task_1').setDescription('Due in 2 days'),
            new StringSelectMenuOptionBuilder().setLabel('Physics: Energy').setValue('task_2').setDescription('Due in 5 days'),
            new StringSelectMenuOptionBuilder().setLabel('Maths: Algebra').setValue('task_3').setDescription('Due Tomorrow')
        );

    const row = new ActionRowBuilder().addComponents(select);

    await interaction.editReply({ embeds: [embed], components: [row] });
}

/**
 * STEP 4: The Progress Bar / Automation Visuals
 */
async function startAutomationProgress(interaction, taskId) {
    let progress = 0;
    const totalSteps = 5;

    const progressEmbed = new EmbedBuilder()
        .setTitle('🚀 Automation Started')
        .setDescription('Please wait while we complete your homework...')
        .setColor(0xFFFF00); // Yellow for "In Progress"

    await interaction.editReply({ embeds: [progressEmbed], components: [] });

    // Loop to simulate finishing sections
    for (let i = 1; i <= totalSteps; i++) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds per step
        
        const bar = '🟩'.repeat(i) + '⬜'.repeat(totalSteps - i);
        progressEmbed.setFields([
            { name: 'Progress', value: `${bar} (${i * 20}%)` },
            { name: 'Status', value: `Answering section ${i}...` }
        ]);

        await interaction.editReply({ embeds: [progressEmbed] });
    }

    // Final Success Message
    progressEmbed.setTitle('✅ Homework Complete')
        .setDescription('Your assignment has been submitted successfully!')
        .setColor(0x00FF00) // Green for "Success"
        .setFields([{ name: 'Simulated Time', value: '45 Minutes' }]);

    await interaction.editReply({ embeds: [progressEmbed] });
}

module.exports = { startSenecaProcess, handleInteraction };
