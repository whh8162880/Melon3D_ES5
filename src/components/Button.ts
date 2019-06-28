///<reference path="./Component.ts" />
module rf{
    export class Button extends Label{
		// mouseDown:boolean = false;

		bindComponents()
		{
			this.mouseChildren = false;
			this.doEnabled();
			this.buttonModel(this.w >> 1, this.h >> 1, 0);
		}

		getObjectByPoint(dx: number, dy: number,scale:number){
			return super.getObjectByPoint(dx,dy,1/this._scaleX);
		}

		doEnabled()
		{
			this.mouseEnabled = this._enabled;
		}

		// protected mouseDownHandler(event:EventX){
		// 	ROOT.on(MouseEventX.MouseUp, this.mouseUpHandler, this);

		// 	debug_click_button = this;

		// 	// this.mouseDown = true;
		// 	// this.clipRefresh();
		// 	let{_tweener,tm,w,h}=this;
		// 	if(!this.renderer)
		// 	{
		// 		this.renderer = new BatchRenderer(this);
		// 		this.setChange(DChange.batch);
		// 	}

			
        //     if(_tweener){
        //         tweenStop(_tweener);
        //     }
		// 	this._tweener = tweenTo({scale:0.9}, 200, tm , this,ease_quartic_out);
		// }

		// protected mouseUpHandler(event:EventX){
		// 	// this.mouseDown = false;
		// 	ROOT.off(MouseEventX.MouseUp, this.mouseUpHandler,this);
		// 	// this.clipRefresh();
		// 	let{_tweener,tm}=this;
        //     if(_tweener){
        //         tweenStop(_tweener);
        //     }
		// 	this._tweener = _tweener = tweenTo({scale:1}, 200, tm, this,ease_back_out);
		// 	_tweener.complete = this.scaleTweenComplete.bind(this);
		// }

		// scaleTweenComplete(t:ITweener){
		// 	if(this.renderer)
		// 	{
		// 		this.renderer = undefined;
		// 		this.setChange(DChange.batch);
		// 	}
		// }

		protected clipRefresh(){
			// const{mouseDown} = this;
			this.gotoAndStop(0);//mouseDown ? 1 : 0
		}

		addClick(listener:Function,thisObj:any){
			this.on(MouseEventX.CLICK,listener,thisObj);
			return this;
		}

		
		icon:Image;

		setface(url:string){

			let icon = this.icon;

			if(!icon){
				this.icon = icon = new Image(this.source);
				this.addChild(icon);
			}
			icon.on(EventT.COMPLETE,this.faceHandler,this);
			icon.load(url);
		}

		private faceHandler(event: EventX) {
			event.currentTarget.off(event.type,this.faceHandler,this);
			this.updateHitArea();
			this.bindComponents();
			this.locksize = true;
			this.simpleDispatch(EventT.COMPLETE)
        }
		
		anifont:FontRender;
		// ani_c:boolean;
		ox:number;
		oy:number;
		setAniNum(font:IPANEL_IMAGE_FONT, nums:number[], center:boolean = true, ox?:number, oy?:number){
			if(!this.anifont){
				let ani = new FontRender(font, this.source);
				this.addChild(ani);
				ani.on(EventT.COMPLETE, this.u_l, this);
				// this.ani_c = center;
				if(!center){
					ani.setPos(ox, oy);
				}
				this.anifont = ani;
				this.ox = ox;
				this.oy = oy;
			}
			this.anifont.updateVal(nums);
		}

		protected u_l(e:EventX){
			let {anifont, w, h, ox, oy} = this;
			anifont.setPos(ox ? ox : (w - anifont.w >> 1), oy ? oy : (h - anifont.h >> 1));
		}
	}
	

	export interface CheckBox{
		on(type:EventT.SELECT | MouseEventX, listener: (e: EventX) => void, thisObject : any, priority?: number): void;
	}
    

    export class CheckBox extends Button{

		doEnabled()
		{
			super.doEnabled();
			let {_enabled} = this;
			if(_enabled){
				this.on(MouseEventX.CLICK, this.clickHandler, this);
			}else{
				this.off(MouseEventX.CLICK, this.clickHandler,this);
			}
		}

		protected clickHandler(event:EventX){
			this.selected = !this._selected
		}

		doSelected(){
			this.simpleDispatch(EventT.SELECT,this._selected);
			this.clipRefresh();
		}

		protected clipRefresh(){
			const{_selected} = this;
			this.gotoAndStop(_selected ? 1 : 0 );
		}
	}
}