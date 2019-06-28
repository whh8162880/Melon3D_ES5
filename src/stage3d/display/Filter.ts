module rf{
    export const enum FilterConst{
        BASIC = "basic_",
        NORMAL = "normal_",
        UI = "ui_",
        COLOR = "color_",
        DIFF = "diff_",
        FILL = "fill_",
        UIDIFF = "uidiff_",
        GRAY = "gray_",
        HOLE = "hole_",
        CIRCLE = "circle_",
        BLUR = "blur_",
        MVP = "mvp_",
        MV = "mv_",
        P = "p_",
        DISCARD = "discard_",
    }


    export class FilterBase extends STweenBase implements IShaderSetting{
        constructor(type:string){
            super();
            this.type = type;
            this.skey = type;
            this.readly = true;
        }
        readly:boolean;
        disable:boolean;

        skey:string;

        vertex:IShaderCode;

        fragment:IShaderCode;


        updateSetting(setting:IShaderSetting){
            let pros = IShaderSettingPros;
            for (let i = 0; i < pros.length; i++) {
                const element = pros[i];
                setting[element] = setting[element] || this[element];
            }
        }
       

        createCode(){

        }

        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){

        }
    }




    export class BasicFilter extends FilterBase{
        constructor(){
            super(FilterConst.BASIC);


            let def = 
`
attribute vec3 pos;
`;
            var func = ``
            var code = 
`
vec4 p = vec4(pos,1.0);
`;

            this.vertex = newShaderCode(code,def,func);


        }
    }

    export class NormalFilter extends FilterBase{
        constructor(){
            super(FilterConst.BASIC);


            let def = 
`
attribute vec3 normal;
`;
            var func = ``
            var code = 
`
vec3 n = normal;
`;

            this.vertex = newShaderCode(code,def,func);


        }
    }


    export class ColorFilter extends FilterBase{
        constructor(){
            super(FilterConst.BASIC);


            let def = 
`
attribute vec4 color;
varying vec4 vColor;
`;
            var func = ``
            var code = 
`
vec4 c = color;
`;

            this.vertex = newShaderCode(code,def,func);


            def = 
`
varying vec4 vColor;
`;
            func = ``
            code = 
`
color = vColor * color;
`;

            this.fragment = newShaderCode(code,def,func);



            (this as IShaderSetting).useColor = true;
        }
    }


    export class MvpFilter extends FilterBase{
        constructor(){
            super(FilterConst.MVP);


            let def = 
`
uniform mat4 mvp;
`;
            var func = ``
            var code = 
`
p = mvp * p;
`;

            this.vertex = newShaderCode(code,def,func);
        }
    }


    export class MvFilter extends FilterBase{
        constructor(){
            super(FilterConst.MV);


            let def = 
`
uniform mat4 mv;
`;
            var func = ``
            var code = 
`
n = (mv * vec4(n,1.0)).xyz;
p = mv * p;
`;

            this.vertex = newShaderCode(code,def,func);
        }

        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            let {sceneTransform} = target;
            let m = TEMP_MATRIX3D.m3_append(camera.sceneTransform,false,sceneTransform);
            // m.set(this.sceneTransform);
            // m.m3_append(camera.sceneTransform);
            context.setProgramConstantsFromMatrix("mv",m);
        }
    }

    export class MpFilter extends FilterBase{
        constructor(){
            super(FilterConst.MV);


            let def = 
`
uniform mat4 mp;
`;
            var func = ``
            var code = 
`
p = mp * p;
`;

            this.vertex = newShaderCode(code,def,func);
        }


        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            context.setProgramConstantsFromMatrix("mp",camera.len);
        }
    }


    export class DiscardFilter extends FilterBase{
        static FRAGMENT = {
            code:
`
if(color.w <= 0.05) {
    discard;
}
color.w = (color.w - 0.05) / 0.95;
`
        } as IShaderCode;


        constructor(){
            super(FilterConst.DISCARD);
            this.fragment = DiscardFilter.FRAGMENT;
        }
    }


    // export class UIFilter extends FilterBase{
    //     constructor(){
    //         super(FilterConst.UI);
    //     }
    // }

    export class GrayFilter extends FilterBase{

        static FARGMENT = {
            code:
`
float grey = dot(color.xyz,vec3(0.299, 0.587, 0.114));
color.xyz = vec3(grey,grey,grey);
`
        } as IShaderCode

        constructor(){
            super(FilterConst.GRAY);

            this.fragment = GrayFilter.FARGMENT;
        }
    }

    export class HoleFilter extends FilterBase{

        static FARGMENT = {
            def:"uniform vec4 hole;",
            code:`
vec2 pos = vpos.xy - hole.xy;
float r = length(pos) - hole.w;
color.w = sat(r / hole.z) * color.w;
`
        } as IShaderCode

        constructor(){
            super(FilterConst.HOLE);
            this.pos = newVector3D();
            (this as IShaderSetting).usePos = true;
            this.fragment = HoleFilter.FARGMENT;
        }

        pos:IVector3D;

        setConstants(x:number,y:number,len:number,inner:number){
            let{pos} = this;
            pos.x = x;
            pos.y = y;
            pos.z = len - inner;
            pos.w = inner;
        }

        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            context.setProgramConstantsFromVector("hole",this.pos as Float32Array,4)
        }
    }


    export class CircleFilter extends FilterBase{

        static FRAGMENT = newShaderCode(
`
uniform vec4 circleConst;
`,
`
float circleFunc(vec3 pos,vec4 data){
    float a=length(pos.xy-data.xy);
    return (1.0 - sat(a-data.z)) * sat(a-data.w);
}
`,
`
color.w = circleFunc(vpos,circleConst) * color.w;
`
        )


        constructor(x:number,y:number,len:number,inner:number){
            super(FilterConst.CIRCLE);
            this.pos = newVector3D();


            this.fragment = CircleFilter.FRAGMENT;

            this.setConstants(x,y,len,inner);
        }

        pos:IVector3D;

        setConstants(x:number,y:number,len:number,inner:number){
            let{pos} = this;
            pos.x = x;
            pos.y = y;
            pos.z = len-1.0;
            pos.w = inner-1.0;
        }

        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            context.setProgramConstantsFromVector("circleConst",this.pos as Float32Array,4)
        }
    }


    export class UIFilter extends FilterBase{

        static VERTEX =
 {
    def:
`uniform vec4 ui[${max_vc}];
`,
    code:
`vec4 tv = ui[int(uv.z)];
p.xy = p.xy + tv.xy;
p.xy = p.xy * tv.zz;
c.w *= tv.w;
`
 } as IShaderCode


        constructor(){
            super(FilterConst.UI);
            this.vertex = UIFilter.VERTEX;
        }
    }
}