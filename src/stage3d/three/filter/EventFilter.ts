module rf{
    export class EventFilter extends FilterBase implements ITickable{

        target:Sprite;

        skillEvent:ISkillEvent;
        currentEvent:ISkillEvent;
        needUpdate:boolean;

        pro:any;

        starttime = 0;

        setEvent(event:ISkillEvent,tick = false){
            this.skillEvent = event;
            this.reset();
            this.updatepro(this.pro);

            if(tick){
                this.starttime = engineNow;
                Engine.addTick(this);
            }
        }


        getCurrentEvent(now:number,skillEvent?:ISkillEvent){
            if(!skillEvent){
                skillEvent = this.skillEvent;
            }
            if(!skillEvent){
                return undefined;
            }

            if(now > skillEvent.time){
                while(skillEvent.next){
                    if(skillEvent.next.time < now){
                        skillEvent = skillEvent.next;
                    }else{
                        break;
                    }
                }
            }else{
                while(skillEvent.pre){
                    skillEvent = skillEvent.pre;
                    if(skillEvent.time <= now){
                        break;
                    }
                }
            }

            
            this.currentEvent = skillEvent;
            return skillEvent;
        }


        reset(){
            let{skillEvent,pro} = this;
            this.currentEvent = skillEvent;
            this.needUpdate = true;
            for(let key in pro){
                let v = skillEvent[key];
                if(v != undefined){
                    pro[key] = v;
                }
            }
        }

        update(now: number, interval: number){
            let{currentEvent,pro,starttime}=this;
            now -= starttime;
            currentEvent = this.getCurrentEvent(now,currentEvent);
            let{next} = currentEvent;
            if(next){
                tween_lerp_pro(currentEvent,currentEvent.next, (now - currentEvent.time) / (next.time - currentEvent.time),pro);
            }else{
                this.needUpdate = false;
                for(let key in pro){
                    let v = currentEvent[key];
                    if(v != undefined){
                        pro[key] = v;
                    }
                }
                this.end();
            }
            this.updatepro(pro);
        }

        updatepro(pro){};

        end(){
            Engine.removeTick(this);
        };
    }



}