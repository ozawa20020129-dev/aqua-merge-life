import Fish from './Fish.js';
import { FishMaster, drawGachaFromMaster } from './FishMaster.js';

window.saveGameState = function(scene) {
    if (scene.scene.key === 'AquariumScene' && scene.fishes) {
        let activeFishes = [];
        scene.fishes.getChildren().forEach(f => {
            activeFishes.push({
                id: f.fish_type_id, uuid: f.fish_id, max_hunger: f.max_hunger,
                current_hunger: f.current_hunger, current_affection: f.current_affection,
                status_state: f.status_state, decay_rate: f.hunger_decay_rate,
                level: f.level, experience: f.experience
            });
        });
        scene.registry.set('aquarium_fishes', activeFishes);
    }

    const data = {
        coins: scene.registry.get('coins'), inventory: scene.registry.get('inventory'),
        collection: scene.registry.get('collection'), aquarium_fishes: scene.registry.get('aquarium_fishes') || [],
        max_capacity: scene.registry.get('max_capacity'), last_played: Date.now()
    };
    localStorage.setItem('aqua_merge_save', JSON.stringify(data));
};

class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }
    create() {
        let savedDataStr = localStorage.getItem('aqua_merge_save');
        let offlineDrops = 0;

        if (savedDataStr) {
            let data = JSON.parse(savedDataStr);
            this.registry.set('coins', data.coins || 0);
            this.registry.set('inventory', data.inventory || []);
            this.registry.set('collection', data.collection || []);
            this.registry.set('max_capacity', data.max_capacity || 3);
            
            let aquariumFishes = data.aquarium_fishes || [];
            
            aquariumFishes = aquariumFishes.map(fish => {
                if (fish.id === 'F_001') fish.id = 'F_C11';
                if (fish.id === 'F_002') fish.id = 'F_R01';
                if (fish.id === 'F_003') fish.id = 'F_R02';
                return fish;
            });

            let lastPlayed = data.last_played || Date.now();
            let offlineSeconds = Math.floor((Date.now() - lastPlayed) / 1000);
            
            if (offlineSeconds > 0 && aquariumFishes.length > 0) {
                aquariumFishes.forEach(fish => {
                    fish.current_hunger = Math.max(0, fish.current_hunger - (fish.decay_rate * offlineSeconds));
                    offlineDrops += Math.floor(offlineSeconds / 300);
                    
                    if (fish.status_state !== 'DEAD') {
                        let currentLevel = fish.level || 1;
                        let currentXp = (fish.experience || 0) + offlineSeconds;
                        
                        while (currentXp >= currentLevel * 60) {
                            currentXp -= currentLevel * 60;
                            currentLevel++;
                        }
                        fish.level = currentLevel;
                        fish.experience = currentXp;
                    }
                });
                offlineDrops = Math.min(50, offlineDrops);
            }
            this.registry.set('aquarium_fishes', aquariumFishes);

        } else {
            this.registry.set('coins', 1000);
            this.registry.set('inventory', []);
            this.registry.set('collection', []);
            this.registry.set('aquarium_fishes', []);
            this.registry.set('max_capacity', 3);
        }

        this.registry.set('offline_drops', offlineDrops);
        this.scene.start('LobbyScene');
    }
}

// ★ constructorの中身を「LobbyScene」に修正しました！
class LobbyScene extends Phaser.Scene {
    constructor() { super('LobbyScene'); } 
    create() {
        let bg = this.add.graphics();
        bg.fillGradientStyle(0x1a2a6c, 0x1a2a6c, 0xb21f1f, 0xfdbb2d, 1);
        bg.fillRect(0, 0, 1280, 720);

        this.add.text(640, 150, 'AQUA MERGE LIFE', { fontSize: '64px', fontStyle: 'bold', fill: '#ffffff' }).setOrigin(0.5);
        this.add.text(1250, 20, `💰 コイン: ${this.registry.get('coins')}`, { fontSize: '32px', fontStyle: 'bold', fill: '#ffd700' }).setOrigin(1, 0);

        const createButton = (y, text, onClick) => {
            let btn = this.add.text(640, y, text, { fontSize: '32px', fill: '#ffffff', backgroundColor: '#336699', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
            btn.on('pointerdown', onClick);
        };

        createButton(330, '🐠 水槽へ行く', () => this.scene.start('AquariumScene'));
        createButton(430, '🎰 お魚ガチャ', () => this.scene.start('GachaScene'));
        createButton(530, '📖 お魚図鑑', () => this.scene.start('CollectionScene'));
        
        let resetBtn = this.add.text(20, 680, '⚠ セーブデータ初期化', { fontSize: '16px', fill: '#ff0000' }).setInteractive({ useHandCursor: true });
        resetBtn.on('pointerdown', () => {
            if (confirm('データをすべて消去しますか？')) {
                localStorage.removeItem('aqua_merge_save');
                location.reload();
            }
        });
    }
}

class GachaScene extends Phaser.Scene {
    constructor() { super('GachaScene'); }
    create() {
        let bg = this.add.graphics();
        bg.fillGradientStyle(0x2b5876, 0x2b5876, 0x4e4376, 0x4e4376, 1);
        bg.fillRect(0, 0, 1280, 720);

        let coinText = this.add.text(1250, 20, `💰 コイン: ${this.registry.get('coins')}`, { fontSize: '32px', fontStyle: 'bold', fill: '#ffd700' }).setOrigin(1, 0);
        let backBtn = this.add.text(20, 20, '◀ ロビーに戻る', { fontSize: '24px', fill: '#fff', backgroundColor: '#555', padding: { x: 10, y: 5 } }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('LobbyScene'));

        this.add.text(640, 200, 'プレミアムお魚ガチャ', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);
        let resultText = this.add.text(640, 450, '', { fontSize: '40px', fill: '#ffcc00', fontStyle: 'bold' }).setOrigin(0.5);

        let gachaBtn = this.add.text(640, 350, `ガチャを引く (💰100)`, { fontSize: '32px', fill: '#ffffff', backgroundColor: '#e63946', padding: { x: 20, y: 15 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        gachaBtn.on('pointerdown', () => {
            let coins = this.registry.get('coins');
            if (coins >= 100) {
                this.registry.set('coins', coins - 100);
                coinText.setText(`💰 コイン: ${this.registry.get('coins')}`);
                this.drawGacha(resultText);
            } else {
                resultText.setText('コインが足りません！').setFill('#ff0000');
            }
        });
    }

    drawGacha(resultText) {
        let resultItem = drawGachaFromMaster();
        let colorMap = { 'Common': '#ffffff', 'Rare': '#00ffff', 'SuperRare': '#ff8800', 'Ultra': '#ff00ff', 'Secret': '#ff0000' };
        resultText.setFill(colorMap[resultItem.rarity]);
        resultText.setText('ぐるぐる...');
        
        this.time.delayedCall(500, () => {
            resultText.setText(`${resultItem.emoji} [${resultItem.rarity}] : ${resultItem.name} をゲット！`);
            let inventory = this.registry.get('inventory');
            inventory.push(resultItem);
            this.registry.set('inventory', inventory);

            let collection = this.registry.get('collection');
            if (!collection.includes(resultItem.id)) {
                collection.push(resultItem.id);
                this.registry.set('collection', collection);
            }
            window.saveGameState(this);
        });
    }
}

class CollectionScene extends Phaser.Scene {
    constructor() { super('CollectionScene'); }
    create() {
        let bg = this.add.graphics();
        bg.fillGradientStyle(0x112233, 0x112233, 0x224455, 0x224455, 1);
        bg.fillRect(0, 0, 1280, 720);

        let backBtn = this.add.text(20, 20, '◀ ロビーに戻る', { fontSize: '24px', fill: '#fff', backgroundColor: '#555', padding: { x: 10, y: 5 } }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => this.scene.start('LobbyScene'));

        this.add.text(640, 50, '📖 お魚図鑑 (全102種)', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

        this.currentPage = 0;
        this.itemsPerPage = 8;
        this.maxPage = Math.ceil(FishMaster.length / this.itemsPerPage) - 1;

        this.collection = this.registry.get('collection');
        this.pageContainer = this.add.container(0, 0);
        this.pageText = this.add.text(640, 680, '', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);
        
        let prevBtn = this.add.text(450, 680, '◀ 前のページ', { fontSize: '24px', backgroundColor: '#444', padding:{x:10,y:5} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        prevBtn.on('pointerdown', () => { if (this.currentPage > 0) { this.currentPage--; this.drawPage(); } });

        let nextBtn = this.add.text(830, 680, '次のページ ▶', { fontSize: '24px', backgroundColor: '#444', padding:{x:10,y:5} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        nextBtn.on('pointerdown', () => { if (this.currentPage < this.maxPage) { this.currentPage++; this.drawPage(); } });

        this.drawPage();
    }

    drawPage() {
        this.pageContainer.removeAll(true);
        this.pageText.setText(`ページ: ${this.currentPage + 1} / ${this.maxPage + 1}`);

        let startIndex = this.currentPage * this.itemsPerPage;
        let pageItems = FishMaster.slice(startIndex, startIndex + this.itemsPerPage);

        pageItems.forEach((fish, i) => {
            let col = i % 2; 
            let row = Math.floor(i / 2); 
            let xPos = col === 0 ? 320 : 960;
            let yPos = 160 + (row * 130);

            let isUnlocked = this.collection.includes(fish.id);

            let panel = this.add.graphics();
            panel.fillStyle(isUnlocked ? 0x225577 : 0x222222, 0.8);
            panel.fillRoundedRect(xPos - 280, yPos - 50, 560, 110, 10);
            this.pageContainer.add(panel);

            if (isUnlocked) {
                this.pageContainer.add([
                    this.add.text(xPos - 250, yPos, fish.emoji_char, { fontSize: '60px' }).setOrigin(0, 0.5),
                    this.add.text(xPos - 150, yPos - 25, `[${fish.rarity}] ${fish.name}`, { fontSize: '24px', fill: '#00ffff', fontStyle: 'bold' }),
                    this.add.text(xPos - 150, yPos + 15, fish.desc, { fontSize: '18px', fill: '#cccccc' })
                ]);
            } else {
                this.pageContainer.add([
                    this.add.text(xPos - 250, yPos, '❓', { fontSize: '60px' }).setOrigin(0, 0.5),
                    this.add.text(xPos - 150, yPos, `No.${startIndex + i + 1} 未発見`, { fontSize: '24px', fill: '#666666', fontStyle: 'bold' }).setOrigin(0.5)
                ]);
            }
        });
    }
}

class AquariumScene extends Phaser.Scene {
    constructor() { super('AquariumScene'); }
    
    preload() {
        FishMaster.forEach(fish => {
            this.createEmojiTexture(fish.emoji_char, fish.id, 64);
        });
        
        this.createEmojiTexture('🦐', 'item_food', 40);
        this.createEmojiTexture('💩', 'item_poop', 40);
        this.createEmojiTexture('🫧', 'item_L1', 40);
        this.createEmojiTexture('💧', 'item_L2', 45);
        this.createEmojiTexture('💎', 'item_L3', 50);
        this.createEmojiTexture('🔮', 'item_L4', 55);
        this.createEmojiTexture('👑', 'item_L5', 60);
    }
    
    createEmojiTexture(emoji, key, size) {
        let canvas = document.createElement('canvas');
        canvas.width = size; canvas.height = size;
        let ctx = canvas.getContext('2d');
        ctx.font = `${size * 0.8}px Arial`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(emoji, size / 2, size / 2 + size * 0.1);
        this.textures.addCanvas(key, canvas);
    }

    create() {
        let bg = this.add.graphics();
        bg.fillGradientStyle(0x001133, 0x001133, 0x004488, 0x004488, 1);
        bg.fillRect(0, 0, 1280, 720);

        this.fishes = this.add.group({ runChildUpdate: true });
        this.foods = this.physics.add.group();
        this.items = this.physics.add.group();
        this.physics.add.overlap(this.fishes, this.foods, this.eatFood, null, this);

        let aquariumFishes = this.registry.get('aquarium_fishes');
        aquariumFishes.forEach(fishData => {
            let fish = new Fish(this, Phaser.Math.Between(200, 1000), Phaser.Math.Between(200, 500), fishData);
            this.fishes.add(fish);
        });

        this.coinText = this.add.text(1250, 20, `💰 コイン: ${this.registry.get('coins')}`, { fontSize: '32px', fontStyle: 'bold', fill: '#ffd700' }).setOrigin(1, 0);
        
        let backBtn = this.add.text(20, 20, '◀ ロビーに戻る', { fontSize: '24px', fill: '#fff', backgroundColor: '#555', padding: { x: 10, y: 5 } }).setInteractive({ useHandCursor: true });
        backBtn.on('pointerdown', () => { window.saveGameState(this); this.scene.start('LobbyScene'); });

        let invBtn = this.add.text(20, 80, '📦 所持品を開く', { fontSize: '24px', fill: '#fff', backgroundColor: '#008800', padding: { x: 10, y: 5 } }).setInteractive({ useHandCursor: true });
        invBtn.on('pointerdown', () => this.toggleInventory());

        let feedBtn = this.add.text(20, 140, '🦐 餌をまく (💰10)', { fontSize: '24px', fill: '#fff', backgroundColor: '#d35400', padding: { x: 10, y: 5 } }).setInteractive({ useHandCursor: true });
        feedBtn.on('pointerdown', () => this.spawnFood());

        this.capacityText = this.add.text(20, 200, '', { fontSize: '24px', fill: '#fff', fontStyle: 'bold' });
        this.updateCapacityText();

        let shopBtn = this.add.text(20, 240, '🛒 水槽の拡張', { fontSize: '24px', fill: '#fff', backgroundColor: '#8e44ad', padding: { x: 10, y: 5 } }).setInteractive({ useHandCursor: true });
        shopBtn.on('pointerdown', () => this.drawShop());

        this.inventoryContainer = this.add.container(0, 0).setDepth(100).setVisible(false);
        this.shopContainer = this.add.container(0, 0).setDepth(100).setVisible(false);
        this.deathContainer = this.add.container(0, 0).setDepth(110).setVisible(false);
        this.statusContainer = this.add.container(0, 0).setDepth(120).setVisible(false);

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.body.setAllowGravity(false);
            gameObject.setVelocity(0, 0);
            gameObject.x = dragX;
            gameObject.y = dragY;
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.body.setAllowGravity(true);
            
            let distance = Phaser.Math.Distance.Between(pointer.downX, pointer.downY, pointer.upX, pointer.upY);
            if (distance < 5) {
                this.collectItem(gameObject);
                return;
            }

            let merged = false;
            this.items.getChildren().forEach((otherItem) => {
                if (merged || otherItem === gameObject) return;
                if (otherItem.itemType === gameObject.itemType) {
                    if (Phaser.Geom.Intersects.RectangleToRectangle(gameObject.getBounds(), otherItem.getBounds())) {
                        this.mergeItems(gameObject, otherItem);
                        merged = true;
                    }
                }
            });
        });

        let drops = this.registry.get('offline_drops');
        if (drops > 0) {
            for(let i=0; i<drops; i++) {
                let isPoop = Phaser.Math.Between(1, 100) <= 20;
                let type = isPoop ? 'item_poop' : 'item_L1';
                let item = this.items.create(Phaser.Math.Between(100, 1180), Phaser.Math.Between(600, 700), type);
                item.itemType = type;
                item.setGravityY(50);
                item.setCollideWorldBounds(true);
                item.setBounce(0.2);
                item.setInteractive({ useHandCursor: true });
                this.input.setDraggable(item);
            }
            this.registry.set('offline_drops', 0);
            let notify = this.add.text(640, 360, `オフライン報酬として\n${drops}個のアイテムを発見！`, { fontSize: '40px', fill: '#ffff00', fontStyle: 'bold', align: 'center', backgroundColor: '#000000aa' }).setOrigin(0.5);
            this.time.delayedCall(4000, () => notify.destroy());
        }

        this.lastSaveTime = 0;
    }

    collectItem(item) {
        const priceMap = { 'item_poop': 1, 'item_L1': 5, 'item_L2': 25, 'item_L3': 120, 'item_L4': 600, 'item_L5': 3000 };
        let price = priceMap[item.itemType] || 1;
        let coins = this.registry.get('coins');
        this.registry.set('coins', coins + price);
        this.coinText.setText(`💰 コイン: ${this.registry.get('coins')}`);

        let eff = this.add.text(item.x, item.y, `+${price}💰`, { fontSize: '24px', fill: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
        this.tweens.add({ targets: eff, y: item.y - 60, alpha: 0, duration: 1000, onComplete: () => eff.destroy() });

        item.destroy();
        window.saveGameState(this);
    }

    showFishStatusDialog(fish) {
        this.statusContainer.removeAll(true);
        this.statusContainer.setVisible(true);

        let modalBg = this.add.graphics();
        modalBg.fillStyle(0x000000, 0.9);
        modalBg.fillRect(390, 100, 500, 510);
        this.statusContainer.add(modalBg);

        let master = FishMaster.find(f => f.id === fish.fish_type_id) || { name: '不明な魚', rarity: 'Common', emoji_char: '🐟', sellPrice: 5 };

        let levelBonus = Math.floor(master.sellPrice * 0.5 * (fish.level - 1)); 
        let currentSellPrice = master.sellPrice + levelBonus;
        let xpNeeded = fish.level * 60;

        this.statusContainer.add([
            this.add.text(640, 130, `${master.emoji_char} お魚のステータス`, { fontSize: '32px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5),
            this.add.text(440, 190, `名前: ${master.name}`, { fontSize: '24px', fill: '#00ffff' }),
            this.add.text(440, 240, `レアリティ: ${master.rarity}`, { fontSize: '24px', fill: '#ffcc00' }),
            this.add.text(440, 290, `レベル: Lv.${fish.level}`, { fontSize: '24px', fill: '#ffff00', fontStyle: 'bold' }),
            this.add.text(440, 330, `経験値: ${fish.experience} / ${xpNeeded} XP`, { fontSize: '18px', fill: '#cccccc' }),
            this.add.text(440, 380, `空腹度: ${Math.floor(fish.current_hunger)} / ${fish.max_hunger} %`, { fontSize: '24px', fill: '#fff' }),
            this.add.text(440, 430, `好感度: ${Math.floor(fish.current_affection)} / 100 %`, { fontSize: '24px', fill: '#fff' }),
            this.add.text(440, 480, `状態: ${fish.status_state}`, { fontSize: '24px', fill: fish.status_state === 'ANXIOUS' ? '#ff8888' : '#88ff88' })
        ]);

        let sellBtn = this.add.text(540, 550, `💰 育成売却 (💰${currentSellPrice})`, { fontSize: '20px', fill: '#fff', backgroundColor: '#cc6600', padding: {x:15, y:8} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        sellBtn.on('pointerdown', () => {
            if (confirm(`${master.name} (Lv.${fish.level}) を売却して 💰${currentSellPrice} コイン 獲得しますか？`)) {
                let coins = this.registry.get('coins');
                this.registry.set('coins', coins + currentSellPrice);
                this.coinText.setText(`💰 コイン: ${this.registry.get('coins')}`);
                fish.destroy();
                this.updateCapacityText();
                this.statusContainer.setVisible(false);
                window.saveGameState(this);
            }
        });

        let closeBtn = this.add.text(740, 550, '✖ 閉じる', { fontSize: '20px', fill: '#fff', backgroundColor: '#555', padding: { x: 15, y: 8 } }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.statusContainer.setVisible(false));
        
        this.statusContainer.add([sellBtn, closeBtn]);
    }

    updateCapacityText() {
        if (this.capacityText) {
            let current = this.fishes ? this.fishes.getChildren().length : 0;
            let max = this.registry.get('max_capacity');
            this.capacityText.setText(`🐟 魚数: ${current} / ${max}`);
        }
    }

    showDeathDialog(fish) {
        this.deathContainer.removeAll(true);
        this.deathContainer.setVisible(true);

        let modalBg = this.add.graphics();
        modalBg.fillStyle(0x000000, 0.9);
        modalBg.fillRect(340, 200, 600, 320);
        this.deathContainer.add(modalBg);

        this.deathContainer.add(this.add.text(640, 250, 'お魚が力尽きてしまいました...', { fontSize: '32px', fill: '#ff4444', fontStyle: 'bold' }).setOrigin(0.5));

        let reviveCost = 500;
        let reviveBtn = this.add.text(640, 330, `💖 復活させる (💰${reviveCost})`, { fontSize: '24px', backgroundColor: '#e63946', padding: {x:20, y:10} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        reviveBtn.on('pointerdown', () => {
            let coins = this.registry.get('coins');
            if (coins >= reviveCost) {
                this.registry.set('coins', coins - reviveCost);
                this.coinText.setText(`💰 コイン: ${this.registry.get('coins')}`);
                fish.status_state = 'NORMAL';
                fish.current_hunger = fish.max_hunger;
                fish.current_affection = 50;
                fish.clearTint();
                fish.setFlipY(false);
                this.deathContainer.setVisible(false);
                window.saveGameState(this);
            } else {
                alert('コインが足りません！');
            }
        });

        let graveBtn = this.add.text(640, 410, '🪦 お墓に送る (サヨナラする)', { fontSize: '24px', backgroundColor: '#555555', padding: {x:20, y:10} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        graveBtn.on('pointerdown', () => {
            fish.destroy();
            this.updateCapacityText();
            this.deathContainer.setVisible(false);
            window.saveGameState(this);
        });

        this.deathContainer.add([reviveBtn, graveBtn]);
    }

    drawShop() {
        this.shopContainer.removeAll(true);
        this.shopContainer.setVisible(true);

        let modalBg = this.add.graphics();
        modalBg.fillStyle(0x000000, 0.9);
        modalBg.fillRect(340, 150, 600, 350);
        this.shopContainer.add(modalBg);

        this.shopContainer.add(this.add.text(640, 200, '🛒 水槽の設備ショップ', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5));
        
        let closeBtn = this.add.text(920, 170, '✖ 閉じる', { fontSize: '24px', fill: '#fff', backgroundColor: '#ff0000', padding: {x:10, y:5} }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.shopContainer.setVisible(false));
        this.shopContainer.add(closeBtn);

        let currentMax = this.registry.get('max_capacity');
        let expandCost = 500 * Math.pow((currentMax - 2), 2);

        let expandBtn = this.add.text(640, 320, `水槽を拡張する (+1枠)\n💰 ${expandCost} コイン`, { fontSize: '24px', align:'center', backgroundColor: '#0055ff', padding: {x:20, y:10} }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        expandBtn.on('pointerdown', () => {
            let coins = this.registry.get('coins');
            if (coins >= expandCost) {
                this.registry.set('coins', coins - expandCost);
                this.registry.set('max_capacity', currentMax + 1);
                this.coinText.setText(`💰 コイン: ${this.registry.get('coins')}`);
                this.updateCapacityText();
                this.shopContainer.setVisible(false);
                window.saveGameState(this);
            } else {
                alert('コインが足りません！');
            }
        });
        
        this.shopContainer.add(expandBtn);
    }

    mergeItems(item1, item2) {
        const nextLevelMap = { 'item_L1': 'item_L2', 'item_L2': 'item_L3', 'item_L3': 'item_L4', 'item_L4': 'item_L5', 'item_L5': 'MAX' };
        let nextType = nextLevelMap[item1.itemType];
        let mergeX = (item1.x + item2.x) / 2;
        let mergeY = (item1.y + item2.y) / 2;
        
        item1.destroy();
        item2.destroy();

        if (nextType === 'MAX') {
            let coins = this.registry.get('coins');
            this.registry.set('coins', coins + 5000); 
            this.coinText.setText(`💰 コイン: ${this.registry.get('coins')}`);
            let bonusText = this.add.text(mergeX, mergeY, '+5000 コイン!', { fontSize: '32px', fill: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);
            this.tweens.add({ targets: bonusText, y: mergeY - 50, alpha: 0, duration: 2000, onComplete: () => bonusText.destroy() });
            window.saveGameState(this);
        } else {
            let newItem = this.items.create(mergeX, mergeY, nextType);
            newItem.itemType = nextType;
            newItem.setGravityY(50);
            newItem.setCollideWorldBounds(true);
            newItem.setBounce(0.2);
            newItem.setInteractive({ useHandCursor: true });
            this.input.setDraggable(newItem);
            
            let effectText = this.add.text(mergeX, mergeY, '✨ MERGE!', { fontSize: '24px', fill: '#00ffff', fontStyle: 'bold' }).setOrigin(0.5);
            this.tweens.add({ targets: effectText, y: mergeY - 50, alpha: 0, duration: 1000, onComplete: () => effectText.destroy() });
        }
    }

    spawnFood() {
        let coins = this.registry.get('coins');
        if (coins >= 10) {
            this.registry.set('coins', coins - 10);
            this.coinText.setText(`💰 コイン: ${this.registry.get('coins')}`);
            let food = this.foods.create(Phaser.Math.Between(100, 1180), -20, 'item_food');
            food.setGravityY(100);
            food.setCollideWorldBounds(true);
            food.setBounce(0.3);
            window.saveGameState(this);
        }
    }

    eatFood(fish, food) {
        food.destroy();
        fish.current_hunger = Math.min(fish.max_hunger, fish.current_hunger + 50);
        fish.current_affection = Math.min(100, fish.current_affection + 10);
        fish.setVelocityY(-50);
    }

    toggleInventory() {
        let isVisible = this.inventoryContainer.visible;
        this.inventoryContainer.setVisible(!isVisible);
        if (!isVisible) this.drawInventory();
    }

    drawInventory() {
        this.inventoryContainer.removeAll(true);
        let modalBg = this.add.graphics();
        modalBg.fillStyle(0x000000, 0.9);
        modalBg.fillRect(240, 100, 800, 520);
        this.inventoryContainer.add(modalBg);

        this.inventoryContainer.add(this.add.text(640, 130, '📦 所持品 (インベントリ)', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5));
        let closeBtn = this.add.text(1000, 110, '✖ 閉じる', { fontSize: '24px', fill: '#fff', backgroundColor: '#ff0000', padding: {x:10, y:5} }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
        closeBtn.on('pointerdown', () => this.inventoryContainer.setVisible(false));
        this.inventoryContainer.add(closeBtn);

        let inventory = this.registry.get('inventory');
        if (inventory.length === 0) {
            this.inventoryContainer.add(this.add.text(640, 360, '所持品は空です。ガチャを引こう！', { fontSize: '24px', fill: '#888' }).setOrigin(0.5));
            return;
        }

        inventory.forEach((item, index) => {
            let yPos = 200 + (index * 60);
            if (index > 6) return;

            let nameText = this.add.text(280, yPos, `${item.emoji} [${item.rarity}] ${item.name}`, { fontSize: '24px', fill: '#fff' });
            
            let placeBtn = this.add.text(780, yPos, '水槽へ', { fontSize: '20px', backgroundColor: '#0055ff', padding: {x:10, y:5} }).setInteractive({ useHandCursor: true });
            placeBtn.on('pointerdown', () => this.placeFish(index));

            let sellBtn = this.add.text(880, yPos, `売却 (💰${item.sellPrice})`, { fontSize: '20px', backgroundColor: '#cc6600', padding: {x:10, y:5} }).setInteractive({ useHandCursor: true });
            sellBtn.on('pointerdown', () => this.sellFish(index));

            this.inventoryContainer.add([nameText, placeBtn, sellBtn]);
        });
    }

    placeFish(index) {
        let currentCount = this.fishes.getChildren().length;
        let maxCapacity = this.registry.get('max_capacity');
        
        if (currentCount >= maxCapacity) {
            alert('水槽が満員です！ショップで水槽を拡張してください。');
            return;
        }

        let inventory = this.registry.get('inventory');
        let item = inventory[index];
        let fishData = { id: item.id, max_hunger: 100, decay_rate: 0.05, level: 1, experience: 0 };
        let newFish = new Fish(this, 640, 360, fishData);
        this.fishes.add(newFish);

        inventory.splice(index, 1);
        this.registry.set('inventory', inventory);
        
        this.updateCapacityText();
        window.saveGameState(this);
        this.drawInventory();
    }

    sellFish(index) {
        let inventory = this.registry.get('inventory');
        let item = inventory[index];
        let coins = this.registry.get('coins');
        this.registry.set('coins', coins + item.sellPrice);
        this.coinText.setText(`💰 コイン: ${this.registry.get('coins')}`);

        inventory.splice(index, 1);
        this.registry.set('inventory', inventory);
        
        window.saveGameState(this);
        this.drawInventory();
    }
}

const config = {
    type: Phaser.AUTO,
    width: 1280,
    height: 720,
    parent: 'game-container',
    scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
    physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
    scene: [BootScene, LobbyScene, GachaScene, CollectionScene, AquariumScene]
};
const game = new Phaser.Game(config);