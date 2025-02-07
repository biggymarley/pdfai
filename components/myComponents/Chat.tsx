"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader2 } from "lucide-react";
import rehypeHighlight from "rehype-highlight";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl } from "react-syntax-highlighter/dist/esm/styles/prism";
export function Chat() {
  const [pdfText, setPdfText] = useState<string | null>(null);
  const chatParent = useRef<HTMLUListElement>(null);

  const { messages, input, handleInputChange, isLoading, handleSubmit } =
    useChat({
      api: "/api/chat",
      body: { context: pdfText || "" },
    });

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
  });

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const { text } = await response.json();
      setPdfText(text);
    }
  }

  return (
    <main className="flex w-full min-h-screen bg-background">
      <section className="flex flex-col w-full relative">
        <header className="p-4 border-b w-full flex justify-between items-center">
          <h1 className="text-2xl font-bold">PDF Chat Assistant</h1>
          {/* {!pdfText && (
            <label className="flex items-center px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              Upload PDF
            </label>
          )} */}
        </header>

        {/* Show message if no PDF is uploaded */}
        {!pdfText ? (
          <div className="p-4 bg-slate-100 text-yellow-800 rounded-lg mt-4 text-center h-full flex items-center flex-col justify-center">
            Please upload a PDF file to start chatting with its contents.
            <label className="flex items-center px-4 py-2 bg-primary text-white rounded-lg cursor-pointer hover:bg-primary/90">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              Upload PDF
            </label>
          </div>
        ) : (
          <>
            <section className="flex-grow p-4 mb-[70px]">
              <ul
                ref={chatParent}
                className="h-full p-4 flex-grow bg-muted/50 rounded-lg overflow-y-auto flex flex-col gap-4"
              >
                {messages.map((m, index) => (
                  <div key={index}>
                    {m.role === "user" ? (
                      <li className="flex flex-row">
                        <div className="rounded-xl p-4 bg-background shadow-md flex">
                          <p className="text-primary">{m.content}</p>
                        </div>
                      </li>
                    ) : (
                      <li className="flex flex-row-reverse">
                        <div className="rounded-xl p-4 bg-slate-200 shadow-md flex min-w-3/4 md:w-auto w-full">
                          <div className="text-primary md:w-auto w-full">
                            <span className="font-bold">Answer: </span>
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              // rehypePlugins={[rehypeHighlight]}
                              // components={{ a: LinkRenderer }}

                              components={{
                                code(props) {
                                  const { children, className, node, ...rest } =
                                    props;
                                  const match = /language-(\w+)/.exec(
                                    className || ""
                                  );
                                  return match ? (
                                    <SyntaxHighlighter
                                      {...rest}
                                      PreTag="div"
                                      showLineNumbers
                                      children={String(children).replace(
                                        /\n$/,
                                        ""
                                      )}
                                      language={match[1]}
                                      style={nightOwl}
                                      className="rounded-sm"
                                    />
                                  ) : (
                                    <code {...rest} className={className}>
                                      {children}
                                    </code>
                                  );
                                },
                              }}
                              className="whitespace-pre-wrap"
                            >
                              {m.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      </li>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <li className="flex flex-row-reverse">
                    <div className="rounded-xl p-4 flex">
                      <div className="flex items-center gap-2 text-primary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    </div>
                  </li>
                )}
              </ul>
            </section>

            {/* Chat Input Field */}
            <section className="p-4 fixed w-full bottom-0 bg-background">
              <form
                onSubmit={handleSubmit}
                className="flex w-full items-center"
              >
                <Input
                  className="flex-1 min-h-[40px]"
                  placeholder="Type your question here..."
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  disabled={isLoading}
                />
                <Button className="ml-2" type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Submit"
                  )}
                </Button>
              </form>
            </section>
          </>
        )}
      </section>
    </main>
  );
}

function LinkRenderer(props: any) {
  return (
    <a
      href={props.href}
      target="_blank"
      rel="noreferrer"
      className="text-blue-500 underline cursor-pointer"
    >
      {props.children}
    </a>
  );
}
