"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Hero {
  id: number;
  localized_name: string;
  name: string;
  img: string;
  "8_pick": number;
  "8_win": number;
}

export default function DotaPage() {
  const [heroes, setHeroes] = useState<Hero[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("loading"); // loading, success, error

  useEffect(() => {
    const fetchData = async () => {
      // 1. Проверяем, есть ли данные в кэше браузера
      const cached = localStorage.getItem('dota_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        setHeroes(parsed);
        setStatus("success");
      }

      try {
        // 2. Пытаемся обновить данные из API
        const res = await fetch(`https://api.opendota.com/api/heroStats`);
        
        if (!res.ok) {
          // Если API выдало ошибку (бан), но у нас есть кэш — просто работаем на кэше
          if (cached) return; 
          throw new Error("API Limit");
        }
        
        const data = await res.json();
        
        if (Array.isArray(data) && data.length > 0) {
          setHeroes(data);
          setStatus("success");
          // Сохраняем свежие данные в кэш
          localStorage.setItem('dota_cache', JSON.stringify(data));
        }
      } catch (error) {
        console.error("Ошибка запроса:", error);
        if (!cached) setStatus("error");
      }
    };

    fetchData();
  }, []);

  // Безопасная фильтрация
  const filtered = Array.isArray(heroes) 
    ? heroes.filter(h => h.localized_name?.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <main className="min-h-screen bg-[#0b0e11] text-white p-6 md:p-10 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Шапка */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-black text-red-600 tracking-tighter italic uppercase drop-shadow-md">
            Dota 2 Meta
          </h1>
          <p className="text-gray-500 mt-2 uppercase tracking-[0.5em] text-[10px] font-bold">
            Immortal Rank Statistics
          </p>
        </div>
        
        {/* Поиск */}
        <div className="max-w-md mx-auto mb-16 relative">
          <input 
            className="w-full p-4 bg-[#1c242d] border border-gray-800 rounded-2xl focus:border-red-600 outline-none transition-all shadow-2xl text-white placeholder:text-gray-600"
            placeholder="Поиск героя..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="absolute right-4 top-4 text-gray-800 font-bold text-[10px] uppercase">Search</div>
        </div>

        {/* Состояния загрузки и ошибок */}
        {status === "loading" && !heroes.length && (
          <div className="text-center py-20 animate-pulse text-red-600 font-black uppercase tracking-widest">
            Connecting to Valve...
          </div>
        )}

        {status === "error" && !heroes.length && (
          <div className="text-center py-20 border border-dashed border-red-900 rounded-3xl bg-red-950/10">
            <p className="text-red-500 font-bold uppercase mb-4">API OpenDota временно недоступен</p>
            <p className="text-gray-500 text-xs mb-6 px-10">Подождите 10-15 минут, Valve ограничили доступ к данным из-за частых запросов.</p>
            <button onClick={() => window.location.reload()} className="bg-red-600 px-8 py-3 rounded-full font-bold hover:bg-red-700 transition-all uppercase text-xs">
              Обновить страницу
            </button>
          </div>
        )}

        {/* Сетка героев (показывается, если есть данные в стейте или кэше) */}
        {(heroes.length > 0) && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
              {filtered.map(hero => {
                const winrate = hero["8_pick"] > 0 
                  ? ((hero["8_win"] / hero["8_pick"]) * 100).toFixed(1) 
                  : "0.0";
                
                return (
                  <Link href={`/hero/${hero.id}`} key={hero.id} className="block">
                    <div className="bg-[#1c242d] rounded-2xl overflow-hidden border border-gray-800 hover:border-red-500 hover:scale-105 transition-all duration-300 shadow-lg group">
                      <div className="relative h-28 overflow-hidden">
                        <img 
                          src={`https://api.opendota.com${hero.img}`} 
                          className="w-full h-full object-cover group-hover:brightness-125 transition-all" 
                          alt={hero.localized_name} 
                        />
                      </div>
                      <div className="p-4 text-center">
                        <h2 className="font-bold text-[11px] uppercase mb-1 truncate tracking-tight text-gray-300">
                          {hero.localized_name}
                        </h2>
                        <div className={`text-xl font-black ${Number(winrate) >= 50 ? 'text-green-500' : 'text-red-500'}`}>
                          {winrate}%
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-gray-600 mt-10 font-bold uppercase tracking-widest text-sm">
                Герой "{search}" не найден
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
}