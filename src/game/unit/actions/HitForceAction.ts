module rf{

    export class ForceVector extends Float32Array{
        constructor(){
            super(4)
        }
    }
    export class HitForceAction extends ActorAction{
        constructor()
		{
			super();
            this.stateID = StateDefine.HIT;

            this.pos0 = newVector3D();
            this.pos1 = newVector3D();
            this.pos2 = newVector3D();
            this.speed0 = newVector3D();
            this.speed1 = newVector3D();
            this.accelerate0 = newVector3D();
            this.accelerate1 = newVector3D();

        }
        
        //计算单位， 像素/秒


        //初始坐标
        pos0:IVector3D;
        //初速度
        speed0:IVector3D;
        //持续的加速度，用w表示duration;
        accelerate0:IVector3D;
        starttime:number;

        //如果有持续加速度，t1表示其结束时间,也是第二阶段开始时间
        t1:number;
        pos1:IVector3D;
        speed1:IVector3D;
        accelerate1:IVector3D;
        //水平速度为0的时间
        t2:number;
        //水平速度为0时坐标
        pos2:IVector3D;
        //endtime
        t3:number;

        stopXY:boolean;
        
        static TransformAcc:number = 0.001 * 0.001;
        static TransformSpeed:number = 0.001;


        static g:number = -40 * 100 * HitForceAction.TransformAcc; //10米/秒² ~~ 1000像素/秒² ~~像素/毫秒²
        static AccelerationOfFriction:number = - 20 * 100 * HitForceAction.TransformAcc;//摩擦力提供的加速度
        // static frictionCoefficient:number = 0.8; //摩擦系数
        // static damping:number = 0.85; //阻尼系数
        // static damping2:number = 0.98; //阻尼系数
        
        static MaxSpeed:number = 1000;// m/s ， 1米 = 100 像素
        static t_pos:IVector3D = newVector3D()
        //当前速度
        static t_speed:IVector3D = newVector3D();
        
        reset(actor:ActionActor, dx:number, dy:number,speedxy:number = 0, speedz:number = 0, addxy:number = 0, duration?:number, starttime?:number)
        {   
            let sy = actor.sceneModel == SCENE_MODEL.MAP2D ? rf.SY : 1;

            speedxy = speedxy * HitForceAction.TransformSpeed;
            speedz = speedz * HitForceAction.TransformSpeed;
            addxy = addxy * HitForceAction.TransformAcc;

            if(speedxy < 0){
                speedxy *= -1;
                dx *= -1;
                dy *= -1;
            }

            if(isNaN(starttime)){
                starttime = engineNow;
            }
            this.starttime = starttime;

            let{speed0, speed1, pos0, pos1, pos2, accelerate0, accelerate1} = this;
            let angle = Math.atan2(dy*sy, dx);
            let sin = Math.sin(angle)
            let cos = Math.cos(angle)
            let{g, AccelerationOfFriction:a} = HitForceAction;
            let tmp:number;
            //第一阶段

            //初速度
            speed0.x = cos * speedxy;
            speed0.y = sin * speedxy;
            speed0.z = speedz;
            //坐标
            pos0.x = actor._x;
            pos0.y = actor._y * sy;
            pos0.z = actor._z;
            //加速度
            accelerate0.v4_scale(0);
            
            tmp = a + addxy;
            accelerate0.x = tmp * cos;
            accelerate0.y = tmp * sin;
            accelerate0.z = g; //为啥不提供addz，因为又要多分阶段，难算。
            if(tmp < 0){//如果是减速
                let t = -speedxy/tmp;
                accelerate0.w = Math.min(~~duration, t);
            }else{
                accelerate0.w = ~~duration;
            }
            this.t1 = starttime + accelerate0.w;
            /////////////////
            //第二阶段
            if(this.accelerate0.w == 0){
                pos1.set(pos0)
                speed1.set(speed0);
                accelerate1.set(accelerate0)
            }else{
                let sqrt_t = accelerate0.w * accelerate0.w;
                pos1.x = pos0.x + speed0.x * accelerate0.w + 0.5 * accelerate0.x * sqrt_t;
                pos1.y = pos0.y + speed0.y * accelerate0.w + 0.5 * accelerate0.y * sqrt_t;
                // pos1.z = pos0.z + speed0.z * accelerate0.w + 0.5 * accelerate0.z * sqrt_t;
                if(pos1.z < 0){
                    pos1.z = 0;
                }
                speed1.x = speed0.x + accelerate0.x * accelerate0.w;
                speed1.y = speed0.y + accelerate0.y * accelerate0.w;
                // speed1.z = speed0.z + accelerate0.z * accelerate0.w;

                accelerate1.x = a * cos;
                accelerate1.y = a * sin;
                // accelerate1.z = g;
            }
            let spxy = speed1.v2_length;
            let t = -spxy/a;
            accelerate1.w = t;
            let sqrt_t = t*t;
            this.t2 = this.t1 + t;
            //水平结束
            pos2.x = pos1.x + speed1.x * t + 0.5 * accelerate1.x * sqrt_t;
            pos2.y = pos1.y + speed1.y * t + 0.5 * accelerate1.y * sqrt_t;
           
            //落地阶段
            let vt = -Math.sqrt(-2*g*pos0.z + speedz*speedz);
            t = (vt - speedz)/g;
            this.t3 = Math.max(this.starttime + t, this.t2);
            
            this.stopXY = false;
        }

        doStart(actor:ActionActor, params?:any){
            gameTick.addTick(this);
        }

        update(now: number, interval: number){
            let{actor, speed0, speed1, pos0, pos1, pos2, accelerate0, accelerate1, t1, t2, t3, starttime} = this;
            let {g, t_pos, t_speed} = HitForceAction;
            let t:number;
            
            let sy = actor.sceneModel == SCENE_MODEL.MAP2D ? rf.SY : 1;

            if(now >= t3){
                actor.updateXY(pos2.x, pos2.y / sy);
                actor.z = 0;
                let camera = (ROOT.camera2D as Arpg2DCamera)
                if(camera && actor == camera.watchTarget){
                    actor.updateSceneTransform();
                    camera.update(0,0);
                }
                this.end();
            }else{
                let t_h = now - starttime;
                let z = pos0.z + speed0.z * t_h + 0.5 * g * t_h * t_h;
                if(z < 0){
                    z = 0;
                }
                actor.z = z;

                if( now < t2 && !this.stopXY){
                    let p0:IVector3D;
                    let sp0:IVector3D;
                    let acc:IVector3D;
                    if(now >= t1){
                        p0 = pos1;
                        sp0 = speed1;
                        acc = accelerate1;
                        t = now - t1;
                    }else{
                        p0 = pos0;
                        sp0 = speed0;
                        acc = accelerate0;
                        t = now - this.starttime;
                    }
                    let sqrt_t = t*t;
                    
                    t_pos.x = p0.x + sp0.x * t + 0.5 * acc.x * sqrt_t;
                    t_pos.y = p0.y + sp0.y * t + 0.5 * acc.y * sqrt_t;
                    let ty = t_pos.y/sy;

                    let map = singleton(SnakeMap);
                    let gx = Math.floor(t_pos.x/60);
                    let gy = Math.floor(ty/30);
                    let canwalk:number = 1;
                    if(map && map.data && map.data.setting){
                        canwalk = map.data.setting.getWalk(gx, gy);
                    }
                     
                    if(canwalk){
                        actor.updateXY(t_pos.x, ty);
                    }else{
                        this.stopXY = true;
                        pos2.x = t_pos.x;
                        pos2.y = t_pos.y;
                    }
                    let camera = (ROOT.camera2D as Arpg2DCamera)
                    if(camera && actor == camera.watchTarget){
                        actor.updateSceneTransform();
                        camera.update(0,0);
                    }
                }
            }
            
            
            
        }

        stop(activeID:StateDefine){
            gameTick.removeTick(this)
        }

        
        
    }


}