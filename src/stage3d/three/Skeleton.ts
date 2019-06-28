///<reference path="../Stage3D.ts" />
///<reference path="./ThreeInterface.ts" />

module rf{

    export interface ISkeletonRenderData{
        skeleton:Skeleton;
        matrices:Float32Array;
    }

    export class Skeleton extends MiniDispatcher {
        rootBone: IBone;
        // bonePose: IBonePose;
        defaultMatrices: Float32Array;
        vertex: VertexBuffer3D;
        boneCount: number;
        animations: { [key: string]: ISkeletonAnimationData } = {};
        id:string;

        size:number;
        boneTransform:{[key:string]:IMatrix3D}

        constructor(config: ISkeletonData,id:string) {
            super();

            this.id = id;

            let { boneCount, defaultMatrices ,boneTransform } = this;

            this.boneCount = boneCount = config.boneCount;
            // let buffer = new ArrayBuffer(16 * 4 * boneCount);
            let buffer = new ArrayBuffer(8 * 4 * boneCount);
            this.defaultMatrices = defaultMatrices = new Float32Array(buffer);

            this.boneTransform = boneTransform = {};

            function init(bone: IBone,boneTransform:{[key:string]:IMatrix3D}) {
                let { inv, matrix, parent, children, name, index } = bone;
                if (undefined != inv) {
                    bone.inv = inv = new Float32Array(inv);
                }
                bone.matrix = matrix = new Float32Array(matrix);
                let sceneTransform = new Float32Array(matrix);
                if (parent) {
                    sceneTransform.m3_append(parent.sceneTransform);
                    // matrix3d_multiply(sceneTransform, parent.sceneTransform, sceneTransform);
                }

                if (index > -1) {
                    // let matrice = new Float32Array(buffer, index * 16 * 4, 16);
                    // matrice.m3_append(sceneTransform, false, inv);
                    index *= 2;
                    let matrice = newMatrix3D();
                    matrice.m3_append(sceneTransform, false, inv);
                    let qua = new Float32Array(buffer, index * 4 * 4, 4);
                    let pos = new Float32Array(buffer, (index+1) * 4 * 4, 4);
                    matrice.m3_decompose(pos,qua,undefined,2);

                }

                bone.sceneTransform = sceneTransform.clone();

                boneTransform[bone.name] = sceneTransform.m3_rotation(90,X_AXIS,true);

                children.forEach(b => {
                    init(b,boneTransform);
                });
            }

            init(config.root,boneTransform);

            this.rootBone = config.root;

            this.vertex = context3D.createVertexBuffer(new VertexInfo(new Float32Array(config.vertex), config.data32PerVertex, vertex_skeleton_variable));


            // var size = Math.sqrt( boneCount * 4 ); // 4 pixels needed for 1 matrix
            // size = Math.pow( 2, Math.ceil( Math.log( size ) / Math.LN2 ) );
            // size = Math.max( size, 4 );
            // this.size = size;
            // this.boneTexture = context3D.createEmptyTexture(context3D.getTextureData(id,false),size,size);
        }

        initAnimationData(anim: ISkeletonAnimationData) {
            anim.skeleton = this;
            anim.matrices = [];
            anim.boneTransform = [];
            anim.boneMatrix3D = [];
            let frames = anim.frames;
            for (let key in frames) {
                frames[key] = new Float32Array(frames[key]);
            }
            this.animations[anim.name] = anim;
        }


        createAnimation() {
            let anim = recyclable(SkeletonAnimation);
            anim.skeleton = this;
            anim.currentBoneTransfrom = this.boneTransform;
            return anim;
        }


        getMatricesData(anim: ISkeletonAnimationData, frame: number) {
            let result = anim.matrices[frame];
            if (undefined != result) {
                return result;
            }

            let { boneCount, rootBone } = this;
            let { frames } = anim;


            let map: { [key: string]: IBone } = {};

            let buffer = new ArrayBuffer(8 * 4 * boneCount);
            result = new Float32Array(buffer);
            anim.matrices[frame] = result;

            let boneTransform = {};
            anim.boneTransform[frame] = boneTransform;

            let matrice = TEMP_MATRIX3D;
            function update(bone: IBone,boneTransform:{[key:string]:IMatrix3D}) {
                let { inv, matrix, sceneTransform, parent, children, name, index } = bone;
                let frameData = frames[bone.name];

                if (frameData) {
                    matrix.set(frameData.subarray(frame * 16, (frame + 1) * 16));
                }

                if (parent) {
                    sceneTransform.m3_append(parent.sceneTransform, false, matrix)
                    // matrix3d_multiply(matrix, parent.sceneTransform, sceneTransform);
                    // multiplyMatrices(parent.sceneTransform,matrix,sceneTransform);

                } else {
                    sceneTransform.set(matrix);
                }

               

                if (index > -1) {
                    // let matrice = new Float32Array(buffer, index * 16 * 4, 16);
                    // matrice.m3_append(sceneTransform, false, inv);

                    index *= 2;
                    matrice.m3_append(sceneTransform, false, inv);
                    let qua = new Float32Array(buffer, index * 4 * 4, 4);
                    let pos = new Float32Array(buffer, (index+1) * 4 * 4, 4);
                    matrice.m3_decompose(pos,qua,undefined,Orientation3D.QUATERNION);
                    // let newMat = qua2mat(qua,pos);

                }


                boneTransform[name] = sceneTransform.clone().m3_rotation(90,X_AXIS,true);


                map[bone.name] = bone;

                for (let i = 0; i < children.length; i++) {
                    update(children[i],boneTransform);
                }

                // children.forEach(element => {
                //     update(element);
                // });
            }

            update(rootBone,boneTransform);


            return result;
        }

        loadAnimationComplete(e:EventX){
            if(e.type == EventT.COMPLETE){
                this.initAnimationData(e.data);
                this.simpleDispatch(e.type,e.data);
            }
        }


        mediumpCalcA = {pos:newVector3D(),qua:newVector3D(),mat:newMatrix3D(),out:newVector3D()} as ISkeletonCalcTarget;
        mediumpCalcB = {pos:newVector3D(),qua:newVector3D(),mat:newMatrix3D(),out:newVector3D()} as ISkeletonCalcTarget;
        tempScale = newVector3D(1,1,1,1);

        getMediumpMatricesData(anim:SkeletonAnimation, frame: number,n:number
            ,boneTransform:{[key:string]:IMatrix3D},buffer:ArrayBuffer,bonepq:{[key:string]:ISKeletonBonePQ}) {
            
            let{animation,preAnimation} = anim;

            let{rootBone} = this;
            let frames:{[key:string]:Float32Array};
            let nextFrames:{[key:string]:Float32Array};
            let nextFrame:number;
            frames = animation.data.frames;
            
            let mixtime = 0;
            if(preAnimation.data){
                mixtime = animation.data.totalFrame * animation.data.duration * 0.3;
                if(mixtime > 350){
                    mixtime = 350
                }else if(mixtime < 250){
                    mixtime = Math.min(250, animation.data.totalFrame * animation.data.duration * 0.5);
                }
            }
            if(preAnimation.data && anim.tm.now - preAnimation.stoptime < mixtime){
                nextFrames = preAnimation.data.frames;
                // let duration = (anim.tm.now - preAnimation.starttime) % (preAnimation.data.duration * 1000);
                // let duration = (preAnimation.stoptime - preAnimation.starttime) % (preAnimation.data.duration * 1000);
                // let eDuration = (preAnimation.data.eDuration * 1000)
                // nextFrame = Math.floor(duration / eDuration );
                n =  1 - (anim.tm.now - preAnimation.stoptime) / mixtime;
            }else{
                let totalFrame = animation.data.totalFrame;
                if(frame >= totalFrame-1){
                    nextFrame = 0;
                }else{
                    nextFrame = frame + 1;
                }
                nextFrames = frames;
            }

            this.updateBone(rootBone,frames,frame,nextFrames,nextFrame,n,boneTransform,bonepq);

            // let buffer = new ArrayBuffer(8 * 4 * boneCount);

            this.updateMatrices(rootBone,buffer);
        }



        mixTransform(am:IMatrix3D,bm:IMatrix3D,n:number,bonepq:ISKeletonBonePQ,matrix?:IMatrix3D){
            let{tempScale,mediumpCalcA,mediumpCalcB}=this;
            let{qua:aq,pos:ap} = mediumpCalcA;
            let{qua:bq,pos:bp} = mediumpCalcB;
            let{q,p} = bonepq;
            am.m3_decompose(ap,aq,undefined,Orientation3D.QUATERNION);
            bm.m3_decompose(bp,bq,undefined,Orientation3D.QUATERNION);
            qua_slerp(aq,bq,n,q);
            pos_lerp(ap,bp,n,p);
            if(!matrix){
                matrix = newMatrix3D();
            }
            matrix.m3_recompose(p,q,tempScale,Orientation3D.QUATERNION);
            bonepq.p = p;
            bonepq.q = q;
        }

        preBonematrix:{[key:string]:Float32Array} = {};
        /**
         * 
         * @param bone 
         * @param frames 
         * @param frame 
         * @param nextframes 
         * @param nextFrame 
         * @param n 
         * @param boneTransform 
         */
        updateBone(bone:IBone,
            frames:{[key:string]:Float32Array},frame:number,
            nextframes:{[key:string]:Float32Array},nextFrame:number,
            n:number,
            boneTransform:{[key:string]:IMatrix3D},
            bonepq:{[key:string]:ISKeletonBonePQ}
            ){
            let { inv, matrix, sceneTransform, parent, children, name, index } = bone;
            let{tempScale,mediumpCalcA,mediumpCalcB, preBonematrix}=this;
            let frameData = frames[bone.name];
            let nextFrameData = nextframes[bone.name];

            // frame = 1;

            // matrix.set(frameData.subarray(frame * 16, (frame + 1) * 16));
            // matrix.set(nextFrameData.subarray(frame * 16, (frame + 1) * 16));
            // matrix.set(frameData.subarray(frame * 16, (frame + 1) * 16));
            if (frameData) {

                if(n == 0){
                    matrix.set(nextFrameData.subarray(frame * 16, (frame + 1) * 16))
                    // matrix.set(frameData.buffer.slice(frame * 16, (frame + 1) * 16));
                }else{
                    let{mat:am,qua:aq,pos:ap,out:p} = mediumpCalcA;
                    let{mat:bm,qua:bq,pos:bp,out:q} = mediumpCalcB;

                    // am.buffer = frameData.buffer.slice(frame * 16 * 4, (frame + 1) * 16 * 4);
                    // bm.buffer = nextFrameData.buffer.slice(nextFrame * 16 * 4, (nextFrame + 1) * 16 * 4)

                    // am.set(frameData.subarray(frame * 16, (frame + 1) * 16));
                    // bm.set(nextFrameData.subarray(nextFrame * 16, (nextFrame + 1) * 16));

                    // let bufferA = frameData.buffer.slice(frame * 16 * 4, (frame + 1) * 16 * 4);
                    // let bufferB = nextFrameData.buffer.slice(nextFrame * 16 * 4, (nextFrame + 1) * 16 * 4);
                    // am = new Float32Array(bufferA);
                    // bm = new Float32Array(bufferB);

                    // am.set(frameData.slice(frame * 16, (frame + 1) * 16));
                    // bm.set(nextFrameData.slice(nextFrame * 16, (nextFrame + 1) * 16));

                    // matrix.set(frameData.subarray(nextFrame * 16, (nextFrame + 1) * 16));

                    let pq = bonepq[name];
                    if(!pq){
                        bonepq[name] = pq = {p:newVector3D(),q:newVector3D()};
                    }

                    am.set(frameData.subarray(frame * 16, (frame + 1) * 16));
                    // bm.set(nextFrameData.subarray(nextFrame * 16, (nextFrame + 1) * 16));
                    bm = preBonematrix[name];
                    this.mixTransform(am,bm,n,pq,matrix)
                    
                    // am.m3_decompose(ap,aq,undefined,Orientation3D.QUATERNION);
                    // bm.m3_decompose(bp,bq,undefined,Orientation3D.QUATERNION);
                    // qua_slerp(aq,bq,n,q);
                    // pos_lerp(ap,bp,n,p);
                    // matrix.m3_recompose(p,q,tempScale,Orientation3D.QUATERNION);
                    // matrix.set(bm);
                }
                preBonematrix[name] = matrix as Float32Array;
                // console.log(`==========${name}============`);
                // console.log(p);
                // console.log(ap);
            }

            if (parent) {
                sceneTransform.m3_append(parent.sceneTransform, false, matrix)
            } else {
                sceneTransform.set(matrix);
            }

            boneTransform[name] = sceneTransform.clone().m3_rotation(90,X_AXIS,true);

            for (let i = 0; i < children.length; i++) {
                this.updateBone(children[i],frames,frame,nextframes,nextFrame,n,boneTransform,bonepq);
            }
        }


        updateMatrices(bone:IBone,buffer:ArrayBuffer){
            let { inv, sceneTransform, children, index } = bone;
            let matrice = TEMP_MATRIX3D;
            if (index > -1) {
                index *= 2;
                matrice.m3_append(sceneTransform, false, inv);
                let qua = new Float32Array(buffer, index * 4 * 4, 4);
                let pos = new Float32Array(buffer, (index+1) * 4 * 4, 4);
                matrice.m3_decompose(pos,qua,undefined,Orientation3D.QUATERNION);
            }

            for (let i = 0; i < children.length; i++) {
                this.updateMatrices(children[i],buffer);
            }
        }

        // createSkeletionAnimation() {

        //     let { rootBone, boneCount } = this;

        //     let skeletonAni = {} as ISkeletonAnimation;
        //     let buffer = new ArrayBuffer(16 * 4 * boneCount)
        //     skeletonAni.boneMatrices = new Float32Array(buffer);

        //     function createBoneAnimation(bone: IBone, parent?: IBonePose) {
        //         let { matrix, sceneTransform, index, inv } = bone;
        //         let m = skeletonAni.boneMatrices;
        //         let ani: IBonePose = {} as IBonePose;
        //         ani.bone = bone;
        //         ani.transform = new Float32Array(matrix);
        //         ani.sceneTransform = new Float32Array(sceneTransform);
        //         ani.index = index;
        //         ani.inv = inv;
        //         if (index > -1) {
        //             if (index == 0) {
        //                 index = 0;
        //             }
        //             ani.matriceTransfrom = new Float32Array(buffer, index * 16 * 4, 16);
        //             multiplyMatrices(sceneTransform,inv,ani.matriceTransfrom);
        //             // matrix3d_multiply(sceneTransform, inv, ani.matriceTransfrom);
        //         }
        //         ani.parent = parent;
        //         ani.status = 0;

        //         ani.children = [];
        //         bone.children.forEach(b => {
        //             ani.children.push(createBoneAnimation(b, ani));
        //         });
        //         return ani;
        //     }

        //     this.bonePose = createBoneAnimation(rootBone);

        //     skeletonAni.skeleton = this;

        //     return skeletonAni;
        // }

        // updateSkeletonAnimation(anim: ISkeletonAnimation) {

        //     let { rootBone, boneMatrices } = anim;


        //     function updateBoneMatrices(bone: IBonePose) {

        //         const { index, sceneTransform, status, children, matriceTransfrom } = bone;

        //         let change = false;
        //         if (status & DChange.trasnform) {
        //             const { transform, parent } = bone;
        //             if (parent) {
        //                 matrix3d_multiply(transform, parent.sceneTransform, sceneTransform);
        //             } else {
        //                 sceneTransform.set(transform);
        //             }
        //             change = true;
        //             bone.status &= ~DChange.trasnform;
        //             if (index > -1) {
        //                 // multiplyMatrices(sceneTransform,bone.inv,matriceTransfrom);
        //                 matrix3d_multiply(sceneTransform, bone.inv, matriceTransfrom);
        //             }
        //         }
        //         children.forEach(b => {
        //             if (change) b.status |= DChange.trasnform;
        //             updateBoneMatrices(b);
        //         });
        //     }

        //     updateBoneMatrices(rootBone);
        // }
    }

    export var skeleton_test_n = 0.1;

    export interface ISkeletonAnimationRuntime{
        starttime : number;
        data : ISkeletonAnimationData;
        frame : number;
        stoptime?:number;
    }


    export interface ISKeletonBonePQ{
        p:IVector3D;
        q:IVector3D;
    }

    export class SkeletonAnimation extends MiniDispatcher implements ISkeletonRenderData{
        skeleton: Skeleton;
        matrices:Float32Array;
        // pose: { [key: string]: Float32Array } = {};
        
        tm:ITimeMixer;

        // starttime: number;
        // nextTime: number;
        // animationData:ISkeletonAnimationData;
        // preAnimationData:ISkeletonAnimationData;

        animation = {starttime:0,frame:0,data:undefined} as ISkeletonAnimationRuntime;
        preAnimation = {starttime:0,frame:0,data:undefined,stoptime:0} as ISkeletonAnimationRuntime;

        currentFrame: number = 0;
        totalFrame:number = 0;
        lockFrame:number = -1;
        currentBoneTransfrom:{[key:string]:IMatrix3D};

        currentBonePQ:{[key:string]:ISKeletonBonePQ};

        
        mediump:boolean;
        play(animationData: ISkeletonAnimationData, tm:ITimeMixer,mediump = false) {
            let currentFrame = 0;
            this.currentFrame = currentFrame;
            this.preFrame = 0;
            this.mediump = mediump;
            this.tm = tm;

            

            let{animation} = this;
            this.totalFrame = animationData.totalFrame;
            if(mediump){
                let{preAnimation,currentBonePQ} = this;
                if(!currentBonePQ){
                    this.currentBonePQ = currentBonePQ = {};
                }
                if(animationData != animation.data){
                // if(animationData != animation.data && ((animation.data && animation.data.name == "stand.kf") || (animationData.name == "stand.kf" && animation.data && animation.data.name == "run.kf"))){
                    preAnimation.starttime = animation.starttime;
                    preAnimation.data = animation.data;
                    preAnimation.stoptime = tm.now;
                }

                animation.data = animationData;
                animation.starttime = tm.now;
                this.currentBoneTransfrom = {};
                this.matrices = new Float32Array(new ArrayBuffer(8 * 4 * this.skeleton.boneCount));
                this.skeleton.getMediumpMatricesData(this, currentFrame,0,this.currentBoneTransfrom,this.matrices.buffer,currentBonePQ);
            }else{
                this.matrices = this.skeleton.getMatricesData(animationData, currentFrame);
                this.currentBoneTransfrom = animationData.boneTransform[currentFrame];
                animation.data = animationData;
                animation.starttime = tm.now;
            }

            // this.animationData = animationData;
            // this.starttime = tm.now;
            
            
           
            this.simpleDispatch(EventT.CHANGE,this.currentBoneTransfrom);
        }

        preUploadTime:number;
        preFrame:number
        uploadContext(camera: Camera, mesh: Mesh, program: Program3D, now: number, interval: number) {
            if(this.preUploadTime == now){
                return;
            }
            this.preUploadTime = now;
            let { animation, skeleton, currentFrame,tm } = this;
            // currentFrame = 0;
            // skeleton.vertex.uploadContext(program);
            let matrices = this.matrices;
            let {data,starttime} = animation;
            if (undefined == data) {
                this.matrices = matrices = skeleton.defaultMatrices;
                this.currentBoneTransfrom = skeleton.boneTransform;
            } else {
                let duration = (tm.now - starttime) % (data.duration * 1000);
                let eDuration = (data.eDuration * 1000)
                let frame = this.lockFrame;
                
                if(frame == -1){
                    frame = Math.floor(duration / eDuration )
                }
                
                if(this.mediump == false){
                    if(frame != currentFrame){
                        currentFrame = frame;
                        this.currentFrame = currentFrame;
                        this.matrices = matrices = skeleton.getMatricesData(data, currentFrame);
                        this.currentBoneTransfrom = data.boneTransform[currentFrame];
                        this.simpleDispatch(EventT.CHANGE,this.currentBoneTransfrom);
                    }
                }else{
                    // if(frame != currentFrame){
                    currentFrame = frame;
                    this.currentFrame = currentFrame;
                    let n = (duration % eDuration) / eDuration;
                    // n = 0.5;
                    skeleton.getMediumpMatricesData(this, currentFrame,n,this.currentBoneTransfrom,matrices.buffer,this.currentBonePQ);
                    // }
                    this.simpleDispatch(EventT.CHANGE,this.currentBoneTransfrom);
                }
                
                if (currentFrame < this.preFrame || currentFrame >= data.totalFrame-1) {
                    this.simpleDispatch(EventT.PLAY_COMPLETE, data)
                }
                this.preFrame = currentFrame;
            }
            // context3D.setProgramConstantsFromVector(VC.vc_bones,matrixes,4,true)
        }

    }


    export const enum FilterConst{
        SKELETON = "skeleton_"
    }


    export class SkeletonFilter extends FilterBase{

        static VERTEX = {
def:
`
attribute vec4 index;
attribute vec4 weight;
uniform vec4 bones[ 100 ];
`,

func:
`
mat4 getBoneMatrix( const in float i ) {
    float d = i * 2.0;
    vec4 qua = bones[ int(d) ];
    vec4 pos = bones[ int(d + 1.0) ];
    return qua2mat(qua, pos);
}
`,

code:
`
mat4 skinMatrix = mat4( 0.0 );
skinMatrix += weight.x * getBoneMatrix( index.x );
skinMatrix += weight.y * getBoneMatrix( index.y );
skinMatrix += weight.z * getBoneMatrix( index.z );
skinMatrix += weight.w * getBoneMatrix( index.w );
n = vec4( skinMatrix * vec4( n, 0.0 ) ).xyz;
p = skinMatrix * p;
`
        } as IShaderCode;


        static FRAGMENT = {
def:
`
`,

code:
`
`
        } as IShaderCode;





        constructor(){
            super(FilterConst.SKELETON);
            (this as IShaderSetting).useQua2mat = true;
            this.vertex = SkeletonFilter.VERTEX;
        }
    }

}