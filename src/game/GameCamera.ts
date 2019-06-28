module rf{

    // export class ContextCamera extends Camera{

    //     // contextMatrix:IMatrix3D;
    //     constructor(far:number = 10000){
    //         super(far);
    //     }

    //     updateSceneTransform(sceneTransform?:IMatrix3D){
    //         if( this.status & DChange.trasnform){
    //             this.updateTransform();
    //             this.sceneTransform.m3_invert(this.transform);
    //             this.sceneTransform.m3_append(contextMatrix);
    //             this.worldTranform.m3_append(this.len,false,this.sceneTransform);
    //         }
    //         this.status = 0;
    //     }
    // }



    export class Arpg2DCamera extends Camera implements ITickable,IResizeable{

        map:SnakeMap;

        watchTarget:DisplayObject;

        top:number;
        left:number;
        right:number;
        bottom:number;

        init(){
            let {sw,sh,data} = this.map
            let {w,h} = data

            let hw = sw >> 1;
            let hh = sh >> 1;

            this.top = hh;
            this.left = hw;
            this.right = w - hw;
            this.bottom = h - hh;

        }

        resize(width: number, height: number){
            if(this.map){
                this.init();
            }
        }

        update(now: number, interval: number){
            let{watchTarget,map} = this;
            if(!watchTarget || !map){
                return;
            }

            let{sceneTransform}=watchTarget;
            let{top,left,right,bottom}=this;

            let _x = sceneTransform[12];
            let _y = sceneTransform[13] + Math.floor(top * 0.3);
            let _z = sceneTransform[14];
            let _w = 1000;


            // scene.sun.setPos(_x+150,_y-100,_z+300);
            
            // scene.sun.lookat(newVector3D(_x,_y,_z));
            // scene.sun.updateTransform();

            _x = Math.max(left,Math.min(_x,right)) - left;
            _y = Math.max(top,Math.min(_y,bottom)) - top;

            _x = Math.round(_x);
            _y = Math.round(_y);


            scene.sun.setSunOffset(_x + left,_y + top,_z);

            

            // if(_x != this._x && _y != this._y){
            this.setPos(_x,_y,_z);
            map.setviewRect(_x,_y);

            




            // }
        }
    }


}