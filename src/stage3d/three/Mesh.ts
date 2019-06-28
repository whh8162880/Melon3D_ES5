///<reference path="../Stage3D.ts" />
///<reference path="./ThreeInterface.ts" />
///<reference path="./Skeleton.ts" />
module rf {

    // export var skeletonMeshObj:{[key:string]:ISkeletonMeshData} = {};


    export class Mesh extends SceneObject {
        scene: Scene;
        skAnim: SkeletonAnimation;
        skData:ISkeletonRenderData;

        outLineMaterial:OutLineMaterial;

        constructor(variables?: { [key: string]: IVariable }) {
            super(variables ? variables : vertex_mesh_variable);
            this.invSceneTransform = newMatrix3D();
            this.nativeRender = true;
            this.tm = defaultTimeMixer;
        }

        // setChange(value: number,p:number = 0,c:boolean = false): void {
        //     super.setChange(value &= ~DChange.batch,p,c);
        // }

        updateSceneTransform(updateStatus = 0,parentSceneTransform?:IMatrix3D) {
            updateStatus = super.updateSceneTransform(updateStatus,parentSceneTransform);
            if(updateStatus & DChange.trasnform){
                let { invSceneTransform, sceneTransform } = this;
                invSceneTransform.m3_invert(sceneTransform,true);
            }
            return updateStatus;
        }


        renderShadow(sun:Light,p:Program3D,c:Context3D,worldTranform:IMatrix3D,now: number, interval: number){
            let{geometry,sceneTransform,skAnim,skData}=this;
            geometry.vertex.uploadContext(p);
            worldTranform.m3_append(sun.worldTranform,false,sceneTransform);
            c.setProgramConstantsFromMatrix(VC.mvp,worldTranform);

            if (undefined != skAnim) {
                skAnim.uploadContext(sun, this, p, now, interval);
                skData = skAnim;
            }

            if(undefined != skData){
                skData.skeleton.vertex.uploadContext(p);
                context3D.setProgramConstantsFromVector(VC.vc_bones,skData.matrices,4,true)
            }
        }


        renderOutLine(camera:Camera,option:IRenderOption){
            let {interval ,now} = option;
            var { geometry, skAnim,_visible,skData,outLineMaterial} = this;
            if(!geometry){
                return;
            }

            let b = outLineMaterial.uploadContext(camera,this,now,interval);
            if (true == b) {
                let c = context3D;
                const { program } = outLineMaterial;

                if (undefined != skAnim) {
                    if(skAnim.preUploadTime != now){
                        skAnim.uploadContext(camera, this, program, now, interval);
                    }
                }

                if(undefined != skData){
                    skData.skeleton.vertex.uploadContext(program);
                    context3D.setProgramConstantsFromVector(VC.vc_bones,skData.matrices,4,true)
                }

                geometry.uploadContext(camera, this, program, now, interval);

                c.drawTriangles(geometry.index, geometry.numTriangles) 

            }
        }

        

        render(camera:Camera,option:IRenderOption): void {

            if(this.outLineMaterial){
                this.renderOutLine(camera,option);
                // return;
            }

           
            let {interval ,now} = option;

            var { geometry, material, skAnim,_visible,skData} = this;
            if (undefined != geometry && undefined != material && _visible) {
                let b = material.uploadContext(camera, this, now, interval);
                if (true == b) {
                    let c = context3D;
                    const { program } = material;
                    if (undefined != skAnim) {
                        if(skAnim.preUploadTime != now){
                            skAnim.uploadContext(camera, this, program, now, interval);
                        }
                    }

                    if(undefined != skData){
                        skData.skeleton.vertex.uploadContext(program);
                        context3D.setProgramConstantsFromVector(VC.vc_bones,skData.matrices,4,true)
                    }

                    geometry.uploadContext(camera, this, program, now, interval);

                    let{shadowTarget,shadowMatrix}=this;

                    
                    if(shadowTarget){
                        c.setProgramConstantsFromMatrix(VC.sunmvp,shadowMatrix);
                    }

                    c.drawTriangles(geometry.index, geometry.numTriangles) 
                }
            }
            
            super.render(camera,option);
        }


        onRecycle(){
            let{skAnim}=this;
            if(skAnim){
                this.skAnim = null;
            }
            super.onRecycle();
        }
    }


    export class KFMMesh extends Mesh {
        id: string;
        kfm : ISkeletonMeshData;
        defaultAnim:string;
        currentAnim:string;
        mediump = false;
        constructor(material?: Material, variables?: { [key: string]: IVariable }) {
            super(variables);
            this.material = material;
            this.defaultAnim = "stand.kf";
            // this.shadowable = true;
        }

        load(url: string) {
            this.id = url;
            url += "mesh.km";
            loadRes(RES_PERFIX,url, this.loadCompelte, this, ResType.amf_inflate);
        }

        loadCompelte(e: EventX) {
            if(e.type == EventT.COMPLETE){

                let{url} = e.currentTarget as any;

                let{id}=this;
                let o = e.data as ISkeletonMeshData;

                if(url.indexOf(id) != -1){
                    this.setKFM(o);
                }
            }

        }

        setKFM(kfm: ISkeletonMeshData) {

            if(!this.tm){
                this.tm = defaultTimeMixer;
            }
            if(!kfm.inited){
                kfm.inited = true;

                if(!kfm.skeletonData){
                    if((kfm.skeleton instanceof Skeleton) == false){
                        kfm.skeletonData = kfm.skeleton as any;
                        kfm.skeleton = undefined;
                    }
                }

                if(!kfm.skeleton && kfm.skeletonData){
                    kfm.skeleton =  new Skeleton(kfm.skeletonData,this.id);
                }
            }


            let { mesh, skeleton, material: materialData,anims, shadowCast, sun} = kfm;
            let { material, geometry ,defaultAnim} = this;
            let c = context3D;




            this.kfm = kfm;

            if (!geometry) {
                this.geometry = geometry = new GeometryBase(this.variables);
            }
            geometry.setData(mesh);

            if (!material) {
                this.material = material = materialData ? this.createMaterial() : new ColorMaterial(0xcccccc);
            }
            if(materialData){
                material.setData(materialData);
                if(material.diffTex.url == undefined){
                    material.diffTex.url = this.id + "diff.png";
                }
            }
            

            if(skeleton){
                //===========================
                //  Animation
                //===========================
                let skAnim = this.skAnim = skeleton.createAnimation();
                this.skData = skAnim;
                skAnim.on(EventT.CHANGE,this.skinAnimChangeHandler,this);
                skeleton.on(EventT.COMPLETE,this.animationLoadCompleteHandler,this);

                if(defaultAnim && anims && anims.indexOf(defaultAnim) != -1){
                    this.playAnim(defaultAnim);
                }
                
            }
            this.playAnim(defaultAnim);
            // let action = "Take 001";
            // let action = "stand";
            // let animationData = kfm.anims[action];
            // skeleton.initAnimationData(animationData);
            // this.skAnim.play(animationData, engineNow);
            // this.shadowCast =  Boolean(shadowCast);

            if(this.shadowCast){
                scene.childChange = true;
            }

            this.calHitarea();

            this.simpleDispatch(EventT.COMPLETE);
        }


        removeFromStage(){
            super.removeFromStage();

            let{skAnim,shadowCast} = this;

            if(shadowCast){
                scene.childChange = true;
            }
        }

        calHitarea() {
            let {hitarea, vertex, data32PerVertex, nameLabelY} = this.kfm.mesh;
            if(!hitarea){
                let vd = new Float32Array(vertex);
                let l:number = Number.MAX_VALUE;
                let t:number = -Number.MAX_VALUE;
                let r:number = -Number.MAX_VALUE;
                let b:number = Number.MAX_VALUE;
                let front:number = -Number.MAX_VALUE;
                let back:number = Number.MAX_VALUE;
                let len:number = vd.length;
                for(let i = 0;i<len;i+=data32PerVertex){
                    let x = vd[i];
                    let y = vd[i+1];
                    let z = vd[i+2];

                    if(front < z){
                        front = z;
                    }else if(back > z){
                        back = z;
                    }
                    
                    if(l > x){
                        l = x;
                    }else if(r < x){
                        r = x;
                    }
                    
                    if(t < y){
                        t = y;
                    }else if(b > y){
                        b = y;
                    }
                }
                this.hitArea.clean();
                // this.hitArea.combine({left:l, right:r, top:t, bottom:b, front:front, back:back} as HitArea, 0, 0);
                // this.hitArea.front = front;
                // this.hitArea.back = back;
                clone({left:l, right:r, top:t, bottom:b, front:front, back:back}, this.hitArea);
            }else{
                this.hitArea.clean();
                clone(hitarea, this.hitArea);
                // this.hitArea.combine(hitarea as HitArea, 0, 0);
                // this.hitArea.front = hitarea.front;
                // this.hitArea.back = hitarea.back;
            }
            this.hitArea.scale(OBJECT2D_SCALE);

            return this.hitArea;
        }

        get nameLabelY(){
            let {mesh} = this.kfm;
            return mesh.nameLabelY == undefined ? 2 : mesh.nameLabelY;
        }

        createMaterial():Material{
            return new Material();
            // return new PhongMaterial();
        }

        playAnim(name:string,refresh:boolean = false){
            let{skAnim,tm,mediump} = this;
            if(!skAnim){
                return;
            }

            if (name.lastIndexOf(ExtensionDefine.KF) == -1) {
                name += ExtensionDefine.KF;
            }
            if(this.currentAnim == name && !refresh){
                return;
            }
            this.currentAnim = name;
            let { skeleton } = skAnim;
            let anim = skeleton.animations[name];
            if(!anim){
                //没有加载动作
                loadRes(RES_PERFIX,this.id + name,skeleton.loadAnimationComplete,skeleton,ResType.amf_inflate);
                skeleton.on(EventT.COMPLETE,this.skeletonAnimLoadComplete,this);
            }else{
                skAnim.play(anim,tm,mediump);
            }
        }


        skeletonAnimLoadComplete(e:EventX){
            let{skAnim,currentAnim,mediump,tm} = this;
            if(!skAnim){
                return;
            }

            let anim = e.data;

            if(anim.name == currentAnim || currentAnim.indexOf(anim.name) != -1){
                e.currentTarget.off(e.type,this.skeletonAnimLoadComplete,this);
                skAnim.play(anim,tm,mediump);
            }

            
        }


        animationLoadCompleteHandler(e:EventX){
            e.currentTarget.off(e.type,this.animationLoadCompleteHandler,this);
            let anim:ISkeletonAnimationData = e.data;
            if(anim.name == this.currentAnim){
                this.playAnim(this.currentAnim,true);
            }
        }

        onRecycle(){
            let{skAnim} = this;
            if(skAnim){
                skAnim.skeleton.off(EventT.COMPLETE,this.animationLoadCompleteHandler,this);
            }
            this.defaultAnim = undefined;
            this.currentAnim = undefined;
            this.id = undefined;
            this.kfm = undefined;
            super.onRecycle();
        }

        boneContainer:{[key:string]:SceneObject};


        bindMesh(skeletonName:string,mesh:Sprite){
            // let boneTransfrom = this.skAnim.currentBoneTransfrom;
            let{boneContainer,skAnim} = this;

            if(!boneContainer){
                this.boneContainer = boneContainer = {};
            }
            let display = boneContainer[skeletonName];
            if(!display){
                boneContainer[skeletonName] = display = new SceneObject();
                this.addChild(display)
            }
            display.addChild(mesh);
        }


        skinAnimChangeHandler(event:EventX){
            let boneTrasnform = event.data as {[key:string]:IMatrix3D};
            let{boneContainer} = this;

            for(let key in boneContainer){
                let bone = boneTrasnform[key];
                if(bone){
                    boneContainer[key].setTransform(bone);
                }
            }
        }

        // refreshGUI(gui:dat.GUI){
        //     alert(gui);
        // }
    }

    
}