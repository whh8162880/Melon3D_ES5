module rf{

	export function inRange(a, min, max) {
		return min <= a && a <= max;
	}

	export function byte_div(n, d) {
		return Math.floor(n / d);
	}
	

	export function byte_Error(fatal, opt_code_point?): number {
		if (fatal) {
			// egret.$error(1027);
		}
		return opt_code_point || 0xFFFD;
	}


	export function byte_inflate(data:Uint8Array){
		return new Zlib.Inflate(data).decompress()
	}


	export function byte_decodeUTF8(data: Uint8Array): string {
		let fatal: boolean = false;
		let pos: number = 0;
		let result: string = "";
		let code_point: number;
		let utf8_code_point = 0;
		let utf8_bytes_needed = 0;
		let utf8_bytes_seen = 0;
		let utf8_lower_boundary = 0;
		let inRange = rf.inRange;
		let decoderError = byte_Error;

		while (data.length > pos) {

			let _byte = data[pos++];

			if (_byte == -1) {
				if (utf8_bytes_needed != 0) {
					code_point = decoderError(fatal);
				} else {
					code_point = -1;
				}
			} else {

				if (utf8_bytes_needed == 0) {
					if (inRange(_byte, 0x00, 0x7F)) {
						code_point = _byte;
					} else {
						if (inRange(_byte, 0xC2, 0xDF)) {
							utf8_bytes_needed = 1;
							utf8_lower_boundary = 0x80;
							utf8_code_point = _byte - 0xC0;
						} else if (inRange(_byte, 0xE0, 0xEF)) {
							utf8_bytes_needed = 2;
							utf8_lower_boundary = 0x800;
							utf8_code_point = _byte - 0xE0;
						} else if (inRange(_byte, 0xF0, 0xF4)) {
							utf8_bytes_needed = 3;
							utf8_lower_boundary = 0x10000;
							utf8_code_point = _byte - 0xF0;
						} else {
							decoderError(fatal);
						}
						utf8_code_point = utf8_code_point * Math.pow(64, utf8_bytes_needed);
						code_point = null;
					}
				} else if (!inRange(_byte, 0x80, 0xBF)) {
					utf8_code_point = 0;
					utf8_bytes_needed = 0;
					utf8_bytes_seen = 0;
					utf8_lower_boundary = 0;
					pos--;
					code_point = decoderError(fatal, _byte);
				} else {

					utf8_bytes_seen += 1;
					utf8_code_point = utf8_code_point + (_byte - 0x80) * Math.pow(64, utf8_bytes_needed - utf8_bytes_seen);

					if (utf8_bytes_seen !== utf8_bytes_needed) {
						code_point = null;
					} else {

						let cp = utf8_code_point;
						let lower_boundary = utf8_lower_boundary;
						utf8_code_point = 0;
						utf8_bytes_needed = 0;
						utf8_bytes_seen = 0;
						utf8_lower_boundary = 0;
						if (inRange(cp, lower_boundary, 0x10FFFF) && !inRange(cp, 0xD800, 0xDFFF)) {
							code_point = cp;
						} else {
							code_point = decoderError(fatal, _byte);
						}
					}

				}
			}
			//Decode string
			if (code_point !== null && code_point !== -1) {
				if (code_point <= 0xFFFF) {
					if (code_point > 0) result += String.fromCharCode(code_point);
				} else {
					code_point -= 0x10000;
					result += String.fromCharCode(0xD800 + ((code_point >> 10) & 0x3ff));
					result += String.fromCharCode(0xDC00 + (code_point & 0x3ff));
				}
			}
		}
		return result;
	}

	export function stringToCodePoints(string) {
		/** @type {Array.<number>} */
		let cps = [];
		// Based on http://www.w3.org/TR/WebIDL/#idl-DOMString
		let i = 0, n = string.length;
		while (i < string.length) {
			let c = string.charCodeAt(i);
			if (!inRange(c, 0xD800, 0xDFFF)) {
				cps.push(c);
			} else if (inRange(c, 0xDC00, 0xDFFF)) {
				cps.push(0xFFFD);
			} else { // (inRange(c, 0xD800, 0xDBFF))
				if (i == n - 1) {
					cps.push(0xFFFD);
				} else {
					let d = string.charCodeAt(i + 1);
					if (inRange(d, 0xDC00, 0xDFFF)) {
						let a = c & 0x3FF;
						let b = d & 0x3FF;
						i += 1;
						cps.push(0x10000 + (a << 10) + b);
					} else {
						cps.push(0xFFFD);
					}
				}
			}
			i += 1;
		}
		return cps;
	}


	export function byte_encodeUTF8(str: string): Uint8Array {
		let pos: number = 0;
		let codePoints = stringToCodePoints(str);
		let outputBytes = [];
		let inRange = rf.inRange;
		let decoderError = byte_Error;

		while (codePoints.length > pos) {
			let code_point: number = codePoints[pos++];

			if (inRange(code_point, 0xD800, 0xDFFF)) {
				decoderError(code_point);
			}
			else if (inRange(code_point, 0x0000, 0x007f)) {
				outputBytes.push(code_point);
			} else {
				let count, offset;
				if (inRange(code_point, 0x0080, 0x07FF)) {
					count = 1;
					offset = 0xC0;
				} else if (inRange(code_point, 0x0800, 0xFFFF)) {
					count = 2;
					offset = 0xE0;
				} else if (inRange(code_point, 0x10000, 0x10FFFF)) {
					count = 3;
					offset = 0xF0;
				}

				outputBytes.push(byte_div(code_point, Math.pow(64, count)) + offset);

				while (count > 0) {
					let temp = byte_div(code_point, Math.pow(64, count - 1));
					outputBytes.push(0x80 + (temp % 64));
					count -= 1;
				}
			}
		}
		return new Uint8Array(outputBytes);
	}


    export class Byte{
        position:number;
        length:number;
		buf:DataView;
		uint8:Uint8Array;

        constructor(buf?:ArrayBuffer){
            this.setArrayBuffer(buf);
        }

        setArrayBuffer(buf:ArrayBuffer){
            if(undefined == buf){
				this.length = this.position = 0;
				buf = new ArrayBuffer(0);
            }else{
				this.buf = new DataView(buf);
                this.length = buf.byteLength;
                this.position = 0;
			}
			this.uint8 = new Uint8Array(buf);
        }

        outOfRange(){

        }

        readByte(){
            const{position}=this;
            if(position > this.length){ this.outOfRange();return};
            let b = this.buf.getUint8(position); 
            this.position ++;
            return b;
		}
		
		writeByte(v:number){
			const{position}=this;;
			this.position++;
			this.buf.setInt8(position,v)
		}


		readUint16(littleEndian?:boolean){
			const{position}=this;
            if(position + 2 > this.length) { this.outOfRange(); return; }
            let b = this.buf.getUint16(position,littleEndian); 
            this.position = position + 2;
            return b;
		}

		writeUint16(v:number,littleEndian?:boolean){
			const{position}=this;
			this.position = position + 2;
			this.buf.setUint16(position,v,littleEndian);
		}


		writeInt(v:number){
			const{position}=this;
			this.position = position + 4;
			this.buf.setInt32(position,v)
		}

        readUInt(){
            const{position}=this;
            if(position + 4 > this.length) { this.outOfRange(); return; }
            let b = this.buf.getUint32(position); 
            this.position = position + 4;
            return b;
		}
		
		writeUInt(v:number){
			const{position}=this;;
			this.position += 4;
			this.buf.setUint32(position,v)
		}

        readDouble(){
            const{position}=this;
            if(position + 8 > this.length) { this.outOfRange(); return; }
            let b = this.buf.getFloat64(position); 
            this.position = position + 8;
            return b;
        }

        readFloat(){
            const{position}=this;
            if(position + 4 > this.length) { this.outOfRange(); return; }
            let b = this.buf.getFloat32(position); 
            this.position = position + 4;
            return b;
        }

        readMultiByte(length:number, charSet:string="utf-8"):string  {
			const{position,buf}=this;
			let end =position + length 
			
			if(end > this.length) { this.outOfRange(); return; }
			this.position += length;

			let str = byte_decodeUTF8(new Uint8Array(buf.buffer.slice(position,end)))

            // let str = "";
            // for (var i:number = 0; i < length;i++ ){
            //     str += String.fromCharCode(buf.getUint8(position + i));
            // }

			// try{
			// 	var u8 = new Uint8Array(length);
			// 	u8.set(new Uint8Array(buf.buffer.slice(position, position + length)));
			// 	var decoder = new TextDecoder(charSet);
			// 	var str = decoder.decode(u8);
			// }catch (err){
			// 	//str = String.fromCharCode.apply(null, u8);
			// 	str = "";
			// 	for (var i:number = 0; i < length;i++ ){
			// 		str += String.fromCharCode(buf.getUint8(position + i));
			// 	}
			// }
			
			return str;
		}
        
        readByteArray(length?:number):ArrayBuffer{
			const{position}=this;
			if(!length){
				length = this.length - position;
			}
            let buf = this.buf.buffer.slice(position,position+length);
            this.position += length;
            return buf;
		}
		
		writeByteArray(byte:ArrayLike<number>){
			const{position,uint8}=this;
			uint8.set(byte,position);
            this.position += byte.length;
        }
    }



    export const enum AMF3Define{
        UNDEFINED = 0x00,
        NULL = 0x01,
        FALSE = 0x02,
        TRUE = 0x03,
        // These markers represent a following value.
        INT = 0x04,
        DOUBLE = 0x05,
        STRING = 0x06,
        XMLDOC = 0x07,
        DATE = 0x08,
        ARRAY = 0x09,
        OBJECT = 0x0A,
        XML = 0x0B,
        BYTEARRAY = 0x0C,
        INTVECTOR = 0x0D,
        UINTVECTOR = 0x0E,
        DOUBLEVECTOR = 0x0F,
        OBJECTVECTOR = 0x10,
		DICTIONARY = 0x11,
		FLOAT = 0xFD
    }

    export class ClassDefine{
        className:string;
        members:string[];
        isExternalizable:boolean;
        isDynamic:boolean;
        constructor(className:string,members:string[]){
			this.className = className;
			this.members = members;
        }
    }

    export class AMF3Decode extends Byte{
        flags = 0;
        ref;
        stringsTable = [];
        objectsTable = [];
        traitsTable = [];
        clsNameMap = {};

        MASK = 1 << 28;

        constructor(buf?:ArrayBuffer){
            super(buf);
		}
		
		clear(){
			let{stringsTable,objectsTable,traitsTable}=this;
			stringsTable.length = 0;
			objectsTable.length = 0;
			traitsTable.length = 0;
			this.clsNameMap = {};
		}

        read29(unsign:boolean):number{
			var v = 0,a = 0;
			// v = this.readByte() & 0xff
			// if (v >= 0x80)
			// {
			// 	a = this.readByte();
			// 	v += (a<<7) - 0x80;
			// 	if (a >= 0x80)
			// 	{
			// 		a = this.readByte();
			// 		v += (a<<14) - 0x4000;
			// 		if (a >= 0x80)
			// 		{
			// 			a = this.readByte();
			// 			v += (a << 21) - 0x200000;
			// 		}
			// 	}
			// }
			v = this.readByte();
			if (v >= 0x80) {//U29 1bytes 0x00-0x7f
				a = this.readByte();
				v = (v & 0x7f) << 7;
				if (a < 0x80) {//U29 2bytes 0x80-0xFF 0x00-0x7f
					v = v | a;
				}else {
					v = (v | a & 0x7f) << 7;
					a = this.readByte();
					if (a < 0x80) { //U29 3bytes 0x80-0xFF 0x80-0xFF 0x00-0x7f
						v = v | a;
					}
					else {//u29 4bytes 0x80-0xFF 0x80-0xFF 0x80-0xFF 0x00-0xFF
						v = (v | a & 0x7f) << 8;
						a = this.readByte();
						v = v | a;
					}
				}
				v = -(v & 0x10000000) | v;
			}

			// if(unsign){
			// 	return v;
			// }
			// if (v & 1)
			// 	return -1 - (v>>1);
			// else
			// 	return v>>1;

			return v;


			// v = this.readByte() & 0xff;
			// if (v < 128){
			// 	return v;
			// }
			// let tmp;
			// v = (v & 0x7f) << 7;
			// tmp = this.readByte()&0xff;
			// if (tmp < 128){
			// 	v = v | tmp;
			// }else{
			// 	v = (v | tmp & 0x7f) << 7;
			// 	tmp = this.readByte()&0xff;
			// 	if (tmp < 128){
			// 		v = v | tmp;
			// 	}else{
			// 		v = (v | tmp & 0x7f) << 8;
			// 		tmp = this.readByte()&0xff;
			// 		v = v | tmp;
			// 	}
			// }
			// return -(v & this.MASK) | v;
		}

        // readInt(){
        //     return this.read29(false);
		// }
		
		readInt(){
            const{position}=this;
            if(position + 4 > this.length) { this.outOfRange(); return; }
            let b = this.buf.getInt32(position); 
            this.position = position + 4;
            return b;
		}


        readString():string{
            let handle = this.read29(true);
            let inline = (handle & 1) != 0;
            handle = handle >> 1;
            if(inline)
			{
				if (0 == handle){
					return "";
				}
				var str = this.readMultiByte(handle);
				this.stringsTable.push(str);
				return str;
			}
			
			return this.stringsTable[handle];

        }

        readDate(u29D:number):Date{
            return new Date(this.readDouble());
        }


        readObjectVector(length:number){
            let fixed = this.read29(true);
            let list = [];
            
			this.objectsTable.push(list);
			
			let index = -1;
			while(++index<length){
				list[index]=this.readObject();
			}
			
			return list;
        }


        readArray(length:number){
            const{objectsTable}=this;
			let instance = [];
			
            objectsTable.push(instance);
            let key:string;
			while(key = this.readString()){
				instance[key]=this.readObject();
			}
			var index = -1;
			while(++index<length){
				instance[index]=this.readObject();
			}
			
			return instance;
        }
        
        readDictionary(length:number){
			let weakKeys = this.readByte() != 0;
			
            var dic = {};
            
			this.objectsTable.push(dic);
			
			var key;
			var value;
			for(var i:number=0;i<length;i++){
				
				key = this.readObject();
				value = this.readObject();
				
				dic[key]=value
			}
			
			return dic;
		}

        readObject(){
			var value;
			var marker:number = this.readByte();
			switch(marker)
			{
				case AMF3Define.INT:
					value = this.read29(false);
					if(value >= 0x10000000){
						value = value - 0xFFFFFFFF-1;
					}
					break;
				
				case AMF3Define.DOUBLE:
					value = this.readDouble();
					break;
				
				case AMF3Define.FALSE:
				case AMF3Define.TRUE:
					value = (marker==AMF3Define.TRUE);
					break;
				
				case AMF3Define.NULL:
					value = null;
					break;
				
				case AMF3Define.UNDEFINED:
					value = undefined;
					break;
				
				
				case AMF3Define.STRING:
					value = this.readString();
					break;
				
				case AMF3Define.ARRAY:
				case AMF3Define.OBJECT:
				case AMF3Define.DATE:
				case AMF3Define.XML:
				case AMF3Define.XMLDOC:
				case AMF3Define.BYTEARRAY:
				case AMF3Define.OBJECTVECTOR:
				case AMF3Define.INTVECTOR:
				case AMF3Define.UINTVECTOR:
				case AMF3Define.DOUBLEVECTOR:
				case AMF3Define.DICTIONARY:
					value = this.readReferencableObject(marker);
					break;
				
				default :
					throw Error("not implement:"+marker);
					
			}
			
			return value;
		}
		

		readByteArray(length:number):ArrayBuffer{
			const{objectsTable}=this;
			let buf = super.readByteArray(length);
			objectsTable.push(buf);
			return buf;
        }

        
        
        private _readObject(handle:number):Object
		{
            const{traitsTable,objectsTable}=this;

			let traits:string[];
			let classDef:ClassDefine;
			let className:string;
			let len:number;
			let i:number;
			let inlineClassDef:Boolean = ((handle & 1) != 0);
			handle = handle >> 1;
			if( inlineClassDef)
			{
				
				className = this.readString();	
				let isIExternalizable = (handle&1) !=0;
				handle=handle>>1;
				let isDynamic = (handle&1) !=0;

				if(isDynamic == false){
					// throw new Error("not a Object");
				}

				len=handle>>1;
				
				traits= [];
				for(i=0;i<len;i++){
					traits[i]=this.readString();
				}
				classDef=new ClassDefine(className,traits);
				classDef.isExternalizable=isIExternalizable;
				classDef.isDynamic=isDynamic;
				
				traitsTable.push(classDef);
			}else{
				classDef = traitsTable[handle];
				if(!classDef)
				{
					throw new Error("no trait found with refId: "+handle);
				}
				traits=classDef.members;
				className=classDef.className;
			}
			
            var instance;
            instance = {};
			
			objectsTable.push(instance);
			
            
            for(let key in traits){
                key = traits[key];
                instance[key]= this.readObject();
            }

			if(classDef.isDynamic){	
                let key;
				while(key = this.readString()){
					instance[key] = this.readObject();
				}
			}
			
			return instance;
		}
        readReferencableObject(marker:number)
		{
            const{objectsTable}=this;
			let object;
			let handle = this.read29(true);
			let isIn = (handle&1) == 0;
			handle=handle>>1;
			
			if( isIn)
			{
				object = objectsTable[handle];
				return object;
			}
			else
			{
				switch(marker)
				{
					case AMF3Define.ARRAY:
						object = this.readArray(handle);
						break;
					
					case AMF3Define.OBJECT:
						object = this._readObject(handle);
						break;
					
					case AMF3Define.DATE:
						object = this.readDate(handle);
						break;
					
					case AMF3Define.XML:
						object = this.readMultiByte(handle);
						break;
					
					case AMF3Define.XMLDOC:
						object = this.readMultiByte(handle);
						break;
					case AMF3Define.BYTEARRAY:
						object = this.readByteArray(handle);
						break;
					case AMF3Define.OBJECTVECTOR :
					case AMF3Define.UINTVECTOR:
					case AMF3Define.INTVECTOR:
					case AMF3Define.DOUBLEVECTOR:
						object = this.readObjectVector(handle);
						break;
					case AMF3Define.DICTIONARY :
						object = this.readDictionary(handle);
						break;
					
					default :
						throw Error("not implement:"+handle);
				}
				
			}
			return object;
			
		}
	}
	
	export class AMF3Encode extends Byte{

		stringsTable = [];
        objectsTable = [];
		traitsTable = [];
		
		unit8:Uint8Array

		constructor(buf?:ArrayBuffer){
			super(buf || new ArrayBuffer(10240*1024));
			this.unit8 = new Uint8Array(this.buf.buffer);
		}

		clear(){
			let{stringsTable,objectsTable,traitsTable}=this;
			stringsTable.length = 0;
			objectsTable.length = 0;
			traitsTable.length = 0;
			this.position = 0;
		}

		writeByte(value:number){
			this.buf.setUint8(this.position,value);
			this.position ++;
		}

		writeFloat(value:number){
			this.buf.setFloat32(this.position,value);
			this.position += 4;
		}

		writeDouble(value:number){
			this.buf.setFloat64(this.position,value);
			this.position += 8;
		}

		

		writeString(str:string){
			
			let{stringsTable}=this;
			let index = stringsTable.indexOf(str);

			let handle
			if(index == -1){

				let byte = byte_encodeUTF8(str);

				let length = byte.length;
				handle = length << 1;
				handle |= 1;
				this.write29(handle,true);
				
				this.writeByteArray(byte);

				// let{position,buf}=this;
				// for (var i:number = 0; i < length;i++ ){
				// 	buf.setUint8(position++,str.charCodeAt(i));
				// }
				// this.position = position;

				stringsTable.push(str);
			}else{
				handle = index << 1;
				handle |= 0;
				this.write29(handle,true);
			}
        }

		

		write29 (v:number,unsign:boolean)
		{
			// if(unsign == false){
			// 	if (v < 0)
			// 		v = (-v - 1)*2 + 1;
			// 	else
			// 		v *= 2;
			// }

			let len = 0;
			if (v < 0x80) len = 1;
			else if (v < 0x4000) len = 2;
			else if (v < 0x200000) len = 3;
			else len = 4;
			// else if (v < 0x40000000) len = 4;
			// else throw new Error("U29 Range Error");// 0x40000000 - 0xFFFFFFFF : throw range exception

			switch (len) {
				case 1:// 0x00000000 - 0x0000007F : 0xxxxxxx
					this.writeByte(v);
					break;
				case 2:// 0x00000080 - 0x00003FFF : 1xxxxxxx 0xxxxxxx
					this.writeByte(((v >> 7) & 0x7F) | 0x80);
					this.writeByte(v & 0x7F);
					break;
				case 3:// 0x00004000 - 0x001FFFFF : 1xxxxxxx 1xxxxxxx 0xxxxxxx
					this.writeByte(((v >> 14) & 0x7F) | 0x80);
					this.writeByte(((v >> 7) & 0x7F) | 0x80);
					this.writeByte(v & 0x7F);
					break;
				case 4:// 0x00200000 - 0x3FFFFFFF : 1xxxxxxx 1xxxxxxx 1xxxxxxx xxxxxxxx
					this.writeByte(((v >> 22) & 0x7F) | 0x80);
					this.writeByte(((v >> 15) & 0x7F) | 0x80);
					this.writeByte(((v >> 8) & 0x7F) | 0x80);
					this.writeByte(v & 0xFF);
					break;
			}
		

			// // 写入 7 位
			// if (v < 0x80)
			// 	return this.writeByte (v);
			// this.writeByte (v|0x80);
			// v = v >> 7;

			// // 写入 7 位
			// if (v < 0x80)
			// 	return this.writeByte (v);
			// 	this.writeByte (v|0x80);
			// v = v >> 7;

			// // 写入 7 位
			// if (v < 0x80)
			// 	return this.writeByte (v);
			// 	this.writeByte (v|0x80);
			// v = v >> 7;

			// // 写入 8 位
			// if (v >= 0x100)
			// 	throw new Error ('bad integer value');
			// this.writeByte (v);
		}

		isRealNum(val){
			// isNaN()函数 把空串 空格 以及NUll 按照0来处理 所以先去除
			if(val === "" || val ==null){
				return false;
			}
			if(!isNaN(val)){
				return true;
			}else{
				return false;
			}
		}  

		writeObject(o){
			let type = typeof o;
			if(type === "string"){
				this.writeByte(AMF3Define.STRING);
				this.writeString(String(o));
			}else if(type === "boolean"){
				this.writeByte(o == true ? AMF3Define.TRUE:AMF3Define.FALSE);
			}else if('number' === type){
				if((o >> 0) === o && o >= -0x10000000 && o < 0x10000000){
					if(o<0){
						o = 0xFFFFFFFF + (o+1);
					}
					this.writeByte(AMF3Define.INT);
					this.write29(o,false);
				}else{
					this.writeByte(AMF3Define.DOUBLE);
					this.writeDouble(o);
				}
			}else if(o instanceof Uint8Array 
				|| (o instanceof Uint32Array) 
				|| (o instanceof Uint16Array) 
				|| (o instanceof Float32Array) 
				|| o instanceof Float64Array
			){
				this.writeBytes(o.buffer)
			}else if(o instanceof ArrayBuffer){
				this.writeBytes(o)
			}else if(o instanceof Array){
				this.writeArray(o);
			}else if(o instanceof Object){
				this.writeByte(AMF3Define.OBJECT);
				const{objectsTable}=this;
				let index = objectsTable.indexOf(o);
				let ins = 0;
				if(index != -1){
					this.write29(index << 1,true);
					return;
				}

				objectsTable.push(o);

				this.write29(0b1011,true); //isDynamic && isIExternalizable && inlineClassDef && 新对象
				this.write29(0b1,true);	//class name

				for(let key in o){
					this.writeString(key);
					this.writeObject(o[key]);
				}

				this.writeByte(1) //结束
			}else if(null === o){
				this.writeByte(AMF3Define.NULL)
			}else if(undefined === o){
				this.writeByte(AMF3Define.UNDEFINED)
			}
		}

		writeArray(arr){
			this.writeByte(AMF3Define.ARRAY);

			const{objectsTable}=this;
			let index = objectsTable.indexOf(arr);
			let ins = 0;
			if(index != -1){
				this.write29(index << 1,true);
				return;
			}

			objectsTable.push(arr);
			let len = arr.length;
			this.write29( (len << 1) | 1,true);
			this.writeByte(1);
			for(let i = 0;i<len;i++){
				this.writeObject(arr[i]);
			}
		}
		

		writeBytes(buffer:ArrayBuffer){
			this.writeByte(AMF3Define.BYTEARRAY);
			const{objectsTable}=this;
			let index = objectsTable.indexOf(buffer);
			let ins = 0;
			if(index != -1){
				this.write29(index << 1,true);
				return;
			}

			objectsTable.push(buffer);

			let length = buffer.byteLength;
			this.write29((length << 1) | 1,true);

			this.unit8.set(new Uint8Array(buffer),this.position);
			this.position += buffer.byteLength;
		}
		

		toUint8Array(){
			return new Uint8Array(this.buf.buffer).slice(0,this.position);
		}

		toArrayBuffer(pos?:number){
			if(!~~pos){
				pos = this.position;
			}
			return this.buf.buffer.slice(0,pos);
		}

	}


	export function amf_writeObject(obj:object){
		let amf = singleton(AMF3Encode);
		amf.clear();
		amf.writeObject(obj);
		return amf.toUint8Array();
	}


	export function amf_readObject(byte:ArrayBuffer | Uint8Array){
		let amf = singleton(AMF3Decode);
		// var inflate = new Zlib.Inflate(new Uint8Array(byte));
		// var plain;
		// if(inflate instanceof Uint8Array){
		// 	plain = inflate;
		// }else{
		// 	plain = inflate.decompress();
		// }
		// amf.setArrayBuffer(plain.buffer);
		if(byte instanceof Uint8Array){
			byte = byte.buffer;
		}
		amf.clear();
		amf.setArrayBuffer(byte);
		let o = amf.readObject();
		return o;
	}
}