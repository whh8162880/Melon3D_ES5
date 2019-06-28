///<reference path="./Mesh.ts" />
///<reference path="./ThreeInterface.ts" />
module rf {
    export var particle_Perfix = "particle/";

    export var particle_Texture_Perfix = "tex/particle/";

    export var particle_test_now = 0;

     export class ParticleGeometry extends GeometryBase {

        followData:Float32Array;

        initRuntime(data:IParticleData){
            let{nodes,mesh,runtime} = data;
            this.setData(mesh);
            this.initData(runtime);
            if(nodes[P_PARTICLE.FOLLOW]){
                this.followData = new Float32Array(runtime.props.length * 8);
            }
        }


        updateFollow(particle:Particle){
            let{followData} = this;
            let{data,followQua,followPos,now,followSca} = particle;
            let{runtime} = data;
            let{props} = runtime;
            now = now * 1000;


            for (let i = 0; i < props.length; i++) {
                const vo = props[i];

                let f = (now - vo.startTime) / vo.totalTime;
                let k = (f - Math.floor(f)) * vo.totalTime
                if( k < frameInterval * 2 ){
                    let temp = i * 8;

                    followData[temp] = followQua[0];
					followData[temp+1] = followQua[1];
                    followData[temp+2] = followQua[2];
                    followData[temp+3] = followQua[3];

					followData[temp + 4] = followPos[0] / followSca[0];
					followData[temp + 5] = followPos[1] / followSca[1];
					followData[temp + 6] = followPos[2] / followSca[2];
					
                }
            }
        }


        uploadContext(camera:Camera,mesh:Particle, program:Program3D, now: number, interval: number) {
            // super.uploadContext(camera, mesh, program, now, interval);
            let c = context3D;
            let{sceneTransform,sk_st,tm,data,followMatrix3D}=mesh;

            const { setting,nodes,runtime} = data;
            const { vertexBuffer } = runtime;

            //设置模型顶点数据 (pos uv)
            this.vertex.uploadContext(program);
            //设置模型particle点数据(pos rot sca time velocity accelerition billboard ...)
            vertexBuffer.uploadContext(program);
            
            let worldTranform = TEMP_MATRIX3D;
            let rot = TEMP_VECTOR3D;
            //设置矩阵信息
            worldTranform.m3_append(camera.worldTranform,false,sceneTransform);
            c.setProgramConstantsFromMatrix(VC.mvp,worldTranform);
            
            //BILLBOARD
            if(nodes[P_PARTICLE.BILLBOARD]){

                let maxtrix = followMatrix3D ? followMatrix3D : sceneTransform
                // maxtrix = sceneTransform;

                worldTranform.m3_append(camera.sceneTransform,false,maxtrix);
                if(nodes[P_PARTICLE.ROTATION_HEAD]){
                    c.setProgramConstantsFromMatrix(VC.mv,worldTranform);
                }
                worldTranform.m3_decompose(undefined,rot,undefined,Orientation3D.AXIS_ANGLE);
                worldTranform.m3_rotation(rot.w,rot,false,rf_m3_identity);
                c.setProgramConstantsFromMatrix(VC.invm,worldTranform);
            }

            let node = nodes[P_PARTICLE.SEGMENT_COLOR];
            if(node){
                let{data:segmentData}=node as IParticleSegmentColorNodeInfo;
                if(segmentData instanceof ArrayBuffer){
                    (node as IParticleSegmentColorNodeInfo).data = segmentData = new Float32Array(segmentData);
                }
                c.setProgramConstantsFromVector(P_PARTICLE.SEGMENT_COLOR,segmentData,4);
            }

            node = nodes[P_PARTICLE.SPRITE_SHEET] as IParticleSpriteSheetAnimNodeInfo;
            if(node){
                let{data}=node as IParticleSpriteSheetAnimNodeInfo;
                if(data instanceof ArrayBuffer){
                    (node as IParticleSpriteSheetAnimNodeInfo).data = data = new Float32Array(data); 
                }
                c.setProgramConstantsFromVector(P_PARTICLE.SPRITE_SHEET,data,4);
            }

            if(nodes[P_PARTICLE.FOLLOW]){
                this.updateFollow(mesh);
                c.setProgramConstantsFromVector("followData",this.followData,4);
            }
            

            let time = (tm.now - sk_st) / 1000 * setting.speed;

            mesh.now = time;

            // console.log(mesh.url , tm.now , sk_st);

            // time = particle_test_now;

            //TIME
            c.setProgramConstantsFromVector(P_PARTICLE.NOW, time, 1, false);

            return worldTranform;
        }
    }

    export class Particle extends Mesh {

        url:string;
        data: IParticleData;
        sk_st = 0;
        now = 0;

        followMatrix3D:IMatrix3D;
        followPos:IVector3D;
        followQua:IVector3D;
        followSca:IVector3D;


        updateSceneTransform(updateStatus:number,parentSceneTransform?:IMatrix3D){
            let {followMatrix3D} = this;
            if(followMatrix3D){

                if(this.status & DChange.trasnform){
                    this.updateTransform();
                    updateStatus |= DChange.trasnform;
                }

                let {scene,transform,sceneTransform,invSceneTransform,followPos,followQua,followSca} = this;
                
                followMatrix3D.m3_append(parentSceneTransform,false,transform);
                followMatrix3D.m3_decompose(followPos,followQua,followSca,Orientation3D.QUATERNION);

                sceneTransform.set(scene.sceneTransform);
                sceneTransform.m3_scale(followSca[0],followSca[1],followSca[2],true,scene.sceneTransform)
                invSceneTransform.m3_invert(sceneTransform,false);
            }else{
                updateStatus = super.updateSceneTransform(updateStatus,parentSceneTransform);
            }
            return updateStatus;
        }


        load(url: string) {
            if (url.lastIndexOf(ExtensionDefine.PARTICLE) == -1) {
                url += ExtensionDefine.PARTICLE;
            }
            if (url.indexOf("://") == -1) {
                url = particle_Perfix + url;
            }
            this.url = url;
            loadRes(RES_PERFIX,url, this.loadCompelte, this, ResType.amf_inflate);
        }

        loadCompelte(e: EventX) {
            if(e.type == EventT.COMPLETE){
                this.play(e.data);
            }else{
                this.remove();
            }
        }


        play(data: IParticleData) {
            this.data = data;

            const { setting: settingData, mesh: meshData, material: materialData ,nodes} = data;

            let { geometry, material } = this;

            if (!geometry) {
                this.geometry = geometry = new ParticleGeometry();
            }

            (geometry as ParticleGeometry).initRuntime(data)

            if (!material) {
                this.material = material = new ParticleMaterial();
            }

            materialData.cull = WebGLConst.NONE;

            // materialData.cull = materialData.cull == WebGLConst.BACK ? WebGLConst.FRONT : materialData.cull;

            material.setData(materialData);

            let{rot} = settingData;

            // if(pos){
            //     if(pos instanceof ArrayBuffer){
            //         settingData.pos = pos = new Float32Array(pos);
            //     }
            // }

            
            if(rot){
                if(rot instanceof ArrayBuffer){
                    settingData.rot = rot = new Float32Array(rot);
                }
                this.setRot(rot[0],rot[1],rot[2]);
            }


            
            if(nodes[P_PARTICLE.FOLLOW]){
                this.followMatrix3D = newMatrix3D();
                this.followPos = newVector3D();
                this.followQua = newVector3D();
                this.followSca = newVector3D();
            }



            


            if(undefined == this.sk_st){
                this.sk_st = defaultTimeMixer.now;
            }
        }

    }


   


    export const enum P_PARTICLE {
        TIME = "p_time", //dataLength=4
        //scale
        SCALE = "p_scale",//dataLength=4
        //初始化旋转
        ROTATION = "p_init_rotation",//dataLength=4
        //旋转速度
        VROTATION = "p_vrotation",//dataLength=4

        ROTATION_HEAD = "p_rotation2head",
        //pos
        POSITION = "p_position",//dataLength=3
        //FOLLOW  0:位置 1:角度
        FOLLOW = "p_follow",//dataLength=2
        //velocity
        VELOCITY = "p_velocity",//dataLength=3
        //Accelerition 加速度
        ACCELERITION = "p_accelerition",//dataLength = 3;
        //按照朝向旋转
        BILLBOARD = "p_billboard",
         //segemntedColor
        SEGMENT_COLOR = "p_segment_color",
        //uv动画
        SPRITE_SHEET = "p_sprite_sheet_anim",
        //时间
        NOW = "now",
        
    }

    export class ParticleMaterial extends Material {

        getTextUrl(data: ITextureData): string {
            return particle_Texture_Perfix + data.url;
        }

        uploadContext(camera: Camera, mesh: Mesh, now: number, interval: number) {
            let c = context3D;
            let { program, diffTex } = this;

            if (!diffTex) {
                return false;
            }

            let b = this.checkTexs(diffTex);
            if (false == b) {
                return false;
            }

            if (!program) {
                this.program = program = this.createProgram(mesh);
            }

            c.setProgram(program);
            
            this.uploadContextSetting();

            let t: Texture

            if (undefined != diffTex) {
                t = c.textureObj[diffTex.key];
                t.uploadContext(program, FS.diff);
            }

            return true;
        }


        createProgram(mesh: Mesh) {

            const { nodes } = (mesh as Particle).data;

            let key = "";

            for(let k in nodes){
                let node = nodes[k];
                key += node.key+"_";
            }

            let c = context3D;

            let p = c.programs[key];

            if(p){
                return p;
            }

            

            let node = nodes[P_PARTICLE.TIME];
            let vertexDefine = ""
            let vertexFunctions = this.timeNode(node as IParticleTimeNodeInfo);
            
            let fragmentDefine = "";
            let fragmentFunctions = "";

            //速度
            node = nodes[P_PARTICLE.VELOCITY];
            if(node){
                vertexDefine += "#define VELOCITY\n"
            }

            //加速度
            node = nodes[P_PARTICLE.ACCELERITION];
            if(node){
                vertexDefine += "#define ACCELERITION\n"
            }

            //初始化旋转
            node = nodes[P_PARTICLE.ROTATION];
            if(node){
                vertexDefine += "#define ROTATION\n"
            }

            //旋转速度
            node = nodes[P_PARTICLE.VROTATION];
            if(node){
                vertexDefine += "#define VROTATION\n"
            }

            //旋转到方向
            node = nodes[P_PARTICLE.ROTATION_HEAD];
            if(node){
                vertexDefine += "#define ROTATION_HEAD\n"
            }

            //缩放
            node = nodes[P_PARTICLE.SCALE];
            if(node){
                vertexFunctions +=  this.scaleNode(node as IParticleScaleNodeInfo);
                vertexDefine += "#define SCALE\n"
            }

            //公告板(始终面朝摄像机)
            node = nodes[P_PARTICLE.BILLBOARD];
            if(node){
                vertexDefine += "#define BILLBOARD\n"
            }

            node = nodes[P_PARTICLE.POSITION];
            if(node){
                vertexDefine += "#define POSITION\n"
            }

            node = nodes[P_PARTICLE.SEGMENT_COLOR];
            if(node){
                vertexFunctions += this.segmentColorNode(node as IParticleSegmentColorNodeInfo);
                vertexDefine += "#define SegmentColor\n";
                fragmentDefine += "#define SegmentColor\n";
            }

            node = nodes[P_PARTICLE.FOLLOW];
            if(node){
                vertexFunctions += this.followNode(node as IParticleFollowNodeInfo);
                vertexDefine += "#define FOLLOW\n";
            }

            node = nodes[P_PARTICLE.SPRITE_SHEET];
            if(node){
                fragmentFunctions += this.spriteSheetNode(node as IParticleSpriteSheetAnimNodeInfo);
                fragmentDefine += "#define SPRITE_SHEET\n";
            }

            let vertexCode = `
                ${vertexDefine}

                precision mediump float;

                attribute vec3 ${VA.pos};
                attribute vec2 ${VA.uv};
                attribute vec4 ${P_PARTICLE.TIME};
                attribute vec3 ${P_PARTICLE.VELOCITY};
                attribute vec3 ${P_PARTICLE.ACCELERITION};
                attribute vec4 ${P_PARTICLE.ROTATION};
                attribute vec4 ${P_PARTICLE.VROTATION};
                attribute vec4 ${P_PARTICLE.SCALE};
                attribute vec3 ${P_PARTICLE.POSITION};

                uniform mat4 ${VC.mvp};
                uniform mat4 ${VC.invm};
                uniform mat4 ${VC.mv};

                uniform float ${P_PARTICLE.NOW};
                

                varying vec2 vUV;
                varying vec2 vTime;
                varying vec4 vSegMul;
                varying vec4 vSegAdd;

                void quaXpos(in vec4 qua,inout vec3 pos){
                    vec4 temp = vec4(cross(qua.xyz,pos.xyz) + (qua.w * pos.xyz) , -dot(qua.xyz,pos.xyz));
                    pos = cross(temp.xyz,-qua.xyz) + (qua.w * temp.xyz) - (temp.w * qua.xyz);
                }

                ${vertexFunctions}

                

                void main(void) {
                    vec3 b_pos = ${VA.pos};
                    vec3 p_pos = vec3(0.0);
                    vec3 b_veo = vec3(0.0);
                    vec4 temp = vec4(0.0);
                    
                    //先处理时间  vec2 timeNode(float now,in vec3 pos,in vec4 time)
                    vec2 time = timeNode(${P_PARTICLE.NOW},b_pos,${P_PARTICLE.TIME});

#ifdef VELOCITY
                    //处理速度
                    b_veo += ${P_PARTICLE.VELOCITY};
                    p_pos += (time.xxx * b_veo);
#endif
                    
                   
#ifdef ACCELERITION 
                    //加速度
                    temp = vec4(${P_PARTICLE.ACCELERITION} * time.x,0.0); //at;
                    b_veo += temp.xyz;                              //vt = v0+a*t;
                    p_pos += temp.xyz * time.x * 0.5;               //s = v0*t + a*t*t*0.5;
#endif

#ifdef ROTATION     
                    //初始化旋转角度
                    quaXpos(${P_PARTICLE.ROTATION},b_pos);
#endif

#ifdef VROTATION    
                        //旋转动画
                    temp = ${P_PARTICLE.VROTATION};
                    temp.w *= time.x;
                    temp.xyz *= sin(temp.w);
                    temp.w = cos(temp.w);
                    quaXpos(temp,b_pos);
#endif

#ifdef ROTATION_HEAD    
                    // b_veo = vec3(-1.0,0.0,0.0);
                    //if b_veo.yz is (0,0) ,change it to (0.00001,0);
                    b_veo.y += step(b_veo.y+b_veo.z,0.0) * 0.00001;
    #ifdef BILLBOARD
                    temp = ${VC.mv} * vec4(b_veo,0.0);
                    temp.xyz = normalize(vec3(temp.xy,0.0));
                    b_pos =  b_pos * mat3(
                        temp.x,-temp.y,0.0,
                        temp.y,temp.x,0.0,
                        0.0,0.0,1.0);
    #else
                    b_veo = normalize(b_veo);
                    vec3 xAxis = vec3(1.0,0.0,0.0);
                    temp.w = dot(b_veo,xAxis);
                    temp.xyz = normalize(cross(xAxis,b_veo));

                    //两倍角公式获得 cos sin
                    //cos2a = cosa^2 - sina^2 = 2cosa^2 - 1 = 1 - 2sina^2;
                    //cosa = sqt((1 + cos2a)/2);
                    //sina = sqt((1 - cos2a)/2);

                    temp.xyz *= sqrt( (1.0-temp.w) * 0.5);
                    temp.w = sqrt((1.0 + temp.w) * 0.5);
                    quaXpos(temp,b_pos);
                   
    #endif
#endif

#ifdef SCALE
                    //缩放
                    scaleNode(${P_PARTICLE.SCALE},time,b_pos);
#endif

#ifdef BILLBOARD
                    b_pos = (vec4(b_pos,0.0) * ${VC.invm}).xyz;
#endif

#ifdef POSITION
                    b_pos += ${P_PARTICLE.POSITION};
#endif


#ifdef FOLLOW
                    follow(b_pos,p_pos);
#endif


#ifdef SegmentColor
                    segmentColorNode(time);
#endif

                    vUV = ${VA.uv};
                    vTime = time;
                    gl_Position = ${VC.mvp} * vec4(b_pos + p_pos,1.0);
                }
`


            let fragmentCode = `
                precision mediump float;

                ${fragmentDefine}

                ${fragmentFunctions}

                uniform sampler2D ${FS.diff};

                varying vec2 vUV;
                varying vec2 vTime;
                varying vec4 vSegMul;
                varying vec4 vSegAdd;

                void main(void){
                    vec2 tUV = vUV;
#ifdef SPRITE_SHEET
                    // segmentColorNode(vTime,tUV);
                    segmentColorNode(vTime,tUV);
#endif
                    vec4 c = texture2D(${FS.diff}, tUV);
                    // c = vec4(vTime.y);
                    // c.w = 1.0;
#ifdef SegmentColor
                    c *= vSegMul;
                    c += vSegAdd;
#endif
                    gl_FragColor = c;
                    // gl_FragColor = vec4(vTime.yyy,1.0);
                }

            `
            

            p = c.createProgram(vertexCode, fragmentCode,key);

            return p;

        }


        //======================================================================
        //Nodes
        //======================================================================


        //==========================TimeNode====================================
        timeNode(info: IParticleTimeNodeInfo) {
            let vcode = `
                vec2 timeNode(float now,inout vec3 pos,in vec4 time){
                    //time: x:startTime, y:durtion,z:delay+durtion,w:1/durtion;
                    //o: time, time * 1/durtion;

                    now = now - time.x;
                    pos *= step(0.0,now);
                    
                    vec2 o = vec2(0.0,0.0);
            `

            if (info.usesDuration) {
                if (info.usesLooping) { 
                    if (info.usesDelay) {
                        vcode += `
                    o.x = mod(now , time.z);
                    pos *= step(o.x,time.y);
                        `
                    } else {
                        vcode += `
                    o.x = mod(now , time.y);  
                        `
                    }
                } else {
                    vcode += `
                    o.x = now;
                    pos *= step(now,time.y); 
                    `
                }
            } else {
                vcode += `
                    o.x = now;
                    pos *= step(now,time.y); 
                `
            }

            vcode += `
                    o.y = o.x * time.w;
                    return o;
                }
            `
            return vcode;
        }



        //==========================VELOCITY_Node====================================
        scaleNode(info:IParticleScaleNodeInfo){


            let vcode = `
                void scaleNode(in vec4 scale,in vec2 time,inout vec3 pos){
                    float temp = 0.0;`
            if(info.usesCycle){
                if(info.usesPhase){
                    vcode += `
                    temp += sin(scale.z * time.y + scale.w);`   
                }else{
                    vcode += `
                    temp = sin(scale.z * time.y);`
                }
            }else{
                vcode += `
                    temp = time.y;`
            }

            vcode += `
                    temp = (temp * scale.y) + scale.x;
            `

            switch (info.scaleType) {
                case 0:
                vcode += `
                    pos.xyz *= temp;` 
                    break;
                case 1:
                vcode += `
                    pos.x *= temp;` 
                    break;
                case 2:
                vcode += `
                    pos.y *= temp;` 
                    break;
                case 3:
                vcode += `
                    pos.z *= temp;` 
                    break;
            }

            vcode += `
                }
            `   

            return vcode;
        }


        followNode(info:IParticleFollowNodeInfo){
            let code = 
`
    attribute vec2 ${P_PARTICLE.FOLLOW};
    uniform vec4 followData[60];
    void follow(inout vec3 pos, in vec3 t_pos){
        // #ifndef BILLBOARD
            quaXpos(followData[int(${P_PARTICLE.FOLLOW}.x * 2.0)],pos);
        // #endif
        pos += followData[int(${P_PARTICLE.FOLLOW}.x * 2.0 + 1.0)].xyz;
    }
`
            return code;
        }


        segmentColorNode(info:IParticleSegmentColorNodeInfo){
            let{data,usesMul,usesAdd,add,mul,len} = info;
            if(data instanceof ArrayBuffer){
                info.data = data = new Float32Array(info.data);
            }

            
            let vcode = `
                uniform vec4 ${P_PARTICLE.SEGMENT_COLOR}[${data.length / 4}];
                void segmentColorNode(in vec2 time){
                    vec4 life = ${P_PARTICLE.SEGMENT_COLOR}[0];
                    vec4 temp = vec4(0.0);`;

            if(usesMul){
                vcode +=`
                    vec4 mul = ${P_PARTICLE.SEGMENT_COLOR}[${mul}];`
            }else{
                vcode +=`
                    vec4 mul = vec4(1.0);`
            }

            if(usesAdd){
                vcode +=`
                    vec4 add = ${P_PARTICLE.SEGMENT_COLOR}[${add}];`
            }else{
                vcode +=`
                    vec4 add = vec4(0.0);`
            }


            if(len>0){
                vcode +=`
                    temp.x = min(life.x , time.y);`
                if(usesMul){
                    vcode +=`
                    mul += temp.x * ${P_PARTICLE.SEGMENT_COLOR}[${mul + 2}];`
                }
                if(usesAdd){
                    vcode +=`
                    add += temp.x * ${P_PARTICLE.SEGMENT_COLOR}[${add + 2}];`
                }
            }

            if(len>1){
                vcode +=`
                    temp.x = min(life.y , max(0.0 , time.y - life.x));`
                if(usesMul){
                    vcode +=`
                    mul += temp.x * ${P_PARTICLE.SEGMENT_COLOR}[${mul + 3}];`
                }
                if(usesAdd){
                    vcode +=`
                    add += temp.x * ${P_PARTICLE.SEGMENT_COLOR}[${add + 3}];`
                }
            }


            if(len>2){
                vcode +=`
                    temp.x = min(life.z , max(0.0 , temp.x - life.y));`
                if(usesMul){
                    vcode +=`
                    mul += temp.x * ${P_PARTICLE.SEGMENT_COLOR}[${mul + 4}];`
                }
                if(usesAdd){
                    vcode +=`
                    add += temp.x * ${P_PARTICLE.SEGMENT_COLOR}[${add + 4}];`
                }
            }


            if(len>3){
                vcode +=`
                    temp.x = min(life.w , max(0.0 , temp.x - life.z));`
                if(usesMul){
                    vcode +=`
                    mul += temp.x * ${P_PARTICLE.SEGMENT_COLOR}[${mul + 5}];`
                }
                if(usesAdd){
                    vcode +=`
                    add += temp.x * ${P_PARTICLE.SEGMENT_COLOR}[${add + 5}];`
                }
            }

            if(len == 0){
                vcode +=`
                    temp.y = time.y;`
            }else{
                switch (len) {
                    case 1:
                    vcode +=`
                    temp.y = max(0.0,time.y - life.x);`
                        break;
                    case 2:
                    vcode +=`
                    temp.y = max(0.0,time.y - life.y);`
                        break;
                    case 3:
                    vcode +=`
                    temp.y = max(0.0,time.y - life.z);`
                        break;
                    case 4:
                    vcode +=`
                    temp.y = max(0.0,time.y - life.w);`
                        break;
                }
            }

            if(usesMul){
                vcode +=`
                    mul += temp.y * ${P_PARTICLE.SEGMENT_COLOR}[${mul + 1}];`
            }

            if(usesAdd){
                vcode +=`
                    add += temp.y * ${P_PARTICLE.SEGMENT_COLOR}[${add + 1}];`
            }
            vcode +=`
                    vSegMul = mul;
                    vSegAdd = add;`

            vcode +=`
                }`

            return vcode;
        }


        spriteSheetNode(info:IParticleSpriteSheetAnimNodeInfo){
            let{rows,usesCycle,usesPhase}=info;
            // let code = `
            //     uniform vec4 ${P_PARTICLE.SPRITE_SHEET}[2];
            //     void segmentColorNode(in vec2 time,inout vec2 uv){
            //         vec4 data = ${P_PARTICLE.SPRITE_SHEET}[0];
            //         vec4 info = ${P_PARTICLE.SPRITE_SHEET}[1];
            //         vec2 temp = vec2(0.0);
            //         uv.x *= data.y;
            //         uv.y *= data.z;`

            // if(usesCycle){
            //     if(usesPhase){
            //         code += `
            //         temp.x = time.x + info.z;
            //         `
            //     }else{
            //         code += `
            //         temp.x = time.x;
            //         `
            //     }

            //     code +=`
            //         temp.y = fract(temp.x / info.y) * info.y * info.x;`
            // }else{
            //     code +=`
            //         temp.y = time.y * data.x;`
            // }

            // code +=`
            //     uv.y += floor(temp.y) * data.z;
            //     temp.x = floor(temp.y / data.y) * data.y;
            //     uv.x += fract(temp.x);`;


            // code +=`
            //     }`

            let code = 
`
    uniform vec4 ${P_PARTICLE.SPRITE_SHEET}[2];
    void segmentColorNode(in vec2 time,inout vec2 uv){
        vec4 data = ${P_PARTICLE.SPRITE_SHEET}[0];
        vec4 info = ${P_PARTICLE.SPRITE_SHEET}[1];
        float index = floor(time.y * data.x);
        uv.x = (uv.x + mod(index, data.y)) * data.z;
        uv.y = (uv.y + floor(index / data.y)) * data.w;
    }
`

            return code;
        }
    }



    export class TestPartilce extends Particle{


        moveTest(tweener?: ITweener){
            let z = this._z;
            if(z > 1){
                z = -2;
            }else{
                z = 2;
            }
            tweenTo({z},2000,defaultTimeMixer,this).complete = this.moveTest.bind(this);
        }



    }
}