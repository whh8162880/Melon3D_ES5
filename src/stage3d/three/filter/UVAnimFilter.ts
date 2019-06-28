module rf{
    export class UVAnimFilter extends EventFilter{

        static VERTEX = {
            def:
`
uniform vec4 uvAnim;
`,
            code:
`
vUV = (vUV.xy - vec2(0.5)) * uvAnim.zw + uvAnim.xy + vec2(0.5);
`
        } as IShaderCode



        constructor(){
            super(SkillEventConst.UV+"");
            this.skey = SkillEventConst.UV+"_";
            this.uv = newVector3D();
            this.pro = {ou:0,ov:0,su:1,sv:1};
            // this.pro = {ou:-0.1,ov:-0.1,su:1,sv:1};
            this.vertex = UVAnimFilter.VERTEX;
        }

        uv:IVector3D;
        pro:{ou:number,ov:number,su:number,sv:number};

        updatepro(pro:{ou:number,ov:number,su:number,sv:number}){
            let{uv} = this;
            uv[0] = pro.ou;
            uv[1] = pro.ov;
            uv[2] = pro.su;
            uv[3] = pro.sv;

            // uv[0] = 0;
            // uv[1] = 0.1;
            // uv[2] = 1;
            // uv[3] = 0.6;
        }

        // update(now:number,interval: number){
        //     super.update(now,interval)
        //     console.log(Math.floor(now),this.uv);
        // }

        
        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            let {uv} = this;
            context.setProgramConstantsFromVector("uvAnim",uv,4);
        }


        
    }
}