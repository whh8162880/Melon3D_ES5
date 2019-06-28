module rf{

    export function skeleton_debug(){

    }


    class SkeletonDebuger extends SceneObject{

        mesh:KFMMesh;
        constructor(mesh:KFMMesh){
            super();
            this.mesh = mesh;

            if(!mesh.kfm){
                mesh.on(EventT.COMPLETE,this.meshReadlyHandler,this);
            }else{
                this.startFollow();
            }
        }


        meshReadlyHandler(event:EventX){
            event.currentTarget.off(event.type,this.meshReadlyHandler,this);
            this.startFollow();
        }


        startFollow(){
            let{skAnim}=this.mesh;
            if(skAnim){
                skAnim.on(EventT.CHANGE,this.buildMesh,this);
                this.buildMesh();
            }

        }



        buildMesh(event?:EventX){
            let{skAnim} = this.mesh;
            let boneTransform = skAnim.currentBoneTransfrom;
            let bone = skAnim.skeleton.rootBone;

        }


        
    }

}