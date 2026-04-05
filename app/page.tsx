"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';

const translations = {
  ru: {
    title: "DOTA 2", meta: "META", search: "Поиск героя...", currentPatch: "Патч 7.35D", 
    lastUpdate: "Обновлено: Live", str: "Сила", agi: "Ловкость", int: "Интеллект", uni: "Универсалы", notFound: "Не найдено"
  },
  en: {
    title: "DOTA 2", meta: "META", search: "Search hero...", currentPatch: "Patch 7.35D", 
    lastUpdate: "Updated: Live", str: "Strength", agi: "Agility", int: "Intelligence", uni: "Universal", notFound: "Not Found"
  }
};

const ATTRIBUTES = [
  { key: 'str', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png', color: 'text-red-500', border: 'border-red-500/20' },
  { key: 'agi', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png', color: 'text-green-500', border: 'border-green-500/20' },
  { key: 'int', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png', color: 'text-blue-500', border: 'border-blue-500/20' },
  { key: 'uni', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png', color: 'text-purple-500', border: 'border-purple-500/20' },
];

export default function DotaPage() {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [lang, setLang] = useState<'ru' | 'en'>('ru');
  const t = translations[lang];

  useEffect(() => {
    async function loadData() {
      const res = await fetch('https://api.opendota.com/api/heroStats');
      const data = await res.json();
      setHeroes(data);
    }
    loadData();
  }, []);

  const { grouped, spotlight } = useMemo(() => {
    const groups: Record<string, any[]> = { str: [], agi: [], int: [], uni: [] };
    
    // Сортируем по винрейту
    const sortedByWr = [...heroes].sort((a, b) => 
      (b.pro_win / b.pro_pick) - (a.pro_win / a.pro_pick)
    );

    heroes.forEach(h => {
      const attr = h.primary_attr === 'all' ? 'uni' : h.primary_attr;
      if (groups[attr]) groups[attr].push(h);
    });

    return { 
      grouped: groups, 
      spotlight: sortedByWr.slice(0, 3) // Топ-3
    };
  }, [heroes]);

  return (
    <main className="min-h-screen bg-[#020408] text-white p-6 md:p-12 font-sans italic uppercase selection:bg-blue-600 relative overflow-x-hidden">
      
      {/* GLOBAL BACKGROUND */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,transparent_0%,#020408_95%)] opacity-80"></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Переключатель языка */}
      <div className="fixed right-6 top-10 flex flex-col gap-2 z-50 bg-black/60 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
        {['ru', 'en'].map(l => (
          <button key={l} onClick={() => setLang(l as 'ru' | 'en')} className={`w-10 h-10 rounded-xl font-black text-[10px] transition-all ${lang === l ? 'bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)]' : 'text-gray-500 hover:text-white'}`}>{l.toUpperCase()}</button>
        ))}
      </div>

      <div className="relative z-10 px-4 sm:px-10 max-w-[2500px] mx-auto">
        {/* Инфо-панели сверху */}
        <div className="flex flex-wrap gap-8 mb-20">
          <div className="bg-white/5 backdrop-blur-md border border-white/5 p-10 rounded-[40px] flex-1 min-w-[350px] flex justify-between items-center shadow-2xl">
            <div><p className="text-gray-500 text-[11px] uppercase font-black tracking-widest">{t.currentPatch}</p><h3 className="text-5xl font-black text-blue-500 italic leading-none mt-2 tracking-tighter">LIVE META</h3></div>
            <div className="text-right"><p className="text-gray-500 text-[11px] uppercase font-black tracking-widest">{t.lastUpdate}</p><p className="text-sm font-bold opacity-40">SYNCED</p></div>
          </div>

          {spotlight.map((hero, i) => {
            const wr = ((hero.pro_win / hero.pro_pick) * 100).toFixed(1);
            return (
              <Link href={`/hero/${hero.id}`} key={hero.id} className="bg-white/5 backdrop-blur-md border border-white/5 p-8 rounded-[40px] flex-1 min-w-[300px] flex items-center gap-6 hover:bg-white/10 hover:scale-[1.03] transition-all group shadow-2xl">
                <div className="relative w-24 h-14 overflow-hidden rounded-xl border border-white/10 group-hover:border-blue-500">
                  <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name.replace('npc_dota_hero_', '')}.png`} className="w-full h-full object-cover scale-110" />
                </div>
                <div>
                    <p className="text-[10px] font-black uppercase text-gray-500 tracking-tighter leading-none">{hero.localized_name}</p>
                    <p className="text-4xl font-black italic leading-none mt-2">{wr}%</p>
                    <p className="text-[9px] text-blue-400 font-black tracking-widest mt-1.5 uppercase">#0{i+1} TOP WINRATE</p>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Заголовок и поиск */}
        <div className="flex flex-col xl:flex-row items-center justify-between mb-24 gap-12 border-b border-white/5 pb-10">
          <h1 className="text-9xl font-black italic tracking-tighter leading-none drop-shadow-2xl">{t.title} <span className="text-blue-600">{t.meta}</span></h1>
          <div className="relative w-full max-w-2xl">
            <input 
                className="w-full p-8 bg-white/5 border border-white/10 rounded-3xl outline-none focus:border-blue-500 focus:bg-white/10 transition-all font-bold italic tracking-widest uppercase placeholder:text-white/10 text-xl" 
                placeholder={t.search} 
                onChange={e => setSearch(e.target.value)} 
            />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 text-white/5 font-black text-5xl pointer-events-none tracking-tighter">FIND</div>
          </div>
        </div>

        {/* Сетки героев (ГЛАВНЫЕ ИЗМЕНЕНИЯ ТУТ) */}
        {ATTRIBUTES.map(attr => (
          <div key={attr.key} className="mb-24 px-4 sm:px-10">
            <div className="flex items-center gap-6 mb-12 border-l-4 pl-10 border-${attr.color}">
              <img src={attr.icon} className="w-12 h-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]" />
              <h2 className={`text-6xl font-black uppercase italic tracking-tighter ${attr.color}`}>{t[attr.key as keyof typeof t]}</h2>
              <div className="h-px flex-grow bg-gradient-to-r from-white/10 to-transparent"></div>
              <span className="text-[12px] text-white/10 font-black tracking-[0.5em]">{grouped[attr.key]?.length} HEROES</span>
            </div>
            
            {/* УВЕЛИЧИЛИ GAP ДО 6 И ДОБАВИЛИ padding */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-6 pb-6">
              {grouped[attr.key]?.map((hero: any) => {
                const isVisible = hero.localized_name.toLowerCase().includes(search.toLowerCase());
                const wr = ((hero.pro_win / hero.pro_pick) * 100).toFixed(1);
                
                return (
                  <Link 
                    href={`/hero/${hero.id}`} 
                    key={hero.id} 
                    className={`group transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-10 grayscale blur-[2px]'}`}
                  >
                    {/* РАЗМЕР ТЕКСТА БОЛЬШЕ (text-[11px] и text-[13px]) */}
                    <div className={`relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 group-hover:border-blue-500 group-hover:scale-115 group-hover:z-50 transition-all duration-300 shadow-2xl p-0.5`}>
                      <img 
                        src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.name.replace('npc_dota_hero_', '')}.png`} 
                        className="w-full h-full object-cover rounded-[22px] opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 rounded-[22px]"></div>
                      <div className="absolute bottom-3 left-4 right-4">
                        <div className="text-[11px] leading-tight uppercase font-black tracking-tighter truncate opacity-70 group-hover:opacity-100 italic">{hero.localized_name}</div>
                        <div className={`text-[13px] font-black italic leading-none mt-1 ${parseFloat(wr) > 50 ? 'text-green-500' : 'text-red-500'}`}>{wr}%</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}