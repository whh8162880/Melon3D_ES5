// module rf{
//     export interface IBatchRenderData extends IRecyclable,I3DRender{

//         name:string;
//         filters:{[key:string]:FilterBase};
//         shader?:boolean

//         shaderKey:string;
//         factorKey:string;

//         // status:number;
//         first?:I3DRender;
//         current?:I3DRender;
//         program?:Program3D;
//         count?:number;

        

//         cull?: number;

//         srcFactor?: number;
//         dstFactor?: number;

//         depthMask?: boolean;
//         passCompareMode?: number;


//         offset?:number
//         quad?:number
//         triangles?:number;
//         vcData?:Float32Array;

//         __render_pre?:IBatchRenderData;
//         __render_next?:IBatchRenderData;

//         x?:number;
//         y?:number;
//         s?:number;
//         a?:number;
//     }


//     export class IBatchSourceData{
        
//     }

//     /**
//      *  超级合并渲染器
//      *  规则:
//      *      只要模型相同
//      *      如果不是Sprite | 存在renderer 新DC
//      */

//     export class SuperBatchRenderer implements I3DRender,IBatchGeometry{
//         target: Sprite;        
//         renderData:IBatchRenderData;
//         i3DRender:I3DRender;
//         currentRenderData:IBatchRenderData;

//         vertexBuffer:VertexBuffer3D;
//         worldTransform:IMatrix3D;
//         length:number;

//         sources:BitmapSource[];

//         change = DChange.vertex;

//         // t:Texture
//         constructor(target: Sprite) {
//             this.target = target;
//             let filters = target.filters;
//             filters[FilterConst.BASIC] = singleton(BasicFilter);
//             filters[FilterConst.COLOR] = singleton(ColorFilter);
//             filters[FilterConst.DIFF] = singleton(UIDiffFilter);
//             filters[FilterConst.UI] = singleton(UIFilter);
//             filters[FilterConst.MVP] = singleton(MvpFilter);
//             this.worldTransform = newMatrix3D();
//         }

//         render(camera:Camera,option:IRenderOption) {

//             /*
//                 step1:
//                     收集variable相同的对象
//                 step2:
//                     绘制
//             */

//             let{change,target,renderData,worldTransform} = this;

//             if (change & DChange.vertex) {
//                 this.cleanBatch(); 
//                 //step1 收集所有可合并对象
//                 this.filterGeo(target);
//             //     //step2 合并模型 和 vc信息
//                 this.toBatch();

//                 this.change &= ~DChange.batch;
//             }


//             let{scrollRect,sceneTransform}=target;

//             var parentRect:Size;
//             if(scrollRect){
//                 parentRect = context3D.setScissor(scrollRect,sceneTransform[12],sceneTransform[13]);
//             }

//             worldTransform.m3_append(camera.worldTranform,false,sceneTransform);

//             for(;renderData;renderData = renderData.__render_next){
//                 if(renderData instanceof Sprite){
//                     renderData.render(camera,option);
//                 }else{
//                     this.dc(renderData,worldTransform);
//                 }
//             }


//             if(scrollRect){
//                 context3D.lossScissor(parentRect);
//             }




//         }

//         dc(renderData:IBatchRenderData,worldTransform:IMatrix3D): void {
//             let c = context3D;

//             if(!this.length){
//                 return;
//             }

//             let{program,vcData,offset,triangles,quad} = renderData;

//             if(!program){
//                 renderData.program = program = singleton(Shader).createProgram(renderData);
//             }

//             c.setProgram(program);
//             let{vertexBuffer: vertex,sources} = this;
//             vertex.uploadContext(program);
//             let variable = "diff";
//             for (let i = 0; i < sources.length; i++) {
//                 sources[i].uploadContext(program,i == 0 ? variable : variable + i );
//             }

//             c.setProgramConstantsFromVector("ui",vcData,4);
//             c.setProgramConstantsFromMatrix("mvp",worldTransform);

//             let indexbuffer = c.getIndexByQuad(quad);
//             c.drawTriangles(indexbuffer,triangles,undefined,offset);
//             // gl.RGBA4
//         }


//         cleanBatch() {
//             var{renderData,target} = this;
//             if(!renderData){
//                 this.renderData = renderData = {} as IBatchRenderData;
//             }
//             renderData.__render_next = undefined;
//             renderData.first = undefined;
//             renderData.current = undefined;
//             this.i3DRender = renderData;

//             this.length = 0;
//             this.sources = [];

//             this.currentRenderData = renderData;

//             renderData.shaderKey = target.shaderKey;
//             renderData.factorKey = target.factorKey;
//             let{filters} = target;
//             let f = {}
//             for(let filterKey in filters){
//                 f[filterKey] = filters[filterKey];
//             }
//             renderData.filters = f;
//             renderData.count = 0;
//             renderData.quad = 0;
//             renderData.program = undefined;


            
//         }

//         createNewRenderData(render:Sprite,factorKey:string){
//             let{currentRenderData} = this;
//             let renderData = {} as IBatchRenderData;
//             let{filters,x,y,s,a} = currentRenderData;
//             let f = {}
//             let shaderKey = ""
//             for(let filterKey in filters){
//                 let filter = filters[filterKey];
//                 f[filterKey] = filter;
//                 shaderKey += filter.skey;
//             }

//             filters = render.filters;
//             for(let filterKey in filters){
//                 let filter = filters[filterKey];
//                 f[filterKey] = filter;
//                 shaderKey += filter.skey;
//             }

//             renderData.filters = f;
//             // renderData.x = x;
//             // renderData.y = y;
//             // renderData.s = s;
//             // renderData.a = a;
//             renderData.shaderKey = shaderKey;
//             renderData.factorKey = factorKey;

//             currentRenderData.__render_next = renderData;
//             currentRenderData = renderData;
            
//         }


//         // cleanRenderBatch(render : Sprite){
//         //     render
//         // }



//         filterGeo(render: Sprite) {

//             render.__batch = this;

//             let{_visible} = render;
//             if(!_visible){
//                 //不收集列表
//                 return;
//             }

//             let{nativeRender,renderer} = render;

//             if(render != this.target && (nativeRender || renderer)){
//                 this.i3DRender.__render_next = render;
//                 this.i3DRender = render;
//                 this.i3DRender.__render_next = undefined;
//                 return;
//             }

//             let{$graphics} = render;

//             if($graphics && $graphics.numVertices){
//                 render.$batchGeometry = this;
//                 $graphics.$batchOffset = this.length;
//                 this.length += $graphics.byte.length;


//                 let{currentRenderData} = this;


//                 let shaderKey = render.shaderKey;
//                 let factorKey = render.factorKey;
    
//                 if(currentRenderData.factorKey.indexOf(factorKey) == -1 || currentRenderData.shaderKey.indexOf(shaderKey) == -1 || currentRenderData.count > max_vc){
//                     this.createNewRenderData(render,factorKey);
//                 }
    
//                 if(!currentRenderData.first){
//                     currentRenderData.first = render;
//                 }else{
//                     currentRenderData.current.__render_next = render;
//                 }
//                 currentRenderData.current = render;
//                 currentRenderData.current.__render_next = undefined;
//                 render.$vcIndex = currentRenderData.count;

//                 let {sources} = this;
//                 let sourceIndex = sources.indexOf(render.source);
//                 if(sourceIndex == -1){
//                     sourceIndex = sources.length;
//                     sources.push(render.source);
//                 }
//                 render.$sourceIndex = sourceIndex;

//                 render.__batch_render_data = currentRenderData;

//                 currentRenderData.count ++;
//                 currentRenderData.quad += $graphics.numVertices / 4;

//             }

//             //遍历出所有可用的模型 获取模型长度大小等信息
//             let{childrens} = render;

//             for (let i = 0; i < childrens.length; i++) {
//                 const element = childrens[i] as Sprite;
//                 if(element){
//                     this.filterGeo(element);
//                 }
//             }

//         }


//         toBatch(){

//             let{length,vertexBuffer: vertex,target,renderData} = this;
//             let{variables}=target
//             let data32PerVertex = variables.data32PerVertex.size
//             let info:VertexInfo;
//             if(!vertex){
//                 info = new VertexInfo(length,data32PerVertex,variables);
//                 this.vertexBuffer = vertex = context3D.createVertexBuffer(info);
//             }else{
//                 info = vertex.data;
//                 if(info.vertex.length < length){
//                     info = new VertexInfo(length,data32PerVertex,variables);
//                     vertex.data = info;
//                 }
//                 vertex.numVertices = info.numVertices = length / data32PerVertex;
//                 vertex.readly = false;
//             }
//             let vcoffset = variables.uv.offset + 2;

//             let vertexData = info.vertex;

//             let offset = 0;

//             for(;renderData;renderData = renderData.__render_next){
//                 let count = renderData.count;
//                 if(!(renderData instanceof Sprite) && count > 0){
//                     renderData.offset = offset;
//                     renderData.triangles = renderData.quad * 2;
//                     offset += renderData.triangles;
//                     renderData.vcData = new Float32Array(count * 4);
//                     let render = renderData.first as I3DRender;
//                     for(;render;render = render.__render_next){
//                         let{$graphics:g,$vcIndex: v,$sourceIndex: s}=render;
//                         for(let i = 0;i<g.numVertices;i++){
//                             g.byte[ i * data32PerVertex + vcoffset] = v;
//                             g.byte[ i * data32PerVertex + vcoffset + 1] = s;
//                         }
//                         vertexData.set(g.byte,g.$batchOffset);
//                         render.updateBatchVCData();
//                     }
//                 }
//             }
//         }

//         update(position:number,byte:Float32Array){
//             let{vertexBuffer} = this;
//             vertexBuffer.data.vertex.set(byte,position);
//             vertexBuffer.readly = false;
//         }
//     }
// }