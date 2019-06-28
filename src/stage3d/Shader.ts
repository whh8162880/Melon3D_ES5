module rf{

    export interface IShaderCode{
        def:string;
        func:string;
        code:string;
    }

    export interface IShaderSetting{
        skey:string;
        useEye?:boolean;
        usePos?:boolean;
        useQua2mat?:boolean;
        useNormal?:boolean;
        useColor?:boolean;
        useShadow?:boolean;
        useInvm?:boolean;
    }

    export var IShaderSettingPros = [
        "useEye","usePos","useQua2mat","useNormal","useColor",
        "useShadow","useInvm"
    ];

    export function newShaderCode(code:string,def:string,func:string){
        return {def,func,code} as IShaderCode;
    }


    export class Shader{


        

        init(vertex_render_list,frament_render_list){
            this.vertex_render_list = vertex_render_list;
            this.frament_render_list = frament_render_list;
        }



        vertex_render_list = [
            FilterConst.BASIC,
            FilterConst.NORMAL,
            FilterConst.COLOR,
            FilterConst.UI,
            FilterConst.MATRIX_UI,
            FilterConst.SKELETON,
            FilterConst.SUN,
            FilterConst.FRESNEL,
            FilterConst.FRESNEL_ALPHA,
            FilterConst.DIFF,
            SkillEventConst.UV,
            SkillEventConst.TEXTURE_CHANNEL,
            FilterConst.UIDIFF,
            FilterConst.LIU_GUANG,
            FilterConst.SHADOW,
            FilterConst.MV,
            FilterConst.OUT_LINE,
            FilterConst.P,
            FilterConst.MVP,
        ]


        frament_render_list = [
            FilterConst.DIFF,
            FilterConst.FILL,
            FilterConst.COLOR,
            SkillEventConst.TEXTURE_CHANNEL,
            FilterConst.DISCARD,
            SkillEventConst.COLOR_TRANFORM,
            FilterConst.SUN,
            FilterConst.FRESNEL,
            FilterConst.FRESNEL_ALPHA,
            FilterConst.GRAY,
            FilterConst.HOLE,
            FilterConst.CIRCLE,
            FilterConst.SHADOW,
        ]


        createProgram(target:{filters:{[key:string]:FilterBase},shader?:boolean}){

            let {filters} = target;
            let key = "";
            for(let filterKey in filters){
                let filter = filters[filterKey];
                if(filter && filter.readly){
                    key += filter.skey;
                }
            }

            let p = context3D.programs[key];

            if(!p) {

                let setting = {} as IShaderSetting;

                for(let filterKey in filters){
                    let filter = filters[filterKey];
                    if(filter && filter.readly){
                        filter.updateSetting(setting);
                    }
                }


                let v = this.createVertex2(filters,setting);
                let f = this.createFragment2(filters,setting);
                p = context3D.createProgram(v,f,key);

                p.setting = setting;
            }

            target.shader = false;

            return p;
        }


        createVertex2(filters:{[key:string]:FilterBase},setting?:IShaderSetting){
            let filter:FilterBase;
            let def = "";
            let code = "";
            let func = "";

            if(!setting){
                setting = {} as IShaderSetting;
            }


            function append(filter:FilterBase){
                if(filter && filter.readly){
                    let{vertex}=filter;
                    if(vertex){
                        if(vertex.def){
                            def += vertex.def;
                        }
    
                        if(vertex.func){
                            func += vertex.func;
                        }
    
                        if(vertex.code){
                            code += vertex.code;
                        }
                    }
                }
            }

            func += Shader.FUNC_SAT;

            func += Shader.FUNC_DOT_VALUE;

            if(setting.useQua2mat){
                func += Shader.FUNC_QUA2MAT;
            }

            let list = this.vertex_render_list;
            for (let i = 0; i < list.length; i++) {
                append(filters[list[i]]);
            }

            if(setting.useInvm){
                def += "uniform mat4 invm;\n"
            }

            if(setting.usePos){
                def += "varying vec3 vpos;\n";
                code += `vpos.xyz = p.xyz;\n`;
            }

            if(setting.useColor){
                code += "vColor = c;";
            }



            

            return  `
${def}
${func}
void main(void){
    ${code}
    gl_Position = p;
}
`
        }


        createFragment2(filters:{[key:string]:FilterBase},setting?:IShaderSetting){

            function append(filter:FilterBase){
                if(filter && filter.readly){
                    let{fragment}=filter;
                    if(fragment){
                        if(fragment.def){
                            def += fragment.def;
                        }
    
                        if(fragment.func){
                            func += fragment.func;
                        }
    
                        if(fragment.code){
                            code += fragment.code;
                        }
                    }
                }
            }

            let def = "";
            let func = "";
            let code = "";

            let list = this.frament_render_list;
            for (let i = 0; i < list.length; i++) {
                append(filters[list[i]]);
            }


           


            if(setting.usePos){
                def += "varying vec3 vpos;\n";
            }


            func += Shader.FUNC_SAT;

            return  `
precision mediump float;
// precision lowp float;
${def}
${func}
void main(void){
    ${code}
    gl_FragColor = color;   
}
`
        }



        static FUNC_QUA2MAT = 
`
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
`

        static FUNC_SHADOW_ENCODE =
`
const vec3 PackFactors2 = vec3( 256. * 256. * 256., 256. * 256., 256. );
const float PackUpscale = 256. / 255.;
const float ShiftRight8 = 1. / 256.;

vec4 packDepthToRGBA( float v ) {
    vec4 r = vec4( fract( v * PackFactors2 ), v );
    r.yzw -= r.xyz * ShiftRight8;
    return r * PackUpscale;
}
`

        static FUNC_SHADOW_DECODE =
`
const float UnpackDownscale = 255. / 256.;
const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );
float unpackRGBAToDepth( const in vec4 v ) {
    return dot( v, UnpackFactors );
}

float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
    return step( unpackRGBAToDepth( texture2D( depths, uv ) ) , compare );
}
`

        static FUNC_SAT = 
`
float sat(float v)
{
    return clamp(v,0.0,1.0);
}

vec2 sat(vec2 v)
{
    return clamp(v,0.0,1.0);
}
`

        static FUNC_DOT_VALUE = 
`
float dotValue(vec3 n,vec4 dir,mat4 invm){
    return dot(normalize(vec4(n, 0.0) * invm).xyz,dir.xyz);
}
`
    }
}