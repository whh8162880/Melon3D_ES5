///<reference path="../../../reference.ts" />
///<reference path="../../state/State.ts" />
///<reference path="../../state/StateDefine.ts" />
module rf{
    export class ActorAction extends MiniDispatcher implements ITickable
	{
		stateID:number;
		// /**
		//  * 返回此动作是否已经完成（即不再需要tick了）
		//  */
		// isFinished:boolean;
		
		actor:ActionActor;
		//只有主角才会执行
		init(){}

		check(actor:ActionActor,state:StateModel){
			return state.check(this.stateID);
		}

		start(actor:ActionActor, params?:any){
			this.actor = actor;
			let{state} = actor;
			//1.checkState
			if(this.check(actor,state) == false){
				return false;
			}
			//2.updateState
			state.startState(this.stateID,this,this.stop,this.tryStop);
			//3.doStart
			this.doStart(actor, params);
			return true;
		}
		
		doStart(actor:ActionActor, params?:any){
			
		}


		tryStop(activeID:number){
			return 0;
		}

		end(){
			this.actor.state.stopState(this.stateID,this.stateID)
		}

		stop(activeID:number){

		}
		
		update(now: number, interval: number){
			
		}
		
		actorSyncPosition(){
            let{actor}=this;
			if(actor){
				// actor.actorSyncPosition();
			}
        }
        

    }

}