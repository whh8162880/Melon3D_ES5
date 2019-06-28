///<reference path="./TexFilter.ts" />
module rf{

    export const enum FilterConst{
        LIU_GUANG = "liuguang_"
    }

    export interface ILiuGuangData extends ITexFilterData{
        speed:number;
        scale:number;
        alpha:number;
    }


    export class LiuguangFilter extends TexFilter{


        // static 


        constructor(target:Sprite,data:ILiuGuangData){
            super(target,FilterConst.LIU_GUANG);
            
            this.v = newVector3D();
            this.setData(data);
            // var func = "";
            // let def = "uniform vec4 liuguang;\nvarying vec2 vLiuguang;\n";
            // var code = "vLiuguang = liuguangFunc(liuguang,vUV);\n";
            // this.vertex = newShaderCode(code,def,func);

            // func = "";
            // def = "uniform sampler2D liuguangTex;\nvarying vec2 vLiuguang;\n";
            // code = "vec4 lc = texture2D(liuguangTex, vLiuguang.xy);\ncolor.xyz += (lc.xyz * sat((lc.w - vLiuguang.z) * vLiuguang.w));\n";
            // this.fragment = newShaderCode(code,def,func);
        }

        speed:number;
        texData:ILiuGuangData;
        v:IVector3D;

        setData(setting:ILiuGuangData){
            super.setData(setting);
            
            let{v} = this;
            let{speed,scale,alpha} = setting;
            
            this.speed = speed === undefined ? 0 : speed;
            v[1] = scale === undefined ? 1 : scale;
            v[2] = alpha === undefined ? 0.95 : alpha;
            v[3] = 1 / (1 - v[2]);
        }


        textureLoadComplete(source:BitmapSource){
            this.readly = true;
            this.target.shader = true;
            let g = gl;
            this.source.textureData = context3D.getTextureData(name,false,g.NEAREST,g.NEAREST,g.REPEAT);
        }


        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            let{v,source,speed} = this;
            source.uploadContext(program,"liuguangTex");

            v[0] =  speed * engineNow/1000
            context.setProgramConstantsFromVector("liuguang",v as Float32Array,4);
        }









    }
}