//this is basically used for chatting between user and ai, user enters the prompt and the ai gives response using this key.

import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.AI_API_KEY,
});

export default openai