// 全102種類のお魚マスターデータ
export const FishMaster = [
    // === Secret Rare (2種) : 売却額 50000 ===
    { id: 'F_SEC01', name: 'モササウルス', rarity: 'Secret', emoji: '🦖', sellPrice: 50000, desc: '白亜紀の海の覇者。圧倒的な力を持つ水生爬虫類。' },
    { id: 'F_SEC02', name: 'プレシオサウルス', rarity: 'Secret', emoji: '🦕', sellPrice: 50000, desc: '長い首が特徴の首長竜。優雅に古代の海を泳ぐ。' },

    // === Ultra Rare (5種) : 売却額 10000 ===
    { id: 'F_UR01', name: 'ジンベエザメ', rarity: 'Ultra', emoji: '🦈', sellPrice: 10000, desc: '世界最大の魚類。巨体に似合わず性格はとても温厚。' },
    { id: 'F_UR02', name: 'シロナガスクジラ', rarity: 'Ultra', emoji: '🐋', sellPrice: 10000, desc: '地球上で最大の動物。海を震わせる声で鳴く。' },
    { id: 'F_UR03', name: 'リュウグウノツカイ', rarity: 'Ultra', emoji: '🐉', sellPrice: 10000, desc: '神秘的な深海魚。生きた化石とも呼ばれる伝説の存在。' },
    { id: 'F_UR04', name: 'ホホジロザメ', rarity: 'Ultra', emoji: '🦈', sellPrice: 10000, desc: '海の恐るべきハンター。鋭い牙で獲物を逃がさない。' },
    { id: 'F_UR05', name: 'シャチ', rarity: 'Ultra', emoji: '🐬', sellPrice: 10000, desc: '海のギャング。非常に高い知能と狩りの技術を持つ。' },

    // === Super Rare (15種) : 売却額 2000 ===
    { id: 'F_SR01', name: 'イルカ', rarity: 'SuperRare', emoji: '🐬', sellPrice: 2000, desc: '人懐っこい海の人気者。群れでジャンプする。' },
    { id: 'F_SR02', name: 'オニイトマキエイ', rarity: 'SuperRare', emoji: '🦅', sellPrice: 2000, desc: '巨大なマンタ。海空を飛ぶように泳ぐ。' },
    { id: 'F_SR03', name: 'ウミガメ', rarity: 'SuperRare', emoji: '🐢', sellPrice: 2000, desc: '長寿の象徴。ゆったりと海流に乗って旅をする。' },
    { id: 'F_SR04', name: 'チョウチンアンコウ', rarity: 'SuperRare', emoji: '🏮', sellPrice: 2000, desc: '頭の発光器で獲物をおびき寄せる深海の悪魔。' },
    { id: 'F_SR05', name: 'ダイオウイカ', rarity: 'SuperRare', emoji: '🦑', sellPrice: 2000, desc: '深海に潜む伝説の巨大イカ。マッコウクジラと戦う。' },
    { id: 'F_SR06', name: 'シーラカンス', rarity: 'SuperRare', emoji: '🐟', sellPrice: 2000, desc: '数億年前から姿を変えていない「生きた化石」。' },
    { id: 'F_SR07', name: 'アジアアロワナ', rarity: 'SuperRare', emoji: '🐠', sellPrice: 2000, desc: '龍魚と呼ばれる。黄金に輝く鱗が富の象徴とされる。' },
    { id: 'F_SR08', name: 'ピラルク', rarity: 'SuperRare', emoji: '🐟', sellPrice: 2000, desc: 'アマゾン川に生息する世界最大級の淡水魚。' },
    { id: 'F_SR09', name: 'ベルーガ', rarity: 'SuperRare', emoji: '🐋', sellPrice: 2000, desc: 'シロイルカ。「海のカナリア」と呼ばれる美しい鳴き声。' },
    { id: 'F_SR10', name: 'シュモクザメ', rarity: 'SuperRare', emoji: '🦈', sellPrice: 2000, desc: 'ハンマー型の頭を持つ奇妙なサメ。視野が広い。' },
    { id: 'F_SR11', name: 'ノコギリエイ', rarity: 'SuperRare', emoji: '🦈', sellPrice: 2000, desc: 'ノコギリのような吻（ふん）を持つエイの仲間。' },
    { id: 'F_SR12', name: 'ラッコ', rarity: 'SuperRare', emoji: '🦦', sellPrice: 2000, desc: 'お腹の上で貝を割る愛らしい仕草が人気。' },
    { id: 'F_SR13', name: 'ダイオウグソクムシ', rarity: 'SuperRare', emoji: '🪲', sellPrice: 2000, desc: '深海の掃除屋。何年も絶食して生きられる。' },
    { id: 'F_SR14', name: 'マッコウクジラ', rarity: 'SuperRare', emoji: '🐳', sellPrice: 2000, desc: '巨大な頭部を持つハクジラ。深海まで潜水できる。' },
    { id: 'F_SR15', name: 'クリオネ', rarity: 'SuperRare', emoji: '🧚', sellPrice: 2000, desc: '流氷の天使。食事の時は恐ろしい姿に変貌する。' },

    // === Rare (30種) : 売却額 500 ===
    ...Array.from({ length: 30 }, (_, i) => ({
        id: `F_R${(i + 1).toString().padStart(2, '0')}`,
        name: ['カクレクマノミ', 'ナンヨウハギ', 'ツノダシ', 'ハタタテダイ', 'タツノオトシゴ', 'ミノカサゴ', 'マダラトビエイ', 'ミズクラゲ', 'アカクラゲ', 'マダコ', 'メンダコ', 'ウツボ', 'チンアナゴ', 'ニシキアナゴ', 'トラフグ', 'ハコフグ', 'ハリセンボン', 'マンボウ', 'シイラ', 'カジキマグロ', 'クロマグロ', 'マダイ', 'ヒラメ', 'キンメダイ', 'リュウキン', 'デメキン', 'ランチュウ', 'ニシキゴイ', 'エンゼルフィッシュ', 'ディスカス'][i],
        rarity: 'Rare',
        emoji: ['🐠','🐠','🐠','🐠','🐉','🐡','🦇','🪼','🪼','🐙','🐙','🐍','🐍','🐍','🐡','🐡','🐡','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐠','🐠','🐠','🎏','🐠','🐠'][i],
        sellPrice: 500,
        desc: '中々珍しいお魚。水槽を華やかに彩ってくれる。'
    })),

    // === Common (50種) : 売却額 50 ===
    ...Array.from({ length: 50 }, (_, i) => ({
        id: `F_C${(i + 1).toString().padStart(2, '0')}`,
        name: ['ネオンテトラ', 'カージナルテトラ', 'グローライトテトラ', 'ラミーノーズテトラ', 'ブラックネオン', 'ゼブラダニオ', 'アカヒレ', 'ラスボラ', 'スマトラ', 'チェリーバルブ', 'グッピー', 'プラティ', 'ソードテール', 'ブラックモーリー', 'ダルメシアンモーリー', 'コリドラス・アエネウス', 'コリドラス・パンダ', 'コリドラス・ジュリー', 'オトシンクルス', 'プレコ', 'ヤマトヌマエビ', 'ミナミヌマエビ', 'チェリーシュリンプ', 'ビーシュリンプ', 'ルリーシュリンプ', 'イシマキガイ', 'ラムズホーン', 'レッドラムズ', 'マシジミ', 'ヒメダカ', 'クロメダカ', 'シロメダカ', 'アオメダカ', 'ヨウキヒメダカ', 'ミユキメダカ', '和金', '琉金', 'コメット', '朱文金', 'フナ', 'モロコ', 'ドジョウ', 'シマドジョウ', 'ホトケドジョウ', 'ヨシノボリ', 'ドンコ', 'ザリガニ', 'サワガニ', 'スジエビ', 'テナガエビ'][i],
        rarity: 'Common',
        emoji: ['🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐠','🐠','🐠','🐟','🐟','🐡','🐡','🐡','🐟','🐟','🦐','🦐','🦐','🦐','🦐','🐚','🐚','🐚','🐚','🐟','🐟','🐟','🐟','🐟','🐟','🐠','🐠','🐠','🐠','🐟','🐟','🐍','🐍','🐍','🐟','🐟','🦞','🦀','🦐','🦐'][i],
        sellPrice: 50,
        desc: '親しみやすい定番の生き物。水槽の賑やかしに最適。'
    }))
];

// ガチャの抽選ロジック（確率設定）
export function drawGachaFromMaster() {
    let r = Math.random();
    let targetRarity = 'Common';

    // 確率設定: Secret=1%, Ultra=4%, SuperRare=15%, Rare=30%, Common=50%
    if (r < 0.01) targetRarity = 'Secret';
    else if (r < 0.05) targetRarity = 'Ultra';
    else if (r < 0.20) targetRarity = 'SuperRare';
    else if (r < 0.50) targetRarity = 'Rare';
    else targetRarity = 'Common';

    // 選ばれたレアリティの中からランダムに1匹選ぶ
    const candidates = FishMaster.filter(fish => fish.rarity === targetRarity);
    const selectedFish = candidates[Math.floor(Math.random() * candidates.length)];
    
    return selectedFish;
}