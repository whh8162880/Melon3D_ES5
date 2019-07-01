module rf{

    export interface IBitmapSourceVO extends IUVFrame{
        source:BitmapSource;

        scale:number;

        name:string;
        used:number;
        time:number;

        //真实大小
        rw:number;
        rh:number;

        
    }
    export interface IFightSourceVO extends IBitmapSourceVO{
        f_ox:number;
        f_oy:number;
    }

    export function refreshUV(vo:IBitmapSourceVO, mw:number,mh:number){
        const { x, y, w, h } = vo;
        vo.ul = x / mw;
        vo.ur = (x + w)/mw;
        vo.vt = y / mh;
        vo.vb = (y + h) / mh;
    }

/*
    export class BitmapSourceVO implements IFrame{
        name:string = undefined;
        used:number = 0;
        time:number = 0;
        source:BitmapSource = undefined;
        x:number = 0;
        y:number = 0;
        ix:number = 0;
        iy:number = 0;
        w:number = 0;
        h:number = 0;
        rw:number = 0;
        rh:number = 0;
        ul:number = 0;
        ur:number = 0;
        vt:number = 0
        vb:number = 0;

        refreshUV(mw:number,mh:number){
            const { x, y, w, h } = this;
            this.ul = x / mw;
            this.ur = (x + w)/mw;
            this.vt = y / mh;
            this.vb = (y + h) / mh;
        }
    }
*/


    export class BitmapSourceArea{
        name:number = 0;
        source:BitmapSource = undefined;
        frames:{[key:string]:IBitmapSourceVO} = {};
        l:number;
        r:number;
        t:number;
        b:number;

        init(){};

        getArea(name:string,x:number,y:number,w:number,h:number):IBitmapSourceVO{
            let vo = {
                name:name,
                x:x,
                y:y,
                ix:0,
                iy:0,
                w:w,
                h:h,
                rw:w,
                rh:h,
                used:0,
                time:engineNow,
                source:this.source
            } as IBitmapSourceVO;
            this.frames[name] = vo;
            return vo;
        }

        createFrameArea(name:string,frame:IFrame):IBitmapSourceVO{
            const{x,y,w,h,ix,iy} = frame;
            let vo = this.getArea(name,ix - x,iy - y,w,h);
            if(undefined != vo){
                vo.ix = ix;
                vo.iy = iy;
            }
            return vo
        }

        getEmptyArea(name:string,sw:number,sh:number):IBitmapSourceVO{
            return undefined
        }

        getUnusedArea(name:string,sw:number,sh:number):IBitmapSourceVO{
            let frames = this.frames;
            let vo:IBitmapSourceVO;
            let now = engineNow;

            vo = frames[name];
            if(!vo){
                for(let dname in frames){
                    vo = frames[dname];
                    if(!vo) continue;
                    if(vo.time < now && 0 >= vo.used && sw <= vo.rw && sh <= vo.rh){
                        frames[vo.name] = undefined;
                        vo.name = name;
                        vo.w = sw;
                        vo.h = sh;
                        vo.time = now;
                        frames[name] = vo;
                        break;
                    }else{
                        vo = undefined;
                    }
                }
            }

            if(vo){
                this.source.clearBitmap(vo);
                return vo;
            }

            return undefined;
        }
    }

    export class MixBitmapSourceArea extends BitmapSourceArea{

        maxRect:MaxRectsBinPack;

        init(){
            this.maxRect = new MaxRectsBinPack(this.r - this.l,this.b-this.t);
        }

        getEmptyArea(name:string,sw:number,sh:number):IBitmapSourceVO{
            let rect = this.maxRect.insert(sw+0,sh+0);
            let vo;
            if(rect.w != 0){
                vo = this.getArea(name,rect.x+this.l,rect.y+this.t,sw,sh);
            }else{
                vo = this.getUnusedArea(name,sw,sh);
            }
            if(vo){
                this.frames[name] = vo;
            }
            return vo;
        }

    }




    export class BitmapSource extends MiniDispatcher{
        static DEFAULT = 0;
        static PACK = 1;
        constructor(){
            super();
        }
        name:string = undefined;
        textureData:ITextureData;
        width:number = 0;
        height:number = 0;
        originU:number = 0;
        originV:number = 0;
        areas:{[name:number]:BitmapSourceArea} = {};
        bmd:BitmapData | HTMLImageElement;
        status:LoadStates;
        texture:Texture;
        create(name:string,bmd:BitmapData,pack:boolean = false):BitmapSource{
            this.name = name;
            this.bmd = bmd;
            this.width = bmd.width;
            this.height = bmd.height;
            if(pack == false){
                this.setArea(0,0,0,this.width,this.height);
            }else{
                this.areas[0] = this.setArea(1,0,0,this.width,this.height);
            }
            bitmapSources[name] = this;
            return this;
        }


        setArea(name:number,x:number,y:number,w:number,h:number):BitmapSourceArea{
            let area = this.areas[name];
            if(undefined == area){
                if(1 == name){
                    let mix = new MixBitmapSourceArea()
                    area = mix;
                }else{
                    area = new BitmapSourceArea();
                }

                area.l = x;
                area.t = y;
                area.r = x + w;
                area.b = y + h;
            }else{
                ThrowError("area exist")
                return area;
            }
            area.source = this;
            area.name = name;
            area.init();
            this.areas[name] = area;
            return area;
        }

        setSourceVO(name:string,w:number,h:number,area:number=1):IBitmapSourceVO{
            let barea = this.areas[area];
            if(undefined == barea){
                return undefined;
            }
            let vo = barea.getEmptyArea(name,w,h);
            if(vo){
                refreshUV(vo,this.width,this.height);
            }
            return vo;
        }

        getSourceVO(name:string|number,area:number=0):IBitmapSourceVO{
            let barea = this.areas[area];
            if(undefined == barea){
                return undefined;
            }
            let vo = barea.frames[name];
            if(vo){
                vo.time = engineNow;
            }
            return vo;
        }

        drawimg(img:HTMLImageElement|HTMLCanvasElement|BitmapData,x:number,y:number,w?:number,h?:number)
        {//可能需要其他的处理
            let{name,textureData} = this;
            let bmd = this.bmd as BitmapData;

            if(img instanceof BitmapData){
                img = img.canvas;
            }

            if(w == undefined && h == undefined)
            {
                bmd.context.drawImage(img,x,y);
            }else{
                bmd.context.drawImage(img,x,y, w, h);
            }

            if(textureData){
                let texture = context3D.textureObj[textureData.key];
                if(undefined != texture){
                    texture.readly = false;
                }
            }
            
        }

        clearBitmap(vo:IBitmapSourceVO){
            let{x,y,rw,rh}=vo;
            let bmd = this.bmd as BitmapData;
            if(rw && rh){
                let context = bmd.context;
                context.globalCompositeOperation = "destination-out";
                context.fillStyle = c_white;
                context.fillRect(x,y,rw,rh);
                context.globalCompositeOperation = "source-over";
            }
        }

        clearArea(area = 1){
            let barea = this.areas[area];
            if(undefined == barea){
                return undefined;
            }
            let bmd = this.bmd as BitmapData;
            let context = bmd.context;
            context.globalCompositeOperation = "destination-out";
            context.fillStyle = c_white;
            context.fillRect(barea.l ,barea.t,barea.r-barea.l,barea.b-barea.t);
            context.globalCompositeOperation = "source-over";
        }


        uploadContext(program: Program3D, variable: string){
            let{texture} = this;
            if(!texture){
                let c = context3D;
                let{textureData,bmd,name} = this;
                if(!textureData){
                    this.textureData = textureData =  c.getTextureData(name,false);
                }

                texture = textureData.key ? context3D.textureObj[textureData.key] : undefined;
                if(!texture){
                    texture = context3D.createTexture(textureData,bmd);
                }
                this.texture = texture;
            }
            texture.uploadContext(program,variable);
        }
    }

    export class UrlBitmapSource extends BitmapSource{
        completeFuncs:Function[];

        constructor(url: string) {
            super();
            this.name = url;
            this.status = LoadStates.WAIT;
            this.completeFuncs = [];
        }

        load() {
            this.status = LoadStates.LOADING;
            loadRes(RES_PERFIX,this.name, this.loadImageComplete, this, ResType.image);
        }
        loadImageComplete(event: EventX) {
            if (event.type != EventT.COMPLETE) {
                this.status = LoadStates.FAILED;
                return;
            }
            let bmd = this.bmd = event.data; //BitmapData.fromImageElement(event.data); //event.data;
            
            this.width = bmd.width;
            this.height = bmd.height;

            let area = this.setArea(BitmapSource.DEFAULT, 0, 0, bmd.width, bmd.height);
            let vo = {x:0, y:0, w:bmd.width, h:bmd.height, ix:0, iy:0} as IBitmapSourceVO;
            refreshUV(vo, this.width, this.height);
            area.frames[0] = vo;

            this.status = LoadStates.COMPLETE;

            this.simpleDispatch(EventT.COMPLETE);

            this.completeFuncs.forEach(element => {
                element(this);
            });
            this.completeFuncs.length = 0;
        }
    }



    export let bitmapSources:{[key:string]:BitmapSource} = {};
    export let componentSource:BitmapSource;
    export let textSource:BitmapSource;


    export function createBitmapSource(name:string,w:number,h:number,origin?:boolean){

        console.log(`createBitmapSource ${name} ${w} x ${h}`);


        let bmd = new BitmapData(w,h,true);
        let source = new BitmapSource().create(name,bmd,true);
        if(origin){
            let vo = source.setSourceVO("origin",1,1);
            //"#FFFFFF"
            bmd.fillRect(vo.x,vo.y,vo.w,vo.h,"#FFFFFF");
            source.originU = vo.ul;
            source.originV = vo.vt;
        }
        return source;
    }


    export function createUrlSource(url:string,extendtion?:ExtensionDefine,complete?:Function,CLS?:{new (url:string):UrlBitmapSource}){
        url = getFullUrl(url,extendtion);
        let source = bitmapSources[url] as UrlBitmapSource;
        if(!CLS){
            CLS = UrlBitmapSource;
        }
        if(!source) {
            bitmapSources[url] = source = new CLS(url);
            source.load();
        }else if(source.status == LoadStates.WAIT){
            source.load();
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

    
}
