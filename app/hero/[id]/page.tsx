"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

export default function HeroDetail() {
  const params = useParams();
  const [hero, setHero] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!params.id) return;

    // Грузим героя
    fetch('https://api.opendota.com/api/heroStats')
      .then(res => res.json())
      .then(data => {
        const found = data.find((h: any) => h.id.toString() === params.id);
        setHero(found);
      });

    // Грузим шмотки
    fetch('https://api.opendota.com/api/constants/items')
      .then(res => res.json())
      .then(data => {
        const list = Object.values(data)
          .filter((i: any) => i.cost > 2000 && i.img)
          .sort(() => 0.5 - Math.random())
          .slice(0, 6);
        setItems(list);
      });
  }, [params.id]);

  if (!hero) return <div className="p-20 text-center text-red-600 font-bold uppercase tracking-widest">Загрузка героя...</div>;

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <Link href="/" className="text-gray-500 hover:text-white uppercase text-xs mb-10 block">← Назад</Link>
      
      <div className="flex flex-col md:flex-row gap-10 bg-[#1c242d] p-10 rounded-3xl border border-gray-800">
        <img src={`https://api.opendota.com${hero.img}`} className="w-80 rounded-xl border-2 border-red-600" />
        <div>
          <h1 className="text-6xl font-black uppercase italic text-white">{hero.localized_name}</h1>
          <p className="text-red-500 font-bold mt-2 tracking-widest uppercase">{hero.roles?.join(" • ")}</p>
        </div>
      </div>

      <h2 className="text-2xl font-black uppercase mt-16 mb-8 italic text-gray-500">Рекомендуемый закуп</h2>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
        {items.map((item: any, idx) => (
          <div key={idx} className="bg-[#1c242d] p-6 rounded-2xl border border-gray-800 text-center">
            <img src={`https://api.opendota.com${item.img}`} className="w-16 h-12 mx-auto mb-4" />
            <p className="text-[10px] uppercase font-bold text-gray-400 truncate">{item.dname}</p>
            <p className="text-yellow-600 font-bold">{item.cost} G</p>
          </div>
        ))}
      </div>
    </main>
  );
}