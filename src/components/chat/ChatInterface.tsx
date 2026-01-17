import { useState, useRef, useEffect } from 'react';
import { Message } from './types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { v4 as uuidv4 } from 'uuid';
import { useEmailCache } from '@/hooks/useEmailCache';
import { RefreshCw, Sparkles, AlertTriangle, Clock } from 'lucide-react';
import { EmailRecord } from '@/lib/api';

const SAMPLE_QUERIES = [
    "How many emails need decision?",
    "Summarize recent performance",
    "Who is the top sender?",
    "Any high value quotes?"
];

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const { data: emails, refetch, isRefetching, lastUpdated, error: cacheError } = useEmailCache();
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (content: string) => {
        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
            const modelName = import.meta.env.VITE_OPENAI_MODEL_NAME;

            if (!apiKey) {
                throw new Error("OpenAI API Key is missing. Please check your .env file.");
            }

            if (!emails || emails.length === 0) {
                // Fallback or wait? If cache is empty, maybe try to fetch?
                // But the hook should have handled it. if it's loading, we might want to say "Data loading..."
            }

            // Prepare context data - minimizing to save tokens
            const contextData = emails?.map(e => ({
                id: e.id,
                time: e.time,
                from: e.from,
                subject: e.subject,
                status: e.status,
                origin: e.origin_city,
                destination: e.destination_city,
                price: e.price,
                currency: e.currency,
                type: e.type
            })) || [];

            const systemPrompt = `
You are Magus, an AI assistant for a logistics company. You have access to the following email records data in JSON format:
${JSON.stringify(contextData).substring(0, 30000)} ... (truncated if too long)

Answer the user's question based on this data. 
If the user asks about "volume", "performance", "counts", calculate them from the data.
Refer to specific emails if relevant.
Keep answers concise and professional.
`;

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: modelName, // or gpt-4o-mini / gpt-3.5-turbo depending on availability, using standard gpt-4o or 3.5-turbo 
                    messages: [
                        { role: "system", content: systemPrompt },
                        ...messages.slice(-5).map(m => ({ role: m.role, content: m.content })), // History context
                        { role: "user", content }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || "Failed to contact OpenAI");
            }

            const data = await response.json();
            const aiContent = data.choices[0]?.message?.content || "I couldn't generate a response.";

            const systemMessage: Message = {
                id: uuidv4(),
                role: 'system',
                content: aiContent,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, systemMessage]);

        } catch (error: any) {
            const errorMessage: Message = {
                id: uuidv4(),
                role: 'system',
                content: `Error: ${error.message}`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = () => {
        refetch();
    };

    const formatLastUpdated = (ts: number) => {
        if (!ts) return 'Never';
        return new Date(ts).toLocaleTimeString();
    };

    return (
        <div className="flex h-full flex-col">
            {/* Header / Status Bar */}
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
                    {cacheError && (
                        <span className="text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Use cached/offline
                        </span>
                    )}
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={isRefetching}
                    className={`flex items-center gap-1 hover:text-white transition-colors ${isRefetching ? 'animate-spin' : ''}`}
                >
                    <RefreshCw className="w-3 h-3" />
                    Refresh
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden relative min-h-0 flex flex-col">
                <MessageList messages={messages} />

                {/* Empty State / Suggestions */}
                {messages.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                        {/* <div className="bg-white/5 p-4 rounded-full mb-4 backdrop-blur-sm">
                            <Sparkles className="w-8 h-8 text-cyan-400" />
                        </div> */}
                        {/* <h3 className="text-xl font-semibold text-white mb-2">Ask Magus</h3>
                        <p className="text-gray-400 max-w-sm mb-8">
                            I analyzed {(emails?.length || 0)} email records. How can I help you?
                        </p> */}
                        <div className="grid grid-cols-2 gap-2 max-w-lg pointer-events-auto">
                            {SAMPLE_QUERIES.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSendMessage(q)}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-sm text-left transition-colors text-gray-200"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
    );
}
