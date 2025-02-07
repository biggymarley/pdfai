import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { LangChainAdapter } from "ai";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";

const TEMPLATE = `
You are a knowledgeable and friendly AI assistant. Use the following context to answer questions accurately and helpfully.

### Instructions:
- **Clarity & Structure:** Provide clear, well-structured answers using Markdown formatting.
- **Formatting:** Ensure your response includes appropriate new lines, paragraphs, headings, bullet points, and code blocks (if needed) to enhance readability in a ReactMarkdown UI.
- **Context Awareness:** If the provided context does not contain the answer, acknowledge this politely and suggest a logical next step.
- **Conversational Tone:** Maintain a friendly and conversational tone throughout your response.

---

### Context:
{context}

---

### User:
{question}

### Assistant:
`;

export async function POST(req: Request) {
    try {
        const { messages, context } = await req.json();
        const currentMessage = messages.at(-1).content;

        const prompt = PromptTemplate.fromTemplate(TEMPLATE);
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-pro",
            apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
            temperature: .5,
        });

        const chain = RunnableSequence.from([
            { context: () => context, question: (input) => input.question },
            prompt,
            model,
            new StringOutputParser(),
        ]);

        const stream = await chain.stream({ question: currentMessage });
        return LangChainAdapter.toDataStreamResponse(stream);
    } catch (error) {
        console.error(error);
        return new Response("Internal Server Error", { status: 500 });
    }
}
