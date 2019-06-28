module rf{
    export class StandardMaterial extends Material{



        uploadContext(camera:Camera,mesh:Mesh, now: number, interval: number){


            //骨骼动画

            //灯光

            //阴影

            return false;
        }

        

        createProgram(mesh:Mesh){

            let p:Program3D;
            let c = context3D;
            let vertexCode ;
            let fragmentCode;
            let key;


            




            p = c.createProgram(vertexCode,fragmentCode,key);
            return p;
        }

    }
}