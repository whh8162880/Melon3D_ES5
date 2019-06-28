module rf{

    /**
     * activeId 请求打断的StateDefine  -1是(系统)主动打断
     */
    export type STATE_TRY_STOP = (activeId:number) => number;

    /**
     * activeId 请求打断的StateDefine  -1是(系统)主动打断
     */
    export type STATE_STOP = (activeId:number) => void;

    export interface IStateRuntimeVO{
        id:StateDefine;
        thisobj:any;
        trystop:STATE_TRY_STOP;
        stop:STATE_STOP;
        active:boolean;
    }

    export class StateModel{

        running:{[key:number]:IStateRuntimeVO}

        constructor(){
            this.running = {}
        }

        runningList(){
            let arr = []
            let{running} = this;
            for(let key in running){
                let vo = running[key]
                if(vo && vo.active){
                    arr.push(vo)
                }
            }
            return arr;
        }

        isRunning(id:StateDefine){
            let vo = this.running[id]
            return (vo && vo.active) ? true : false;
        }

        check(id:StateDefine){
            let{running}=this
            for(let key in running){
                let vo = running[key]
                if(vo && vo.active){
                    let b = stateRelation[vo.id][id];
                    if(b == Ralation.FOBIDDEN){
                        return false;
                    }
                }
            }
            return true;
        }

        startState(id:StateDefine, thisobj?:any, stop?:STATE_STOP, trystop?:STATE_TRY_STOP){
            let{running}=this;
            //先结束要打断的action
            for(let key in running){
                let vo = running[key]
                if(vo){
                    let b = stateRelation[vo.id][id]
                    if(b == Ralation.BREAK){
                        this.stopState(vo.id,id);
                    }
                }
            }
            //在开始要做的的action
            let vo = running[id];
            if(!vo){
                vo = {id} as IStateRuntimeVO;
            }
            vo.thisobj = thisobj;
            vo.stop = stop;
            vo.trystop = trystop;
            vo.active = true;
            
            
            running[id] = vo;
            return vo;
        }
        
        /**
         * 
         * @param id 
         * @param callstop 自己主动stop
         */
        stopState(id:StateDefine,activeId:StateDefine){
            let{running} = this
            let vo = running[id]
            if(vo && vo.active){
                vo.active = false;
                let{stop, thisobj} = vo;
                    if(stop){
                        stop.call(thisobj,activeId);
                    }
            }
        }

        stop(activeId:StateDefine){
            let{running} = this;
            for(let key in running){
                let vo = running[key]
                if(vo){
                    this.stopState(vo.id,activeId)
                }
            }
        }


    }





}