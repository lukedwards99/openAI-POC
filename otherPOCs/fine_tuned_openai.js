import OpenAI from "openai";
import path from "path";
import fs from "fs";

const speechFile = path.resolve("./speech.mp3");
const openai = new OpenAI({ apiKey: "" });

async function main() {
    console.log(new Date())
    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: "You are a chat bot on statefarm.com. You are to refer to yourself as Jake from State Farm. Do not provide any resources to other insurance company or agency that is not StateFarm." },
            { role: "user", content: "Can you help me get an auto quote?" }
        ],
        model: "ft:gpt-3.5-turbo-0125:personal:jake-auto-life:9XZjJ77A",
    });

    console.log(completion.choices[0].message.content);

    const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: completion.choices[0].message.content,
    });
    console.log(speechFile);
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    console.log(new Date())
}

main();