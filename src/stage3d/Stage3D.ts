///<reference path="./display/Sprite.ts" />
///<reference path="./Context3D.ts" />
///<reference path="./three/Light.ts" />
module rf {

    export class SceneObject extends Sprite implements ITickable {
        scene: Scene;
        shadowCast: boolean;
        shadowTarget:boolean;
        shadowMatrix:IMatrix3D;
        geometry: GeometryBase;
        invSceneTransform: IMatrix3D;

        minBoundingBox:OBB;
        boundingSphere:Sphere;
        distance:number = Number.MAX_VALUE;

        screenY:number;

        constructor(variables?:{ [key: string]: IVariable },mouseEnabled?:boolean,source?:BitmapSource){
            super(source,variables);
            if(mouseEnabled){
                this.minBoundingBox = new OBB();
                this.boundingSphere = new Sphere();
                this.distance = Number.MAX_VALUE;
            }
        }

        update(now: number, interval: number){

        }

        addChild(child: DisplayObject) {
            if (child instanceof SceneObject) {
                let{scene} = this;
                child.scene = scene;
                if(scene){
                    scene.childChange = true;
                }
            }
            super.addChild(child);
        }

        get available(){
            return undefined != this.geometry;
        }


        addChildAt(child: DisplayObject, index: number) {
            if (child instanceof SceneObject) {
                let{scene} = this;
                child.scene = scene;
                if(scene){
                    scene.childChange = true;
                }
            }
            super.addChildAt(child, index);
        }

        removeChild(child: DisplayObject) {
            if (undefined == child) {
                return;
            }
            super.removeChild(child);
            if (child instanceof SceneObject) {
                if(child.scene){
                    child.removeFromStage();
                }
                child.scene = undefined;
                scene.childChange = true;
            }
        }


        removeAllChild() {
            const { childrens } = this;
            let len = childrens.length;
            for (let i = 0; i < len; i++) {
                let child = childrens[i];
                child.stage = undefined;
                child.parent = undefined;
                if (child instanceof SceneObject) {
                    child.scene = undefined;
                }
                child.removeFromStage();
            }
            this.childrens.length = 0;
        }


        removeFromStage() {
            const { childrens } = this;
            let len = childrens.length;
            for (let i = 0; i < len; i++) {
                let child = childrens[i];
                child.stage = undefined
                if (child instanceof SceneObject) {
                    child.scene = undefined;
                }
                child.removeFromStage();
            }
        }


        addToStage() {
            const { childrens, scene, stage } = this;
            let len = childrens.length;
            for (let i = 0; i < len; i++) {
                let child = childrens[i];
                child.stage = stage;
                if (child instanceof SceneObject) {
                    child.scene = scene;
                }
                child.addToStage();
            }
        }

        renderShadow(sun:Light,p:Program3D,c:Context3D,worldTranform:IMatrix3D,now: number, interval: number){
            let{geometry,sceneTransform}=this;
            geometry.vertex.uploadContext(p);
            worldTranform.m3_append(sun.worldTranform,false,sceneTransform);
            c.setProgramConstantsFromMatrix(VC.mvp,worldTranform);
        }


        

        static sphere = new Sphere();
        static ray = new Ray()

        raycast( raycaster:Raycaster, intersects?:IIntersectInfo[]):IIntersectInfo[]{
            let {geometry} = this;

            if(!geometry)return intersects;

            if(this.minBoundingBox == undefined || this.minBoundingBox.change)
            {
                let obb = this.minBoundingBox = OBB.updateOBBByGeometry(geometry, this.minBoundingBox);
                geometry.centerPoint.set([ (obb.minx+obb.maxx)*0.5, (obb.miny+obb.maxy)*0.5, (obb.minz+obb.maxz)*0.5, 1 ] );
            }
            
            if(this.boundingSphere == undefined || this.boundingSphere.change)
            {
                this.boundingSphere = geometry.calculateBoundingSphere(geometry.centerPoint, this.boundingSphere);
            }
            
            let{sphere} = SceneObject;
            //首先检测球
            sphere.copyFrom( this.boundingSphere );
			sphere.applyMatrix4( this.sceneTransform, sphere );

            if ( raycaster.ray.intersectsSphere( sphere ) == false ) {
                return intersects;
            }
            let{ray} = SceneObject;
            ray.copyFrom( raycaster.ray ).applyMatrix4( this.invSceneTransform );

            let intersectPoint = ray.intersectBox( this.minBoundingBox);
            if ( intersectPoint == null) {
                // console.log('2222222222')
                return intersects;
            }

            this.sceneTransform.m3_transformVector(intersectPoint,intersectPoint);

            rf.TEMP_VECTOR3D.set(raycaster.ray.origin);
            rf.TEMP_VECTOR3D.v3_sub(intersectPoint, rf.TEMP_VECTOR3D);

			let distance = rf.TEMP_VECTOR3D.v3_length;

			if ( distance < raycaster.near || distance > raycaster.far ) {
                // console.log('333333333333333')
                return intersects;
            }
            
            intersects = intersects || [];
            intersects.push({"obj":this, "distance": distance, "point":intersectPoint });

            return intersects;
        }
    }

    export class Scene extends SceneObject {
        sun: DirectionalLight;
        childChange: boolean;
        camera: Camera;

        rayCaster:Raycaster;

        constructor(variables?: { [key: string]: IVariable },mouseEnabled?:boolean) {
            super(variables);
            this.scene = this;

            if(mouseEnabled){
                this.hitArea = new HitArea();
                this.hitArea.allWays = true;
                this.rayCaster = new Raycaster(50000);
            }else{
                this.mouseChildren = false;
                this.mouseEnabled = false;
            }

            this.nativeRender = true;
            
        }

        render(camera:Camera,option:IRenderOption){
            let { camera: _camera ,childrens } = this;
            // const { depthMask, passCompareMode, srcFactor, dstFactor, cull } = this.material;
            let c = context3D;
            let g = gl;

            if (undefined == _camera) {
                _camera = camera;
            }

            if (_camera.status) {
                _camera.updateSceneTransform();
            }

            if(childrens.length){
                // this.material.uploadContextSetting();
                super.render(_camera, option);
            }
        }

        getObjectByPoint(dx: number, dy: number,scale:number): SceneObject {

            if(!this.mouseEnabled){
                return;
            }

            if(this.camera == undefined){
                return;
            }

            let v = TEMP_VECTOR3D;
            v.x = originMouseX;
            v.y = originMouseY;
            v.z = 0;
            v.w = 1;
            
            ROOT.cameraUI.len.m3_transformVector(v,v)
            let mx = v[0]//
            let my = v[1]//
            // let {w, h} = this.camera;
            // mx = 2*originMouseX/w - 1;
            // my = -2*originMouseY/h + 1;
            this.rayCaster.setFromCamera(mx, my, this.camera);
            
            let intersects = this.rayCaster.intersectObjects(this.childrens, true);
            if(intersects.length){
                return intersects[0].obj;
            }else{
                return super.getObjectByPoint(dx, dy, scale) as SceneObject;
            }
        }
    }

    export class AllActiveSprite extends Sprite {
        constructor(source?: BitmapSource, variables?: { [key: string]: IVariable }) {
            super(source, variables);
            this.hitArea.allWays = true;
            this.mouseEnabled = false;
        }
    }

    export class NoActiveSprite extends Sprite{
        constructor(source?: BitmapSource, variables?: { [key: string]: IVariable }) {
            super(source, variables);
            this.mouseEnabled = false;
            this.mouseChildren = false;
        }
    }

    export let scene: Scene;
    export let followScene:NoActiveSprite;
    export let floorContainer:NoActiveSprite;
    export let popContainer:AllActiveSprite;
    export let tipContainer:AllActiveSprite;

    export interface IStage3DCamera{
        camera:Camera
        cameraUI:Camera;
        camera2D?:Camera;

        camera3D?:Camera;
        cameraOrth?:Camera;
        cameraPerspective?:Camera;
    }

    export class Stage3D extends AllActiveSprite implements IResizeable,IStage3DCamera {

        canvas: HTMLCanvasElement;
        cameraUI: Camera
        camera2D: Camera;
        // camera3D: Camera;
        // cameraPerspective:Camera;
        camera: Camera;
        renderLink: Link;
        shadow:ShadowEffect;
        constructor() {
            super();
            // this.cameraUI = new Camera();
            // this.camera2D = new Camera();
            // this.camera3D = new Camera();
            // this.cameraPerspective = new Camera(100000);            
            this.renderer = new SuperBatchRenderer(this);
            this.shadow = new ShadowEffect(2300,3000);
            this.renderLink = new Link();
            // this.camera = this.cameraUI;
            this.stage = this;
        }



        /**
         * 
         * @param canvas 下文属性(contextAttributes)
            你可以在创建渲染上下文的时候设置多个属性，例如:

            canvas.getContext("webgl", 
                            { antialias: false,
                            depth: false });
            2d 上下文属性:
                alpha: boolean值表明canvas包含一个alpha通道. 如果设置为false, 浏览器将认为canvas背景总是不透明的, 这样可以加速绘制透明的内容和图片.
                (Gecko only) willReadFrequently: boolean值表明是否有重复读取计划。经常使用getImageData()，这将迫使软件使用2D canvas 并 节省内存（而不是硬件加速）。这个方案适用于存在属性 gfx.canvas.willReadFrequently的环境。并设置为true (缺省情况下,只有B2G / Firefox OS).
                (Blink only) storage: string 这样表示使用哪种方式存储(默认为：持久（"persistent"）).
            WebGL上下文属性:
                alpha: boolean值表明canvas包含一个alpha缓冲区。
                depth: boolean值表明绘制缓冲区包含一个深度至少为16位的缓冲区。
                stencil: boolean值表明绘制缓冲区包含一个深度至少为8位的模版缓冲区。
                antialias: boolean值表明是否抗锯齿。
                premultipliedAlpha: boolean值表明页面排版工人将在混合alpha通道前承担颜色缓冲区。
                preserveDrawingBuffer: 如果这个值为true缓冲区将不会清除它，会保存下来，直到被清除或被使用者覆盖。
                failIfMajorPerformanceCaveat: boolean值表明在一个系统性能低的环境创建该上下文。
         */
        names = [  "webgl", "experimental-webgl","webkit-3d", "moz-webgl"];
        requestContext3D(canvas: HTMLCanvasElement): boolean {
            this.canvas = canvas;
            let contextAttributes:any = {};
            if(isMobile){
                contextAttributes.antialias = false;
            }else{
                contextAttributes.antialias = true;
            }

            contextAttributes.stencil = false;
            contextAttributes.depth = true;

            let {names} = this;
            for (let i = 0; i < names.length; i++) {
                try {
                    gl = this.canvas.getContext(names[i],contextAttributes) as WebGLRenderingContext;
                } catch (e) {

                }
                if (gl) {
                    break;
                }
            }

            if (undefined == gl) {
                context3D = null;
                this.simpleDispatch(EventT.ERROR, "webgl is not available");
                return false;
            }

            context3D = singleton(Context3D);
            singleton(Mouse).init();

            // Capabilities.init();
            // mainKey.init();
            // KeyManagerV2.resetDefaultMainKey();

            this.simpleDispatch(EventT.CONTEXT3D_CREATE, gl);
            return true;
        }

        renderOption = {} as IRenderOption;


        //在这里驱动渲染
        update(now: number, interval: number): void {

            // if(now != -1){
            //     return;
            // }

            if (this.status & DChange.ct) {
                super.updateSceneTransform(0);
            }

            let{renderLink,shadow,renderOption,camera} = this;
            if (shadow && scene.childChange) {
                renderLink.onRecycle();
                this.filterRenderList(scene,renderLink);
                scene.childChange = false;
            }
            let c = context3D;
            c.dc = 0;
            c.triangles = 0;
            c.clear(0, 0, 0, 1);

            if(shadow && renderLink.length){
                shadow.render(renderLink,scene.sun,now,interval);
            }

            renderOption.now = now;
            renderOption.interval = interval;

            if (camera.status) {
                camera.updateSceneTransform();
            }
            
            
            this.render(this.camera, renderOption);

        }

        resize(width: number, height: number) {

            this.w = width;
            this.h = height;
            
            let {camera2D,cameraUI,camera3D,cameraOrth,cameraPerspective} = this as IStage3DCamera;
            if(cameraUI){
                CameraUIResize(width,height,cameraUI.len,cameraUI.far,cameraUI.originFar,cameraUI);
            }

            if(camera2D){
                CameraUIResize(width,height,camera2D.len,camera2D.far,camera2D.originFar,camera2D);
            }

            if(camera3D){
                Camera3DResize(width,height,camera3D.len,camera3D.far,camera3D.originFar,camera3D);
            }

            if(cameraOrth){
                CameraOrthResize(width,height,cameraOrth.len,cameraOrth.far,cameraOrth.originFar,cameraOrth);
            }
            
            if(cameraPerspective){
                PerspectiveResize(width,height,cameraPerspective.len,cameraPerspective.far,40,cameraPerspective)
            }
        }


        filterRenderList(d: SceneObject,link:Link) {
            let { childrens } = d;
            let len = childrens.length;
            for (let i = 0; i < len; i++) {
                let m = childrens[i] as SceneObject;
                if(m.available && (m.shadowTarget || m.shadowCast)){
                    link.add(m);
                }
                this.filterRenderList(m,link);
            }
        }

        getObjectByPoint(dx: number, dy: number,scale:number){
            return super.getObjectByPoint(dx+this._x,dy+this._y,scale);
        }
    }

    export class ShadowEffect{
        w:number;
        h:number;
        rtt:RTTexture;
        m:ShadowMaterial;
        len:IMatrix3D;
        constructor(w:number,h:number){
            this.w = w;
            this.h = h;
            this.m = new ShadowMaterial();
            this.m.setData(undefined);
            this.len = newMatrix3D();
            // let c = ROOT.cameraPerspective;
            // PerspectiveResize(w,h,this.len,10000,15);
            // Camera3DResize(w,h,this.len,10000,10000/Math.PI2);
            CameraOrthResize(w,h,this.len,10000,10000/Math.PI2);
        }

        render(link:Link,sun:DirectionalLight,now:number,interval:number){
            let{m,rtt,len,w,h} = this;
            if(sun.status || sun.len != len){
                sun.len = len;
                sun.updateSceneTransform();
            }
           
            let c = context3D;

            if(!rtt){
                this.rtt = rtt = c.createRttTexture(c.getTextureData("ShadowMaterial"),2048,2048);
                rtt.cleanColor = toRGBA(0xFFFFFFFF);
                rtt.setting.src = WebGLConst.ONE;
            }

            // c.configureBackBuffer(w,h,0);

            let g = gl;
            c.setRenderToTexture(rtt,false);

            // c.setDepthTest(false,g.ALWAYS);
            // g.frontFace(g.CW);

            let{passCompareMode,cull,program}=m;

           
            // c.setDepthTest(false,passCompareMode);
            // c.setCulling(cull);
            // c.setProgram(program);
            
            let worldTranform = rf.TEMP_MATRIX3D;

            g.disable(g.BLEND);

            for(let vo = link.getFrist();vo;vo = vo.next){
                if(vo.close == false){
                    let obj = vo.data as Mesh;
                    let{shadowCast: shadowable,shadowTarget,geometry,shadowMatrix,sceneTransform}=obj;
                    
                    if(shadowable){
                        m.uploadContext(sun,obj,now,interval);
                        let p = m.program;
                        obj.renderShadow(sun,p,c,worldTranform,now,interval);
                        c.drawTriangles(geometry.index,geometry.numTriangles,rtt.setting);
                    }

                    if(shadowTarget){
                        if(!shadowMatrix){
                            obj.shadowMatrix = shadowMatrix = newMatrix3D();
                        }
                        shadowMatrix.m3_append(sun.worldTranform,false,sceneTransform);
                    }
                }
            }
            // let matrix = TEMP_MATRIX;
            // matrix.m3_scale(w / stageWidth,h / stageHeight,1);
            // matrix.m3_identity();
            // this.debugImage.render(undefined,matrix);
            c.setRenderToBackBuffer();
            // g.frontFace(g.CCW);
            // c.configureBackBuffer(stageWidth,stageHeight,0);

            g.enable(g.BLEND);
            
        }
    }

    export class PassContainer extends RenderBase {

        camera: Camera
        constructor(variables?: { [key: string]: IVariable }) {
            super(variables);
            this.hitArea = new HitArea();
            this.hitArea.allWays = true;
        }

        render(camera:Camera,option:IRenderOption) {
            let { camera: _camera } = this;
            // const { depthMask, passCompareMode, srcFactor, dstFactor, cull } = this.material;
            let c = context3D;
            let g = gl;

            if (undefined == _camera) {
                _camera = camera;
            }

            if (_camera.status) {
                _camera.updateSceneTransform();
            }

            this.material.uploadContextSetting();

            // let{setting}=c;
            // setting.cull = cull;
            // setting.depth = depthMask;
            // setting.depthMode = passCompareMode;
            // setting.src = srcFactor;
            // setting.dst = dstFactor;

            super.render(_camera, option);
        }
    }

    export class UIContainer extends AllActiveSprite {
        render(camera:Camera,option:IRenderOption): void {
            const { cameraUI } = ROOT;

            if (cameraUI.status) {
                cameraUI.updateSceneTransform();
            }
            this.material.uploadContextSetting();

            super.render(cameraUI, option);
        }
    }




   
    export function getChildrenCount(d:DisplayObjectContainer){
        let count = 0;
        d.childrens.forEach(child => {
            count ++;
            if(child instanceof DisplayObjectContainer){
                count += this.getChildrenCount(child);
            }
        });
        return count;
    }

}