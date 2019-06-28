///<reference path="./ThreeInterface.ts" />
module rf{
    export var skill_Perfix = "skill/";


    export var skill_event_define:{[key:string]:{new ():EventFilter}} = {}

    export function skill_setup(){

        let define = skill_event_define;

        define[SkillEventConst.POS] = PosFilter;
        define[SkillEventConst.SCALE] = ScaleFilter;
        define[SkillEventConst.ROT] = RotFilter;
        define[SkillEventConst.COLOR_TRANFORM] =  ColorTransformFilter;
        define[SkillEventConst.UV] = UVAnimFilter;
        define[SkillEventConst.TEXTURE_CHANNEL] = TexChannelFilter;
    }


    export interface ISkillTarget{
        sk_st?:number;
    }


    export class Skill extends MapObject implements ITickable{
        data:ISkillData;
        lines:SkillLine[];
        follow:SceneObject;
        sk_st = 0;
        load(url: string) {
            if (url.lastIndexOf(ExtensionDefine.SKILL) == -1) {
                url += ExtensionDefine.SKILL;
            }
            if (url.indexOf("://") == -1) {
                url = skill_Perfix + url;
            }
            loadRes(RES_PERFIX, url, this.loadCompelte, this, ResType.amf);
        }

        loadCompelte(e: EventX) {

            if(e.type == EventT.COMPLETE){
                this.play(e.data);
            }else{
                this.remove();
            }



            
        }

        play(data:ISkillData){

            if(!this.tm){
                this.tm = newTimeMixer(this);
            }

            this.data = data;
            this.lines = [];
            for (let i = 0; i < data.lines.length; i++) {
                const element = data.lines[i];
                let line = new SkillLine();
                line.play(element,this);
                this.lines.push(line);
            }

            this.reset();
        }


        reset(){
            let{lines,tm} = this;
            if(lines){
                for (let i = 0; i < lines.length; i++) {
                    lines[i].reset();
                }
                if(tm.target == this){
                    skillTick.addTick(this);
                    this.update(0,0);
                }
            }
        }

        update(now: number, interval: number){
            let{lines,tm,follow} = this;
            if(!lines){
                return;
            }

            if(follow){
                let{_x,_y,_z} = follow;
                this.setPos(_x,_y,_z);
            }

            


            if(tm.target == this){
                tm_add(tm,interval);
                let close = true;
                for (let i = 0; i < lines.length; i++) {
                    let line = lines[i];
                    if(line.closed == false){
                        line.update(now,interval)
                        close = false;
                    }
                }
                if(close){
                    skillTick.removeTick(this);
                    this.remove();
                }
            }else{
                for (let i = 0; i < lines.length; i++) {
                    lines[i].update(now ,interval)
                }
            }
        }
    }


    export class SkillLine extends MiniDispatcher implements ITickable{
        skill:Skill;
        data:ISkillLineData;
        closed:boolean;
        runtimes:SceneObject[];
        tm:ITimeMixer;
        loop = 0;
        play(data:ISkillLineData,skill:Skill){
            let{runtimes,tm} = this;
            this.tm = tm = newTimeMixer(this,-skill.sk_st,skill.tm);
            let{creates,events}=data;
            this.skill = skill;
            this.data = data;
            this.loop = data.loop;
            if(!runtimes){
                this.runtimes = runtimes = [];
            }
            for (let i = 0; i < creates.length; i++) {

                let mesh:SceneObject;
                const element = creates[i];
                if(element.type == SkillEventConst.EFFECT_CREATE){
                    mesh = new SkillMesh();
                    (mesh as SkillMesh).load(element.url);
                }else if(element.type == SkillEventConst.PARTICLE_CREATE){
                    mesh = new SkillParticle();
                    (mesh as SkillParticle).load(element.url);
                }else if(element.type == SkillEventConst.SKILL_CREATE){
                    mesh = new SkillSkill();
                    (mesh as Skill).setSceneModel(SCENE_MODEL.CONTIANER);
                    mesh.setPos(element.x,element.y,element.z);
                    mesh.setRot(element.rx,element.ry,element.rz);
                    (mesh as Skill).load(element.url);
                }

                mesh.tm = tm;
                mesh.visible = false;
                (mesh as ISkillTarget).sk_st = element.time;

                runtimes.push(mesh);
                skill.container.addChild(mesh);

                this.addEvents(mesh,events);
            }
        }

        addEvents(target:SceneObject,events:ISkillEvent[]){
            let filters = target.filters;
            for(let key in events){
                const element = events[key];
                if(!element) continue;
                const type = element.type;
                let filter = filters[type] as EventFilter;
                if(filter){
                    filter.reset();
                }else{
                    let CLS = skill_event_define[type];
                    if(CLS){
                        filters[type] = filter = new CLS();
                    }
                }
                if(filter){
                    filter.target = target;
                    filter.setEvent(element);
                }
                
            }
        }

        update(now: number, interval: number){
            let{data,tm,runtimes,loop} = this;
            let{events,duration}=data;
            // tm_add(tm,interval);
            now = tm.now;

            if(now >= duration){
                if(data.loop > 0 && loop <= 1){
                    this.closed = true;
                    for (let i = 0; i < runtimes.length; i++) {
                        const target = runtimes[i];
                        target.visible = false;
                    }
                    return true;
                }else{
                    if(data.loop > 0){
                        this.loop--;
                    }
                    tm.now = now = now % duration; 
                    this.reset(now);
                }
            }

            for (let i = 0; i < runtimes.length; i++) {
                const target = runtimes[i];

                if(now > (target as ISkillTarget).sk_st){
                    if(!target._visible){
                        target.visible = true;
                    }

                    // let d = now - (target as ISkillTarget).sk_st;

                    target.update(now,interval);

                    let filters = target.filters;
                    for (let j in events ){
                        let filter = filters[j] as EventFilter;
                        if(filter /*&& filter.needUpdate*/){
                            filter.update(now,interval);
                        }
                    }

                }else{
                    if(target._visible){
                        target.visible = false;
                    }
                }

                
            }
            return false;
        }

        reset(now = 0){
            let{data,runtimes,tm,skill} = this;
            let{events}=data;

            tm.now = now - skill.sk_st ;
            this.closed = false;

            for (let i = 0; i < runtimes.length; i++) {
                const target = runtimes[i];
                let filters = target.filters;
                for (let j in events ){
                    let filter = filters[j] as EventFilter;
                    if(filter){
                        filter.reset();
                    }
                }
            }
        }


        onRecycle(){
            let{data,runtimes,tm,skill} = this;
            for (let i = 0; i < runtimes.length; i++) {
                runtimes[i]
            }
        }

        
    }

    export class SkillMesh extends KFMMesh{
    }

    export class SkillParticle extends Particle{

    }

    export class SkillSkill extends Skill{

    }

    export class TestSkill extends Skill{
        play(data:ISkillData){

            if(!this.tm){
                this.tm = newTimeMixer(this);
            }
            
            this.data = data;
            this.lines = [];
            for (let i = 0; i < data.lines.length; i++) {
                // if(i > 13) continue;
                const element = data.lines[i];
                // if(element.desc != "拖尾"){
                    // continue;
                // }
                let line = new SkillLine();
                line.play(element,this);
                this.lines.push(line);
            }
            this.reset();
            skillTick.removeTick(this);


            let bar = singleton(TimeBar);
            bar.setTm(this.tm);
            bar.setData(data.duration,200);
            // bar.on(EventT.CHANGE,this.timeBarChangeHandler,this);
            let tm = this.tm;
            tm.speed = 0;

            ROOT.addChild(bar);
        }

        // timeBarChangeHandler(event:EventX){
        //     tm_set(this.tm,event.data);
        //     this.update(0,0);
        // }


        update(now: number, interval: number){
            let{lines,tm} = this;
            if(!lines){
                return;
            }
            let close = true;

            for (let i = 0; i < lines.length; i++) {
                let line = lines[i];
                line.update(now,interval)
            }

            // this.rotationY = tm.now ;
            
        }
    }

}