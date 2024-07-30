import logging
import os
import sys
import asyncio
from openai import AsyncOpenAI

logging.basicConfig(level=logging.INFO)

client = AsyncOpenAI(
    organization=os.getenv("OPENAI_ORG_ID"),
    api_key=os.getenv("OPENAI_API_KEY"),
)

try:
    filePath = sys.argv[1]
except IndexError:
    print("Error! Data Missing!")


async def process_audio_stream(filePath):

    logging.info(f"process_audio_stream called filePath: {filePath}")

    try:
        # Create a transcription using the client's function
        with open(filePath, "rb") as f:
            transcriptions = await client.audio.transcriptions.create(
                model="whisper-1",
                language="da",
                file=f,
                response_format="text"
            )

        # Process the streaming response
        content = transcriptions
        print(content)
        return content

    except ValueError as e:
        return {'error': str(e)}


asyncio.run(process_audio_stream(filePath))