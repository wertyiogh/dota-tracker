"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';

export default function HeroDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const heroId = resolvedParams.id;

  const [hero, setHero] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHero() {
      setLoading(true);
      try {
        // Сначала пробуем взять из кэша главной страницы
        const saved = sessionStorage.getItem('dota_master_cache');
        let foundHero = null;

        if (saved) {
          const allHeroes = JSON.parse(saved);
          foundHero = allHeroes.find((h: any) => h.id === parseInt(heroId));
        }

        // Если в кэше нет или мы зашли по прямой ссылке - качаем заново
        if (!foundHero) {
          const res = await fetch('https://api.opendota.com/api/heroStats');
          const data = await res.json();
          foundHero = data.find((h: any) => h.id === parseInt(heroId));
        }

        setHero(foundHero);

        // Качаем предметы
        const itemsRes = await fetch('https://api.opendota.com/api/constants/items');
        const itemsData = await itemsRes.json();
        const topItems = Object.values(itemsData)
          .filter((i: any) => i.cost > 2000 && i.img)
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);
        setItems(topItems);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (heroId) loadHero();
  }, [heroId]);

  if (loading) return <div className="min-h-screen bg-[#0b0e11] flex items-center justify-center text-red-600 font-black animate-pulse uppercase tracking-widest">Loading Hero...</div>;
  if (!hero) return <div className="min-h-screen bg-[#0b0e11] text-white flex flex-col items-center justify-center p-20">
    <h1 className="text-4xl font-black mb-8 uppercase">Hero not found</h1>
    <Link href="/" className="bg-red-600 px-10 py-4 rounded-full font-black uppercase text-xs">Back to Meta</Link>
  </div>;

  return (
    <div className="min-h-screen bg-[#0b0e11] text-white p-6 md:p-20 font-sans">
      <Link href="/" className="inline-block mb-12 text-gray-500 hover:text-red-600 transition-all font-black uppercase text-xs tracking-[0.3em]">
        ← Back to Meta
      </Link>

      <div className="bg-[#1c242d] p-12 rounded-[48px] border-2 border-gray-800 shadow-3xl flex flex-col md:flex-row items-center gap-14 relative overflow-hidden">
        <img src={`https://api.opendota.com${hero.img}`} className="w-96 h-56 object-cover rounded-[32px] border-4 border-red-600 shadow-2xl z-10" alt={hero.localized_name} />
        <div className="z-10">
          <h1 className="text-8xl font-black italic uppercase text-white tracking-tighter leading-none mb-6">{hero.localized_name}</h1>
          <div className="flex flex-wrap gap-4">
            {hero.roles?.map((role: string) => (
              <span key={role} className="bg-red-600/10 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-red-500 border border-red-600/20">{role}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-24">
        <h2 className="text-4xl font-black italic uppercase text-gray-400 mb-12 tracking-widest border-l-8 border-red-600 pl-8">Suggested Build</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-8">
          {items.map((item: any) => (
            <div key={item.id} className="bg-[#1c242d] p-8 rounded-[32px] border-2 border-gray-800 hover:border-yellow-600 transition-all text-center group">
              <img src={`https://api.opendota.com${item.img}`} className="w-20 h-14 mx-auto object-contain mb-5 group-hover:scale-110 transition-transform" alt={item.dname} />
              <p className="text-[10px] font-black uppercase text-gray-500 truncate mb-2 group-hover:text-white transition-colors">{item.dname}</p>
              <p className="text-yellow-600 font-black text-xs uppercase tracking-tighter">{item.cost} Gold</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}