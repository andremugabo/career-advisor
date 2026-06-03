import { useState, useEffect } from 'react';
import { Card, Button, Pagination } from '../../components';
import { advisorService } from '../../services';
import { notify } from '../../lib/toast';
import { BookOpen, ExternalLink, Library, Search, Plus, Trash2, Edit3, X, Save } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  file_path: string;
  category: string;
}

export const AdvisorResourceLibrary = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Create/Edit modal state
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState<Resource | null>(null);
  const [formData, setFormData] = useState({ title: '', file_path: '', category: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchResources(currentPage);
  }, [currentPage]);

  const fetchResources = async (page: number) => {
    setIsLoading(true);
    try {
      const response = await advisorService.getResources(page);
      setResources(response.results || response || []);
      setTotalItems(response.count || 0);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load resources.');
    } finally {
      setIsLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingResource(null);
    setFormData({ title: '', file_path: '', category: '' });
    setShowModal(true);
  };

  const openEditModal = (resource: Resource) => {
    setEditingResource(resource);
    setFormData({ title: resource.title, file_path: resource.file_path, category: resource.category });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.category.trim()) {
      notify.error('Title and category are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      if (editingResource) {
        await advisorService.updateResource(editingResource.id, formData);
        notify.success('Resource updated successfully.');
      } else {
        await advisorService.createResource(formData);
        notify.success('Resource created successfully.');
      }
      setShowModal(false);
      fetchResources(currentPage);
    } catch (err: any) {
      notify.error(err.message || 'Failed to save resource.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await advisorService.deleteResource(id);
      notify.success('Resource deleted.');
      fetchResources(currentPage);
    } catch (err: any) {
      notify.error('Failed to delete resource.');
    }
  };

  const filteredResources = resources.filter((res) =>
    res.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    res.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [...new Set(resources.map(r => r.category).filter(Boolean))];

  return (
    <div className="max-w-7xl mx-auto mt-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
            <Library className="w-8 h-8 text-[#19A7CE]" />
            Resource Library
          </h2>
          <p className="text-slate-500 mt-2">
            Manage learning materials, guides, and tools for student development.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full md:w-64 glass-input bg-white focus:outline-none"
            />
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2 whitespace-nowrap">
            <Plus size={16} /> Add Resource
          </Button>
        </div>
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setSearchTerm('')}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              !searchTerm ? 'bg-[#146C94] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSearchTerm(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                searchTerm === cat ? 'bg-[#146C94] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="text-center py-20 text-[#19A7CE] animate-pulse">
          <BookOpen size={40} className="mx-auto mb-4" />
          <p className="font-bold">Loading library...</p>
        </div>
      ) : resources.length === 0 ? (
        <Card className="text-center py-20 border-dashed shadow-none">
          <Library className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600">Library Empty</h3>
          <p className="text-slate-500 mt-2 mb-4">Start by adding your first resource.</p>
          <Button onClick={openCreateModal} className="inline-flex items-center gap-2">
            <Plus size={16} /> Add Resource
          </Button>
        </Card>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((res) => (
              <Card key={res.id} className="flex flex-col hover:border-[#19A7CE] transition-colors group">
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#19A7CE]/10 text-[#146C94] px-2 py-1 rounded text-xs font-bold uppercase">
                      {res.category || 'General'}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); openEditModal(res); }}
                        className="p-1.5 hover:bg-[#19A7CE]/10 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit3 size={14} className="text-[#19A7CE]" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(res.id); }}
                        className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={14} className="text-rose-400" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold font-outfit text-[#146C94] group-hover:text-[#19A7CE] transition-colors mb-2 line-clamp-2">
                    {res.title}
                  </h3>
                  <p className="text-sm text-slate-500 truncate">
                    {res.file_path}
                  </p>
                </div>
                <div className="mt-auto pt-4 border-t border-slate-100 flex justify-end">
                  {res.file_path && (
                    <a href={res.file_path} target="_blank" rel="noopener noreferrer" className="w-full">
                      <Button variant="secondary" className="w-full flex items-center justify-center gap-2">
                        Access Resource <ExternalLink size={14} />
                      </Button>
                    </a>
                  )}
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h3 className="text-xl font-bold font-outfit text-[#146C94]">
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Python for Data Science"
                  className="glass-input w-full bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">File Path / URL</label>
                <input
                  type="text"
                  value={formData.file_path}
                  onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                  placeholder="https://example.com/resource.pdf"
                  className="glass-input w-full bg-white focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category *</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g. Career Guide, Tutorial, Workshop"
                  className="glass-input w-full bg-white focus:outline-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting} className="flex items-center gap-2">
                <Save size={16} />
                {isSubmitting ? 'Saving...' : editingResource ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
