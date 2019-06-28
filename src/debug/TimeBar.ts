module rf{
    export class GrapButton extends Button{
        constructor(){
            super();
            this.bindComponents();
        }
        bindComponents(){
            this.txt_label = new TextField();
            let format  = new TextFormat();
            format.size = 12;
            format.init();
            format.stroke = undefined;
            this.txt_label.format = format;
            this.txt_label.color = 0x333333;
            this.txt_label.gap = -1;
            this.addChild(this.txt_label);
            this.mouseChildren = false;
            this.txt_label.setPos(2,2);
        }

        textResize(){
            let{graphics,txt_label,mousedown} = this;

            txt_label.color = mousedown ? 0xFFFFFF : 0xAAAAAA;
            let{text} = txt_label;
            txt_label.$text = undefined;
            txt_label.text = text;

            let{w,h} = txt_label;
            graphics.clear();
            if(mousedown){
                graphics.drawRect(0,h+4,w+3,1,0xFFFFFF);
            }else{
                graphics.drawRect(0,h+4,w+3,1,0xAAAAAA);
            }
            graphics.end();

            this.setSize(w+3,h+4);
        }
    }

    export class TimeDragItem extends Sprite{
        txt_label:TextField;
        constructor(){
            super();

            this.bindComponents();
        }

        bindComponents(){
            let text = new TextField();
            text.mouseEnabled = false;
            text.y = 2;
            let format  = new TextFormat();
            format.size = 12;
            format.init();
            format.stroke = undefined;
            text.format = format;
            text.color = 0xFFFFFF;
            text.gap = -1;
            this.txt_label = text;
            this.addChild(text);
        }

        setData(width:number, height:number, color:number = 0xff0000){
            let g = this.graphics;
            g.clear();
            g.drawRect(-width>>1, 0, width, height, color);
            g.drawRect(0, 0, 1, height + 20, color);
            g.end();
        }

        updateVal(val:number){
            let {txt_label} = this;
            txt_label.text = val + "";
            txt_label.x = -txt_label.textWidth >> 1;
        }
    }
    export class TimeBar extends Sprite implements IResizeable, ITickable{
        btn_time:TimeDragItem;
        params:{duration:number, pixSec:number, btnEx:number, time:number};
        txts:TextField[];
        btn_play:GrapButton;
        offsetx:number;
        constructor(){
            super();
            this.txts = [];
            this.offsetx = 80;
            this.bindComponents();
        }

        bindComponents(){
            let format  = new TextFormat();
            format.size = 12;
            format.init();
            format.stroke = undefined;
            

            let btn = new GrapButton();
            this.addChild(btn);
            this.btn_play = btn;
            btn.label = "播放";

            btn.y = 10;

            let con = new TimeDragItem();
            con.setData(50, 16);
            con.x = this.offsetx;
            this.btn_time = con;
            this.addChild(con);
            con.on(MouseEventX.MouseDown, this.downHandler, this);

            this.on(MouseEventX.CLICK, this.dirtHandler, this);
            btn.addClick(this.playHandler, this);
        }

        targetTm:ITimeMixer;
        setTm(ttm:ITimeMixer){
            this.targetTm = ttm;
        }
        
        setData(duration:number, pixSec:number){
            let {offsetx, graphics:g} = this;
            this.reset();
            let time = Math.ceil(duration/1000);
            this.params = {duration, pixSec, time, btnEx:time*pixSec + offsetx};
            this.draw();

            g.clear();
            g.drawRect(-30, 0, time*pixSec + 60 + offsetx, 40, 0, 0.9);
            g.end();

            this.updateHitArea();

            Engine.addResize(this);
        }

        draw(){
            let {offsetx, params} = this;
            let {pixSec, time} = params;
            for (let i = 0; i <= time; i++) {
                let txt = this.createtxt(i);
                this.addChild(txt);
                txt.text = i + "s";
                txt.setPos(i * pixSec - (txt.textWidth * 0.5) + offsetx, 16);
            }
        }

        update(now:number, interval:number){
            let {params, offsetx, btn_time} = this;
            let tx = btn_time.x + 4.8;
            if(tx > params.btnEx){
                tx = offsetx;
                Engine.removeTick(this);
            }
            this.updateBtn(tx);
        }

        playHandler(e:EventX){
            let {params, offsetx} = this;
            Engine.addTick(this);
        }

        dirtHandler(e:EventX){
            let {sceneTransform, params, offsetx} = this;
            let tx = nativeMouseX - sceneTransform[12];
            tx = tx < offsetx ? offsetx : tx;
            tx = tx > params.btnEx ? params.btnEx : tx;
            this.updateBtn(tx);
        }

        downHandler(e:EventX){
            e.stopImmediatePropagation = true;
            this.preMouseX = nativeMouseX;
            ROOT.on(MouseEventX.MouseMove, this.moveHandler, this);
            ROOT.on(MouseEventX.MouseUp, this.upHandler, this);
        }

        preMouseX:number;
        moveHandler(e:EventX){
            let {btn_time, params} = this;
            let {preMouseX, offsetx} = this;
            let tx = nativeMouseX - preMouseX;
            let tmpx = btn_time.x + tx;
            tmpx = tmpx < offsetx ? offsetx : tmpx;
            tmpx = tmpx > params.btnEx ? params.btnEx : tmpx;
            this.updateBtn(tmpx);
        }

        upHandler(e:EventX){
            ROOT.off(MouseEventX.MouseMove, this.moveHandler, this);
            ROOT.off(MouseEventX.MouseUp, this.upHandler, this);
        }

        updateBtn(tx:number){
            let {btn_time, params, offsetx, targetTm} = this;
            let tmptime = parseInt((tx - offsetx) / params.pixSec * 1000);
            btn_time.x = tx;
            btn_time.updateVal(tmptime);
            tm_set(targetTm,tmptime);
            targetTm.target.update(0, 0);
            // tm_set(this.tm,event.data);
            // this.update(0,0);
            this.preMouseX = nativeMouseX;
            this.simpleDispatch(EventT.CHANGE, tmptime);
        }

        createtxt(i:number){
            let {txts} = this;
            let text = txts[i];
            if(text) return text;
            text = this.txts[i] = new TextField();
            text.mouseEnabled = false;
            let format  = new TextFormat();
            format.size = 16;
            format.init();
            format.stroke = undefined;
            text.format = format;
            text.color = 0xFFFFFF;
            text.gap = -1;
            return text;
        }

        reset(){
            let {txts, btn_time, offsetx} = this;
            for (let i = 0; i < txts.length; i++) {
                const element = txts[i];
                element.remove();
            }
            btn_time.x = offsetx;
            btn_time.updateVal(0);
        }

        resize(width:number, height:number){
            this.x = width - this.w >> 1;
            this.y = height - this.h;
        }
    }
}