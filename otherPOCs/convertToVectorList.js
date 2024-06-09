import OpenAI from "openai"
import fs from "fs"
import path from "path"

const openai = new OpenAI({apiKey: "" })

// function writeToCSV(rows, filename){
//     const cvsWriterInstance = csvWriter({
//         path: filename,
//     })

//     cvsWriterInstance.writeRecords(rows)
//         .then(() => {
//             console.log(`CSV file written: ${fileName}`)
//         })
//         .catch((error) => {
//             console.error(`Error writing CSV file: ${error}`)
//         })
// }

async function embed(documentText) {
  const embedding = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: documentText,
    encoding_format: "float",
  })
  console.log(embedding.data[0].embedding);

  return {vector: embedding.data[0].embedding, text: documentText}
}

function processFilesFromFolder(folderPath) {
    const textAndVectorArray = []
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            return console.error(`Unable to scan directory: ${err}`)
        }

        files.forEach((file) => {
            const filePath = path.join(folderPath, file)
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    return console.error(`Unable to read file: ${err}`)
                }

                textAndVectorArray.push(embed(data))
            })
        })
    })
    return textAndVectorArray
}

processFilesFromFolder("./document_store")