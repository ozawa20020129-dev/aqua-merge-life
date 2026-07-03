export default class Fish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, fishData) {
        let finalId = fishData.id;
        if (finalId === 'F_001') finalId = 'F_C11';
        if (finalId === 'F_002') finalId = 'F_R01';
        if (finalId === 'F_003') finalId = 'F_R02';

        super(scene, x, y, finalId);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);

        this.fish_id = fishData.uuid || Phaser.Math.RND.uuid();
        this.fish_type_id = finalId;
        this.max_hunger = fishData.max_hunger || 100;
        this.current_hunger = fishData.current_hunger !== undefined ? fishData.current_hunger : this.max_hunger;
        this.current_affection = fishData.current_affection !== undefined ? fishData.current_affection : 50.0;
        this.hunger_decay_rate = fishData.decay_rate || 0.05;
        this.status_state = fishData.status_state || 'NORMAL';
        
        // ★ レベルと経験値データの初期化（セーブデータから復元、なければLv1から）
        this.level = fishData.level || 1;
        this.experience = fishData.experience || 0;

        this.targetX = x;
        this.targetY = y;
        this.swimSpeed = 40;
        this.isWaiting = false;

        this.drop_timer = this.status_state === 'ANXIOUS' ? 900 : 300;
        this.setRandomWaypoint();
        
        this.decayTimer = scene.time.addEvent({
            delay: 1000,
            callback: this.updateStatus,
            callbackScope: this,
            loop: true
        });

        if (this.status_state === 'ANXIOUS') this.setTint(0xff9999);
        if (this.status_state === 'DEAD') {
            this.setTint(0x555555);
            this.setFlipY(true);
        }

        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', () => {
            if (this.status_state === 'DEAD') {
                if (this.scene.showDeathDialog) this.scene.showDeathDialog(this);
            } else {
                if (this.scene.showFishStatusDialog) this.scene.showFishStatusDialog(this);
            }
        });
    }

    setRandomWaypoint() {
        this.targetX = Phaser.Math.Between(50, 1230);
        this.targetY = Phaser.Math.Between(150, 650);
    }

    update(time, delta) {
        if (this.status_state === 'DEAD') {
            this.scene.physics.moveTo(this, this.x, this.y, 0);
            this.setVelocity(0, -20); 
            return;
        }

        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);

        if (distance < 10) {
            this.setVelocity(0, 0);
            if (!this.isWaiting) {
                this.isWaiting = true;
                this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                    this.setRandomWaypoint();
                    this.isWaiting = false;
                });
            }
        } else {
            this.scene.physics.moveTo(this, this.targetX, this.targetY, this.swimSpeed);
            if (this.body.velocity.x > 0) {
                this.setFlipX(false);
            } else if (this.body.velocity.x < 0) {
                this.setFlipX(true);
            }
        }
    }

    updateStatus() {
        if (this.status_state === 'DEAD') return;
        
        let dt = 1;
        this.current_hunger = Math.max(0, this.current_hunger - (this.hunger_decay_rate * dt));

        if (this.current_hunger > 30) {
            this.current_affection = Math.min(100, this.current_affection + (0.01 * dt));
        } else if (this.current_hunger <= 30 && this.current_hunger > 0) {
            this.current_affection = Math.max(0, this.current_affection - (0.05 * dt));
        } else if (this.current_hunger === 0) {
            this.current_affection = Math.max(0, this.current_affection - (0.2 * dt));
        }

        // ★ 経験値の加算とレベルアップ判定（1秒に1XP）
        this.experience += dt;
        let xpNeeded = this.level * 60; // 必要XP（Lv1->2は60XP、Lv2->3は120XP）
        if (this.experience >= xpNeeded) {
            this.experience -= xpNeeded;
            this.level++;
            
            // 頭上に「LEVEL UP! ✨」と浮かび上がる可愛い演出エフェクト
            let luText = this.scene.add.text(this.x, this.y - 45, 'LEVEL UP! ✨', { fontSize: '20px', fill: '#ffff00', fontStyle: 'bold' }).setOrigin(0.5);
            this.scene.tweens.add({ targets: luText, y: this.y - 95, alpha: 0, duration: 1500, onComplete: () => luText.destroy() });
        }

        let previous_state = this.status_state;

        if (this.current_affection <= 30 && this.current_hunger > 0) {
            this.status_state = 'ANXIOUS';
            this.setTint(0xff9999);
        } else if (this.current_hunger === 0 && this.current_affection === 0) {
            this.status_state = 'DEAD';
            this.setTint(0x555555);
            this.setFlipY(true); 
        } else {
            this.status_state = 'NORMAL';
            this.clearTint();
        }

        if (previous_state !== 'ANXIOUS' && this.status_state === 'ANXIOUS') {
            this.drop_timer = 900;
        }

        this.drop_timer -= dt;
        if (this.drop_timer <= 0) {
            this.dropItem();
            this.drop_timer = this.status_state === 'ANXIOUS' ? 900 : 300;
        }
    }

    dropItem() {
        if (!this.scene.items) return;
        
        let isPoop = false;
        let type = 'item_L1';

        if (this.status_state === 'ANXIOUS') {
            isPoop = true;
            type = 'item_poop';
        } else {
            isPoop = Phaser.Math.Between(1, 100) <= 20;
            type = isPoop ? 'item_poop' : 'item_L1';
        }
        
        let item = this.scene.items.create(this.x, this.y, type);
        item.itemType = type;
        item.setGravityY(50);
        item.setCollideWorldBounds(true);
        item.setBounce(0.2);
        item.setInteractive({ useHandCursor: true });
        this.scene.input.setDraggable(item);
    }
}