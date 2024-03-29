module rf{

    export let line_variable:{ [key: string]: IVariable } = {
        "posX":{size:3,offset:0},
        "posY":{size:3,offset:3},
        "len":{size:1,offset:6},
        "color":{size:4,offset:7},
        "data32PerVertex":{size:11,offset:0}
    }

    export class Line3DPoint{
        x:number = 0;
        y:number = 0;
        z:number = 0;
        r:number = 1;
        g:number = 1;
        b:number = 1;
        a:number = 1;
        t:number = 1;

        clear(){
            this.x = this.y = this.z = 0;
            this.r = this.g = this.b = this.a = this.t = 1;
        }

        clone():Line3DPoint{
            let vo = new Line3DPoint();
            vo.x = this.x;
            vo.y = this.y;
            vo.z = this.z;
            vo.r = this.r;
            vo.g = this.g;
            vo.b = this.b;
            vo.a = this.a;
            vo.t = this.t;
            return vo;
        }


        toRGB(color:number){
            this.r = ((color & 0x00ff0000) >>> 16) / 0xFF;
            this.g = ((color & 0x0000ff00) >>> 8) / 0xFF;
            this.b = (color & 0x000000ff) / 0xFF;
        }
    }

    /**
     * 直线 不管放大 缩小 都不变
     */
    export class Line3D extends SceneObject{
        
        constructor(){
            super(line_variable);
            this.data32PerVertex = line_variable["data32PerVertex"].size;
            this.nativeRender = true;
            // this.worldTransform = newMatrix3D();
        }
        private origin:Recyclable<Line3DPoint>;
        private tempVertex:Recyclable<Temp_Float32Byte>;
        points:Line3DPoint[] = [];
        vertexBuffer:VertexBuffer3D;
        program:Program3D;
        // worldTransform:IMatrix3D;
        data32PerVertex:number;
        numVertices:number;
        triangles:number;
        quad:number;
        clear(){
            let tempVertex = this.tempVertex
            if(undefined == tempVertex){
                this.tempVertex = tempVertex = recyclable(Temp_Float32Byte);
            }

            tempVertex.data32PerVertex = this.data32PerVertex;
            tempVertex.numVertices = 0;

            let origin = this.origin;
            if(undefined == origin){
                this.origin = origin = recyclable(Line3DPoint);
            }

            this.points.length = 0;

            this.vertexBuffer = null;
        }

        moveTo(x:number,y:number,z:number,thickness:number = 1,color:number = 0xFFFFFF,alpha:number = 1){
            const{origin,points} = this;
            if(points.length){
                this.build();
            }

            origin.x = x;
            origin.y = y;
            origin.z = z;
            
            origin.t = thickness;
            origin.toRGB(color);
            origin.a = alpha;

            points.push(origin.clone());
        }

        lineTo(x:number,y:number,z:number,thickness:number = 1,color:number = 0xFFFFFF,alpha:number = 1){
            const{origin:vo,points} = this;
            vo.x = x;
            vo.y = y;
            vo.z = z;
            vo.a = alpha;
            vo.t = thickness;
            vo.toRGB(color);
            points.push(vo.clone());
        }

        private build(){
            const{points,tempVertex} = this;
            let j = 0;
            let m = points.length -1;
            for (j = 0; j < m ; j++)
			{
                let p1 = points[j];
                let p2 = points[j+1];
                tempVertex.set([p1.x,p1.y,p1.z,p2.x,p2.y,p2.z,-p1.t * 0.5,p1.r,p1.g,p1.b,p1.a]);
                tempVertex.set([p2.x,p2.y,p2.z,p1.x,p1.y,p1.z,p2.t * 0.5,p2.r,p2.g,p2.b,p2.a]);
                tempVertex.set([p2.x,p2.y,p2.z,p1.x,p1.y,p1.z,-p2.t * 0.5,p2.r,p2.g,p2.b,p2.a]);
                tempVertex.set([p1.x,p1.y,p1.z,p2.x,p2.y,p2.z,p1.t * 0.5,p1.r,p1.g,p1.b,p1.a]);
                tempVertex.numVertices += 4;
            }
            points.length = 0;
        }

        end(){
            const{origin,data32PerVertex,points,tempVertex,variables} = this;
            if(points.length){
                this.build();
            }
            let arr = tempVertex.toArray()
            let info = new VertexInfo(arr,data32PerVertex,variables);
            let v = this.vertexBuffer = context3D.createVertexBuffer(info);
            this.triangles = v.numVertices / 2;
            this.quad = this.triangles / 2;

            tempVertex.recycle();
            origin.recycle();

            this.tempVertex = this.origin = undefined;

        }

        updateSceneTransform(updateStatus = 0,parentSceneTransform?:IMatrix3D){
            return super.updateSceneTransform(updateStatus,parentSceneTransform);
        }

        render(camera:Camera,option:IRenderOption){


            let c = context3D;
            // c.setDepthTest(true,gl.LEQUAL);
            const{vertexBuffer:v,quad,triangles}=this;

            if(undefined == v){
                return;
            }

            let p = this.program;

            if(undefined == p){
                p = c.programs["Line3D"];
                if(undefined == p){
                    p = this.createProgram();
                }
                this.program = p
            }


            let setting = c.setting;
            setting.depth = true;
            setting.depthMode = WebGLConst.LEQUAL;
            setting.cull = WebGLConst.NONE;

            // scene.material.uploadContextSetting();

            c.setProgram(p);

            let m = TEMP_MATRIX3D.m3_append(camera.sceneTransform,false,this.sceneTransform);
            // m.set(this.sceneTransform);
            // m.m3_append(camera.sceneTransform);
            c.setProgramConstantsFromMatrix(VC.mv,m);
            c.setProgramConstantsFromMatrix(VC.p,camera.len);
            c.setProgramConstantsFromVector(VC.originFar,1/camera.originFar, 1, false);
            if(context3D.logarithmicDepthBuffer){
                c.setProgramConstantsFromVector(VC.logDepthFar, camera.logDepthFar, 1, false);
            }
            v.uploadContext(p);

            let i = c.getIndexByQuad(quad);

            c.drawTriangles(i,triangles)
        }


        


        protected createProgram():Program3D{
            let v_def = "";
            let f_def = "";
            if(context3D.logarithmicDepthBuffer){
                // key += "-log_depth_buffer";
                v_def += "#define LOG_DEPTH_BUFFER\n";
                f_def += "#define LOG_DEPTH_BUFFER\n";
                if(context3D.use_logdepth_ext){
                    // key += "_ext";
                    v_def += "#define LOG_DEPTH_BUFFER_EXT\n";
                    f_def += "#define LOG_DEPTH_BUFFER_EXT\n";
                }
            }

            let vertexCode = `
                ${v_def}
                attribute vec3 posX;
                attribute vec3 posY;
                attribute float len;
                attribute vec4 color;

                #ifdef LOG_DEPTH_BUFFER
                    #ifdef LOG_DEPTH_BUFFER_EXT
                        varying float depth;
                    #else
                        uniform float logDepthFar;
                    #endif
                #endif

                uniform mat4 mv;
                uniform mat4 p;
                varying vec4 vColor;
                uniform float originFar;

                void main(void){
                    vec4 pos = mv * vec4(posX,1.0); 
                    vec4 t = pos - mv * vec4(posY,1.0);
                    vec3 v = cross(t.xyz,vec3(0,0,1));
                    v = normalize(v);
                    float t2 = pos.z * originFar;
                    if(t2 == 0.0){
                       v.xyz *= len;
                    }else{
                        v.xyz *= len * t2;
                    }
                    // v.xyz *= len * t2;
                    // pos.xyz += v.xyz;
                    pos.xy += v.xy;
                    pos = p * pos;
                    
                    gl_Position = pos;
                    
                    #ifdef LOG_DEPTH_BUFFER
                        #ifdef LOG_DEPTH_BUFFER_EXT
                            depth = gl_Position.w + 1.0;
                        #else
                            gl_Position.z = log2( max( 0.0000001, gl_Position.w + 1.0 ) ) * logDepthFar * 2.0 - 1.0;
                            gl_Position.z *= gl_Position.w;
                        #endif
                    #endif

                    vColor = color;
                    // t2 = pos.z;
                    // pos = vec4(t2,t2,t2,1.0);
                    // vColor.xyzw = pos;
                }
            `

            let fragmentCode = ` 
                ${f_def}
                #ifdef LOG_DEPTH_BUFFER_EXT
                    #extension GL_EXT_frag_depth : enable
                #endif
                precision mediump float;
                varying vec4 vColor;
                #ifdef LOG_DEPTH_BUFFER_EXT
                    varying float depth;
                    uniform float logDepthFar;
                #endif
                void main(void){
                    gl_FragColor = vColor;
                    #ifdef LOG_DEPTH_BUFFER_EXT
	                    gl_FragDepthEXT = log2( depth ) * logDepthFar;
                    #endif
                }
            `

            return context3D.createProgram(vertexCode,fragmentCode,"Line3D");
        }
    }

    export class Trident extends Line3D{
        constructor(len:number = 200,think:number = 2){
            super();
            
            var line;
            if(len*0.1 > 60){
                line = len - 60;
            }else{
                line = len * 0.9
            }

            this.clear();
            let color = 0xFF0000;
            this.moveTo(0,0,0,think,color);
            this.lineTo(line,0,0,think,color);
            this.moveTo(line,0,0,think*5,color);
            this.lineTo(len,0,0,0,color);

            color = 0x00FF00;
            this.moveTo(0,0,0,think,color);
            this.lineTo(0,line,0,think,color);
            this.moveTo(0,line,0,think*5,color);
            this.lineTo(0,len,0,0,color);

            color = 0x0000FF;
            this.moveTo(0,0,0,think,color);
            this.lineTo(0,0,line,think,color);
            this.moveTo(0,0,line,think*5,color);
            this.lineTo(0,0,len,0,color);

            this.end();

        }
    }



    export class LinePlane extends Line3D{

        constructor(len:number = 2,think:number = 1,scale:number = 1){
            super();


            let c = Math.ceil(len / scale);
            let color = 0xFFFFFF;
            this.clear();
            this.moveTo(-len,0,-len,think * 2,color);
            this.lineTo(len,0,-len,think * 2,color);
            this.lineTo(len,0,len,think * 2,color);
            this.lineTo(-len,0,len,think * 2,color);
            this.lineTo(-len,0,-len,think * 2,color);

            color = 0xCCCCCC;
            let s = 0;
            for(let i=-c;i<c;i++){
                this.moveTo(i*scale,0,-len,think,color);
                this.lineTo(i*scale,0,len,think,color);
            }

            for(let i=-c;i<c;i++){
                this.moveTo(-len,0,i*scale,think,color);
                this.lineTo(len,0,i*scale,think,color);
            }

            this.end();

        }

    }

}