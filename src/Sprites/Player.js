class Player extends Phaser.Physics.Arcade.Sprite
{
    constructor(scene, x, y, texture, frame)
    {
        super(scene, x, y, texture, frame);
        
        this.ACCELERATION = 400;
        this.MAXSPEED_X = 500;
        this.TURN_MULTIPLIER = 3;
        this.DRAG = 800;    // DRAG < ACCELERATION = icy slide
        this.JUMP_VELOCITY = -450;
        this.PARTICLE_VELOCITY = 50;

        this.inTheAir = false;
        this.jumpTimer = 0;
        this.walkTimer = 0;
        this.score = 0;
        this.scene = scene;
        this.spawnPoint = {
            x: x,
            y: y
        };

        this.jumpSound = scene.sound.add('sfx_jump', { volume: 0.3, });
        this.landSound = scene.sound.add('sfx_land', { volume: 0.3, });
        
        // this.scoreMessage = scene.add.bitmapText(10, 10, "blockFont", "Score: " + this.score, 20);
        // this.scoreMessage.setOrigin(0, 0).setCenterAlign();

        my.vfx.walking = this.scene.add.particles(0, 0, "kenny-particles", {
            frame: ['fire_01.png', 'fire_02.png'],
            scale: {start: 0.03, end: 0.07},
            x: {min: 0, max: 10},
            lifespan: 350,
            gravityY: -200,
            alpha: {start: 1, end: 0.1}, 
        });
        my.vfx.walking.stop();

        my.vfx.firework = this.scene.add.particles(0, 0, "kenny-particles", {
            frame: 'star_06.png',
            scale: { min: 0.4, max: 1.2},
            velocityX: { min: -100, max: 100 },
            velocityY: { min: -100, max: 100 },
            maxAliveParticles: 30,
            lifespan: 350,
            duration: 1000, 
        });
        my.vfx.firework.stop();

        my.vfx.jump = this.scene.add.particles(0, 0, "kenny-particles", {
            frame: 'muzzle_01.png',
            scaleX: {start: 0.05, end: 0.20},
            scaleY: {start: 0.15, end: 0.02},
            y: {start: 0, end: 25},
            maxAliveParticles: 1,
            lifespan: 350,
            duration: 345,
            alpha: {start: 1, end: 0.05}, 
        });
        my.vfx.jump.stop();

        cursors = this.scene.input.keyboard.createCursorKeys();
        scene.add.existing(this);

        scene.physics.world.enable(this);
        this.body.setMaxVelocityX(this.MAXSPEED_X);
        this.setFlip(true, false);
        this.setDepth(2);
        this.setCollideWorldBounds(true);
        for(let layer of scene.loadedLayers)
            scene.physics.add.collider(this, layer);
    }

    playWalkSfx()
    {
        if(this.walkTimer <= 0)
        {
            this.scene.sound.play('sfx_walk' + String(Util.getRndInteger(1, 3)), { volume: 0.1, });
            this.walkTimer = 5;
        }
    }

    update()
    {
        if(cursors.left.isDown) {
            this.setAccelerationX((this.body.velocity.x > 0) ? (-this.ACCELERATION * this.TURN_MULTIPLIER) : -this.ACCELERATION);
            this.resetFlip();
            this.anims.play('walk', true);
            my.vfx.walking.startFollow(this, this.displayWidth/2-10, this.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (this.body.blocked.down) {
                my.vfx.walking.start();
                this.playWalkSfx();
            }

        } else if(cursors.right.isDown) {
            this.setAccelerationX((this.body.velocity.x < 0) ? (this.ACCELERATION * this.TURN_MULTIPLIER) : this.ACCELERATION);
            this.setFlip(true, false);
            this.anims.play('walk', true);
            my.vfx.walking.startFollow(this, this.displayWidth/2-14, this.displayHeight/2, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            // Only play smoke effect if touching the ground
            if (this.body.blocked.down) {
                my.vfx.walking.start();
                this.playWalkSfx();
            }

        } else {
            // Set acceleration to 0 and have DRAG take over
            this.setAccelerationX(0);
            this.setDragX(this.DRAG);
            this.anims.play('idle');
            my.vfx.walking.stop();
        }

        // player jump
        // note that we need body.blocked rather than body.touching b/c the former applies to tilemap tiles and the latter to the "ground"
        if(!this.body.blocked.down) {
            this.anims.play('jump');
        }
        if(this.body.blocked.down && Phaser.Input.Keyboard.JustDown(cursors.up)) {
            this.jumpSound.play();
            this.jumpTimer = 5;
            my.vfx.jump.x = this.x;
            my.vfx.jump.y = this.y-20;
            my.vfx.jump.start();
            this.body.setVelocityY(this.JUMP_VELOCITY);
            my.vfx.walking.stop();
        }
        if(this.body.velocity.y != 0)
            this.inTheAir = true;
        if(this.body.blocked.down && this.inTheAir && this.jumpTimer != 5)
        {
            this.inTheAir = false;
            this.landSound.play();
        }

        if(this.jumpTimer > 0)
            this.jumpTimer -= 1;
        if(this.walkTimer > 0)
            this.walkTimer -= 1;
    }

    die(type)
    {
        this.active = false;
        this.scene.cameras.main.stopFollow();
        if(type == "falling")
        {
            this.deathTimer = this.scene.time.addEvent({
                delay: 800,
                callback: this.respawn,
                callbackScope: this,
                loop: false,
            });
        }
    }

    win()
    {
        Util.playerScore = this.score;
        my.vfx.firework.x = this.x;
        my.vfx.firework.y = this.y;
        my.vfx.firework.start();
        this.winTimer = this.scene.time.addEvent({
            delay: 1000,
            callback: () => { this.scene.scene.start("winScene"); },
            callbackScope: this,
            loop: false,
        })
    }

    respawn()
    {
        this.active = true;
        this.setVelocity(0, 0);
        this.x = this.spawnPoint.x;
        this.y = this.spawnPoint.y - this.displayHeight/2;
        this.scene.cameras.main.startFollow(this, true, 0.25, 0.25);
        this.visible = true;
        this.flashTimer = this.scene.time.addEvent({
            delay: 200,
            callback: () => { this.visible = (this.visible) ? false : true; },
            callbackScope: this,
            loop: false,
            repeat: 5,
        });
    }
}