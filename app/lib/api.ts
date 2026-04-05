export async function getHeroStats(heroId: number) {
  // Тянем общую статистику (винрейты, роли, статы)
  const res = await fetch('https://api.opendota.com/api/heroStats', { next: { revalidate: 3600 } });
  const stats = await res.json();
  
  // Ищем нашего героя по ID
  const hero = stats.find((h: any) => h.id === heroId);
  
  return hero;
}

export async function getHeroAbilities(heroName: string) {
    // В OpenDota способности лежат отдельно. 
    // Для простоты пока возьмем базовый список героев с константами
    const res = await fetch('https://api.opendota.com/api/constants/hero_abilities');
    const abilities = await res.json();
    return abilities[heroName] || {};
}