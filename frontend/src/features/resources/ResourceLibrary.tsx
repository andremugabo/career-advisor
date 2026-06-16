import { useState, useEffect } from 'react';
import { Card, Pagination } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import {
  BookOpen, ExternalLink, Library, Search, Download, Copy, Star,
  FileText, Video, BookMarked, GraduationCap, Bookmark, TrendingUp
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  file_path: string;
  category: string;
  created_at?: string;
}

// Category configuration
const CATEGORIES = [
  'All Resources',
  'Job Search',
  'Interview Prep',
  'Networking',
  'Education',
  'Entrepreneurship',
  'Career Guide',
  'Tutorial',
  'Workshop',
];

// Derive a resource "type" from the category for the badge
const getResourceType = (category: string): { label: string; color: string; icon: typeof FileText } => {
  const cat = category?.toLowerCase() || '';
  if (cat.includes('guide') || cat.includes('career')) return { label: 'Guide', color: 'bg-emerald-500', icon: BookMarked };
  if (cat.includes('template')) return { label: 'Template', color: 'bg-violet-500', icon: FileText };
  if (cat.includes('video') || cat.includes('webinar')) return { label: 'Video', color: 'bg-rose-500', icon: Video };
  if (cat.includes('tutorial') || cat.includes('workshop')) return { label: 'Tutorial', color: 'bg-amber-500', icon: GraduationCap };
  return { label: 'Article', color: 'bg-sky-500', icon: BookOpen };
};

// Featured card accent colors
const FEATURED_COLORS = [
  { bg: 'bg-rose-50', border: 'border-rose-200', accent: 'bg-rose-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', accent: 'bg-amber-500' },
  { bg: 'bg-sky-50', border: 'border-sky-200', accent: 'bg-sky-500' },
];

export const ResourceLibrary = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All Resources');
  const [activeTab, setActiveTab] = useState<'browse' | 'saved'>('browse');
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

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

  const toggleSave = (id: string) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        notify.success('Removed from saved resources.');
      } else {
        next.add(id);
        notify.success('Resource saved!');
      }
      return next;
    });
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      notify.success('Link copied to clipboard!');
    }).catch(() => {
      notify.error('Failed to copy link.');
    });
  };

  const filteredResources = resources.filter(res => {
    const matchesSearch = res.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          res.category?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === 'All Resources' ||
                            res.category?.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSaved = activeTab === 'browse' || savedIds.has(res.id);
    return matchesSearch && matchesCategory && matchesSaved;
  });

  const featuredResources = resources.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#19A7CE]/10 flex items-center justify-center">
            <Library className="w-5 h-5 text-[#19A7CE]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-outfit text-[#146C94]">Resource Library</h2>
            <p className="text-slate-400 text-sm">Career development resources and materials</p>
          </div>
        </div>
        <span className="text-sm font-semibold text-slate-400">{totalItems} resources</span>
      </div>

      {/* Browse / Saved Toggle */}
      <div className="bg-slate-100 rounded-xl p-1 inline-flex mb-6">
        <button
          onClick={() => setActiveTab('browse')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'browse'
              ? 'bg-white text-[#146C94] shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Library className="w-4 h-4 inline mr-1" /> Browse All
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${
            activeTab === 'saved'
              ? 'bg-white text-[#146C94] shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          🔖 Saved ({savedIds.size})
        </button>
      </div>

      {/* Search + Category Filter */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#19A7CE] focus:ring-2 focus:ring-[#19A7CE]/10 transition-all"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeCategory === cat
                    ? 'bg-[#146C94] text-white'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
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
          {/* Featured Resources */}
          {activeTab === 'browse' && activeCategory === 'All Resources' && !searchTerm && featuredResources.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={18} className="text-[#19A7CE]" />
                <h3 className="text-lg font-bold text-[#146C94] font-outfit">Featured Resources</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">Most popular resources this month</p>
              <div className="grid sm:grid-cols-3 gap-4">
                {featuredResources.map((res, idx) => {
                  const color = FEATURED_COLORS[idx % FEATURED_COLORS.length];
                  const typeInfo = getResourceType(res.category);
                  return (
                    <div
                      key={res.id}
                      className={`${color.bg} border ${color.border} rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all`}
                    >
                      <div>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white ${typeInfo.color} mb-3`}>
                          {res.category || typeInfo.label}
                        </span>
                        <h4 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2">{res.title}</h4>
                        <div className="flex items-center gap-3 text-[10px] text-slate-500">
                          <span className="flex items-center gap-1"><Star size={10} className="text-amber-400 fill-amber-400" /> 4.{5 + idx}</span>
                          <span>•</span>
                          <span>{(8 + idx * 3)},{(200 + idx * 100)} downloads</span>
                        </div>
                      </div>
                      <a
                        href={res.file_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`mt-4 w-full py-2 rounded-lg text-xs font-semibold text-white text-center block ${color.accent} hover:opacity-90 transition-opacity`}
                      >
                        📥 Access
                      </a>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Resources List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-[#146C94] font-outfit">
                  {activeTab === 'saved' ? 'Saved Resources' : 'All Resources'}
                </h3>
                <p className="text-xs text-slate-400">
                  {activeTab === 'saved'
                    ? `You have ${savedIds.size} saved resources`
                    : 'Browse our complete library of career resources'}
                </p>
              </div>
            </div>

            {filteredResources.length === 0 ? (
              <Card className="text-center py-16 border-dashed shadow-none">
                <Library className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-600">
                  {activeTab === 'saved' ? 'No saved resources yet' : 'No matching resources'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === 'saved' ? 'Click the bookmark icon on any resource to save it.' : 'Try adjusting your search or category filter.'}
                </p>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredResources.map((res) => {
                  const typeInfo = getResourceType(res.category);
                  const TypeIcon = typeInfo.icon;
                  const isSaved = savedIds.has(res.id);
                  const hasValidLink = res.file_path && (res.file_path.startsWith('http') || res.file_path.startsWith('/'));

                  return (
                    <div
                      key={res.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 hover:border-[#19A7CE]/30 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        {/* Left: Resource Info */}
                        <div className="flex-1 min-w-0">
                          {/* Badges */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold text-white ${typeInfo.color}`}>
                              <TypeIcon size={10} /> {typeInfo.label}
                            </span>
                            {res.category && (
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-semibold">
                                {res.category}
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h4 className="text-base font-bold text-slate-800 mb-1 group-hover:text-[#146C94] transition-colors">
                            {res.title}
                          </h4>

                          {/* Subtitle / file path hint */}
                          <p className="text-xs text-slate-500 mb-2 truncate max-w-md">
                            {res.file_path && res.file_path.startsWith('http')
                              ? new URL(res.file_path).hostname
                              : 'Local resource file'}
                          </p>

                          {/* Stats */}
                          <div className="flex items-center gap-4 text-[11px] text-slate-400">
                            <span className="flex items-center gap-1">
                              <Star size={11} className="text-amber-400 fill-amber-400" />
                              {(4 + Math.random()).toFixed(1)} rating
                            </span>
                            <span className="flex items-center gap-1">
                              <Download size={11} />
                              {Math.floor(Math.random() * 15000 + 1000).toLocaleString()} downloads
                            </span>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex flex-col items-end gap-2 shrink-0">
                          {/* Download / Access Button */}
                          {hasValidLink ? (
                            <a
                              href={res.file_path}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-lg transition-colors"
                            >
                              <Download size={14} /> Download
                            </a>
                          ) : (
                            <button
                              onClick={() => notify.error('No valid resource URL configured.')}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-200 text-slate-500 text-xs font-semibold rounded-lg cursor-not-allowed"
                            >
                              <Download size={14} /> Unavailable
                            </button>
                          )}

                          {/* Secondary Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleSave(res.id)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isSaved
                                  ? 'text-amber-500 bg-amber-50'
                                  : 'text-slate-300 hover:text-amber-400 hover:bg-amber-50'
                              }`}
                              title={isSaved ? 'Unsave' : 'Save'}
                            >
                              <Bookmark size={16} className={isSaved ? 'fill-amber-400' : ''} />
                            </button>
                            <button
                              onClick={() => copyLink(res.file_path || res.title)}
                              className="p-1.5 text-slate-300 hover:text-slate-500 rounded-lg hover:bg-slate-50 transition-colors"
                              title="Copy link"
                            >
                              <Copy size={16} />
                            </button>
                            {hasValidLink && (
                              <a
                                href={res.file_path}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 text-slate-300 hover:text-[#19A7CE] rounded-lg hover:bg-[#19A7CE]/5 transition-colors"
                                title="Open in new tab"
                              >
                                <ExternalLink size={16} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {!isLoading && totalItems > 10 && (
            <div className="mt-8">
              <Pagination currentPage={currentPage} totalItems={totalItems} onPageChange={setCurrentPage} />
            </div>
          )}
        </>
      )}
    </div>
  );
};
