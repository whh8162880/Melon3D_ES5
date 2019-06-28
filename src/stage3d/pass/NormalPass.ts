module rf{


    export var pass_vertexBuffer:VertexBuffer3D;

    export var pass_vertexInfo:VertexInfo;

    export var pass_temp_pos = {x:-1,y:1,w:1,h:-1};
    export var pass_temp_uv = {x:0,y:0,w:1,h:1};
    export var pass_temp_transform = newMatrix3D();

    export function pass_init_mesh(){

        pass_vertexInfo = new VertexInfo(
            new Float32Array([
                -1,1,0,0,       1,1,0,0,
                1,-1,0,0,        -1,-1,0,0
            ]), 
            4,
        {
            "pos":{size:2,offset:0},
            "uv":{size:2,offset:2}
        });

        pass_vertexBuffer = context3D.createVertexBuffer(pass_vertexInfo);

        pass_temp_transform.m3_scale(1,-1,1);
    }

    export function pass_update_mesh(pos?:Size,uv?:Size){

        if(!pos){
            pos = pass_temp_pos;
        }

        if(!uv){
            uv = pass_temp_uv;
        }


        let {vertex,data32PerVertex} = pass_vertexInfo;
        //设置坐标
        vertex[0] = vertex[data32PerVertex*3] = pos.x;
        vertex[1] = vertex[data32PerVertex+1] = pos.y;
        vertex[data32PerVertex] = vertex[data32PerVertex*2] = pos.w;
        vertex[data32PerVertex*2+1] = vertex[data32PerVertex*3 + 1] = pos.h;

        //设置uv
        vertex[2] = vertex[data32PerVertex*3+2] = uv.x;
        vertex[3] = vertex[data32PerVertex+3] = uv.y;
        vertex[data32PerVertex+2] = vertex[data32PerVertex*2+2] = uv.w;
        vertex[data32PerVertex*2+3] = vertex[data32PerVertex*3 + 3] = uv.h;
        

        pass_vertexBuffer.uploadFromVector(pass_vertexInfo);
    }

    export var pass_vertex_code = "attribute vec2 pos;\nattribute vec2 uv;\nuniform mat4 mvp;\nvarying vec2 vUV;\nvarying vec2 vPos;\nvoid main(void){\ngl_Position= mvp * vec4(pos,0.0,1.0);\nvPos=pos;\nvUV=uv;\n}\n"
    export var pass_fragment_code = "precision mediump float;\nuniform sampler2D diff;\nvarying vec2 vUV;\nvarying vec2 vPos;\n{1}\nvoid main(void){\nvec4 color = texture2D(diff, vUV);\n {0}\ngl_FragColor = color;\n}";

    

    export function pass_dc(tex:Texture,program:Program3D,vertex:VertexBuffer3D,transfrom?:IMatrix3D,quadcount:number = 1,index?:IndexBuffer3D){

        if(!transfrom){
            transfrom = pass_temp_transform;
        }

        let c = context3D;
        c.setProgramConstantsFromMatrix("mvp",transfrom);
        tex.uploadContext(program,"diff");
        vertex.uploadContext(program);

        if(!index){
            index = c.getIndexByQuad(quadcount);
            c.drawTriangles(index,quadcount * 2);
        }else{
            c.drawTriangles(index,index.numIndices);
        }

        
    }

    /**
     * 把贴图中的某块绘制到某个位置上去。
     * @param tex  
     * @param pos 
     * @param uv 
     * @param tarnsform 
     */
    export function pass_normal_render(tex:Texture,pos?:Size,uv?:Size,transfrom?:IMatrix3D){

        pass_update_mesh(pos,uv);

        let program = context3D.programs["pass_normal"];
        if(!program){
            let code = "";
            let def = "";
            // code = "color = vec4(1.0,1.0,1.0,1.0);\n";
            program = context3D.createProgram(pass_vertex_code,pass_fragment_code.substitute(code,def),"pass_normal");
        }


        context3D.setProgram(program);

        pass_dc(tex,program,pass_vertexBuffer,transfrom);


    }


    // export function pass_blur_render(tex:Texture,blurX:number,blurY:number,pos?:Size,uv?:Size,transfrom?:IMatrix3D){
    //     pass_update_mesh(pos,uv);

    //     let key = "pass_blur_{0}_{1}".substitute(blurX,blurY)

    //     let program = context3D.programs[key];
    //     if(!program){
    //         let code = `
    //     vec4 tUV = vec4(vUV,0.0,0.0);
    //     float count = 0.0;
    //     float g = 0.0;
    //     float a = 0.8;
    //     float t1 = 2.0 * a * a;
    //     float t2 = 1.0 / (t1 * 3.14159265);

    //     // https://baike.baidu.com/item/%E9%AB%98%E6%96%AF%E6%A8%A1%E7%B3%8A/10885810?fr=aladdin

    //     color = vec4(0.0);
    //     for(float i=${-blurX}.0;i<${blurX}.0;++i){
    //         tUV.z = i*texuv.x;
    //         tUV.x = vUV.x + tUV.z;
    //         tUV.z *= tUV.z;
    //         for(float j=${-blurY}.0;j<${blurY}.0;++j){
    //             tUV.w = j*texuv.y;
    //             tUV.y = vUV.y + tUV.w;
    //             tUV.w *= tUV.w;
    //             g = t2 * exp(-(tUV.z+tUV.w)/t1);
    //             color += texture2D(diff, tUV.xy) * g;
    //             count += g;
    //         }
    //     }
    //     color /= count;
    //     `
    //         let def = "uniform vec2 texuv;\n";
    //         program = context3D.createProgram(pass_vertex_code,pass_fragment_code.substitute(code,def),key);
    //     }

    //     context3D.setProgram(program);
    //     context3D.setProgramConstantsFromVector("texuv",tex.uv,2);

    //     pass_dc(tex,program,pass_vertexBuffer,transfrom);

    // }


    export function pass_blur_render2(tex:Texture,blurX:number,blurY:number,pos?:Size,uv?:Size,transfrom?:IMatrix3D){
        pass_update_mesh(pos,uv);

        let key = "pass_blur";

        let program = context3D.programs[key];
        if(!program){
            let code = `
            color = vec4(0.0);
            float f = 0.0;
            float tot = 0.0;
            for(float i=-10.0;i<10.0;i++){
                if(texuv.z < abs(i)){
                    continue;
                }
                for(float j = -10.0; j < 10.0; j++)
                {
                    if(texuv.w < abs(j)){
                        continue;
                    }
                    f = (1.1 - sqrt(i*i + j*j)/8.0);
                    f *= f;
                    tot += f;
                    color += texture2D( diff, vec2(vUV.x + j * texuv.x, vUV.y + i * texuv.y) ) * f;
                }
            }
            color /= tot;
        `
            let def = "uniform vec4 texuv;\n";
            program = context3D.createProgram(pass_vertex_code,pass_fragment_code.substitute(code,def),key);
        }

        context3D.setProgram(program);
        let temp = TEMP_VECTOR3D as Float32Array;
        // temp[0] = tex.uv[0] * 2.0;
        // temp[1] = tex.uv[1] * 2.0;
        temp[2] = blurX = 5;
        temp[3] = blurY = 5;
        context3D.setProgramConstantsFromVector("texuv",temp,4);
        // context3D.setProgramConstantsFromVector("blurdata",tex.uv,2);
        pass_dc(tex,program,pass_vertexBuffer,transfrom);
    }



    export function pass_outline_render(tex:Texture,pos?:Size,uv?:Size,transfrom?:IMatrix3D){
        pass_update_mesh(pos,uv);
        let key = "pass_outline";
        let program = context3D.programs[key];
        if(!program){
            let code = `
            vec4 curColor;
            vec4 outlineColor = vec4(0.0,1.0,0.0,1.0);
            const float PI2 = 6.283185307179586;
            float maxAlpha = 0.0;
            float thickness = 3.0;
            vec2 displaced;
            for (float angle = 0.; angle < PI2; angle += 0.5000000 ) {
                displaced.x = vUV.x + thickness * texuv.x * cos(angle);
                displaced.y = vUV.y + thickness * texuv.y * sin(angle);
                curColor = texture2D(diff, displaced);
                maxAlpha = max(maxAlpha, curColor.a);
            }

            float resultAlpha = max(maxAlpha, color.w);

            color.xyz = (color.xyz + outlineColor.xyz * (1.0 - color.w)) * resultAlpha;
            color.w = resultAlpha;
        `
            let def = "uniform vec4 texuv;\n";
            program = context3D.createProgram(pass_vertex_code,pass_fragment_code.substitute(code,def),key);
        }

        context3D.setProgram(program);
        let temp = TEMP_VECTOR3D as Float32Array;
        // temp[0] = tex.uv[0] * 1;
        // temp[1] = tex.uv[1] * 1;
        context3D.setProgramConstantsFromVector("texuv",temp,4);
        // context3D.setProgramConstantsFromVector("blurdata",tex.uv,2);
        pass_dc(tex,program,pass_vertexBuffer,transfrom);
    }
}