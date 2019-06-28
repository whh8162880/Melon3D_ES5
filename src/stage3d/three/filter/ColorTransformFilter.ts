///<reference path="./EventFilter.ts" />
module rf {
    export class ColorTransformFilter extends EventFilter {

        static FRAGMENT = {
            def:
`
uniform vec4 color_mul;
uniform vec4 color_add;
`,
            code:
`
color  = color * color_mul + color_add;
`
        } as IShaderCode;
        constructor() {
            super(SkillEventConst.COLOR_TRANFORM + "");
            this.skey = SkillEventConst.COLOR_TRANFORM + "_";

            this.mul = newVector3D(1, 1, 1, 1);
            this.add = newVector3D(0, 0, 0, 0);
            this.pro = {mr:1,mg:1,mb:1,ma:1,ar:0,ag:0,ab:0,aa:0};

            this.fragment = ColorTransformFilter.FRAGMENT;

        }

        pro:{mr:number,mg:number,mb:number,ma:number,ar:number,ag:number,ab:number,aa:number};

        mul: IVector3D;
        add: IVector3D;


        updatepro(pro:{mr:number,mg:number,mb:number,ma:number,ar:number,ag:number,ab:number,aa:number}){
            let{mul,add}=this;
            
            mul[0] = pro.mr;
            mul[1] = pro.mg;
            mul[2] = pro.mb;
            mul[3] = pro.ma;

            add[0] = pro.ar;
            add[1] = pro.ag;
            add[2] = pro.ab;
            add[3] = pro.aa;
        }


        setProgramConstants(context: Context3D, program: Program3D,target?:Sprite) {
            let{mul,add}=this;
            context3D.setProgramConstantsFromVector("color_mul",mul,4);
            context3D.setProgramConstantsFromVector("color_add",add,4);
        }

        alphaTo(from:number,to:number,durtion:number){
            let event = {ma:0,time:0} as ISkillEvent;
            event.next = {ma:from,time:100} as ISkillEvent;
            event.next.next = {ma:to,time:durtion+100} as ISkillEvent;
            this.setEvent(event);
            this.starttime = engineNow;
            Engine.addTick(this);
        }

        end(){
            Engine.removeTick(this);
        }





    }
}