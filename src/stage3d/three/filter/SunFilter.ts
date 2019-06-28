module rf{

    export const enum FilterConst{
        SUN = "sun_"
    }

    export class SunFilter extends FilterBase{

        static VERTEX = {
            def:
`
uniform vec4 lightDirection;
varying float vDiffuse;
`,
            code:
`
vDiffuse =  clamp(dotValue(n,lightDirection,invm),0.1,1.0);
`,
        } as IShaderCode

        static FROGMENT = {
            def:
`
varying float vDiffuse;
`,
            code:
`
color.xyz *= (vDiffuse * 0.6 + 1.0);
`,
        } as IShaderCode


        constructor(){
            super(FilterConst.SUN);
            this.vertex = SunFilter.VERTEX;
            this.fragment = SunFilter.FROGMENT;
            (this as IShaderSetting).useInvm = true;
        }

        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            let s:Scene;
            if(target){
                s = (target as any).scene;
            }else{
                s = scene;
            }
            context.setProgramConstantsFromVector(VC.lightDirection, s.sun.normalsize, 4);
        }
    }
}
