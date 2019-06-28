/// <reference path="./Component.ts" />
module rf{
    export interface IListOption {
        offsetX:number;
        offsetY:number;
        itemWidth?: number;     //item 宽度
        itemHeight?: number;
        hgap?:number;
        vgap?:number;
        vertical?:boolean;
        columnCount?: number;
        clazz?:{new ():Component};
    }

    export interface IListRuntime{
        selectedIndex:number;
        first:ListItem & Recyclable<Component>;
        last:ListItem & Recyclable<Component>;
        displayCount:number;
        start:number;
        end:number;
    }

    export interface ListItem extends LinkItem{
        data?:{};
        index?:number;
    }

    export class List extends Component{
        datas:{}[];
        option : IListOption;
        runtime : IListRuntime;
        caches:(ListItem & Recyclable<Component>)[];
        scroll:Scroll;
        constructor(source:BitmapSource,Clazz:{new ():Component},itemWidth:number,itemHeight:number,hgap:number = 0,vgap:number = 0,vertical:boolean = true,columnCount:number = 1,offsetX:number = 0,offsetY:number = 0){
            super(source);
            this.option = {
                itemWidth:itemWidth + hgap,
                itemHeight:itemHeight + vgap,
                vertical:vertical,
                columnCount:columnCount,
                clazz:Clazz,
                hgap:hgap,
                vgap:vgap,
                offsetX:offsetX,
                offsetY:offsetY
            } as IListOption;

            this.runtime = {
                selectedIndex:-1,
                displayCount:-1,
            } as IListRuntime;

            this.caches = [];
        }

        // getObjectByPoint(dx: number, dy: number,scale:number){
        //     let {scrollRect} = this;
        //     dx -= scrollRect.x;
        //     dy -= scrollRect.y;
        //     return super.getObjectByPoint(dx,dy,scale);
        // }

        setSize(width:number, height:number){
            super.setSize(width, height);
            this.simpleDispatch(EventT.RESIZE);
        }

        displayList(data?:{}[]) {
            this.datas = data;

            let{option,runtime,scroll}=this;

            // if(scroll){
            //     scroll.resetOrigin();
            // }

            runtime.start = -1;
            runtime.end = -1;
            runtime.selectedIndex = -1;
            this.clear();

            this.refreshList();

            let{columnCount,itemWidth,itemHeight,vertical,hgap,vgap,offsetX,offsetY}=option;
            let len = data.length;
            let maxlen:number = Math.ceil(len / columnCount);
            if(vertical){
                this.h = maxlen * itemHeight - vgap;//Math.ceil((len * itemHeight) / columnCount) - vgap;
                this.w = columnCount * itemWidth - hgap;
            }else{
                this.w = maxlen * itemWidth - hgap;//Math.ceil((len * itemWidth) / columnCount) - hgap;
                this.h = columnCount * itemHeight - vgap;
            }

            this.w += offsetX;
            this.y += offsetY;
            
            this.simpleDispatch(EventT.RESIZE);

            if(scroll){
                scroll.resetOrigin();
                scroll.on(EventT.SCROLL, this.s_c, this);
            }
        }

        scrollXY(x?:number, y?:number){
            let{scroll}=this;
            if(scroll){
                scroll.scrollxy(x, y);
                scroll.on(EventT.SCROLL, this.s_c, this);
            }
        }

        s_c(e:EventX){
            callLater.later(this.d_c, this, 200);
        }

        d_c(e:EventX){
            this.simpleDispatch(EventT.CHANGE, this);
        }

        clear(){
            let{runtime,caches}=this;
            let len = caches.length;
            for(let i =0; i < len; i++){
                let item = caches[i];
                item.selected = false;
                item.remove();
                item.__next = item.__pre = undefined;
                item.recycle();
                item.off(MouseEventX.MouseUp,this.itemClickHandler,this);
            }

            caches.length = 0;
            runtime.first = runtime.last = undefined;
        }


        refreshList(event?:EventX){
            let{datas,runtime}=this;
            let{displayCount,first,last}=runtime;
            let start:number,end:number,datalen:number;
            datalen = datas.length;
            if(displayCount == -1){
                start = 0;
                end = datalen;
            }else{
                let{option,scrollRect} = this;
                let{vertical,itemWidth,itemHeight} = option;
                if(vertical){
                    start = Math.clamp(Math.floor(-scrollRect.y / itemHeight) ,0,Math.max(0,datalen - displayCount));
                }else{
                    // let{x}=scrollRect;
                    start = Math.clamp(Math.floor(-scrollRect.x / itemWidth) ,0,Math.max(0,datalen - displayCount));
                }
                end = Math.min(start + displayCount,datalen);
            }


            if(runtime.start == start && runtime.end == end){
                return;
            }


            runtime.start = start;
            runtime.end = end;



            if(first && (first.index > end || last.index < start)){
                this.clear();
            }else{
                while(first){
                    if(first.index >= start) break;

                    let f = first.__next as ListItem & Recyclable<Component>;
                    this.removeItem(first);
                    first = f;
                }
                runtime.first = first;

                while(last){
                    if(last.index < end) break;

                    let l = last.__pre as ListItem & Recyclable<Component>;
                    this.removeItem(last);
                    last = l;
                }
                runtime.last = last; 
            }

            if(first){
                for(let i = first.index - 1; i >= start;i--){
                    let ins = this.addItem(i,datas[i]);
                    first.__pre = ins;
                    ins.__next = first;
                    first = ins;
                }

                for(let i = last.index + 1;i < end;i++){
                    let ins = this.addItem(i,datas[i]);
                    last.__next = ins;
                    ins.__pre = last;
                    last = ins;
                }
            }else{
                for(let i = start;i < end;i++){
                    let ins = this.addItem(i,datas[i]);
                    if(!last){
                        runtime.first = runtime.last = first = last = ins;
                    }else{
                        last.__next = ins;
                        ins.__pre = last;
                        runtime.last = last = ins;
                    }
                }
            }

            runtime.first = first;
            runtime.last = last;
        }


        addItem(index:number,data:{}){
            let{caches,option}=this;
            let ins = caches[index];
            if(ins){
                this.addChild(ins);
                return ins;
            }


            let{clazz,itemWidth,itemHeight,columnCount,hgap,vgap,vertical,offsetX,offsetY}=option;
            ins = recyclable(clazz,false,{source:this.source}) as ListItem & Recyclable<Component>;
            ins.index = index;
            // ins.source = this.source;
            if(vertical){
                ins.setPos((index % columnCount) * itemWidth + offsetX,Math.floor(index / columnCount) * itemHeight + offsetY);
            }else{
                ins.setPos(Math.floor(index / columnCount) * itemWidth + offsetX,(index % columnCount) * itemHeight + offsetY);
            }
            ins.on(MouseEventX.MouseUp,this.itemClickHandler,this);
            ins.data = data;
            this.addChild(ins);

            caches[index] = ins;

            return ins;
        }


        removeItem(item:ListItem & Recyclable<Component>){
            item.remove();
            item.__next = item.__pre = item.data = undefined;
        }

        _selectIndex:number = -1;
		set selectIndex(value:number){
            let{selectedIndex:index} = this.runtime;
            let item;
            //取一下看之前有没有选中有就重置
            if(index != -1){
                if(index == value){return;}
                item = this.caches[index];
                if(item){
                    item.selected = false;
                }
            }
            this.runtime.selectedIndex = value;
            this._selectIndex = value;
			item = this.caches[value];
			if(item){
                item.selected = true;
                this.simpleDispatch(EventT.SELECT, item);
			}
		}
		
		get selectIndex()
		{
			return this._selectIndex;
        }
        
        set selectItem(val:ListItem & Recyclable<Component>){
            let {caches} = this;
            if(caches.indexOf(val) != -1){
                this.selectIndex = caches.indexOf(val);
            }
        }

        get selectItem(){
            let {caches, _selectIndex} = this;
            return caches[_selectIndex];
        }

        
        itemClickHandler(event:EventX){
            // this.removeItem(event.currentTarget as ListItem & Recyclable<Component>);
            let item = event.currentTarget as ListItem & Recyclable<Component>;
            // item.remove();
            if(item.mouseEnabled){
                this.selectItem = item;
            }

            // this.simpleDispatch(EventT.SELECT, item);
        }

        remove(){
            let item = this.selectItem;
            if(item)item.selected = false;
            super.remove();
        }

        get backward(){
            let{scroll}=this;
            if(!scroll) return false;
            return scroll.backward;
        }

        get forward(){
            let{scroll}=this;
            if(!scroll) return false;
            return scroll.forward;
        }

    }

    export class DynmList extends List{
      
        displayList(data?:{}[]) {
            super.displayList(data);

            let{runtime}=this;

            let last = runtime.last;
            if(last){
                this.h = last.y + last.h;
                this.w = last.x + last.w;
            }else{
                this.w = this.h = 0;
            }
            this.simpleDispatch(EventT.RESIZE);
        }

        addItem(index:number,data:{}){
            let ins = super.addItem(index, data);
            let{last} = this.runtime;

            if(!last){
                ins.setPos(0,0,0);
            }else{
                let{clazz,itemWidth,itemHeight,columnCount,hgap,vgap,vertical} = this.option;
                if(vertical){
                    ins.setPos(last.x, last.y + last.h + vgap, 0);
                }else{
                    ins.setPos(last.x + last.w + hgap, last.y, 0);
                }
            }
            return ins;
        }


    }

    export class TestListItemRender extends Component{
        t:TextField;
        constructor(source?:BitmapSource){
            super(source);
            let g = this.graphics;
            g.clear();
            g.drawRect(0,0,100,20,Math.floor(Math.random()*0xFFFFFF));
            g.end();
            this.t = new TextField()
            this.addChild(this.t);
        }

        doData(){
            this.t.text = (this as ListItem).index+"";
        }


    }



}