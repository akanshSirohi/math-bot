"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PlusIcon,
  MinusIcon,
  DivideIcon,
  PlusSquareIcon,
  SendIcon,
  Calculator,
  Text
} from "lucide-react";
import "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import "mathlive";

const initialMessage = {
  role: "system",
  content:
    "Hello! I'm MathBot. How can I help you with your calculations today? I can handle LaTeX expressions like $E=mc^2$ or $\\frac{d}{dx}\\sin x = \\cos x$."
};

export default function MathBot({model, contextLength}) {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState("");
  const [isLatex, setIsLatex] = useState(true); // new state to toggle input mode

  const newMessage = (msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const handleSend = async () => {
    if (input.length > 0 && input !== "$" && input !== "$$") {
      // Build user message and update state
      const userMsg = { role: "user", content: input };
      newMessage(userMsg);
      setInput("");

      // Prepare a snapshot of the message history including the new message
      let historyToSend = [...messages, userMsg];
      historyToSend = historyToSend.filter((msg) => msg.role !== "system");
      historyToSend = historyToSend.map(({ role, content }) => ({ role, content }));

      if (historyToSend.length > contextLength) {
        historyToSend = historyToSend.slice(-contextLength);
      }
      
      // Create a pending model message for streaming response
      const pending = { role: "assistant", rawContent: "", content: "Thinking..." };
      setMessages((prev) => [...prev, pending]);

      const response = await fetch("/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: model,
          messages: historyToSend,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let thinkingActive = true;

      // Read stream chunks and update the pending message content
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        pending.rawContent += chunk;
        
        if (thinkingActive) {
          if (pending.rawContent.includes("</think>")) {
            thinkingActive = false;
            pending.content = pending.rawContent.replace(/<think>[\s\S]*?<\/think>/, "");
          } else {
            pending.content = "Thinking...";
          }
        } else {
          pending.content = pending.rawContent.replace(/<think>[\s\S]*?<\/think>/, "");
        }
        // Update state by replacing the last message with the updated pending message
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = pending;
          return updated;
        });
      }
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-lg h-full max-h-lg rounded-lg bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-700 p-4">
          <h2 className="text-xl font-bold text-white">MathBot Calculator</h2>
          <div className="flex space-x-2">
            <PlusIcon className="h-5 w-5 text-green-400" />
            <MinusIcon className="h-5 w-5 text-red-400" />
            <DivideIcon className="h-5 w-5 text-yellow-400" />
            <PlusSquareIcon className="h-5 w-5 text-blue-400" />
          </div>
        </div>
        <ScrollArea className="h-[80%] p-4">
          {messages.map(
            (message, index) => (
                <div
                  key={index}
                  className={`mb-4 flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-lg px-4 py-2 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-100"
                    }`}
                  >
                    <Latex>
                      {message.content}
                    </Latex>
                  </div>
                </div>
              )
          )}
        </ScrollArea>
        <div className="border-t border-gray-700 p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center justify-between"
          >
            {/* Toggle button to switch input mode */}
            <Button
              type="button"
              onClick={() => setIsLatex((prev) => !prev)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded h-11 w-12"
            >
              {isLatex ? (
                <Text />
              ) : (
                <Calculator />
              )}
            </Button>
            {/* Conditional rendering of input field */}
            {isLatex ? (
              <math-field
                onInput={(evt) => setInput(`$${evt.target.value}$`)}
                onKeyDown={(evt) => { 
                  if (evt.key === "Enter") { 
                    evt.preventDefault(); 
                    handleSend(); 
                  } 
                }}
                style={{ maxWidth: "85%", width: "85%" }}
              >
                {input}
              </math-field>
            ) : (
              <input
                type="text"
                value={input}
                onChange={(evt) => setInput(evt.target.value)}
                onKeyDown={(evt) => {
                  if (evt.key === "Enter") {
                    evt.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="Enter your message..."
                style={{ maxWidth: "85%", width: "85%", padding: "0.5rem", borderRadius: "0.375rem" }}
                className="bg-gray-800 text-white border border-gray-700"
              />
            )}
            <Button
              type="submit"
              size="icon"
              className="bg-green-500 hover:bg-green-600 h-11 w-12 disabled:bg-gray-500"
              disabled={input.length === 0 || input === "$" || input === "$$"}
            >
              <SendIcon className="w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
