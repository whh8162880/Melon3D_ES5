// ///<reference path="./FileReference.ts" />
// module rf{

//     export var fileSystem:wx.FileSystemManager;

//     export class File extends FileReference{

//         constructor(path:string){
//             super(path)
//         }

//         get exists(){
//             return fileSystem.accessSync(this.nativePath);
//         }



//         read(){
//             return undefined
//         }

//         readUTF8(type:string = "utf8"):string{
//             return undefined
//         }

//         mkdir(path:string){
//             if(this.exists == false){
//                 this.parent.mkdir(this.name);
//             }
//         }

//         write(buf:Uint8Array){
//         }

//         writeUTF8(value:string){

//         }

//         getDirectoryListing():File[]{
//             return undefined;
//         }

//         copyto(to:File|string){

//         }

//         moveto(to:File|string){

//         }
//     }
// }