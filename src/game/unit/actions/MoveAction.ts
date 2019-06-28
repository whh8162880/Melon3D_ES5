module rf{
    export class MoveAction extends ActorAction{
		
		constructor(){
			super()
			this.stateID = StateDefine.MOVE
		}

		check(actor:ActionActor,state:StateModel){
			// let map = singleton(SnakeMap);
			// let{setting} = map.data;
			// if(!setting){
			// 	return false;
			// }
			return super.check(actor, state)
		}

		tx:number;
		ty:number;
		endtime:number;
		autoAnim:boolean;

		duration:number;
		startTime:number;
		fx:number;//起始
		fy:number;
		dx:number;//间距
		dy:number;

		reach:boolean;
		doStart(actor:ActionActor, params?:any){
			let{_x, _y, movespeed} = actor;
			let{tx, ty, endtime} = this;
			this.fx = _x;
			this.fy = _y;
			actor.faceto(tx, ty)

			let sy = actor.sceneModel == SCENE_MODEL.MAP2D ? rf.SY : 1;

			let dx = this.dx = tx - _x;
			let dy = this.dy = ty - _y;

			let duration:number;
			
			if(endtime != -1){
				duration = endtime - engineNow;//todo  应为服务器时间
			}else{
				dy *= sy;
				let len = Math.sqrt(dy*dy + dx*dx);
				duration = len / movespeed;
			}
			if(duration < 10){
				duration = 10;
			}
			this.duration = duration;
			this.startTime = engineNow;
			// this.startTime = 0;

			this.reach = false;

			// console.log(actor.body.currentAnim)
			actor.defaultAnim = "run.kf";
			if(actor.state.isRunning(StateDefine.ATTACK) == false ){
				actor.playDefaultAnim()
			}
			// if(actor.body && actor.body.currentAnim != "run.kf"){
			// 	actor.body.playAnim("run.kf")
			// }
			// console.log(actor.body.currentAnim, 2222222222)
			
			gameTick.addTick(this)
		}

		update(now: number, interval: number){
			let{duration, startTime, actor, dx, fx, dy, fy} = this;
			if(actor.state.isRunning(StateDefine.HIT) ){
				return;
			}
			let currentTime = now - startTime;
			
			// this.startTime += 16;
			// currentTime = startTime;
			
			if(currentTime < duration){
				let n = currentTime / duration;
				actor.updateXY(n * dx + fx, n * dy + fy);
			}else{
				actor.updateXY(dx+fx,dy+fy);
				this.reach = true;
				this.end()
			}
			actor.updateSceneTransform();
			let camera = (ROOT.camera2D as Arpg2DCamera)
			if(camera){
				  camera.update(0,0);
			}
		}

		stop(stateID:number){
			gameTick.removeTick(this)
			let{actor,autoAnim}=this;
			this.actor.defaultAnim = "stand.kf"
			if(autoAnim){
				this.actor.playDefaultAnim()
			}
			actor.simpleDispatch(EventT.MOVE_COMPLETE, this.reach);
			

		}

	}



}