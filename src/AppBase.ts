/// <reference path="./reference.ts" />
/// <reference path="./components/rfreference.ts" />
/// <reference path="./stage3d/Stage3D.ts" />
module rf {

    // const enum EVENT_TYPE {
    //     // addToStage to listener and removeFromStage to removeListener
    //     DISPLAY,
    //     //always regist facadeDispatchEvent
    //     ALWAYS
    // }

    // function EVENT(level:EVENT_TYPE, ...types: (string|number)[]){
    //     return function (target,propertyKey){
            
    //     }
    // }

    export let logging:boolean = true;
    export function log(msg:string){
        if(!weixin && logging){
            wx.showLog(true);
            wx.log(msg);
        }
    }


    export class AppBase implements ITickable,IResizeable{

        nextGCTime:number;
        gcDelay:number = 3000;
        constructor() {
            contextMatrix2D = newMatrix3D();
            contextMatrix3D = newMatrix3D();
            contextInvMatrix = newMatrix3D();
            this.createSource();
            Engine.start();
            ROOT = singleton(Stage3D);
            this.initROOT();


            if(!weixin){
                ROOT.on(MouseEventX.ROLL_DOWN, this.rolldownHandler, this);
                ROOT.on(MouseEventX.ROLL_UP, this.rollupHandler, this);
            }
        }

        rolldownHandler(event:EventX){
            let{mouseDownY} = event.data as IMouseEventData;
            if(mouseDownY < 50){
                wx.showLog(true);
            }


            
        }

        rollupHandler(event:EventX){
            let{mouseDownY} = event.data as IMouseEventData;
            if(mouseDownY < 200){
                wx.showLog(false);
            }
            
        }


        init(canvas:HTMLCanvasElement){

            wx.no_maincanvas = canvas;

            var b:boolean = ROOT.requestContext3D(canvas);
            if(false == b){
                console.log("GL create fail");
                return;
            }
            
            this.initCanvas(canvas);
            this.initContainer(ROOT.camera2D,true);
            
            state_Setup()
            mainKey.init()

            Engine.addResize(this);
            Engine.addTick(this);

            let c = context3D;

            pass_init_mesh();

            ROOT.addEventListener(EngineEvent.FPS_CHANGE,this.gcChangeHandler,this);
            this.nextGCTime = engineNow + this.gcDelay;
        }

        initCanvas(canvas:HTMLCanvasElement){

        }

        createSource(){

            let info = wx.getSystemInfoSync();
            isMobile = info.platform != "pc";
            platform = info.platform;

			sceneWidth = info.screenWidth;
			sceneHeight = info.screenHeight;

			windowWidth = info.windowWidth;
			windowHeight = info.windowHeight;

            pixelRatio = info.pixelRatio;
            

            // panels= singleton(PanelSourceManage)
            componentSource = createBitmapSource("component",1024,1024,true);
            textSource = createBitmapSource("textsource",1024,1024,true);

            ComponentClass = {
                0 : Component,
                1 : TextField,
                2 : Button,
                3 : CheckBox,
                4 : RadioButton,
                5 : ScrollBar,
                6 : Component,
                7 : ProgressBar
            }

            ScriptTweenIns = {
                "pro"   : STweenPro,
                "scale" : STweenBase,
                "alpha" : STweenBase,
                "liner" : STweenLiner
            }

        }

        initROOT(){
            let r = ROOT;
            r.camera2D = new Camera();
            r.camera = r.cameraUI = new Camera();
        }


        initContainer(sceneCamera?:Camera,sceneMouse?:boolean){
            let g = gl;
            let container = new Scene(vertex_mesh_variable,sceneMouse);
            // let material = new Material();
            let isFragDepthAvailable = g.getExtension("EXT_frag_depth");
            context3D.use_logdepth_ext = isFragDepthAvailable ? true : false;
            // context3D.use_logdepth_ext = false;
            // material.depthMask = true;
            // material.passCompareMode = WebGLConst.LEQUAL;
            // material.srcFactor = WebGLConst.SRC_ALPHA;
            // material.dstFactor = WebGLConst.ONE_MINUS_SRC_ALPHA;;
            // material.cull = WebGLConst.NONE;;
            // container.material = material;
            container.camera = sceneCamera;
            
            scene = container;
            
            let uiContainer = new UIContainer(undefined,vertex_ui_variable);
            uiContainer.renderer = new SuperBatchRenderer(uiContainer);
            let material = new Material();
            material.depthMask = false;
            material.passCompareMode = WebGLConst.ALWAYS;
            material.srcFactor = WebGLConst.SRC_ALPHA;
            material.dstFactor = WebGLConst.ONE_MINUS_SRC_ALPHA;
            material.cull = WebGLConst.NONE;
            uiContainer.material = material;
            
            

            floorContainer = new NoActiveSprite();
            popContainer = new AllActiveSprite();
            tipContainer = new AllActiveSprite();

            popContainer.mouseEnabled = false;
            tipContainer.mouseEnabled = false;

            ROOT.addChild(container);
            ROOT.addChild(uiContainer);
            uiContainer.addChild(floorContainer);
            uiContainer.addChild(popContainer);
            uiContainer.addChild(tipContainer);
        }


        update(now: number, interval: number): void {
            ROOT.update(now,interval);
            tweenUpdate();
        }

        resize(width:number,height:number){
            let c = context3D;
            context3D.configureBackBuffer(innerWidth,innerHeight,0);
            ROOT.resize(innerWidth,innerHeight);
            if(lockStageArea){
                //更新root的裁剪区域
                ROOT.setScrollRect(offsetResize.stageWidth, offsetResize.stageHeight);
            }
        }


        gcChangeHandler(event:EventX){
            let{nextGCTime,gcDelay}=this;
            let now = engineNow;
            if(now > nextGCTime){
                context3D.gc(now);
                http_gc(now);
                this.nextGCTime+=gcDelay
            }
        }
        
    }
}

// declare var global;
// if(typeof global != "undefined"){
//     global["rf"] = rf;global["rf_v3_identity"] = rf_v3_identity;global["rf_m3_identity"] = rf_m3_identity;global["rf_m2_identity"] = rf_m2_identity;global["rf_m3_temp"] = rf_m3_temp;
// }