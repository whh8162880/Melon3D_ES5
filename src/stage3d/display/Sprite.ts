///<reference path="./DisplayObjectContainer.ts" />
///<reference path="../camera/Camera.ts" />
///<reference path="./Filter.ts" />
module rf {


    export let debug_click_button:Sprite;

    // export interface IBatchData{
    //     geo:BatchGeometry;
    //     index:number;
    //     x:number;
    //     y:number;
    //     s:number;
    // }

    export abstract class RenderBase extends DisplayObjectContainer implements I3DRender {
        nativeRender = false;
        variables:{ [key: string]: IVariable,data32PerVertex?:IVariable };
        material:Material;
        tm:ITimeMixer;
        scrollRect:Size;

        // triangleFaceToCull: string = Context3DTriangleFace.NONE;
        // sourceFactor: number;
        // destinationFactor: number;
        // depthMask: boolean = false;
        // passCompareMode: number;
        render(camera:Camera,option:IRenderOption) { 
            let i = 0;
            let childrens = this.childrens;
            // let len = childrens.length;
            for(i = 0;i < childrens.length ;i++){
                let child = childrens[i];
                child.render(camera,option);
            }
        }
        constructor(variables?:{ [key: string]: IVariable }) {
            super();
            // this.tm = defaultTimeMixer;
            this.variables = variables;
        }

        addToStage(){
            super.addToStage();
            this.setChange(DChange.vertex);
        }
    }
    

    export class Sprite extends RenderBase {
        //被收集的对象
        __batch:SuperBatchRenderer;
        __batch_render_data:IBatchRenderData

        source:BitmapSource;
        /**
         * 1.Sprite本身有render方法可以渲染
         * 2.考虑到可能会有一些需求 渲染器可以写在别的类或者方法中  所以加入renderer概念
         */
        renderer: I3DRender;
        $graphics: Graphics;

        // $batchData:IBatchData;

        $batchGeometry: IBatchGeometry;
        $vcIndex:number;
        $sourceIndex:number;
        $vcox: number;
        $vcoy: number;
        $vcos: number;
        pixcheck:boolean;

        /*
            updateShader flag
        */
        shader:boolean;

        mask:Sprite;

        constructor(source?:BitmapSource,variables?:{ [key: string]: IVariable }) {
            super();
            this.hitArea = new HitArea();
            this.source = source ? source : componentSource;
            this.variables = variables ? variables : vertex_ui_variable;
            this.mouseChildren = true;
            this.mouseEnabled = true;
        }


        setScrollRect(w:number,h:number,hStep:number = 0,vStep:number = 0, x:number = 0, y:number = 0){
			let{renderer}=this;
			if(!renderer){
				this.renderer = renderer = new SuperBatchRenderer(this);
			}
			this.scrollRect = {x:x,y:y,w:w,h:h};
		}

        addChild(child:DisplayObject){
            super.addChild(child);
            if(this.mask && this.mask.parent == this){
                super.addChild(this.mask);
            }
        }
        setMask(color:number=undefined, alpha:number = 0.95){
            let{mask} = this;
            if(color != undefined){
                if(!mask){
                    mask = this.mask = new Sprite(this.source);
                }
                this.addChild(mask);
                let g = mask.graphics;
                g.clear()
                g.drawRect(0,0,this.w, this.h, color, 0.95);
                g.end()

            }else{
                if(this.mask){
                    this.mask.remove()
                }
            }
        }

        get graphics(): Graphics {
            if (undefined == this.$graphics) {
                this.$graphics = new Graphics(this,vertex_ui_variable);
            }
            return this.$graphics;
        }

        setChange(value: number,p:number = 0,c:boolean = false): void {
            if(undefined != this.renderer){
                this.status |= (value | p);
                if(value & DChange.vertex){
                    if(this.__batch){
                        this.__batch.changeStatus |= DChange.vertex;
                    }else{
                        super.setChange(DChange.vertex);
                    }
                }
            }else{
                super.setChange(value,p,c);
            }
        }

        render(camera:Camera,option:IRenderOption): void {
            if (undefined != this.renderer) {
                if(this.status & DChange.t_all){ //如果本层或者下层有transform alpha 改编 那就进入updateTransform吧
                    this.updateSceneTransform();
                }
                this.renderer.render(camera,option);
            }else{
                super.render(camera,option);
            }
        }

        addToStage() {
            if (this.$graphics && this.$graphics.numVertices) {
                this.setChange(DChange.vertex);
            }

            if(this.renderer){
                // if(this.parent){
                //     this.parent.setChange(DChange.vertex);
                // }

                this.renderer.changeStatus = DChange.vertex;
            }

            super.addToStage();
        }

        cleanAll(){
            if(this.childrens.length){
                this.removeAllChild();
            }
            let g = this.$graphics
            if(g && g.numVertices > 0){
                g.clear();
                g.end();
            }
        }

        setSize(width:number, height:number)
        {
            super.setSize(width, height);
            let hitArea = this.hitArea;
            hitArea.clean();
            hitArea.updateArea(width, height, 0);
        }

        updateHitArea(){
            let locksize = this.locksize;
            if(locksize)
            {
                return;
            }
            let hitArea = this.hitArea;
            hitArea.clean();
            
            let{childrens} = this;
            for (let i = 0; i < childrens.length; i++) {
                const child = childrens[i];
                if(child.status & DChange.ac){
                    child.updateHitArea();
                }
                hitArea.combine(child.hitArea,child._x,child._y);
            }

            if(this.$graphics){
                hitArea.combine(this.$graphics.hitArea,0,0);
            }

            // if(hitArea.allWays){
            //     this.w = stageWidth;
            //     this.h = stageHeight;
            // }else{
            this.w = hitArea.right - hitArea.left;
            this.h = hitArea.bottom - hitArea.top;
            // }
            this.status &= ~DChange.ac;
        }

        getObjectByPoint(dx: number, dy: number,scale:number): DisplayObject {

            let{mouseEnabled,mouseChildren, visible} = this;

            if(!visible){
                return;
            }

            if(mouseEnabled == false && mouseChildren == false){
                return undefined
            }
            let{scrollRect,hitArea}=this;

            if(this.status & DChange.ac){
                this.updateHitArea()
            }

            dx -= this._x;
            dy -= this._y;
            scale *= this._scaleX;

            let b = true;

            if(scrollRect){
                let{w,h,x,y} = scrollRect;
                b = size_checkIn(-x,w-x,-y,h-y,dx,dy,scale);
            }else{
                b = hitArea.checkIn(dx,dy,scale)
            }

            
            if(b){
                if(this.mouseChildren){
                    let children = this.childrens;
                    let len = children.length;
                    for(let i = len - 1;i>=0;i--){
                        let child = children[i];
                        let d = child.getObjectByPoint(dx,dy,scale);
                        if(undefined != d){
                            return d;
                        }
                    }
                }
                if(mouseEnabled){
                    if(hitArea.allWays){
                        return this;
                    }
                    // if( hitArea.checkIn(dx,dy,scale) == true ){
                        //透明区域检测
                    if(!this.pixcheck){
                        return this;
                    }
                    let{$graphics:g} = this;
                    let vo:IBitmapSourceVO;
                    if(g && g.grometrys.length &&(vo = g.grometrys[0].vo)){
                        let b = source_transparent_check(this.source as PanelSource,vo,dx,dy);
                        if(b){
                            return this;
                        }
                    }else{
                        return this;
                    }
                    // }
                    // let g = this.$graphics;
                    // if(undefined != g){
                    //     if( g.hitArea.checkIn(dx,dy,scale) == true ){
                    //         return this;
                    //     }
                    // }
                }
            }


            return undefined;
        }



        buttonModel(x: number, y: number, z: number){
            super.setPivotPonumber(x,y,z);
            this.on(MouseEventX.MouseDown,this.pivotMouseDownHandler, this);
        }



        _tweener:ITweener;

        private identifier:number;

        protected pivotMouseDownHandler(event:EventX){
            let {identifier} = event.data;
            this.identifier = identifier;
			ROOT.on(MouseEventX.MouseUp, this.pivotMouseUpHandler, this);

			debug_click_button = this;

			// this.mouseDown = true;
			// this.clipRefresh();
			let{_tweener,tm,w,h}=this;
			// if(!this.renderer)
			// {
            //     this.hadRenderer = false;
			// 	this.renderer = new SuperBatchRenderer(this);
			// 	this.setChange(DChange.batch);
			// }else{
            //     this.hadRenderer = true;
            // }
			
            if(_tweener){
                tweenStop(_tweener);
            }
			this._tweener = tweenTo({scale:0.9}, 200, defaultTimeMixer , this,ease_quartic_out);
		}

		protected pivotMouseUpHandler(event:EventX){
            let{_tweener,tm, identifier}=this;
            let {identifier:nident} = event.data;
            if(identifier != nident) return;
			// this.mouseDown = false;
			ROOT.off(MouseEventX.MouseUp, this.pivotMouseUpHandler,this);
			// this.clipRefresh();
            if(_tweener){
                tweenStop(_tweener);
            }
            this._tweener = _tweener = tweenTo({scale:1}, 200, defaultTimeMixer, this,ease_back_out);
			_tweener.complete = this.scaleTweenComplete.bind(this);
		}

		scaleTweenComplete(t:ITweener){
			// if(this.renderer && !this.hadRenderer)
			// {
			// 	this.renderer = undefined;
				this.setChange(DChange.batch);
			// }
        }


        addFilter(filter:FilterBase){
            let{filters,renderer}=this;
            if(!filters){
                this.filters = filters = {};
            }
            filters[filter.type] = filter;
            filter.disable = false;

            if(renderer){
                renderer.program = undefined;
            }
        }

        removeFilter(type:FilterConst){
            let{filters,renderer}=this;
            if(!filters) return;
            filters[type] = undefined;
            if(renderer){
                renderer.program = undefined;
            }
            
        }

        updateSceneTransform(updateStatus = 0,parentSceneTransform?:IMatrix3D){
            updateStatus = super.updateSceneTransform(updateStatus,parentSceneTransform);

            let{renderer} = this;

            if(renderer && renderer.invSceneTransfrom){
                renderer.invSceneTransfrom.m3_invert(this.sceneTransform);
                this.updateBatchVCData();
            }

            return updateStatus
        }


        // updateBatchVCData(){
        //     let{__batch,__batch_render_data,sceneTransform,sceneAlpha,_scaleX,$vcIndex} = this;
        //     // let{invSceneTransfrom}=__batch;
        //     let{sceneTransform:batchSceneTransform}=__batch.target;
        //     let{vcData} = __batch_render_data;
        //     let index = $vcIndex * 4;
        //     vcData[index] = (sceneTransform[12] - batchSceneTransform[12])/_scaleX;
        //     vcData[index + 1] = (sceneTransform[13] - batchSceneTransform[13])/_scaleX;
        //     vcData[index + 2] = _scaleX; //scale会有问题
        //     vcData[index + 3] = sceneAlpha;
        // }

        updateBatchVCData(refresh:boolean = true){
            let{childrens,__batch_render_data} = this;

            if(__batch_render_data){
                let{__batch,sceneTransform,sceneAlpha,$vcIndex} = this;
                let{invSceneTransfrom}=__batch;
                // let{sceneTransform:batchSceneTransform}=__batch.target;
                let{vcData} = __batch_render_data;
                // if(!vcData) return;
                let index = $vcIndex * 8;

                let temp = TEMP_MATRIX3D;
                // let pos = tempAxeX;
                // let sca = tempAxeY;

                temp.m3_append(invSceneTransfrom,false,sceneTransform);

                // temp.m3_decompose(pos,undefined,sca);

                // [sin,cos,scax,scay]
                // [x,y,z,alpha]

                vcData[index] = temp[0];
                vcData[index + 1] = temp[1];
                vcData[index + 2] = temp[4] //scale会有问题
                vcData[index + 3] = temp[5];

                vcData[index + 4] = temp[12];
                vcData[index + 5] = temp[13];
                vcData[index + 6] = temp[14];
                vcData[index + 7] = sceneAlpha;

                // console.log(vcData);
            }

            if(refresh){
                for (let i = 0; i < childrens.length; i++) {
                    (childrens[i] as Sprite).updateBatchVCData();
                }
            }
        }


        removeFromStage(){
            super.removeFromStage();
            let{$graphics} = this;
            if($graphics) $graphics.$batchOffset = 0;
            this.$batchGeometry = undefined;
            this.__batch = undefined;
            this.__batch_render_data = undefined;
        }
    }

    export class Image extends Sprite{
        url:string;
        drawW:number;
        drawH:number;
        aglin:Align;

        lockkey:string;
        lock_a:number = 0;
        rect:Size;//九宫

        constructor(source:BitmapSource = componentSource,variables?:{ [key: string]: IVariable }){
            super(source,variables);
        }

        load(url:string,extension?:ExtensionDefine)
        {
            url = getFullUrl(url,extension);

            if(this.url == url)
            {   
                return;
            }
            //clear
            if (url)
			{
                this.url = url;
                let {source, lockkey, lock_a} = this;
                let vo = source.getSourceVO(lockkey ? lockkey : url, lockkey ? lock_a : 1);
                if(!vo || lockkey){
                    loadRes(RES_PERFIX,url,this.onImageComplete,this,ResType.image);
                }else{
                    //需要赋值宽高
                    this.w = vo.w;
                    this.h = vo.h;
                    this.draw(vo);
                    this.simpleDispatch(EventT.COMPLETE, this);
                }
			}
        }

        onImageComplete(e:EventX)
        {
            if(e.type !=  EventT.COMPLETE)
            {
                return;
            }
            let res = e.currentTarget as Loader
            let img = e.data as HTMLImageElement;
            let{url,drawW,drawH, lockkey, lock_a, source, rect}=this;

            if(url != res.url){
                return;
            }

            let cw = img.width, ch = img.height;
            this.w = cw;
            this.h = ch;
            if(!rect){
                // if(!drawW || !drawH)
                // {
                //     drawW = this.drawW = img.width;
                //     drawH = this.drawH = img.height;
                // }
                if(drawW && drawH){
                    this.w = cw = drawW;
                    this.h = ch = drawH;
                }
            }
            

            let vo = source.getSourceVO(lockkey ? lockkey : url, lockkey ? lock_a : 1);
            if(!vo || lockkey){
                if(!lockkey){
                    vo = source.setSourceVO(url,cw,ch, 1);
                }else{
                    vo.rw = vo.w;
                    vo.rh = vo.h;
                    source.clearBitmap(vo)
                }
                source.drawimg(img,vo.x,vo.y,cw,ch);
            }
            this.draw(vo);

            this.simpleDispatch(EventT.COMPLETE, this);
        }
        
        setSize(_width:number,_height:number){   
            this.w = this.drawW = _width;
            this.h = this.drawH = _height;

            let hitArea = this.hitArea;
            hitArea.clean();
            hitArea.updateArea(_width, _height, 0);
        }

        draw(vo:IBitmapSourceVO){
            let g = this.graphics;
            g.clear();

            let ix,iy;

            if(this.aglin){
                let p = getAglinPoint(this.aglin,vo.w,vo.h);
                ix = p[0];
                iy = p[1];
            }else{
                ix = 0;
                iy = 0;
            }
            let{rect, drawW, drawH}=this;
            let d;
            if(drawW != vo.w || drawH != vo.h){
                d = newMatrix() as IMatrix;
                d.m2_scale(drawW/vo.w, drawH/vo.h);
            }
            if(rect && drawW != undefined && drawH != undefined){
                g.drawScale9Bitmap(ix,iy,vo, rect, d);
            }else if(drawW != undefined && drawH != undefined){
                g.drawBitmap(ix,iy,vo, d);
            }else{
                g.drawBitmap(ix,iy,vo);
            }
            
            g.end();
        }

        clean(){
            let g = this.graphics;
            g.clear();
            g.end();
            this.aglin = 0;
            this.url = undefined;
            this.lockkey = undefined;
            this.lock_a = undefined;
        }

        onRecycle(){
            this.clean();
            super.onRecycle();
            this.drawW = this.drawH = undefined;
        }
    }


    export interface IGraphicsGeometry extends Size{
        offset:number;
        numVertices:number;
        base:Float32Array;
        matrix:IMatrix;
        vo:IBitmapSourceVO;
        rect:Size;
    }

    export function newGraphicsGeometry(matrix?:IMatrix){
        return {numVertices:0,matrix:matrix,offset:0} as IGraphicsGeometry;
    }

    /**
     *  自动模型合并 渲染器
     *  原理:
     *      1.Sprite graphics 可以生成 【矢量图 + 贴图】的【四边形】 模型数据 vertexData  : 点定义为 vertex_ui_variable
     *      2.带有Batch渲染器的Sprite对象 自动收集children中所有graphics 模型信息 并生成合并的VertexData。VertexData会被封装进【BatchGeometry】进行渲染
     *        模型合并触发条件
     *          【1.children graphics 信息改变】
     *          【2.children visible = false|true】
     *          【3.children alpha = 0|>0】
     *      3.考虑到Sprite对象的children对象 可能也会自带渲染器 所以会生成很多的模型信息【BatchGeometry】  所以batch的rendersLink会表现为 【BatchGeometry】-> I3DRender ->【BatchGeometry】这样的渲染顺序
     *      4.被合并的children对象的x,y,scale,alpha等信息会被batch收集成一个Float32Array数据 每4位(vec4)为一个控制单元【x,y,scale,alpha】 用于shader计算 
     *        所以children对象 x,y,scale,alpha 改变时 会重新收集数据【现在是只要chindren改变就全部无脑收集=。=】
     *      5.考虑到用户电脑 Max Vertex Uniform Vectors 数据不同【http://webglreport.com/】 所以要注意shader对象中ui[${max_vc}]  
     *      6.dc()方法渲染 shader计算详看代码。
     */
//     export class BatchRenderer implements I3DRender {
//         target: Sprite;        
//         renders: Link;
//         geo: BatchGeometry = undefined;
//         program: Program3D;
//         t:Texture;

//         rtt:RTTexture;

//         constructor(target: Sprite) {
//             this.target = target;
//             this.renders = new Link();
//             this.renders.checkSameData = false;
//         }

//         render(camera:Camera,option:IRenderOption){
//             let target = this.target;

//             let c = context3D;
            
//             const{source,status,_x,_y,_scaleX,scrollRect,sceneTransform} = target;
//             if(!source || !source.bmd){
//                 return;
//             }
//             let{textureData}=source;
//             if(!textureData) {
//                 source.textureData = textureData =  c.getTextureData(source.name,false);
//                 // c.getTextureData(source.name,true,gl.LINEAR,gl.LINEAR_MIPMAP_LINEAR);
//             }

//             let t:Texture

//             if(!textureData.key){
//                 t = context3D.createTexture(textureData,source.bmd);
//             }else{
//                 t = context3D.textureObj[textureData.key];
//                 if(!t){
//                     t = context3D.createTexture(textureData,source.bmd);
//                 }
//             }
            
//             this.t = t;


//             if (status & DChange.vertex) {
//                 this.cleanBatch();
//                 //step1 收集所有可合并对象
//                 this.getBatchTargets(target, -_x, -_y, 1 / _scaleX);
//                 //step2 合并模型 和 vc信息
//                 this.toBatch();

//                 this.geo = undefined;
//                 target.status &= ~DChange.batch;
//             }else if(status & DChange.vcdata){
//                 //坐标发生了变化 需要更新vcdata 逻辑想不清楚  那就全部vc刷一遍吧
//                 this.updateVCData(target, -_x, -_y, 1 / _scaleX);
//                 target.status &= ~DChange.vcdata;
//             }

//             if(!this.renders.length){
//                 return;
//             }

            

//             if (undefined == this.program) {
//                 this.createProgram();
//             }

//             var parentRect:Size;
//             if(scrollRect){
//                 parentRect = c.setScissor(scrollRect,sceneTransform[12],sceneTransform[13]);
//             }

//             // let rtt = this.rtt;
//             // if(!rtt){
//             //     this.rtt = rtt = c.createRttTexture(c.getTextureData("testrtt"),c.backBufferWidth,c.backBufferHeight);
//             // }
//             // c.setRenderToTexture(rtt);


//             let vo = this.renders.getFrist();
//             while (vo) {
//                 if (vo.close == false) {
//                     let render: I3DRender = vo.data;
//                     if (render instanceof BatchGeometry) {
//                         this.dc(camera,render);
//                     } else {
//                         render.render(camera,option);
//                     }
//                 }
//                 vo = vo.next;
//             }

//             // c.setRenderToBackBuffer();
//             // pass_outline_render(rtt);

//             if(scrollRect){
//                 c.lossScissor(parentRect);
//             }

            
            
//         }

//         depth = false;
//         depthMode = WebGLConst.ALWAYS;
//         srcFactor = WebGLConst.SRC_ALPHA;
//         dstFactor = WebGLConst.ONE_MINUS_SRC_ALPHA;
//         cull = WebGLConst.NONE;

//         dc(camera:Camera,geo: BatchGeometry): void {
//             // context3D.setBlendFactors()
//             let c = context3D;
//             let v: VertexBuffer3D = geo.$vertexBuffer;
//             if (undefined == v) {
//                 geo.$vertexBuffer = v = c.createVertexBuffer(geo.vertex, geo.vertex.data32PerVertex);
//             }
//             let g = gl;
//             let{scrollRect,sceneTransform,filters}=this.target;
//             let worldTransform = TEMP_MATRIX3D;


//             let setting = c.setting;

//             setting.depth = this.depth;
//             setting.depthMode = this.depthMode;
//             setting.src = this.srcFactor;
//             setting.dst = this.dstFactor;
//             setting.cull = this.cull;

//             /*
//             if(scrollRect){
//                 let{x,y,w,h}=scrollRect;
//             //     // console.log(x,y,w,h);
//             //     // worldTransform.m3_append(camera.worldTranform,false,sceneTransform);
//                 c.setScissor((sceneTransform[12] - x) * scissorScaleX ,(sceneTransform[13]-y) * scissorScaleY,w * scissorScaleX,h * scissorScaleY);
//             //     worldTransform.m3_translation(x,y,0,true,sceneTransform);
//             //     worldTransform.m3_append(camera.worldTranform);
//             }
//             */
//             // else{
//             worldTransform.m3_append(camera.worldTranform,false,sceneTransform);
//             // }
//             // console.log(`sceneTransform:${sceneTransform}`);
//             // console.log(`worldTransform:${worldTransform}`);
            
//             let i: IndexBuffer3D = c.getIndexByQuad(geo.quadcount);
//             let p = this.program; 
//             let type = c.setProgram(p);
//             c.setProgramConstantsFromMatrix(VC.mvp, worldTransform);
//             c.setProgramConstantsFromVector(VC.ui, geo.vcData, 4);

//             // console.log(`geo.vcData:${geo.vcData}`);

//             this.t.uploadContext(p,FS.diff);
//             v.uploadContext(p);

//             let target = this.target;


//             for(let key in filters){
//                 let filter = filters[key];
//                 if(filter && !filter.disable){
//                     filter.setProgramConstants(c,p,target);
//                 }
//             }


//             c.drawTriangles(i,geo.quadcount * 2);

//             // console.log("dc:" + geo.quadcount)
//         }


//         createProgram(): void {
//             //key = target
//             let shader = singleton(Shader);
//             let target = this.target;
//             let filters = target.filters;
//             filters[FilterConst.BASIC] = singleton(BasicFilter);
//             filters[FilterConst.COLOR] = singleton(ColorFilter);
//             filters[FilterConst.DIFF] = singleton(UIDiffFilter);
//             filters[FilterConst.UI] = singleton(UIFilter);
//             filters[FilterConst.MVP] = singleton(MvpFilter);
//             this.program = shader.createProgram(target);

            
//         }

//         cleanBatch(): void {
//             let vo = this.renders.getFrist();
//             while (vo) {
//                 if (vo.close == false) {
//                     let render: Recyclable<I3DRender> = vo.data;
//                     if (render instanceof BatchGeometry) {
//                         render.recycle();
//                     }
//                     vo.close = true;
//                 }
//                 vo = vo.next;
//             }
//             this.renders.clean();
//         }

//         getBatchTargets(render: RenderBase, ox: number, oy: number, os: number): void {
//             let target:Sprite;
//             if(render instanceof Sprite){
//                 target = render;
//             }else{
//                 this.renders.add(render);
//                 this.geo = undefined;
//                 return;
//             }

//             if (false == target._visible/* || 0.0 >= target.sceneAlpha*/) {
//                 target.$vcIndex = -1;
//                 target.$batchGeometry = null;
//                 return;
//             }

//             let g = target.$graphics;
//             ox = target._x + ox;
//             oy = target._y + oy;
//             os = target._scaleX * os;
//             if (target == this.target || (null == target.renderer && false == target.nativeRender)) {
//                 if (undefined == g || 0 >= g.numVertices) {
//                     target.$vcIndex = -1;
//                     target.$batchGeometry = null;
//                 } else {
//                     if (undefined == this.geo) {
//                         this.geo = recyclable(BatchGeometry);
//                         this.renders.add(this.geo);
//                     }

//                     let i = this.geo.add(target, g);
//                     target.$vcox = ox;
//                     target.$vcoy = oy;
//                     target.$vcos = os;

//                     if (i >= max_vc) {
//                         this.geo = undefined;
//                     }
//                 }
//             } else {
//                 this.renders.add(target);
//                 this.geo = undefined;
//                 return;
//             }


//             let{childrens} = target;
//             for (let i = 0; i < childrens.length; i++) {
//                 const child = childrens[i];
//                 if (child instanceof Sprite) {
//                     this.getBatchTargets(child, ox, oy, os);
//                 }else if(child instanceof RenderBase){
//                     this.renders.add(child);
//                     this.geo = undefined;
//                 }
//             }
//         }

        
//         updateVCData(render: RenderBase, ox: number, oy: number, os: number){
//             let target:Sprite;
//             if(render instanceof Sprite){
//                 target = render;
//             }else{
//                 return;
//             }
            

//             if (false == target._visible || 0.0 >= target.sceneAlpha) {
//                 target.$vcIndex = -1;
//                 target.$batchGeometry = null;
//                 return;
//             }

//             let g = target.$graphics;
//             ox = target._x + ox;
//             oy = target._y + oy;
//             os = target._scaleX * os;
//             if (target == this.target || (null == target.renderer && false == target.nativeRender)) {
//                 if(undefined != target.$batchGeometry){
//                     target.$vcox = ox;
//                     target.$vcoy = oy;
//                     target.$vcos = os;
//                     target.$batchGeometry.vcData.wPoint4(target.$vcIndex * 4 ,ox / os, oy / os, os, target.sceneAlpha);
//                 }
//             }else{
//                 return;
//             }

//             let{childrens} = target;
//             for (let i = 0; i < childrens.length; i++) {
//                 const child = childrens[i];
//                 if (child instanceof Sprite) {
//                     this.updateVCData(child, ox, oy, os);
//                 }
//             }
//         }


//         toBatch(): void {
//             let vo = this.renders.getFrist();
//             let target = this.target;
//             while (vo) {
//                 if (vo.close == false) {
//                     let render: Recyclable<I3DRender> = vo.data;
//                     if (render instanceof BatchGeometry) {
//                         render.build(target);
//                     }
//                 }
//                 vo = vo.next;
//             }
//         }


//     }

    export interface IBatchGeometry{
        vertex?:VertexInfo;
        vcData?:Float32Array;
        update(position:number,byte:Float32Array);
    }


//     export class BatchGeometry implements I3DRender {
//         vertex: VertexInfo;
//         $vertexBuffer: VertexBuffer3D;
//         quadcount: number;
//         vcData: Float32Array;
//         vci: number = 0;
//         link: Link;
//         verlen: number = 0;
//         constructor() { };
//         add(target: Sprite, g: Graphics): number {
//             if (undefined == this.link) {
//                 this.link = new Link();
//             }
//             target.$vcIndex = this.vci++;
//             target.$batchGeometry = this;
//             g.$batchOffset = this.verlen;
//             this.verlen += g.byte.length;
//             this.link.add(target);
//             return this.vci;
//         }

//         build(target:Sprite): void {
//             let variables = target.variables
//             let vertex = this.vertex = new VertexInfo(this.verlen, variables["data32PerVertex"].size);
//             vertex.variables = variables;
//             this.quadcount = vertex.numVertices / 4;
//             this.vcData = new Float32Array(this.quadcount * 4)
//             let{data32PerVertex,vertex:byte}=vertex;
//             let offset = vertex_ui_variable["uv"].offset+2
//             let vo = this.link.getFrist();
//             while(vo){
//                 if (vo.close == false) {
//                     let sp: Sprite = vo.data;
//                     let{$vcIndex}=sp;
//                     let g = sp.$graphics;
//                     if($vcIndex >= 0){
//                         g.byte.update(data32PerVertex,offset,$vcIndex)
//                     }
//                     byte.set(g.byte,g.$batchOffset);
//                     let{$vcox:ox,$vcoy:oy,$vcos:os}=sp;
//                     this.vcData.wPoint4($vcIndex * 4, ox / os, oy / os, os, sp.sceneAlpha)
//                 }
//                 vo = vo.next;
//             }
//         }

//         update(position:number,byte:Float32Array){
//             if(undefined != this.vertex){
//                 this.vertex.vertex.set(byte,position);
//             }
//             if(undefined != this.$vertexBuffer){
//                 this.$vertexBuffer.readly = false;
//             }
//         }

//         updateVC(sp:Sprite){
//             this.vcData.wPoint4(sp.$vcIndex * 4 ,sp.$vcox, sp.$vcoy, sp.$vcos, sp.sceneAlpha)
//         }

//         //x,y,z,u,v,vci,r,g,b,a;

//         onRecycle(): void {
//             this.vertex = undefined;
//             this.verlen = 0;
//             this.vci = 0;
//             this.$vertexBuffer = null;
//             this.vcData = null;
//             let vo = this.link.getFrist();
//             while(vo){
//                 if (vo.close == false) {
//                     let sp: Sprite = vo.data;
//                     if(sp.$batchGeometry == this){
//                         sp.$batchGeometry = null;
//                         sp.$vcIndex = -1;
//                         sp.$vcos = 1;
//                         sp.$vcox = 0;
//                         sp.$vcoy = 0;
//                     }
//                 }
//                 vo = vo.next;
//             }

//             this.link.onRecycle();
//         }
//     }
        
}