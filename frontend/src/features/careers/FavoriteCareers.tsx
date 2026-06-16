import { useState, useEffect } from 'react';
import { Card, Button } from '../../components';
import { studentService } from '../../services';
import { notify } from '../../lib/toast';
import { Star, AlertCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { FavoriteCareer } from '../../types';

export const FavoriteCareers = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteCareer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    setIsLoading(true);
    try {
      const response = await studentService.getFavoriteCareers();
      setFavorites(response);
    } catch (error: any) {
      notify.error(error.message || 'Failed to load favorite careers.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (favoriteId: number) => {
    try {
      await studentService.removeFavoriteCareer(favoriteId.toString());
      setFavorites(favorites.filter(f => f.id !== favoriteId));
      notify.success('Removed from favorites.');
    } catch (error: any) {
      notify.error(error.message || 'Failed to update favorites.');
    }
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 animate-fade-in pb-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold font-outfit text-[#146C94] flex items-center gap-3">
          <Star className="w-8 h-8 text-amber-400 fill-amber-400" />
          Saved Careers
        </h2>
        <p className="text-slate-500 mt-2">
          Your bookmarked AI career pathways for easy access.
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-[#19A7CE] animate-pulse">
          <Star size={40} className="mx-auto mb-4" />
          <p className="font-bold">Loading favorites...</p>
        </div>
      ) : favorites.length === 0 ? (
        <Card className="border-dashed border-2 border-slate-200 shadow-none py-20 text-center flex flex-col items-center">
          <AlertCircle size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-600">No Favorites Yet</h3>
          <p className="text-slate-500 max-w-sm mt-2 mb-6">
            You haven't saved any careers yet. Head over to the recommendations page to start building your target list.
          </p>
          <Button onClick={() => navigate('/recommendations')} className="bg-[#146C94] hover:bg-[#19A7CE]">
            Browse Recommendations
          </Button>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {(Array.isArray(favorites) ? favorites : []).map((fav) => (
            <Card key={fav.id} className="relative group border-slate-200 shadow-sm hover:border-amber-200 transition-colors">
              <button 
                onClick={() => removeFavorite(fav.id)}
                className="absolute top-4 right-4 text-amber-400 hover:text-slate-300 transition-colors z-10"
                title="Remove from favorites"
              >
                <Star size={24} className="fill-amber-400 hover:fill-transparent" />
              </button>
              
              <div className="pr-12">
                <span className="text-[10px] font-bold text-slate-400 font-mono tracking-wider">O*NET: {fav.career.onet_code}</span>
                <h3 className="text-xl font-bold font-outfit text-[#146C94] mt-1 mb-3">{fav.career.name}</h3>
                
                <p className="text-sm text-slate-600 line-clamp-3 mb-6">
                  {fav.career.description}
                </p>
                
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-500">Added: {fav.saved_at ? new Date(fav.saved_at).toLocaleDateString() : '—'}</span>
                  <Button variant="secondary" className="py-1 px-3 text-xs h-auto flex items-center gap-1">
                    View Details <ArrowRight size={14}/>
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
