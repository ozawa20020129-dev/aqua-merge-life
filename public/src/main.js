import Fish from './Fish.js';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        // 絵文字をゲーム内の画像（テクスチャ）として動的に生成する独自関数
        this.createEmojiTexture('🐠', 'fish_guppy', 64);
        this.createEmojiTexture('💩', 'item_poop', 40);
        this.createEmojiTexture('🫧', 'item_bubble', 40);
        this.createEmojiTexture('🦐', 'fish_food', 30);
    }

    // 絵文字を画像化する魔法のメソッド
    createEmojiTexture(emoji, key, size) {
        let canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        let ctx = canvas.getContext('2d');
        ctx.font = `${size * 0.8}px Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        // Mac/Windowsの差異を吸収しつつ描画
        ctx.fillText(emoji, size / 2, size / 2 + size * 0.1);
        this.textures.addCanvas(key, canvas);
    }

    create() {
        this.checkServerTime();

        // 1. リアルな深海のグラデーション背景を描画
        let bg = this.add.graphics();
        bg.fillGradientStyle(0x001133, 0x001133, 0x004488, 0x004488, 1);
        bg.fillRect(0, 0, 360, 640);

        // 2. 魚のグループを作成 (runChildUpdateで各魚のAIループを毎フレーム実行)
        this.fishes = this.add.group({ runChildUpdate: true });

        // 3. テスト用の魚(コモン・グッピー)を水槽に放つ
        const guppyData = {
            id: 'F_001',
            max_hunger: 100,
            decay_rate: 0.02
        };

        // 初期位置を中央付近に設定して生成
        let myFish = new Fish(this, 180, 320, guppyData);
        this.fishes.add(myFish);
    }

    async checkServerTime() {
        try {
            const response = await fetch('/api/time');
            const data = await response.json();
            console.log("サーバー時刻:", new Date(data.serverTime));
        } catch (error) {
            console.error("サーバー時刻の取得に失敗", error);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 360, // 縦画面固定 [cite: 8]
    height: 640,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false } 
    },
    scene: MainScene
};

const game = new Phaser.Game(config);