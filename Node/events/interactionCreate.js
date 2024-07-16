const { Events, User} = require('discord.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);
		const user = interaction.user.id


		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			return;
		}

		if (interaction.commandName === 'support') {
			try {
				await interaction.deferReply();
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: `There was an error while executing this command!`, ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
				}
			}
		}

		if (interaction.commandName != 'support') {
			try {
				console.log(`Command was invoked by ${user} with command ${interaction.commandName}`);
				await command.execute(interaction);
			} catch (error) {
				console.error(error);
				if (interaction.replied || interaction.deferred) {
					await interaction.followUp({
						content: 'There was an error while executing this command!',
						ephemeral: true
					});
				} else {
					await interaction.reply({
						content: 'There was an error while executing this command!',
						ephemeral: true
					});
				}
			}
		}
	},
};