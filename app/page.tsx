"use client";

import { useState } from 'react';
import Link from 'next/link';
import { HEROES_LIST } from './heroes';

export default function DotaPage() {
  const [search, setSearch] = useState("");
  const filtered = HEROES_LIST.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="min-h-screen bg-[#020406] text-white p-4 md:p-10 font-sans">
      <div className="max-w-[1600px] mx-auto">
        <h1 className="text-6xl md:text-8xl font-black italic uppercase text-center mb-12 tracking-tighter drop-shadow-2xl">
          DOTA 2 <span className="text-blue-500">META</span>
        </h1>
        
        <input 
          className="w-full max-w-lg mx-auto block p-5 bg-[#1c242d] border-4 border-gray-800 rounded-3xl mb-16 focus:border-blue-600 outline-none transition-all text-xl shadow-xl placeholder:text-gray-600"
          placeholder="Поиск по 124 героям..."
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-4">
          {filtered.map(hero => (
            <Link href={`/hero/${hero.id}`} key={hero.id} className="group hover:-translate-y-2 transition-all duration-300">
              <div className="bg-[#1c242d] border-2 border-gray-800 rounded-2xl overflow-hidden group-hover:border-blue-500 shadow-xl">
                <img 
                  src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.img}.png`} 
                  className="w-full grayscale group-hover:grayscale-0 transition-all" 
                  alt={hero.name}
                />
                <div className="p-3 text-center bg-black/40">
                  <p className="font-black uppercase text-[8px] text-gray-500 truncate">{hero.name}</p>
                  <p className={`text-sm font-black italic ${Number(hero.wr) >= 50 ? 'text-green-500' : 'text-red-500'}`}>{hero.wr}%</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}