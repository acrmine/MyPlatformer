class Util 
{
    static createBackgroundImage(scene, texture, scale)
    {
        let textureObject = scene.textures.get(texture);
        let width = textureObject.getSourceImage().width;
        let height = textureObject.getSourceImage().height;
        scene.background = scene.add.image((width/2)*scale, (height/2)*scale, texture);
        scene.background.setScale(scale);
    }

    static createLayerCollision(map)
    {
        for(let layer of map.layers)
        {
            console.log("got to layers");
            for(let i = 0; i < map.width; i++)
            {
                for(let j = 0; j < map.height; j++)
                {
                    let tile = layer.tilemapLayer.getTileAt(i, j);
                    if(tile != null)
                    {
                        console.log("tile jumpthru: " + tile.properties.jumpthru);
                        console.log("tile collides: " + tile.properties.collides);
                        if(tile.jumpthru)
                            tile.setCollision(true, true, true, true, false);
                        else if(tile.collides)
                            tile.setCollision(true, true, true, true, false);
                        else
                            tile.resetCollision(false);
                    }
                }
            }
        }
    }
}