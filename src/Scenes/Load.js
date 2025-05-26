class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "Tilemaps/tilemap_packed.png");                         // Packed tilemap
        this.load.image("background_basic", "Background.png");
        this.load.image("background_green", "GreenBackground.png");
        this.load.image("win_screen", "WinScreenImage.png");
        this.load.bitmapFont("pixelFont", "pixel_font_0.png", "pixel_font.fnt");
        this.load.bitmapFont("blockFont", "block_font_0.png", "block_font.fnt");

        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Tilemap in JSON

        // Load audio
        this.load.audio("sfx_jump", "SFX/jump.wav");
        this.load.audio("sfx_land", "SFX/landing.wav");
        this.load.audio("sfx_coin", "SFX/pickupCoin.wav");
        this.load.audio("sfx_walk1", "SFX/walking1.wav");
        this.load.audio("sfx_walk2", "SFX/walking2.wav");
        this.load.audio("sfx_walk3", "SFX/walking3.wav");

        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "Tilemaps/tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        // Oooh, fancy. A multi atlas is a texture atlas which has the textures spread
        // across multiple png files, so as to keep their size small for use with
        // lower resource devices (like mobile phones).
        // kenny-particles.json internally has a list of the png files
        // The multiatlas was created using TexturePacker and the Kenny
        // Particle Pack asset pack.
        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

        this.anims.create({
            key: 'coinspin',
            defaultTextureKey: "tilemap_sheet",
            frames: [
                { frame: 151 },
                { frame: 152 }
            ],
            frameRate: 2,
            repeat: -1
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}