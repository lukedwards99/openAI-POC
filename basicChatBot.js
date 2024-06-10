import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
//import { exit } from "node:process";
//import readline from 'node:readline';
import getDocumentForText from "./getDocuments.js";

const genAI = new GoogleGenerativeAI("");
const gemini = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const openai = new OpenAI({ apiKey: "" })


async function getKeyWords(text){
  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: `You are a helpful chat bot who pulls key words and phrases out of users questions.
                        Please to not respond with anything except the key words you select.
                        Do not include the key phrases: "state farm" or "statefarm.com"
                        So don't say something like "sure here are some key words" and don't start your reply with anything like "Key Words: ".
                        If the user is not asking a question just give one word response like "no".


                        Here is the user input to find key words in:

                        ${text}
                        `
          },
        ],
      },
    ],
  });
  const keyWords = response.choices[0].message.content
  console.log(`keyword reponse: ${keyWords}`)
  if(keyWords.toLowerCase() === "no" || keyWords.length <= 4){
    return null
  }

  return keyWords


}

async function main(){
  const userInput = "Why are my insurance rates going up?"
  const userKeyWords = await getKeyWords(userInput)
  let documents = null
  if (userKeyWords !== null) {
    documents = await getDocumentForText(userKeyWords)
    // console.log(documents)
  }

  let prompt = `You are a Jake from State Farm chat bot.
        You are on StateFarm.com. 
        The documents below may help answer the question you are given at the end. 
        The documents are FAQs from statefarm.com.
        The documents may or may not help with the question you are given.

        Documents: 

        `

  if (documents !== null){
    documents.forEach((doc, index) => {
      prompt += ` Document ${index} (URL: ${doc.url}):
            ${doc.documenttext}

            `
    })
  }else{
    prompt += " There are no documents for this question."
  }

  prompt += `END OF DOCUMENTS

    User Question: ${userInput}`

  console.log("prompt: " + prompt)
  const result = await gemini.generateContent(prompt);
  const response = result.response;
  const text = response.text();
  console.log("\n\nresponse: " +text);
  
  const hello = response

}
main()
