"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function HeroDetail({ params }: { params: Promise<{ id: string }> }) {
  // Разворачиваем params с помощью use(), чтобы Next.js точно увидел ID
  const resolvedParams = use(params);
  const heroId = resolvedParams.id;

  const [hero, setHero] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getHeroData() {
      try {
        setLoading(true);
        // 1. Получаем инфу о герое
        const heroRes = await fetch('https://api.opendota.com/api/heroStats');
        const heroData = await heroRes.json();
        
        // Ищем героя по ID
        const foundHero = heroData.find((h: any) => h.id === parseInt(heroId));
        
        if (foundHero) {
          setHero(foundHero);
          // 2. Получаем базу предметов только если герой найден
          const itemsRes = await fetch('https://api.opendota.com/api/constants/items');
          const itemsData = await itemsRes.json();
          
          const allItems = Object.values(itemsData).filter((i: any) => i.cost > 1500);
          const randomItems = allItems.sort(() => 0.5 - Math.random()).slice(0, 6);
          setItems(randomItems);
        }
      } catch (err) {
        console.error("Ошибка загрузки:", err);
      } finally {
        setLoading(false);
      }
    }
    
    if (heroId) {
      getHeroData();
    }
  }, [heroId]);

  if (loading) return (
    <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center">
      <div className="text-red-600 font-black animate-pulse uppercase tracking-[1em]">Loading Build...</div>
    </div>
  );

  if (!hero) return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-20 flex flex-col items-center">
      <h1 className="text-4xl font-black mb-6">Hero not found</h1>
      <Link href="/" className="bg-red-600 px-6 py-2 rounded-full font-bold">Return to Meta</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-6 md:p-20 font-sans selection:bg-red-600">
      <Link href="/" className="inline-block mb-10 text-gray-500 hover:text-red-600 transition-colors font-black uppercase text-xs tracking-widest">
        ← Back to Meta
      </Link>

      <div className="bg-[#1c242d] p-10 rounded-[40px] border-2 border-gray-800 shadow-3xl flex flex-col md:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl font-black italic uppercase select-none">
          {hero.primary_attr}
        </div>
        
        <img 
          src={`https://api.opendota.com${hero.img}`} 
          className="w-80 h-48 object-cover rounded-3xl border-4 border-red-600 shadow-[0_0_50px_rgba(220,38,38,0.3)] z-10"
          alt={hero.localized_name}
        />

        <div className="z-10">
          <h1 className="text-7xl font-black italic uppercase text-white tracking-tighter leading-none mb-4">
            {hero.localized_name}
          </h1>
          <div className="flex flex-wrap gap-3">
            {hero.roles.map((role: string) => (
              <span key={role} className="bg-black/50 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-red-500 border border-red-600/20">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-20">
        <h2 className="text-3xl font-black italic uppercase text-gray-400 mb-10 tracking-widest border-l-8 border-red-600 pl-6">
          High-Rank Item Build
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
          {items.map((item: any) => (
            <div key={item.id} className="bg-[#1c242d] p-6 rounded-3xl border-2 border-gray-800 hover:border-yellow-600 transition-all group relative overflow-hidden">
              <img 
                src={`https://api.opendota.com${item.img}`} 
                className="w-16 h-12 mx-auto object-contain mb-4 group-hover:scale-125 transition-transform"
                alt={item.dname}
              />
              <p className="text-[10px] font-black uppercase text-gray-500 group-hover:text-white truncate mb-1 text-center">
                {item.dname}
              </p>
              <p className="text-yellow-600 font-black text-xs tracking-tighter text-center">
                {item.cost} GOLD
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}