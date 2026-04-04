"use client";
import { useState, useMemo } from 'react';
import Link from 'next/link';
import { HEROES_LIST, Hero } from './heroes'; 

const ATTRIBUTES = [
  { key: 'str', name: 'СИЛА', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_strength.png', color: 'text-red-500' },
  { key: 'agi', name: 'ЛОВКОСТЬ', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_agility.png', color: 'text-green-500' },
  { key: 'int', name: 'ИНТЕЛЛЕКТ', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_intelligence.png', color: 'text-blue-500' },
  { key: 'uni', name: 'УНИВЕРСАЛЬНЫЕ', icon: 'https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/icons/hero_universal.png', color: 'text-purple-500' },
];

export default function DotaPage() {
  const [search, setSearch] = useState("");
  const grouped = useMemo(() => {
    const res: any = { str: [], agi: [], int: [], uni: [] };
    HEROES_LIST.forEach(h => res[h.attr]?.push(h));
    return res;
  }, []);

  return (
    <main className="min-h-screen bg-[#050608] text-white p-6 md:p-12 font-sans selection:bg-blue-600">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex justify-between items-center mb-16">
          <h1 className="text-6xl font-black italic uppercase tracking-tighter">DOTA 2 <span className="text-blue-500">PRO</span></h1>
          <input 
            className="p-4 bg-[#1c242d] border border-white/10 rounded-xl outline-none focus:border-blue-500 w-80"
            placeholder="Поиск героя..."
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {ATTRIBUTES.map(attr => (
          <div key={attr.key} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <img src={attr.icon} className="w-8 h-8" />
              <h2 className={`text-2xl font-black italic ${attr.color}`}>{attr.name}</h2>
              <div className="h-[1px] flex-grow bg-white/5"></div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {grouped[attr.key]?.map((hero: Hero) => {
                const isMatch = hero.name.toLowerCase().includes(search.toLowerCase());
                return (
                  <Link href={`/hero/${hero.id}`} key={hero.id} className={`group transition-all ${isMatch ? 'opacity-100' : 'opacity-10 pointer-events-none'}`}>
                    <div className="relative bg-black rounded-lg overflow-hidden border border-gray-800 group-hover:border-blue-500 transition-all h-24">
                      <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.img}.png`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                      <div className="absolute bottom-1 w-full text-center">
                        <p className="text-[7px] font-black uppercase text-gray-400 group-hover:text-white transition-colors">{hero.name}</p>
                        <p className="text-[10px] font-bold text-green-500">{hero.wr}%</p>
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