import { ChromaClient } from "chromadb";
import { AutoModel, pipeline, env } from "@xenova/transformers";
env.allowLocalModels = false;
env.useBrowserCache = false;

async function generateEmbeddings(text: string): Promise<number[][]> {
  try {
    const model = await pipeline(
      "feature-extraction",
      "Xenova/bge-small-en-v1.5"
    );

    const embeddingArray = await model(text);
    console.log(embeddingArray);

    let out: Array<Array<number>> = [];
    for (let i = 0; i < embeddingArray.data.length; i += 384) {
      let slice = embeddingArray.data.slice(i, i + 384);
      let slice_arr: Array<number> = [];
      slice.forEach((val, i) => {
        slice_arr.push(val as number);
      });
      out.push(slice_arr);
    }
    console.log(out);
    return out;
  } catch (error) {
    console.error("Error generating embeddings:", error);
    throw error;
  }
}

const embeddingFunction = {
  generate: async (texts: string[]): Promise<number[][]> => {
    return Promise.all(
      texts.map(async (text) => {
        // const tokenized = await tokenizeQuery(text);
        const embeddingArray = await generateEmbeddings(text);
        return embeddingArray.flat();
      })
    );
  },
};
async function queryPipeline(
  userQuery: string,
  topK: number = 5
): Promise<string[]> {
  try {
    console.log(userQuery);
    // const tokenizedQuery = await tokenizeQuery(userQuery);
    const embeddingVector = await generateEmbeddings(userQuery);
    console.log("Embedding Vector:", embeddingVector);
    console.log("Vector Length:", embeddingVector.length);

    const chromaClient = new ChromaClient({
      path: "http://localhost:8000",
    });
    const collections = await chromaClient.listCollections();
    console.log("Available collections:", collections);

    const collection = await chromaClient.getCollection({
      name: "rocketchat_docs",
      embeddingFunction: embeddingFunction,
    });
    console.log("Collection Retrieved:", collection);
    const results = await collection.query({
      // queryTexts: ["How to deploy rocket chat using kubernetes?"],
      queryEmbeddings: [...embeddingVector],
      nResults: topK,
    });

    // return results.documents.flat();
    return results.documents
      .flat()
      .filter((doc: any): doc is string => doc !== null);
  } catch (error) {
    console.error("Error in query pipeline:", error);
    throw error;
  }
}

function augmentQuery(userQuery: string, retrievedDocs: string[]): string {
  if (!retrievedDocs.length) return userQuery;

  const context = retrievedDocs.slice(0, 3).join("\n\n");
  return `Context:\n${context}\n\nUser Query:\n${userQuery}`;
}

export { queryPipeline, augmentQuery };
