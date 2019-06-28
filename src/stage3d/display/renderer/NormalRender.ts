module rf{
    export class NormalRender implements I3DRender {

        target:Sprite;

        constructor(target: Sprite) {
            this.target = target;
        }


        

        render(camera:Camera,option:IRenderOption){

            let target = this.target;
            let c = context3D;
            const{source,status,_x,_y,_scaleX,scrollRect,sceneTransform} = target;
            if(!source || !source.bmd){
                return;
            }
            let{textureData}=source;
            if(!textureData) {
                source.textureData = textureData =  c.getTextureData(source.name,false);
            }


        }

    }
}

