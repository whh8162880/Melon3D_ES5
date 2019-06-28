module rf{

    export class TexChannelFilter extends TexFilter{

        static VERTEX = {
            def:
`
uniform vec4 texChannelData;
varying vec2 vTexUV;
`,
            
            code:
`
vTexUV = (uv.xy - 0.5) * texChannelData.zw + texChannelData.xy + 0.5;
`


        } as IShaderCode;


        static FRAGMENT = {
            def:
`
uniform sampler2D texChannel;
varying vec2 vTexUV;
`,
            code:
`
color.w *= texture2D(texChannel, vTexUV).w;
`
        }as IShaderCode;

        

        constructor(){
            super(undefined, SkillEventConst.TEXTURE_CHANNEL + "");
            this.skey = SkillEventConst.TEXTURE_CHANNEL + "_";

            this.pro = {ou:0,ov:0,su:1,sv:1};
            this.uv = newVector3D();
            this.vertex = TexChannelFilter.VERTEX;
            this.fragment = TexChannelFilter.FRAGMENT;
        }

        setEvent(event:ISkillEvent,tick = false){
            super.setEvent(event,tick);
            createUrlSource(event.url,undefined,this.textureLoadComplete.bind(this));
        }


        uv:IVector3D;
        pro:{ou:number,ov:number,su:number,sv:number};

        updatepro(pro:{ou:number,ov:number,su:number,sv:number}){
            let{uv} = this;
            uv[0] = pro.ou;
            uv[1] = pro.ov;
            uv[2] = pro.su;
            uv[3] = pro.sv;
        }

        textureLoadComplete(source:BitmapSource){
            super.textureLoadComplete(source);
            this.source = source
            source.textureData = context3D.getTextureData(this.source.name,false,WebGLConst.NEAREST,WebGLConst.NEAREST,this.skillEvent.repart);
        }


        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            context.setProgramConstantsFromVector("texChannelData",this.uv,4);
            this.source.uploadContext(program,"texChannel");
        }

    }


    

}