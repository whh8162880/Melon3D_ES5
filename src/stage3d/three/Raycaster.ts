///<reference path="../geom/Ray.ts" />
module rf {
    export class Raycaster{
        constructor(far = 10000, near=0){
            this.ray = new Ray()
            this.near = near;
            this.far = far;
        }

        ray:Ray;
        near:number = 0;
        far:number = 10000;

        setFromCamera( mousex:number, mousey:number, camera: Camera ) {

            if ( ( camera && camera.isPerspectiveCamera ) ) {
                
                this.ray.origin.set([camera.pos[0], camera.pos[1], camera.pos[2], 1]);
                // console.log("0000000", mousex, mousey, this.ray.origin, camera.rot);
                
                this.ray.direction.set( [mousex,mousey , 0.9999, 1] )

                TEMP_MATRIX3D.m3_invert(camera.len);
                TEMP_MATRIX3D.m3_transformVector(this.ray.direction,this.ray.direction);
                if(this.ray.direction.w != 0){
                    this.ray.direction.v4_scale(1/this.ray.direction.w);
                }
                

                // console.log("111111:", this.ray.direction)
                camera.transform.m3_transformVector(this.ray.direction, this.ray.direction);
                // console.log("222222:", this.ray.direction)
                this.ray.direction.v3_sub( this.ray.origin, this.ray.direction );
                // console.log("333333:", this.ray.direction)
                this.ray.direction.v3_normalize();
                // console.log("444444444:", this.ray.direction)
    
            } else if ( ( camera && camera.isOrthographicCamera ) ) {
                this.ray.origin.set( [mousex, mousey, 0.0, 1 ] )
                camera.worldTranform.m3_transformVector(this.ray.origin, this.ray.origin);
                this.ray.direction.set( [0, 0, 1, 1] );
                camera.transform.m3_transformVector(this.ray.direction,this.ray.direction)
    
            } else {
    
                console.error( 'Raycaster: Unsupported camera type.' );
    
            }
    
        }


        intersectObject(object:SceneObject,intersects:IIntersectInfo[], recursive?:boolean ){
            if ( object.visible === false ) return;

            if(object.mouseEnabled){
                object.raycast(this, intersects);
            }
                
            if(object.mouseChildren && recursive ){
                let{childrens} = object;
                for (let i = 0; i < childrens.length; i++) {
                    const child = childrens[i];
                    if(child instanceof SceneObject){
                        this.intersectObject(child, intersects, true);
                    }
                }
            }

        }


        intersectObjects(arr:DisplayObject[], recursive?:boolean, intersects?:IIntersectInfo[]):IIntersectInfo[]{
            let result:IIntersectInfo[] = intersects || []

            for ( let i = 0, l = arr.length; i < l; i ++ ) {
                let child = arr[i];
                if(child instanceof SceneObject){
                    this.intersectObject( child,  result, recursive );
                }
            }
            result.sort(Raycaster.disSort)
            return result;
        }

        static disSort(a:IIntersectInfo, b:IIntersectInfo):number{
            return a.distance - b.distance;
        }

    }

    export interface IIntersectInfo{
        obj:SceneObject;
        distance:number;
        point:IVector3D;
    }
}