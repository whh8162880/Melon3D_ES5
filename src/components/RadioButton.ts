module rf{

	export interface RadioButtonGroup{
		on(type:EventT.CHANGE,listener: (e:EventX) => void, thisObject : any, priority?: number): void;
	}

    export class RadioButtonGroup extends MiniDispatcher{
        static groupDict:object = {};
        static getGroup(name:string, ...args:RadioButton[]):RadioButtonGroup
		{
			let group:RadioButtonGroup = RadioButtonGroup.groupDict[name];
			if(!group)
			{
				group = new RadioButtonGroup(name);
			}
			args.forEach(element => {
                element.group = group;
                group.addRadioButton(element);
			});
			return group;
		}

		name:String;
		list:RadioButton[];
		selectRadioButton:RadioButton;
		constructor(name:string){
			super();
			this.name = name;
			this.list = [];
			RadioButtonGroup.groupDict[name] = this;
		}
		

		tab_parent:DisplayObjectContainer;
		tab_index:number;

		setTabmodel(parent:DisplayObjectContainer,index:number,select:number = 0){

			let list = this.list;

			this.tab_index = index;
			this.tab_parent = parent;

			for (let i = 0; i < list.length; i++) {
				const data = list[i].data as DisplayObject;
				if(data) data.remove();
			}

			this.selectIndex = select;
		}

		

        
        /**
		 * 
		 * @param radioButton
		 * 
		 */		
		addRadioButton(radioButton:RadioButton){
			let{list}=this;
			if(list.indexOf(radioButton)==-1){
				// if(!this.selectRadioButton){
				// 	this.selectRadioButton = radioButton;
				// 	radioButton.selected = true;
				// }else{
				radioButton.on(EventT.SELECT, this.selectHandler, this);
				// }

				list.push(radioButton);
			}
        }
        
        /**
		 * 
		 * @param radioButton
		 * 
		 */		
		removeRadioButton(radioButton:RadioButton){
			let {list} = this;
			var i:number = list.indexOf(radioButton);
			if(i==-1){
				return;
			}
			radioButton.off(EventT.SELECT,this.selectHandler,this);
			list.splice(i,1);
		}


		
		
		
		_selectIndex:number = -1;
		set selectIndex(value:number){
			let {list, selectRadioButton} = this;
			this._selectIndex = value;
			if(value == -1){
				if(selectRadioButton){
					selectRadioButton.selected = false;
					selectRadioButton.on(EventT.SELECT, this.selectHandler,this);
					let display = selectRadioButton.data as DisplayObject;
					if(display){
						display.remove();
					}

					this.selectRadioButton = undefined;
				}
				return;
			}
			let item = list[value];
			if(item){
				item.selected = true;
			}
		}
		
		get selectIndex():number
		{
			return this._selectIndex;
		}
		
		set selectItem(val:RadioButton){
			let {list, _selectIndex} = this;
			if(_selectIndex == list.indexOf(val)){
				return;
			}
			this.selectIndex = list.indexOf(val);
		}
		
		
		
		selectHandler(event:EventX){
            let target = event.data as RadioButton;
            let{selectRadioButton,list,tab_parent,tab_index} = this;
            if(selectRadioButton == target){
				if(!target._selected){
					this.selectRadioButton = undefined;
					if(tab_parent){
						let display = target.data as DisplayObject;
						if(display){
							display.remove();
						}
					}
				}

				

				this.simpleDispatch(EventT.CHANGE);
                return;
            }

			if(target && target.selected){
				if(selectRadioButton){
					selectRadioButton.selected = false;
					selectRadioButton.on(EventT.SELECT, this.selectHandler, this);
					if(tab_parent){
						let display = selectRadioButton.data as DisplayObject;
						if(display){
							display.remove();
						}
					}
				}
				this._selectIndex = list.indexOf(target);
				this.selectRadioButton = target;

				if(tab_parent){
					let display = target.data as DisplayObject;
					if(display){
						tab_parent.addChildAt(display,tab_index);
					}
				}

				if(!target.cancancle){
					target.off(EventT.SELECT, this.selectHandler,this);
				}
				this.simpleDispatch(EventT.CHANGE,target);
			}
		}
	}




	export interface RadioButton{
		on(type:EventT.SELECT | MouseEventX, listener: (e: EventX) => void, thisObject : any, priority?: number): void;
	}



    export class RadioButton extends CheckBox{
		group:RadioButtonGroup;
		cancancle:boolean;
		constructor(source?:BitmapSource)
		{
			super(source);
        }
        
        bindComponents(){
            super.bindComponents();
            let{name} = this;
            let arr = name.split("_");
            if(arr.length == 3){
                RadioButtonGroup.getGroup(arr[1],this);
            }
        }

		doSelected(){
			this.simpleDispatch(EventT.SELECT, this);
			this.clipRefresh();
			if(!this._selected){
				this.on(MouseEventX.CLICK, this.clickHandler, this);
			}else{
				if(!this.cancancle)this.off(MouseEventX.CLICK, this.clickHandler,this);
			}
		}
	}

}