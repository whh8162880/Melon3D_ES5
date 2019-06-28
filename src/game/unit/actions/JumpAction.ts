module rf{

     export class JumpAction extends ActorAction{

        constructor(){
            super();
            this.stateID = StateDefine.JUMP;

        }

        tx:number;
        ty:number;
        len:number;

        h:number;
        

        doStart(actor:ActionActor, params?:any){
            

		}

     }

}