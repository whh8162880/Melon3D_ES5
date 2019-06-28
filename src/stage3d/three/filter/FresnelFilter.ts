module rf{

    export const enum FilterConst{
        FRESNEL = "fresnel_",
        FRESNEL_ALPHA = "fresnelAlpha_"
    }

    export class FresnelFilter extends EventFilter{

        static VERTEX = {
            def:
`
uniform vec4 fresnel;
varying vec2 vFresnel;
`,
            code:
`
vFresnel  =  vec2(pow(1.0 - dotValue(n,fresnel,invm),2.0),fresnel.w);
`,
        } as IShaderCode


        static FRAGMENT = {
            def:
`
varying vec2 vFresnel;
`,
            code:
`
color.xyz *= (vFresnel.x * vFresnel.y +1.0) * color.w;
// color.w = vFresnel;
`,
        } as IShaderCode
        
        constructor(type?:FilterConst){
            super(type ? type : FilterConst.FRESNEL);
            this.vertex = FresnelFilter.VERTEX;
            this.fragment = FresnelFilter.FRAGMENT;
            this.eye = newVector3D(0,0,0,0);
            (this as IShaderSetting).useInvm = true;
            this.pro = {fre:0}
        }

        eye:IVector3D;
        pro:{fre:number};

        updatepro(pro:{fre:number}){
            this.eye[3] = pro.fre;
        }

        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            let eye = this.eye;
            let pos = camera.pos;
            eye.v3_normalize(pos);
            context.setProgramConstantsFromVector("fresnel",eye,4);
        }

        tweenTo(from:number,to:number,durtion:number){
            let event = {fre:from,time:0} as ISkillEvent;
            event.next = {fre:to,time:durtion} as ISkillEvent;
            this.setEvent(event);
            this.starttime = engineNow;
            Engine.addTick(this);
        }

        end(){
            Engine.removeTick(this);
        }

    }



    export class FresnelAlphaFilter extends FresnelFilter{
        static VERTEX = {
            def:
`
uniform vec4 fresnel;
varying vec2 vFresnel;
`,
            code:
`
vFresnel  =  vec2(pow(1.0 - dotValue(n,fresnel,invm),fresnel.w),fresnel.w);
`,
        } as IShaderCode

        static FRAGMENT = {
            def:
`
// uniform vec4 fresnel_color;
varying vec2 vFresnel;
`,
            code:
`
color.xyz *= (vFresnel.x + 1.0);
//  * fresnel_color.xyz;
color.w *= vFresnel.x;
`,
        } as IShaderCode
        

        constructor(value:number){
            super(FilterConst.FRESNEL_ALPHA);
            this.vertex = FresnelAlphaFilter.VERTEX;
            this.fragment = FresnelAlphaFilter.FRAGMENT;
            this.eye[3] = value;
        }

        color:IVector3D;

       
    }
}