import OpenAI from "openai"
import { promises as fs } from "fs"
import path from "path"
import runQuery from "./common/dbconnect.cjs"
import embed from "./common/embedText.js"

const openai = new OpenAI({ apiKey: " "})

function exitAfterTimeout(timeout) {
  setTimeout(() => {
    console.log(`Script is still running after ${timeout} seconds. Exiting now.`)
    process.exit(1) // Exits the process with a failure code
  }, timeout * 1000) // Convert seconds to milliseconds
}

async function processFilesFromFolder(folderPath) {
  const textAndVectorArray = []
  try {
    const files = await fs.readdir(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);
      try {
        const data = await fs.readFile(filePath, 'utf8')

        const url = data.split("\n")[0].trim()
        let document = data.substring(data.indexOf("\n") + 1)

        textAndVectorArray.push({
          url: url,
          document: document
        })
      } catch (err) {
        console.error(`Unable to read file: ${err}`)
        process.exit(1)
      }
    }
  } catch (err) {
    console.error(`Unable to scan directory: ${err}`)
  }
  return textAndVectorArray
}

async function getTextSummary(text) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "user",
        content: [
          { 
            type: "text", 
            text: `You are a helpful chat bot who pulls key words and phrases out of documents.
                        Please to not respond with anything except the key words. 
                        Do not include the key phrases: "state farm" or "statefarm.com"
                        So don't say something like "sure here are some key words" and don't start your reply with anything like "Key Words: ".


                        Here is the Document to find key words in:

                        ${text}
                        `
          },
        ],
      },
    ],
  });
  //console.log(response.choices[0]);
  return response
}

async function addToDB(data){

  for(let i = 0; i < data.length; i++){
    console.log("adding to db: " + i)
    const row = data[i]
    // console.log(row)
    const sql = `INSERT INTO document_table (documenttext, docembedding, summary, summaryembedding, url) VALUES ($1, $2, $3, $4, $5)`
    // console.log(`'[${row.summaryEmbed.toString()}]'`)

    const result = await runQuery(sql, [row.document, `[${row.documentEmbed.toString()}]`, row.summary, `[${row.summaryEmbed.toString()}]`, row.url]);
    if (result === false){
      console.error(`ERROR couldn't insert doc: ${data[i]}`)
    }
  }

}

async function main() {
  console.log(`Script started at time ${new Date()}`);

  const processedFiles = await processFilesFromFolder("./document_store")
  const embeddedData =  []
  for (let i = 0; i < processedFiles.length; i++){
    console.error("processing file: " + i)
    const document = processedFiles[i].document
    const documentEmbed = await embed(document, "large")
    // console.log("embedded document")
    const summaryObject = await getTextSummary(document)
    const summary = summaryObject.choices[0].message.content
    // console.log(summary)
    // console.log("got summary")
    const summaryEmbed = await embed(summary, "large")
    // console.log("embedded summary")

    embeddedData.push({
      document: document,
      documentEmbed: documentEmbed.vector,
      summary: summary,
      summaryEmbed: summaryEmbed.vector,
      url: processedFiles[i].url
    })
    // console.log(embeddedData[embeddedData.length - 1])
  }
  // console.log(embeddedData)

  await addToDB(embeddedData)

  console.log(`Script ended at time ${new Date()}`);
  process.exit(0)
}

// exitAfterTimeout(10)
main()
