import { useState, useEffect } from 'react';
import {
  ClipboardList, Search, Filter, Calendar,
  User, FileText, ChevronDown, ChevronUp, RefreshCw
} from 'lucide-react';
import { advisorService } from '../../services';
import { Card, Pagination } from '../../components';
import { notify } from '../../lib/toast';

interface Intervention {
  id: string;
  advisor_email: string;
  student: string;
  student_name: string;
  intervention_type: string;
  notes: string;
  created_at: string;
}

const INTERVENTION_TYPES = [
  'All',
  'Skill Bridging',
  'GPA Improvement',
  'Career Counseling',
  'Academic Guidance',
  'Academic Counseling',
  'Skills Training Recommended',
  'Career Track Updated',
  'Email Warning Sent',
];

export const InterventionsHistory = () => {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchInterventions();
  }, [currentPage]);

  const fetchInterventions = async () => {
    setIsLoading(true);
    try {
      const response = await advisorService.getInterventions();
      const list = response.results || response || [];
      setInterventions(list);
      setTotalItems(response.count || list.length || 0);
    } catch (err: any) {
      notify.error('Failed to load interventions.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInterventions = interventions.filter((item) => {
    const matchesSearch =
      item.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.advisor_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All' || item.intervention_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const typeColor: Record<string, string> = {
    'Skill Bridging': 'bg-violet-100 text-violet-700',
    'GPA Improvement': 'bg-emerald-100 text-emerald-700',
    'Career Counseling': 'bg-sky-100 text-sky-700',
    'Academic Guidance': 'bg-amber-100 text-amber-700',
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
            <ClipboardList className="w-8 h-8 text-[#19A7CE]" />
            Interventions History
          </h2>
          <p className="text-slate-500 mt-2">
            Browse and filter all student intervention records.
          </p>
        </div>
        <button
          onClick={() => fetchInterventions()}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-slate-200 rounded-xl bg-white hover:border-[#19A7CE] hover:text-[#19A7CE] transition-all"
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, advisor, or notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full glass-input bg-white focus:outline-none"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="pl-9 pr-4 glass-input bg-white appearance-none cursor-pointer focus:outline-none min-w-[200px]"
          >
            {INTERVENTION_TYPES.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {INTERVENTION_TYPES.filter(t => t !== 'All').map((type) => {
          const count = interventions.filter(i => i.intervention_type === type).length;
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? 'All' : type)}
              className={`p-4 rounded-xl border transition-all duration-300 text-left ${
                typeFilter === type
                  ? 'border-[#19A7CE] bg-[#19A7CE]/5 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <p className="text-2xl font-bold font-outfit text-[#146C94]">{count}</p>
              <p className="text-xs text-slate-500 mt-1 font-medium">{type}</p>
            </button>
          );
        })}
      </div>

      {/* Interventions List */}
      {isLoading ? (
        <div className="text-center py-20 text-[#19A7CE] animate-pulse">
          <ClipboardList size={40} className="mx-auto mb-4" />
          <p className="font-bold">Loading interventions...</p>
        </div>
      ) : filteredInterventions.length === 0 ? (
        <Card className="text-center py-20 border-dashed shadow-none">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No Interventions Found</h3>
          <p className="text-slate-500 mt-2">
            {searchTerm || typeFilter !== 'All'
              ? 'Try adjusting your filters.'
              : 'No interventions have been recorded yet.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredInterventions.map((item) => {
            const isExpanded = expandedId === item.id;
            return (
              <Card
                key={item.id}
                className={`transition-all duration-300 cursor-pointer hover:shadow-md ${
                  isExpanded ? 'ring-2 ring-[#19A7CE]/30' : ''
                }`}
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="bg-[#19A7CE]/10 p-2.5 rounded-xl shrink-0">
                    <User className="w-5 h-5 text-[#19A7CE]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-bold text-[#146C94] font-outfit">
                        {item.student_name}
                      </h4>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${typeColor[item.intervention_type] || 'bg-slate-100 text-slate-600'}`}>
                        {item.intervention_type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                      <span className="text-slate-300">•</span>
                      by {item.advisor_email}
                    </p>
                  </div>
                  <div className="shrink-0 text-slate-400">
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 animate-fade-in">
                    <div className="flex items-start gap-2">
                      <FileText className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                      <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                        {item.notes || 'No notes recorded.'}
                      </p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalItems > 10 && (
        <div className="mt-8">
          <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  );
};
