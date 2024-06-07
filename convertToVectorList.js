import OpenAI from "openai"
import fs from "fs"
import path from "path"

const openai = new OpenAI({apiKey: "sk-proj-c3F1TEwL0ksuhEy5zzLpT3BlbkFJ757kGMRj2MhlXgFCILbD"});

async function embed(data) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: data,
    encoding_format: "float",
  });

  console.log(embedding.data[0].embedding);
}

function processFilesFromFolder(folderPath) {
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return console.error(`Unable to scan directory: ${err}`);
        }

        files.forEach((file) => {
            const filePath = path.join(folderPath, file);
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return console.error(`Unable to read file: ${err}`);
                }

                embed(data);
            });
        });
    });
}

processFilesFromFolder("./document_store")