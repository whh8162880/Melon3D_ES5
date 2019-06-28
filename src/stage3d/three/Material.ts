module rf {
    export class Material {
        cull: number;
        srcFactor: number;
        dstFactor: number;
        depthMask: boolean = false;
        passCompareMode: number;
        alphaTest: number;

        program: Program3D;

        //贴图
        diffTex: ITextureData;

        sun = true;

        createProgram(mesh: Mesh) {

            this.initFilters(mesh);
            
            let shader = singleton(Shader);
            let p = shader.createProgram(mesh);
            this.program = p;

            return p;
        }


        initFilters(mesh:Mesh){
            let filters = mesh.filters;
            filters[FilterConst.BASIC] = singleton(BasicFilter);
            filters[FilterConst.NORMAL] = singleton(NormalFilter);
            filters[FilterConst.MVP] = singleton(MvpFilter);
            filters[FilterConst.DIFF] = singleton(DiffFilter);
            if(mesh.skData){
                filters[FilterConst.SKELETON] = singleton(SkeletonFilter);
            }

            if(this.sun){
                filters[FilterConst.SUN] = singleton(SunFilter);
            }

            filters[FilterConst.DISCARD] = singleton(DiscardFilter);

                
        }


        setData(data: IMaterialData) {
            if (!data) {
                this.cull = WebGLConst.NONE;
                this.depthMask = true;
                this.passCompareMode = WebGLConst.LEQUAL;
                this.srcFactor = WebGLConst.SRC_ALPHA;
                this.dstFactor = WebGLConst.ONE_MINUS_SRC_ALPHA;
                this.alphaTest = -1;
            } else {
                let { cull, depthMask, passCompareMode, srcFactor, dstFactor, alphaTest, diffTex } = data;

                this.cull = (undefined != cull) ? cull : WebGLConst.BACK;
                this.depthMask = undefined != depthMask ? depthMask : true;
                this.passCompareMode = passCompareMode ? passCompareMode : WebGLConst.LEQUAL;
                this.srcFactor = srcFactor ? srcFactor : WebGLConst.SRC_ALPHA;
                this.dstFactor = dstFactor ? dstFactor : WebGLConst.ONE_MINUS_SRC_ALPHA;
                this.alphaTest = ~~alphaTest;

                if (diffTex) {
                    this.diffTex = diffTex;
                } 
            }

        }

        uploadContextSetting() {
            let { setting } = context3D;
            let { cull, srcFactor, dstFactor, depthMask, passCompareMode } = this;
            setting.cull = cull;
            setting.depth = depthMask;
            setting.depthMode = passCompareMode;
            setting.src = srcFactor;
            setting.dst = dstFactor;
        }


        uploadContext(camera: Camera, mesh: Mesh, now: number, interval: number) {
            let { program , diffTex} = this;

            var filters = mesh.filters;
            var filter:FilterBase;

            if (mesh.shader) {
                mesh.shader = false;
                program = undefined;
            }

            if(!program){
                let b = this.checkTexs(diffTex);
                if (false == b) {
                    return false;
                }

                for(let key in filters){
                    filter = filters[key];
                    if(!filter.readly){
                        return false;
                    }
                }

                this.program = program = this.createProgram(mesh);
            }

            let c = context3D;
            c.setProgram(program);
            this.uploadContextSetting();

            
            for(let key in filters){
                filter = filters[key];
                filter.setProgramConstants(c,program,mesh,camera);
            }


            if(diffTex){
                let t: Texture;
                t = c.textureObj[diffTex.key];
                if(t){
                    t.uploadContext(program, FS.diff);
                }
            }


            // let setting = program.setting;
            // if(setting){
            //     if(setting.useInvm){
            //         mesh.invSceneTransform
            //     }
            // }
            

            return true;
        }


        checkTexs(...args) {
            let c = context3D;
            let b = true;
            args.forEach(data => {
                if (undefined != data) {
                    let tex: Texture
                    if (data.key) {
                        tex = c.textureObj[data.key];
                    }
                    if (undefined == tex) {
                        // (data as ITextureData).mipmap = true;
                        // (data as ITextureData).mix = gl.LINEAR_MIPMAP_LINEAR;
                        tex = c.createTexture(data, undefined);
                        b = false;
                    }
                    let { readly, status } = tex;
                    if (false == readly) {
                        if (LoadStates.COMPLETE != status) {
                            if (LoadStates.WAIT == status) {
                                tex.load(this.getTextUrl(data));
                            }
                            b = false;
                        }
                    }
                }
            });
            return b;
        }

        getTextUrl(data: ITextureData): string {
            return data.url;
        }

    }


    export class ShadowMaterial extends Material {


        uploadContext(camera: Camera, mesh: Mesh, now: number, interval: number) {
            let { program , diffTex} = this;

            if (!program) {
                this.program = program = this.createProgram(mesh);
            }

            let c = context3D;
            c.setProgram(program);
            this.uploadContextSetting();

            return true;
        }

        createProgram(mesh: Mesh) {
            let c = context3D;
            let key = "ShadowMaterial";

            let p = c.programs[key];

            if (undefined != p) {
                return p;
            }

            let skAnim = mesh.skAnim;
            let v_def = "";

            if (undefined != skAnim) {
                key += "-skeleton";
                // v_def += "#define USE_SKINNING\n           #define MAX_BONES 50\n";
                v_def += "#define USE_SKINNING\n           #define MAX_BONES 100\n";
            }


            let vertexCode = `
                precision mediump float;

                ${v_def}



                attribute vec3 ${VA.pos};
                uniform mat4 ${VC.mvp};

                mat4 qua2mat(vec4 qua,vec4 pos){
                    vec4 t1 = qua * qua;
                    vec3 t2 = 2.0 * qua.xxx * qua.yzw;
                    vec3 t3 = 2.0 * qua.yyz * qua.zww;
                    return mat4(
                        t1.x - t1.y - t1.z + t1.w , t2.x + t3.z , t2.y - t3.y , 0.0 ,
                        t2.x - t3.z , -t1.x + t1.y - t1.z + t1.w , t3.x + t2.z , 0.0 ,
                        t2.y + t3.y , t3.x - t2.z , -t1.x - t1.y + t1.z + t1.w , 0.0 ,
                        pos.x,pos.y,pos.z,1.0
                    );
                }


#ifdef USE_SKINNING
                attribute vec4 ${VA.index};
                attribute vec4 ${VA.weight};
                uniform vec4 ${VC.vc_bones}[ MAX_BONES ];
                mat4 getBoneMatrix( const in float i ) {
                    float d = i * 2.0;
                    vec4 qua = ${VC.vc_bones}[ int(d) ];
                    vec4 pos = ${VC.vc_bones}[ int(d + 1.0) ];
                    return qua2mat(qua,pos);
                }
#endif
                void main(void){
                    vec4 t_pos = vec4(${VA.pos},1.0);

                    #ifdef USE_SKINNING
                        mat4 skinMatrix = mat4( 0.0 );
                        skinMatrix += ${VA.weight}.x * getBoneMatrix( ${VA.index}.x );
                        skinMatrix += ${VA.weight}.y * getBoneMatrix( ${VA.index}.y );
                        skinMatrix += ${VA.weight}.z * getBoneMatrix( ${VA.index}.z );
                        skinMatrix += ${VA.weight}.w * getBoneMatrix( ${VA.index}.w );
                        t_pos = skinMatrix * t_pos;
                    #endif

                    gl_Position = ${VC.mvp} * t_pos;
                }
            `

            let fragmentCode = `
                precision mediump float;

                const vec3 PackFactors2 = vec3( 256. * 256. * 256., 256. * 256., 256. );
                const float PackUpscale = 256. / 255.;
                const float ShiftRight8 = 1. / 256.;

                vec4 packDepthToRGBA( float v ) {
                    vec4 r = vec4( fract( v * PackFactors2 ), v );
                    r.yzw -= r.xyz * ShiftRight8;
                    return r * PackUpscale;
                }


                const float UnpackDownscale = 255. / 256.;
                const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
                const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
                float unpackRGBAToDepth( const in vec4 v ) {
                    return dot( v, UnpackFactors );
                }

                varying vec4 vPos;
                void main(void){
                    // gl_FragColor = vec4(vec3(gl_FragCoord.z),1.0);
                    gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
                }
                
            `


            p = c.createProgram(vertexCode, fragmentCode, key);

            return p;
        }
    }

    export class SkyBoxMaterial extends Material {

        // //自发光
        // emissive:IColor;
        // emissiveTex:ITextureData;

        uploadContext(camera: Camera, mesh: Mesh, now: number, interval: number) {
            let scene = mesh.scene;
            let c = context3D;


            let { diffTex } = this;

            let { skAnim } = mesh;

            if (!diffTex) {
                return false;
            }

            let b = this.checkTexs(diffTex);
            if (false == b) {
                return false;
            }

            super.uploadContext(camera, mesh, now, interval);
            let { program } = this;

            let t: Texture;

            t = c.textureObj[diffTex.key];
            t.uploadContext(program, FS.diff);

            return true;
        }

        checkTexs(data) {
            let c = context3D;
            let b = true;
            let tex: Texture
            if (data.key) {
                tex = c.textureObj[data.key];
            }
            if (undefined == tex) {
                tex = c.createCubeTexture(data);
                b = false;
            }
            let { readly, status } = tex;
            if (false == readly) {
                if (LoadStates.COMPLETE != status) {
                    if (LoadStates.WAIT == status) {
                        tex.load(this.getTextUrl(data));
                    }
                    b = false;
                }
            }
            return b;
        }

        createProgram(mesh: Mesh) {

            let c = context3D;

            let f_def = "";
            let v_def = "";

            let key = "SkyBoxMaterial";

            key += "-diff";
            f_def += "#define DIFF\n";


            let p = c.programs[key];

            if (undefined != p) {
                return p;
            }

            let vertexCode = `
                precision mediump float;
                ${v_def}
                attribute vec3 ${VA.pos};
                attribute vec2 ${VA.uv};
                
                uniform mat4 ${VC.mvp};

                varying vec3 v_texCoord;

                void main() {
                    vec4 t_pos = vec4(${VA.pos}, 1.0);
                    
                    v_texCoord = ${VA.pos};

                    t_pos = ${VC.mvp} * t_pos;
                    
                    gl_Position = t_pos.xyww;
                }
            `





            let fragmentCode = `
            precision mediump float;    

            ${f_def}

            uniform samplerCube ${FS.diff};
            
            uniform vec4 ${VC.vc_diff};
            uniform vec4 ${VC.vc_emissive};
            
            varying vec3 v_texCoord;

            void main(void){

                vec4 c = textureCube(${FS.diff}, v_texCoord);
                
                gl_FragColor = c;
            }
            `
            p = c.createProgram(vertexCode, fragmentCode, key);

            return p;

        }

    }


    export class PhongMaterial extends Material {

        uploadContext(camera: Camera, mesh: Mesh, now: number, interval: number) {

            let {diffTex } = this;
            if (!diffTex) {
                return false;
            }

            let b = this.checkTexs(diffTex);
            if (false == b) {
                return false;
            }

            let c = context3D;
            let { skAnim, scene, shader } = mesh;


            super.uploadContext(camera, mesh, now, interval);
            let { program } = this;


            //太阳
            let sun = scene.sun;
            c.setProgramConstantsFromVector(VC.lightDirection, sun.normalsize, 4);

            // let t: Texture;
            // if (undefined != diffTex) {
            //     t = c.textureObj[diffTex.key];
            //     t.uploadContext(program, FS.diff);
            // }

            if (mesh.shadowTarget) {
                ROOT.shadow.rtt.uploadContext(program, FS.SHADOW);
            }

            if (context3D.logarithmicDepthBuffer) {
                c.setProgramConstantsFromVector(VC.logDepthFar, camera.logDepthFar, 1, false);
            }

            return true;
        }

        createProgram(mesh: Mesh) {


            const { diffTex } = this;
            const { skAnim, shadowTarget, filters } = mesh;

            let c = context3D;

            let f_def = "";
            let v_def = "";

            let key = "PhongMaterial";

            if (undefined != diffTex) {
                key += "-diff";
                f_def += "#define DIFF\n";
            } 

            if (shadowTarget) {
                key += "-shadow";
                f_def += "#define SHADOW\n";
                v_def += "#define SHADOW\n";
            }

            if (undefined != skAnim) {
                key += "-skeleton";
                v_def += "#define USE_SKINNING\n           #define MAX_BONES 100\n";
                // v_def += "#define USE_SKINNING\n           #define BONE_TEXTURE\n";
            }


            let filter = filters[FilterConst.LIU_GUANG];
            if (filter) {
                if (filter.readly) {
                    key += filter.skey;
                    f_def += "#define LIU_GUANG\n";
                    v_def += "#define LIU_GUANG\n";
                }
            }


            filter = filters[SkillEventConst.UV];
            if (filter) {
                key += filter.skey;
                v_def += "#define UV_ANIM\n";
            }

            filter = filters[SkillEventConst.COLOR_TRANFORM];
            if (filter) {
                key += filter.skey;
                f_def += "#define COLOR_TRANFORM\n";
            }


            if (context3D.logarithmicDepthBuffer) {
                key += "-log_depth_buffer";
                v_def += "#define LOG_DEPTH_BUFFER\n";
                f_def += "#define LOG_DEPTH_BUFFER\n";
                if (context3D.use_logdepth_ext) {
                    key += "_ext";
                    v_def += "#define LOG_DEPTH_BUFFER_EXT\n";
                    f_def += "#define LOG_DEPTH_BUFFER_EXT\n";
                }
            }

            let p = c.programs[key];

            if (undefined != p) {
                return p;
            }




            let vertexCode = `
        // precision mediump float;
        ${v_def}
        attribute vec3 ${VA.pos};
        attribute vec3 ${VA.normal};
        attribute vec2 ${VA.uv};
        #ifdef USE_SKINNING
            attribute vec4 ${VA.index};
            attribute vec4 ${VA.weight};
        #endif
        uniform mat4 ${VC.mvp};
        uniform mat4 ${VC.invm};
        uniform vec4 ${VC.lightDirection};
        uniform mat4 ${VC.sunmvp};

        varying vec4 vDiffuse;
        varying vec2 vUV;
        varying vec4 vShadowUV;
        #ifdef LOG_DEPTH_BUFFER
            #ifdef LOG_DEPTH_BUFFER_EXT
                varying float depth;
            #else
                uniform float logDepthFar;
            #endif
        #endif

        mat4 qua2mat(vec4 qua,vec4 pos){
            vec4 t1 = qua * qua;
            vec3 t2 = 2.0 * qua.xxx * qua.yzw;
            vec3 t3 = 2.0 * qua.yyz * qua.zww;
            return mat4(
                t1.x - t1.y - t1.z + t1.w , t2.x + t3.z , t2.y - t3.y , 0.0 ,
                t2.x - t3.z , -t1.x + t1.y - t1.z + t1.w , t3.x + t2.z , 0.0 ,
                t2.y + t3.y , t3.x - t2.z , -t1.x - t1.y + t1.z + t1.w , 0.0 ,
                pos.x,pos.y,pos.z,1.0
            );
        }

        vec4 liuguangFunc(in vec4 liuguang,in vec2 uv){
            vec4 tuv = vec4(uv,liuguang.zw);
            tuv.xy *= liuguang.yy;
            tuv.xy += liuguang.xx;
            return tuv;
        }
                
#ifdef USE_SKINNING
        uniform vec4 ${VC.vc_bones}[ MAX_BONES ];
        mat4 getBoneMatrix( const in float i ) {
            float d = i * 2.0;
            vec4 qua = ${VC.vc_bones}[ int(d) ];
            vec4 pos = ${VC.vc_bones}[ int(d + 1.0) ];
            return qua2mat(qua,pos);
        }
#endif
                
        

#ifdef LIU_GUANG
        uniform vec4 liuguang;
        varying vec4 vLiuguang;
#endif


#ifdef UV_ANIM
        uniform vec4 uvAnim;
#endif

        varying vec4 vDebug;

        void main() {
            vec4 t_pos = vec4(${VA.pos}, 1.0);
            vec3 t_normal = ${VA.normal};

            #ifdef USE_SKINNING
                mat4 skinMatrix = mat4( 0.0 );
                skinMatrix += ${VA.weight}.x * getBoneMatrix( ${VA.index}.x );
                skinMatrix += ${VA.weight}.y * getBoneMatrix( ${VA.index}.y );
                skinMatrix += ${VA.weight}.z * getBoneMatrix( ${VA.index}.z );
                skinMatrix += ${VA.weight}.w * getBoneMatrix( ${VA.index}.w );
                t_normal = vec4( skinMatrix * vec4( t_normal, 0.0 ) ).xyz;
                t_pos = skinMatrix * t_pos;
            #endif

            t_normal = normalize(vec4(t_normal,0.0) * ${VC.invm}).xyz;
            vec3 invLight = normalize(${VC.lightDirection}.xyz);
            float diffuse  = clamp(dot(t_normal , invLight), 0.1, 1.0);
            vDiffuse = vec4(vec3(diffuse), 1.0);
            
            // vDebug = vec4(diffuse,diffuse,diffuse,1.0);
            // vDebug = vec4(t_normal,1.0);

#ifdef UV_ANIM
    vUV = ((${VA.uv}.xy - vec2(0.5)) * uvAnim.zw) + uvAnim.xy + vec2(0.5);
#else
    vUV = ${VA.uv};
#endif

#ifdef LIU_GUANG
            vLiuguang = liuguangFunc(liuguang,vUV);            
#endif
            
            gl_Position = ${VC.mvp} * t_pos;
            #ifdef LOG_DEPTH_BUFFER
                #ifdef LOG_DEPTH_BUFFER_EXT
                    depth = gl_Position.w + 1.0;
                #else
                    gl_Position.z = log2( max( 0.0000001, gl_Position.w + 1.0 ) ) * logDepthFar * 2.0 - 1.0;
                    gl_Position.z *= gl_Position.w;
                #endif
            #endif
            
#ifdef SHADOW
            t_pos = ${VC.sunmvp} * t_pos;
            // t_pos.xyz /= t_pos.w;
            // t_pos.xy = t_pos.xy * 0.5 + 0.5;
            vShadowUV = t_pos;
#endif
        }
    `





            let fragmentCode = `
                ${f_def}
                precision mediump float;    
                
                #ifdef LOG_DEPTH_BUFFER_EXT
                    #extension GL_EXT_frag_depth : enable
                #endif
                
                uniform sampler2D ${FS.diff};
                uniform sampler2D ${FS.SHADOW};

                uniform vec4 ${VC.vc_diff};
                uniform vec4 ${VC.vc_emissive};

                varying vec4 vDiffuse;
                varying vec2 vUV;
                varying vec4 vShadowUV;
                
                #ifdef LOG_DEPTH_BUFFER_EXT
                    varying float depth;
                    uniform float logDepthFar;
                #endif


                #ifdef LIU_GUANG
                    uniform sampler2D liuguangTex;
                    varying vec4 vLiuguang;
                #endif

                #ifdef COLOR_TRANFORM
                        uniform vec4 color_mul;
                        uniform vec4 color_add;
                #endif


                const vec3 PackFactors2 = vec3( 256. * 256. * 256., 256. * 256., 256. );
                const float PackUpscale = 256. / 255.;
                const float ShiftRight8 = 1. / 256.;

                vec4 packDepthToRGBA( float v ) {
                    vec4 r = vec4( fract( v * PackFactors2 ), v );
                    r.yzw -= r.xyz * ShiftRight8;
                    return r * PackUpscale;
                }


                const float UnpackDownscale = 255. / 256.;
                const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
                const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
                float unpackRGBAToDepth( const in vec4 v ) {
                    return dot( v, UnpackFactors );
                }

                float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
                    return step( unpackRGBAToDepth( texture2D( depths, uv ) ) , compare );
                }

                float sat(float v)
                {
                    return clamp(v,0.0,1.0);
                }


                varying vec4 vDebug;
                
                void main(void){

                    vec2 tUV = vUV;
                    vec4 diffuse = vDiffuse;

                    #ifdef DIFF
                        vec4 color = texture2D(${FS.diff}, tUV);
                    #else
                        #ifdef VC_DIFF
                            vec4 color = ${VC.vc_diff};
                        #else
                            vec4 color = vec4(1.0,1.0,1.0,1.0) ;
                        #endif
                    #endif


#ifdef COLOR_TRANFORM
                    color  = color * color_mul + color_add;
#endif

                    if(color.w <= 0.05){
                        discard;
                    }


                    

                    
                    #ifdef SHADOW
                        // diffuse.xyz = vec3(1.0);
                        vec4 sc = vShadowUV;
                        sc.xyz /= sc.w;
                        sc.xyz = sc.xyz * 0.5 + 0.5;
                        float shadow = texture2DCompare(${FS.SHADOW}, sc.xy,sc.z+0.001);
                        // vec4 scolor = texture2D( ${FS.SHADOW}, sc.xy );
                        // float shadow = unpackRGBAToDepth( scolor );
                        // shadow = step(shadow,sc.z); 
                        diffuse.xyz *= (1.0 - shadow * 0.3);
                        // color = scolor;
                    #endif

                    
                    
                    #ifdef LOG_DEPTH_BUFFER_EXT
	                    gl_FragDepthEXT = log2( depth ) * logDepthFar;
                    #endif


                    #ifdef LIU_GUANG
                        vec4 lc = texture2D(liuguangTex, vLiuguang.xy);
                        color.xyz += lc.xyz * sat(color.w - vLiuguang.z) * vLiuguang.www;
                    #endif

                    color.xyz *= (diffuse.xyz * 0.6 + 1.0);
                    // color.xyz *= 1.65;
                    // color.xyz += diffuse.xyz;


                    gl_FragColor = color;

                    // gl_FragColor = vDebug;

                    

                    // gl_FragColor = vec4(gl_FragCoord.zzz,1.0);

                    // float deep = unpackRGBAToDepth(vec4(1.0));
                    // gl_FragColor = vec4(vec3(deep),1.0);

                    // gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
                    
                    // gl_FragColor = vec4(1.0,1.0,1.0,1.0);
                    // gl_FragColor = vec4(vUV,0.0,1.0);
                }
            `

            // fragmentCode = `
            // void main(void){
            //     gl_FragColor = vec4(1.0,1.0,1.0,1.0);
            // }
            // `
            p = c.createProgram(vertexCode, fragmentCode, key);

            return p;

        }






    }
}