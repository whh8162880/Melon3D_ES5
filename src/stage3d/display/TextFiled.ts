///<reference path="./Sprite.ts" />
module rf {

    export var editTF:TextField;

    // export var oldInnerHeight:number;
    export var oldWindowWidth:number;
    export var oldWindowHeight:number;

    export function showKeyboard(tf:TextField){
        if(tf == editTF) {
            return;
        }

        console.log("select");

        editTF = tf;
        tf.visible = false;
        let {sceneTransform,w,h,text, maxChars} = tf;
        // let div = document.getElementById("container2d");
        // div.style.transform = `matrix3d(${contextMatrix.m3_toString()})`
        let x = sceneTransform[12];
        let y = sceneTransform[13];
        let offset = tf.format.stroke ? tf.format.stroke.size : 0;
        x += offset;    // todo +1 是因为有1像素阴影 
        y += offset;
        // w /= pixelRatio
        

        let style:{[key:string]:{[key:string]:string}} 

        if(!weixin){
            // let container2d:{[key:string]:string} = {};
            // container2d.transform = `matrix3d(${contextMatrix.m3_toString(pixelRatio)})`;
            let txt_input:{[key:string]:string} = {};

            let format = tf.format;

            txt_input.left = x+"px";
            txt_input.top = y+"px";
            txt_input.width = w +"px";
            txt_input.visibility = "";
            txt_input.border = "none";
            txt_input.outline = "thin"; 
            txt_input.padding = "0px 0px 10px";
            txt_input["font-size"] = format.size+"px";
            txt_input.height = (format.size+5)+"px";

            // txt_input["font-family"] = "微软雅黑";
            // txt_input["font-style"] = "normal";
            // txt_input["font-weight"] = "normal";

            txt_input["text-align"] = format.align;            
            txt_input["vertical-align"] = "top";
            // txt_input["line-height"] = "10px";
            /*  width: 400px; height: 20px;
                position: absolute;
                left: 0px; top: 0px;
                border: none; 
                padding: 0px 0px 40px; 
                outline: thin; 
                background-image: none; 
                overflow: hidden; 
                word-break: break-all; 
                opacity: 1; font-family: 微软雅黑; 
                font-style: normal; 
                font-weight: normal; 
                text-align: left; 
                font-size: 20px; 
                color: rgb(255, 255, 255); 
                vertical-align: top; 
                line-height: 20px; 
                background-position: initial initial; 
                background-repeat: initial initial;
            */

            style = {txt_input};

            oldWindowWidth = windowWidth
            oldWindowHeight = windowHeight;
        }


        


        // let v = TEMP_VECTOR3D;
        // v.x = x + 1;
        // v.y = y + 1;
        // v.z = 0;
        // contextMatrix.m3_transformVector(v,v);
        // x = v.x;
        // y = v.y;

        wx.onKeyboardInput(onKeyboardInput)

        wx.onKeyboardComplete(onKeyboardComplete);

        let maxLength = maxChars ? maxChars : 9999;
        let defaultValue = text;
        let option = {defaultValue,style, maxLength} as wx.IKeyboardOption;
        wx.showKeyboard(option);

        softKeyboard = true;
    }
    

    export function onResizeKeboard(width:number,height:number){

        let{stageY}=editTF;

        let v = TEMP_VECTOR3D;

        v.x = 0;
        v.y = (stageY + editTF.format.size);
        v.z = 0;

        contextMatrix2D.m3_transformVector(v,v);
        v.y /= pixelRatio;

        if(v.y > height){
            let y = (height - oldWindowHeight - (v.y - oldWindowHeight)) * pixelRatio;
            setContextMatrix(oldWindowWidth,oldWindowHeight,0,y);
        }

        // if(stageY)

    }


    export function onKeyboardInput(option:{value:string}){
        if(editTF){
            editTF.text = option.value;
        }
    }


    export function onKeyboardComplete(option:{value:string}){
        softKeyboard = false;
        if(editTF){
            editTF.visible = true;
            editTF.text = option.value;
            editTF.simpleDispatch(EventT.CHANGE);
            editTF = undefined;
        }
    }

    let emote_images: { [key:number]: Sprite } = {};

    export const enum TextFormatAlign{
        LEFT = "left",
        RIGHT = "right",
        CENTER = "center"
    };

    export const enum TextFieldType{
        INPUT = "input",
        DYNAMIC = "dynamic"
    }

    export class TextFormat {
        family: string = "微软雅黑";

        size: number = 20;
        //"align":"left";
        align:string = "left";
        // "bold " : "normal "
        bold: string = "normal";
        // "italic " : "normal "
        italic: string = "normal";
        // [描边颜色color,描边大小width]
        stroke: {size: number, color?: number};
        //[阴影颜色shadowColor,阴影模糊shadowBlur,阴影偏移shadowOffsetX,阴影偏移shadowOffsetY]
        shadow: {color: number, blur: number, offsetX?: number, offsetY?: number};
        // [渐变色,渐变色位置百分比上0下1]
        gradient: {color: number, percent?: number}[];

        font: string;
        leading:number = 4;

        init(): TextFormat {
            this.font = `${this.bold} ${this.italic} ${this.size}px ${this.family}`
            this.stroke = {size:1,color:0}
            return this;
        }
        test(context: CanvasRenderingContext2D, text: string, out: { x: number, y: number },scale:number): void {
            const { family, size, bold, italic } = this;
            //设置字体
            context.font = `${this.bold} ${this.italic} ${this.size * scale}px ${this.family}`;

            out.x = context.measureText(text).width;

            out.y = size * scale;

            if (this.stroke) {
                out.x += this.stroke.size * 2 * scale;
                out.y += this.stroke.size * 2 * scale;
            }
            if(text == "j"){
                out.x += 4.0;
            }else{
                out.x += 1.2;
            }
            
            out.x = Math.round(out.x);

            out.y *= 1.2;
            out.y = Math.round(out.y);

            // if (this.shadow) {
            //     out.x += this.shadow.blur * 2 + Math.abs(this.shadow.offsetX || 0);
            //     out.y += this.shadow.blur * 2 + Math.abs(this.shadow.offsetY || 0);
            // }
        }
        draw(context: CanvasRenderingContext2D, text: string, s: Size): void {
            let { x, y, w, h} = s;
            const {family, size, bold, italic, stroke, shadow, gradient , align} = this;

            let scale = pixelFont;
            //设置字体
            context.font = `${this.bold} ${this.italic} ${this.size * scale}px ${this.family}`;

            y += Math.round(h >> 1);

            // //只有一个渐变色则文字颜色为渐变色
            // if (gradient && gradient.length == 1) {
            //     context.fillStyle = this.getColorStr(gradient[0].color);
            // }
            // //有多个渐变色
            // else if (gradient && gradient.length > 1) {
            //     let style = context.createLinearGradient(x, y - h, x, y + h);
            //     for (let g of gradient) {
			// 		let v = g.percent || 0;
			// 		let c = this.getColorStr(g.color);
			// 		style.addColorStop(v, c);
            //     }
            //     context.fillStyle = style;
            // }
            //如果只是文字 没渐变色 那文字颜色永远用白色;
            // else {
           
            // }

            //阴影
            // if (shadow) {
            //     context.shadowColor = this.getColorStr(shadow.color);
			// 	context.shadowBlur = shadow.blur;
			// 	context.shadowOffsetX = shadow.offsetX || 0;
			// 	context.shadowOffsetY = shadow.offsetY || 0;
            // }
            let ox = 0;
            let oy = 0;
            // context.fillStyle = `rgb(100,100,100)`;
            // context.fillRect(x +ox,y + ox,w,h);
            context.fillStyle = c_white;
            //描边
            if (stroke) {
				context.strokeStyle = this.getColorStr(stroke.color || 0);
				context.lineWidth = stroke.size * 2 * scale;
                // context.strokeText(text, x + stroke.size, y + stroke.size, w-1);
                ox = oy = stroke.size;
                if(text == "j"){
                    ox += parseInt(w * 0.125);
                }
                context.strokeText(text, x + ox, y + oy, w-1);
            }

            context.fillText(text, x + ox, y + oy, w-1);
        }

        getColorStr(color: number): string {
            let s = color.toString(16);
            return "#000000".substr(0, 7 - s.length) + s;
        }

        clone(format?: TextFormat): TextFormat {
            if (undefined == format) {
                format = new TextFormat();
            }
            format.family = this.family;
            format.size = this.size;
            format.bold = this.bold;
            format.italic = this.italic;
            format.stroke = this.stroke;
            format.shadow = this.shadow;
            format.gradient = this.gradient;
            format.font = this.font;
            format.align = this.align;
            format.leading = this.leading;
            return format;
        }
    }

    export let defalue_format = new TextFormat().init();


    /**
     * 优化计划
     * 1. textformat.oy 这东西不应该存在 他的作用主要是用于修正微软雅黑取jqpy等下标超界值。 需要研究 如何取获得 渲染文字的定义。上标 下标等渲染值。
     * 2. set text: 现在只要set text就会触发计算 绘制 渲染操作 如果后期一帧内频繁修改text可能会卡。所以应该换成1帧最多渲染1次的策略。
     */

    export class TextField extends Sprite {
        html: boolean = false;
        $text: string = "";
        format: TextFormat;
        color: number;
        element: HtmlElement;
        gap: number = -2;
        // wordWrap: boolean = false;
        multiline:boolean = false;
        maxChars:number;
        textHeight:number;
        textWidth:number;

        protected _edit:boolean = false;
        private _type:string = TextFieldType.DYNAMIC;

        constructor(source: BitmapSource = textSource){
            super(source);
        }

        init(source?: BitmapSource, format?: TextFormat): void {
            if (undefined != source) {
                this.source = source;
            }
            if (undefined == format) {
                format = defalue_format.clone();
            }
            this.format = format;
        }


        private lines: Recyclable<Line>[] = [];

        private textLines: TextLine[] = [];

        get text():string{
            return this.$text;
        }

        set text(value: string) {
            // console.log(value);
            if (this.$text == value) {
                return;
            }
            this.$text = value;
            let element = this.element;
            if (undefined == element) {
                this.element = element = new HtmlElement();
            } else {
                element.clear();
            }
            let format = this.format;
            if (undefined == format) {
                this.format = format = defalue_format.clone();
            }

            element.format = format;
            element.color = this.color;

            if (this.html) {
                formatHtml(value, element, this.source);
            } else {
                element.str = value;
            }
            let prelens = this.textLines.length;
            let lines = this.tranfromHtmlElement2CharDefine(element, this.multiline ? this.w : Infinity);
            let len = lines.length;
            let oy = 0;
            let lw:number;
            for (let i = 0; i < len; i++) {
                let line = lines[i]
                let textLine = this.textLines[i];
                if (undefined == textLine) {
                    this.textLines[i] = textLine = new TextLine();//recyclable(TextLine);
                }
                textLine.y = oy;
                textLine.source = this.source;
                textLine.renderText(line);
                textLine.updateHitArea();//必须更新hitarea w h 会出现不正确现象
                oy += line.h + format.leading;
                this.addChild(textLine);
                if(!lw){
                    lw = line.w;
                }else{
                    if(lw < line.w){
                        lw = line.w;
                    }
                }
                
            }
            this.textWidth = lw;
            this.textHeight = Math.floor(oy / 1.1);

            while (lines.length > len) {
                let textLine = lines.pop();
                textLine.recycle();
            }

            while(prelens > len){
                let tline = this.textLines[prelens - 1];
                // tline.recycle();
                tline.cleanAll();
                prelens--;
            }

            this.layout();
        }

        cleanAll(){
            super.cleanAll();
        }

        removeChild(child:DisplayObject){
            super.removeChild(child);
        }

        layout(): void {
            const{format}=this;

            this.updateHitArea();

            if(format.align == TextFormatAlign.LEFT)
            {
                return;
            }

            
            
            const{childrens}=this;

            //根据align属性进行重新布局
            let _w:number = this.w;

            if(_w == 0)
            {
                return;
            }

            let align_type:number = 0;
            if(format.align == TextFormatAlign.CENTER){
                align_type = 1;
            }else if(format.align == TextFormatAlign.RIGHT){
                align_type = 2;
            }

            let len = childrens.length;

            //fisrt 取出完整的width
            //second 根据align获取偏移offsetx
            for(let i = 0; i < len; i++)
            {
                let display = childrens[i];
                if(align_type == 1)
                {
                    display.x = _w - display.w >> 1;
                }else if(align_type == 2){
                    display.x = _w - display.w;
                }
            }

//             if(u){
// //				-偏移量
//                 var _offy:int = txtSet ? currentHtml.text2dDefine.offsety : 0;

//                 graphics.clear();
//                 _graphics.lineStyle(1,_textColor);
//                 _graphics.moveTo(lx,height+reduceLineHeight - _offy);
//                 _graphics.lineTo(lx + textWidth + reduceLineWidth,height+reduceLineHeight - _offy);
//                 _graphics.endFill();
//             }
//             else
//             {
//                 graphics.clear();
//             }
        }

        getCharSourceVO(char: string, format: TextFormat): IBitmapSourceVO {
            let source = this.source;
            let name = format.font + "_" + char;
            let vo = source.getSourceVO(name, 1);
            if (undefined == vo) {
                let p = EMPTY_POINT2D;
                let bmd = source.bmd as BitmapData;
                let context = bmd.context;
                format.test(context, char, p, pixelFont);
                vo = source.setSourceVO(name, p.x, p.y, 1);
                if (vo) {
                    format.draw(context, char, vo);
                    if(pixelFont != 1.0){
                        format.test(context,char,p,1.0);
                    }
                    // vo.scale = pixelFont
                    vo.w = p.x;
                    vo.h = p.y;
                    let c = context3D;
                    let{textureData}=source;
                    if(!textureData){
                        source.textureData = textureData = c.getTextureData(source.name);
                    }
                    let texture = context3D.textureObj[textureData.key];
                    if(undefined != texture){
                        texture.readly = false;
                    }
                }
            }
            return vo;
        }
        tranfromHtmlElement2CharDefine(html: HtmlElement, width: number = Infinity): Recyclable<Line>[] {
            var char: Recyclable<Char>;
            var str: string;
            var i: number = 0;
            var oi: number = 0;
            var len: number;
            var ox: number = 0;
            let lineCount = 0;
            let lines = this.lines;
            let line = lines[lineCount];
            if (!line) {
                lines[lineCount] = line = recyclable(Line);
            }

            let chars = line.chars;

            lineCount++;
            //			chars = [];
            //			lines = [chars]
            while (html) {
                if (!html.image && !html.str) {
                    html = html.next;
                    continue;
                }
                if (html.image) {
                    if (html.newline) {
                        //自动换行开始
                        while (chars.length > oi) {
                            char = chars.pop();
                            char.recycle();
                        }
                        line = lines[lineCount];
                        if (!line) {
                            lines[lineCount] = line = recyclable(Line);
                        }
                        chars = line.chars;
                        ox = 0;
                        oi = 0;
                        lineCount++;
                        //自动换行结束
                    }
                    if (ox && ox + html.image.w > width) {
                        //自动换行开始
                        while (chars.length > oi) {
                            char = chars.pop();
                            char.recycle();
                        }
                        line = lines[lineCount];
                        if (!line) {
                            lines[lineCount] = line = recyclable(Line);
                        }
                        chars = line.chars;
                        ox = 0;
                        oi = 0;
                        lineCount++;
                        //自动换行结束
                    }

                    char = chars[oi];
                    if (!char) {
                        chars[oi] = char = recyclable(Char)
                    }

                    char.index = oi;
                    char.w = html.w;
                    char.h = html.h;
                    char.sx = ox;
                    char.ex = ox + char.w;
                    char.ox = ox + char.h * .5;
                    char.name = null;
                    char.display = html.image;
                    char.element = html;

                    line.w = ox + char.w;
                    if (line.h < char.h) {
                        line.h = char.h;
                    }

                    ox += (char.w + this.gap - 2);

                    oi++;


                } else {
                    if (html.newline) {

                        while (chars.length > oi) {
                            char = chars.pop();
                            char.recycle();
                        }

                        line = lines[lineCount];
                        if (!line) {
                            lines[lineCount] = line = recyclable(Line);
                        }
                        chars = line.chars;
                        ox = 0;
                        oi = 0;
                        lineCount++;
                    }
                    str = html.str;
                    len = str.length;
                    for (i = 0; i < len; i++) {
                        let c = str.charAt(i);
                        let vo = this.getCharSourceVO(c, html.format)
                        if (!vo) {
                            continue;
                        }
                        //自动换行开始
                        if (ox + vo.w > width) {
                            while (chars.length > oi) {
                                char = chars.pop();
                                char.recycle();
                            }
                            line = lines[lineCount];
                            if (!line) {
                                lines[lineCount] = line = recyclable(Line);
                            }
                            chars = line.chars;
                            ox = 0;
                            oi = 0;
                            lineCount++;
                        }
                        //自动换行结束

                        char = chars[oi];
                        if (!char) {
                            chars[oi] = char = recyclable(Char);
                        }
                        char.index = oi;
                        char.w = vo.w;
                        char.h = vo.h;
                        char.sx = ox;
                        char.ex = ox + vo.w;
                        char.ox = ox + vo.w * .5;
                        char.name = c;
                        char.element = html;
                        char.display = vo;
                        line.w = ox + vo.w;
                        if (line.h < vo.h) {
                            line.h = vo.h;
                        }
                        ox += (vo.w + this.gap);
                        oi++;
                    }
                }
                html = html.next;
            }

            while (chars.length > oi) {
                char = chars.pop();
                char.recycle();
            }

            while (lines.length > lineCount) {
                line = lines.pop();
                let chars = line.chars;
                for (let i = 0; i < chars.length; i++) {
                    chars[i].recycle();
                }
                chars.length = 0;
            }
            return lines;
        }

        set type(val:string)
        {
            this._type = val;
            if(val == TextFieldType.INPUT)
            {
                this.on(MouseEventX.MouseUp, this.mouseUpHandler, this);
            }else{
                this.off(MouseEventX.MouseUp, this.mouseUpHandler,this);
            }
        }

        get type():string
        {
            return this._type;
        }

        protected mouseUpHandler(event:MouseEventX) {
            this.simpleDispatch(EventT.FOCUS_IN);

            showKeyboard(this);

            if(isMobile){//移动设备
                //添加点击事件用于监听是否失去焦点
                callLater.add(this.looseEvt, this);
            }

            //启动文本编辑器
            // txtedit.setTextfiled(this);
            // txtedit.on("onblur", this.onblurHandler, this);
            // this.visible = false;
        }

        private looseEvt() {
            ROOT.on(MouseEventX.MouseDown, this.blurHandle, this);
        }

        private blurHandle(e:EventX) {
            e.stopImmediatePropagation = true;
            if(e.currentTarget == this) return;
            ROOT.off(MouseEventX.MouseDown, this.blurHandle, this);
            //获取输入的内容进行填充
            wx.hideKeyboard();
        }

        // private onblurHandler(event:EventX)
        // {
        //     this._edit = false;
        //     txtedit.off("onblur", this.onblurHandler,this);
        //     let val:string = event.data;
        //     this.visible = true;
        //     this.text = val;
        // }

        removeFromStage(){
            super.removeFromStage();
            if(this._edit)
            {
                ROOT.off(MouseEventX.MouseDown, this.blurHandle, this);
                wx.hideKeyboard();
            }
		}
    }


    export class ImageVO {
        x: number = 0;
        y: number = 0;
        w: number = 0;
        h: number = 0;
        tag: string;
        name: string;
        display: Sprite;

        clone(vo?: ImageVO): ImageVO {
            if (undefined == vo) {
                vo = new ImageVO();
            }
            vo.name = this.name;
            vo.tag = this.tag;
            vo.w = this.w;
            vo.h = this.h;
            return vo;
        }

        dispose() {
            this.display = undefined;
        }
    }

    export class HtmlElement {
		/**
		 * 是否需要换行 
		 */
        newline: boolean = false;
        str: string = undefined;
        start: number = 0;
        //		id:String;
        color: number = 0;
        // r:number = 1.0;
        // g:number = 1.0;
        // b:number = 1.0;
        // a:number = 1.0;
        format: TextFormat;
        //u
        underline: boolean;
        image: Sprite;
        imageTag: number;
        w: number;
        h: number;
        pre: HtmlElement;
        next: HtmlElement;

        // set color(value:number){
        //     this._color = value;
        //     this.r = ((value >> 16) & 0xFF) / 0xFF;
        //     this.g = ((value >> 8) & 0xFF) / 0xFF;
        //     this.b = (value & 0xFF) / 0xFF;
        // }

        createAndCopyFormat(last: HtmlElement = null, newline: boolean = false): HtmlElement {
            var ele: HtmlElement = new HtmlElement();
            ele.format = this.format;
            ele.underline = this.underline;
            ele.color = this.color;
            ele.newline = newline;
            if (last) {
                last.next = ele;
                ele.pre = last;
            }
            return ele;
        }


        clear(): void {
            let next: HtmlElement;
            while (next) {
                if (next.image) {
                    let images = emote_images;
                    if (next.imageTag > -1) {
                        images[next.imageTag] = null;
                        next.imageTag = -1;
                    }
                    next.image.remove();
                    next.image = null;
                }
                next = next.next;
            }

            this.next = null;
            this.pre = null;
            this.str = undefined;
            this.color = 0;
            this.image = undefined;
            this.imageTag = undefined;
        }
    }

    // let regHTML: RegExp = /\<(?<HtmlTag>(font|u|a|image))([^\>]*?)\>(.*?)\<\/\k<HtmlTag>\>/m;
    // let regPro: RegExp = /(color|size|face|href|target|width|height)=(?<m>['|"])(.*?)\k<m>/;
    let regPro: RegExp = /(color|size|face|href|target|width|height)=(['|"])(.*?)(['|"])/; //兼容手机机机机机机
    let regTag: RegExp = /<(font|u|a|image|b)([^\>]*?)\>/;
    let _imgtag: RegExp = /({tag (.*?) (.*?)})/g;
    let _emotiontag: RegExp = /\#[0-9]/g;
    let newLineChar: string = "∏々";

    function getTagStr(value: string): Array<string> {
        let o = regTag.exec(value);
        if (undefined == o) {
            return undefined;
        }
        let tag = o[1];
        let flag = 1;
        let findTag = "<" + tag;
        let findTagLen = findTag.length;
        let endTag = "</" + tag;
        let endTagLen = endTag.length;
        let sindex;
        let findindex;
        let endindex;
        let test;
        sindex = o[0].length + o.index;
        while (flag) {
            findindex = value.indexOf(findTag, sindex);
            endindex = value.indexOf(endTag, sindex);
            if (findindex != -1 && findindex < endindex) {
                flag++;
                sindex = findindex + findTagLen;
            } else {
                if (endindex == -1) {
                    console.log(`htmltext format error at tag ${tag}\nvalue:${value}`);
                    return undefined;
                }
                flag--;
                sindex = endindex + endTagLen;
            }
            test = value.slice(sindex);
        }
        endindex = value.indexOf(">", sindex);
        if (endindex == -1) {
            console.log(`htmltext format error at tag ${tag}\nvalue:${value}`);
            return undefined;
        }
        var result: string = value.slice(o.index, endindex + 1);
        o[3] = value.slice(o.index + o[0].length, sindex - endTagLen);
        o[0] = result;
        return o;
    }

    function doFormatHtml(value: string, source: BitmapSource, parent: HtmlElement = null, last: HtmlElement = null): HtmlElement {
        var html: HtmlElement;
        var o;
        var str: string;
        var len: number;
        var i: number;
        if (parent) {
            if (parent.str || parent.image) {
                last = html = parent.createAndCopyFormat(last);
            } else {
                html = parent;
            }
        }
        var nextnew: boolean;
        o = getTagStr(value);//取出html标签
        if (o) {
            var index: number = o.index;
            if (index != 0) {
                str = value.slice(0, index);
                while ((i = str.indexOf(newLineChar)) != -1) {
                    if (html.str || parent.image) {
                        last = html = parent.createAndCopyFormat(last, nextnew);
                    }
                    html.str = str.slice(0, i);
                    nextnew = true;
                    str = str.slice(i + newLineChar.length);
                }

                if (html.str || parent.image) {
                    last = html = parent.createAndCopyFormat(last, nextnew);
                    if (str) {
                        nextnew = false;
                    }
                }
                if (nextnew) {
                    last = html = parent.createAndCopyFormat(last, nextnew);
                    html.str = str;
                } else {
                    html.str = str;//如果是换行符nextnew属性不改变继续
                }
                if (str) {
                    nextnew = false;
                }
            }

            value = value.slice(o.index + o[0].length);

            if (o[1] == "image") {
                let image = emote_images[o[3]];
                if (image) {
                    if (parent.str || parent.image) {
                        last = html = parent.createAndCopyFormat(last, html.newline);
                    }
                    html.imageTag = o[3];
                    html.image = image;
                    html.w = image.w;
                    html.h = image.h;
                    htmlProParser(o[1], o[2], html, html.image);
                }
            } else if (o[1] == "a") {
                if (parent.str || parent.image) {
                    last = html = parent.createAndCopyFormat(last, html.newline);
                }


                let text = recyclable(TextALink);
                text.init(source, html.format);
                text.color = html.color;
                html.image = text;
                html.imageTag = -1;
                htmlProParser(o[1], o[2], html, text);
                text.text = o[3];
                html.w = text.w;
                html.h = text.h;
            } else if (o[1] == "b") {
                last = html = parent.createAndCopyFormat(last, html.newline);
                var format: TextFormat = parent.format;
                if (format.bold != "bold") {
                    format = format.clone();
                    format.bold = "bold";
                    format.init();
                }
                html.format = format;
                htmlProParser(o[1], o[2], html);
                last = doFormatHtml(o[3], source, html, last);
            } else {
                last = html = parent.createAndCopyFormat(last, nextnew);
                //复制属性
                htmlProParser(o[1], o[2], html);
                last = doFormatHtml(o[3], source, html, last);
            }

            if (value.length) {
                last = html = parent.createAndCopyFormat(last);
                last = doFormatHtml(value, source, html, last);
            }

        } else {
            str = value;
            nextnew = false;
            while ((i = str.indexOf(newLineChar)) != -1) {
                if (html.str || parent.image) {
                    last = html = parent.createAndCopyFormat(last, nextnew);
                }
                html.str = str.slice(0, i);
                nextnew = true;
                str = str.slice(i + newLineChar.length);
            }
            if (html.str || parent.image) {
                last = html = parent.createAndCopyFormat(last, html.newline);
            }
            html.str = str;
            if (nextnew) {
                html.newline = nextnew;
                nextnew = false;
            }
        }
        return last;
    }

    export let emotion:{[key:string]:ImageVO};// = {};
    export let imageCreateFunctions:{[key:string]:{func:Function, thisobj:any}} = {};
    let imageTag = 0;
    // let images = {};

    function checkImage(): number {
        for (var i: number = 0; i < imageTag; i++) {
            if (emote_images[i] == null) {
                return i;
            }
        }
        return imageTag++;
    }

    function createImage(tag, value, source: BitmapSource): string {
        var funcParms = imageCreateFunctions[tag];
        if (!funcParms) {
            return "";
        }
        let {func, thisobj} = funcParms;
        let imagevo = func.call(thisobj, value, source);//func(value, source);
        var index = checkImage();
        emote_images[index] = imagevo.display;
        imagevo.display = undefined;

        var str: string = "<image>{0}</image>".substitute(index);
        return str;
    }

    function imageStrFormat(value: string, source: BitmapSource): string {
        var _strs: string;
        var len: number;
        let index = 0;
        var arr: Array<string>;
        _strs = "";

        value = value.replace(/\'#/g, "'$");
        value = value.replace(/\"#/g, "\"$");

        len = value.length;
        index = _imgtag.lastIndex = 0;
        var temp1: String;
        var temp: String;
        while (index < len) {
            arr = _imgtag.exec(value);
            if (arr) {
                temp1 = arr[0]; //整个
                //普通字符串
                temp = value.substring(index, _imgtag.lastIndex - temp1.length);
                if (temp) {
                    _strs += temp;
                }
                index = _imgtag.lastIndex;
                //					tag = (imageTextField as GImageTextField).setImgImagevo(arr[2],arr[3]);
                _strs += createImage(arr[2], arr[3], source);

            }
            else {
                temp = value.substring(index);
                if (temp) {
                    _strs += temp;
                }
                break;
            }
        }
        value = _strs;

        let imageCheck = 0;
        var i: number;
        var imageVO: ImageVO;
        var tag;
        if (emotion) {
            do {
                i = value.indexOf("#", index);
                if (i == -1) {
                    break;
                }
                index = i + 1;
                imageCheck = 5;
                while (imageCheck > 2) {
                    tag = value.slice(i, i + imageCheck);
                    imageVO = emotion[tag];
                    if (!imageVO) {
                        imageCheck--;
                        continue;
                    }
                    //					
                    let s = _emotiontag.exec(tag);
                    // if (s && s.length) {
                    //     break;
                    // }
                    let image = createImage("em", tag, source);
                    value = value.replace(tag, image);
                    break;
                }
            } while (i != -1)
        }


        value = value.replace(/\'\$/g, "'#");
        value = value.replace(/\"\$/g, "\"#");

        value = value.replace(/\'\$/g, "'#");
        return value;
    }


    export function formatHtml(value: string, html: HtmlElement, source: BitmapSource): void {
        value = value.replace(/<br\/>/g, newLineChar);
        value = value.replace(/\n/g, newLineChar);

        value = value.replace(/\&lt;/g, "<");
        value = value.replace(/\&gt;/g, ">");
        value = value.replace(/\&apos;/g, "'");
        value = value.replace(/\&quot;/g, '"');
        value = value.replace(/\&amp;/g, "&");

        value = imageStrFormat(value, source);

        doFormatHtml(value, source, html, html);
        var next: HtmlElement
        while (html) {
            if (html.pre && !html.str && !html.newline && !html.image) {
                html.pre.next = html.next;
                if (html.next) {
                    html.next.pre = html.pre;
                }
                html = html.next;
            } else {
                html = html.next;
            }
        }

    }



    function htmlProParser(pro: string, value: string, html: HtmlElement, sp?: Sprite): void {
        regPro.lastIndex = 0;
        value = value.replace(/\s/g, "");
        let o = regPro.exec(value);
        var cloneFormat: TextFormat;
        while (o) {
            let p = o[1];
            let v = o[3];
            p = p.trim();
            if (p == "color") {
                html.color = Number(v.replace("#", "0x"));
            } else if (p == "href") {
                if (v.indexOf("event:") == 0) {
                    v = v.replace("event:", "");
                }
            } else if (p == "size") {
                let size = Number(v);
                var format: TextFormat = html.format;
                if (format.size != size) {
                    format = format.clone();
                    format.size = size;
                    format.init();
                    html.format = format;
                }
            }
            if (undefined != sp) {
                if (sp.hasOwnProperty(p)) {
                    sp[p] = v;
                }
            } else {
                if (p != "color" && html.hasOwnProperty(p)) {
                    html[p] = v;
                }
            }
            value = value.replace(o[0], "");
            o = regPro.exec(value);
        }
    }


    export class Char implements IRecyclable {
        index: number;
        name: string;
        ox: number = 0;
        sx: number = 0;
        ex: number = 0;
        element: HtmlElement;
        display: IBitmapSourceVO | Sprite;
        w: number;
        h: number

        onRecycle() {
            this.element = undefined;
            this.display = undefined;
        }

    }

    export class Line {
        w: number = 0;
        h: number = 0;
        chars: Recyclable<Char>[] = [];
    }



    export class TextLine extends Sprite {
        line: Line;
        renderText(line: Line): void {
            this.removeAllChild();
            this.line = line;
            let h = line.h;
            let chars = line.chars;
            let len = chars.length;
            let g = this.graphics;
            g.clear();

            for (let i = 0; i < len; i++) {
                let char = chars[i];
                let ele = char.element;
                let display = char.display;
                if (display instanceof Sprite) {
                    display.x = char.sx;
                    display.y = (h - display.h) >> 1
                    this.addChild(display);
                } else {
                    g.drawBitmap(char.sx, h - display.h, display,undefined,undefined,ele.color);
                }
            }
            g.end();
        }
    }

    export class TextALink extends TextField {

    }























}