import Fish from './Fish.js';

class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
    }

    preload() {
        // 魚の仮画像（白い四角）を作成
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillRect(0, 0, 32, 16);
        graphics.generateTexture('fish_placeholder', 32, 16);
        graphics.destroy();
    }

    create() {
        this.checkServerTime();

        this.fishes = this.physics.add.group();

        // テスト用の魚(コモン・グッピー)のデータ
        const guppyData = {
            id: 'F_001',
            max_hunger: 100,
            decay_rate: 0.02
        };

        let myFish = new Fish(this, 150, 200, guppyData);
        this.fishes.add(myFish);
        myFish.setDepth(1);
    }

    async checkServerTime() {
        try {
            const response = await fetch('/api/time');
            const data = await response.json();
            console.log("サーバー時刻:", new Date(data.serverTime));
        } catch (error) {
            console.error("サーバー時刻の取得に失敗しました", error);
        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 360,
    height: 640,
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 } }
    },
    scene: MainScene
};

const game = new Phaser.Game(config);