class Util 
{
    static playerScore = 0;

    static getRndInteger(min, max) 
    {
        return Math.floor(Math.random() * (max - min + 1) ) + min;
    }

    static staticImage(scene, texture, scale)
    {
        scene.add.image(0, 0, texture).setOrigin(0,0).setScale(scale);
    }
    
    static createBackgroundImage(scene, texture, scale)
    {
        let textureObject = scene.textures.get(texture);
        let width = textureObject.getSourceImage().width;
        let height = textureObject.getSourceImage().height;
        let background = scene.add.tileSprite(width/2, height/2, game.config.width, game.config.height, texture);
        background.setOrigin(0, 0);
        background.setScrollFactor(0);
        background.setScale(scale);
        return background;
    }

    static moveBackground(bg, camera, rate)
    {
        bg.tilePositionX = camera.scrollX * rate;
    }

    static createLayerCollision(map)
    {
        for(let layer of map.layers)
        {
            let tileset = map.tilesets[0];
            for(let i = 0; i < map.width; i++)
            {
                for(let j = 0; j < map.height; j++)
                {
                    let tile = layer.tilemapLayer.getTileAt(i, j);
                    if(tile != null)
                    {
                        let tileProps = tileset.getTileProperties(tile.index);
                        if(tileProps != null)
                        {
                            if(tileProps.jumpthru)
                                tile.setCollision(false, false, true, false, false);
                            else if(tileProps.collides)
                                tile.setCollision(true, true, true, true);
                            else
                                tile.resetCollision(false);
                        }
                    }
                }
            }
        }
    }
}