import { useRef, useEffect } from 'react';
import { Message } from './types';
import { MessageBubble } from './MessageBubble';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MessageListProps {
    messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            <div className="mx-auto max-w-3xl space-y-6 pb-4">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <div className="mb-4 rounded-full bg-primary/10 p-4">
                            <span className="text-4xl">✨</span>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Ask Magus Anything</h3>
                        <p className="max-w-md text-sm text-muted-foreground mt-2">
                            Get insights about your freight operations, analyze customer interactions, or check system performance in real-time.
                        </p>
                    </div>
                ) : (
                    messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                    ))
                )}
                <div ref={scrollRef} />
            </div>
        </div>
    );
}
