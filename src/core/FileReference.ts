module rf{
    export class FileReference{
        static CLS:{new (path:string):FileReference} = FileReference;

        nativePath:string;
        constructor(path:string){
            path = path.replace(/\\/g,"/");
            this.nativePath = path;
            if(path.indexOf(".") == -1){
                if(path[path.length - 1] != "/"){
                    this.nativePath += "/";
                }
            }
        }

        join(f:string,t:string){
            var bf = f;
            var bt = t;
            if(f.lastIndexOf(".") != -1){
                f = f.slice(0,f.lastIndexOf("/")+1);   
            }
            t = t.replace(/\\/g,"/");
            var i;
            while(true){
                i = t.indexOf("../");
                if(i != -1){
                    f = f.slice(0,f.lastIndexOf("/",f.length - 2) + 1);
                    t = t.replace("../","");
                }else{
                    break;
                }
            }
            t = t.replace(/\.\//g,"");
            return f + t;
        }


        get name():string{
            let _name = this.nativePath;
            _name = _name.slice(_name.lastIndexOf("/",_name.length - 2)).replace(/\//g,"");
            return _name;
        }

        get extname():string{
            let _name = this.nativePath;
            return _name.slice(_name.lastIndexOf(".")).toLocaleLowerCase();            
        }

        get exists(){
            return false;
        }

        isFile(){
            return false;
        }

        get parent(){
            let{nativePath} = this;
            let i = nativePath.lastIndexOf("/",nativePath.length-2);
            if(i == -1){
                return undefined;
            }
            nativePath = nativePath.slice(0,i);
            return new FileReference.CLS(nativePath);
        }


        read(){
            return undefined
        }

        readUTF8(type:string = "utf8"):string{
            return undefined
        }

        mkdir(path:string){
            if(this.exists == false){
                this.parent.mkdir(this.name);
            }
        }

        write(buf:Uint8Array){
        }

        writeUTF8(value:string){
        }

        copyto(to:FileReference|string){

        }

        moveto(to:FileReference|string){

        }


        getDirectoryListing():FileReference[]{
            return undefined;
        }


        resolvePath(path:string){
            var f:FileReference;
            if(this.isFile() == true){
                f = this.parent;
            }else{
                f = this;
            }
            return new FileReference.CLS(f.nativePath + path);
        }


        getAllFiles():FileReference[]{
            return undefined;
        }


    }
}