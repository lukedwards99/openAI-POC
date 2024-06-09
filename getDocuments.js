import runQuery from "./common/dbconnect.cjs"
import embed from "./common/embedText.js"

export default async function getDocumentForText(input){
    // const input = "drive safe and save bluetooth"
    const embeddedInput = await embed(input, "large")

    const data = await runQuery('SELECT documentText, summary, url, docembedding <=> $1 as DOC_SCORE, summaryEmbedding <=> $1 as SUM_SCORE FROM document_table ORDER BY docembedding <=> $1 LIMIT 3;', [`[${embeddedInput.vector.toString()}]`])

    // console.log(data)

    return data
}
