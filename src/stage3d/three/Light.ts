///<reference path="../Stage3D.ts" />
module rf{
    export class Light extends Camera{
        color:number = 0xFFFFFF;
        intensity:number = 1.0;
        lookVector:IVector3D = newVector3D(0,0,0);
        updateSceneTransform(updateStatus?:number,parentSceneTransform?:IMatrix3D){
            if( this.status | DChange.trasnform){
                let{transform,lookVector,sceneTransform,len}=this;
                // this.lookat(lookVector);
                this.updateTransform();
                this.sceneTransform.m3_invert(transform);
                this.worldTranform.m3_append(len,false,sceneTransform);
            }
            this.status = 0;
            return 0;
        }
    }

    export class DirectionalLight extends Light{
        lightoffset = newVector3D() as IVector3D;
        normalsize = newVector3D();
        setDirectional(x:number,y:number,z:number){
            this.setPos(x,y,z);
            this.normalsize.v3_normalize(this.pos);
        }

        setSunOffset(x:number,y:number,z:number){
            let{0:tx,1:ty,2:tz} = this.lightoffset;
            this.setPos(x+tx,y+ty,z+tz);
            // this.lookat(newVector3D(x,y,z));
        }

    }
}