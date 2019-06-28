module rf{
    export function debugPanelSource(event:EventX){
        let source = event.data as PanelSource;
        if(!source) return;

        debugCanvas((source.bmd as BitmapData).canvas);
    }


    export function debugCanvas(canvas:HTMLCanvasElement,fullscale?:boolean,ox = 0,oy = 0){

        let oldCanvas = document.getElementById("dcanvas");

        if(oldCanvas && oldCanvas != canvas){
            oldCanvas.removeEventListener("click",clickRemoveElement);
            oldCanvas.remove();
        }

        let style = canvas.style;
        style.position ="absolute";
        style.left = ox / pixelRatio + "px";
        style.top = oy / pixelRatio + "px";
        // style.border = "2px solid #BC78DD";
        canvas.id = "dcanvas";
        style["transform-origin"] = "0% 0% 0px";

        let scale = 1;

        if(!fullscale){
            let sx = sceneWidth / canvas.width;
            let sy = sceneHeight / canvas.height;
            scale = sx > sy ? sy : sx;
        }

        if(scale > 1){
            scale = 1;
        }

        style.transform = `matrix(${scale / pixelRatio}, 0, 0, ${scale / pixelRatio}, 0, 0)`;

        document.body.appendChild(canvas);

        canvas.onclick = clickRemoveElement.bind(canvas);
    }

    export function clickRemoveElement(event:MouseEvent){
        if(event.ctrlKey){
            this.remove();
        }
    }
}
