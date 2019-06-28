///<reference path="./EventFilter.ts" />
module rf{
    
    export interface ITexFilterData{
        tex:string;
        color:number;
    }

    export class TexFilter extends EventFilter{

        source:BitmapSource;
        texData:ITexFilterData;
        color:IVector3D;

        constructor(target:Sprite,type:string){
            super(type);
            this.target = target;
            this.readly = false;
        }


        setData(texData:ITexFilterData){
            this.texData = texData;
            let{tex,color} = texData;

            if(tex){
                this.source = createUrlSource(tex,undefined,this.textureLoadComplete.bind(this));
            }else if(!this.color){
                if(color === undefined){
                    color = 0xCCCCCC;
                }
                this.color = toRGB(color);
            }

        }


        textureLoadComplete(source:BitmapSource){
            this.readly = true;
            this.target.shader = true;
        }


    }
}