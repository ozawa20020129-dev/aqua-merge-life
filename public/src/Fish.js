export default class Fish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, fishData) {
        super(scene, x, y, fishData.id);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);

        this.fish_id = fishData.uuid || Phaser.Math.RND.uuid();
        this.fish_type_id = fishData.id;
        this.max_hunger = fishData.max_hunger || 100;
        this.current_hunger = fishData.current_hunger !== undefined ? fishData.current_hunger : this.max_hunger;
        this.current_affection = fishData.current_affection !== undefined ? fishData.current_affection : 50.0;
        this.hunger_decay_rate = fishData.decay_rate || 0.05;
        this.status_state = fishData.status_state || 'NORMAL';
        
        this.targetX = x;
        this.targetY = y;
        this.swimSpeed = 40;
        this.isWaiting = false;

        // ★ ANXIOUSの場合は60秒固定、それ以外は10秒(テスト用)
        this.drop_timer = this.status_state === 'ANXIOUS' ? 60 : 10;
        this.setRandomWaypoint();
        
        this.decayTimer = scene.time.addEvent({
            delay: 1000,
            callback: this.updateStatus,
            callbackScope: this,
            loop: true
        });

        // 状態に応じた初期カラー・向きの反映
        if (this.status_state === 'ANXIOUS') this.setTint(0xff9999);
        if (this.status_state === 'DEAD') {
            this.setTint(0x555555);
            this.setFlipY(true);
        }

        // ★ 死亡時のタップ判定を追加
        this.setInteractive({ useHandCursor: true });
        this.on('pointerdown', () => {
            if (this.status_state === 'DEAD') {
                if (this.scene.showDeathDialog) {
                    this.scene.showDeathDialog(this);
                }
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
            this.setVelocity(0, -20); // 浮上
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

        let previous_state = this.status_state;

        if (this.current_affection <= 30 && this.current_hunger > 0) {
            this.status_state = 'ANXIOUS';
            this.setTint(0xff9999);
        } else if (this.current_hunger === 0 && this.current_affection === 0) {
            this.status_state = 'DEAD';
            this.setTint(0x555555);
            this.setFlipY(true); // 死んだら反転
        } else {
            this.status_state = 'NORMAL';
            this.clearTint();
        }

        // ANXIOUSに遷移した瞬間にタイマーを60秒にリセット
        if (previous_state !== 'ANXIOUS' && this.status_state === 'ANXIOUS') {
            this.drop_timer = 60;
        }

        this.drop_timer -= dt;
        if (this.drop_timer <= 0) {
            this.dropItem();
            // ドロップ後、状態に応じてタイマーをリセット
            this.drop_timer = this.status_state === 'ANXIOUS' ? 60 : 10;
        }
    }

    dropItem() {
        if (!this.scene.items) return;
        
        let isPoop = false;
        let type = 'item_L1';

        // ★ ANXIOUS状態のペナルティ：強制的にうんこになる
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
        
        if (isPoop) {
            item.on('pointerdown', () => {
                item.destroy();
                let coins = this.scene.registry.get('coins');
                this.scene.registry.set('coins', coins + 1);
                if (this.scene.coinText) this.scene.coinText.setText(`💰 コイン: ${this.scene.registry.get('coins')}`);
                window.saveGameState(this.scene);
            });
        } else {
            this.scene.input.setDraggable(item);
        }
    }
}