import { useState, useEffect } from 'react';
import { Card, Pagination } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Mail, CheckCircle2, MailOpen } from 'lucide-react';

export const StudentMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchMessages(currentPage);
  }, [currentPage]);

  const fetchMessages = async (page: number) => {
    setIsLoading(true);
    try {
      const data = await studentService.getNotifications(page);
      setMessages(data.results || data || []);
      setTotalItems(data.count || 0);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load messages.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await studentService.markNotificationRead(id);
      setMessages(messages.map(m =>
        m.id.toString() === id ? { ...m, is_read: true, read_at: new Date().toISOString() } : m
      ));
      notify.success('Message marked as read.');
    } catch (error: any) {
      notify.error('Failed to mark message as read.');
    }
  };

  const unreadCount = messages.filter(m => !m.is_read).length;

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
          <Mail className="w-8 h-8 text-[#19A7CE]" />
          Advisor Messages
        </h2>
        <p className="text-slate-500 mt-2">
          Messages and guidance from your academic advisor.
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-600">
              {unreadCount} unread
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 animate-pulse">
            <Mail size={40} className="mx-auto mb-3 animate-bounce text-[#19A7CE]" />
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <Card>
            <div className="text-center py-16 text-slate-400">
              <MailOpen size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold text-slate-500">No messages yet</p>
              <p className="text-sm mt-1">Your advisor hasn't sent any messages yet.</p>
            </div>
          </Card>
        ) : (
          messages.map((msg) => (
            <Card
              key={msg.id}
              className={`transition-all ${
                msg.is_read
                  ? 'border-slate-200 bg-white'
                  : 'border-[#19A7CE]/30 bg-sky-50/50 shadow-md'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.is_read ? 'bg-slate-100' : 'bg-[#19A7CE]/10'
                  }`}>
                    <Mail size={16} className={msg.is_read ? 'text-slate-400' : 'text-[#19A7CE]'} />
                  </div>
                  <div>
                    <h4 className={`font-bold text-base ${msg.is_read ? 'text-slate-700' : 'text-[#146C94]'}`}>
                      {msg.subject}
                    </h4>
                    <span className="text-xs text-slate-500">
                      From: {msg.sender_email || 'Advisor'}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-4 font-mono">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
              </div>

              <div className="pl-11">
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{msg.body}</p>

                {!msg.is_read && (
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={() => handleMarkRead(msg.id.toString())}
                      className="text-xs font-bold text-[#19A7CE] hover:text-[#146C94] flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 size={14} /> Mark as Read
                    </button>
                  </div>
                )}

                {msg.is_read && msg.read_at && (
                  <p className="text-[10px] text-slate-400 mt-2 text-right">
                    Read on {new Date(msg.read_at).toLocaleString()}
                  </p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {!isLoading && totalItems > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-100">
          <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
};
