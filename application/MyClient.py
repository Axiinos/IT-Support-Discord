import os
from typing import Optional

import discord
from discord import app_commands

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


intents = discord.Intents.default()
client = MyClient(intents=intents)


@client.event
async def on_ready():
    print(f'Logged on as {client.user} with  (ID: {client.user.id}!')


@client.event
async def on_message(message):
    print(f'Message from {message.author}: {message.content}')
    if message.author == client.user:
        return

    if message.content.startswith('$hello'):
        await message.channel.send('Hello!')


@client.tree.command()
async def hello(interaction: discord.Interaction):
    """Says Hello!"""
    await interaction.response.send_message(f'Hi, {interaction.user.mention}!')


client.run(discordtoken)
