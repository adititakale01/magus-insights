import { useState } from 'react';
import { Mail, FileSpreadsheet, Globe, Clock, TrendingUp, Edit, Send, ArrowRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { Email } from '../lib/dataLoader';

interface EmailDetailProps {
  email: Email;
}

export function EmailDetail({ email }: EmailDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState(email.draft_response);

  const formatResponseTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getDataSourceIcon = (type: string) => {
    switch (type) {
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case 'api':
        return <Globe className="w-4 h-4 text-blue-400" />;
      case 'database':
        return <FileSpreadsheet className="w-4 h-4 text-purple-400" />;
      default:
        return <FileSpreadsheet className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      <GlassCard className="p-5">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-white/10">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
            <Mail className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm text-gray-400">Automatic Trigger at {new Date(email.timestamp).toLocaleTimeString()}</div>
            <div className="font-semibold text-white">Email from {email.sender_name}</div>
          </div>
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
        </div>

        <div className="text-sm text-white whitespace-pre-line">
          {email.subject}
        </div>
        <div className="mt-2 text-sm text-gray-400 whitespace-pre-line">
          {email.body}
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-semibold text-white">Magus Agent</div>
            <div className="text-xs text-gray-400">AI Processing Complete</div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="text-sm text-gray-400 mb-2">Checked rates from:</div>
            <div className="space-y-2">
              {email.data_sources.map((source, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  {getDataSourceIcon(source.type)}
                  <span className="text-sm text-white">{source.name}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3">
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">AI Confidence</div>
              <div className="text-lg font-bold text-cyan-400">{email.confidence_score}%</div>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-xs text-gray-400 mb-1">Processing Time</div>
              <div className="text-lg font-bold text-cyan-400">{formatResponseTime(email.response_time)}</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold text-white">Draft ready.</span>
          </div>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm transition-all"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          )}
        </div>

        <div className="p-4 rounded-lg bg-white/5 border border-white/10 mb-4">
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white font-medium">To: {email.sender_name}</span>
          </div>
          {isEditing ? (
            <textarea
              value={draftText}
              onChange={(e) => setDraftText(e.target.value)}
              className="w-full bg-transparent text-white text-sm outline-none resize-none"
              rows={8}
            />
          ) : (
            <div className="text-sm text-gray-300 whitespace-pre-line">
              {draftText}
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium transition-all shadow-lg shadow-cyan-500/30"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        ) : (
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-medium transition-all shadow-lg shadow-cyan-500/30">
            <Send className="w-4 h-4" />
            Send Draft
          </button>
        )}
      </GlassCard>

      <GlassCard className="p-5">
        <div className="text-sm text-gray-400 mb-3">Interaction Timeline</div>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
                <Mail className="w-4 h-4 text-blue-400" />
              </div>
              <div className="w-0.5 h-full bg-gradient-to-b from-blue-500 to-purple-500" />
            </div>
            <div className="flex-1 pb-4">
              <div className="text-sm text-white font-medium">Trigger Received</div>
              <div className="text-xs text-gray-500">{new Date(email.timestamp).toLocaleString()}</div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4 text-purple-400" />
              </div>
              <div className="w-0.5 h-full bg-gradient-to-b from-purple-500 to-emerald-500" />
            </div>
            <div className="flex-1 pb-4">
              <div className="text-sm text-white font-medium">Data Sources Checked</div>
              <div className="text-xs text-gray-500">{email.data_sources.length} sources analyzed</div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center">
                <Edit className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="w-0.5 h-full bg-gradient-to-b from-emerald-500 to-cyan-500" />
            </div>
            <div className="flex-1 pb-4">
              <div className="text-sm text-white font-medium">Draft Created</div>
              <div className="text-xs text-gray-500">Confidence: {email.confidence_score}%</div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                <Clock className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <div className="flex-1">
              <div className="text-sm text-white font-medium">
                {email.status === 'processed' ? 'Sent' : 'Pending Review'}
              </div>
              <div className="text-xs text-gray-500">Awaiting action</div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4">
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="What would you like to do..."
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-gray-500"
          />
          <button className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 flex items-center justify-center transition-all shadow-lg shadow-cyan-500/30">
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </GlassCard>
    </div>
  );
}
