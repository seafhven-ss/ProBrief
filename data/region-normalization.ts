/**
 * 地区归一化映射表
 */

export const REGION_MAP: Record<string, string> = {
  "苏州": "江苏",
  "无锡": "江苏",
  "南京": "江苏",
  "常州": "江苏",
  "江苏": "江苏",
  "杭州": "浙江",
  "宁波": "浙江",
  "浙江": "浙江",
  "上海": "上海",
  "安徽": "安徽",
  "江西": "江西",
  "Wuxi": "江苏",
  "wuxi": "江苏",
  "Suzhou": "江苏",
  "suzhou": "江苏",
  "Hangzhou": "浙江",
  "hangzhou": "浙江",
};

export function extractRegions(text: string): string[] {
  const found = new Set<string>();
  for (const [city, province] of Object.entries(REGION_MAP)) {
    if (text.includes(city)) {
      found.add(province);
    }
  }
  return [...found];
}
