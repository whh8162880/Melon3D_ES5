///<reference path="../../reference.ts" />
module rf {
    export var ROOT: Stage3D & IStage3DCamera;

    export interface IMouse {
        mouseEnabled?:boolean,
        mouseChildren?:boolean,
        getObjectByPoint?(dx: number, dy: number,scale:number): DisplayObject
    }

    export interface IRenderOption{
        now:number;
        interval:number;
        rect:Size;
    }

    export interface I3DRender extends IRecyclable {
        render?(camera:Camera,option:IRenderOption):void;
        __render_pre?:I3DRender;
        __render_next?:I3DRender;
        __graphics_next?:Sprite;
        $graphics?:Graphics;
        $vcIndex?:number;
        $sourceIndex?:number;
        program?:Program3D;
        changeStatus?:number
        invSceneTransfrom?:IMatrix3D;
        updateBatchVCData?(refresh:boolean):void;
    }


    export const enum DChange {
        trasnform = 0b1,
        alpha = trasnform << 1,
        vertex = alpha << 1,
        vcdata = vertex << 1,
        //底层transfrom改变
        ct = vcdata << 1,
        area = ct << 1,
        //底层htiArea改变
        ca = area << 1,
        c_all = (ct | ca),  
        ac = (area | ca),
        ta = (trasnform | alpha),
        batch = (vertex | vcdata),
        base = (trasnform | alpha | area | ct),
        /**
         *  自己有transform变化 或者 下层有transform变化
         */
        t_all = (trasnform | alpha | ct),
    }


    export class HitArea {

        allWays:boolean
        left: number = 0;
        right: number = 0;
        top: number = 0;
        bottom: number = 0;
        front: number = 0;
        back: number = 0;
        clean(){
            this.left = this.right = this.top = this.bottom = this.front = this.back = 0;
        }

        combine(hitArea:HitArea,x:number,y:number):boolean{
            let b = false;
            if(hitArea == undefined)
            {
                return b;
            }
            if(this.left > hitArea.left+x){
                this.left = hitArea.left+x;
                b = true;
            }

            if(this.right < hitArea.right+x){
                this.right = hitArea.right+x;
                b = true;
            }

            if(this.top > hitArea.top+y){
                this.top = hitArea.top+y;
                b = true;
            }

            if(this.bottom < hitArea.bottom+y){
                this.bottom = hitArea.bottom+y;
                b = true;
            }

            if(this.front > hitArea.front){
                this.front = hitArea.front;
                b = true;
            }

            if(this.back < hitArea.back){
                this.back = hitArea.back;
                b = true;
            }
            return b
        }

        updateArea(x: number, y: number, z: number): boolean {
            let b = false;
            if (this.left > x) {
                this.left = x;
                b = true;
            } else if (this.right < x) {
                this.right = x;
                b = true;
            }

            if (this.top > y) {
                this.top = y;
                b = true;
            } else if (this.bottom < y) {
                this.bottom = y;
                b = true;
            }

            if (this.front > z) {
                this.front = z;
                b = true;
            } else if (this.back < z) {
                this.back = z;
                b = true;
            }

            return b;
        }
        checkIn(x: number, y: number, scale: number = 1): boolean {
            if(this.allWays){
                return true;
            }

            if (x > this.left * scale && x < this.right * scale && y > this.top * scale && y < this.bottom * scale) {
                return true;
            }
            return false;
        }

        scale(value:number){
            this.left *= value;
            this.right *= value;
            this.top *= value;
            this.bottom *= value;
        }

        toString(): string {
            return `HitArea left:${this.left} right:${this.right} top:${this.top} bottom:${this.bottom} front:${this.front} back:${this.back}`
        }
    }

    export class DisplayObject extends MiniDispatcher implements IMouse {
        pool: RecyclablePool<DisplayObject>
        hitArea: HitArea;
        mouseEnabled:boolean = true;
        mouseChildren:boolean = true;
        mousedown:boolean = false;
		mouseroll:boolean = false;
        pos: IVector3D;
        rot: IVector3D;
        sca: IVector3D;
        up:IVector3D = newVector3D(0,1,0);

        /**
         * 没用的变量
         */
        __childIndex:number; 

        _x: number = 0;
        _y: number = 0;
        _z: number = 0;

        w: number = 0;
        h: number = 0;

        _rotationX: number = 0;
        _rotationY: number = 0;
        _rotationZ: number = 0;

        _scaleX: number = 1;
        _scaleY: number = 1;
        _scaleZ: number = 1;
        _alpha: number = 1;

        sceneAlpha: number = 1;

        _visible: boolean = true;
        status: number = 0;

        pivotZero: boolean = false;
        pivotPonumber: IVector3D;
        transform: IMatrix3D;
        sceneTransform: IMatrix3D;
        parent: DisplayObjectContainer;
        stage: Stage3D;
        name: string;

        locksize:boolean = false;

        tween:ScriptTween;

        filters:{[key:string]:FilterBase} = {}

        trandom:number;

        constructor() {
            super();
            this.pos = newVector3D();
            this.rot = newVector3D();
            this.sca = newVector3D(1,1,1);
            this.transform = newMatrix3D();
            this.sceneTransform = newMatrix3D();
            this.trandom = Math.random()
        }

        /**
         * 逻辑规则
         * 改变对象 transform  alpha   vertexData  vcData  hitArea
         * 1.transform alpha 改变需要递归计算 并且上层是需要下层有改变的 引申出 ct 对象 childTranformORAlphaChange
         * 2.vertexData vcData 是要让batcher知道数据改变了 本层不需要做任何处理
         * 3.hitArea 改变 需要递归计算，引申出 ca对象 childHitAreaChange
         */
        setChange(value: number, p: number = 0, c: boolean = false) {
            //batcher相关的都和我无关
            this.status |= (value & ~DChange.batch);    //本层不需要batcher对象识别
            if (undefined != this.parent) {
                if(value & DChange.ta){
                    value |= DChange.ct;                //如果本层transform or alpha 改变了 那就得通知上层
                }
                if(value & DChange.area){
                    value |= DChange.ca;                //如果本层hitArea改变了 那就得通知上层
                }
                this.parent.setChange(/*给batcher用的*/value & DChange.batch, /*给顶层通知说下层有情况用的*/value & DChange.c_all, true);
            }
        }

        get visible(): boolean { return this._visible; }
        set visible(value: boolean) {
            if (this._visible != value) {
                this._visible = value;
                this.setChange(DChange.vertex)
            }
        }

        set alpha(value: number) {
            if (this._alpha == value) {
                return;
            }

            let vertex = 0

            if (this._alpha <= 0 || value == 0) {
                vertex |= DChange.vertex;
            }

            this._alpha = value;
            this.setChange(vertex | DChange.alpha | DChange.vcdata);
            // this.setChange(DChange.alpha);
        }

        get alpha(): number {
            return this._alpha;
        }

        get scaleX(): number { return this._scaleX; }
        set scaleX(value: number) {
            if (this._scaleX == value) return;
            this._scaleX = value;
            this.sca.x = value;
            this.setChange(DChange.trasnform | DChange.vcdata);
        }
        get scaleY(): number { return this._scaleY; }
        set scaleY(value: number) { this._scaleY = value; this.sca.y = value; this.setChange(DChange.trasnform); }
        get scaleZ(): number { return this._scaleZ; }
        set scaleZ(value: number) { this._scaleZ = value; this.sca.z = value; this.setChange(DChange.trasnform); }
        get rotationX(): number { return this._rotationX * RADIANS_TO_DEGREES; }
        get rotationY(): number { return this._rotationY * RADIANS_TO_DEGREES; }
        get rotationZ(): number { return this._rotationZ * RADIANS_TO_DEGREES; }


        set rotationX(value: number) {
            value %= 360; value *= DEGREES_TO_RADIANS;
            if (value == this._rotationX) return;
            this._rotationX = value; this.rot.x = value; this.setChange(DChange.trasnform);
        }
        set rotationY(value: number) {
            value %= 360; value *= DEGREES_TO_RADIANS;
            if (value == this._rotationY) return;
            this._rotationY = value; this.rot.y = value; this.setChange(DChange.trasnform);
        }
        set rotationZ(value: number) {
            value %= 360; value *= DEGREES_TO_RADIANS;
            if (value == this._rotationZ) return;
            this._rotationZ = value; this.rot.z = value; this.setChange(DChange.trasnform);
        }


        get rotation():number{
            return this._rotationZ * RADIANS_TO_DEGREES;
        }
        
        set rotation(value:number){
            value %= 360; value *= DEGREES_TO_RADIANS;
            if (value == this._rotationZ) return;
            this._rotationZ = value; this.rot.z = value; this.setChange(DChange.trasnform);
        }
        

        get x(): number { return this._x; }
        get y(): number { return this._y; }
        get z(): number { return this._z; }

        set x(value: number) {
            if (value == this._x) return;
            this._x = value; this.pos.x = value;
            this.setChange(DChange.trasnform | DChange.vcdata);
        }
        set y(value: number) {
            if (value == this._y) return;
            this._y = value; this.pos.y = value;
            this.setChange(DChange.trasnform | DChange.vcdata);
        }
        set z(value: number) {
            if (value == this._z) return;
            this._z = value; this.pos.z = value;
            this.setChange(DChange.trasnform);
        }


        setPos(x: number, y: number, z: number = 0, update: Boolean = true) {
            if(this._x == x && this._y == y && this._z == z) return;
            this.pos.x = this._x = x;
            this.pos.y = this._y = y;
            this.pos.z = this._z = z;
            if (update) {
                this.setChange(DChange.trasnform | DChange.vcdata);
            }
        }

        set eulers(value:IVector3D) {
            this._rotationX = value.x * DEGREES_TO_RADIANS;
            this._rotationY = value.y * DEGREES_TO_RADIANS;
            this._rotationZ = value.z * DEGREES_TO_RADIANS;
            this.setChange(DChange.trasnform);
        }



		/**
		 * 当前方向Z轴移动
		 * @param distance
		 * 
		 */
        forwardPos(distance: number, target?:IVector3D): void {
            const{pos}=this;
            this.transform.m3_copyColumnTo(2, tempAxeX);
            tempAxeX.v3_normalize();
            if (undefined != target) {
                pos.x = -tempAxeX.x * distance + target.x;
                pos.y = -tempAxeX.y * distance + target.y;
                pos.z = -tempAxeX.z * distance + target.z;
            } else {
                pos.x += tempAxeX.x * distance;
                pos.y += tempAxeX.y * distance;
                pos.z += tempAxeX.z * distance;
            }
            this._x = pos.x;
            this._y = pos.y;
            this._z = pos.z;
            this.setChange(DChange.trasnform | DChange.vcdata);
        }


		/**
		 * 当前方向Y轴移动
		 * @param distance
		 * 
		 */
        upPos(distance: number): void {
            this.transform.m3_copyColumnTo(1, tempAxeX);
            tempAxeX.v3_normalize();
            this.pos.x += tempAxeX.x * distance;
            this.pos.y += tempAxeX.y * distance;
            this.pos.z += tempAxeX.z * distance;
            this._x = this.pos.x;
            this._y = this.pos.y;
            this._z = this.pos.z;
            this.setChange(DChange.trasnform | DChange.vcdata);
        }


		/**
		 * 当前方向X轴移动
		 * @param distance
		 * 
		 */
        rightPos(distance: number): void {
            this.transform.m3_copyColumnTo(0, tempAxeX);
            tempAxeX.v3_normalize();
            this.pos.x += tempAxeX.x * distance;
            this.pos.y += tempAxeX.y * distance;
            this.pos.z += tempAxeX.z * distance;
            this._x = this.pos.x;
            this._y = this.pos.y;
            this._z = this.pos.z;
            this.setChange(DChange.trasnform | DChange.vcdata);
        }

		/**
		 * 
		 * @param rx
		 * @param ry
		 * @param rz
		 * 
		 */
        setRot(rx: number, ry: number, rz: number, update: Boolean = true): void {
            this.rot.x = this._rotationX = rx * DEGREES_TO_RADIANS;
            this.rot.y = this._rotationY = ry * DEGREES_TO_RADIANS;
            this.rot.z = this._rotationZ = rz * DEGREES_TO_RADIANS;
            if (update) {
                this.setChange(DChange.trasnform);
            }
        }


		/**
		 * 
		 * @param rx
		 * @param ry
		 * @param rz
		 * 
		 */
        setRotRadians(rx: number, ry: number, rz: number, update: Boolean = true): void {
            this.rot.x = this._rotationX = rx;
            this.rot.y = this._rotationY = ry;
            this.rot.z = this._rotationZ = rz;
            if (update) {
                this.setChange(DChange.trasnform);
            }
        }

        set scale(value: number) {
            this.setSca(value, value, value);
        }

        get scale(): number {
            let{_scaleX,_scaleY,_scaleZ} = this;
            if (_scaleX == _scaleY && _scaleX == _scaleZ) {
                return _scaleX;
            }
            return Math.min(_scaleX,_scaleY,_scaleZ);
        }

        setSca(sx: number, sy: number, sz: number, update: Boolean = true): void {
            this.sca.x = this._scaleX = sx;
            this.sca.y = this._scaleY = sy;
            this.sca.z = this._scaleZ = sz;
            if (update) {
                this.setChange(DChange.trasnform | DChange.vcdata);
            }
        }



        setPivotPonumber(x: number, y: number, z: number): void {
            if (undefined == this.pivotPonumber) { this.pivotPonumber = newVector3D() };
            this.pivotPonumber.x = x;
            this.pivotPonumber.y = y;
            this.pivotPonumber.z = z;
            this.pivotZero = (x != 0 || y != 0 || z != 0);
        }


        setTransform(matrix:ArrayLike<number>): void {
            const{transform,pos,rot,sca}=this;
            transform.set(matrix);
            transform.m3_decompose(pos,rot,sca,Orientation3D.EULER_ANGLES);
            this._x = pos.x;
            this._y = pos.y;
            this._z = pos.z;

            this._rotationX = rot.x;
            this._rotationY = rot.y;
            this._rotationZ = rot.z;

            this._scaleX = sca.x;
            this._scaleY = sca.y;
            this._scaleZ = sca.z;

            this.setChange(DChange.trasnform | DChange.vcdata);
        }




		/**
		 * 
		 */
        updateTransform() {
            const{transform,pivotZero}=this;
            if (pivotZero) {
                const{pivotPonumber}=this;
                let{0:x,1:y,2:z}=pivotPonumber;
                transform.m3_identity();
                // transform.m3_translation(pivotPonumber.x, pivotPonumber.y, pivotPonumber.z);
                transform.m3_translation(-x,-y,-z);
                transform.m3_scale(this._scaleX, this._scaleY, this._scaleZ);
                transform.m3_translation(this._x+x, this._y+y, this._z + z);
            } else {
                transform.m3_recompose(this.pos,this.rot,this.sca)
            }

            this.status &= ~DChange.trasnform;
        }

		/**
		 * 
		 * 
		 */
        updateSceneTransform(updateStatus = 0,parentSceneTransform?:IMatrix3D) {
            let{status,parent} = this;
            if(status & DChange.trasnform){
                this.updateTransform();
                updateStatus |= DChange.trasnform;
            }

            if(status & DChange.alpha){
                updateStatus |= DChange.alpha;
                this.status &= ~DChange.alpha;
            }

            if(updateStatus & DChange.trasnform){
                if(parentSceneTransform){
                    this.sceneTransform.m3_append(parentSceneTransform,false,this.transform);
                }else{
                    if(parent){
                        this.sceneTransform.m3_append(parent.sceneTransform,false,this.transform);
                    }else{
                        this.sceneTransform.set(this.transform);
                    }
                }
            }

            if(updateStatus & DChange.alpha){
                if(parent){
                    this.sceneAlpha = parent.sceneAlpha * this._alpha;
                }else{
                    this.sceneAlpha = this._alpha;
                }
            }

            return updateStatus;
        }

        updateBatchVCData(){}

        remove(): void {
            if (this.parent) {
                this.parent.removeChild(this);
            }
        }

        addToStage(): void { };
        removeFromStage(): void { };

        setSize(width: number, height: number): void {
            this.locksize = true;
            this.w = width;
            this.h = height;
            callLater.add(this.doResize,this);
        }

        protected doResize(): void { } 

        //==============================================================
        dispatchEvent(event: EventX): boolean {
            var bool: boolean = false;
            let{parent} = this;
            if (undefined != this.mEventListeners && event.type in this.mEventListeners) {
                bool = super.dispatchEvent(event);
            }

            if(parent && (false == event.stopImmediatePropagation && event.bubbles)){
                parent.dispatchEvent(event);
            }
            
            return bool;
        }

        updateHitArea(){
            this.status &= ~DChange.ac;
        }

        getObjectByPoint(dx: number, dy: number,scale:number): DisplayObject {
            let area = this.hitArea;
            if (undefined == area) {
                return undefined;
            }
            if(area.checkIn(dx, dy, this._scaleX * scale) == true){
                return this;
            }

            return undefined;
        }


        get mouseX():number{
            return nativeMouseX - this.sceneTransform[12];
        }

        get mouseY():number{
            return nativeMouseY - this.sceneTransform[13];
        }

        get stageX():number{
            return this.sceneTransform[12]
        }
        
        get stageY():number{
            return this.sceneTransform[13]
        }


        render(camera:Camera,option:IRenderOption){

        }

        lookat(target: IVector3D, upAxis:IVector3D=null){
			let xAxis = tempAxeX;
			let yAxis = tempAxeY;
            let zAxis = tempAxeZ;
            
            const{transform,_scaleX,_scaleY,_scaleZ,_x,_y,_z,rot}=this;
            
            if(undefined == upAxis){
                upAxis = Y_AXIS;
            }
			
			
			zAxis.x = target.x - _x;
			zAxis.y = target.y - _y;
			zAxis.z = target.z - _z;
			zAxis.v3_normalize();
			
			xAxis.x = upAxis.y*zAxis.z - upAxis.z*zAxis.y;
			xAxis.y = upAxis.z*zAxis.x - upAxis.x*zAxis.z;
			xAxis.z = upAxis.x*zAxis.y - upAxis.y*zAxis.x;
			xAxis.v3_normalize();
			
			if (xAxis.v3_length < .05) {
				xAxis.x = upAxis.y;
				xAxis.y = upAxis.x;
				xAxis.z = 0;
				xAxis.v3_normalize();
			}
			
			yAxis.x = zAxis.y*xAxis.z - zAxis.z*xAxis.y;
			yAxis.y = zAxis.z*xAxis.x - zAxis.x*xAxis.z;
			yAxis.z = zAxis.x*xAxis.y - zAxis.y*xAxis.x;
			
			let raw = transform;
			
			raw[0] = _scaleX*xAxis.x;
			raw[1] = _scaleX*xAxis.y;
			raw[2] = _scaleX*xAxis.z;
			raw[3] = 0;
			
			raw[4] = _scaleY*yAxis.x;
			raw[5] = _scaleY*yAxis.y;
			raw[6] = _scaleY*yAxis.z;
			raw[7] = 0;
			
			raw[8] = _scaleZ*zAxis.x;
			raw[9] = _scaleZ*zAxis.y;
			raw[10] = _scaleZ*zAxis.z;
			raw[11] = 0;
			
			raw[12] = _x;
			raw[13] = _y;
			raw[14] = _z;
			raw[15] = 1;
            
            transform.m3_decompose(undefined,rot,undefined);
			
			// let v = transform.decompose();
            // xAxis = v[1];
            
            
            this._rotationX = rot.x;
            this._rotationY = rot.y;
            this._rotationZ = rot.z;


            if (zAxis.z < 0) {
				this._rotationY = rot.y = (Math.PI - rot.y);
				this._rotationX = rot.x = rot.x - Math.PI;
				this._rotationZ = rot.z = rot.z - Math.PI;
            }
            
            // this._rotationZ = rot.z = 0;
            
			this.setChange(DChange.trasnform);
        }

        onSpawn(){
            this.scale = 1.0;
            this.alpha = 1.0;
            this.setRot(0,0,0);
        }



        get shaderKey(){
            let{filters}=this;
            let key = "";
            for(let filterKey in filters){
                let filter = filters[filterKey];
                if(filter && filter.readly){
                    key += filter.skey;
                }
            }
            return key;
        }

        get factorKey(){
            let key = "";
            if((this as IBatchRenderData).srcFactor){
                key += (this as IBatchRenderData).srcFactor + "_" + (this as IBatchRenderData).dstFactor;
            }
            return key;
        }
    }
}