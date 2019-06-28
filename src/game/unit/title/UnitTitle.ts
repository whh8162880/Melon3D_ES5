module rf{
    export const enum UNIT_TITLE_LEVEL{
        CLAN,
        NAME,
        BLOOD,
        EFFECT
    }

    export interface IUnitTitleVo{
        level:number;
        dis:DisplayObjectContainer;
        ox:number;
        oy:number;
        width:number;
        height:number;
        hor_dir:number;//横向布局方向 0左侧 1右侧 2 与跟随对象一起居中
        followVo:IUnitTitleVo;
    }

    export class ShadowImg extends Image{
        constructor(){
            super();
            this.aglin = Align.MIDDLE_CENTER;
        }
    }

    export class MsgPop extends Image{
        txt:TextField;
        constructor(){
            super();
            let txt = this.txt = new TextField();
            txt.init();
            txt.format.size = 12;
            txt.gap = 0;
            txt.html = true;
            txt.multiline = true;
            txt.w = 140;
            txt.setPos(15,15)

            this.addChild(txt);

            this.rect = {x:15, y:10, w: 90, h: 40}

            this.load(getFullUrl("i/popchat"), ExtensionDefine.PNG);
            
        }

        set text(str:string){
            let{txt}=this
            txt.w = 140;
            txt.text = str;
            txt.h = txt.textHeight + 5;
            this.setSize(169, txt.textHeight + 40)
        }
    }

    export class TitleUtils{
        textCon:Sprite;
        effCon:Sprite;
        haloCon:Sprite;

        parent:DisplayObjectContainer;

        private txtformat:TextFormat;
        constructor(){
            let format  = new TextFormat();
            format.size = 16;
            format.init();
            format.stroke = {size:1,color:0};
            this.txtformat = format;
        }

        bind(target:DisplayObjectContainer){
            this.parent = target;
            this.init();
        }

        init(){
            let {parent} = this;
            let con = new NoActiveSprite(componentSource);
            this.textCon = con;
            con.renderer = new SuperBatchRenderer(con);
            parent.addChild(con);

            con = new NoActiveSprite(componentSource);
            this.effCon = con;
            parent.addChild(con);
        }

        addTxt(){
            let {textCon, txtformat} = this;
            let textfiled = recyclable(TextField);
            textfiled.source = textCon.source;
            textfiled.html = true;
            textfiled.format = txtformat;

            textCon.addChild(textfiled);
            return textfiled;
        }

        addImg(){
            let {textCon} = this;
            let img = recyclable(Image);
            img.source = textCon.source;
            textCon.addChild(img);
            return img;
        }

        addEff(){
            let {effCon} = this;
            let ani = new Ani();
            effCon.addChild(ani);
            return ani;
        }

        addHalo(){
            let {mapHalo} = singleton(SnakeMap);
            let img = recyclable(ShadowImg);
            img.source = mapHalo.source;
            mapHalo.addChild(img);
            return img;
        }

        addPop(){
            let {textCon} = this;
            let pop = recyclable(MsgPop);
            pop.source = textCon.source;

            textCon.addChild(pop);
            return pop;
        }
    }

    /**
     * 模型title部件
     * 支持添加、删除 文本 特效 图片等显示原件
     * 
     * 需要定义一个层级
     * 所有的内容根据分类放在对应的容器上进行单独渲染
     * 需要有一个统一处理的管理器
     */
    export class UnitTitle{
        titlevos:IUnitTitleVo[];//使用数组是因为好确认排序
        util:TitleUtils;
        x:number;
        y:number;
        private _visible:boolean = true;

        constructor(){
            this.titlevos = [];
            this.util = singleton(TitleUtils);
        }

        set visible(val:boolean){
            this._visible = val;
            this.doShow();
        }
        
        get visible(){
            return this._visible;
        }

        setPos(x:number, y:number){
            x = Math.round(x);
            y = Math.round(y);
            this.x = x;
            this.y = y;
            this.layout();
        }

        msgpop:MsgPop;
        popMsg(val:string){
            let pop = this.util.addPop() as MsgPop;
            pop.text = val;
            this.msgpop = pop;
        }

        /**
         * 设置文本内容 可以设置跟随文本
         * @param val 
         * @param level 设置跟随时这个是需要跟随的层级
         * @param color 
         * @param isfollow 是否是跟随文本
         * @param hd 横向布局方式 0左 1右 2 与跟随对象一起居中
         */
        setText(val:string, level:number, color:number = 0xffffff, isfollow:boolean = false, hd:number = 0){
            let vo = this.getTitleVo(level, isfollow);
            let textfiled = vo.dis as TextField;
            if(!textfiled){
                textfiled = vo.dis = this.util.addTxt();
            }
            textfiled.color = color;
            textfiled.text = val;
            vo.ox = -textfiled.textWidth >> 1;
            vo.oy = -textfiled.textHeight >> 1;
            vo.hor_dir = hd;
            vo.width = textfiled.textWidth;
            vo.height = textfiled.textHeight;

            textfiled.visible = this._visible;

            callLater.add(this.layout, this);
        }

        /**
         * 添加特效
         * @param url 
         * @param level 
         * @param offsetx x偏移
         * @param offsety y偏移 内容是从下往上排布 默认填负数
         */
        setEff(url:string, level:number, offsetx:number = 0,offsety:number = 0, isfollow:boolean = false, hd:number = 0){
            let vo = this.getTitleVo(level, isfollow);
            let ani = vo.dis as Ani;
            if(!ani){
                ani = vo.dis = this.util.addEff();
            }
            ani.load(url);
            vo.ox = offsetx;
            vo.oy = offsety;
            vo.width = Math.abs(offsetx * 2);
            vo.height = Math.abs(offsety * 2);
            vo.hor_dir = hd;
            ani.visible = this._visible;

            callLater.add(this.layout, this);
        }

        /**
         * 设置图片
         * @param url 
         * @param level 
         */
        setIcon(url:string, level:number, isfollow:boolean = false, hd:number = 0){
            let vo = this.getTitleVo(level, isfollow);
            let img = vo.dis as Image;
            if(!img){
                img = vo.dis = this.util.addImg();
            }
            vo.hor_dir = hd;
            img.visible = this._visible;
            img.load(url);
            img.on(EventT.COMPLETE, this.imgHandler, this);
        }

        /**
         * 直接添加显示对象
         * @param dis 
         * @param level 
         */
        addDisplay(dis:DisplayObjectContainer, level:number){
            let vo = this.getTitleVo(level);
            vo.dis = dis;
            vo.ox = -dis.w >> 1;
            vo.oy = -dis.h >> 1;
            vo.width = dis.w;
            vo.height = dis.h;
            dis.visible = this._visible;

            callLater.add(this.layout, this);
        }

        /**
         * 删除对应层级内容 
         * */
        removeLevel(level:number){
            let {titlevos} = this; 
            let vo = titlevos[level];
            if(!vo) return;
            vo.dis.remove();
            vo.dis.onRecycle();
            vo.dis = undefined;
            titlevos[level] = undefined;
        }

        /**
         * 更改某一层文本颜色
         * @param level 
         * @param color 
         */
        changeColor(level:number, color:number){
            let vo = this.getTitleVo(level);
            if(!vo) return;
            let textfiled = vo.dis;
            if(textfiled instanceof TextField){
                (textfiled as TextField).color = color;
            }else{
                console.log("title changeColor只支持文本");
            }
        }
        
        layout(){
            //有visible 暂时不支持单个隐藏 忽略不计算
            let {titlevos, x, y} = this;
            let dy = y;
            for (let i = 0; i < titlevos.length; i++) {
                let vo = titlevos[i];
                if(!vo) continue;
                let {height, dis, ox, oy, width, followVo} = vo;
                dy -= ~~height + ~~oy;
                dis.y = dy;
                if(!followVo || ~~followVo.hor_dir != 2){
                    dis.x = x + ~~ox;
                }else if(followVo){
                    let fdis = followVo.dis;
                    if(followVo.hor_dir == 2){
                        fdis.x = x + ~~ox + ~~followVo.ox;
                        dis.x = fdis.x + ~~followVo.width;
                    }else{
                        fdis.x = ~~followVo.hor_dir ? (dis.x + ~~width) : (dis.x - ~~followVo.width);
                    }
                    fdis.y = dis.y - ~~oy + ~~followVo.oy;
                }
            }
        }

        imgHandler(e:EventX){
            let img = e.data as Image;
            let {titlevos} = this;
            for (let i = 0; i < titlevos.length; i++) {
                let vo = titlevos[i];
                if(!vo) continue;
                if(vo.dis == img){
                    vo.ox = -vo.dis.w >> 1;
                    vo.oy = -vo.dis.h >> 1;
                    vo.width = vo.dis.w;
                    vo.height = vo.dis.h;
                    break;
                }
                if(vo.followVo && vo.followVo.dis == img){
                    vo.followVo.ox = -img.w >> 1;
                    vo.followVo.oy = -img.h >> 1;
                    vo.followVo.width = img.w;
                    vo.followVo.height = img.h;
                    break;
                }
            }
            callLater.add(this.layout, this);
        }

        getTitleVo(level:number, isfollow:boolean = false){
            let {titlevos} = this;
            let vo = titlevos[level];
            if(isfollow && !vo){
                ThrowError("没有跟随父对象vo，设置出错");
                return undefined;
            }
            if(!vo){
                this.titlevos[level] = vo = {level} as IUnitTitleVo;
            }
            if(isfollow){
                let childvo = vo.followVo;
                if(!childvo){
                    vo.followVo = childvo = {level} as IUnitTitleVo;
                }
                return childvo;
            }
            return vo;
        }

        private doShow() {
            let {titlevos, _visible} = this;
            for (let i = 0; i < titlevos.length; i++) {
                let vo = titlevos[i];
                vo.dis.visible = _visible;
                if(vo.followVo){
                    vo.followVo.dis.visible = _visible;
                }
            }
        }


        /**
         * 销毁
         * 清除所有信息
         */
        dispose(){
            let {titlevos} = this;
            for (let i = 0; i < titlevos.length; i++) {
                let vo = titlevos[i];
                vo.dis.remove();
                vo.dis.onRecycle();
                vo.dis = undefined;
                if(vo.followVo){
                    vo.followVo.dis.remove();
                    vo.followVo.dis.onRecycle();
                    vo.followVo.dis = undefined;
                    vo.followVo = undefined;
                }
                vo = undefined;
            }
            this.titlevos.length = 0;
            this._visible = true;
        }
    }
}