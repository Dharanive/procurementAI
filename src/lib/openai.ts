import { ChatOpenAI } from "@langchain/openai";

export const model = new ChatOpenAI({
    modelName: "gpt-4-turbo-preview", // or gpt-3.5-turbo if you prefer lower cost
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
});

export const simpleModel = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
});
