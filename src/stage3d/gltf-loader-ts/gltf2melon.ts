module rf{

    export var VERTXT_ATTRIBUTES:string[][] = [
        ["pos" ,"POSITION"],
        ["normal", "NORMAL"],
        ["uv", "TEXCOORD_0"]
    ];

    export var VERTXT_ATTRIBUTES_MAP:{[key:string]: string} = {
        POSITION: "pos",
        NORMAL:"normal",
        TEXCOORD_0: "uv",
    }



    export class GLTf2MelonLoader{

        gltfurl:string = "izzy";//dance, izzy, hero01
        asset:gltfloader.GltfAsset;
        gltf:gltfloader.GlTf;

        

        //step 1 : parse skeletonData
        bones:{[key:number]:IBone};
        //step 2 : parse materials
        materials:{[key:number]:IMaterialData};
        //step 3 : parse MeshData
        meshdatas:{[key:number]:IMeshData};
        //step 4 : create SkeletonMeshData
        skelondatas:{[key:number]:ISkeletonData};

        meshAttrBuffers:{[key:number]: any};

        async load(gltfname:string = "hero01"){


            this.gltfurl = gltfname;

            let loader = new gltfloader.GltfLoader()
            let uri = RES_PERFIX  + "gltf/" + this.gltfurl + "/scene.gltf";


            let asset: gltfloader.GltfAsset = this.asset = await loader.load(uri);

            let gltf: gltfloader.GlTf = this.gltf = asset.gltf;

            // let data = await asset.preFetchAll();

            this.meshdatas = {};
            this.materials = {};
            this.skelondatas = {}
            this.meshAttrBuffers = {};
            let bones: {[key:string] : IBone} = this.bones = {};
            
            console.log(gltf);

            let{scenes, meshes, skins, nodes} = gltf;

            //1,
            this.parseNode();
            this.initBones();
            let rootbone = bones[scenes[0].nodes[0]];
            //2,
            this.loadMaterial();
            //3,
            await this.loadMeshes();
            //4,
            this.initSkeletonData();
            this.initSkeletonMeshData();



            console.log(this);
            let a = 0;
        }

        async initBones(){
            let{gltf, asset, bones} = this;
            let{skins} = gltf;
            for (let i = 0; i < skins.length; i++) {
                const element = skins[i];
                let{inverseBindMatrices, skeleton, joints, name} = element;
                // let boneCount = joints.length;
                let invMatrix = (await asset.accessorTypedData(inverseBindMatrices)) as Float32Array;

                for (let j = 0; j < joints.length; j++) {
                    let bone = bones[joints[j]]
                    bone.index = j;
                    bone.inv = new Float32Array(invMatrix.subarray(j*16,(j+1)*16));
                }
            }
        }
        async loadMeshes(){
            let {gltf, asset} = this;
            let {meshes} = gltf;
            for (let i = 0; i < meshes.length; i++) {
                const element = meshes[i];
                await this.loadMesh(element, i)
            }
        }

        async loadMesh(meshdef:gltfloader.Mesh, i:number){
            let{gltf, asset} = this;
        
            let{name, primitives, weights, extensions, extras} = meshdef;
        
            let meshdata = {} as IMeshData;

            let variables = meshdata.variables = {};
            
            this.meshdatas[i] = meshdata;

            if(primitives && primitives.length == 1){

                const primitive = primitives[0];
                // get the vertex data for the primitive
                let{attributes, material:materialix,  indices} = primitive;
                if(indices != undefined){
                    let idxacc = gltf.accessors[indices]; // acc define
                    let indexData = await asset.accessorTypedData(indices);
                    meshdata.numTriangles = idxacc.count/3;
                    meshdata.index = indexData;
                }

                let attributes_bufferdata = this.meshAttrBuffers[i] = {};
                let offset = 0;
                let attracc = undefined;
                meshdata.data32PerVertex = 0;
                
                // for (let i = 0; i < VERTXT_ATTRIBUTES.length; i++) {
                for(let key in attributes){
                    
                    attracc = gltf.accessors[attributes[key]];
                    const elementsPerType = gltfloader.GLTF_ELEMENTS_PER_TYPE[attracc.type];//元素数量， scalar, vec3, matrix4 ...
                    
                    let valueData = await asset.accessorTypedData(attributes[key])
                    attributes_bufferdata[key] = valueData;

                    let melon_attr = VERTXT_ATTRIBUTES_MAP[key];
                    if(melon_attr != undefined){
                        meshdata.data32PerVertex += elementsPerType;
                        variables[melon_attr] = {size: elementsPerType, offset } as IVariable;
                        offset += elementsPerType;
                    }
                    
                }
                attracc = gltf.accessors[attributes.POSITION];
                let{count} = attracc;
                meshdata.numVertices = count;
                
                const typedData = new gltfloader.GLTF_COMPONENT_TYPE_ARRAYS[attracc.componentType] (meshdata.data32PerVertex * count);
                
                for (let l = 0; l < count; l++) {
                    for (let m = 0; m < VERTXT_ATTRIBUTES.length; m++) {
                        const [melon_attr, key] = VERTXT_ATTRIBUTES[m];
                        if(attributes[key] == undefined ){
                            continue;
                        }
                        let valueData = attributes_bufferdata[key];
                        let variable = meshdata.variables[melon_attr];
                        for (let n = 0; n < variable.size; n++) {
                            typedData[l * meshdata.data32PerVertex +  variable.offset + n] = valueData[l * variable.size + n];
                        }
                    }    
                }
                meshdata.vertex = typedData;
                
            }
        }

        initSkeletonData(){
            let{gltf, asset, meshAttrBuffers, skelondatas, bones} = this;
            
            let{meshes, nodes, skins, scenes} = gltf;
            
            let rootbone = bones[scenes[0].nodes[0]];

            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                let{mesh, skin} = node;
                if(mesh != undefined && skin != undefined){
                    let meshdef = meshes[mesh];
                    let skindef = skins[skin];

                    let{name, primitives, weights, extensions, extras} = meshdef;
                    if(primitives && primitives.length == 1){
                        const primitive = primitives[0];
                        // get the vertex data for the primitive
                        let{attributes, material:materialix,  indices} = primitive;
                        
                        
                        let jointsacc = gltf.accessors[attributes.JOINTS_0];
                        let weightsacc = gltf.accessors[attributes.WEIGHTS_0];
                        if(!jointsacc || !weightsacc){
                            continue;       
                        }
                        const elementsPerType = gltfloader.GLTF_ELEMENTS_PER_TYPE[jointsacc.type]

                        let skeletondata = {} as ISkeletonData;
                        skelondatas[mesh] = skeletondata;
                        this.skelondatas[mesh] = skeletondata;

                        let{count} = jointsacc;
                        skeletondata.numVertices = count;
                        skeletondata.root = rootbone;
                        skeletondata.boneCount = skindef.joints.length;
                        skeletondata.data32PerVertex = elementsPerType*2;
                        
                        const typedData = new gltfloader.GLTF_COMPONENT_TYPE_ARRAYS[weightsacc.componentType] (skeletondata.data32PerVertex * count);
                        
                        let skeletonDataAttrs = ["JOINTS_0", "WEIGHTS_0"];
                        let attributes_bufferdata = meshAttrBuffers[mesh]
                        for (let k = 0; k < count; k++) {
                            for (let l = 0; l < skeletonDataAttrs.length; l++) {
                                const key = skeletonDataAttrs[l];
                                let valueData = attributes_bufferdata[key];
                                for (let m = 0; m < elementsPerType; m++) {
                                    typedData[k * elementsPerType * 2 +  elementsPerType*l + m] = valueData[k * elementsPerType + m];
                                }
                            }    
                        }
                        skeletondata.vertex = typedData;
                        break;
                    }
                    
                }
            }

        }

        initSkeletonMeshData(){
            let{gltf, asset,  skelondatas, meshdatas, materials} = this;
            let{meshes} = gltf;
            let skelentonMeshDatas = {}
            for(let key in skelondatas){
                let skelondata = skelondatas[key];
                let meshdata = meshdatas[key];
                let meshdef = meshes[key];

                let materialdef = materials[meshdef.primitives[0].material];

                let o = {} as ISkeletonMeshData;
                o.mesh = meshdata;
                o.material = materialdef;
                o.skeletonData = skelondata;
                skelentonMeshDatas[key] = o;

                let mesh = new KFMMesh();
                mesh.setKFM(o);

                rf.scene.addChild(mesh)
            }
        }

        loadMaterial(){
            let{gltf, asset, materials:dic} = this;
            let {materials} = gltf;

            for (let i = 0; i < materials.length; i++) {
                let materialDef = materials[i];
                let baseColorTexture = gltf.textures[materialDef.pbrMetallicRoughness.baseColorTexture.index];
                let imageIndex = baseColorTexture.source;
                // let image = await asset.imageData.get(imageIndex);
                let texUrl = "gltf/" + this.gltfurl + "/" + gltf.images[imageIndex].uri;

                let o = {} as IMaterialData;
                o.cull = materialDef.doubleSided ? WebGLConst.NONE : WebGLConst.BACK;
                o.cull = WebGLConst.NONE;
                o.depthMask = true;
                o.passCompareMode = WebGLConst.LEQUAL;
                o.srcFactor = WebGLConst.SRC_ALPHA;
                o.dstFactor = WebGLConst.ONE_MINUS_SRC_ALPHA;
                o.alphaTest = -1;
                o.diffTex = context3D.getTextureData(texUrl);
                dic[i] = o;
            }
        }


        parseNode(){

            let{gltf, asset, bones} = this;
            let{nodes} = gltf;
            //1, create bones
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                
                let {children,camera,skin, mesh, matrix, name, rotation, scale, translation,
                    weights, extensions, extras} = node;
                
                let bone = {} as IBone;
                bone.index = -1;
                bone.name = name;

                let transform:IMatrix3D;
                if(matrix){
                    transform = new Float32Array(matrix);
                }else{
                    transform = newMatrix3D();
                    let pos = translation || newVector3D();
                    let rot = rotation || newVector3D()
                    let sca = scale || newVector3D(1,1,1)
    
                    transform.m3_recompose(pos, rot, sca,Orientation3D.QUATERNION);
                }

                bone.matrix = transform;
                bone.children = [];
    
                bones[i] = bone;
            }
            //2，set children and parents
            for (let i = 0; i < nodes.length; i++) {
                const node = nodes[i];
                let bone = bones[i];
                let{children} = node;
                if(children){
                    for (let j = 0; j < children.length; j++) {
                        let cbone = bones[children[j]];
                        cbone.parent = bone;
                        bone.children.push(cbone);
                    }
                }
            }

        }




    }
}