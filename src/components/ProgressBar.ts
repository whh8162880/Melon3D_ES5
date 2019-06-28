module rf{
    export class ProgressBar extends Component{
        bar:Sprite;
        txt_label:TextField;
        labelFunc:Function;
        bw:number;
        bh:number;
        usetween:boolean;
        tweenTime:number = 500;

        bindComponents(){
            super.bindComponents();
            if(this.txt_label){
                this.labelFunc = this.defalutLabelFunc;
            }
            let{bar}=this;
            if(bar){
                this.bw = bar.w;
                this.bh = bar.h;
            }
        }

        loadbar(barurl:string){
            let bar = this.bar as Image;
            if(!bar){
                this.bar = bar = new Image(this.source,this.variables);
                this.addChild(bar);
                this.bw = bar.w;
                this.bh = bar.h;
            }
            bar.load(barurl);
            bar.on(EventT.COMPLETE,this.barInit,this);
        }


        barInit(e?:EventX){
            let{cur,max}=this;
            if(e){
                e.currentTarget.off(e.type,this.barInit,this);
            }
            this.setProgress(cur,max);
        }


        private _tween:ITweener;
        cur:number = 1;
        max:number = 1;
        dir:boolean = true;
        _c:number;
        setProgress(cur:number,max:number){
            if(max < cur){
                max = cur;
            }
            this.cur = cur;
            this.max = max;
            let{bar,usetween, _tween, tweenTime}=this;
            if(!bar) return;
            let g = bar.graphics;
            let gro = g.grometrys[0];
            if(!gro) return;
            if(usetween && _tween){
                tweenStop(_tween);
				_tween = undefined;
			}
            if(usetween){
                _tween = tweenTo({dc:cur}, tweenTime, bar.tm, this) as ITweener;
				_tween.complete = this.tweenEnd.bind(this);
            }else{
                this.dc = cur;
            }
        }

        private set dc(value:number){
            this._c = value;
            let {max} = this;
			if(!max)
			{
				return;
			}
			this.doProgress();
		}
		
		private get dc(){
			return this._c;
        }
        
        protected doProgress() {
            let{bar, labelFunc, txt_label, bw, bh,dir, _c, max}=this;
            if(!bar) return;
            let g = bar.graphics;
            let gro = g.grometrys[0];
            if(!gro) return;
            if(gro.rect){
                bar.setSize(_c / max * bw, bh);
            }else{
                g.drawBitmap(0,0,gro.vo,gro.matrix,gro,0xFFFFFF,1,0,_c / max,1.0,dir);
                g.end();
            }

            if(labelFunc != undefined && txt_label)
			{
				txt_label.text = labelFunc(_c,max);
			}
        }

        private tweenEnd(t:ITweener){
            this._tween = undefined;
        }

        protected defalutLabelFunc(c:number,t:number):String
		{
			return parseInt(c)+"/"+t;
		}
    }
}