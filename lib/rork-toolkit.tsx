import { useState, useCallback } from "react";
import { z } from "zod";

export interface ToolDefinition<T extends z.ZodTypeAny = z.ZodTypeAny> {
  description: string;
  zodSchema: T;
  execute: (input: z.infer<T>) => Promise<string> | string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  parts: Array<
    | { type: "text"; text: string }
    | {
        type: "tool";
        toolName: string;
        state: "input-streaming" | "input-available" | "output-available" | "output-error";
        errorText?: string;
      }
  >;
}

export function createRorkTool<T extends z.ZodTypeAny>(
  tool: ToolDefinition<T>
): ToolDefinition<T> {
  return tool;
}

export function useRorkAgent({
  tools,
}: {
  tools: Record<string, ToolDefinition>;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(
    async (userMessage: string) => {
      const userMsgId = Date.now().toString();
      const userMessageObj: Message = {
        id: userMsgId,
        role: "user",
        parts: [{ type: "text", text: userMessage }],
      };

      setMessages((prev) => [...prev, userMessageObj]);
      setIsLoading(true);

      try {
        // Simple keyword-based tool detection
        const lowerMessage = userMessage.toLowerCase();
        let toolToCall: string | null = null;
        let toolInput: any = {};

        // Detect addTask tool
        if (
          lowerMessage.includes("add task") ||
          lowerMessage.includes("create task") ||
          lowerMessage.includes("new task") ||
          lowerMessage.includes("add a task") ||
          lowerMessage.includes("create a task") ||
          lowerMessage.startsWith("add ") ||
          lowerMessage.startsWith("create ")
        ) {
          toolToCall = "addTask";
          
          // Extract title - look for patterns like "add task: Title" or "create task Title"
          let titleMatch = userMessage.match(/(?:add|create|new)\s+(?:a\s+)?task[:\s]+(.+?)(?:\s+with|\s+priority|\s+high|\s+low|$)/i);
          if (!titleMatch) {
            // Try pattern without "task" keyword
            titleMatch = userMessage.match(/(?:add|create|new)\s+(.+?)(?:\s+with|\s+priority|\s+high|\s+low|$)/i);
          }
          if (!titleMatch) {
            // Fallback: remove common prefixes and use the rest
            const cleaned = userMessage
              .replace(/(?:please\s+)?(?:add|create|new)\s+(?:a\s+)?task[:\s]*/i, "")
              .replace(/\s+with\s+.+$/i, "")
              .replace(/\s+priority\s+.+$/i, "")
              .trim();
            toolInput.title = cleaned || "New Task";
          } else {
            toolInput.title = titleMatch[1].trim();
          }
          
          // Extract priority
          if (lowerMessage.includes("high priority") || lowerMessage.includes("priority high")) {
            toolInput.priority = "high";
          } else if (lowerMessage.includes("low priority") || lowerMessage.includes("priority low")) {
            toolInput.priority = "low";
          } else if (lowerMessage.includes("medium priority") || lowerMessage.includes("priority medium")) {
            toolInput.priority = "medium";
          }
          
          // Extract description if present (after "with" or "description")
          const descMatch = userMessage.match(/(?:with|description)[:\s]+(.+?)(?:\s+priority|$)/i);
          if (descMatch) {
            toolInput.description = descMatch[1].trim();
          }
        } else if (
          lowerMessage.includes("analyze") ||
          lowerMessage.includes("analysis") ||
          lowerMessage.includes("stats") ||
          lowerMessage.includes("statistics") ||
          lowerMessage.includes("productivity") ||
          lowerMessage.includes("how many tasks") ||
          lowerMessage.includes("task progress")
        ) {
          toolToCall = "analyzeTasks";
        }

        const assistantMsgId = (Date.now() + 1).toString();
        let assistantMessage: Message = {
          id: assistantMsgId,
          role: "assistant",
          parts: [],
        };

        if (toolToCall && tools[toolToCall]) {
          const tool = tools[toolToCall];

          // Show tool calling state
          const toolCallMessage: Message = {
            id: assistantMsgId,
            role: "assistant",
            parts: [
              {
                type: "tool",
                toolName: toolToCall,
                state: "input-available",
              },
            ],
          };
          setMessages((prev) => [...prev, toolCallMessage]);

          try {
            // Validate input with zod schema
            const validatedInput = tool.zodSchema.parse(toolInput);
            
            // Execute tool
            const result = await tool.execute(validatedInput);

            // Update with success state
            const successMessage: Message = {
              id: assistantMsgId,
              role: "assistant",
              parts: [
                {
                  type: "tool",
                  toolName: toolToCall,
                  state: "output-available",
                },
                {
                  type: "text",
                  text: result || `${toolToCall} completed successfully.`,
                },
              ],
            };

            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantMsgId ? successMessage : msg))
            );
          } catch (error: any) {
            // Tool execution error
            const errorMessage: Message = {
              id: assistantMsgId,
              role: "assistant",
              parts: [
                {
                  type: "tool",
                  toolName: toolToCall,
                  state: "output-error",
                  errorText: error?.message || "Unknown error occurred",
                },
                {
                  type: "text",
                  text: `Error: ${error?.message || "Unknown error occurred"}`,
                },
              ],
            };

            setMessages((prev) =>
              prev.map((msg) => (msg.id === assistantMsgId ? errorMessage : msg))
            );
          }
        } else {
          // No tool matched - provide a simple text response
          assistantMessage.parts = [
            {
              type: "text",
              text: "I can help you add tasks or analyze your productivity. Try saying 'add task [title]' or 'analyze tasks'.",
            },
          ];
          setMessages((prev) => [...prev, assistantMessage]);
        }
      } catch (error: any) {
        const errorMsg: Message = {
          id: (Date.now() + 2).toString(),
          role: "assistant",
          parts: [
            {
              type: "text",
              text: `Sorry, I encountered an error: ${error?.message || "Unknown error"}`,
            },
          ],
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsLoading(false);
      }
    },
    [tools]
  );

  return {
    messages,
    sendMessage,
    isLoading,
  };
}

