export default class Fish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, fishData) {
        // 先ほど生成した熱帯魚の画像（fish_guppy）を適用
        super(scene, x, y, 'fish_guppy');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // 水槽（画面）の外に出ないようにする
        this.setCollideWorldBounds(true);

        // 内部変数・ステータス
        this.fish_id = Phaser.Math.RND.uuid();
        this.fish_type_id = fishData.id;
        this.current_hunger = fishData.max_hunger;
        this.current_affection = 50.0;
        this.hunger_decay_rate = fishData.decay_rate;
        this.status_state = 'NORMAL';
        
        // --- AI遊泳用変数 ---
        this.targetX = x;
        this.targetY = y;
        this.swimSpeed = 40; // 泳ぐ速度
        this.isWaiting = false; // 立ち止まっているか

        // 最初の目標地点を決定
        this.setRandomWaypoint();
        
        // 1秒ごとのステータス更新タイマー
        this.decayTimer = scene.time.addEvent({
            delay: 1000,
            callback: this.updateStatus,
            callbackScope: this,
            loop: true
        });
    }

    // 次に泳いでいく場所をランダムに決める関数
    setRandomWaypoint() {
        this.targetX = Phaser.Math.Between(40, 320); // 画面幅
        this.targetY = Phaser.Math.Between(100, 500); // 画面高さ
    }

    // ★ 毎フレーム呼ばれるAIロジック（自律行動）
    update(time, delta) {
        if (this.status_state === 'DEAD') {
            // 死亡状態の挙動: 物理移動を止め、反転して浮上する 
            this.scene.physics.moveTo(this, this.x, this.y, 0); // 停止
            this.setVelocity(0, -20); // ゆっくり浮上
            this.setFlipY(true); // 上下反転
            return;
        }

        // 現在地と目標地点の距離を計算
        const distance = Phaser.Math.Distance.Between(this.x, this.y, this.targetX, this.targetY);

        if (distance < 10) {
            // 目標に到着したら立ち止まる
            this.setVelocity(0, 0);
            
            if (!this.isWaiting) {
                this.isWaiting = true;
                // 1秒〜3秒の間、気ままに待機してから次の場所へ
                this.scene.time.delayedCall(Phaser.Math.Between(1000, 3000), () => {
                    this.setRandomWaypoint();
                    this.isWaiting = false;
                });
            }
        } else {
            // 目標に向かって泳ぐ
            this.scene.physics.moveTo(this, this.targetX, this.targetY, this.swimSpeed);
            
            // 泳ぐ方向（左右）に合わせて魚の顔の向きを反転させる
            if (this.body.velocity.x > 0) {
                this.setFlipX(false); // 右向き
            } else if (this.body.velocity.x < 0) {
                this.setFlipX(true);  // 左向き
            }
        }
    }

    updateStatus() {
        if (this.status_state === 'DEAD') return;

        let dt = 1;

        // 満腹度・好感度の計算（仕様書通り）
        this.current_hunger = Math.max(0, this.current_hunger - (this.hunger_decay_rate * dt));

        if (this.current_hunger > 30) {
            this.current_affection = Math.min(100, this.current_affection + (0.01 * dt));
        } else if (this.current_hunger <= 30 && this.current_hunger > 0) {
            this.current_affection = Math.max(0, this.current_affection - (0.05 * dt));
        } else if (this.current_hunger === 0) {
            this.current_affection = Math.max(0, this.current_affection - (0.2 * dt));
        }

        // ステータスの決定と見た目の変化
        if (this.current_affection <= 30 && this.current_hunger > 0) {
            this.status_state = 'ANXIOUS';
            this.setTint(0xff9999); // 不機嫌時は少し赤っぽく
        } else if (this.current_hunger === 0 && this.current_affection === 0) {
            this.status_state = 'DEAD';
            this.setTint(0x555555); // 死亡時はグレー
        } else {
            this.status_state = 'NORMAL';
            this.clearTint();
        }
    }
}