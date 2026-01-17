import { useEffect, useState } from 'react';
import { Filter, CheckCircle2, AlertCircle, Clock, Mail } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { EmailDetail } from './EmailDetail';
import { loadEmails, Email } from '@/lib/dataLoader';

type FilterType = 'all' | 'processed' | 'needs_review' | 'escalated';

export function Inbox() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');

  useEffect(() => {
    loadEmailsData();
  }, []);

  async function loadEmailsData() {
    const data = await loadEmails();
    setEmails(data);
    if (data.length > 0 && !selectedEmail) {
      setSelectedEmail(data[0]);
    }
  }

  const filteredEmails = emails.filter(email => {
    if (filter === 'all') return true;
    return email.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'processed':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Processed</span>
          </div>
        );
      case 'needs_review':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/50">
            <Clock className="w-3 h-3 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-medium">Needs Review</span>
          </div>
        );
      case 'escalated':
        return (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-500/20 border border-red-500/50">
            <AlertCircle className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400 font-medium">Escalated</span>
          </div>
        );
    }
  };

  const getFilterCount = (filterType: FilterType) => {
    if (filterType === 'all') return emails.length;
    return emails.filter(e => e.status === filterType).length;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Inbox</h2>
          <p className="text-gray-400">AI-powered email automation</p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-3">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-4 text-gray-400">
                <Filter className="w-4 h-4" />
                <span className="text-sm font-medium">Filters</span>
              </div>
              <div className="space-y-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${filter === 'all'
                    ? 'bg-white/20 text-white border border-cyan-400/50'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <span className="text-sm">All Emails</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-xs">
                    {getFilterCount('all')}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('processed')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${filter === 'processed'
                    ? 'bg-white/20 text-white border border-cyan-400/50'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <span className="text-sm">Processed</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                    {getFilterCount('processed')}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('needs_review')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${filter === 'needs_review'
                    ? 'bg-white/20 text-white border border-cyan-400/50'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <span className="text-sm">Needs Review</span>
                  <span className="px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 text-xs">
                    {getFilterCount('needs_review')}
                  </span>
                </button>
                <button
                  onClick={() => setFilter('escalated')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all ${filter === 'escalated'
                    ? 'bg-white/20 text-white border border-cyan-400/50'
                    : 'text-gray-400 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <span className="text-sm">Escalated</span>
                  <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs">
                    {getFilterCount('escalated')}
                  </span>
                </button>
              </div>
            </GlassCard>
          </div>

          <div className="col-span-4">
            <div className="space-y-3">
              {filteredEmails.map((email) => (
                <GlassCard
                  key={email.id}
                  className={`p-4 cursor-pointer transition-all ${selectedEmail?.id === email.id
                    ? 'border-cyan-400/50 bg-white/15'
                    : ''
                    }`}
                  onClick={() => setSelectedEmail(email)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-white mb-1">
                        {email.sender_name}
                      </div>
                      <div className="text-sm text-gray-400 mb-2">
                        {email.subject}
                      </div>
                    </div>
                    {getStatusBadge(email.status)}
                  </div>
                  <div className="text-sm text-gray-500 line-clamp-2 mb-2">
                    {email.preview}
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatTime(email.timestamp)}</span>
                    <span>{email.from}</span>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="col-span-5">
            {selectedEmail ? (
              <EmailDetail email={selectedEmail} />
            ) : (
              <GlassCard className="p-8 flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select an email to view details</p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

