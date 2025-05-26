class Platformer extends Phaser.Scene {
    constructor() {
        super("platformerScene");
    }

    init() {
        // variables and settings
        this.physics.world.gravity.y = 1500;
        this.SCALE = 2.0;

        this.coinSound = this.sound.add('sfx_coin', { volume: 0.3, });
    }

    preload()
    {
        this.load.scenePlugin('AnimatedTiles', './lib/AnimatedTiles.js', 'animatedTiles', 'animatedTiles');
    }

    create() {
        // Create a new tilemap game object which uses 18x18 pixel tiles, and is
        // 45 tiles wide and 25 tiles tall.
        this.map = this.add.tilemap("platformer-level-1", 18, 18, 40, 25);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels * 1.5);

        // Add a tileset to the map
        // First parameter: name we gave the tileset in Tiled
        // Second parameter: key for the tilesheet (from this.load.image in Load.js)
        this.tileset = this.map.addTilesetImage("KennyBasicPlat", "tilemap_tiles");

        // Create a layer
        this.bg_1 = Util.createBackgroundImage(this, "background_basic", 2);
        // groundLayer must be named as such for player object to use it
        this.groundLayer = this.map.createLayer("groundLayer", this.tileset, 0, 0);
        this.overlapLayer = this.map.createLayer("overlap1", this.tileset, 0, 0).setDepth(1);
        this.overlap2 = this.map.createLayer("overlap2", this.tileset, 0, 0).setDepth(3);
        this.loadedLayers = [this.groundLayer, this.overlapLayer, this.overlap2];

        this.playerLayer = this.map.getObjectLayer("playerSpawn");
        this.playerSpawn = {
            x: this.playerLayer.objects[0].x,
            y: this.playerLayer.objects[0].y
        };


        // Make the layers collidable
        Util.createLayerCollision(this.map);

        // Find coins in the "Objects" layer in Phaser
        // Look for them by finding objects with the name "coin"
        // Assign the coin texture from the tilemap_sheet sprite sheet
        // Phaser docs:
        // https://newdocs.phaser.io/docs/3.80.0/focus/Phaser.Tilemaps.Tilemap-createFromObjects

        this.coins = this.map.createFromObjects("Interactables", {
            name: "coin",
            key: "tilemap_sheet",
            frame: 151
        });

        this.deathZones = this.map.createFromObjects("Death_Boxes", {
            name: "death",
        });

        this.winZone = this.map.createFromObjects("Interactables", {
            name: "win",
        })
        

        // Since createFromObjects returns an array of regular Sprites, we need to convert 
        // them into Arcade Physics sprites (STATIC_BODY, so they don't move) 
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.deathZones, Phaser.Physics.Arcade.STATIC_BODY);
        this.physics.world.enable(this.winZone, Phaser.Physics.Arcade.STATIC_BODY);

        // Create a Phaser group out of the array of objects
        // This will be used for collision detection below.
        this.coinGroup = this.add.group(this.coins);
        for(let child of this.coinGroup.getChildren())
            child.anims.play('coinspin', true);
        this.deathBoxGroup = this.add.group(this.deathZones);
        for(let child of this.deathBoxGroup.getChildren())
            child.visible = false;
        this.winGroup = this.add.group(this.winZone);
        for(let child of this.winGroup.getChildren())
            child.visible = false;

        // set up player avatar
        my.sprite.player = new Player(this, this.playerSpawn.x, this.playerSpawn.y, "platformer_characters", "tile_0000.png");

        // Handle collision detection with coins
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => 
        { 
            my.vfx.coin.x = obj2.x;
            my.vfx.coin.y = obj2.y;
            my.vfx.coin.start();
            this.coinSound.play();
            obj1.score += 50;
            obj2.destroy(); // remove coin on overlap
        });

        // Handle collision with death boxes
        this.physics.add.overlap(my.sprite.player, this.deathBoxGroup, (obj1, obj2) => {
            obj1.die("falling");
        });

        // Handle collision with win boxes
        this.physics.add.overlap(my.sprite.player, this.winGroup, (obj1, obj2) => {
            obj1.win();
        });
        
        this.rKey = this.input.keyboard.addKey('R');

        // debug key listener (assigned to D key)
        this.input.keyboard.on('keydown-D', () => {
            this.physics.world.drawDebug = this.physics.world.drawDebug ? false : true
            this.physics.world.debugGraphic.clear()
        }, this);

        my.vfx.coin = this.add.particles(0, 0, "kenny-particles", {
            frame: ['magic_05.png'],
            scale: {start: 0.03, end: 0.3},
            alpha: {start: 1, end: 0.1},
            lifespan: 200,
            duration: 1,
        });
        my.vfx.coin.stop();
        
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels);
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25); // (target, [,roundPixels][,lerpX][,lerpY])
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);

        this.animatedTiles.init(this.map);
    }

    update() 
    {
        if(Phaser.Input.Keyboard.JustDown(this.rKey)) {
            this.scene.restart();
        }
        // player movement
        my.sprite.player.update();

        // background movement
        Util.moveBackground(this.bg_1, this.cameras.main, 0.1);
    }
}