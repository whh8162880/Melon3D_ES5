module rf{


    export class Map2DSetting{

        /**
         *  W 可走不可走
         *  S 安全不安全
         *  A 透明度
         *  XXXXAASW
         */
        path:Uint8Array;
        // alpha:Uint8Array;
        w:number;
        h:number;
        data:IMapData;

        alphas = [1.0,0.7,0.5,0.2]

        constructor(data:IMapData){
            this.data = data;
            this.path = new Uint8Array(data.byte);
            // this.alpha = new Uint8Array(data.alpha);
            this.w = data.gw;
            this.h = data.gh;
        }


        getValue(x:number,y:number){
            let {w,h,path} = this;
            if(x < 0 || y < 0 || x >= w || y >= h){
                return 0;
            }

            let d = y * w + x;
            if(d < 0 || d >= path.length){
                return 0;
            }
            return path[d];
        }


        getWalk(x:number,y:number){
            //XXXXAASW
            let d = this.getValue(x,y);
            return d & 1;
        }

        getsafe(x:number,y:number){
            //XXXXAASW
            let d = this.getValue(x,y);
            return ((d << 6) >> 7) & 1;//(d & 13) >> 1;
        }

        getAlpha(x:number,y:number){
            //XXXXAASW
            // let{alphas}=this;
            let d = this.getValue(x,y);
            return (d & 12) >> 2;//alphas[d];
        }

        setWalk(x:number, y:number, val:number){
            //XXXXAASW
            if(val > 1 || val < 0) ThrowError("设置行走区域值超出0-1范围");
            let {w, path} = this;
            let d = y * w + x;
            let old = path[d];
            let n = old & 0o00001110 | val;
            this.path[d] = n;
        }

        /**
         * 透明度设置
         * @param x 
         * @param y 
         * @param val
         * 透明度设置 0000xx11
         */
        setAlpha(x:number, y:number, val:number){
            if(val > 12 || val < 0) ThrowError("设置透明区域值超出范围");
            let {w, path} = this;
            let d = y * w + x;
            let old = path[d];
            //向右移2位
            let n = (val << 2) | (old & 0o00000011);
            this.path[d] = n;
        }

        setSafe(x:number, y:number, val:number){
            if(val > 1 || val < 0) ThrowError("设置安全区值超出范围");
            let {w, path} = this;
            let d = y * w + x;
            let old = path[d];
            //向右移1位
            let n = (val << 1) | (old & 0o00001101);
            this.path[d] = n;
        }
    }
}