export default class Fish extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, fishData) {
        super(scene, x, y, 'fish_placeholder');
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setCollideWorldBounds(true);
        this.setBounce(1, 1);
        this.setVelocity(Phaser.Math.Between(-50, 50), Phaser.Math.Between(-20, 20));

        this.fish_id = Phaser.Math.RND.uuid();
        this.fish_type_id = fishData.id;
        this.current_hunger = fishData.max_hunger;
        this.current_affection = 50.0;
        this.hunger_decay_rate = fishData.decay_rate;
        this.status_state = 'NORMAL';
        
        this.decayTimer = scene.time.addEvent({
            delay: 1000,
            callback: this.updateStatus,
            callbackScope: this,
            loop: true
        });
    }

    updateStatus() {
        if (this.status_state === 'DEAD') {
            this.setVelocity(0, -20);
            return;
        }

        let dt = 1;

        this.current_hunger = Math.max(0, this.current_hunger - (this.hunger_decay_rate * dt));

        if (this.current_hunger > 30) {
            this.current_affection = Math.min(100, this.current_affection + (0.01 * dt));
        } else if (this.current_hunger <= 30 && this.current_hunger > 0) {
            this.current_affection = Math.max(0, this.current_affection - (0.05 * dt));
        } else if (this.current_hunger === 0) {
            this.current_affection = Math.max(0, this.current_affection - (0.2 * dt));
        }

        if (this.current_affection <= 30 && this.current_hunger > 0) {
            this.status_state = 'ANXIOUS';
            this.setTint(0xff0000);
        } else if (this.current_hunger === 0 && this.current_affection === 0) {
            this.status_state = 'DEAD';
            this.setTint(0x555555);
        } else {
            this.status_state = 'NORMAL';
            this.clearTint();
        }
    }
}