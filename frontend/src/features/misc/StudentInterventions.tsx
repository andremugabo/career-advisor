import { useState, useEffect } from 'react';
import { Card } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { ClipboardCheck, AlertCircle, BookOpen, UserCheck } from 'lucide-react';

const getTypeColor = (type: string) => {
  if (type.includes('Approved') || type.includes('approved')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (type.includes('Warning') || type.includes('warning')) return 'bg-amber-100 text-amber-700 border-amber-200';
  if (type.includes('Training') || type.includes('Recommended')) return 'bg-sky-100 text-sky-700 border-sky-200';
  if (type.includes('Updated') || type.includes('Track')) return 'bg-violet-100 text-violet-700 border-violet-200';
  return 'bg-slate-100 text-slate-600 border-slate-200';
};

const getTypeIcon = (type: string) => {
  if (type.includes('Approved') || type.includes('approved')) return <ClipboardCheck size={16} className="text-emerald-500" />;
  if (type.includes('Warning')) return <AlertCircle size={16} className="text-amber-500" />;
  if (type.includes('Training') || type.includes('Recommended')) return <BookOpen size={16} className="text-sky-500" />;
  return <UserCheck size={16} className="text-violet-500" />;
};

export const StudentInterventions = () => {
  const [interventions, setInterventions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterventions();
  }, []);

  const fetchInterventions = async () => {
    setIsLoading(true);
    try {
      const data = await studentService.getMyInterventions();
      setInterventions(data || []);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load advisor notes.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
          <ClipboardCheck className="w-8 h-8 text-[#19A7CE]" />
          Advisor Notes & Interventions
        </h2>
        <p className="text-slate-500 mt-2">
          Guidance, approvals, and notes from your academic advisor.
        </p>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-400 animate-pulse">
            <ClipboardCheck size={40} className="mx-auto mb-3 animate-bounce text-[#19A7CE]" />
            Loading advisor notes...
          </div>
        ) : interventions.length === 0 ? (
          <Card>
            <div className="text-center py-16 text-slate-400">
              <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-semibold text-slate-500">No advisor notes yet</p>
              <p className="text-sm mt-1">Your advisor hasn't logged any interventions or approvals for your profile yet.</p>
            </div>
          </Card>
        ) : (
          interventions.map((item) => (
            <Card
              key={item.id}
              className="border-slate-200 hover:border-[#19A7CE]/30 transition-all"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-8 h-8 rounded-full bg-[#19A7CE]/10 flex items-center justify-center shrink-0">
                    {getTypeIcon(item.intervention_type)}
                  </div>
                  <div>
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-bold rounded-full border mb-1.5 ${getTypeColor(item.intervention_type)}`}>
                      {item.intervention_type}
                    </span>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                      {item.notes}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap ml-4 font-mono shrink-0">
                  {new Date(item.created_at).toLocaleString()}
                </span>
              </div>
              <div className="pl-11">
                <p className="text-[10px] text-slate-400">
                  By: {item.advisor_email}
                </p>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
