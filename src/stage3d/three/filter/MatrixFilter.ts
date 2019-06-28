///<reference path="./EventFilter.ts" />
module rf{

    export class PosFilter extends EventFilter{
        constructor(){
            super(SkillEventConst.POS+"");
            this.skey = "";
            this.pro = {x:0,y:0,z:0};
        }

        updatepro(pro:{x:number,y:number,z:number}){
            this.target.setPos(pro.x,pro.y,pro.z);
        }


    }

    export class ScaleFilter extends EventFilter{
        constructor(){
            super(SkillEventConst.SCALE+"");
            this.skey = "";
            this.pro = {x:1,y:1,z:1};
        }

        updatepro(pro:{x:number,y:number,z:number}){
            this.target.setSca(pro.x,pro.y,pro.z);
        }
    }


    export class RotFilter extends EventFilter{
        constructor(){
            super(SkillEventConst.ROT+"");
            this.skey = "";
            this.pro = {x:0,y:0,z:0};
        }
        
        updatepro(pro:{x:number,y:number,z:number}){
            this.target.setRot(pro.x,pro.y,pro.z);
        }
    }
}