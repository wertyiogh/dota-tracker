"use client";

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { HEROES_LIST, Hero, getHeroColor } from '@/app/heroes';

const RANKS = [
  { id: '1', name: 'Herald', img: 'https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_1.png' },
  { id: '4', name: 'Archon', img: 'https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_4.png' },
  { id: '8', name: 'Immortal', img: 'https://www.opendota.com/assets/images/dota2/rank_icons/rank_star_8.png' },
];

// Актуальные сборки Meta 2026
const ITEM_POOLS: any = {
  carry: {
    starting: [{name: "Tango", img: "tango", cost: 90}, {name: "Quelling", img: "quelling_blade", cost: 100}],
    early: [{name: "Power Treads", img: "power_treads", cost: 1400}],
    mid: [{name: "Manta Style", img: "manta", cost: 4600}, {name: "BKB", img: "black_king_bar", cost: 4050}],
    late: [{name: "Satanic", img: "satanic", cost: 5050}, {name: "Abyssal", img: "abyssal_blade", cost: 6250}]
  },
  mid: {
    starting: [{name: "Tango", img: "tango", cost: 90}, {name: "Bottle", img: "bottle", cost: 675}],
    early: [{name: "Boots of Travel", img: "travel_boots", cost: 2500}],
    mid: [{name: "Witch Blade", img: "witch_blade", cost: 2600}, {name: "Blink", img: "blink", cost: 2250}],
    late: [{name: "Scythe of Vyse", img: "sheepstick", cost: 5550}, {name: "Khanda", img: "khanda", cost: 5000}]
  },
  offlane: {
    starting: [{name: "Tango", img: "tango", cost: 90}, {name: "Bracer", img: "bracer", cost: 505}],
    early: [{name: "Phase Boots", img: "phase_boots", cost: 1500}, {name: "Vanguard", img: "vanguard", cost: 1700}],
    mid: [{name: "Blink", img: "blink", cost: 2250}, {name: "Blade Mail", img: "blade_mail", cost: 2100}],
    late: [{name: "Shiva's Guard", img: "shivas_guard", cost: 4850}, {name: "Eternal Shroud", img: "eternal_shroud", cost: 3100}]
  },
  support: {
    starting: [{name: "Tango", img: "tango", cost: 90}, {name: "Blood Grenade", img: "blood_grenade", cost: 50}],
    early: [{name: "Arcane Boots", img: "arcane_boots", cost: 1300}, {name: "Magic Wand", img: "magic_wand", cost: 450}],
    mid: [{name: "Force Staff", img: "force_staff", cost: 2200}, {name: "Glimmer", img: "glimmer_cape", cost: 2150}],
    late: [{name: "Lotus Orb", img: "lotus_orb", cost: 3850}, {name: "Aether Lens", img: "aether_lens", cost: 2275}]
  }
};

export default function HeroDetail() {
  const params = useParams();
  const [selectedRank, setSelectedRank] = useState('8');
  
  const hero = HEROES_LIST.find(h => h.id === params.id) as Hero;
  if (!hero) return null;

  const heroColor = getHeroColor(hero);
  const rolePool = ITEM_POOLS[hero.role] || ITEM_POOLS.offlane;

  const getRankBuild = (stage: string) => {
    let items = [...rolePool[stage]];
    if (Number(selectedRank) < 4 && stage === 'mid') {
        items[0] = {name: "Dagon", img: "dagon", cost: 2700};
    }
    return items;
  };

  return (
    <main className="min-h-screen bg-[#020406] text-white font-sans relative overflow-hidden">
      
      {/* УНИКАЛЬНЫЙ ФОН ГЕРОЯ */}
      <div className={`absolute top-0 left-0 w-full h-[700px] bg-gradient-to-b ${heroColor} to-transparent opacity-70 z-0`}></div>
      
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 bg-white/5 border border-white/10 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-white/10 transition-all mb-12 shadow-2xl">
          ← ВЫБОР ГЕРОЯ
        </Link>

        {/* ПАНЕЛЬ РАНГОВ */}
        <div className="flex gap-4 mb-16 overflow-x-auto p-6 bg-black/40 backdrop-blur-3xl rounded-[40px] border border-white/5 shadow-2xl no-scrollbar">
          {RANKS.map(r => (
            <button key={r.id} onClick={() => setSelectedRank(r.id)} className={`flex flex-col items-center gap-3 p-4 min-w-[130px] rounded-[30px] border-2 transition-all ${selectedRank === r.id ? 'border-blue-500 bg-blue-600/20 scale-110 shadow-[0_0_30px_#3b82f644]' : 'border-transparent opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}>
              <img src={r.img} className="w-14 h-14" />
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{r.name}</span>
            </button>
          ))}
        </div>

        {/* КАРТОЧКА ГЕРОЯ (ЦВЕТОВАЯ) */}
        <div className="flex flex-col md:flex-row items-center gap-12 mb-16 bg-white/5 backdrop-blur-2xl p-12 rounded-[60px] border border-white/10 shadow-3xl relative">
          <div className="absolute right-[-5%] top-[-10%] text-[280px] font-black italic text-white/5 uppercase select-none tracking-tighter leading-none">{hero.name}</div>
          <div className="relative w-80 h-48 rounded-[40px] border-4 border-white shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden z-10">
              <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.img}.png`} className="w-full h-full object-cover" alt={hero.name} />
          </div>
          <div className="text-center md:text-left z-10">
            <h1 className="text-7xl md:text-9xl font-black italic uppercase tracking-tighter leading-none mb-6 drop-shadow-2xl">{hero.name}</h1>
            <div className="flex gap-6 justify-center md:justify-start">
                <div className="bg-black/60 px-8 py-3 rounded-full border border-white/10 font-black text-green-400 text-2xl italic tracking-tighter">{hero.wr}% WR</div>
                <div className="bg-black/60 px-8 py-3 rounded-full border border-white/10 font-black text-blue-400 text-2xl italic tracking-tighter uppercase">{hero.role}</div>
            </div>
          </div>
        </div>

        {/* ТАБЛИЦА ЗАКУПА */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[60px] overflow-hidden shadow-2xl">
          {['starting', 'early', 'mid', 'late'].map((stage) => (
            <div key={stage} className="border-b border-white/10 p-12 flex flex-col md:flex-row justify-between items-center group hover:bg-white/[0.03] transition-colors">
              <div className="text-5xl font-black italic uppercase text-blue-600 mb-8 md:mb-0 tracking-tighter group-hover:text-blue-400 transition-colors">{stage}</div>
              <div className="flex flex-wrap justify-center gap-8">
                {getRankBuild(stage).map((item: any, i: number) => (
                  <div key={i} className="flex flex-col items-center group/item scale-110">
                    <div className="bg-black p-3 rounded-2xl border-2 border-white/10 group-hover/item:border-blue-500 transition-all shadow-xl">
                        <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${item.img}.png`} className="w-20 h-14 object-contain" />
                    </div>
                    <span className="text-[10px] font-black uppercase text-gray-500 mt-3 tracking-tighter group-hover/item:text-white transition-colors">{item.name}</span>
                  </div>
                ))}
              </div>
              <div className="text-4xl font-black text-yellow-500 italic mt-8 md:mt-0 drop-shadow-[0_0_15px_#eab30844]">
                {getRankBuild(stage).reduce((acc: number, item: any) => acc + item.cost, 0)} G
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}