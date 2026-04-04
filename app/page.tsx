"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DotaPage() {
  const [heroes, setHeroes] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch('https://api.opendota.com/api/heroStats')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHeroes(data);
      })
      .catch(err => console.log(err));
  }, []);

  const filtered = heroes.filter(h => 
    h.localized_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-5xl font-black text-red-600 text-center mb-10 uppercase italic">Dota 2 Meta</h1>
      
      <input 
        className="block w-full max-w-md mx-auto p-4 bg-[#1c242d] border border-gray-800 rounded-xl mb-10"
        placeholder="Поиск героя..."
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {filtered.map(hero => (
          <Link href={`/hero/${hero.id}`} key={hero.id} className="hover:scale-105 transition-transform">
            <div className="bg-[#1c242d] rounded-2xl overflow-hidden border border-gray-800 text-center pb-4">
              <img src={`https://api.opendota.com${hero.img}`} className="w-full h-32 object-cover mb-2" />
              <p className="font-bold text-xs uppercase text-gray-400">{hero.localized_name}</p>
              <p className="text-xl font-black text-red-500">
                {(hero["8_pick"] > 0 ? (hero["8_win"]/hero["8_pick"]*100) : 50).toFixed(1)}%
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}