"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DotaPage() {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // ПРОВЕРКА КЭША: если герои уже есть в памяти, не мучаем API
      const cached = sessionStorage.getItem('dota_master_cache');
      if (cached) {
        setHeroes(JSON.parse(cached));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('https://api.opendota.com/api/heroStats');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setHeroes(data);
          sessionStorage.setItem('dota_master_cache', JSON.stringify(data));
        }
      } catch (e) {
        console.error("Ошибка сети:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filtered = heroes.filter(h => h.localized_name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white p-10 font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-7xl font-black text-red-600 italic uppercase text-center mb-16 tracking-tighter">Dota 2 Meta</h1>
        
        <div className="max-w-md mx-auto mb-20">
          <input 
            className="w-full p-5 bg-[#1c242d] border-2 border-gray-800 rounded-3xl focus:border-red-600 outline-none transition-all text-white shadow-2xl"
            placeholder="Найти героя..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && heroes.length === 0 ? (
          <div className="text-center py-20 text-red-600 font-black animate-pulse uppercase tracking-[1em]">Connecting...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {filtered.map(hero => {
              const wr = hero["8_pick"] > 0 ? (hero["8_win"] / hero["8_pick"] * 100).toFixed(1) : "50.0";
              return (
                <Link href={`/hero/${hero.id}`} key={hero.id} className="block group">
                  <div className="bg-[#1c242d] rounded-[32px] overflow-hidden border-2 border-gray-800 group-hover:border-red-600 transition-all shadow-xl hover:-translate-y-2 duration-300">
                    <img src={`https://api.opendota.com${hero.img}`} className="w-full h-32 object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="p-5 text-center">
                      <p className="text-[10px] uppercase font-black text-gray-500 mb-1">{hero.localized_name}</p>
                      <p className={`text-2xl font-black ${Number(wr) >= 50 ? 'text-green-500' : 'text-red-500'}`}>{wr}%</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}