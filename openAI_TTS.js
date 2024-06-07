import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({apiKey: "sk-proj-x28G8e98ELPX2KeCAwCKT3BlbkFJ4Aor5UangukMmS3B0IT3"});

const speechFile = path.resolve("./speech.mp3");

async function main() {
  const mp3 = await openai.audio.speech.create({
    model: "tts-1",
    voice: "alloy",
    input: "Hi luna baby",
  });
  console.log(speechFile);
  const buffer = Buffer.from(await mp3.arrayBuffer());
  await fs.promises.writeFile(speechFile, buffer);
}
main();