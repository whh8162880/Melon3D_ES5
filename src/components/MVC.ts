///<reference path="./Component.ts" />
module rf {
    //facade 注册记录保存所有Model class 等信息
    export class Facade extends MiniDispatcher {

        SINGLETON_MSG: string = "Facade Singleton already constructed!";

        mediatorMap: { [key: string]: Mediator } = {};
        constructor() {
            super();
        }

        toggle(m: { new(): Mediator } | Mediator, type: number = -1, params?: IOpenOption): Mediator {

            let { mediatorMap } = this;

            let mediator: Mediator;
            if (m instanceof Mediator) {
                mediator = m;
            } else {
                mediator = singleton(m);
            }

            if (!mediator.openParams) mediator.openParams = params;
            mediatorMap[mediator.name] = mediator;

            if (mediator.isReady == false && type == 0) {
                mediator.off(EventT.COMPLETE_LOADED, this.mediatorCompleteHandler, this);
                return mediator;
            }

            if (mediator.isReady == false && mediator.startSync()) {
                mediator.on(EventT.COMPLETE_LOADED, this.mediatorCompleteHandler, this, 10);
                return mediator;
            }

            this.togglepanel(mediator.panel, type);

            return mediator;
        }

        registerEvent(events: { [key: string]: EventHandler }, thisobj: any): void {
            for (let key in events) {
                let fun = events[key];
                this.on(key, fun, thisobj);
            }
        }

        removeEvent(event: { [key: string]: EventHandler }, thisobj: any): void {
            for (let key in event) {
                let fun = event[key];
                this.off(key, fun, thisobj);
            }
        }

        private togglepanel(panel: Panel, type: number = -1): void {
            switch (type) {
                case 1:
                    panel.isShow ? panel.bringTop() : panel.show();
                    break;
                case 0:
                    if (panel.isShow) panel.hide();
                    break;
                case -1:
                    panel.isShow ? panel.hide() : panel.show();
                    break;
            }
        }

        mediatorCompleteHandler(event: EventX): void {
            let mediator = event.data as Mediator;
            mediator.off(EventT.COMPLETE_LOADED, this.mediatorCompleteHandler, this);
            this.togglepanel(mediator.panel, 1);
        }
    }

    export let facade = singleton(Facade);

    export interface IOpenOption {
        panel: string;
        url: string;
        tab: string | number;
    }

    export interface IMediatorParmas {
        ox: number;
        oy: number;
        centerFlag: boolean;
        resizeable: boolean;
        haveFight: boolean;
        effParms?:object;
        hasMask?:boolean;
        parentCon?:DisplayObject;
    }

    export class Mediator extends MiniDispatcher implements IResizeable {
        eventInterests: { [key: string]: EventHandler };

        isReady: boolean = false;

        name: string;
        /**
         * 默认为第一梯队最高权限 不进行计算的面板需要更改为0
         */
        weight: number = 1;

        openParams: IOpenOption;
        mediatorParams: IMediatorParmas;

        constructor(name: string) {
            super();
            this.name = name;
            
            if (this.mEventListeners == undefined) {
                this.mEventListeners = {};
            }
            if (this.eventInterests == undefined) {
                this.eventInterests = {};
            }
            this.mediatorParams = { ox: 0, oy: 0, centerFlag: false, resizeable: false, haveFight: false };
        }

        panel: Panel
        setPanel(panel: Panel) {
            if (this.panel) {
                ThrowError("has panel");
            }

            this.panel = panel;
            this["$panel"] = panel;

            panel.on(MouseEventX.CLICK, this.panelClickHandler, this);
        }

        panelClickHandler(event: EventX) {
            let { ctrl, shift } = event.data;
            if (ctrl && shift) {
                event.stopImmediatePropagation = true;
                ROOT.simpleDispatch(DebugDefine.CANVAS, this.panel.source);
            }
        }

        startSync(): boolean {
            let panel = this.panel;
            let source = panel.source;

            if (source.status == LoadStates.WAIT) {
                panel.load();
            }

            if (source.status == LoadStates.COMPLETE) {
                this.preViewCompleteHandler(undefined);
            } else if (source.status == LoadStates.LOADING) {
                panel.on(EventT.COMPLETE, this.preViewCompleteHandler, this);
            }

            return true;
        }

        preViewCompleteHandler(e: EventX) {
            if (e) {
                let skin = e.currentTarget as Component;
                skin.removeEventListener(EventT.COMPLETE, this.preViewCompleteHandler, this);
                this.setBindView(true);
            }
            //checkModeldata
            // TimerUtil.add(this. ,100);
            this.mediatorReadyHandle();
            this.simpleDispatch(EventT.COMPLETE_LOADED, this);
        }

        awakenAndSleepHandle(e: EventX) {
            let type = e.type;
            switch (type) {
                case EventT.ADD_TO_STAGE:
                    facade.registerEvent(this.eventInterests, this);
                    if (this.isReady) {
                        this.awaken();
                        this.panelshow();
                    }
                    break;
                case EventT.REMOVE_FROM_STAGE:
                    facade.removeEvent(this.eventInterests, this)
                    this.sleep();
                    this.panelhide();
                    break;
            }
        }

        setBindView(isBind: boolean) {
            let { panel } = this;
            if (isBind) {
                panel.on(EventT.ADD_TO_STAGE, this.awakenAndSleepHandle, this);
                panel.on(EventT.REMOVE_FROM_STAGE, this.awakenAndSleepHandle, this);
            } else {
                panel.off(EventT.ADD_TO_STAGE, this.awakenAndSleepHandle, this);
                panel.off(EventT.REMOVE_FROM_STAGE, this.awakenAndSleepHandle, this);
            }
        }

        mediatorReadyHandle() {
            this.isReady = true;
            this.bindComponents();
            this.bindEventInterests();
            if (this.panel.isShow) {
                facade.registerEvent(this.eventInterests, this);
                this.awaken();
            }

        }

        bindEventInterests() {
        }

        bindComponents() {
        }


        sleep() {
        }

        awaken() {
        }

        onRemove() {

        }

        /**
         * 设置遮罩信息
         * @param alpha 遮罩透明度 默认0.7
         * @param mouseEnable 是否启用点击关闭事件 默认关闭
         */
        setMask(alpha:number = 0.7, mouseEnable:boolean = false){
            //依赖于panel 没有panel抛出错误
            let {panel} = this;
            if(!panel) ThrowError("没有panel信息");
            panel.maskParms = {mouseEnable, alpha};
        }

        /**
         * 设置mediator显示容器 或者指定位置
         * @param con 
         * @param index 
         */
        setParentParams(container:DisplayObject, index?:number){
            let {panel} = this;
            if(!panel) ThrowError("没有panel信息");
            panel.parentParms = {container, index};
        }

        set effParms(value:{show:IPANEL_TWEEN_DATA[], hide:IPANEL_TWEEN_DATA[]}){
            let {panel} = this;
            if(!panel) ThrowError("没有panel信息");
            panel.effParms = value;
        }

        private _alignuse:boolean;
        /**
         * 设置单个元件排列
         * @param item 
         * @param align 
         */
        addAlign(item:DisplayObject, align:Align){
            item["alignParms"] = {align, x:item.x, y:item.y};
            this._alignuse = true;
        }

         /**
         * 设置多个元件排列
         * @param item 
         * @param align 
         */
        addAligns(items:DisplayObject[], align:Align){
            for (let i = 0; i < items.length; i++) {
                let item = items[i];
                item["alignParms"] = {align, x:item.x, y:item.y};
            }
            this._alignuse = true;
        }

        //加监听用于面板开关操作 做resize等操作
        protected panelshow() {
            let {_alignuse, mediatorParams} = this;
            let { resizeable, centerFlag } = mediatorParams;
            //自行设置resize不对子对象进行layout centerlayout不进行layout 设置元件align时添加监听resize
            if (resizeable || _alignuse || centerFlag) {
                Engine.addResize(this);
            }
            //  else if (centerFlag) {
            //     this.centerLayout();
            // }

        }

        protected panelhide() {
            let {_alignuse, mediatorParams} = this;
            let { resizeable, centerFlag } = mediatorParams;
            if (resizeable || _alignuse || centerFlag) {
                Engine.removeResize(this);
            }
        }

        resize(width: number, height: number) {
            let {mediatorParams, _alignuse} = this;
            let { centerFlag } = mediatorParams;
            if (centerFlag) {
                this.centerLayout();
            }
            if(_alignuse){
                this.childrenLayout();
            }
        }
        protected centerLayout() {
            let { panel, mediatorParams } = this;
            let { ox, oy } = mediatorParams;
            let {stageWidth, stageHeight} = offsetResize;
            panel.setPos((stageWidth - panel.w >> 1) + ox, (stageHeight - panel.h >> 1) + oy);
            if (panel.y < 0) {
                panel.y = 0;
            }
        }

        protected childrenLayout(){
            //检测子对象 是否有需要进行重新布局
            let {ox, oy} = offsetResize;
            let {childrens} = this.panel;
            let len = childrens.length;
            for (let i = 0; i < len; i++) {
                let item = childrens[i];
                let params = item["alignParms"];
                if(params){
                    let {align, x, y} = params;
                    let tmpx;
                    let tmpy;
                    switch(align){
                        case Align.MIDDLE_CENTER:
                        case Align.MIDDLE_LEFT:
                        case Align.MIDDLE_RIGHT:
                        tmpx = ox + x;
                        tmpy = y + oy;
                        break;
                        case Align.BOTTOM_LEFT:
                        case Align.BOTTOM_CENTER:
                        case Align.BOTTOM_RIGHT:
                        tmpx = ox * 2 + x;
                        tmpy = y + oy * 2;
                        break;
                    }
                    tmpx = tmpx < x ? x : tmpx;
                    tmpy = tmpy < y ? y : tmpy;
                    item.setPos(tmpx, tmpy);
                }
            }
            this.panel.locksize = false;
            this.panel.updateHitArea();
            this.panel.locksize = true;
        }

        back() {
            this.panel.hide();
            return 0;
        }

        saveParms() {
            //need override
        }
    }



    export interface IDisplayIcon {
        id: string | number;
        name: string;
        icon: string;
        bg: string;
    }

    export interface IModelIcon extends IDisplayIcon {
        tag: string;
        moduleName: string;
        model: object;
        guid: string | number;
    }


    export interface IConditionRuntime extends IModelIcon {
        fromModule: string;
        opera: string;
        value: any;
        pt: string;
        count: number;
        quality: number;
        maxCount: number;
    }

    // export interface ILimit{
    //     type:string;
    //     bijiao:string;
    //     value_left:any;
    //     value:any;
    // }

    // export interface ILimitModule{
    //     type:string;
    //     target:{[key:string]:string|number};
    //     value:ILimit[];
    // }

    export interface IConfigLimit {
        module: string;
        value: IConditionRuntime[];
        count: IConditionRuntime;
        simple: IConditionRuntime;
    }


    export const enum PanelEvent {
        SHOW = "PanelEvent_SHOW",
        HIDE = "PanelEvent_HIDE",
    }

    export interface IMaskParams{
        mouseEnable:boolean;
        alpha:number;
    }

    export interface IParentParms{
        container:DisplayObject;
        index?:number;
    }

    export class Panel extends Component {
        clsName: string;
        mName: string;
        isShow: boolean;

        /**遮罩配置信息 */
        maskParms:IMaskParams;
        /**通过mediator进行配置 这里也可以进行配置 不推荐 */
        // isModel: boolean;
        // /**遮罩是否可以点击触发关闭 */
        // m_hide: boolean = false;
        // /**遮罩透明度 */
        // m_a: number = 0.7;

        /** 指定父对象*/
        parentParms:IParentParms;

        /**面板打开 关闭效果 mediator传值*/
        effParms:{show:IPANEL_TWEEN_DATA[], hide:IPANEL_TWEEN_DATA[]};

        source: PanelSource;

        //显示在指定层
        // addp?: any;
        // //显示在父对象位置
        // addPos?: number;

        constructor(uri: string, cls: string) {
            super(panelSourceLoad(uri));
            this.clsName = cls;
            this.mName = uri;
            this.renderer = new SuperBatchRenderer(this);
            this.mouseEnabled = false;
            this.mouseChildren = true;
        }

        render(camera: Camera, option: IRenderOption): void {
            let { source, renderer } = this;
            if (!source || source.status != LoadStates.COMPLETE || !renderer) {
                return;
            }
            super.render(camera, option);
        }

        show(container?: any): void {
            let { isShow, parentParms, maskParms} = this;
            // if (!source || source.status == LoadStates.WAIT) {
            //     this.load();
            //     return;
            // }

            // if (source.status != LoadStates.COMPLETE) {
            //     return;
            // }

            if (!container) {
                container = parentParms ? parentParms.container : popContainer;
            }

            if (maskParms) {
                container.addChild(this.maskcon);
            }
            if (isShow) {
                this.bringTop();
                return;
            }
            if (parentParms && parentParms.index != undefined) {
                container.addChildAt(this, parentParms.index);
            } else {
                container.addChild(this);
            }

            // if (resizeable || isModal) {
            //     Engine.addResize(this);
            //     // this.resize(stageWidth, stageHeight);
            // } else if (centerFlag) {
            //     this.centerLayout();
            // }
            this.isShow = true;
            this.awaken();
            // callLater.later(this.doEff, this, 160);
            this.doEff();

            this.on(MouseEventX.MouseDown, this.bringTop, this);
            // if(this.hasEventListener(PanelEvent.SHOW))
            // {
            // 	this.simpleDispatch(PanelEvent.SHOW);
            // }

            facade.simpleDispatch(EventT.MVC_PANEL_OPEN, this.mName);

        }

        load() {
            let { source } = this;
            if (source.status == LoadStates.COMPLETE) {
                this.asyncsourceComplete();
                return;
            }

            if (source.status == LoadStates.WAIT) {
                source.status = LoadStates.LOADING;
                facade.simpleDispatch(EventT.PANEL_LOAD_START, this.mName);
                loadRes(RES_PERFIX, source.name, source.loadConfigComplete, source, ResType.amf);
            }

            source.on(EventT.COMPLETE, this.asyncsourceComplete, this);

            return source;
        }

        asyncsourceComplete(e?: EventX): void {
            if (e) {
                e.currentTarget.off(e.type, this.asyncsourceComplete, this);
                //结束面板loading
                facade.simpleDispatch(EventT.PANEL_LOAD_END);
            }
            let loadSource = this.source;
            let cs: IDisplaySymbol = loadSource.config.symbols[this.clsName];
            if (!cs) {
                return;
            }
            this.setSymbol(cs);
            this.setChange(DChange.batch);
            this.simpleDispatch(EventT.COMPLETE);
            this.locksize = true;
        }


        hide(e?: EventX): void {
            if (!this.isShow) {
                return;
            }
            this.isShow = false;
            if (this._mask) {
                this._mask.remove();
            }
            // this.sleep();
            // callLater.later(this.doEff, this, 160);
            this.doEff();
            // this.hideState();
            this.off(MouseEventX.MouseDown, this.bringTop, this);

            facade.simpleDispatch(EventT.MVC_PANEL_HIDE, this.mName);

            this.simpleDispatch(PanelEvent.HIDE);
            // this.graphics.clear();
            // (this.renderer as SuperBatchRenderer).changeStatus = DChange.vertex;
        }

        bringTop(e?: EventX): void {
            let { parent } = this;
            if (parent == null) return;
            parent.addChild(this);
        }

        doEff() {
            let {isShow, tween, effParms} = this;
            //面板打开关闭效果走配置吧 不再在底层进行书写
            //外部配置表 保存效果配置
            if(tween){
                tween.stop();
            }

            if(isShow){
                if(effParms && effParms.show){
                    this.status = 0;
                    this.tween = tween = scriptTween_play(this, effParms.show, defaultTimeMixer);
                    tween.on(EventT.COMPLETE, this.tweenHandler, this);
                }
            }else{
                if(effParms && effParms.hide){
                    this.tween = tween = scriptTween_play(this, effParms.hide, defaultTimeMixer);
                    tween.on(EventT.COMPLETE, this.tweenHandler, this);
                }else{
                    this.remove();
                }
            }

            // if(type){

            // 	_tween = tween.get(this._skin);
            // 	_tween.to({alpha:1},200);
            // }else{
            // 	_tween = tween.get(this._skin);
            // 	_tween.to({alpha:1},200);
            // }

            // _tween.call(this.effectEndByBitmapCache,this,type);

            // this.effectEndByBitmapCache(type);
            // if (type == 0) {
                // if (this.resizeable || this.isModel) {
                //     Engine.removeResize(this);
                // }
            //     this.remove();
            // }

        }

        private tweenHandler(e:EventX){
            let {isShow} = this;
            this.tween = undefined;
            // this.setChange(DChange.batch);
            if(!isShow){
                this.remove();
                // this.scale = 1;
                // this.alpha = 1;
            }else{
                // this.setChange(DChange.batch);
            }
            // this.setChange(DChange.batch);
        }

        private _mask: Sprite = undefined;
        get maskcon() {
            let { _mask, maskParms} = this;
            let {mouseEnable, alpha} = maskParms;
            if (!_mask) {
                let {stageWidth, stageHeight} = offsetResize;
                _mask = new Sprite();
                let g = _mask.graphics;
                g.clear();
                g.drawRect(0, 0, stageWidth, stageHeight, 0, alpha);
                // if(isMobile){
                //     g.drawRect(0, 0, stageWidth, stageHeight, 0, alpha);
                // }else{
                //     g.drawRect(stageWidth - windowWidth >> 1, stageHeight - windowHeight >> 1, windowWidth, windowHeight, 0, alpha);
                // }
                g.end();
                if (mouseEnable) {
                    _mask.on(MouseEventX.CLICK, this.hide, this);
                }
                this._mask = _mask;
            }
            return _mask;
        }
    }

    export class TEventInteresterDele extends MiniDispatcher {
        eventInterests: { [key: string]: EventHandler };
        protected _skin: Component;

        constructor(skin: Component) {
            super();
            if (skin) {
                skin.mouseEnabled = false;
            }
            this.eventInterests = {};

            this._skin = skin;

            this.bindEventInterests();
            this.setBindView();
            this.bindComponents();
        }

        protected bindEventInterests(): void {

        }

        bindComponents() {

        }

        setBindView(): void {
            let { _skin } = this;
            _skin.addEventListener(EventT.ADD_TO_STAGE, this.awakenAndSleepHandle, this);
            _skin.addEventListener(EventT.REMOVE_FROM_STAGE, this.awakenAndSleepHandle, this);
        }

        awakenAndSleepHandle(e: EventX): void {
            let type = e.type;
            switch (type) {
                case EventT.ADD_TO_STAGE:
                    facade.registerEvent(this.eventInterests, this);
                    this.awaken();
                    break;
                case EventT.REMOVE_FROM_STAGE:
                    facade.removeEvent(this.eventInterests, this)
                    this.sleep();
                    break;
            }
        }

        awaken() {

        }

        sleep() {

        }

        _data: {};
        set data(value: {}) { this._data = value; this.doData(); }
        get data(): {} { return this._data; }
        doData() { };
        refreshData() { this.doData(); }
    }

    export class TasyncDele extends Component {
        private m: { new(): Mediator };
        private mname: string;
        target: Mediator;
        constructor(m: { new(): Mediator }, source?: BitmapSource) {
            super(source);
            this.m = m;


            this.on(EventT.ADD_TO_STAGE, this.awakenAndSleepHandle, this);
            this.on(EventT.REMOVE_FROM_STAGE, this.awakenAndSleepHandle, this);
        }

        awakenAndSleepHandle(e: EventX): void {
            let type = e.type;
            switch (type) {
                case EventT.ADD_TO_STAGE:
                    this.awaken();
                    break;
                case EventT.REMOVE_FROM_STAGE:
                    this.sleep();
                    break;
            }
        }

        awaken() {
            let { target } = this;
            let mediator;
            if (!target) {
                mediator = singleton(this.m);
                this.mname = mediator.name;
                this.target = mediator;
                mediator.panel.addp = this;
                facade.toggle(this.m, 1);

                if (mediator.isReady) {
                    this.addChild(mediator.panel);
                    this.sizeHandler();
                } else {
                    mediator.on(EventT.COMPLETE_LOADED, this.sizeHandler, this);
                }
            } else {
                mediator = facade.mediatorMap[this.mname];
                mediator.mName = this.mname;
                if (mediator.isReady) {
                    this.addChild(mediator.panel);
                    this.sizeHandler();
                    facade.simpleDispatch(EventT.MVC_PANEL_OPEN, mediator.mName);
                } else {
                    mediator.on(EventT.COMPLETE_LOADED, this.sizeHandler, this);
                }
            }
        }

        protected sizeHandler(e?: EventX) {
            if (e) {
                e.currentTarget.off(EventT.COMPLETE_LOADED, this.sizeHandler, this);
            }
            let mediator: Mediator = facade.mediatorMap[this.mname];
            let { w, h } = mediator.panel;
            this.setSize(w, h);
        }
    }

    export class ItemRender extends Component {
        constructor(uri: string, cls: string) {
            super(panelSourceLoad(uri));
            let { config } = this.source as PanelSource;
            let cs: IDisplaySymbol = config.symbols[cls];
            if (!cs) {
                return;
            }
            this.setSymbol(cs);
        }
    }
}