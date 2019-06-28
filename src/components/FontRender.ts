module rf{
    // export const enum IMAGE_FONT{
    //     ZDLNUM = "zdlnum"
    // }

    export interface IPANEL_IMAGE_FONT{
        uri:string;
        prefix?:{[key:string]:number};
    }

    /**
     * 加载ani 可以根据自定义的内容取对应的vo 进行填充
     */
    export class FontRender extends Component{
        font:IPANEL_IMAGE_FONT;
        asource:Anim2dSource;
        valarr:number[];
        gap:number = 0;
        rd:number = 0;
        
        constructor(font:IPANEL_IMAGE_FONT, source?:BitmapSource){
            super(source);
            this.font = font;
        }

        updateVal(arr:number[]){
            if(this.valarr == arr)return;
            this.valarr = arr;
            let {uri} = this.font;
            this.asource = anim_getSource(uri, ExtensionDefine.ANI);
            if(this.asource.status != LoadStates.COMPLETE){
                this.asource.on(EventT.COMPLETE, this.draw, this);
                return;
            }
            this.draw();
        }

        private draw(e?:EventX){
            if(e){
                e.currentTarget.off(EventT.COMPLETE, this.draw, this);
            }
            //根据内容取出所有的vo
            let {source, asource, valarr, font, gap,rd} = this;
            let {name} = asource;
            let vo = source.getSourceVO(asource.name, 1);
            if(!vo){
                copyAniSource(asource, source);
            }
            //默认将ani加入到对象source中
            let arr:IFightSourceVO[] = img_getAnimvos(name, valarr, source, font);
            fontRender(this.graphics,arr,Align.TOP_LEFT, gap, rd);

            this.updateHitArea();

            this.simpleDispatch(EventT.COMPLETE);
        }
    }

    export function img_getAnimvos(key:string, arr:number[],source:BitmapSource, font?:IPANEL_IMAGE_FONT){
        let vos:IFightSourceVO[] = [];
        let {length:len} = arr;
        let va:number;
        let vo:IFightSourceVO;
        for (let i = 0; i < len; i++) {
            const ele = arr[i];
            vo = source.getSourceVO(key + ele, 1) as IFightSourceVO;
            if(vo){
                vos.push(vo);
                vo.f_ox = 0;
                vo.f_oy = 0;
            }
        }
        return vos;
    }

    export function copyAniSource(from:Anim2dSource, to:BitmapSource){
        let {name, width, height, bmd, config} = from;
        let vo = to.getSourceVO(from.name, 1);
        if(!vo){
            vo = to.setSourceVO(name, width, height, 1);
            to.drawimg(bmd as HTMLImageElement, vo.x, vo.y, vo.w, vo.h);
            let {frames} = to.areas[1];
            //把所有的imgfont的frames加入
            let f;
            for(let ele in config.fs){
                f = config.fs[ele];
                let tmpvo = {x:f.x + vo.x, y:f.y + vo.y, w:f.w, h:f.h, ix:f.ix, iy:f.iy, used:0} as IBitmapSourceVO;
                refreshUV(tmpvo, to.width, to.height);
                frames[name+ele] = tmpvo;
            }
            to.areas[1].frames = frames;
        }
    }
}