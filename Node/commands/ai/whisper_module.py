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
    userid = sys.argv[1]
    filePath = sys.argv[2]
except IndexError:
    print("Error! Data Missing!")


async def process_audio_stream(filePath):

    logging.info(f"process_audio_stream called filePath: {filePath}")
    try:
        # Create a transcription using the client's function
        with open(filePath, "rb") as f:
            transcription = await client.audio.transcriptions.create(
                model="whisper-1",
                language="da",
                file=f,
                response_format="json"
            )

        # Process the streaming response
        content = transcription.text
        if content is not None:
            yield content
        else:
            yield "\n"

    except ValueError as e:
        yield {'error': str(e)}

asyncio.run(process_audio_stream(userid, filePath))