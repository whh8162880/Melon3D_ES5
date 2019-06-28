module rf{
    export class FollowAction extends ActorAction{
		static posDic:{[key:number]:number} = {};
		static keyDic:{[key:number]:number} = {}

		constructor(){
			super()
			this.stateID = StateDefine.FOLLOW
		}

		target:ActionActor;
		distance:number = 300;
		min_dis:number = 200
		max_dis:number = 1200;

		check(actor:ActionActor,state:StateModel){
			if(!this.target){
				return false;
			}
			return super.check(actor, state)
		}

		doStart(actor:ActionActor, params?:any){
			actor.on(EventT.NAVIGATION_LOC_COMPLETE, this.turnface, this)
			// this.follow();
			time500.add(this.follow,this);
		}

		turnface(){
			let{actor, target} = this;
			let{_x, _y} = target;
			if(!actor.state.isRunning(StateDefine.MOVE)){
				actor.faceto(_x, _y)
			}
		}

		follow(){
			let monster = this.actor as Monster;
			if(monster.state.isRunning(StateDefine.HIT) ){
				return;
			}

			let{target, distance, min_dis, max_dis} = this

			let{_x:tx, _y:ty} = target;
			let{_x, _y} = monster;
			let dx = tx - _x;
			ty *= SY
			_y *= SY;
			let dy = (ty - _y);
			let len = Math.sqrt(dx*dx + dy*dy)
			
			if(len > max_dis){
				this.actor.state.stopState(StateDefine.MOVE,this.stateID)
				let{_x, _y} = this.actor;
				// this.turnface()
				this.updateposDic(this.actor.guid, _x, _y)
			}
			else if(len > distance){
				let dir = Math.atan2(dy ,dx);
				dir = dir * RADIANS_TO_DEGREES;

				TEMP_VECTOR3D.x = dx;
				TEMP_VECTOR3D.y = dy;
				TEMP_VECTOR3D.z = 0;
				TEMP_VECTOR3D.w = 0
				TEMP_VECTOR3D.v3_normalize()
				TEMP_VECTOR3D.v3_scale(min_dis)
				
				dx = tx - TEMP_VECTOR3D.x;
				dy = ty - TEMP_VECTOR3D.y;

				let[mx, my] = this.findPointCanStand(TEMP_VECTOR3D,dx, dy,  tx, ty );
				mx *= 60;
				my *= 60;
				my /= SY;
				mx = Math.floor(mx);
				my = Math.floor(my);
				this.actor.walkPixTo(mx, my);
				this.updateposDic(this.actor.guid, mx, my)
			}else{
				let{_x, _y} = this.actor;
				this.turnface()
				this.updateposDic(this.actor.guid, _x, _y)
			}
			// callLater.later(this.follow, this, 200)
		}

		findPointCanStand(dir:IVector3D, mx:number, my:number, dx:number,dy:number):number[]{
			var n:number = 1;
			var m:number = 0;
			mx /= 60;
			my /= 60;
			let key = Math.round(mx) *10000 + Math.round(my);
			let{actor} = this;
			let {keyDic, posDic} = FollowAction;
			while(posDic[key] && posDic[key] !=actor.guid){
				TEMP_MATRIX2D.m2_identity()
				let angle = 70/dir.v3_length
				TEMP_MATRIX2D.m2_rotate(angle*n);
				var tmp2:IVector3D = TEMP_MATRIX2D.m2_transformVector(dir);
				mx = (dx - tmp2.x)/60;
				my = (dy - tmp2.y)/60;
				key = Math.round(mx) *10000 + Math.round(my);
				n*=-1;
				if(n > 0){
					n += 1;
				}
				if(Math.abs(n)*angle >= Math.PI/2 || Math.abs(n) > 5){
					let curlen = dir.v3_length;
					dir.v3_normalize();
					dir.v3_scale(curlen+30);
					n = 1;
					m++;
				}
				if(m > 10){
					break;
				}
			}
			return [mx, my];
		}

		updateposDic(guid:number, x:number, y:number):void{
			let {keyDic, posDic} = FollowAction;
			let key:number = keyDic[guid];
			if(key){
				delete posDic[key]
			}
			key = Math.round((x/60)) *10000 + Math.round(y*SY/60);
			posDic[key] = guid;
			keyDic[guid] = key;
		}

		stop(activeID:number){
			time500.remove(this.follow,this);
		}

	}	
}