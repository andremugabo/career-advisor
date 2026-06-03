import { useState, useEffect } from 'react';
import { Card, Button, Pagination } from '../../components';
import { advisorService } from '../../services';
import { notify } from '../../lib/toast';
import { MessageSquare, Send, Search, CheckCircle2 } from 'lucide-react';

export const AdvisorNotifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Message Form
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const fetchData = async (page: number) => {
    setIsLoading(true);
    try {
      const [notifData, studentData] = await Promise.all([
        advisorService.getNotifications(page),
        advisorService.getStudents() // For the dropdown
      ]);
      setNotifications(notifData.results || notifData || []);
      setTotalItems(notifData.count || 0);
      setStudents(studentData.results || studentData || []);
      const studentsList = studentData.results || studentData || [];
      if (studentsList.length > 0) {
        setRecipient(studentsList[0].id.toString());
      }
    } catch (error: any) {
      notify.error(error.message || 'Failed to load messages.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipient || !subject || !message) return;
    
    setIsSending(true);
    try {
      await advisorService.sendNotification({
        recipient,
        subject,
        message
      });
      notify.success('Message sent successfully!');
      setSubject('');
      setMessage('');
      fetchData(1); // Refresh the list
    } catch (error: any) {
      notify.error(error.message || 'Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await advisorService.markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id.toString() === id ? { ...n, is_read: true } : n
      ));
    } catch (error: any) {
      notify.error('Failed to mark message as read.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
          <MessageSquare className="w-8 h-8 text-[#19A7CE]" />
          Student Communications
        </h2>
        <p className="text-slate-500 mt-2">
          Send guidance messages and announcements to your assigned students.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_2fr] gap-8">
        {/* Compose Message */}
        <Card className="h-fit">
          <h3 className="text-lg font-bold font-outfit text-[#146C94] mb-4 flex items-center gap-2">
            <Send className="w-5 h-5 text-[#19A7CE]" />
            Compose Message
          </h3>
          <form onSubmit={handleSendMessage} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Recipient</label>
              <select 
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full glass-input bg-white focus:outline-none"
                required
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.full_name} ({s.reg_number})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Subject</label>
              <input 
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Action Required: Career Profile"
                className="w-full glass-input bg-white focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">Message</label>
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your guidance notes here..."
                className="w-full glass-input bg-white focus:outline-none min-h-[150px] resize-none"
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#146C94] hover:bg-[#19A7CE]"
              isLoading={isSending}
            >
              Send Message
            </Button>
          </form>
        </Card>

        {/* Message History */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold font-outfit text-[#146C94]">Message History</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Search..." className="pl-9 py-1.5 text-sm glass-input bg-white focus:outline-none w-48" />
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8 text-slate-400">Loading messages...</div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                No messages sent or received yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div key={notif.id} className={`p-4 rounded-xl border ${notif.is_read ? 'bg-white border-slate-200' : 'bg-sky-50 border-sky-200'} transition-colors`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className={`font-bold ${notif.is_read ? 'text-slate-700' : 'text-[#146C94]'}`}>{notif.subject}</h4>
                      <span className="text-xs text-slate-500">To/From: {notif.recipient_name || notif.sender_name || 'Student'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap ml-4">
                      {new Date(notif.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mb-3">{notif.message}</p>
                  
                  {!notif.is_read && (
                    <div className="flex justify-end">
                      <button 
                        onClick={() => handleMarkRead(notif.id.toString())}
                        className="text-xs font-bold text-[#19A7CE] hover:text-[#146C94] flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 size={14} /> Mark as Read
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          {!isLoading && totalItems > 0 && (
            <div className="mt-6 pt-4 border-t border-slate-100">
              <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
