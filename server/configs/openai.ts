//this is basically used for chatting between user and ai, user enters the prompt and the ai gives response using this key.


import OpenAI from "openai";

console.log("API KEY:", process.env.OPENROUTER_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": "http://localhost:5173",
    "X-Title": "AI Website Builder",
  },
});

export default openai;

