///<reference path="./TexFilter.ts" />
module rf{
    export class DiffFilter extends FilterBase{

        static VERTEX = {
def:
`
attribute vec2 uv;
varying vec2 vUV;
`,

code:
`
vUV = uv;
`
        } as IShaderCode;


        static FRAGMENT = {
def:
`
uniform sampler2D diff;
varying vec2 vUV;
`,

code:
`
vec4 color = texture2D(diff, vUV);
`
        } as IShaderCode;


        constructor(){
            super(FilterConst.DIFF);
            this.vertex = DiffFilter.VERTEX;
            this.fragment = DiffFilter.FRAGMENT;
            this.readly = true;
        }


    }

    export class UIDiffFilter extends FilterBase{

        static VERTEX = {
def:
`
attribute vec4 uv;
varying vec3 vUV;
`,

code:
`
vUV = uv.xyw;
`
        } as IShaderCode;


static FRAGMENT = {
    def:
    `
    uniform sampler2D diff;
    uniform sampler2D diff1;
    uniform sampler2D diff2;
    uniform sampler2D diff3;
    varying vec3 vUV;
    `,
    
    code:
    `
    vec4 color;
    if(vUV.z < 0.5){
        color = texture2D(diff, vUV.xy);
    }else if(vUV.z < 1.5){
        color = texture2D(diff1, vUV.xy);
    }else if(vUV.z < 2.5){
        color = texture2D(diff2, vUV.xy);
    }else if(vUV.z < 3.5){
        color = texture2D(diff3, vUV.xy);
    }
    
    `
            } as IShaderCode;

        constructor(){
            super(FilterConst.UIDIFF);
            this.vertex = UIDiffFilter.VERTEX;
            this.fragment = UIDiffFilter.FRAGMENT;
            this.readly = true;
        }


    }


    export class FillFilter extends FilterBase{

                static FRAGMENT = {
def:
`
uniform vec4 diffcolor;
`,

code:
`
vec4 color = diffcolor;
`
        } as IShaderCode;

        color:IVector3D;

        constructor(color:number,alpha:number){
            super(FilterConst.FILL);
            this.fragment = FillFilter.FRAGMENT;
            this.setData(color,alpha);
        }

        setData(color:number,alpha:number){
            this.color = toRGBA(color,this.color);
            this.color[3] = alpha;
        }


        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            context.setProgramConstantsFromVector("diffcolor",this.color,4);
        }

        



    }




}