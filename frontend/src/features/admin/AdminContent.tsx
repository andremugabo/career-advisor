import React, { useEffect, useState } from 'react';
import { Card, Button, Pagination } from '../../components';
import { adminService } from '../../services';
import { notify } from '../../lib/toast';
import { Code, Award, Trash2, Plus } from 'lucide-react';

export default function AdminContent() {
  const [skills, setSkills] = useState<any[]>([]);
  const [certs, setCerts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [skillsPage, setSkillsPage] = useState(1);
  const [skillsTotal, setSkillsTotal] = useState(0);
  const [certsPage, setCertsPage] = useState(1);
  const [certsTotal, setCertsTotal] = useState(0);
  
  // Forms
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillCategory, setNewSkillCategory] = useState('Technical');
  const [newCert, setNewCert] = useState({ name: '', provider: '', url: '' });

  useEffect(() => {
    fetchData();
  }, [skillsPage, certsPage]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [skillData, certData] = await Promise.all([
        adminService.getSkills(skillsPage),
        adminService.getCertifications(certsPage)
      ]);
      setSkills(skillData.results || []);
      setSkillsTotal(skillData.count || 0);
      setCerts(certData.results || []);
      setCertsTotal(certData.count || 0);
    } catch (error: any) {
      notify.error(error.message || 'Failed to fetch global content.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    try {
      await adminService.createSkill({ name: newSkillName, category: newSkillCategory });
      notify.success('Skill added to global dictionary.');
      setNewSkillName('');
      fetchData();
    } catch (error: any) {
      notify.error(error.message || 'Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await adminService.deleteSkill(id);
      notify.success('Skill removed from global dictionary.');
      fetchData();
    } catch (error: any) {
      notify.error(error.message || 'Failed to delete skill.');
    }
  };

  const handleAddCert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminService.createCertification(newCert);
      notify.success('Certification added globally.');
      setNewCert({ name: '', provider: '', url: '' });
      fetchData();
    } catch (error: any) {
      notify.error(error.message || 'Failed to add certification.');
    }
  };

  const handleDeleteCert = async (id: string) => {
    try {
      await adminService.deleteCertification(id);
      notify.success('Certification deleted globally.');
      fetchData();
    } catch (error: any) {
      notify.error(error.message || 'Failed to delete certification.');
    }
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8 animate-fade-in">
      
      {/* Global Skills Directory */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-outfit text-[#146C94] flex items-center gap-2">
            <Code className="w-5 h-5 text-[#19A7CE]" />
            Global Skills Dictionary
          </h3>
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-2 mb-6">
          <input 
            type="text" 
            placeholder="Add new skill..." 
            required 
            className="flex-1 p-2.5 rounded-lg border border-slate-300" 
            value={newSkillName} 
            onChange={e => setNewSkillName(e.target.value)} 
          />
          <select
            value={newSkillCategory}
            onChange={e => setNewSkillCategory(e.target.value)}
            className="p-2.5 rounded-lg border border-slate-300 bg-white text-sm"
          >
            <option value="Technical">Technical</option>
            <option value="Soft">Soft</option>
          </select>
          <Button type="submit" className="bg-[#146C94] hover:bg-[#19A7CE] px-4"><Plus className="w-5 h-5" /></Button>
        </form>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-4 text-slate-400">Loading skills...</div>
          ) : skills.map((skill: any) => (
            <div key={skill.id} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl hover:border-[#19A7CE] transition-colors">
              <span className="font-bold text-[#146C94] text-sm">{skill.name}</span>
              <button onClick={() => handleDeleteSkill(skill.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
        {!isLoading && skillsTotal > 0 && (
          <Pagination
            currentPage={skillsPage}
            totalItems={skillsTotal}
            onPageChange={setSkillsPage}
          />
        )}
      </Card>

      {/* Global Certifications Directory */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold font-outfit text-[#146C94] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#19A7CE]" />
            Global Certifications
          </h3>
        </div>

        <form onSubmit={handleAddCert} className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <input type="text" placeholder="Certification Name" required className="w-full p-2.5 rounded-lg border border-slate-300" value={newCert.name} onChange={e => setNewCert({...newCert, name: e.target.value})} />
          <div className="flex gap-2">
            <input type="text" placeholder="Provider (e.g. AWS)" required className="flex-1 p-2.5 rounded-lg border border-slate-300" value={newCert.provider} onChange={e => setNewCert({...newCert, provider: e.target.value})} />
            <input type="url" placeholder="URL link" className="flex-1 p-2.5 rounded-lg border border-slate-300" value={newCert.url} onChange={e => setNewCert({...newCert, url: e.target.value})} />
          </div>
          <Button type="submit" className="w-full bg-[#146C94] hover:bg-[#19A7CE]">Add Certification</Button>
        </form>

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="text-center py-4 text-slate-400">Loading certifications...</div>
          ) : certs.map((cert: any) => (
            <div key={cert.id} className="p-3 bg-white border border-slate-200 rounded-xl hover:border-[#19A7CE] transition-colors shadow-sm">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-[#146C94] text-sm">{cert.name}</h4>
                  <div className="text-xs text-slate-500 mt-0.5">{cert.provider}</div>
                </div>
                <button onClick={() => handleDeleteCert(cert.id)} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
        {!isLoading && certsTotal > 0 && (
          <Pagination
            currentPage={certsPage}
            totalItems={certsTotal}
            onPageChange={setCertsPage}
          />
        )}
      </Card>
    </div>
  );
}
