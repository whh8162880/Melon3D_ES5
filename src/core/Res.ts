
// module rf {


//     /**
//      * 添加一个加载项
//      * @param url 加载路径, 数组为添加多个
//      * @param complete 加载完毕回调
//      * @param thisObj 回调作用域
//      * @param type 资源类型
//      * @param priority 加载优先级
//      * @param cache 是否缓存
//      * @param noDispose 不自动释放
//      * @param disposeTime 自动释放时间, 超过该时间自动释放资源
//      */
//     // export function loadRes(url: string, complete?: EventHandler, thisObj?: any, type: ResType = ResType.bin,
//     //     priority: LoadPriority = LoadPriority.low, cache: boolean = true, noDispose: boolean = false, disposeTime: number = 30000): ResItem {
//     //     return Res.instance.load(url, complete, thisObj, type, priority, cache, noDispose, disposeTime);
//     // }


//     export function removeLoad(url:string,complete:EventHandler){

//     }

//     /**
//      * 资源加载管理类
//      */
//     export class Res {
//         private static _instance: Res;
//         static get instance(): Res {
//             return this._instance || (this._instance = new Res());
//         }


//         // maxLoader: number = 5;
//         private nowLoader: number = 0;
//         private _analyzerMap: { [type: string]: { new(): ResLoaderBase } };

//         // private _loadMap: { [priority: number]: ResItem[] };
//         private resMap: { [k: string]: ResItem };

//         private link: Link;
//         // private _loadingMap: { [k: string]: ResItem };

//         private constructor() {
//             this._analyzerMap = {};
//             this._analyzerMap[ResType.text] = ResTextLoader;
//             this._analyzerMap[ResType.amf] = ResAMFLoader
//             this._analyzerMap[ResType.bin] = ResBinLoader;
//             this._analyzerMap[ResType.sound] = ResSoundLoader;
//             this._analyzerMap[ResType.image] = ResImageLoader;

//             this.resMap = {};

//             this.link = new Link();
//             // this._loadMap = {};
//             // this._resMap = {};
//             // this._loadingMap = {};
//             // 资源释放机制
//             // setInterval(this.clearRes.bind(this), 10 * 1000);
//         }


//         removeLoad(url: string, complete?: EventHandler){
//             const { resMap } = this;
//             let item = resMap[url];
//             if(undefined == item){
//                 return;
//             }

//             let completes = item.complete;
//             if(undefined == completes){
//                 return;
//             }

//             let len = completes.length;
//             let i = -1;
//             for(i = 0;i<len;i++){
//                 let o = completes[i];
//                 if(o.complete == complete){
//                     break;
//                 }
//             }

//             if(-1 != i){
//                 completes.splice(i,1);
//             }
//         }

//         /**
//          * 添加一个加载项
//          * @param url 加载路径
//          * @param complete 加载完毕回调
//          * @param thisObj 回调作用域
//          * @param type 资源类型
//          * @param priority 加载优先级
//          * @param cache 是否缓存
//          * @param noDispose 不自动释放
//          * @param disposeTime 自动释放时间, 超过该时间自动释放资源
//          */
//         load(url: string, complete?: EventHandler, thisObj?: any, type: ResType = ResType.bin,
//             priority: LoadPriority = LoadPriority.low, cache: boolean = true, noDispose: boolean = false, disposeTime: number = 30000): ResItem {

//             const { resMap } = this;

//             let item = resMap[url];
//             if (undefined == item) {
//                 //没创建
//                 item = recyclable(ResItem);
//                 item.type = type;
//                 item.name = url;
//                 item.complete = [{ thisObj: thisObj, complete: complete }];
//                 item.status = LoadStates.WAIT;
//                 item.url = url;
//                 //添加进加载列表
//                 this.link.addByWeight(item, priority);
//                 //开始加载
//                 this.loadNext();
//             } else if (undefined != item.complete) {
//                 //正在加载中
//                 item.complete.push({ thisObj: thisObj, complete: complete });
//             } else if (undefined != item.data) {
//                 //加载完成了
//                 setTimeout(() => {
//                     let event = recyclable(EventX);
//                     event.type = EventT.COMPLETE;
//                     event.data = item;
//                     complete.call(thisObj, event);
//                     event.recycle();
//                 }, 0);
//             } else {
//                 //加载完成 但是404了
//                 setTimeout(() => {
//                     let event = recyclable(EventX);
//                     event.type = EventT.FAILED;
//                     event.data = item;
//                     complete.call(thisObj, event);
//                     event.recycle();
//                 }, 0);
//             }
//             return item;
//         }

//         private loadNext(): void {

//             let { nowLoader, link } = this;
//             let maxLoader = res_max_loader

//             if (nowLoader >= maxLoader) {
//                 return;
//             }

//             while (nowLoader < maxLoader && link.length) {
//                 let item: ResItem = link.shift();
//                 if (undefined == item) {
//                     //全部没有了
//                     break;
//                 }
//                 this.doLoad(item);
//             }
//         }

//         private doLoad(item: ResItem): void {
//             this.nowLoader++;
//             item.status = LoadStates.LOADING;
//             let loader = recyclable(this._analyzerMap[item.type]);
//             loader.loadFile(item, this.doLoadComplete, this);
//         }

//         private doLoadComplete(loader: Recyclable<ResLoaderBase>, event: EventX): void {
//             this.nowLoader--;

//             loader.recycle();

//             let item: ResItem = event.data;
//             item.preUseTime = engineNow;

//             item.status = event.data ? LoadStates.COMPLETE : LoadStates.FAILED;

//             item.complete.forEach((v, i) => {
//                 if (v) {
//                     v.complete.call(v.thisObj, event);
//                 }
//             });
//             item.complete = undefined;

//             this.loadNext();
//         }

//         gc(now:number): void {
//             const { resMap } = this;
//             for (let url in resMap) {
//                 let item = resMap[url];
//                 if (!item.noDispose && undefined == item.complete) {
//                     if (item.disposeTime < now - item.preUseTime) {
//                         resMap[url] = undefined;
//                     }
//                 }
//             }
//         }
//     }

//     /**
//      * 资源数据
//      */
//     export class ResItem implements IRecyclable {
//         type: ResType;
//         name: string;
//         complete: IResHandler[];
//         data: any;
//         preUseTime: number;
//         noDispose: boolean;
//         disposeTime: number;
//         status: number = 0;
//         url:string;
//         onRecycle() {
//             this.name = this.complete = this.data = this.url =  undefined;
//             this.preUseTime = this.disposeTime = this.status = 0;
//             this.noDispose = false;
//         }
//     }

//     /**
//      * 加载基类
//      */
//     export abstract class ResLoaderBase {
//         protected _resItem: ResItem;
//         protected _compFunc: Function;
//         protected _thisObject: any;

//         loadFile(resItem: ResItem, compFunc: Function, thisObject: any): void {
//             this._resItem = resItem;
//             this._compFunc = compFunc;
//             this._thisObject = thisObject;
//         }
//     }

//     /**
//      * 二进制加载
//      */
//     export class ResBinLoader extends ResLoaderBase {
//         protected _httpRequest: HttpRequest;

//         constructor() {
//             super();
//             let http = new HttpRequest();

//             this._httpRequest = http
//             http.responseType = this.getType();
//             http.addEventListener(EventT.COMPLETE, this.onComplete, this);
//             http.addEventListener(EventT.IO_ERROR, this.onIOError, this);
//         }

//         protected getType(): wx.HttpResponseType {
//             return wx.HttpResponseType.ARRAY_BUFFER;
//         }

//         loadFile(resItem: ResItem, compFunc: Function, thisObject: any): void {
//             super.loadFile(resItem, compFunc, thisObject);

//             const { _httpRequest: http } = this;

//             http.abort();
//             http.open(resItem.name, wx.HttpMethod.GET);
//             http.send();
//         }

//         protected onComplete(event: EventX): void {
//             const { _resItem, _compFunc, _thisObject, _httpRequest } = this;
//             _resItem.data = _httpRequest.response;
//             event.data = _resItem;
//             this._resItem = this._compFunc = this._thisObject = undefined;
//             if (undefined != _compFunc) {
//                 _compFunc.call(_thisObject, this, event);
//             }
//         }

//         protected onIOError(event: EventX): void {
//             const { _resItem, _compFunc, _thisObject, _httpRequest } = this;
//             event.data = _resItem;
//             this._resItem = this._compFunc = this._thisObject = undefined;
//             if (_compFunc) {
//                 _compFunc.call(_thisObject, this, event);
//             }
//         }
//     }



//     export class ResAMFLoader extends ResBinLoader{
//         protected onComplete(event: EventX): void {
//             const { _resItem, _compFunc, _thisObject, _httpRequest } = this;
//             _resItem.data = amf_readObject(_httpRequest.response);
//             event.data = _resItem;
//             this._resItem = this._compFunc = this._thisObject = undefined;
//             if (undefined != _compFunc) {
//                 _compFunc.call(_thisObject, this, event);
//             }
//         }
//     }

//     /**
//      * 文本加载
//      */
//     export class ResTextLoader extends ResBinLoader {
//         protected getType(): wx.HttpResponseType {
//             return wx.HttpResponseType.TEXT;
//         }

//         protected onComplete(event: EventX): void {
//             const { _resItem, _compFunc, _thisObject, _httpRequest } = this;
//             _resItem.data = _httpRequest.response;
//             event.data = _resItem;
//             this._resItem = this._compFunc = this._thisObject = undefined;
//             if (_compFunc) {
//                 _compFunc.call(_thisObject, this, event);
//             }
//         }
//     }

//     /**
//      * 音乐加载
//      */
//     export class ResSoundLoader extends ResBinLoader {
//         protected onComplete(event: EventX): void {
//             let data = this._httpRequest.response;
//             // TODO : 解码数据为 Sound 对象
//             let sound: any;

//             this._resItem.data = sound;
//             event.data = this._resItem;

//             let compFunc = this._compFunc;
//             let thisObject = this._thisObject;
//             this._resItem = this._compFunc = this._thisObject = undefined;
//             if (compFunc) {
//                 compFunc.call(thisObject, this, event);
//             }
//         }
//     }

//     /**
//      * 图片加载
//      */
//     export class ResImageLoader extends ResLoaderBase {
//         loadFile(resItem: ResItem, compFunc: Function, thisObject: any): void {
//             let imageLoader = new ImgLoader();
//             imageLoader.addEventListener(EventT.COMPLETE, (e: EventX) => {
//                 if (compFunc) {
//                     resItem.data = imageLoader.data;
//                     e.data = resItem;
//                     compFunc.call(thisObject, this, e);
//                 }
//             }, this);
//             imageLoader.addEventListener(EventT.IO_ERROR, (e: EventX) => {
//                 if (compFunc) {
//                     e.data = resItem;
//                     compFunc.call(thisObject, this, e);
//                 }
//             }, this);
//             imageLoader.load(resItem.name);
//         }
//     }

//     export interface ILoaderTask {
//         name?: string;
//         data?: any;
//         status: LoadStates;
//     }

//     // export class LoadTask extends MiniDispatcher implements IRecyclable {
//     //     queue: { [key: string]: ILoaderTask } = {};
//     //     total: number = 0;
//     //     progress: number = 0;

//     //     add(perfix:string,url: string,type:ResType,complete?:EventHandler,thisObj?:any): Loader {
//     //         let res = loadRes(perfix,url, this.complteHandler, this, type);

//     //         if(undefined != complete){
//     //             res.completeLink.add(complete,thisObj);
//     //         }
            
//     //         this.queue[url] = res;
//     //         this.total++;
//     //         return res;
//     //     }

//     //     addTask(item: ILoaderTask & IEventDispatcherX) {
//     //         this.queue[item.name] = item;
//     //         this.total++;
//     //         item.on(EventT.COMPLETE, this.complteHandler, this);
//     //         item.on(EventT.FAILED, this.complteHandler, this)
//     //     }


//     //     complteHandler(event: EventX): void {

//     //         let item = event.data as ILoaderTask;
//     //         if(item instanceof MiniDispatcher){
//     //             item.off(EventT.COMPLETE, this.complteHandler,this);
//     //             item.off(EventT.FAILED, this.complteHandler,this);
//     //         }
            
//     //         const { queue } = this;
//     //         let completeCount = 0;
//     //         let totalCount = 0;
//     //         for (let key in queue) {
//     //             let item = queue[key];
//     //             if (item.status >= LoadStates.COMPLETE) {
//     //                 completeCount++
//     //             }
//     //             totalCount++;
//     //         }

//     //         this.progress = completeCount;
//     //         this.total = totalCount;

//     //         this.simpleDispatch(EventT.PROGRESS, this);

//     //         if (completeCount == totalCount) {
//     //             this.simpleDispatch(EventT.COMPLETE, this);
//     //         }
//     //     }

//     //     onRecycle(){
//     //         this.queue = {};
//     //         this.progress = this.total = 0;
//     //     }
//     // }


//     export function getFullUrl(url:string,perfix:string,extension?:string):string{
//         if(!url) return url;
//         if(extension && url.lastIndexOf(extension) == -1) {
//             url += extension;
//         }

        
        
//         if (url.indexOf("://") == -1) {
//             url = perfix + url;
//         }

//         return url;
//     }
// }