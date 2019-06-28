///<reference path="./actions/ActorAction.ts" />
///<reference path="./title/UnitTitle.ts" />
module rf{
    export class Unit3D extends MapObject{
        guid:number|string
        nameLabelY:number = 180;
        title:UnitTitle;
        vo:IUnitVO;

        constructor(){
            super();
            this.setSceneModel(SCENE_MODEL.MAP2D);
        }

        body:KFMMesh;
        setBody(url:string){
            let{body,container,tm} = this;
            if(!body){
                this.body = body = new KFMMesh();
                body.tm = tm;
            }
            body.load(url);
            container.addChild(body);
            body.on(EventT.COMPLETE, this.initialize, this);

            this.initTitle();
        }

        initVO(vo?:IUnitVO){
            if(!vo){
                vo = {} as IUnitVO;
                vo.hp = 100;
                vo.guid = this.guid;
            }
            this.vo = vo;
        }

        initTitle(){
            this.title = new UnitTitle();
        }


        weapon:KFMMesh;
        setWeapon(url:string){
            let{weapon,body,tm} = this;
            if(!weapon){
                this.weapon = weapon = new KFMMesh();
                weapon.tm = tm;
                weapon.rotationX = -90;
                weapon.defaultAnim = "";
            }
            weapon.load(url);
            // kfmContainer.addChild(weapon);
            // body.bindMesh("Bip002_Prop1",weapon);
            body.bindMesh("Bone_wuqi",weapon);
        }

        initialize(e:EventX){
            let {body, title, x, y} = this;
            body.off(EventT.COMPLETE, this.initialize, this);
            this.hitArea = body.hitArea;
            this.nameLabelY = body.nameLabelY * OBJECT2D_SCALE;

            title.setPos(x, y - this.nameLabelY);
        }
    }






    export class ActionActor extends Unit3D{

        state:StateModel;
        movespeed:number = 350/1000;//像素/毫秒
        gx:number;
        gy:number;

        actions:{[key:number]:ActorAction}

        guid:number;

        _alive:boolean;

        constructor(){
            super();
            this.guid = Math.floor(Math.random() * 1000000);
            this.state = new StateModel()
            this.actions = {}
            this.title = new UnitTitle();
            this._alive = true;
        }

        setText(val:string,color = 0xFFFFFF){
            let {title} = this;
            title.setText(val, UNIT_TITLE_LEVEL.NAME,color);
        }

        halo:Image;
        crateHalo(){
            let {title, halo} = this;
            if(!halo){
                this.halo = halo = title.util.addHalo();
            }
            halo.load(RES_PERFIX + "i/shadow.png");
            halo.setPos(this.x, this.y);
        }

        talk(val:string){
            let {title} = this;
            title.popMsg(val);
            // MsgPop
        }

        playAnim(id:string, refresh?:boolean){
            let{body}=this;
            if(!body){
                return
            }
            body.playAnim(id, refresh)
        }

        attack(id:string, complete?:Function, thisobj?:any, loop?: false){
            let action = this.getAction(StateDefine.ATTACK, AttackAction)
            action.start(this, [id, thisobj, complete, loop]);
        }

        defaultAnim:string = "stand.kf"

        playDefaultAnim(){
            this.playAnim(this.defaultAnim, false)
        }

        faceto(x:number, y:number, tween?:boolean){
            let{_x, _y,sceneModel} = this;
            let sy = sceneModel == SCENE_MODEL.MAP2D ? rf.SY : 1;
            let angle = Math.atan2((y-_y)*sy ,x - _x);
            let degree = angle * RADIANS_TO_DEGREES;
            
            this.rotation = ~~degree;
        }

        updateXY(x:number, y:number){
            let map = singleton(SnakeMap);
            x = Math.min(map.data.w - 200, Math.max(400, x)) 
            y = Math.min(map.data.h - 200, Math.max(300, y)) 

            let {_z, title, halo,sceneTransform, nameLabelY} = this;
            this.setPos(x, y, _z)
            this.gx = Math.floor(x/60);
            this.gy = Math.floor(y/30);
            this.updateSceneTransform();
            x = sceneTransform[12];
            y = sceneTransform[13]
            if(title){
                title.setPos(x, y - nameLabelY) ;
            } 
            if(halo) halo.setPos(x, y);
        }

        getAction<T>(id:StateDefine, c:{new():T}):T{
            let action = this.actions[id];
            if(!action){
                action = this.actions[id] = new c() as any as ActorAction;
            }
            return action as any as T;
        }

        walkPixTo(x:number, y:number,autoAnim:boolean = true,endtime:number = -1){

            //todo 
            //1. calu astar ==> findPath()

            //2. send server data 

            //3. move data
            
            let action = this.getAction(StateDefine.MOVE, MoveAction)

            action.tx = x;
            action.ty = y;
            action.endtime = endtime;
            action.autoAnim = autoAnim;

            action.start(this);
        }

        cancleMove(){
            this.state.stopState(StateDefine.MOVE, StateDefine.MOVE);
            this.state.stopState(StateDefine.NAVIGATION, StateDefine.NAVIGATION);
            if(this.state.isRunning(StateDefine.ATTACK) == false ){
                this.playDefaultAnim();
            }
        }

        castSkill(id:string,tx:number,ty:number){
            if(!this.state.check(StateDefine.CAST)){
                return;
            }
            this.faceto(tx,ty);
            let data = skill[id];
            if(!data){
                return;
            }
            this.state.startState(StateDefine.CAST)
            let tween = scriptTween_play(this, data.elements,rf.defaultTimeMixer, tx, ty);
            tween.on(EventT.COMPLETE, this.endCast, this);
        }

        endCast(e:EventX){
            e.currentTarget.off(e.type, this.endCast, this);
            this.state.stopState(StateDefine.CAST,StateDefine.CAST)
            this.simpleDispatch(EventT.CAST_COMPLETE)
            // console.log("end cast")
        }

        jump(tmid:string, tx:number, ty:number, dislen?:number, duration?:number){
            if(!this.state.check(StateDefine.JUMP)){
                return;
            }
            this.faceto(tx,ty);
            let data = skill[tmid];
            
            
            if(!data){
                return;
            }
            let newdata = {id:data.id, elements:[] };
            let values = newdata.elements;
            let ovalues = data.elements;
            let procopy = rf.pro_copy;
            for (let i = 0; i < ovalues.length; i++) {
                const element = ovalues[i];
                let o = {};
                procopy(o, element);
                values.push(o)
            }
            data = newdata;
            let{_x, _y} = this;
            if(isNaN(dislen)){
                dislen = Math.sqrt( (_x - tx)*(_x - tx)  + (_y - ty)*(_y - ty) );
            }
            for (let i = 0; i < values.length; i++) {
                const element = values[i];
                if(element.type == "damage"){
                    let t = duration;
                    let a = 0;
                    if(isNaN(t)){
                        a = HitForceAction.AccelerationOfFriction;
                        t = Math.sqrt(2*dislen/a);
                        element.addxy = 0;
                        element.forcetime = 0;
                    }else{
                        a = -2*dislen/(t*t);
                        element.forcetime = t;
                        element.addxy = a - HitForceAction.AccelerationOfFriction;
                        element.addxy /= HitForceAction.TransformAcc;
                    }
                    let v0 = -a * t;
                    element.speedxy = v0/HitForceAction.TransformSpeed;
                    break;
                }
            }
            this.state.startState(StateDefine.JUMP)
            let tween = scriptTween_play(this, data.elements,rf.defaultTimeMixer, tx, ty);
            tween.on(EventT.COMPLETE, this.endJump, this);
        }
        endJump(e:EventX){
            e.currentTarget.off(e.type, this.endJump, this);
            this.state.stopState(StateDefine.JUMP,StateDefine.JUMP)
            this.simpleDispatch(EventT.MOVE_COMPLETE)
            // console.log("end cast")
        }

        hit(dx:number, dy:number,speedxy:number = 0, speedz:number = 0, addxy?:number, forcetime?:number){
            let action = this.getAction(StateDefine.HIT, HitForceAction);
            action.reset(this, dx, dy, speedxy, speedz, addxy, forcetime);
            action.start(this)
        }

        findPath(x:number, y:number, pix:boolean = true){
        
            if(!pix){
                x = x*60 + 30;
                y = y*30 + 15;
            }
            let action = this.getAction(StateDefine.NAVIGATION, NavigationLocalAction)

            action.tx = x;
            action.ty = y;
            action.start(this)

        }

        dead(){
            if( !this.state.check(StateDefine.DEAD) ){
                return;
            }
            this.state.startState(StateDefine.DEAD)
            this.attack("die.kf", this.remove, this)
        }

        remove(){
            let{skAnim} = this.body;
            if(skAnim){
                skAnim.lockFrame = skAnim.totalFrame;
            }
            this._alive = false;
            if(this._z > 0){
                callLater.later(this.remove, this, 1000)
                return;
            }
            callLater.remove(this.remove, this)
            super.remove()
            
        }

    }







    export interface IUnitVO{
        guid:string|number;

        hp:number;

    }
}