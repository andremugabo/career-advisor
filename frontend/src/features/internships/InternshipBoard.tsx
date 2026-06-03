import { useState, useEffect } from 'react';
import { Card, Button, Pagination } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Briefcase, MapPin, Building2, Search, ArrowUpRight, AlertCircle } from 'lucide-react';
import { Internship } from '../../types';

export const InternshipBoard = () => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [isApplying, setIsApplying] = useState<string | null>(null);

  useEffect(() => {
    fetchInternships(currentPage);
  }, [currentPage]);

  const fetchInternships = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const response = await studentService.getInternships(page);
      setInternships(response.results || response || []);
      setTotalItems(response.count || 0);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load internship opportunities.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredInternships = internships.filter((internship) => {
    const title = internship.title?.toLowerCase() ?? '';
    const company = internship.company?.toLowerCase() ?? '';
    const location = internship.location?.toLowerCase() ?? '';
    const type = internship.type?.toLowerCase() ?? '';
    const term = searchTerm.toLowerCase();
    
    const matchesSearch = title.includes(term) || company.includes(term);
    const matchesLocation = locationFilter === 'All' || location === locationFilter.toLowerCase();
    const matchesType = typeFilter === 'All' || type === typeFilter.toLowerCase();
    
    return matchesSearch && matchesLocation && matchesType;
  });

  const handleApply = async (internshipId: string, company: string) => {
    setIsApplying(internshipId);
    try {
      await studentService.applyForInternship(internshipId);
      notify.success(`Successfully applied to ${company}!`);
    } catch (error: any) {
      notify.error(error.message || `Failed to apply to ${company}.`);
    } finally {
      setIsApplying(null);
    }
  };

  // Extract unique locations and types for filters
  const distinctLocations = Array.from(new Set(internships.map(i => i.location))).filter(Boolean);
  const distinctTypes = Array.from(new Set(internships.map(i => i.type))).filter(Boolean);

  return (
    <div className="space-y-8 animate-fade-in pb-12 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#146C94] font-outfit">Internship Board</h2>
          <p className="text-slate-500 text-sm mt-1">
            Discover and apply for industry opportunities that match your academic profile.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          <select 
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="glass-input bg-white focus:outline-none text-sm py-2 px-3"
          >
            <option value="All">All Locations</option>
            {distinctLocations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
          </select>
          
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="glass-input bg-white focus:outline-none text-sm py-2 px-3"
          >
            <option value="All">All Durations/Types</option>
            {distinctTypes.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search roles or companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full glass-input bg-white focus:outline-none py-2"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4 text-[#19A7CE] animate-pulse">
          <Briefcase size={48} className="animate-bounce" />
          <span className="text-xl font-bold font-outfit">Finding opportunities...</span>
        </div>
      ) : filteredInternships.length === 0 ? (
        <Card className="border border-dashed border-slate-300 bg-transparent shadow-none p-12 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-slate-400 mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No Internships Found</h3>
          <p className="text-slate-500 mt-2 max-w-md">
            There are currently no active internship postings that match your search criteria. Please check back later.
          </p>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInternships.map((job) => (
            <Card key={job.id} className="flex flex-col border-slate-200 shadow-sm hover:shadow-md transition-shadow group h-full">
              <div className="flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-[#19A7CE]/10 rounded-xl text-[#146C94]">
                    <Building2 size={24} />
                  </div>
                  {job.match_percentage && job.match_percentage > 75 && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      High Match
                    </span>
                  )}
                </div>
                
                <h3 className="text-xl font-bold text-[#146C94] font-outfit mb-1 group-hover:text-[#19A7CE] transition-colors line-clamp-1">
                  {job.title}
                </h3>
                <h4 className="text-sm font-semibold text-slate-600 mb-4">{job.company}</h4>
                
                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <MapPin size={14} className="text-slate-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                    <Briefcase size={14} className="text-slate-400" />
                    {job.type}
                  </div>
                </div>

                <p className="text-sm text-slate-600 line-clamp-3 mb-6">
                  {job.description}
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${job.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {job.is_active ? 'Active' : 'Closed'}
                </span>
                <div className="flex gap-2">
                  <Button 
                    variant="secondary"
                    className="py-1.5 px-3 text-xs h-auto"
                  >
                    View
                  </Button>
                  <Button 
                    disabled={!job.is_active || isApplying === job.id}
                    isLoading={isApplying === job.id}
                    onClick={() => handleApply(job.id, job.company)}
                    className="bg-[#146C94] hover:bg-[#19A7CE] text-white shadow-sm py-1.5 px-4 text-xs h-auto flex items-center gap-1"
                  >
                    Apply Now <ArrowUpRight size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};
