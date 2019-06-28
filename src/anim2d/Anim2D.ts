///<reference path="../stage3d/display/Sprite.ts" />
module rf {

    export interface IAnimFrame extends IBitmapSourceVO{
        duration:number;
    }

    export interface AnimData{
        p: string //perfix
        n: string; //名字
        r: number //角度
        sx: number //scaleX
        sy: number //scaleY
        l: number //loop 第几帧开始循环播放 -1播放一遍
        m: number //最大帧
        w: number //最大的图片宽度
        h: number //最大的图片高度
        t: number;
        fs: { [key: string]: IAnimFrame }//IBitmapSourceVO[] //帧列表
        matrix2d: IMatrix;
        source:Anim2dSource;
    }


    export interface PakData {
        v: number
        on:number;
        oh:number;
        hit:Size;
        sf:{[key:string]:number[]};
        actions:AnimData[][];
    }


    export const enum Anim2DEventX{
        FRAME = 100,
        ATTACK,
        COMPLETE
    }

    export class Anim2dSource extends BitmapSource implements ILoaderTask {
        config: AnimData;

        cachefs:{ [key: string]: IBitmapSourceVO };

        completeFuncs:Function[];

        constructor(url: string) {
            super();
            this.name = url;
            this.status = LoadStates.WAIT;
            this.completeFuncs = [];
        }

        load() {
            this.status = LoadStates.LOADING;
            loadRes(RES_PERFIX,this.name, this.loadConfigComplete, this, ResType.amf);
        }

        loadConfigComplete(event: EventX) {
            if (event.type != EventT.COMPLETE) {
                this.status = LoadStates.FAILED;
                return;
            }
            let { name } = this;
            let { data, url } = event.currentTarget as Loader
            if (url != name) return;
            let i = name.lastIndexOf("/") + 1;
            data.p = name.slice(0, i);
            data.n = name.slice(i,name.lastIndexOf("."));
            this.loadByConfig(data);
            
        }

        loadByConfig(data:AnimData){
            this.config = data;
            let { matrix2d } = data;
            if (matrix2d instanceof ArrayBuffer) {
                data.matrix2d = new Float32Array(matrix2d);
            }
            let perfix = data.p + data.n + ExtensionDefine.PNG;
            this.status = LoadStates.LOADING;
            //配置加载完成 加载图片
            loadRes(RES_PERFIX,perfix, this.loadImageComplete, this, ResType.image);
        }

        loadImageComplete(event: EventX) {
            if (event.type != EventT.COMPLETE) {
                this.status = LoadStates.FAILED;
                return;
            }

            let bmd = this.bmd = event.data;//BitmapData.fromImageElement(event.data);
            // event.data;
            // BitmapData.fromImageElement(event.data);
            this.width = bmd.width;
            this.height = bmd.height;

            let area = this.setArea(BitmapSource.DEFAULT, 0, 0, bmd.width, bmd.height);

            area.frames = this.config.fs;

            this.status = LoadStates.COMPLETE;

            this.simpleDispatch(EventT.COMPLETE);


            let completeFuncs = this.completeFuncs;

            for (let i = 0; i < completeFuncs.length; i++) {
                const element = completeFuncs[i];
                element(this);
                
            }
            completeFuncs.length = 0;
        }
    }

    /**
     * ani动画 
     * ps：有图片和配置两部分组成，根据配置给定的帧信息按照时间间隔播放
     * 为了更好的查找ani 目前使用的目录是以名称作为文件夹包了一层
     */
    export class Ani extends Sprite {
        constructor(source?:BitmapSource) {
            super(source);
            this.tm = defaultTimeMixer;
            this.renderer = new SingleRenderer(this);
            this.source = undefined;
            this.extention = ExtensionDefine.ANI;
        }

        extention:ExtensionDefine

        url: string;
        config: AnimData

        cur: number = 0;
        max: number = 0;

        nt: number;
        t:number;

        once:number;
        st:number;

        bindAnis:Link;

        parentAni:Ani;

        lock:number = -1;

        removeTime:number;

        // attack:IFunction;
        // complete:IFunction;

        load(url: string | AnimData){
            this.removeTime = -1;
            this.nt = this.tm.now;
            let source = anim_getSource(url,this.extention);
            this.url = source.name;
            if(source.status == LoadStates.COMPLETE){
                this.play(source);
            }else if(source.status == LoadStates.LOADING){
                source.on(EventT.COMPLETE, this.onSouceComplete, this);
            }
            return source;
        }


        onSouceComplete(e: EventX){
            if (e.type != EventT.COMPLETE) {
                return;
            }
            //加载全部完成进行初始化
            let source = e.currentTarget as Anim2dSource;

            if(source.name == this.url){
                source.off(e.type, this.onSouceComplete,this);
                this.play(source);
                this.simpleDispatch(EventT.COMPLETE);
            }
        }


        play(source:Anim2dSource) {
            let config = source.config as AnimData;
            this.source = source;
            this.config = config;
            this.t = ~~this.t == 0 ? config.t : this.t;
            this.max = config.m;
            this.nt = this.tm.now;
            this.cur = this.lock != -1 ? this.lock : 0;

            this.st == ~~this.st ? this.tm.now : this.st;
            
            this.renderFrame(this.cur);
        }


        render(camera:Camera,option:IRenderOption) {
            let { source ,parentAni,_visible, config, lock} = this;
            
            if (!source) return;
            if(source.status != LoadStates.COMPLETE)return;
            if(!config)return;
            if(!_visible){
                return;
            }
            super.render(camera,option);

            if(lock != -1)return;
            // return;

            if(parentAni) return;

            let{tm,nt,t,once,removeTime}=this;

            if(removeTime > 0 && tm.now > removeTime){
                this.onComplete();
                return;
            }

            let dt = tm.now - nt;

            if (dt > 0) {
                let { max, cur, config } = this;
                if (cur >= max - 1) {
                    cur = config.l;
                    if(once == 1){
                        this.once = 0;
                        this.onceComplete(true);
                        return;
                    }
                    if (cur == -1 || once == -1) {
                        this.onComplete();
                        return;
                    }
                } else {
                    cur++;
                }
                this.cur = cur;

                
                if(dt > 200){
                    nt = Math.floor(dt / t) * t + nt;
                }

                let d = this.renderFrame(cur);
                if(d > 0){
                    // this.nt = Math.floor(dt / t) * t + nt + d * t
                    this.nt = nt + d * t;
                }else{
                    this.nt = nt + 100;
                }

            }

            
        }


        renderFrame(frame:number){
            let{source,config,bindAnis} = this;
            if(!source) return 0;
            let vo = source.getSourceVO(frame, 0) as IAnimFrame;
            if (!vo) return 0;

            let g = this.graphics;
            g.clear();
            g.drawBitmap(0, 0, vo, config.matrix2d);
            g.end();


            if(bindAnis){
                for(let linkvo = bindAnis.first;linkvo;linkvo =linkvo.next){
                    if(false == linkvo.close){
                        let ani = linkvo.data as Ani;
                        ani.renderFrame(frame);
                    }
                }
            }
            

            return vo.duration;
        }

        lockFrame(frame:number){
            this.lock = frame;
            this.renderFrame(frame);

        }


        addBindAni(ani:Ani){
            let{bindAnis} = this;
            if(!bindAnis){
                this.bindAnis = bindAnis = new Link();
            }
            bindAnis.add(ani,this);
            ani.parentAni = this;
            this.addChild(ani);
        }
        removeBindAni(ani:Ani){
            let{parentAni} = ani;
            let{bindAnis} = this;
            if(bindAnis && parentAni == this){
                ani.parentAni = undefined;
                bindAnis.remove(ani,this);
                ani.remove();
            }
        }






        onceComplete(finish:boolean){
            // let{complete,attack}=this;
            // if(attack){
            //     this.attack = undefined;
            //     callFunction(attack);
            // }
            // if(complete){
            //     this.complete = undefined;
            //     callFunction(complete);
            // }
            this.simpleDispatch(Anim2DEventX.COMPLETE,finish);
        }

        onComplete(t?:any){
            this.remove();
            let{pool}=this;
            if(pool){
                pool.recycle(this);
            }
        }
    }

    export class Pak extends Ani{

        static INFO_COMPLETE = "INFO_COMPLETE"

        constructor()
        {
            super();
            this.extention = ExtensionDefine.PAK
        }

        info:PakData;
        action:number;
        faceto:number;

        load(url: string){
            url = getFullUrl(url,this.extention);
            this.name = url;
            loadRes(RES_PERFIX,url,this.pakLoadComplete,this,ResType.amf);
            return undefined;
        }

        pakLoadComplete(event:EventX){
            if(event.type == EventT.COMPLETE){
                let item = event.currentTarget as Loader;
                if(item.url == this.name){
                    let info:PakData;
                    this.info = info = event.data as PakData;
                    this.simpleDispatch(Pak.INFO_COMPLETE,info);
                }
            }
        }

        anim(anim:any,faceto:number,tm:ITimeMixer,once:number=0,duration?:number, refresh:boolean = true){
            this.action = anim;
            this.faceto = faceto;
            this.once = once;
            this.tm = tm;
            this.st = tm.now;
            this.t = ~~duration;
            let{info,name}=this;
            if(!info){
                return;
            }

            let action = info.actions[anim];
            if(!action){
                return;
            }

            let conf = action[faceto];

            if(!conf){
                return;
            }

            let source = conf.source;

            if(!source){
                let i = name.lastIndexOf("/") + 1;
                conf.p = name.slice(0, i);
                conf.n = anim + "_" + faceto;
                conf.source = super.load(conf);
            }else{
                this.play(source);
            }
        }




        onComplete(){
            let{pool} = this;
            if(pool){
                pool.recycle(this);
            }
        }
    }

    export function anim_getSource(data:string | AnimData,extendtion?:ExtensionDefine,complete?:Function){

        let url:string;
        var config:AnimData;

        if(typeof data === "string"){
            url = getFullUrl(data,extendtion);
        }else{
            config = data as AnimData;
            let{p,n}=config;
            url = p + n + ExtensionDefine.PAK;
        }
        
        let source = bitmapSources[url] as Anim2dSource;
        if(!source) {
            bitmapSources[url] = source = new Anim2dSource(url);
            if(config){
                source.loadByConfig(config);
            }else{
                source.load();
            }
        }else if(source.status == LoadStates.WAIT){
            if(config){
                source.loadByConfig(config);
            }else{
                source.load();
            }
        }else if(complete && source.status == LoadStates.COMPLETE){
            complete(source);
            return source;
        }

        if(complete){
            let completes = source.completeFuncs;
            if(completes.indexOf(complete) == -1){
                completes.push(complete);
            }
        }

        return source;
    }


    export function getAglinPoint(aglin:Align,w:number,h:number){
        let ox:number,oy:number;
        let t1 = (aglin / 3) >> 0;
        switch(t1){
            case 0:
                oy = 0;
                break;
            case 1:
                oy = (-h * 0.5);
                break;
            case 2:
                oy = -h;
                break;
        }

        t1 = aglin % 3;
        switch(t1){
            case 0:
                ox = 0;
                break;
            case 1:
                ox = -w  * 0.5 ;
                break;
            case 2:
                ox = -w;
                break;
        }

        return [ox,oy];
    }





    export function fontRender(g:Graphics,vos:IFightSourceVO[],aglin:Align,gap:number = 0, rd:number = 0){
        let w = 0;
        let h = 0;

        vos.forEach(element => {
            w += element.w + gap;
            if(element.h > h){
                h = element.h;
            }
        });

        let p = getAglinPoint(aglin,w,h);

        g.clear();
        w = 0;

        let n = vos.length;

        for(var i = 0;i<n;i++){
            let vo = vos[i];
            let ox = w +p[0] + ~~vo.f_ox;
            g.drawBitmap(ox,p[1] + ~~vo.f_oy - rd * ox,vo);
            w += vo.w + gap;
        }
        g.end();
    }
}