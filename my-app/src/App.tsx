import React, { useState } from "react";
import { queryPipeline, augmentQuery } from "./query_pipeline.js";
import { CreateMLCEngine, ChatCompletionMessageParam } from "@mlc-ai/web-llm";
import { motion } from "framer-motion";
import { Send, Loader } from "lucide-react";

const systemPrompt = `
  You are a Rocket.Chat documentation expert.
  Answer user questions based on the following documentation.
  Be clear, precise, and provide step-by-step guidance.
  Provide code snippets with step-by-step explanation wherever possible.
  Do not tell the user to refer to the documentation; instead, provide a detailed explanation to solve their query.
  Do not repeat documentation unnecessarily.\n\n
`;

const App: React.FC = () => {
  const [userQuery, setUserQuery] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { role: string; content: string }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const processUserQuery = async (query: string) => {
    try {
      setLoading(true);
      setChatHistory((prev) => [...prev, { role: "user", content: query }]);

      const retrievedDocs = await queryPipeline(query);
      const augmentedQuery = augmentQuery(query, retrievedDocs);
      console.log("Augmented Query: ", augmentedQuery);
      const selectedModel = "TinyLlama-1.1B-Chat-v1.0-q4f16_1-MLC";
      const engine = await CreateMLCEngine(selectedModel, {});
      if (!engine) throw new Error("MLC Engine failed to initialize.");

      const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: systemPrompt },
        { role: "user", content: augmentedQuery },
      ];

      const chunks = await engine.chat.completions.create({
        messages,
        temperature: 1,
        stream: true,
      });

      let botReply = "";
      setChatHistory((prev) => [...prev, { role: "bot", content: "" }]);

      for await (const chunk of chunks) {
        botReply += chunk.choices[0]?.delta.content || "";
        setChatHistory((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1 ? { ...msg, content: botReply } : msg
          )
        );
      }
    } catch (error) {
      console.error("Error processing the user query: ", error);
      setChatHistory((prev) => [
        ...prev,
        {
          role: "bot",
          content: "An error occurred while processing your request.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex flex-col items-center h-screen bg-gray-900 text-white p-4">
      <h1 className="text-2xl font-bold mb-4">Rocket.Chat AI Assistant</h1>
      <div className="w-full max-w-2xl flex-1 overflow-y-auto p-4 bg-gray-800 rounded-xl">
        {chatHistory.map((msg, index) => (
          <motion.div
            key={index}
            className={`my-2 p-3 rounded-lg ${
              msg.role === "user"
                ? "bg-blue-500 text-white self-end"
                : "bg-gray-700 text-white"
            }`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <strong>{msg.role === "user" ? "You:" : "AI:"}</strong>{" "}
            {msg.content}
          </motion.div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-gray-400">
            <Loader className="animate-spin" size={18} /> AI is thinking...
          </div>
        )}
      </div>

      <div className="w-full max-w-2xl flex items-center bg-gray-700 p-3 rounded-xl mt-4">
        <textarea
          className="flex-1 bg-transparent p-2 focus:outline-none resize-none"
          rows={2}
          placeholder="Ask a question..."
          value={userQuery}
          onChange={(e) => setUserQuery(e.target.value)}
        />
        <button
          className="ml-2 bg-blue-600 p-2 rounded-full disabled:opacity-50"
          onClick={() => processUserQuery(userQuery)}
          disabled={loading || !userQuery.trim()}
        >
          {loading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>
    </div>
  );
};

export default App;
