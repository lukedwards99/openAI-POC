import OpenAI from "openai"

export default async function embed(text, size){
    // console.log(`document text: "${documentText}"`)
    const openai = new OpenAI({ apiKey: " "})
    const embedding = await openai.embeddings.create({
        model: "text-embedding-3-"+size,
        input: text,
        encoding_format: "float",
    })
    // console.log(embedding.data[0].embedding);

    return { vector: embedding.data[0].embedding, text: text }
}
