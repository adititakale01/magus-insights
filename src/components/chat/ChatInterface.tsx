import { useState } from 'react';
import { Message } from './types';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { v4 as uuidv4 } from 'uuid';

export function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const handleSendMessage = (content: string) => {
        const userMessage: Message = {
            id: uuidv4(),
            role: 'user',
            content,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsLoading(true);

        // Mock response logic
        setTimeout(() => {
            let responseContent = "I'm processing your request...";
            let responseData = undefined;

            if (content.toLowerCase().includes('how many mails')) {
                responseContent = "You have exchanged 92 mails in the last hour. 8 are currently in queue and 7 have been escalated.";
            } else if (content.toLowerCase().includes('best customer')) {
                responseContent = "Based on volume and frequency, your best customer this week is **Global Imports Ltd** with 14 shipments.";
            } else if (content.toLowerCase().includes('performance') || content.toLowerCase().includes('message.txt')) {
                responseContent = "Here is an analysis of a recent interaction with TechParts Inc for an Air Freight quote.";
                // This mock data mirrors the structure in message.txt
                responseData = {
                    "trace": {
                        "steps": [
                            {
                                "title": "Load Email",
                                "summary": "Loaded email_api: Air Freight Quote - SFO to Frankfurt"
                            },
                            {
                                "title": "Extraction: OpenAI",
                                "summary": "Parsed structured request(s) via OpenAI."
                            },
                            {
                                "title": "Calculate Quote (Air)",
                                "data": {
                                    "final_amount": 2328.75,
                                    "currency": "USD"
                                }
                            }
                        ]
                    },
                    "sop": {
                        "matched_profile": {
                            "customer_name": "TechParts Inc"
                        }
                    }
                };
            } else {
                responseContent = "I can help you with system performance stats, email analysis, or customer insights. Try asking 'how many mails were exchanged?' or 'who are my best customers?'.";
            }

            const systemMessage: Message = {
                id: uuidv4(),
                role: 'system',
                content: responseContent,
                timestamp: new Date(),
                data: responseData
            };

            setMessages((prev) => [...prev, systemMessage]);
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="flex h-full flex-col">
            <MessageList messages={messages} />
            <ChatInput onSend={handleSendMessage} isLoading={isLoading} />
        </div>
    );
}
