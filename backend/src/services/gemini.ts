import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const chat = async (message: string, language: string = 'en') => {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  
  const prompt = `You are a helpful medical assistant. Answer the following question about medications in ${language}:\n\n${message}`;
  
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  return text;
};
