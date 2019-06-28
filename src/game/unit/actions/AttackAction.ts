///<reference path="./ActorAction.ts" />
module rf{
    export class AttackAction extends ActorAction
	{
		constructor()
		{
			super();
			this.stateID = StateDefine.ATTACK;
		}
        
        
       
		
		actionname:string;
		complete:Function;
		thisobj:any;


		check(actor:ActionActor,state:StateModel){
			var mesh:KFMMesh = actor.body;
			if(!mesh || !mesh.skAnim){
				return false;
            }
			return super.check(actor,state);
		}
		
		doStart(actor:ActionActor, params?:any){
			this.actionname = params[0]
			this.thisobj = params[1]
			this.complete = params[2]
			
			var mesh = actor.body;
			mesh.skAnim.on(EventT.PLAY_COMPLETE,this.end, this);
            
            let{actionname} = this;
			if(actionname.indexOf(ExtensionDefine.KF) == -1){
                actionname += ExtensionDefine.KF;
                this.actionname = actionname;
			}
			actor.playAnim(actionname, true);
		}
		
		end(event?:EventX)
		{
			if(event){
				var node:ISkeletonAnimationData = event.data;
				if(node && node.name != this.actionname){
					return;
				}
			}
			this.actor.state.stopState(this.stateID,this.stateID);
			
		}

		stop(activeID:StateDefine){
			let{actor, complete, thisobj}=this
			var mesh = actor.body;
			if(mesh && mesh.skAnim){
				mesh.skAnim.off(EventT.PLAY_COMPLETE,this.end, this);
			}
			if(this.actionname != "die.kf"){
				actor.playDefaultAnim();
			}
			this.complete = undefined;
			if(complete != undefined){
				complete.call(thisobj)
			}
		}

		
	}

}