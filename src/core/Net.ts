
// module rf {
//     /**
//      * HTTP 请求类
//      */
//     export class HttpRequest extends MiniDispatcher {
//         protected _url: string;
//         protected _method: wx.HttpMethod;

//         protected _responseType: wx.HttpResponseType;
//         protected _withCredentials: boolean;
        
//         headerObj: {[key: string]: string};

//         protected _xhr: XMLHttpRequest;

//         constructor() {
//             super();
//         }

//         get response(): any {
//             if (!this._xhr) {
//                 return undefined;
//             }
//             if (this._xhr.response != undefined) {
//                 return this._xhr.response;
//             }
//             if (this._responseType == wx.HttpResponseType.TEXT) {
//                 return this._xhr.responseText;
//             }
//             if (this._responseType == wx.HttpResponseType.ARRAY_BUFFER && /msie 9.0/i.test(navigator.userAgent)) {
//                 var w = window;
//                 return w["convertResponseBodyToText"](this._xhr["responseBody"]);
//             }
//             // if (this._responseType == "document") {
//             //     return this._xhr.responseXML;
//             // }
//             return undefined;
//         }

//         set responseType(value: wx.HttpResponseType) {
//             this._responseType = value;
//         }
//         get responseType(): wx.HttpResponseType {
//             return this._responseType;
//         }

//         /**
//          * 表明在进行跨站(cross-site)的访问控制(Access-Control)请求时，是否使用认证信息(例如cookie或授权的header)。(这个标志不会影响同站的请求)
//          */
//         set withCredentials(value: boolean) {
//             this._withCredentials = value;
//         }
//         get withCredentials(): boolean {
//             return this._withCredentials;
//         }

//         setRequestHeader(header: string, value: string): void {
//             if (!this.headerObj) {
//                 this.headerObj = {};
//             }
//             this.headerObj[header] = value;
//         }

//         getResponseHeader(header: string): string {
//             if (!this._xhr) {
//                 return undefined;
//             }
//             let result = this._xhr.getResponseHeader(header);
//             return result ? result : "";
//         }

//         getAllResponseHeaders(): string {
//             if (!this._xhr) {
//                 return undefined;
//             }
//             let result = this._xhr.getAllResponseHeaders();
//             return result ? result : "";
//         }

//         open(url: string, method: wx.HttpMethod = wx.HttpMethod.GET): void {
//             this._url = url;
//             this._method = method;
//             if (this._xhr) {
//                 this._xhr.abort();
//                 this._xhr = undefined;
//             }
//             this._xhr = this.getXHR();
//             this._xhr.onreadystatechange = this.onReadyStateChange.bind(this);
//             this._xhr.onprogress = this.updateProgress.bind(this);
//             this._xhr.open(this._method, this._url, true);
//         }

//         protected getXHR(): XMLHttpRequest {
//             if (window["XMLHttpRequest"]) {
//                 return new window["XMLHttpRequest"]();
//             }
//             return new window["ActiveXObject"]("MSXML2.XMLHTTP");
//         }

//         protected onReadyStateChange(): void {
//             let xhr = this._xhr;
//             if (xhr.readyState == 4) {
//                 let ioError = (xhr.status >= 400 || xhr.status == 0);
//                 let url = this._url;
//                 setTimeout(() => {
//                     if (ioError) {
//                         if (true && !this.hasEventListener(EventT.IO_ERROR)) {
//                             ThrowError("http request error: " + url);
//                         }
//                         this.simpleDispatch(EventT.IO_ERROR);
//                     } else {
//                         this.simpleDispatch(EventT.COMPLETE);
//                     }
//                 }, 0);
//             }
//         }

//         protected updateProgress(event: any): void {
//             if (event.lengthComputable) {
//                 this.simpleDispatch(EventT.PROGRESS, [event.loaded, event.total]);
//             }
//         }

//         send(data?: any): void {
//             if (this._responseType != undefined) {
//                 this._xhr.responseType = this._responseType;
//             }
//             if (this._withCredentials != undefined) {
//                 this._xhr.withCredentials = this._withCredentials;
//             }
//             if (this.headerObj) {
//                 for (var key in this.headerObj) {
//                     this._xhr.setRequestHeader(key, this.headerObj[key]);
//                 }
//             }
//             this._xhr.send(data);
//         }

//         abort(): void {
//             if (this._xhr) {
//                 this._xhr.abort();
//             }
//         }
//     }

//     /**
//      * 图片加载类
//      */
//     export class ImgLoader extends MiniDispatcher {
//         private static _crossOrigin: string;

//         /**
//          * 当从其他站点加载一个图片时，指定是否启用跨域资源共享(CORS)，默认值为null。
//          * 可以设置为"anonymous","use-credentials"或null,设置为其他值将等同于"anonymous"。
//          */
//         static set crossOrigin(value: string) {
//             this._crossOrigin = value;
//         }
//         static get crossOrigin(): string {
//             return this._crossOrigin;
//         }

//         protected _hasCrossOriginSet: boolean;
//         protected _crossOrigin: string;

//         protected _currentImage: HTMLImageElement;

//         protected _data: HTMLImageElement;

//         constructor() {
//             super();
//         }

//         get data(): HTMLImageElement {
//             return this._data;
//         }

//         set crossOrigin(value: string) {
//             this._hasCrossOriginSet = true;
//             this._crossOrigin = value;
//         }
//         get crossOrigin(): string {
//             return this._crossOrigin;
//         }

//         load(url: string): void {
//             let image = wx.createImage();
//             image.crossOrigin = "Anonymous";
//             this._data = undefined;
//             this._currentImage = image;
//             if (this._hasCrossOriginSet) {
//                 if (this._crossOrigin) {
//                     image.crossOrigin = this._crossOrigin;
//                 }
//             } else {
//                 if (ImgLoader.crossOrigin) {
//                     image.crossOrigin = ImgLoader.crossOrigin;
//                 }
//             }
//             image.onload = this.onImageComplete.bind(this);
//             image.onerror = this.onLoadError.bind(this);
//             image.src = url;
//         }

//         protected onImageComplete(event: any): void {
//             let image = this.getImage(event);
//             if (!image) {
//                 return;
//             }
//             this._data = image;
//             setTimeout(() => {
//                 this.simpleDispatch(EventT.COMPLETE);
//             }, 0);
//         }

//         protected onLoadError(): void {
//             let image = this.getImage(event);
//             if (!image) {
//                 return;
//             }
//             this.simpleDispatch(EventT.IO_ERROR, image.src);
//         }

//         protected getImage(event: any): any {
//             let image = event.target;
//             image.onerror = undefined;
//             image.onload = undefined;
//             if (this._currentImage !== image) {
//                 return undefined;
//             }
//             this._currentImage = undefined;
//             return image;
//         }
//     }
// }