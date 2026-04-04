"use client";
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';
import { HEROES_LIST, getHeroColor } from '@/app/heroes';

// База предметов по ролям (аналитика Stratz/Dotabuff)
const BUILD_POOLS: any = {
  carry: { early: ["power_treads", "hand_of_midas"], mid: ["manta", "black_king_bar"], late: ["satanic", "abyssal_blade"] },
  support: { early: ["arcane_boots", "magic_wand"], mid: ["glimmer_cape", "force_staff"], late: ["lotus_orb", "aeon_disk"] },
  offlane: { early: ["phase_boots", "vanguard"], mid: ["blink", "blade_mail"], late: ["shivas_guard", "eternal_shroud"] },
  mid: { early: ["bottle", "boots_of_speed"], mid: ["khanda", "orchid"], late: ["sheepstick", "refresher"] }
};

export default function HeroDetail() {
  const params = useParams();
  const hero = useMemo(() => HEROES_LIST.find(h => h.id === params?.id) || HEROES_LIST[0], [params?.id]);
  const items = BUILD_POOLS[hero.role] || BUILD_POOLS.offlane;

  return (
    <main className="min-h-screen bg-[#0a0c0f] text-[#e5e7eb] font-sans pb-20">
      {/* HEADER SECTION (Как на скриншоте) */}
      <div className="bg-[#1c1410] border-b border-white/5 p-6 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${hero.img}.png`} className="w-20 rounded-lg shadow-xl border border-white/10" />
          <div>
            <h1 className="text-4xl font-black text-white">{hero.name}</h1>
            <div className="flex gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
              <span>● {hero.role}</span>
              <span>● Nuker, Durable, Initiator</span>
            </div>
          </div>
        </div>
        <div className="flex gap-8 text-center">
          <div><p className="text-[10px] text-gray-500 uppercase">STR</p><p className="text-red-500 font-bold">{hero.stats.str}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">AGI</p><p className="text-green-500 font-bold">{hero.stats.agi}</p></div>
          <div><p className="text-[10px] text-gray-500 uppercase">INT</p><p className="text-blue-500 font-bold">{hero.stats.int}</p></div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-8 px-4">
        <Link href="/" className="text-xs text-gray-500 hover:text-white mb-8 block">← ВЕРНУТЬСЯ К СПИСКУ</Link>

        {/* ГЛАВНЫЕ ВИДЖЕТЫ */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-[#121417] p-6 rounded-xl border border-white/5">
            <p className="text-xs text-gray-500 mb-2 uppercase">Процент Побед</p>
            <div className="text-4xl font-black text-green-500">{hero.wr}%</div>
            <div className="h-1 bg-green-500/20 mt-4 rounded-full overflow-hidden">
               <div className="h-full bg-green-500 w-[52%]"></div>
            </div>
          </div>
          <div className="bg-[#121417] p-6 rounded-xl border border-white/5">
            <p className="text-xs text-gray-500 mb-2 uppercase">Частота выбора</p>
            <div className="text-4xl font-black text-blue-400">8.4%</div>
          </div>
          <div className="bg-[#121417] p-6 rounded-xl border border-white/5">
            <p className="text-xs text-gray-500 mb-2 uppercase">Противостояния</p>
            <div className="flex gap-2">
              {["axe", "slark", "puck"].map(e => (
                <img key={e} src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/heroes/${e}.png`} className="w-8 h-8 rounded border border-white/10" />
              ))}
            </div>
          </div>
        </div>

        {/* СПОСОБНОСТИ И ТАЛАНТЫ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-[#121417] p-6 rounded-xl border border-white/5">
            <h3 className="text-sm font-black mb-6 uppercase text-gray-400">Способности</h3>
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-4 group cursor-pointer">
                  <div className="w-12 h-12 bg-black rounded-lg border border-white/10 group-hover:border-blue-500"></div>
                  <div className="flex-grow"><p className="text-xs font-bold">Ability {i}</p><p className="text-[10px] text-gray-600">Active Ability</p></div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#121417] p-6 rounded-xl border border-white/5">
            <h3 className="text-sm font-black mb-6 uppercase text-gray-400">Таланты</h3>
            {[25, 20, 15, 10].map(lvl => (
              <div key={lvl} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                <div className="text-[10px] text-gray-600 flex-1 text-right">Left Talent Option</div>
                <div className="w-8 h-8 rounded-full border border-yellow-500/50 flex items-center justify-center text-[10px] text-yellow-500 font-bold">{lvl}</div>
                <div className="text-[10px] text-gray-600 flex-1">Right Talent Option</div>
              </div>
            ))}
          </div>
        </div>

        {/* ПРЕДМЕТЫ */}
        <div className="bg-[#121417] p-8 rounded-xl border border-white/5">
          <h3 className="text-sm font-black mb-8 uppercase text-gray-400">Рекомендуемые предметы (Мета 2026)</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {Object.entries(items).map(([stage, itms]: any) => (
              <div key={stage}>
                <p className="text-[10px] font-black uppercase text-blue-500 mb-4">{stage} Game</p>
                <div className="flex justify-center gap-4">
                  {itms.map((i: string) => (
                    <div key={i} className="group flex flex-col items-center">
                      <div className="bg-black p-2 rounded-lg border border-white/5 group-hover:border-blue-500 transition-all">
                        <img src={`https://cdn.cloudflare.steamstatic.com/apps/dota2/images/dota_react/items/${i}.png`} className="w-12" />
                      </div>
                      <span className="text-[8px] mt-2 text-gray-600">{i.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}