module rf{

    export let RX = 55;
    export let SY = 1/Math.cos(RX*DEGREES_TO_RADIANS);
    export let OBJECT2D_SCALE = 80;

    export const enum SCENE_MODEL{
        MAP2D,        //2D地图中
        MAP3D,          //3D地图中，Z朝上
        UI,         //UI中
        CONTIANER   //被addchild， Y朝上
    }

    export class MapObject extends SceneObject{

        constructor(){
            super();
            this.createContainer();
        }

        container:SceneObject;

        sceneModel:SCENE_MODEL

        setSceneModel(value:SCENE_MODEL){
            this.sceneModel = value;

            let{container}=this;

            switch(value){
                case SCENE_MODEL.MAP2D:
                    container.scale = OBJECT2D_SCALE;
                    container.setRot(90,0,180);
                    break;
                case SCENE_MODEL.UI:
                    container.scale = OBJECT2D_SCALE;
                    container.setRot(0,0,180);
                    break;
                case SCENE_MODEL.MAP3D:
                    container.scale = 1;
                    container.setRot(90,0,180);
                    break;
                case SCENE_MODEL.CONTIANER:
                    container.scale = 1.0;
                    container.setRot(0,0,0);
                    break;
            }

        }

        createContainer(){
            let container = new SceneObject();
            container.scale = OBJECT2D_SCALE;
            container.setRot(0,0,180);
            this.addChild(container);
            this.container = container;
        }


        set rotation(value:number){
            this.rotationZ = value - 90;
        }

        get rotation():number{
            return this.rotationZ + 90;
        }

        updateTransform() {
            const{transform,pivotZero, sceneModel}=this;
            let sy = sceneModel == SCENE_MODEL.MAP2D ? rf.SY : 1;
            if (pivotZero) {
                const{pivotPonumber}=this;
                let{0:x,1:y,2:z}=pivotPonumber;
                transform.m3_identity();
                // transform.m3_translation(pivotPonumber.x, pivotPonumber.y, pivotPonumber.z);
                transform.m3_translation(-x,-y,-z);
                transform.m3_scale(this._scaleX, this._scaleY, this._scaleZ);
                transform.m3_translation(this._x+x, this._y*sy+y, this._z + z);
            } else {
                let{pos,sceneModel,rot,sca} = this;

                if(sceneModel == SCENE_MODEL.MAP2D){
                    let temp = TEMP_VECTOR3D;
                    temp[0] = pos[0];
                    temp[1] = pos[1] * sy;
                    temp[2] = pos[2];
                    temp[3] = pos[3]
                    transform.m3_recompose(temp,rot,sca);
                }else{
                    transform.m3_recompose(pos,rot,sca);
                }

                
            }
            this.status &= ~DChange.trasnform;
        }


        setTransform(matrix:ArrayLike<number>){
            super.setTransform(matrix);
            let{_y,sceneModel}=this;
            if(sceneModel == SCENE_MODEL.MAP2D){
                this.pos.y = this._y = _y / SY;
            }
        }

    }
}