module rf{

    export const enum FilterConst{
        OUT_LINE = "outline_"
    }


    export class OutLineFilter extends FilterBase{

        static VERTEX = {

            def:
`
    uniform vec2 originFar;
`,

            code:
`
    float t2 = p.z * originFar[0];
    p.xyz += n.xyz * t2 * originFar[1];
`

        }  as IShaderCode;

        constructor(){
            super(FilterConst.OUT_LINE);
            this.vertex = OutLineFilter.VERTEX;
        }

        alpha:number;

        setData(v:number){
            this.alpha = v;
        }

        setProgramConstants(context:Context3D,program:Program3D,target?:Sprite,camera?:Camera){
            context.setProgramConstantsFromVector("originFar",[1/camera.originFar, this.alpha], 2 , true);
        }
    }


    export class OutLineMaterial extends BaseMaterial{

        filters:{[key:string]:FilterBase}
        shader?:boolean

        constructor(color:number,alpha:number,skeleton = true){
            super();
            

            let filters:{[key:string]:FilterBase} = {};
            this.filters = filters;

            filters[FilterConst.BASIC] = singleton(BasicFilter);
            filters[FilterConst.NORMAL] = singleton(NormalFilter);
            if(skeleton){
                filters[FilterConst.SKELETON] = singleton(SkeletonFilter);
            }
            filters[FilterConst.MV] = singleton(MvFilter);
            filters[FilterConst.OUT_LINE] = singleton(OutLineFilter);
            filters[FilterConst.P] = singleton(MpFilter);
            filters[FilterConst.FILL] = new FillFilter(color,alpha);
            

            this.setColor(color,alpha);

            this.setData(undefined);

            this.cull = WebGLConst.BACK;
        }

        setColor(color:number,alpha:number){
            let{filters} = this;
            let filter = filters[FilterConst.FILL] as FillFilter;
            filter.setData(color,alpha);
            let filter2 = filters[FilterConst.OUT_LINE] as OutLineFilter
            filter2.setData(alpha);
        }

        uploadContext(camera: Camera, mesh: Mesh, now: number, interval: number){
            let { program,filters } = this;

            if(!program){
                this.program = program = singleton(Shader).createProgram(this);
            }

            let c = context3D;
            c.setProgram(program);
            this.uploadContextSetting();

            for(let key in filters){
                let filter = filters[key];
                filter.setProgramConstants(c,program,mesh,camera);
            }

            return true;
        }

    }
}