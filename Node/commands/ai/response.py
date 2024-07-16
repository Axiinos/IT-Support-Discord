# response module.
import logging
import os
import sys
import dotenv
from openai import AsyncOpenAI
from typing import List, Dict
import asyncio

client = AsyncOpenAI(
    organization=os.getenv("OPENAI_ORG_ID"),
    api_key=os.getenv("OPENAI_API_KEY"),
)

try:
    userid = sys.argv[1]
    message = sys.argv[2]
except IndexError:
    print("Error! Data Missing!")

conversations_voice: Dict[str, List[Dict[str, str]]] = {}


async def process_text(userid, question):
    # Get conversation history for this session
    conversation = conversations_voice.get(userid, [])

    # if this is a new session, start with predefined message
    if not conversation:
        system_content = f"You are a helpful first level support assistant in general IT, response max 3 paragraphs"
        conversation.append({"role": "system", "content": system_content})
        conversation.append({"role": "assistant", "content": "Please describe the problem you have with your computer."})

    # add the new question to the conversation
    conversation.append({"role": "user", "content": question})

    try:
        # Making a call to the OpenAI API
        text_response = await client.chat.completions.create(
            model="gpt-4-turbo-preview",  # Use appropriate model
            messages=conversation,
            stream=False,
            max_tokens=500,  # Set according to your requirements
        )
        
        # Gathering response content

        print(text_response.choices[0].message.content)
        return text_response.choices[0].message.content
        
    except Exception as e:
        logging.exception(f"An error occurred while making the API call: {e}")
        return f"An error occurred while making the API call: {e}"



asyncio.run(process_text(userid, message))

