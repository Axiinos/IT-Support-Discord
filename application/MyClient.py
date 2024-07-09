import os
from typing import Optional, Any
import configparser
import discord
from discord import app_commands, errors

from discord.app_commands import commands

import application.commands.DevCommands as DevCommands
import application.commands.BasicCommands as BasicCommands

# Load your bot API Token.

# Check if 'cfg.ini' exists and contains the 'DISCORD_TOKEN' key
discordtoken = None

# Check if env.cfg exists
if os.path.exists('cfg.ini'):
    config = configparser.ConfigParser()
    config.read('cfg.ini')
    if config.has_option('TOKEN', 'DISCORD_TOKEN') and config['TOKEN'].get(
            'DISCORD_TOKEN') != '"Insert Token Here"':
        discordtoken = config['TOKEN'].get('DISCORD_TOKEN').strip('"\'')

# If no token in 'cfg.ini', try getting it from the environment
if discordtoken is None:
    discordtoken = os.getenv(key='DISCORD_TOKEN')

# If no token provided at all, exit the program
if discordtoken is None:
    print('Please Supply Token in either the cfg.ini file, or add it to your OS environment variables.')
    exit(1)

# Check if 'config.ini' exists and contains the 'ID' key
if os.path.exists('cfg.ini'):
    config = configparser.ConfigParser()
    config.read('cfg.ini')
    if (config.has_option('GUILD', 'ID') and
            config['GUILD'].get('ID') != '"Insert Guild ID here, again without quotes."'):
        idis = config['GUILD'].get('ID')

# Set the ID here
MY_GUILD = discord.Object(id=int(idis.strip('"\'')))
# If no guild id in 'config.ini', continue with a printout
if MY_GUILD is None:
    print("Couldn't find Guild ID, you can supply it in the cfg.ini file under [GUILD], ID = section.")
    exit(1)


class MyClient(discord.Client):

    def __init__(self, *, intents: discord.Intents):
        super().__init__(intents=intents)
        self.tree = app_commands.CommandTree(self)

    async def setup_hook(self):
        self.tree.copy_global_to(guild=MY_GUILD)
        await self.tree.sync(guild=MY_GUILD)


intents = discord.Intents.with_message_content()
client = MyClient(intents=intents)


@client.event
async def on_ready():
    print(f'Logged on as {client.user} (ID: {client.user.id})!')


@client.event
async def on_message(message):

    if message.author == client.user:
        return

    if message.author != "IT-Support#5115":
        print(f'Message from {message.author}: {message.content}')

    if message.content.startswith('$hello'):
        await message.channel.send('Hello!')

    if message.content.startswith('$update'):
        usrmsg = message.content
        command = usrmsg.split()
        DevCommands.UpdateCommand.update(command[1])
        await message.channel.send()


# noinspection PyUnresolvedReferences
@client.tree.command()
async def hello(interaction: discord.Interaction):
    """Says Hello!"""
    await interaction.response.send_message(f'Hi, {interaction.user.mention}!')


@client.tree.command()
@app_commands.rename(message="text")
@app_commands.describe(message="Updates Module")
@app_commands.checks.has_permissions(administrator=True)
async def update(interation: discord.Interaction.message, message: str):
    """updates specified message command"""
    try:
        command: Any = message.split()
        print(command)

        DevCommands.UpdateCommand.update(command)
        await interation.response.send_message(f'Attempted to update {command}')
    except Exception as err:
        await interation.response.send_message(f'an error occured! Error: {err}')
        raise errors.DiscordException

client.run(discordtoken)
