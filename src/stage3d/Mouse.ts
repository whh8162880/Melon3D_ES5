///<reference path="./Stage3D.ts" />
module rf{

    export var mouse_current:DisplayObject;

    export interface IMouseElement{
        target:DisplayObject
        time:number;
        down:number;
        up:number;
        click:number;
        over?:number;
        out?:number;
    }

    export interface ITouchlement{
        target:DisplayObject;
        time:number;
        data:IMouseEventData;
        
    }

    export interface IMouseEventData{
        target:DisplayObject;
        time:number;
        identifier:number;
    }

    export class Mouse{

        preMouseTime:number = 0;
        perMoveTime:number = 0;
        preTarget:DisplayObject;

        static currentType:MouseEventX

        mouseElement:{ [key:number]:IMouseEventData } = {};
        

        touchElement:{ [key:number]:ITouchlement } = {};

        eventData:IMouseEventData = {} as IMouseEventData;


        updateNativeMouse(x:number,y:number){
            
            let v = TEMP_VECTOR3D;
            v.x = x * pixelRatio;
            v.y = y * pixelRatio;
            v.z = 0;
            v.w = 1;
            contextInvMatrix.m3_transformVector(v,v);
            nativeMouseX = Math.round(v.x);
            nativeMouseY = Math.round(v.y);

            // let mouseX = (x - canvasleft) * pixelScale;
            // let mouseY = (y - canvastop) * pixelScale;
            // nativeMouseX = mouseX;
            // nativeMouseY = mouseY;
        }

        init(){
            // const{touchElement,mouseElement} = this;
            // mouseElement[0] = {target:undefined,time:0,down:MouseEventX.MouseDown,up:MouseEventX.MouseUp,click:MouseEventX.CLICK};
            // mouseElement[1] = {target:undefined,time:0,down:MouseEventX.MouseMiddleDown,up:MouseEventX.MouseMiddleUp,click:MouseEventX.middleClick};
            // mouseElement[2] = {target:undefined,time:0,down:MouseEventX.MouseRightDown,up:MouseEventX.MouseRightUp,click:MouseEventX.RightClick};
            //10个指头应该够了吧
            // touchElement[0] = {target:undefined,time:0,data:new MouseEventData(0)};
            // touchElement[1] = {target:undefined,time:0,data:new MouseEventData(1)};
            // touchElement[2] = {target:undefined,time:0,data:new MouseEventData(2)};
            // touchElement[3] = {target:undefined,time:0,data:new MouseEventData(3)};
            // touchElement[4] = {target:undefined,time:0,data:new MouseEventData(4)};
            // touchElement[5] = {target:undefined,time:0,data:new MouseEventData(5)};
            // touchElement[6] = {target:undefined,time:0,data:new MouseEventData(6)};
            // touchElement[7] = {target:undefined,time:0,data:new MouseEventData(7)};
            // touchElement[8] = {target:undefined,time:0,data:new MouseEventData(8)};
            // touchElement[9] = {target:undefined,time:0,data:new MouseEventData(9)};

            
            
            // let canvas = ROOT.canvas;
            
            // if(false == mobile){
            //     let canvas = document;
            //     canvas.onmousedown = this.mouseHanlder.bind(this);
            //     canvas.onmouseup = this.mouseHanlder.bind(this);
            //     canvas.onmousewheel = this.mouseHanlder.bind(this);
            //     canvas.onmousemove = this.mouseMoveHandler.bind(this);
            //     canvas.oncontextmenu = function (event){
            //         event.preventDefault();
            //     }
            // }else{
            //     let canvas = ROOT.canvas;
            //     canvas.ontouchstart = this.touchHandler.bind(this);
            //     canvas.ontouchmove = this.touchMoveHandler.bind(this);
            //     canvas.ontouchend = this.touchHandler.bind(this);
            //     canvas.ontouchcancel = this.touchHandler.bind(this);
            // }

            
            wx.onTouchStart(this.onTouchStart.bind(this));
            wx.onTouchMove(this.onTouchMove.bind(this));
            wx.onTouchEnd(this.onTouchEnd.bind(this));
            wx.onTouchCancel(this.onTouchEnd.bind(this));

            if(!weixin){
                window.onmousewheel = this.onMousewheel.bind(this);
            }
            
        }


        onEvent(identifier:number,screenX:number,screenY:number,event:MouseEventX,ctrlKey?:boolean,shiftKey?:boolean,altKey?:boolean,deltaY?:number){

            originMouseX = screenX * pixelRatio;
            originMouseY = screenY * pixelRatio;

            this.updateNativeMouse(screenX,screenY);

            // if(isNaN(nativeMouseX)){
            //     this.updateNativeMouse(screenX,screenY);
            // }
            screenX = nativeMouseX;
            screenY = nativeMouseY;
            

            Mouse.currentType = event;
            
            let now = engineNow;

            let{mouseElement}=this;
            
            let element = mouseElement[identifier];
            if(!element){
                mouseElement[identifier] = element = {identifier} as IMouseEventData;
            }

            element.ctrl = ctrlKey;
            element.shift = shiftKey;
            element.alt = altKey;

            if(event != MouseEventX.MouseMove){

                

                let d:DisplayObject;

                if(this.preMouseTime < now){
                    d = ROOT.getObjectByPoint(screenX,screenY,1);
                    this.preMouseTime = now;
                }else{
                    d = this.preTarget;
                }

                if(!d){
                    d = ROOT;
                }

                mouse_current = d;


                element.x = screenX;
                element.y = screenY;

                if(event == MouseEventX.MouseDown || event == MouseEventX.MouseRightDown || event == MouseEventX.MouseMiddleDown){
                    element.mouseDownX = screenX;                    
                    element.mouseDownY = screenY;
                    element.time = now;
                    element.target = d;
                    d.simpleDispatch(event,element,true);

                    // console.log("mouse::",nativeMouseX,nativeMouseY);

                }else{

                    // console.log(screenX,screenY,this.preMouseTime < now,d);

                    element.ox = screenX - element.x;
                    element.oy = screenY - element.y;
                    element.wheel = deltaY;
                    d.simpleDispatch(event,element,true);
                    if(now - element.time < 500){
                        let len = element.x - element.mouseDownX
                        if(len > 100){
                            d.simpleDispatch(MouseEventX.ROLL_RIGHT,element,true);
                        }else if(len < -100){
                            d.simpleDispatch(MouseEventX.ROLL_LEFT,element,true);
                        }else{
                            len = element.y - element.mouseDownY;
                            if(len > 100){
                                d.simpleDispatch(MouseEventX.ROLL_DOWN,element,true);
                            }else if(len < -100){
                                d.simpleDispatch(MouseEventX.ROLL_UP,element,true);
                            }else{
                                if(element.target == d){

                                    if(event == MouseEventX.MouseRightUp){
                                        d.simpleDispatch(MouseEventX.RightClick,element,true);
                                    }else{
                                        d.simpleDispatch(MouseEventX.CLICK,element,true);
                                        // console.log(nativeMouseX,nativeMouseY,d);
                                    }

                                    
                                }
                            }
                        }
                    }
                    element.target = undefined;
                    element.time = 0;
                    
                }
                
            }else{
                if(this.perMoveTime >= now){
                    return;
                }
                this.perMoveTime = now;

                element.ox = screenX - element.x;
                element.oy = screenY - element.y;
                element.x = screenX;
                element.y = screenY;
                element.wheel = deltaY;
                // console.log(element);

                let d = ROOT.getObjectByPoint(screenX,screenY,1);
                if(!d){
                    d = ROOT;
                }
                d.simpleDispatch(event,element,true);
            }

           

            
        }


        onTouchStart(data:wx.ITouchEventData){
            let{event} = data;
            if(event){
                this.onEvent(event.button,event.x,event.y,MouseEventX.MouseDown + event.button,event.ctrlKey,event.shiftKey,event.altKey);
            }else{
                let{changedTouches}=data;
                for (let i = 0; i < changedTouches.length; i++) {
                    const element = changedTouches[i];
                    this.onEvent(element.identifier,element.clientX,element.clientY,MouseEventX.MouseDown);
                }
            }
        }   

        onTouchEnd(data:wx.ITouchEventData){
            let{event} = data;
            if(event){
                this.onEvent(event.button,event.x,event.y,MouseEventX.MouseUp + event.button,event.ctrlKey,event.shiftKey,event.altKey);
            }else{
                let{changedTouches}=data;
                for (let i = 0; i < changedTouches.length; i++) {
                    const element = changedTouches[i];
                    this.onEvent(element.identifier,element.clientX,element.clientY,MouseEventX.MouseUp);
                }
            }
        }


        onTouchMove(data:wx.ITouchEventData){
            let{event} = data;
            if(event){
                this.onEvent(event.button,event.x,event.y,MouseEventX.MouseMove,event.ctrlKey,event.shiftKey,event.altKey);
            }else{
                let{changedTouches}=data;
                for (let i = 0; i < changedTouches.length; i++) {
                    const element = changedTouches[i];
                    this.onEvent(element.identifier,element.clientX,element.clientY,MouseEventX.MouseMove);
                }
            }
        }

        onMousewheel(event:WheelEvent){
            this.onEvent(event.button,event.x,event.y,MouseEventX.MouseWheel,event.ctrlKey,event.shiftKey,event.altKey,event.deltaY);
        }
    }






































        
        

        

        


    //     mouseHanlder( e ){

    //         if( (e.target instanceof HTMLCanvasElement) == false){
    //             return;
    //         }

    //         let mouse = MouseInstance;

    //         // Mouse.currentType = e.type;

    //         mouse.updateNativeMouse( e.offsetX, e.offsetY);
    //         let mouseX =nativeMouseX;
    //         let mouseY =nativeMouseY;

    //         var d:DisplayObject;
    //         let now = engineNow;
    //         let numType = 0;
    //         let element:IMouseElement;
    //         if(mouse.preMouseTime != now){
    //             mouse.preMouseTime = now;
    //             d = ROOT.getObjectByPoint(mouseX,mouseY,1)
    //         }else{
    //             d = mouse.preTarget;
    //         }
    //         if(undefined == d){
    //            d = ROOT;
    //         }

    //         let data = this.eventData;
    //         data.id = e.button;
    //         data.x = mouseX;
    //         data.y = mouseY;
    //         data.ctrl = e.ctrlKey;
    //         data.alt = e.altKey;
    //         data.shift = e.shiftKey;

    //         let type = e.type;
    //         if(type == "mousedown"){
    //             //判断左右按键
    //             element = mouse.mouseElement[data.id];
    //             data.mouseDownX = mouseX;
    //             data.mouseDownY = mouseY;

    //             element.target = d;
    //             element.time = now;
    //             d.simpleDispatch(element.down,data,true);
    //         }else if(type == "mouseup"){
    //             element = mouse.mouseElement[data.id];
    //             d.simpleDispatch(element.up,event,true);
    //             if(element.target == d && now - element.time < 500){
    //                 d.simpleDispatch(element.click,data,true);
    //             }
    //             element.target = null;
    //             element.time = 0;
    //         }else if(type == "mousewheel"){
    //             data.wheel = e.deltaY
    //             d.simpleDispatch(MouseEventX.MouseWheel,data,true);
    //         }
            

            
    //     }

    //     preRolled:DisplayObject;
	// 	preMouseMoveTime:number;
    //     mouseMoveHandler( e ){

    //         if( (e.target instanceof HTMLCanvasElement) == false){
    //             return;
    //         }

    //         let mouse = MouseInstance;
    //         let now = engineNow;
    //         if(mouse.preMoveTime == now){
    //             return;
    //         }
    //         mouse.preMoveTime = now;

    //         mouse.updateNativeMouse( e.offsetX, e.offsetY);
    //         let mouseX =nativeMouseX;
    //         let mouseY =nativeMouseY;

    //         let d //= ROOT.getObjectByPoint(mouseX,mouseY,1);
    //         if(undefined == d){
    //             d = ROOT;
    //         }

    //         let data = mouse.eventData;
    //         data.id = e.button;
    //         data.x = mouseX;
    //         data.y = mouseY;
    //         data.ctrl = e.ctrlKey;
    //         data.alt = e.altKey;
    //         data.shift = e.shiftKey;
    //         data.ox = (e.movementX || e.mozMovementX || e.webkitMovementX || 0) * pixelRatio;
    //         data.oy = (e.movementY || e.mozMovementY || e.webkitMovementY || 0) * pixelRatio;
    //         d.simpleDispatch(MouseEventX.MouseMove,data,true);

    //     }


    //     touchHandler(e:TouchEvent){
    //         try{
    //             e.preventDefault();
    //         }catch(err){
    //             console.log(e.type,err);
    //         }
            
    //         let mouse = MouseInstance;
    //         const{touchElement:elements,touchLen,touchCenterY:centerY}=mouse;
    //         var touch = e.changedTouches[0];
    //         let touches =  e.touches;
    //         let element:ITouchlement;
    //         let data:IMouseEventData;
    //         // console.log(e.type,touch.identifier);
    //         let now = engineNow;
    //         let d:DisplayObject;

    //         mouse.updateNativeMouse(touch.clientX-canvasleft,touch.clientY-canvastop);

    //         let mouseX = nativeMouseX;
    //         let mouseY = nativeMouseY;

    //         element = elements[touch.identifier];
    //         if(undefined == element){
    //             elements[touch.identifier] =  element = {target:undefined,time:0,data:{id:touch.identifier} as IMouseEventData}
    //         } 
    //         data = element.data;
    //         data.ox = mouseX - data.x;
    //         data.oy = mouseY - data.y;
    //         data.x = mouseX;
    //         data.y = mouseY;

    //         if(touches.length == 2){
    //             const{clientX:x0,clientY:y0}=touches[0];
    //             const{clientX:x1,clientY:y1}=touches[1];
    //             let x = (x0 + x1) / 2;
    //             let y = (y0 + y1) / 2;
    //             let ox = x1 - x0;
    //             let oy = y1 - y0;
    //             let len = Math.sqrt(ox * ox + oy * oy);
    //             mouse.touchCenterY = y;
    //             mouse.touchLen = len;
    //         }

           
    //         if(mouse.preMouseTime != now){
    //             mouse.preMouseTime = now;
    //             d = ROOT.getObjectByPoint(mouseX,mouseY,1)
    //         }else{
    //             d = mouse.preTarget;
    //         }

    //         if(undefined == d){
    //             d = ROOT;
    //         }

    //         if(e.type == "touchstart"){
    //             // if(true == d.mousedown){
    //             //     return;
    //             // }
    //             element.target = d;
    //             element.time = now;
    //             // d.mousedown = true;
    //             d.simpleDispatch(MouseEventX.MouseDown,data,true);
    //         }else{
    //             // if(false == d.mousedown){
    //             //     return;
    //             // }
    //             // d.mousedown = false;
    //             d.simpleDispatch(MouseEventX.MouseUp,data,true);
    //             if(element.target == d && now - element.time < 500){
    //                 d.simpleDispatch(MouseEventX.CLICK,data,true);
    //             }

    //         }

            
    //     }


    //     touchCenterY:number = 0;
    //     touchLen:number = 0;
    //     touchMoveHandler(e:TouchEvent){
    //         e.preventDefault();
    //         let mouse = MouseInstance;
    //         let now = engineNow;
    //         if(mouse.preMoveTime == now){
    //             return;
    //         }
    //         mouse.preMoveTime = now;

    //         let{touchElement:elements,touchCenterY:centerY,touchLen,preTarget}=mouse;
    //         const{touches,changedTouches}=e;
    //         let element:ITouchlement;
    //         let data;
    //         let len = touches.length;
    //         if(len == 1){
    //             let touch = changedTouches[0];
    //             mouse.updateNativeMouse(touch.clientX-canvasleft,touch.clientY-canvastop);
    //             let mouseX = nativeMouseX;
    //             let mouseY = nativeMouseY;
    //             let d = ROOT.getObjectByPoint(mouseX,mouseY,1);
    //             if(undefined != d){
    //                 element = elements[touch.identifier];
    //                 data = element.data;
    //                 data.ox = mouseX - data.x;
    //                 data.oy = mouseY - data.y;
    //                 data.x = mouseX;
    //                 data.y = mouseY;
    //                 d.simpleDispatch(MouseEventX.MouseMove,data,true);
    //             }
    //             return;
    //         }else if(len == 2){
    //             if(undefined == preTarget){
    //                 preTarget = ROOT;
    //             }
    //             const{clientX:x0,clientY:y0}=touches[0];
    //             const{clientX:x1,clientY:y1}=touches[1];
    //             let x = (x0 + x1) / 2;
    //             let y = (y0 + y1) / 2;

    //             let ox = x1 - x0;
    //             let oy = y1 - y0;
    //             len = Math.sqrt(ox * ox + oy * oy);

    //             let dlen = (touchLen-len) / pixelRatio;
    //             oy = (y - centerY) / pixelRatio;

    //             if(Math.abs(dlen) > 1.0){
    //                 //scale
    //                 let data = this.eventData;
    //                 data.x = x;
    //                 data.y = y;
    //                 data.wheel = dlen > 0 ? 120 : -120;
    //                 preTarget.simpleDispatch(MouseEventX.MouseWheel,data,true);
    //                 // console.log( "scale" , dlen.toFixed(2));
    //             }else if(Math.abs(oy) > 1.0){
    //                 let data = this.eventData;
    //                 data.x = x;
    //                 data.y = y;
    //                 data.wheel = oy > 0 ? 120 : -120;
    //                 preTarget.simpleDispatch(MouseEventX.MouseWheel,data,true);
    //                 // console.log( "scale" , dlen.toFixed(2));
    //             }

    //             mouse.touchCenterY = y;
    //             mouse.touchLen = len;

                

    //         }


            
            
            
    //     }
    // }



    // export const MouseInstance = new Mouse();
}

