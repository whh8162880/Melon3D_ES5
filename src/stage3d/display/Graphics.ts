module rf{
    export class Graphics {
        grometrys:IGraphicsGeometry[];
        target: Sprite;
        byte: Float32Array;
        hitArea:HitArea;
        numVertices = 0;
        $batchOffset = 0;
        private preNumVertices = 0;
        constructor(target: Sprite,variables: { [key: string]: { size: number, offset: number } }) {
            this.target = target;
            // this.byte = new Float32Byte(new Float32Array(0));
            this.numVertices = 0;
            this.hitArea = new HitArea();
            this.grometrys = [];
        }


        clear(): void {

            // let{$batchGeometry:geo} = this.target;
           

            // if(geo && geo.vertex.vertex.length >= this.$batchOffset + this.numVertices * geo.vertex.data32PerVertex){
            this.preNumVertices = this.numVertices;
            // }else{
            //     this.preNumVertices = 0;
            // }

           
            this.numVertices = 0;
            this.byte = undefined;
            this.hitArea.clean();

            let{grometrys}=this;

            for (let i = 0; i < grometrys.length; i++) {
                const {vo} = grometrys[i];
                if(vo){
                    let used = vo.used - 1;
                    vo.used = used < 0 ? 0 : used;
                }
            }

            // this.grometrys.forEach(element => {
            //     if(element.vo){
            //         let used = element.vo.used - 1;
            //         element.vo.used = used < 0 ? 0 : used;
            //     }
            // });

            this.grometrys.length = 0;
        }

        end(): void {
            let{target,grometrys,numVertices}=this;
            let change = 0;


            


            if(numVertices > 0){
                let data32PerVertex = target.variables["data32PerVertex"].size;
                let float = new Float32Array(numVertices * data32PerVertex);
                let offset = 0;

                for (let i = 0; i < grometrys.length; i++) {
                    const geo = grometrys[i];
                    geo.offset = offset;
                    float.set(geo.base,offset);
                    offset += geo.base.length;
                }

                let{$batchGeometry:geo,__batch} = target;
                // if(geo){
                //     if(geo.vertex.vertex.length < this.$batchOffset + this.numVertices * geo.vertex.data32PerVertex){
                //         this.preNumVertices = 0;
                //     }
                // }
                this.byte = float;
                if(geo && this.preNumVertices == this.numVertices){
                    geo.update(this.$batchOffset,float);
                }else{
                    if(__batch){
                        __batch.changeStatus |= DChange.vertex;
                    }else{
                        change |= DChange.vertex;
                    }
                }
                if(target.hitArea.combine(this.hitArea,0,0)){
                    change |= DChange.area;
                }
            }else{
                let{__batch} = target;
                if(__batch){
                    __batch.changeStatus |= DChange.vertex;
                    change |= DChange.area
                }else{
                    change |= (DChange.vertex | DChange.area);
                }
            }

            if(change > 0){
                target.setChange(change);
            }
        }
        

        addPoint(geometry:IGraphicsGeometry,pos:number[],noraml:number[],uv:number[],color:number[],locksize:boolean){
            let variables = this.target.variables;
            let numVertices = geometry.numVertices;
            function set(variable:IVariable,array:Float32Array,data:number[]){
                if(undefined == data || undefined == variable){
                    return;
                }
                let size = variable.size;
                let offset = numVertices * size
                if(data.length <= size){
                    array.set(data,offset)
                }else{
                    array.set(data.slice(0,size),offset);
                }
                // for(let i = 0;i<size;i++){
                //     array[offset + i] = data[i];
                // }
            }

            set(variables[VA.pos],empty_float32_pos,pos);
            set(variables[VA.normal],empty_float32_normal,noraml);
            set(variables[VA.uv],empty_float32_uv,uv);
            set(variables[VA.color],empty_float32_color,color);


            if(!locksize){
                this.hitArea.updateArea(pos[0],pos[1],pos[2]);
            }
            
            // this.numVertices++
            geometry.numVertices ++;
        }

        // drawLine(fx:number,fy:number,tx:number,ty:null)

        drawRect(x: number, y: number, width: number, height: number, color: number, alpha: number = 1, matrix:IMatrix = undefined,z: number = 0) {

            let{variables,source,$vcIndex,$sourceIndex,locksize} = this.target;
            let data32PerVertex = variables["data32PerVertex"].size;
            const{originU,originV} = source;
            const rgba = [
                ((color & 0x00ff0000) >>> 16) / 0xFF,
                ((color & 0x0000ff00) >>> 8) / 0xFF,
                (color & 0x000000ff) / 0xFF,
                alpha
            ]
            const uv = [originU,originV,~~$vcIndex,~~$sourceIndex];
            const noraml = [0,0,1]

            let geometry = newGraphicsGeometry();
            this.grometrys.push(geometry);

            let r = x + width;
            let b = y + height;

            let f = m2dTransform;
            let p = [0,0,0];

            let points = [x,y,r,y,r,b,x,b];
            for(let i=0;i<8;i+=2){
                p[0] = points[i];
                p[1] = points[i+1];
                p[2] = z;
                if(undefined != matrix){
                    f(matrix,p,p);
                }
                this.addPoint(geometry,p,noraml,uv,rgba,locksize);
            }

            geometry.base = createGeometry(empty_float32_object,variables,geometry.numVertices);
            this.numVertices += geometry.numVertices;
            return geometry;
        }

        drawCircle(x:number,y:number,radius:number,vo:IBitmapSourceVO = undefined, uiMatrix:IMatrix = undefined, color:number = 0xFFFFFF,alpha:number = 1,z:number = 0){
            let{variables,source,$vcIndex:index,locksize, $sourceIndex} = this.target;
            let data32PerVertex = variables["data32PerVertex"].size;
            const{originU,originV} = source;
            const rgba = [
                ((color & 0x00ff0000) >>> 16) / 0xFF,
                ((color & 0x0000ff00) >>> 8) / 0xFF,
                (color & 0x000000ff) / 0xFF,
                alpha
            ]
            const uv = [originU,originV,index,$sourceIndex];
            const noraml = [0,0,1]

            let geometry = newGraphicsGeometry();
            this.grometrys.push(geometry);
            let f = m2dTransform;

			let _numSegments:number;
			let nu:number;
            let nv:number;
            let p = [0,0,z];
            let ou:number;
            let ov:number;
            let du:number;
            let dv:number;
			if(vo){
				ou = vo.ul;
				ov = vo.vt
				du = vo.ur - ou;
				dv = vo.vb - ov;
			}else{
				nu = originU;
				nv = originV;
            }
            
			_numSegments = Math.ceil(radius/5)*4;
			if(_numSegments < 16){
				_numSegments = 16;
			}
			
			let cos:number;
			let sin:number;
			let rcos:number;
			let rsin:number;
			let t:number;
			let pi2:number = Math.PI * 2;
			let i:number;
			let j:number;
			for (i = 0; i < _numSegments; i+=2)
			{
                if(uiMatrix){
                    p[0] = x;
                    p[1] = y;
                    f(uiMatrix, p, p);
                }else{
                    p[0] = x;
                    p[1] = y;
                }

				if(vo){
					nu = p[0] / vo.w;
					if(nu < 0){nu = 0};
					if(nu > 1){nu = 1};
					
					nv = p[1] / vo.h;
					if(nv < 0){nv = 0};
					if(nv > 1){nv = 1};
					
					nu = nu*du + ou;
                    nv = nv*dv + ov;
                    uv[0] = nu;
                    uv[1] = nv;
				}
				
				this.addPoint(geometry,p,noraml, uv, rgba, locksize);
				for(j=0;j<3;j++){
					t = (i+j) / _numSegments * pi2;
					cos = Math.cos(t);
					sin = Math.sin(t);
					rcos = cos * radius + x;
                    rsin = sin * radius + y;
                    
                    if(uiMatrix){
                        p[0] = rcos;
                        p[1] = rsin;
                        f(uiMatrix, p, p);
                    }else{
                        p[0] = rcos;
                        p[1] = rsin;
                    }
					
					if(vo){
						nu = p[0] / vo.w;
						if(nu < 0){nu = 0};
						if(nu > 1){nu = 1};
						
						nv = p[1] / vo.h;
						if(nv < 0){nv = 0};
						if(nv > 1){nv = 1};
						nu = nu*du + ou;
                        nv = nv*dv + ov;
                        uv[0] = nu;
                        uv[1] = nv;
					}
					this.addPoint(geometry,p,noraml, uv, rgba, locksize);
				}
            }
            
            geometry.base = createGeometry(empty_float32_object,variables,geometry.numVertices);
            this.numVertices += geometry.numVertices;
            return geometry;
        }
        
        drawTriangle(x: number, y: number, width: number, height: number, color: number, p2y:number = 0, alpha: number = 1, matrix:IMatrix = undefined,z: number = 0){
            let{variables,source,$vcIndex,locksize, $sourceIndex} = this.target;
            let data32PerVertex = variables["data32PerVertex"].size;
            const{originU,originV} = source;
            const rgba = [
                ((color & 0x00ff0000) >>> 16) / 0xFF,
                ((color & 0x0000ff00) >>> 8) / 0xFF,
                (color & 0x000000ff) / 0xFF,
                alpha
            ]
            const uv = [originU,originV,~~$vcIndex, ~~$sourceIndex];
            const noraml = [0,0,1]

            let geometry = newGraphicsGeometry();
            this.grometrys.push(geometry);

            let r = x + width;
            let b = y + height;

            let f = m2dTransform;
            let p = [0,0,0];

            let points = [x,y,r,y+p2y,x,b,x,b];
            for(let i=0;i<8;i+=2){
                p[0] = points[i];
                p[1] = points[i+1];
                p[2] = z;
                if(undefined != matrix){
                    f(matrix,p,p);
                }
                this.addPoint(geometry,p,noraml,uv,rgba,locksize);
            }

            geometry.base = createGeometry(empty_float32_object,variables,geometry.numVertices);
            this.numVertices += geometry.numVertices;
            return geometry;
        }



        setSize(width:number, height:number){
            this.preNumVertices = this.numVertices;
            this.grometrys.forEach(geometry => {
                let{x,y,matrix,w,h,vo,rect,offset}=geometry;
                if(width == 0)width = 1;
                let sx = width / w,sy = height / h;
                if(matrix){
                    matrix.m2_scale(sx,sy);
                }
                if(vo){
                    if(rect){
                        this.drawScale9Bitmap(x,y,vo,rect,matrix,geometry);
                    }
                    // else{
                    //     this.drawBitmap(x,y,vo,matrix,geometry);
                    // }
                }
            });
            this.end();
        }

        drawScale9Bitmap(x: number, y: number,vo:IBitmapSourceVO,rect:Size,matrix?:IMatrix,geometry?:IGraphicsGeometry,color:number = 0xFFFFFF,alpha:number = 1,z:number = 0){
            let{w,h,ul,ur,vt,vb,ix,iy}=vo;
            x += ix;
            y += iy;

            const noraml = [0,0,1];
            const rgba = [
                ((color & 0x00ff0000) >>> 16) / 0xFF,
                ((color & 0x0000ff00) >>> 8) / 0xFF,
                (color & 0x000000ff) / 0xFF,
                alpha
            ]
            let{variables,$vcIndex:index,locksize, $sourceIndex} = this.target;

            let sx = 1, sy = 1;
            if(matrix){

                let d = matrix.m2_decompose();
                sx = d.scaleX;
                sy = d.scaleY;

                d.scaleX = 1;
                d.scaleY = 1;

                matrix = newMatrix();
                matrix.m2_recompose(d);

            }
            if(!geometry){
                geometry = newGraphicsGeometry(matrix || newMatrix());
                this.grometrys.push(geometry);
            }else{
                geometry.matrix = matrix;
                this.numVertices -= geometry.numVertices;
                geometry.numVertices = 0;
            }


            geometry.x = x;
            geometry.y = y;

            let dx = 0,dy = 0;


            

            
            
            let{x:rx,y:ry,w:rw,h:rh}=rect;
            let rr = w - rw - rx ,rb = h - rh - ry;
            let uw = ur - ul,vh = vb - vt;
            let x2 = dx + rx,y2 = dy + ry;
            let u2 = (rx / w) * uw + ul,u3 = ((rx+rw) / w) * uw + ul;
            let v2 = (ry / h) * vh + vt,v3 = ((ry+rh) / h) * vh + vt;
            
            geometry.w = w;
            geometry.h = h;

            w = w * sx;
            h = h * sy;


            let x3 = w - rr,y3 = h - rb;

            if(x3 < rx){
                x3 = rx;
            }

            let r = dx + w,b = dy + h;

            let points = [
                dx,dy,ul,vt,     x2,dy,u2,vt,     x2,y2,u2,v2,    dx,y2,ul,v2,  
                x2,dy,u2,vt,     x3,dy,u3,vt,     x3,y2,u3,v2,    x2,y2,u2,v2,
                x3,dy,u3,vt,     r,dy,ur,vt,      r,y2,ur,v2,     x3,y2,u3,v2,

                dx,y2,ul,v2,    x2,y2,u2,v2,    x2,y3,u2,v3,    dx,y3,ul,v3,
                x2,y2,u2,v2,    x3,y2,u3,v2,    x3,y3,u3,v3,    x2,y3,u2,v3,
                x3,y2,u3,v2,    r,y2,ur,v2,     r,y3,ur,v3,     x3,y3,u3,v3,


                dx,y3,ul,v3,     x2,y3,u2,v3,    x2,b,u2,vb,     dx,b,ul,vb,
                x2,y3,u2,v3,    x3,y3,u3,v3,    x3,b,u3,vb,     x2,b,u2,vb,
                x3,y3,u3,v3,    r,y3,ur,v3,     r,b,ur,vb,      x3,b,u3,vb
            ];



            let f = m2dTransform;

            let o = [0,0];
            if(undefined != matrix){
                f(matrix,o,o);
            }

            
            let p = [0,0,0];
            for(let i=0;i<points.length;i+=4){
                p[0] = points[i] +  x - o[0];
                p[1] = points[i+1] + y - o[1];
                p[2] = z;
                if(undefined != matrix){
                    f(matrix,p,p);
                }

                // p[0] += x - o[0];
                // p[1] += y - o[1];

                this.addPoint(geometry,p,noraml,[points[i+2],points[i+3],~~index, ~~$sourceIndex],rgba,locksize);
            }

            geometry.vo = vo;
            geometry.rect = rect;
            geometry.base = createGeometry(empty_float32_object,variables,geometry.numVertices);
            this.numVertices += geometry.numVertices;
            return geometry;

        }

        drawBitmap(x: number, y: number,vo:IBitmapSourceVO,matrix?:IMatrix,geometry?:IGraphicsGeometry,color:number = 0xFFFFFF,alpha:number = 1,z:number = 0,wpercent:number = 1,hpercent:number = 1,dir:boolean = true){
            vo.time = engineNow;
            vo.used++;
            let{w,h,ul,ur,vt,vb,ix,iy,scale}=vo;
            if(scale){
                w /= scale;
                h /= scale;
            }

            x += ix;
            y += iy;
            // let r = x + w;
            // let b = y + h;
            
            const rgba = [
                ((color & 0x00ff0000) >>> 16) / 0xFF,
                ((color & 0x0000ff00) >>> 8) / 0xFF,
                (color & 0x000000ff) / 0xFF,
                alpha
            ]

            const noraml = [0,0,1];

            let{variables,$vcIndex:index,locksize,$sourceIndex} = this.target;


            if(!geometry){
                geometry = newGraphicsGeometry(matrix || newMatrix());
                this.grometrys.push(geometry);
            }else{
                this.numVertices -= geometry.numVertices;
                geometry.numVertices = 0;
            }

            let dx = 0,dy = 0


            if(wpercent != 1){

                if(dir){
                    w *= wpercent; 
                    ur = wpercent * (ur - ul) + ul;
                }else{
                    dx = (1-wpercent) * w;
                    ul = (1-wpercent) * (ur - ul)  + ul;
                }

                
            }

            if(hpercent != 1){
                if(dir){
                    h *= hpercent;
                    vb = hpercent * (vb - vt) + vt;
                }else{
                    dy = (1-wpercent) * h;
                    vt = (1-wpercent) * (vb - vt) + vt;
                }
            }


            geometry.w = w;
            geometry.h = h;


            let f = m2dTransform;
            let p = [0,0,0];

            // let points = [x,y,ul,vt,r,y,ur,vt,r,b,ur,vb,x,b,ul,vb];

            let points = [dx,dy,ul,vt,w,dy,ur,vt,w,h,ur,vb,dx,h,ul,vb];

            let o = [0,0];
            if(undefined != matrix){
                f(matrix,o,o);
            }

            for(let i=0;i<16;i+=4){
                p[0] = points[i] + x - o[0];
                p[1] = points[i+1] + y - o[1];
                p[2] = z;
                if(undefined != matrix){
                    f(matrix,p,p);
                }

                // p[0] += x - o[0];
                // p[1] += y - o[1];
                this.addPoint(geometry,p,noraml,[points[i+2],points[i+3],~~index,~~$sourceIndex],rgba,locksize);
            }
            geometry.vo = vo;
            geometry.base = createGeometry(empty_float32_object,variables,geometry.numVertices);
            this.numVertices += geometry.numVertices;
            return geometry;
        }
    }
}