module rf{
    export interface IDisplayFrameElement{
		type:number;
		name:string;
		rect:any;
		x:number;
		y:number;
        matrix2d:IMatrix;
		libraryItemName:string;
	}

	export interface IDisplayTextElement extends IDisplayFrameElement
	{
		fontRenderingMode:String;
		width:number;
		height:number;
		selectable:boolean;
		text:string;
		filter:any[];
		format:object;
		input:boolean;
		multiline:boolean;
		color:number;
	}

	export interface IDisplaySymbol extends IDisplayFrameElement{
		className:String;
		displayClip:number;
		displayFrames:{[key:number]:IDisplayFrameElement[]}
	}

    export interface IExportPanelSource{
        txtwidth:number;
        txtheight:number;
        image:string;
        symbols:IDisplaySymbol[]
        frames:{[key:string]:IBitmapSourceVO}
    }

    export class PanelSource extends BitmapSource{
        config:IExportPanelSource;
        constructor(){
            super();
            this.status = LoadStates.WAIT;
        }

        loadConfigComplete(event:EventX){
            if(event.type != EventT.COMPLETE){
                this.status = LoadStates.FAILED;
                return;
            }
            let resItem = event.currentTarget as Loader
            let url = resItem.url;
            if(url != this.name) return;

            let config = resItem.data as IExportPanelSource;
            this.config = config;

            //配置加载完成 加载图片
            url = "p3d/" + config.image + ExtensionDefine.PNG;
            loadRes(RES_PERFIX,url,this.loadImageComplete,this,ResType.image);
        }

        loadImageComplete(event:EventX){
            if(event.type != EventT.COMPLETE){
                this.status = LoadStates.FAILED;
                return;
            }

            let bmd = this.bmd = event.data;//BitmapData.fromImageElement(event.data);

            let area = this.setArea(BitmapSource.DEFAULT,0,0,bmd.width,bmd.height);
            let{frames} = this.config;

            // for(let key in frames){
            //     frames[key].source = this;
            // }

            area.frames = frames;

            this.width = bmd.width;
            this.height = bmd.height;

            let vo = frames["emptyTextarea"];
            if(vo){
                // let area = 
                this.setArea(BitmapSource.PACK,vo.x,vo.y,vo.w,vo.h);
                let evo = this.setSourceVO("origin",1,1);
                bmd.fillRect(evo.x,evo.y,evo.w,evo.h,"#FFFFFF");
                this.originU = evo.ul;
                this.originV = evo.vt;
            }

            this.status = LoadStates.COMPLETE;
            
            this.simpleDispatch(EventT.COMPLETE)

        }
    }


    export function panelSourceLoad(url:string):PanelSource
    {
        url = getFullUrl(`p3d/${url}`,ExtensionDefine.P3D)
        
        let source = bitmapSources[url] as PanelSource;

        if(!source){
            bitmapSources[url] = source = new PanelSource();
            source.name = url;
            source.textureData = context3D.getTextureData(source.name,false);
        }

        return source;
    }

    export function source_transparent_check(source:PanelSource,vo:IBitmapSourceVO,x:number,y:number){
        let{w,h,ul,ur,vt,vb}=vo;
        ul = (x / w) * (ur - ul) + ul;
        vt = (y / h) * (vb - vt) + vt;
        let data = (source.bmd as BitmapData).getImageData(ul*source.width,vt*source.height,1,1).data;
        return data[3] != 0;
    }
}