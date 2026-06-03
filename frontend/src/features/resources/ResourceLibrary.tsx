import { useState, useEffect } from 'react';
import { Card, Button, Pagination } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { BookOpen, ExternalLink, Library, Search } from 'lucide-react';

export const ResourceLibrary = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResources(currentPage);
  }, [currentPage]);

  const fetchResources = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await studentService.getResources(page);
      setResources(response.results || response || []);
      setTotalItems(response.count || 0);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load resources.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResources = resources.filter(res => 
    res.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    res.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto mt-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
            <Library className="w-8 h-8 text-[#19A7CE]" />
            Resource Library
          </h2>
          <p className="text-slate-500 mt-2">
            Curated learning materials, guides, and tools for your career development.
          </p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search resources..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full glass-input bg-white focus:outline-none"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-[#19A7CE] animate-pulse">
          <BookOpen size={40} className="mx-auto mb-4" />
          <p className="font-bold">Loading library...</p>
        </div>
      ) : resources.length === 0 ? (
        <Card className="text-center py-20 border-dashed shadow-none">
          <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">Library Empty</h3>
          <p className="text-slate-500 mt-2">Check back later for new career resources.</p>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <Card key={res.id} className="flex flex-col hover:border-[#19A7CE] transition-colors group">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#19A7CE]/10 text-[#146C94] px-2 py-1 rounded text-xs font-bold uppercase">
                      {res.type || 'Article'}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold font-outfit text-[#146C94] group-hover:text-[#19A7CE] transition-colors mb-2 line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-3 mb-6">
                    {res.description}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                  <a href={res.url} target="_blank" rel="noopener noreferrer" className="w-full">
                    <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                      Access Resource <ExternalLink size={14} />
                    </Button>
                  </a>
                </div>
              </Card>
            ))}
          </div>
          {!isLoading && totalItems > 0 && (
            <div className="mt-8">
              <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
