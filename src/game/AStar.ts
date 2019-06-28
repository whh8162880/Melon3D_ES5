module rf{

    export class AStar{

        map:Map2DSetting;

        xfrom:number;
        yfrom:number;

        xto:number;
        yto:number;

        event:MiniDispatcher;

        openlist:number[][];
        closelist:number[];

        minNode:number[];

        aSurOff:number[][] = [ [-1, -1], [0, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1] ]

        minih:number;

        go(map:Map2DSetting,xfrom:number,yfrom:number,xto:number,yto:number,event?:MiniDispatcher){
            this.map = map;
            this.xfrom = xfrom;
            this.yfrom = yfrom;
            this.xto = xto;
            this.yto = yto;
            this.event = event;
            this.minNode = undefined;
            this.minih = 99999999;

            this.openlist = [ [xfrom,yfrom,0,Math.abs(xfrom - xto) * 10 + Math.abs(yfrom - yto) * 10 , null] ];
            this.closelist = [];

            this.excute();

            

            if(!event){
                // return this.getNearest();
                return this.merge(map,this.getNearest())
            }
        }


        getPushIndex(wayList:number[][],f:number){
			var length = wayList.length-1
			if(length < 0){
				return 0
			}
			
			var flag:number
			var num = length + 1
			var index = (num / 2) >> 0
			
			while(num>1){
				flag = num & 1
                num = (num+flag)>>1
                let node = wayList[index];
				if(f<=node[2] + node[3]){
					index -= num
					if(index<0) index = 0
				}else{
					index += num
					if(index>=length){
						index = length
					}
				}
			}
			
			if(f>wayList[index][2]){
				return ++index
            }
            
            return index
		}



        excute(){
            let{openlist,closelist,event,xto,yto,map,aSurOff}=this;
            let{w,h} = map;


            while(openlist.length){
                let node = openlist.shift();
                let [x,y,g] = node;
                let index = y * w + x;
                if(closelist[index]){
                    continue;
                }

                closelist[index] = 1;

                if(x == xto && y == yto){

                    this.minNode = node;

                    if(event){
                        event.simpleDispatch(EventT.COMPLETE);
                    }

                    return 0;
                }

                for (let i = 0; i < aSurOff.length; i++) {
                    let [dx,dy] = aSurOff[i];

                    dx += x;
                    dy += y;

                    if( dx < 0 || dy < 0 || dx >= w || dy >= h ){
                        continue;
                    }

                    index = dy * w + dx;
                    let cg = map.getWalk(dx,dy);

                    if( cg < 1 || closelist[index] ) {
                        continue;
                    }


                    let temp1 = dx - x + dy - y;
					temp1=temp1 < 0 ? -temp1 : temp1;
					let temp2 = xto - dx;
					temp2=temp2 < 0 ? -temp2 : temp2;
					let temp3 = yto - dy;
                    temp3=temp3 < 0 ? -temp3 : temp3;
                    
                    let newNode = [
                        dx,
                        dy,
                        (temp1 == 1 ? 10 + g : 14 + g),
                        (temp2 + temp3) * 10,
                        node
                    ]

                    let gh = (newNode[2] as number) + (newNode[3] as number);
                    index = this.getPushIndex(openlist, gh);

                    if(newNode[3] < this.minih){
                        this.minih = newNode[3] as number;
                        this.minNode = newNode as any;
                    }

                    openlist.splice(index,0,newNode as any);

                }

            }


            if(event){
                event.simpleDispatch(EventT.COMPLETE);
            }

            return 0;

        }


        getNearest(){
            let{minNode} = this;
            return minNode && minNode.length ? this.format(minNode) : undefined;
        }

        format(node:any[])
		{
			var arr =[]
			var i = 0
			while (node)
			{
				arr.push([node[0], node[1]])
				node=node[4];
				i++
			}
			arr.reverse();
			return arr;
        }
        



        /**
		 *  合并顶点
		 * @param nearest
		 * @return
		 *
		 */
		merge(ml:Map2DSetting,nearest:number[][])
		{
			var len = nearest.length;
			if (len < 2)
			{
				return nearest;
			}
            var path:number[][] = [];
            var startIndex = 0; //从第一个格子开始优化，可在mouseDown一直按着的时候减少faceto的改变
            var endIndex = len - 1;
            var index:number ;

            while (startIndex <= endIndex)
            {
                var current =nearest[startIndex++];
                path.push(current);
                var sx = current[0];
                var sy = current[1];
                index=endIndex;
                
                while (index > startIndex)
                {
                    var test =nearest[index];
                    var flag =true;
                    var ex = test[0];
                    var ey = test[1];
                    var checkD = 1;
                    var dx = ex - sx;
                    var dy = ey - sy;
                    var dist =Math.sqrt(dx * dx + dy * dy);
                    var px =dx / dist;
                    var py =dy / dist;

                    while (dist > checkD)
                    {
                        dx=Math.round(ex - px * checkD);
                        dy=Math.round(ey - py * checkD);
                        if (!ml.getWalk(dx, dy))
                        {
                            flag=false;
                            break;
                        }
                        checkD++;
                    }

                    if (flag)
                    {
                        startIndex=index;
                        break;
                    }
                    index--;
                }
            }

            return path;
		}


    }
}