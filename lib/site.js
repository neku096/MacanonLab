export const SITE = {
  name: "macanon",
  title: "macanon",
  description: "VRChat向け3D衣装・ギミック制作サイトです。",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://macanon-lab.macanon-vrc.workers.dev",
  boothUrl: "https://macanon.booth.pm/",
  xUrl: "https://x.com/MaCANoN_"
};

export function getSiteOrigin() {
  return SITE.url.replace(/\/+$/, "");
}

export function getSiteUrl(path = "/") {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return normalizedPath === "/" ? `${getSiteOrigin()}/` : `${getSiteOrigin()}${normalizedPath}`;
}

export const CATEGORY_LABELS = {
  clothing: "衣装",
  gimmick: "ギミック",
  "world-gimmick": "ワールドギミック",
  accessory: "装飾品",
  avatar: "3Dモデル"
};

export const SUBTAG_LABELS = {
  "summon-gimmick": "召喚ギミック",
  "character-lumina": "LUMINA",
  "character-shinano": "しなの",
  "character-milltina": "ミルティナ",
  "character-kipfel": "キプフェル",
  "character-manuka": "マヌカ",
  "character-selestia": "セレスティア",
  "character-shinra": "森羅",
  "character-chocolat": "ショコラ",
  "character-milfy": "ミルフィ",
  "character-rurune": "ルルネ",
  "character-sio": "しお",
  "character-shiratsume": "しらつめ",
  "chair-gimmick": "椅子ギミック",
  halo: "ヘイロー",
  mask: "マスク"
};

export const AVATAR_SUBTAGS = Object.keys(SUBTAG_LABELS).filter((tag) =>
  tag.startsWith("character-")
);

export function getTagLabel(tag) {
  return CATEGORY_LABELS[tag] || SUBTAG_LABELS[tag] || tag;
}
