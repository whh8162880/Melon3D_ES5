module rf{

    
    export interface IBatchRenderData extends IRecyclable,I3DRender{

        name:string;
        filters:{[key:string]:FilterBase};
        shader?:boolean

        shaderKey:string;
        factorKey:string;

        // status:number;
        first?:I3DRender;
        current?:I3DRender;
        program?:Program3D;
        count?:number;

        

        cull?: number;

        srcFactor?: number;
        dstFactor?: number;

        depthMask?: boolean;
        passCompareMode?: number;


        offset?:number
        quad?:number
        triangles?:number;
        vcData?:Float32Array;

        __render_pre?:IBatchRenderData;
        __render_next?:IBatchRenderData;

        __graphics_next?:Sprite;

        // x?:number;
        // y?:number;
        // s?:number;
        // a?:number;
    }


    export class IBatchSourceData{
        
    }


    export const enum FilterConst{
        MATRIX_UI = "MatrixUI_"
    }

    export class MatrixUIFilter extends FilterBase{
        static VERTEX =
 {
    def:
`uniform vec4 ui[${max_vc * 2}];
`,
func:
`
void caclUIMat3(inout vec4 p , in vec4 t , in vec4 v){
    mat3 m = mat3(
        t.x,t.y,0.0,
        t.z,t.w,0.0,
        0.0,0.0,1.0
    );
    p.xyz = m * p.xyz + v.xyz;
}
`,
    code:
`
 
vec4 tv = ui[int(uv.z * 2.0)];
vec4 tvp = ui[int(uv.z * 2.0 + 1.0)];

caclUIMat3(p,tv,tvp);

c.w *= tvp.w;
`
 } as IShaderCode
 
        constructor(){
            super(FilterConst.MATRIX_UI);
            this.vertex = MatrixUIFilter.VERTEX;
        }
    }

    /**
     *  超级合并渲染器
     *  规则:
     *      只要模型相同
     *      如果不是Sprite | 存在renderer 新DC
     */

    export class SuperBatchRenderer implements I3DRender,IBatchGeometry{
        target: Sprite;        
        renderData:IBatchRenderData;
        i3DRender:I3DRender;
        currentRenderData:IBatchRenderData;

        invSceneTransfrom:IMatrix3D;

        vertexBuffer:VertexBuffer3D;
        worldTransform:IMatrix3D;
        length:number;

        sources:BitmapSource[];

        changeStatus = DChange.vertex;


        depth = false;
        depthMode = WebGLConst.ALWAYS;
        srcFactor = WebGLConst.SRC_ALPHA;
        dstFactor = WebGLConst.ONE_MINUS_SRC_ALPHA;
        cull = WebGLConst.NONE;

        // t:Texture
        constructor(target: Sprite) {
            this.target = target;
            let filters = target.filters;
            filters[FilterConst.BASIC] = singleton(BasicFilter);
            filters[FilterConst.COLOR] = singleton(ColorFilter);
            filters[FilterConst.DIFF] = singleton(UIDiffFilter);
            filters[FilterConst.MATRIX_UI] = singleton(MatrixUIFilter);
            filters[FilterConst.MVP] = singleton(MvpFilter);
            this.worldTransform = newMatrix3D();
            this.invSceneTransfrom = newMatrix3D();
        }

        render(camera:Camera,option:IRenderOption) {

            /*
                step1:
                    收集variable相同的对象
                step2:
                    绘制
            */

            let{changeStatus: change,target,renderData,worldTransform,invSceneTransfrom} = this;

            let{scrollRect,sceneTransform}=target;

            if (change & DChange.vertex) {

               
                this.cleanBatch(); 
                //step1 收集所有可合并对象
                this.filterGeo(target);
            //     //step2 合并模型 和 vc信息
                this.toBatch();

                renderData = this.renderData;

                this.changeStatus &= ~DChange.batch;
            }


            

            var parentRect:Size;
            if(scrollRect){
                parentRect = context3D.setScissor(scrollRect,sceneTransform[12],sceneTransform[13]);
            }

            worldTransform.m3_append(camera.worldTranform,false,sceneTransform);

            for(;renderData;renderData = renderData.__render_next){
                if(renderData instanceof Sprite){
                    renderData.render(camera,option);
                }else{
                    this.dc(renderData,worldTransform);
                }
            }


            if(scrollRect){
                context3D.lossScissor(parentRect);
            }




        }

        dc(renderData:IBatchRenderData,worldTransform:IMatrix3D): void {
            let c = context3D;

            if(!this.length){
                return;
            }

            let{program,vcData,offset,triangles,quad} = renderData;

            if(!program){
                renderData.program = program = singleton(Shader).createProgram(renderData);
            }

            let setting = c.setting;
            setting.depth = this.depth;
            setting.depthMode = this.depthMode;
            setting.src = this.srcFactor;
            setting.dst = this.dstFactor;
            setting.cull = this.cull;

            c.setProgram(program);
            let{vertexBuffer: vertex,sources} = this;
            vertex.uploadContext(program);
            let variable = "diff";
            for (let i = 0; i < sources.length; i++) {
                sources[i].uploadContext(program,i == 0 ? variable : variable + i );
            }

            c.setProgramConstantsFromVector("ui",vcData,4);
            c.setProgramConstantsFromMatrix("mvp",worldTransform);

            let indexbuffer = c.getIndexByQuad(quad);
            c.drawTriangles(indexbuffer,triangles,undefined,offset);
            // gl.RGBA4
        }


        cleanBatch() {
            var{currentRenderData,target} = this;
            if(!currentRenderData){
                currentRenderData = {} as IBatchRenderData;
            }
            currentRenderData.__render_next = undefined;
            currentRenderData.first = undefined;
            currentRenderData.current = undefined;
            this.i3DRender = undefined;

            let renderData = this.renderData;

            while(renderData){
                let temp = renderData.__render_next;
                renderData.__render_next = undefined;
                renderData = temp;
            }


            this.renderData = undefined;

            this.length = 0;
            this.sources = [];

            this.currentRenderData = currentRenderData;

            currentRenderData.shaderKey = target.shaderKey;
            currentRenderData.factorKey = target.factorKey;
            let{filters} = target;
            let f = {}
            for(let filterKey in filters){
                f[filterKey] = filters[filterKey];
            }
            currentRenderData.filters = f;
            currentRenderData.count = 0;
            currentRenderData.quad = 0;
            currentRenderData.program = undefined;
        }

        createNewRenderData(render:Sprite,factorKey:string){
            let{currentRenderData} = this;
            let renderData = {} as IBatchRenderData;
            let{filters} = currentRenderData;
            let f = {}
            let shaderKey = ""
            for(let filterKey in filters){
                let filter = filters[filterKey];
                f[filterKey] = filter;
                shaderKey += filter.skey;
            }

            filters = render.filters;
            for(let filterKey in filters){
                let filter = filters[filterKey];
                f[filterKey] = filter;
                shaderKey += filter.skey;
            }

            renderData.filters = f;
            // renderData.x = x;
            // renderData.y = y;
            // renderData.s = s;
            // renderData.a = a;
            renderData.shaderKey = shaderKey;
            renderData.factorKey = factorKey;
            renderData.count = 0;
            renderData.quad = 0;

            currentRenderData.__render_next = renderData;
            this.currentRenderData = renderData;
            
            return renderData;
        }


        copyRenderData(data:IBatchRenderData){
            let renderData = {} as IBatchRenderData;
            renderData.filters = data.filters;
            renderData.shaderKey = data.shaderKey;
            renderData.factorKey = data.factorKey;
            renderData.count = 0;
            renderData.quad = 0;
            this.currentRenderData = renderData;
            return renderData;
        }


        // cleanRenderBatch(render : Sprite){
        //     render
        // }



        filterGeo(render: Sprite) {

            let{_visible} = render;
            if(!_visible){
                //不收集列表
                return;
            }

            let{nativeRender,renderer} = render;

            let{currentRenderData,renderData,i3DRender} = this;

            if(render != this.target && (nativeRender || renderer)){

                if(!renderData){
                    this.renderData = render;
                }

                if(i3DRender){
                    i3DRender.__render_next = render;
                    if(currentRenderData.count > 0){
                        currentRenderData = this.copyRenderData(currentRenderData);
                    }
                }
                    
                this.i3DRender = render;

                this.i3DRender.__render_next = undefined;

                // if(renderer){
                //     renderer.changeStatus |= DChange.vertex;//非自身对象时需要对子对象renderer进行一次强制收集
                // }

                return;
            }

            render.__batch = this;
            

            let{$graphics} = render;

            if($graphics && $graphics.numVertices){
                render.$batchGeometry = this;
                $graphics.$batchOffset = this.length;
                this.length += $graphics.byte.length;


                


                let shaderKey = render.shaderKey;
                let factorKey = render.factorKey;
    
                if(currentRenderData.factorKey.indexOf(factorKey) == -1 || currentRenderData.shaderKey.indexOf(shaderKey) == -1 || currentRenderData.count >= max_vc){
                    currentRenderData = this.createNewRenderData(render,factorKey);
                }
    
                if(!currentRenderData.first){
                    currentRenderData.first = render;
                }
                // else{
                //     currentRenderData.current.__render_next = render;
                // }
                if(currentRenderData.current){
                    currentRenderData.current.__graphics_next = render;
                }
                currentRenderData.current = render;
                currentRenderData.current.__graphics_next = undefined;

                render.$vcIndex = currentRenderData.count;

                let {sources} = this;
                let sourceIndex = sources.indexOf(render.source);
                if(sourceIndex == -1){
                    sourceIndex = sources.length;
                    sources.push(render.source);
                }
                render.$sourceIndex = sourceIndex;

                render.__batch_render_data = currentRenderData;

                currentRenderData.count ++;
                currentRenderData.quad += $graphics.numVertices / 4;

                if(!renderData){
                    this.renderData = currentRenderData;
                }else{
                    if(i3DRender != currentRenderData && !i3DRender.__render_next){
                        i3DRender.__render_next = currentRenderData;
                    }
                }
                this.i3DRender = currentRenderData;
            }

            //遍历出所有可用的模型 获取模型长度大小等信息
            let{childrens} = render;

            for (let i = 0; i < childrens.length; i++) {
                const element = childrens[i] as Sprite;
                if(element){
                    this.filterGeo(element);
                }
            }

        }


        toBatch(){

            let{length,vertexBuffer: vertex,target,renderData} = this;
            let{variables}=target
            let data32PerVertex = variables.data32PerVertex.size
            let info:VertexInfo;
            if(!vertex){
                info = new VertexInfo(length,data32PerVertex,variables);
                this.vertexBuffer = vertex = context3D.createVertexBuffer(info);
            }else{
                info = vertex.data;
                if(info.vertex.length < length){
                    info = new VertexInfo(length,data32PerVertex,variables);
                    vertex.data = info;
                }
                vertex.numVertices = info.numVertices = length / data32PerVertex;
                vertex.readly = false;
            }
            let vcoffset = variables.uv.offset + 2;

            let vertexData = info.vertex;

            let offset = 0;

            for(;renderData;renderData = renderData.__render_next){
                let count = renderData.count;
                if(!(renderData instanceof Sprite) && count > 0){
                    renderData.offset = offset;
                    renderData.triangles = renderData.quad * 2;
                    offset += renderData.triangles;
                    renderData.vcData = new Float32Array(count * 8);
                    let render = renderData.first as I3DRender;
                    for(;render;render = render.__graphics_next){
                        let{$graphics:g,$vcIndex: v,$sourceIndex: s}=render;
                        for(let i = 0;i<g.numVertices;i++){
                            g.byte[ i * data32PerVertex + vcoffset] = v;
                            g.byte[ i * data32PerVertex + vcoffset + 1] = s;
                        }
                        vertexData.set(g.byte,g.$batchOffset);
                        render.updateBatchVCData(false);
                    }
                }
            }
        }

        update(position:number,byte:Float32Array){
            let{vertexBuffer} = this;
            vertexBuffer.data.vertex.set(byte,position);
            vertexBuffer.readly = false;
        }
    }
}