import { ChatInterface } from '@/components/chat/ChatInterface';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { Sparkles } from 'lucide-react';

export default function AskMagus() {
    return (
        <div className="h-[calc(100vh-80px)] p-6 pt-4">
            <div className="mx-auto h-full max-w-7xl">
                <div className="mb-4 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                        <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-xl font-semibold text-foreground">Ask Magus</h1>
                        <p className="text-xs text-muted-foreground">AI-powered operational insights</p>
                    </div>
                </div>

                <GlassCard className="h-[calc(100%-60px)] overflow-hidden !p-0 !bg-black/20">
                    {/* Decorative background elements inside the chat container */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
                        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px]" />
                    </div>

                    <div className="relative h-full z-10">
                        <ChatInterface />
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
