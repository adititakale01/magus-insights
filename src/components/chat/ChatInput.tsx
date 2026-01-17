import { useState, KeyboardEvent } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
    onSend: (message: string) => void;
    isLoading?: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
    const [input, setInput] = useState('');

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            onSend(input);
            setInput('');
        }
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent -top-20 pointer-events-none" />
            <div className="relative mx-auto max-w-4xl px-4 pb-6">
                <div className="relative flex items-end gap-2 rounded-xl border border-white/20 bg-white/5 p-2 shadow-2xl backdrop-blur-xl transition-all focus-within:bg-white/10 focus-within:border-primary/50">
                    <Textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask Magus specific questions about your freight operations..."
                        className="min-h-[50px] max-h-[200px] w-full resize-none border-0 bg-transparent px-3 py-3 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/50 scrollbar-hide"
                        rows={1}
                    />
                    <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={!input.trim() || isLoading}
                        className={input.trim() ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 mb-0.5" : "bg-muted/20 text-muted-foreground mb-0.5"}
                    >
                        {isLoading ? (
                            <Sparkles className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground/50">
                    Magus can make mistakes. Verify important information.
                </div>
            </div>
        </div>
    );
}
