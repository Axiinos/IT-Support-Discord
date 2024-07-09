import os
from typing import Optional

import discord
from discord import app_commands, errors

from discord.app_commands import commands

import application.commands.DevCommands as DevCommands
import application.commands.BasicCommands as BasicCommands

# Load your bot API Token.
try:
    # Attempt to load in Token
    discordtoken = os.getenv(key="DISCORD_TOKEN")
except Exception as e:
    print(f'there was an error attempting to load the token...: {e}')
    raise Exception

MY_GUILD = discord.Object(id=767084679890206760)


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
        command = list(usrmsg.split(" "))
        DevCommands.UpdateCommand.update(command[1])
        await message.channel.send()


# noinspection PyUnresolvedReferences
@client.tree.command()
async def hello(interaction: discord.Interaction):
    """Says Hello!"""
    await interaction.response.send_message(f'Hi, {interaction.user.mention}!')


@client.tree.command(name="update")
@app_commands.rename(message='Enter Module to reload: ')
@app_commands.describe(message="Updates Module")
@app_commands.checks.has_permissions(administrator=True)
async def update(interation: discord.Interaction.message):
    """updates specified message command"""
    try:
        command = command
        DevCommands.UpdateCommand.update(command)
        await interation.response.send_message(f'Attempted to update {command}')
    except Exception as err:
        await interation.response.send_message(f'an error occured! Error: {err}')
        raise errors.DiscordException

client.run(discordtoken)
