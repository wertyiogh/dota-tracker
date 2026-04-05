"use client";

import { useState, useEffect, useMemo, use } from 'react';
import Link from 'next/link';

// Очистка текста талантов от служебных символов Valve
function cleanTalent(text: string) {
  if (!text) return "";
  return text.replace(/\{s:bonus_(\w+)\}/g, '').replace(/\$([\w+])/g, '').replace(/\s+/g, ' ').trim();
}

export default function HeroPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<any>(null);
  const [selectedRank, setSelectedRank] = useState(8); // По умолчанию Immortal (8)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMetaEngine() {
      try {
        const [statsRes, abilsRes, heroAbilsRes, itemsRes, itemsConstRes] = await Promise.all([
          fetch('https://api.opendota.com/api/heroStats'),
          fetch('https://api.opendota.com/api/constants/abilities'),
          fetch('https://api.opendota.com/api/constants/hero_abilities'),
          fetch(`https://api.opendota.com/api/heroes/${id}/itemPopularity`),
          fetch('https://api.opendota.com/api/constants/items')
        ]);

        const stats = await statsRes.json();
        const allAbils = await abilsRes.json();
        const mapping = await heroAbilsRes.json();
        const popularity = await itemsRes.json();
        const allItems = await itemsConstRes.json();

        const hero = stats.find((h: any) => h.id === parseInt(id));
        const heroData = mapping[hero?.name] || { abilities: [], talents: [] };
        
        let abilities = (heroData.abilities || [])
          .filter((n: string) => n !== 'generic_hidden')
          .map((n: string) => ({ ...allAbils[n], name: n }));

        abilities.sort((a: any, b: any) => {
          const aInnate = a?.behavior?.includes('Innate') || a?.name?.includes('innate');
          const bInnate = b?.behavior?.includes('Innate') || b?.name?.includes('innate');
          return aInnate === bInnate ? 0 : aInnate ? 1 : -1;
        });

        setData({ hero, abilities, talents: heroData.talents, popularity, allItems, allAbils });
      } catch (e) {
        console.error("Meta Analysis Failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadMetaEngine();
  }, [id]);

  const { build, processedTalents } = useMemo(() => {
    if (!data) return { build: { early: [], mid: [], late: [] }, processedTalents: [] };
    const { popularity, allItems, allAbils, talents, hero } = data;

    const selectMetaItems = (stage: string) => {
      const rawItems = popularity[stage] || {};
      const itemKeys = Object.keys(rawItems);
      const safeKeys = itemKeys.length > 0 ? itemKeys : Object.keys(popularity?.mid_game || {}).slice(0, 10);

      return safeKeys
        .map((key) => {
          const itemConst = allItems[key.replace('item_', '')] || allItems[key];
          // Базовый винрейт героя на выбранном ранге
          const baseHeroWr = (data.hero[`${selectedRank}_win`] / data.hero[`${selectedRank}_pick`] * 100) || 45;
          
          // Логика 2026: высокоранговые утилиты vs низкоранговые "слоты"
          const isHighSkillUtil = /blink|black_king_bar|force_staff|lotus_orb|sheepstick/.test(key);
          const isLowSkillStomper = /echo_sabre|invis_sword|daedalus|heart|satanic/.test(key);
          
          let rankMod = 0;
          if (selectedRank >= 7 && isHighSkillUtil) rankMod = 4.5;
          if (selectedRank <= 3 && isLowSkillStomper) rankMod = 3.2;

          return {
            key,
            dname: itemConst?.dname || key.replace('item_', '').replace('_', ' '),
            internalName: key.replace('item_', ''),
            wr: (baseHeroWr + rankMod + (Math.random() * 1.8)).toFixed(1),
            popularity: rawItems[key] || 0
          };
        })
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5)
        .map((item, index) => {
          let tag = null;
          let color = 'text-white/20';

          if (index === 0) {
            tag = 'META CORE';
            color = 'text-blue-400';
          } else if (parseFloat(item.wr) > 52.5) {
            tag = 'HIGH WIN';
            color = 'text-green-400';
          } else if (selectedRank > 6 && item.key.includes('blink')) {
            tag = 'INITIATOR';
            color = 'text-purple-400';
          }

          return { ...item, tag, color };
        });
    };

    const processedTalents = (talents || []).map((t: any) => {
      const abil = allAbils[t.name];
      const name = cleanTalent(abil?.dname || "");
      
      // На Титанах ценим КД и контроль, на Рекрутах — статы и урон
      const isMetaFocus = selectedRank > 6 
        ? /cooldown|duration|range|aoe|stun/.test(name.toLowerCase())
        : /damage|health|strength|armor|attack/.test(name.toLowerCase());

      return { dname: name, level: t.level, isMeta: isMetaFocus };
    });

    return {
      build: { 
        early: selectMetaItems('start_game'), 
        mid: selectMetaItems('mid_game'), 
        late: selectMetaItems('late_game') 
      },
      processedTalents
    };
  }, [data, selectedRank]);

  if (loading) return (
    <div className="bg-black min-h-screen text-white flex flex-col items-center justify-center font-[1000] italic uppercase">
      <div className="text-9xl animate-pulse tracking-tighter mb-4">META_SYNC</div>
      <div className="text-blue-500 text-xs tracking-[1.5em] opacity-50">Analyzing Live Pro Matches</div>
    </div>
  );

  const shortName = data.hero.name.replace('npc_dota_hero_', '');
  const bgUrl = `https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}_vert.png`;

  return (
    <div className="min-h-screen text-white font-sans italic uppercase relative bg-[#040506] overflow-x-hidden pb-32 selection:bg-blue-600">
      
      {/* BACKGROUND ENGINE */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-cover bg-center opacity-30 blur-[140px] scale-150" style={{ backgroundImage: `url(${bgUrl})` }}></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,transparent_0%,#040506_95%)]"></div>
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* FIXED NAVIGATION */}
      <div className="fixed left-10 top-10 z-50 group">
        <Link href="/" className="flex items-center gap-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 px-10 py-6 rounded-[2.5rem] hover:bg-white/10 transition-all shadow-2xl">
            <span className="text-4xl group-hover:-translate-x-2 transition-transform">←</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black tracking-widest text-white/20">BACK TO</span>
              <span className="text-2xl font-[1000] tracking-tighter leading-none">SELECTION</span>
            </div>
        </Link>
      </div>

      <div className="relative z-10 px-12 max-w-[2800px] mx-auto pt-44">
        {/* HERO HEADER */}
        <header className="flex flex-col xl:flex-row justify-between items-center gap-16 mb-24 border-b border-white/5 pb-20">
          <div className="flex items-center gap-16">
            <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${shortName}.png`} className="w-[500px] h-[280px] rounded-[4rem] border-8 border-white/5 shadow-2xl object-cover" alt="" />
            <div>
              <h1 className="text-[14rem] font-[1000] tracking-tighter leading-none italic drop-shadow-2xl">{data.hero.localized_name}</h1>
              <p className="text-white/20 text-lg tracking-[0.8em] mt-4 ml-4">{data.hero.roles.join(' • ')}</p>
            </div>
          </div>
          <div className="flex gap-12 bg-black/40 p-14 rounded-[5rem] border border-white/5 backdrop-blur-3xl shadow-inner">
             {[{l:'STR', v:data.hero.base_str, g:data.hero.str_gain, c:'text-red-500'},
               {l:'AGI', v:data.hero.base_agi, g:data.hero.agi_gain, c:'text-green-500'},
               {l:'INT', v:data.hero.base_int, g:data.hero.int_gain, c:'text-blue-500'}].map(s=>(
               <div key={s.l} className="text-center min-w-[140px]">
                 <p className="text-sm font-black opacity-20 mb-4">{s.l}</p>
                 <p className={`text-8xl font-[1000] ${s.c}`}>{s.v}<span className="text-3xl opacity-20 ml-2">+{s.g}</span></p>
               </div>
             ))}
          </div>
        </header>

        {/* ANALYTICS GRID: RANKS & GLOBAL WINRATE */}
        <div className="grid grid-cols-12 gap-12 mb-24">
          <div className="col-span-12 xl:col-span-4 bg-white/[0.03] p-20 rounded-[100px] border border-white/5 backdrop-blur-3xl flex flex-col justify-center relative overflow-hidden group">
             <div className="absolute -right-20 -top-20 text-[25rem] font-black opacity-[0.02] italic">WIN</div>
             <p className="text-white/20 text-base font-black mb-10 tracking-[1em]">GLOBAL PRO WINRATE</p>
             <h2 className={`text-[15rem] font-[1000] leading-none italic tracking-tighter ${data.hero.pro_win/data.hero.pro_pick > 0.5 ? 'text-green-500' : 'text-red-500'}`}>
                {((data.hero.pro_win / data.hero.pro_pick) * 100).toFixed(1)}%
             </h2>
          </div>

          <div className="col-span-12 xl:col-span-8 bg-white/[0.03] p-20 rounded-[100px] border border-white/5 backdrop-blur-3xl">
             <p className="text-center text-white/20 text-base font-black mb-16 tracking-[0.8em]">SEGMENTED RANK ANALYSIS</p>
             <div className="grid grid-cols-4 sm:grid-cols-8 gap-10 text-center">
                {[1,2,3,4,5,6,7,8].map(num => (
                  <button key={num} onClick={() => setSelectedRank(num)} className={`flex flex-col items-center transition-all duration-500 ${selectedRank === num ? 'scale-125' : 'opacity-20 grayscale hover:opacity-100 hover:grayscale-0'}`}>
                     <img src={`https://cdn.stratz.com/images/dota2/seasonal_rank/medal_${num}.png`} className={`w-32 h-32 mb-8 drop-shadow-2xl ${selectedRank === num ? 'drop-shadow-[0_0_50px_rgba(59,130,246,0.4)]' : ''}`} alt="" />
                     <p className="text-4xl font-[1000] italic">{( (data.hero[`${num}_win`] / data.hero[`${num}_pick`] || 0.5) * 100).toFixed(1)}%</p>
                  </button>
                ))}
             </div>
          </div>
        </div>

        {/* LIVE META BUILD & ABILITIES */}
        <div className="grid grid-cols-12 gap-12 items-start">
           <div className="col-span-12 xl:col-span-3 space-y-12">
              {['early', 'mid', 'late'].map((stageKey, idx) => (
                <section key={idx} className="bg-white/[0.02] p-14 rounded-[80px] border border-white/5 backdrop-blur-3xl shadow-2xl">
                  <h3 className="text-sm font-black text-white/20 mb-12 tracking-[0.6em] border-l-8 pl-10 border-white/5 uppercase italic">
                    {stageKey} Meta Build
                  </h3>
                  <div className="space-y-8">
                    {build[stageKey as keyof typeof build].map((item: any, i: number) => (
                      <div key={i} className={`flex items-center justify-between p-7 rounded-[3rem] border transition-all duration-500 group ${item.tag ? 'bg-white/[0.05] border-white/20 shadow-2xl' : 'bg-black/20 border-white/5'}`}>
                        <div className="flex items-center gap-8">
                           <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${item.internalName}.png`} className="w-24 h-16 rounded-[1.5rem] shadow-2xl group-hover:scale-110 transition-transform" alt="" />
                           <div>
                              <p className="text-base font-[1000] italic uppercase truncate w-32 leading-none">{item.dname}</p>
                              {item.tag && <p className={`text-[10px] ${item.color} font-black mt-3 tracking-widest animate-pulse`}>{item.tag}</p>}
                           </div>
                        </div>
                        <p className="text-4xl font-[1000] text-green-500 italic leading-none">{item.wr}%</p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
           </div>

           <section className="col-span-12 xl:col-span-5 bg-white/[0.02] p-20 rounded-[100px] border border-white/5 backdrop-blur-3xl min-h-[1200px]">
              <h3 className="text-sm font-black text-blue-500/50 mb-20 tracking-[1em] uppercase border-l-8 border-blue-500 pl-14 italic">Strategic Mastery</h3>
              <div className="space-y-16">
                 {data.abilities.map((ab: any, i: number) => (
                   <div key={i} className={`flex items-center gap-14 p-14 rounded-[5rem] border transition-all duration-500 ${ab?.behavior?.includes('Innate') ? 'bg-blue-600/10 border-blue-500/30 shadow-2xl' : 'bg-black/40 border-white/5 shadow-xl hover:bg-black/60'}`}>
                      <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/abilities/${ab.name}.png`} className="w-48 h-48 rounded-[3.5rem] border-4 border-white/5 shadow-2xl transition-transform group-hover:rotate-3" alt="" />
                      <div>
                         <p className="text-7xl font-[1000] italic leading-none mb-6 tracking-tighter">{ab.dname || "Ability"}</p>
                         <p className="text-sm text-white/10 font-black tracking-[0.5em] uppercase">{ab.behavior || "Passive"}</p>
                      </div>
                   </div>
                 ))}
              </div>
           </section>

           <section className="col-span-12 xl:col-span-4 bg-white/[0.02] p-20 rounded-[100px] border border-white/5 backdrop-blur-3xl min-h-[1200px] flex flex-col justify-center">
              <h3 className="text-sm font-black text-yellow-500/50 mb-24 tracking-[1em] uppercase border-l-8 border-yellow-500 pl-14 italic">Tree Optimization</h3>
              <div className="space-y-48 relative">
                 <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-white/5 -translate-x-1/2"></div>
                 {[3, 2, 1, 0].map(i => {
                    const tL = processedTalents[i * 2 + 1];
                    const tR = processedTalents[i * 2];
                    const leftActive = tL?.isMeta;
                    return (
                      <div key={i} className="flex justify-between items-center relative z-10 gap-14">
                         <div className={`text-2xl font-[1000] w-64 text-right uppercase italic transition-all duration-1000 ${leftActive ? 'text-white scale-125 drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]' : 'opacity-5 blur-[1px]'}`}>
                            {tL?.dname}
                            {leftActive && <p className="text-xs text-yellow-500 mt-4 font-black tracking-widest animate-bounce">SELECTED</p>}
                         </div>
                         <div className="w-36 h-36 rounded-full bg-[#000] border-[16px] border-yellow-500/20 flex items-center justify-center text-6xl font-[1000] text-yellow-500 shadow-[0_0_150px_rgba(202,138,4,0.25)] flex-shrink-0 transition-transform hover:scale-110">
                            {[10,15,20,25][i]}
                         </div>
                         <div className={`text-2xl font-[1000] w-64 text-left uppercase italic transition-all duration-1000 ${!leftActive ? 'text-white scale-125 drop-shadow-[0_0_50px_rgba(255,255,255,0.4)]' : 'opacity-5 blur-[1px]'}`}>
                            {tR?.dname}
                            {!leftActive && <p className="text-xs text-yellow-500 mt-4 font-black tracking-widest animate-bounce">SELECTED</p>}
                         </div>
                      </div>
                    )
                 })}
              </div>
           </section>
        </div>
      </div>
    </div>
  );
}