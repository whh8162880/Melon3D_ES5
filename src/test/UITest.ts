module rf{
    export class SnakeNode extends Sprite{
        constructor(){
            super();
            this.draw();
        }

        bx = 0;
        by = 0;

        next:SnakeNode;
        record:ISnakeRecord;

        draw(size = 10,color = 0xFF0000){
            let{graphics}=this;
            let half = size / 2;
            graphics.clear();
            // graphics.drawRect(-half,-half,half,half,0xFF0000);
            graphics.drawCircle(0,0,size,undefined,undefined,color);
            graphics.end();
        }

        update(){
            let{record} = this;
            
            if(record.pre){
                this.record = record = record.pre;
            }else{
                return false;
            }
            this.setPos(record.x,record.y);
            return true;
        }
        
    }

    export class SnakeTop extends SnakeNode{

        draw(size = 10,color = 0xFF0000){
           super.draw(size,0xFFFFFF);
        }
    }

    export interface ISnakeRecord{
        x:number;
        y:number;
        // index:number;
        next:ISnakeRecord;
        pre:ISnakeRecord;
    }

    export class Snake extends Sprite implements ITickable{

        top:SnakeTop;
        end:SnakeNode;
        nodeLen = 0;

        recordFirst:ISnakeRecord;
        recordEnd:ISnakeRecord;
        recordLen = 0;
        dx = 0;
        dy = 0;

        direction = 0;

        line:Sprite;

        constructor(){
            super();

            this.top = this.end = new SnakeTop();
            this.addChild(this.top);

            this.line = new Sprite();
            this.addChild(this.line);

            this.recordEnd = this.recordFirst = {x:200,y:200} as ISnakeRecord;
            this.top.record = this.recordFirst;

            // mainKey.regKeyDown(Keybord.UP,this.uphandler,this);
            // mainKey.regKeyDown(Keybord.DOWN,this.downhandler,this);
            // mainKey.regKeyDown(Keybord.LEFT,this.lefthandler,this);
            // mainKey.regKeyDown(Keybord.RIGHT,this.righthandler,this);

            Engine.addTick(this);

            for (let i = 0; i < 1000; i++) {
                this.addNode();
            }


            this.update(0,0);
            
        }

        addNode(){
            let{end,recordFirst,recordEnd} = this;
            let node = new SnakeNode();
            this.addChildAt(node,0);
            end.next = node;
            this.end = node;

            this.nodeLen++;

            for (let i = 0; i < 10; i++) {
                recordEnd = recordEnd.next = {x:recordEnd.x,y:recordEnd.y,pre:recordEnd} as ISnakeRecord; 
                this.recordLen++;
            }

            this.recordEnd = recordEnd;

            node.record = recordEnd;
           
        }


        // uphandler(e:EventX){
        //     this.moveDirection(DEGREES_TO_RADIANS * 270);
        // }

        // downhandler(e:EventX){
        //     this.moveDirection(DEGREES_TO_RADIANS * 90);
        // }

        // lefthandler(e:EventX){
        //     this.moveDirection(DEGREES_TO_RADIANS * 180);
        // }

        // righthandler(e:EventX){
        //     this.moveDirection(0);
        // }


        moveDirection(direction = 0){
            this.direction = direction;
            let x:number,y:number;
            let len = 2;
            x = Math.cos(direction) * len;
            y = Math.sin(direction) * len;
            this.record(x,y);
        }

        record(x:number,y:number){
            let{recordFirst,recordEnd,recordLen,nodeLen}=this;
            let recordNew:ISnakeRecord;
            // if(recordLen > nodeLen * 10 + 20){
                // recordNew = recordEnd;
                // this.recordEnd = recordNew.pre;
                // this.recordEnd.next = undefined;

                // recordEnd.pre = undefined;
                // recordEnd.next = undefined;

            // }else{
                recordNew = {} as ISnakeRecord;
                this.recordLen++;
            // }

            recordNew.x = x + recordFirst.x;
            recordNew.y = y + recordFirst.y;

            recordNew.next = recordFirst;
            // recordNew.index = recordEnd.index + 1;
            recordFirst.pre = recordNew;
            
            this.recordFirst = recordNew;
        }

        update(now: number, interval: number){
            let{top,line,recordFirst} = this;

            let{mouseX,mouseY} = top;

            if(Math.abs(mouseX) > 1 || Math.abs(mouseY) > 1){
                this.moveDirection(Math.atan2(top.mouseY,top.mouseX));
            }

            while(top){
                if(false == top.update()){
                    break;
                }
                top = top.next;
            }
/*
            let{graphics}=line;
            graphics.clear();
            let i = 0;
            // let index = recordFirst.index;
            while(recordFirst){
                graphics.drawRect(recordFirst.x-1,recordFirst.y-1,2,2,0xFFFFFF);
                recordFirst = recordFirst.next;
                // if(recordFirst){
                //     if(recordFirst.index > index){
                //         console.log("???");
                //         break;
                //     }
                //     index = recordFirst.index;
                // }
                // i++

                // if(i > this.nodeLen * 10){
                //     break;
                // }
                
                // if(i++ > 100){
                //     console.log("???");
                //     break;
                // }
            }
            graphics.end();
*/

        }

        

    }

}
//     export class UITest extends Sprite{

//     }

//     export const enum FilterConst{
//         MATRIX_UI = "MatrixUI_"
//     }

//     export class MatrixUIFilter extends FilterBase{
//         static VERTEX =
//  {
//     def:
// `uniform vec4 ui[${max_vc}];
// `,
//     code:
// `vec4 tv = ui[int(uv.z)];
// p.xy = p.xy + tv.xy;
// p.xy = p.xy * tv.zz;
// c.w *= tv.w;
// `
//  } as IShaderCode


//         constructor(){
//             super(FilterConst.MATRIX_UI);
//             this.vertex = UIFilter.VERTEX;
//         }
//     }





//     export class UITestRenderer extends SingleRenderer{
//         constructor(target:Sprite){
//             super(target);
//             let filters = target.filters;
//             filters[FilterConst.BASIC] = singleton(BasicFilter);
//             filters[FilterConst.COLOR] = singleton(ColorFilter);
//             filters[FilterConst.DIFF] = singleton(DiffFilter);
//             filters[FilterConst.MATRIX_UI] = singleton(MatrixUIFilter);
//             filters[FilterConst.MVP] = singleton(MvpFilter);
//         }

//         createProgram(){
//             let shader = singleton(Shader);
//             let target = this.target;
//             this.program = shader.createProgram(target);
//             return this.program;
//         }

//         render(camera:Camera,option:IRenderOption){
//             let target = this.target;
//             let{source,status,scrollRect,sceneTransform,filters} = target;
//             let c = context3D;
//             if(!source || !source.bmd){
//                 return;
//             }

//             if (status & DChange.vertex) {
//                 //数据改变了
//                 let g = target.$graphics;
//                 if(!g || g.numVertices <= 0){
//                     return;
//                 }

//                 let{vertex,vertexBuffer} = this;

//                 let{variables} = target;

//                 if(!vertex){
//                     this.vertex = vertex = new VertexInfo(g.byte,variables.data32PerVertex.size,variables);
//                 }else if(vertexBuffer){
//                     vertex.vertex = g.byte;
//                     vertexBuffer.readly = false;
//                 }

//                 target.$batchGeometry = this;

//                 this.quadcount = g.numVertices / 4;
//                 target.status = 0;
//             }

//             let{vertex,vertexBuffer,program,quadcount} = this;

//             if(!vertex){
//                 return;
//             }

//             if(!vertexBuffer){
//                 this.vertexBuffer = vertexBuffer = c.createVertexBuffer(vertex);
//             }

//             if (!program) {
//                 program = this.createProgram();
//             }


//             var parentRect:Size;
//             if(scrollRect){
//                 parentRect = c.setScissor(scrollRect,sceneTransform[12],sceneTransform[13]);
//             }


//             let worldTransform = TEMP_MATRIX3D;
//             worldTransform.m3_append(camera.worldTranform,false,sceneTransform);

//             c.setProgram(program);
//             source.uploadContext(program,FS.diff);
//             vertexBuffer.uploadContext(program);
//             c.setProgramConstantsFromMatrix(VC.mvp,worldTransform);

//             c.setting.depth = this.depth;
//             c.setting.depthMode = this.depthMode;

//             this.otherParms(c,program);

//             for(let key in filters){
//                 let filter = filters[key];
//                 if(filter && !filter.disable){
//                     filter.setProgramConstants(c,program,target);
//                 }
//             }

//             c.drawTriangles(c.getIndexByQuad(quadcount),quadcount * 2)

            
//             if(scrollRect){
//                 c.lossScissor(parentRect);
//             }
//         }
//     }
// }