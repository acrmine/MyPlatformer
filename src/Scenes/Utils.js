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
}