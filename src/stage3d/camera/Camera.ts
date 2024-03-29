///<reference path="../display/DisplayObject.ts" />
module rf{
    export class Camera extends DisplayObject{
        len:IMatrix3D;
        far :number;
        originFar:number;
        logDepthFar:number;
        worldTranform:IMatrix3D;
        isPerspectiveCamera:boolean = false;
        isOrthographicCamera:boolean = false;
        contextMatrix:IMatrix3D;
        constructor(far:number = 10000,contextMatrix?:IMatrix3D){
            super();
            this.far = far;
            this.originFar = far;
            this.len = newMatrix3D();
            this.worldTranform = newMatrix3D();
            if(!contextMatrix){
                contextMatrix = contextMatrix2D;
            }
            this.contextMatrix = contextMatrix;
        }

        updateSceneTransform(updateStatus?:number){
            if( this.status | DChange.trasnform){
                this.updateTransform();
                this.sceneTransform.m3_invert(this.transform);
                this.sceneTransform.m3_append(this.contextMatrix);
                this.worldTranform.m3_append(this.len,false,this.sceneTransform);
            }
            this.status = 0;
            return 0;
        }

        resize(width: number, height: number){

        }
    }

    export function CameraUIResize(width: number, height: number,len:IMatrix3D,far:number,originFar,camera?:Camera){
        if(camera){
            camera.w = width;
            camera.h = height;
            camera.far = far;
            camera.status |= DChange.trasnform;
            camera.isOrthographicCamera = true;
            camera.isPerspectiveCamera = false;
            camera.resize(width,height);
        }
        

        len[0] = 2/width;
        len[1] = 0;
        len[2] = 0;
        len[3] = 0;

        len[4] = 0;
        len[5] = -2/height;
        len[6] = 0;
        len[7] = 0;

        len[8] = 0;
        len[9] = 0;
        len[10] = -1/far;
        len[11] = 0;

        len[12] = -1;
        len[13] = 1;
        len[14] = 0;
        len[15] = 1;

        
    }


    export function CameraOrthResize(width: number, height: number,len:IMatrix3D,far:number,originFar,camera?:Camera){
        if(camera){
            camera.w = width;
            camera.h = height;
            camera.far = far;
            camera.status |= DChange.trasnform;
            camera.isOrthographicCamera = true;
            camera.isPerspectiveCamera = false;
        }
       

        len[0] = 2/width;
        len[1] = 0;
        len[2] = 0;
        len[3] = 0;

        len[4] = 0;
        len[5] = 2/height;
        len[6] = 0;
        len[7] = 0;

        len[8] = 0;
        len[9] = 0;
        len[10] = 1/far;
        len[11] = 0;

        len[12] = 0;
        len[13] = 0;
        len[14] = -1/far*Math.PI*100;
        // len[14] = -1/far;
        len[15] = 1;

       
    }

    //  Perspective Projection Matrix
    export function Camera3DResize(width: number, height: number,len:IMatrix3D,far:number,originFar:number,camera?:Camera): void{
        if(camera){
            camera.w = width;
            camera.h = height;
            camera.far = far;
            camera.originFar = originFar = far / Math.PI2;
            camera.status |= DChange.trasnform;
            camera.isPerspectiveCamera = true;
            camera.isOrthographicCamera = false;
        }
        

        // let zNear = 0.1;
        // let zFar = far;

        // let len = new PerspectiveMatrix3D();
        // len.perspectiveFieldOfViewLH(45,width/height,0.1,10000);
        // len.perspectiveFieldOfViewRH(45,width/height,0.1,10000);
        // this.len = len;
        // len.transpose();

        // xScale, 0.0, 0.0, 0.0,
        // 0.0, yScale, 0.0, 0.0,
        // 0.0, 0.0, (zFar + zNear) / (zFar - zNear), 1.0,
        // 0.0, 0.0, 2.0 * zFar * zNear / (zNear - zFar), 0.0
        
        // (zFar + zNear) / (zFar - zNear)
        // 2.0 * zFar * zNear / (zNear - zFar)

        // this.len = len;
        // let yScale: number = 1.0 / Math.tan(45 / 2.0);
        // let xScale: number = yScale / width * height;
        // len[0] = xScale;        len[1] = 0;                   len[2] = 0;                                       len[3] = 0;
        // len[4] = 0;             len[5] = yScale;              len[6] = 0;                                       len[7] = 0;
        // len[8] = 0;             len[9] = 0;                   len[10] = (zFar + zNear) / (zFar - zNear);        len[11] = 1.0;
        // len[12] = 0;            len[13] = 0;                  len[14] = 2.0 * zFar * zNear / (zNear - zFar);    len[15] = 0;

        len[0] = 2/width;      len[1] = 0;             len[2] = 0;                          len[3] = 0;
        len[4] = 0;            len[5] = 2/height;      len[6] = 0;                          len[7] = 0;
        len[8] = 0;            len[9] = 0;             len[10] = 1/far;                     len[11] = 1/originFar;
        len[12] = 0;           len[13] = 0;            len[14] = -1/far*Math.PI*100;        len[15] = 0;

        len[14] = -1/far * Math.PI;
    }


    export function PerspectiveResize(width: number, height: number,len:IMatrix3D,far:number,degree:number,camera?:Camera): void{
        let radians = degree * DEGREES_TO_RADIANS;
        let zNear = 0.5; //500mm
        let zFar = far;

        let wh = 640/1080.;
        let xScale:number;
        let yScale:number;
        let standardS:number = 1/Math.tan(radians / 2.0);
        let wh2 = width/height;
        let h:number = height;
        if(wh2 < wh){
            h = width/wh;
        }
        yScale = standardS * h / height;
        xScale = standardS * h / width;
        // let standardHeight = 960;
        // let standardHeight = height;
        // let standardSy: number = 1.0 / Math.tan(radians / 2.0);
        // let yScale: number = standardSy * standardHeight / height;
        // let xScale: number = standardSy * standardHeight / width;

        if(camera){
            camera.w = width;
            camera.h = height;
            camera.far = far;
            camera.originFar = 0.5*height*yScale;
            camera.logDepthFar = 1.0 / ( Math.log( camera.far + 1.0 ) / Math.LN2 );

            camera.status |= DChange.trasnform;
            camera.isPerspectiveCamera = true;
            camera.isOrthographicCamera = false;
        }

        len[0] = xScale;        len[1] = 0;                   len[2] = 0;                                       len[3] = 0;
        len[4] = 0;             len[5] = yScale;              len[6] = 0;                                       len[7] = 0;
        len[8] = 0;             len[9] = 0;                   len[10] =  (zFar + zNear) / (zFar - zNear);        len[11] = 1.0;
        len[12] = 0;            len[13] = 0;                  len[14] =  zFar * zNear / (zNear - zFar);    len[15] = 0;
        
    }
}