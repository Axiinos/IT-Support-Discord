const { Events, User} = require('discord.js');
const console = require("node:console");
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

		if (interaction.commandName === 'shutdown' && interaction.user.id === '155360457908027392')
			await command.execute(interaction);

		if (interaction.commandName === 'shutdown' && interaction.user.id != '155360457908027392') {
			await interaction.reply({ content: 'You do not have permission to use this command!'});
			await interaction.followUp({content: 'https://y.yarn.co/5b9900b3-3137-42c1-86ca-052c7092c61a_text.gif'})

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

		if (interaction.commandName != 'support' && interaction.commandName != 'shutdown') {
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