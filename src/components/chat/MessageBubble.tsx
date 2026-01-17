import { Message } from './types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Bot, User } from 'lucide-react';

interface MessageBubbleProps {
    message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={cn("flex gap-4 mb-6", isUser ? "flex-row-reverse" : "flex-row")}>
            <Avatar className={cn("w-8 h-8 lg:w-10 lg:h-10 border", isUser ? "border-primary/50" : "border-cyan-400/50")}>
                {isUser ? (
                    <>
                        <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face" />
                        <AvatarFallback className="bg-primary/20 text-primary">AC</AvatarFallback>
                    </>
                ) : (
                    <AvatarFallback className="bg-cyan-500/20 text-cyan-400">
                        <Bot className="w-5 h-5" />
                    </AvatarFallback>
                )}
            </Avatar>

            <div className={cn(
                "flex flex-col max-w-[80%] lg:max-w-[60%]",
                isUser ? "items-end" : "items-start"
            )}>
                <div className={cn(
                    "rounded-2xl px-5 py-3 text-sm shadow-sm",
                    isUser
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : "bg-white/10 backdrop-blur-md border border-white/20 text-foreground rounded-tl-none"
                )}>
                    <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>
                </div>

                {message.data && (
                    <div className="mt-3 w-full overflow-hidden rounded-xl border border-white/10 bg-black/20 p-4 font-mono text-xs text-muted-foreground backdrop-blur-sm">
                        <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-2">
                            <span className="font-semibold text-cyan-400">Analysis Data</span>
                            <span className="text-[10px] uppercase opacity-50">JSON</span>
                        </div>
                        <pre className="overflow-x-auto">
                            {JSON.stringify(message.data, null, 2)}
                        </pre>
                    </div>
                )}

                <span className="mt-1 text-[10px] text-muted-foreground/60 px-1">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            </div>
        </div>
    );
}
