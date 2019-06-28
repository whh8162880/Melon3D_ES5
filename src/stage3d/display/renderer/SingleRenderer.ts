module rf{

    // export const enum FilterConst{
    //     SINGLE = "single_"
    // }

//     export class SingleFilter extends FilterBase{
//         constructor(){
//             super(FilterConst.SINGLE);

// let def = 
// `
// attribute vec3 pos;
// uniform mat4 mvp;
// `;
//             var func = ``
//             var code = 
// `
// vec4 p = vec4(pos,1.0);
// `;
//         }


//     }

    export class SingleRenderer implements I3DRender,IBatchGeometry{

        target:Sprite;
        vertex: VertexInfo;
        vertexBuffer: VertexBuffer3D;
        quadcount:number;

        program:Program3D;

        depth = false;
        depthMode = WebGLConst.ALWAYS;

        constructor(target:Sprite){
            this.target = target;
            let filters = target.filters;
            filters[FilterConst.BASIC] = singleton(BasicFilter);
            filters[FilterConst.COLOR] = singleton(ColorFilter);
            filters[FilterConst.DIFF] = singleton(DiffFilter);
            filters[FilterConst.MVP] = singleton(MvpFilter);
        }


        update(position:number,byte:Float32Array){
            let{vertex,vertexBuffer} = this;
            if(vertex){
                vertex.vertex = byte;
                if(vertexBuffer){
                    vertexBuffer.readly = false;
                }
            }
        }

        render(camera:Camera,option:IRenderOption){
            let target = this.target;
            let{source,status,scrollRect,sceneTransform,filters} = target;
            let c = context3D;
            if(!source || !source.bmd){
                return;
            }

            if (status & DChange.vertex) {
                //数据改变了
                let g = target.$graphics;
                if(!g || g.numVertices <= 0){
                    return;
                }

                let{vertex,vertexBuffer} = this;

                let{variables} = target;

                if(!vertex){
                    this.vertex = vertex = new VertexInfo(g.byte,variables.data32PerVertex.size,variables);
                }else if(vertexBuffer){
                    vertex.vertex = g.byte;
                    vertexBuffer.readly = false;
                }

                target.$batchGeometry = this;

                this.quadcount = g.numVertices / 4;
                target.status = 0;
            }

            let{vertex,vertexBuffer,program,quadcount} = this;

            if(!vertex){
                return;
            }

            if(!vertexBuffer){
                this.vertexBuffer = vertexBuffer = c.createVertexBuffer(vertex);
            }

            if (!program) {
                program = this.createProgram();
            }


            var parentRect:Size;
            if(scrollRect){
                parentRect = c.setScissor(scrollRect,sceneTransform[12],sceneTransform[13]);
            }


            let worldTransform = TEMP_MATRIX3D;
            worldTransform.m3_append(camera.worldTranform,false,sceneTransform);

            c.setProgram(program);
            source.uploadContext(program,FS.diff);
            vertexBuffer.uploadContext(program);
            c.setProgramConstantsFromMatrix(VC.mvp,worldTransform);

            c.setting.depth = this.depth;
            c.setting.depthMode = this.depthMode;

            this.otherParms(c,program);

            for(let key in filters){
                let filter = filters[key];
                if(filter && !filter.disable){
                    filter.setProgramConstants(c,program,target);
                }
            }

            c.drawTriangles(c.getIndexByQuad(quadcount),quadcount * 2)

            
            if(scrollRect){
                c.lossScissor(parentRect);
            }
        }

        otherParms(c:Context3D,p:Program3D){

        }

        createProgram(){
            let shader = singleton(Shader);
            let target = this.target;
            let program:Program3D;
            
            this.program = program = shader.createProgram(target);
            return program;
        }
    }
}