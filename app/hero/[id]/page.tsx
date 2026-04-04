"use client";
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function HeroItemsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [items, setItems] = useState<any>(null);

  useEffect(() => {
    // Запрос к API за популярными предметами конкретного героя
    fetch(`https://api.opendota.com/api/heroes/${id}/item_popularity`)
      .then(res => res.json())
      .then(data => setItems(data));
  }, [id]);

  if (!items) return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center">
      <div className="text-red-600 text-2xl font-black animate-pulse uppercase">Загрузка сборки...</div>
    </div>
  );

  const renderSection = (title: string, data: any) => {
    if (!data || Object.keys(data).length === 0) return null;
    
    return (
      <div className="mb-12">
        <h3 className="text-gray-500 text-xs font-black uppercase tracking-[0.3em] mb-6 border-l-4 border-red-600 pl-4">
          {title}
        </h3>
        <div className="flex flex-wrap gap-4">
          {Object.keys(data).slice(0, 10).map(itemName => (
            <div key={itemName} className="group relative">
              <div className="bg-[#1c242d] p-1 rounded-lg border border-gray-800 group-hover:border-yellow-500 transition-all shadow-xl">
                <img 
                  src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${itemName.replace('item_', '')}.png`}
                  className="w-20 h-15 object-cover rounded-md group-hover:brightness-125 transition-all"
                  alt={itemName}
                  onError={(e) => (e.currentTarget.style.display = 'none')} 
                />
              </div>
              {/* Подсказка с названием при наведении */}
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-black/90 text-[10px] p-2 rounded border border-gray-700 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                {itemName.replace('item_', '').replace(/_/g, ' ').toUpperCase()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-8 font-sans selection:bg-red-600">
      <div className="max-w-5xl mx-auto">
        <button 
          onClick={() => router.back()} 
          className="mb-12 flex items-center text-gray-500 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest"
        >
          <span className="mr-2">←</span> Вернуться к списку героев
        </button>

        <h1 className="text-6xl font-black mb-16 tracking-tighter italic">
          POPULAR <span className="text-red-600 underline decoration-2 underline-offset-8">BUILDS</span>
        </h1>

        <div className="space-y-4">
          {renderSection("Стартовые предметы", items.start_game_items)}
          {renderSection("Ранняя игра", items.early_game_items)}
          {renderSection("Основные предметы (Mid)", items.mid_game_items)}
          {renderSection("Поздняя игра (Late)", items.late_game_items)}
        </div>
        
        {(!items.start_game_items && !items.mid_game_items) && (
          <div className="text-center p-20 border-2 border-dashed border-gray-800 rounded-3xl">
            <p className="text-gray-600 uppercase font-bold">Данные для этого героя временно недоступны</p>
          </div>
        )}
      </div>
    </div>
  );
}