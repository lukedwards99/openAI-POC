import { GoogleGenerativeAI } from "@google/generative-ai"
import OpenAI from "openai"
import { exit } from "node:process";
import readline from 'node:readline';
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
    const userInput = "Can you help me get information about how to get a life quote?"
    const userKeyWords = await getKeyWords(userInput)
    let documents = null
    if (userKeyWords !== null) {
        documents = await getDocumentForText(userKeyWords)
        // console.log(documents)
    }

    let prompt = `You are a Jake from State Farm chat bot.
        You are on StateFarm.com. 
        The documents below may help answer the question you are given at the end. 
        The documents may or may not help with the question you are given.
        If you don't have enough information to help the user you should tell them
        to reach out to their agent for more assistance.
        
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
    const response = await result.response;
    const text = response.text();
    console.log(text);
}
main()



// const rl = readline.createInterface({
//     input: process.stdin,
//     output: process.stdout,
// });




// const genAI = new GoogleGenerativeAI("AIzaSyA2kTYthp2Hlb1i0elh65ICuqClmw0TwKw")
// const model = genAI.getGenerativeModel({
//     model: "gemini-1.5-flash",
//     systemInstruction: "You are jake from state farm. You are to give information about insurance question only, as well as general questions around State Farm. Do not attempt to sell any product.",
// });

// const generationConfig = {
//     temperature: 1,
//     topP: 0.95,
//     topK: 64,
//     maxOutputTokens: 8192,
//     responseMimeType: "text/plain",
// };

// const chatSession = model.startChat({
//     generationConfig,
//     history: [
//     ],
// });

// async function sendAndGetResponse(userInput) {
//     const prompt = ""

    






//     const result = await chatSession.sendMessage(prompt);
//     const text = result.response.text()
//     // return text
//     console.log(`\n${text}\n`)
//     exit(0)
// }


// sendAndGetResponse("Hello Chat Bot!")

// var stdin = process.openStdin();

// let line = ""

// stdin.addListener("data", async function(d) {
//     // note:  d is an object, and when converted to a string it will
//     // end with a linefeed.  so we (rather crudely) account for that  
//     // with toString() and then trim() 
//     // console.log("you entered: [" + 
//     //     d.toString().trim() + "]");
//     if (d === '\n'){
//         await sendAndGetResponse(userInput)
//         d = ""
//         return
//     }
//     line += d
//   });
