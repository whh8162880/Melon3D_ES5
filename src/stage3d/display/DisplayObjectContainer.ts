///<reference path="./DisplayObject.ts" />
module rf{
    export class DisplayObjectContainer extends DisplayObject{
        constructor(){
            super();
            this.childrens = [];
        }

        setChange(value: number,p:number = 0,c:boolean = false): void {
            if(true == c){
                this.status |= p;
                if(this.parent){
                    this.parent.setChange(value,p,true);
                }
            }else{
                super.setChange(value);
            }
        }

        childrens:DisplayObject[];

        get numChildren():number{
            return this.childrens.length;
        }


        addChild(child:DisplayObject){
            if(undefined == child || child == this) return;
            let childrens = this.childrens;
            let i = childrens.indexOf(child);
            if(i == -1){
                if(child.parent) child.remove();
                childrens.push(child);
                child.parent = this;
                // child.setChange(DChange.base | DChange.batch);

                this.setChange(DChange.batch | DChange.base);

                if(this.stage){
                    if(!child.stage){
                        child.stage = this.stage;
                        child.addToStage();
                    }
                }
            }else{
                childrens.splice(i,1);
                childrens.push(child);
            }
            
           
            

            //需要更新Transform
           
        }


        addChildAt(child:DisplayObject,index:number){
            if(undefined == child || child == this) return;
            if(child.parent) child.remove();

            if(index < 0 ){
				index = 0;
			}else if(index > this.childrens.length){
				index = this.childrens.length;
            }

            this.childrens.splice(index,0,child);

            child.parent = this;

            this.setChange(DChange.batch);
            
            if(this.stage){
                if(!child.stage){
                    child.stage = this.stage;
                    child.addToStage();
                }
            }
        }


        getChildIndex(child:DisplayObject):number{
			return this.childrens.indexOf(child);
        }
        
        removeChild(child:DisplayObject){
			
			if(undefined == child){
				return;
			}
			
			var i:number = this.childrens.indexOf(child);
			if(i==-1){
				return;
			}
            this.childrens.splice(i,1);
			child.stage = undefined;
            child.parent = undefined;
            this.setChange(DChange.batch);
			child.removeFromStage();
		}


        removeAllChild(){
			const{childrens} = this;
            let len = childrens.length;
            for(let i=0;i<len;i++){
                let child = childrens[i];
                child.stage = undefined;
                child.parent = undefined;
				child.removeFromStage();
            }

            if(len > 0){
                this.setChange(DChange.batch);
            }
            
			this.childrens.length = 0;
        }
        
        removeFromStage(){
            const{childrens} = this;
            let len = childrens.length;
            for(let i=0;i<len;i++){
                let child = childrens[i];
                child.stage = undefined
				child.removeFromStage();
            }
			super.removeFromStage();
		}
		
		
		addToStage(){
            const{childrens,stage} = this;
            let len = childrens.length;
            for(let i=0;i<len;i++){
                let child = childrens[i];
                child.stage = stage;
				child.addToStage();
            }
			super.addToStage();
        }
        
		/**
         * 讲真  这块更新逻辑还没有到最优化的结果 判断不会写了
         */
		// updateTransform(){

        //     let{parent} = this;

        //     let status = this.status;
        //     if(status & DChange.trasnform){
        //         //如果自己的transform发生了变化
        //         //  step1 : 更新自己的transform
        //         //  step2 : 全部子集都要更新sceneTransform;
        //         this.caclTransform();
        //         this.updateSceneTransform(parent ? parent.sceneTransform : undefined);
        //     }

        //     if(status & DChange.alpha){
        //         this.updateAlpha(parent ? parent.sceneAlpha : 1.0);
        //     }

        //     if(status & DChange.ct){
        //         let{childrens} = this;
        //         for (let i = 0; i < childrens.length; i++) {
        //             const child = childrens[i];
        //             if(child instanceof DisplayObjectContainer){
        //                 if(child.status & DChange.t_all){
        //                     child.updateTransform();
        //                 }
        //             }else{
        //                 if(child.status & DChange.trasnform){
        //                     child.updateTransform();
        //                     child.updateSceneTransform(this.sceneTransform);
        //                 }

        //                 if(child.status & DChange.alpha){
        //                     child.updateAlpha(this.sceneAlpha);
        //                 }
        //             }
        //         }
        //         this.status &= ~DChange.ct;
        //     }
        // }
        

        updateSceneTransform(updateStatus = 0,parentSceneTransform?:IMatrix3D) {
            updateStatus = super.updateSceneTransform(updateStatus,parentSceneTransform);

            let{childrens,sceneTransform} = this;

            if(updateStatus || this.status & DChange.ct){
                for (let i = 0; i < childrens.length; i++) {
                    childrens[i].updateSceneTransform(updateStatus,sceneTransform);
                }
                this.status &= ~DChange.ct;
            }
            return updateStatus;
        }

        updateHitArea(){
            let hitArea = this.hitArea;
            if(hitArea){
                hitArea.clean();
                let{childrens}=this;
                for (let i = 0; i < childrens.length; i++) {
                    let child = childrens[i];
                    const{hitArea:hit}=child
                    if(undefined == hit) continue;

                    if(child.status & DChange.ac){
                        child.updateHitArea();
                    }
                    hitArea.combine(hit,child._x,child._y);
                }
            }
            this.status &= ~DChange.ac;
        }

        
    }
}