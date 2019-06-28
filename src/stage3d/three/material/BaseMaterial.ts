module rf{

    export class BaseMaterial extends Material{
        filters:{[key:string]:FilterBase}
        shader?:boolean;
    }

    export class ColorMaterial extends Material{

        constructor(color = 0xFFFFFF,alpha = 1.0){
            super();
            this.color = color;
            this.alpha = alpha;
            this.setData(undefined);
        }


        color:number;
        alpha:number;

        change:boolean;

        setColor(color:number,alpha:number){
            this.color = color;
            this.alpha = alpha;
            this.change = true;
        }

        setData(data: IMaterialData) {
            super.setData(data);
            this.cull = WebGLConst.FRONT;
        }


        uploadContext(camera: Camera, mesh: Mesh, now: number, interval: number) {
            return super.uploadContext(camera,mesh,now,interval)
        }

        initFilters(mesh:Mesh){
            super.initFilters(mesh);
            let filters = mesh.filters;
            let{color,alpha}=this;
            delete filters[FilterConst.DIFF];
            delete filters[FilterConst.DISCARD];
            let fileter = filters[FilterConst.FILL] as FillFilter;
            if(!fileter){
                filters[FilterConst.FILL] = new FillFilter(color,alpha);
            }else{
                fileter.setData(color,alpha);
            }
        }

    }
}