module rf{
    /**本地寻路*/ 
	export class NavigationLocalAction extends ActorAction{

		astar:AStar;
		constructor(){
			super()
			this.astar = new AStar()
			this.stateID = StateDefine.NAVIGATION;
		}
		

		tx:number;
		ty:number;

		endpixx:number;//终点（像素)
		endpixy:number;

		path:number[][]
		ctx:number;// current target pixx
		cty:number;

		// final:boolean;

		reach:boolean;

		doStart(actor:ActionActor, params?:any){
			let{astar, tx, ty} = this;
			
			this.endpixx = this.tx;
			this.endpixy = this.ty;

			let {setting} = singleton(SnakeMap).data;
			let{_x, _y} = actor;
			_x = Math.floor(_x/60);
			_y = Math.floor(_y/30);

			//temp
			actor.gx = _x;
			actor.gy = _y;

			tx = this.tx = Math.floor(tx/60)
			ty = this.ty = Math.floor(ty/30)

			this.reach = false;

			let path = this.path = astar.go(setting,_x,_y,tx,ty);
			
			path.shift();

			if(!path.length){
				this.end();
				return;
			}

			let [ex, ey] = path[path.length - 1];
			if(ex != tx || ey != ty){
				this.endpixx = ex*60 + 30;
				this.endpixy = ey*30 + 15;
			}

			actor.on(EventT.MOVE_COMPLETE, this.nextStep, this);

			this.nextStep();
		}

		nextStep(e ? :EventX){
			let{path, actor} = this;
			// let{_x, _y, gx, gy} = actor;

			if(e && e.data == false){
				this.end();
				return;
			}
			
			if(path.length){
				let [x,y] = path.shift(); 
				if(path.length){
					actor.walkPixTo(x*60 + 30, y*30 + 15,false)
				}else{
					actor.walkPixTo(this.endpixx, this.endpixy,false)
				}
				
			}else{
				this.reach = true;
				this.end()
			}

		}
		
		stop(activeID:StateDefine){
			let{actor} = this;
			actor.simpleDispatch(EventT.NAVIGATION_LOC_COMPLETE, this.reach);
			actor.defaultAnim = "stand.kf";
			if(actor.state.isRunning(StateDefine.ATTACK) == false && (this.stateID != activeID || this.reach)){
				actor.playDefaultAnim()
			}
		}




	}
}