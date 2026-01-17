export interface Message {
    id: string;
    role: 'user' | 'system';
    content: string;
    timestamp: Date;
    data?: any; // For structured data like the message.txt content
}
