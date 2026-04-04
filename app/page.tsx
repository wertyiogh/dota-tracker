"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hero {
  id: number;
  localized_name: string;
  name: string;
  img: string;
  icon: string;
  "8_pick": number;
  "8_win": number;
  turbo_picks: number;
  turbo_wins: number;
}

export default function DotaPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('https://api.opendota.com/api/heroStats');
        const data = await res.json();
        if (Array.isArray(data)) {
          setHeroes(data);
        }
      } catch (error) {
        console.error("Ошибка API:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = heroes.filter(h => 
    h.localized_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white p-6 md:p-10 font-sans selection:bg-red-600">
      <div className="max-w-7xl mx-auto">
        
        {/* Шапка */}
        <div className="text-center mb-16">
          <h1 className="text-7xl font-black text-red-600 tracking-tighter italic uppercase drop-shadow-[0_5px_15px_rgba(220,38,38,0.3)]">
            Dota 2 Meta
          </h1>
          <p className="text-gray-500 mt-4 uppercase tracking-[0.6em] text-[10px] font-bold">
            Live Immortal Statistics
          </p>
        </div>
        
        {/* Поиск */}
        <div className="max-w-xl mx-auto mb-20 relative group">
          <input 
            className="w-full p-5 bg-[#1c242d] border-2 border-gray-800 rounded-3xl focus:border-red-600 outline-none transition-all shadow-2xl text-white placeholder:text-gray-700 text-lg"
            placeholder="Search Hero..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-6 top-5 text-gray-700 font-black text-xs uppercase group-focus-within:text-red-600 transition-colors">Search</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-red-600 font-black uppercase tracking-widest animate-pulse">Syncing with Valve...</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filtered.map(hero => {
              // Расчет винрейта: приоритет на Immortal, если нет - на Turbo
              let wr = 50.0;
              if (hero["8_pick"] > 0) {
                wr = (hero["8_win"] / hero["8_pick"]) * 100;
              } else if (hero.turbo_picks > 0) {
                wr = (hero.turbo_wins / hero.turbo_picks) * 100;
              }

              return (
                <Link href={`/hero/${hero.id}`} key={hero.id} className="block group">
                  <div className="bg-[#1c242d] rounded-3xl overflow-hidden border-2 border-gray-800 group-hover:border-red-600 group-hover:-translate-y-2 transition-all duration-300 shadow-xl group-hover:shadow-red-900/20">
                    <div className="relative h-32 overflow-hidden bg-black">
                      <img 
                        src={`https://api.opendota.com${hero.img}`} 
                        className="w-full h-full object-cover group-hover:scale-110 group-hover:brightness-125 transition-all duration-500" 
                        alt={hero.localized_name} 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1c242d] to-transparent opacity-60"></div>
                    </div>
                    <div className="p-4 text-center">
                      <h2 className="font-bold text-[11px] uppercase mb-1 truncate text-gray-400 group-hover:text-white transition-colors">
                        {hero.localized_name}
                      </h2>
                      <div className={`text-2xl font-black ${wr >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                        {wr.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-20 bg-[#1c242d] rounded-3xl border-2 border-dashed border-gray-800">
            <p className="text-gray-600 font-black uppercase tracking-widest italic">
              Hero "{search}" not found in Radiant or Dire
            </p>
          </div>
        )}
      </div>
    </main>
  );
}