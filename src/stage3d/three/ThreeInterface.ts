module rf{
    /**
     * 材质球数据
     */
    export interface IMaterialData extends IData{
        depthMask:boolean;
        passCompareMode:number;
        srcFactor:number;
        dstFactor:number;
        cull:number;
        alphaTest:number; //0表示不剔除
        diffTex?:ITextureData;
        specularTex?:ITextureData;
        normalTex?:ITextureData;
        emissiveTex?:ITextureData;
    }

    /**
     * 模型数据
     */
    export interface IMeshData extends IData{
        vertex:Float32Array;
        index:Uint16Array;
        variables:{ [key: string]: IVariable };
        numVertices:number;
        numTriangles:number;
        data32PerVertex:number;

        vertexBuffer:VertexBuffer3D;
        indexBuffer:IndexBuffer3D;

        hitarea:HitArea;
        nameLabelY:number;
    }

    /**
     * 单骨骼数据
     */
    export interface IBone extends IData{
        inv: IMatrix3D;
        matrix: IMatrix3D;
        sceneTransform: Float32Array;
        name: string;
        index: number;
        parent: IBone;
        children: IBone[];
    }

    /**
     * 全骨骼数据
     */
    export interface ISkeletonData extends IData{
        vertex:Float32Array;
        rootBone:IBone;
        root?:IBone;
        data32PerVertex:number;
        numVertices: number;
        boneCount:number;
    }





    export interface ISkeletonMeshData extends IData{
        mesh:IMeshData;
        material:IMaterialData;
        skeletonData:ISkeletonData;
        anims:string[];
        inited:boolean;
        skeleton:Skeleton;
        shadowCast:boolean;
        sun:boolean;
    }

    export interface ISkeletonMatrixData{
        pos:IVector3D;
        qua:IVector3D;
    }


    export interface ISkeletonCalcTarget{
        pos:IVector3D;
        qua:IVector3D;
        mat:IMatrix3D;
        out:IVector3D;
    }


    export interface ISkeletonAnimationData extends IData{
        skeleton: Skeleton;
        matrices:Float32Array[];
        boneTransform:{[key:string]:IMatrix3D}[];
        boneMatrix3D:{[key:string]:ISkeletonMatrixData}[];
        duration:number;
        eDuration:number;
        totalFrame:number;
        name:string;
        frames:{[key:string]:Float32Array};
    }


    //==========================================================================================================================================
    //  PARTICLE
    //==========================================================================================================================================
    export interface IParticlePropertyData{
        delay:number;
        duration:number;
        index:number;
        startTime:number;
        total:number;
        totalTime:number;
    }

    export interface IParticleRuntimeData extends IMeshData{
        props:IParticlePropertyData[];
    }

    export interface IParticleSettingData{
        offset:number;
        speed:number;
        pos:IVector3D;
        rot:IVector3D;
    }

    export interface IParticleNodeInfo{
        name:string;
        type:number;

        key:string;

        vertexFunction:string;

        fragmentFunction:string;

    }

    export interface IParticleTimeNodeInfo extends IParticleNodeInfo{
        usesDuration:boolean;
        usesLooping:boolean;
        usesDelay:boolean;
    }

    export interface IParticleFollowNodeInfo extends IParticleNodeInfo{
        
    }


    export interface IParticleScaleNodeInfo extends IParticleNodeInfo{
        scaleType:number;
        usesCycle:boolean;
        usesPhase:boolean;
    }

    export interface IParticleSegmentColorNodeInfo extends IParticleNodeInfo{
        usesMul:boolean;
        usesAdd:boolean;
        len:number;
        mul:number;
        add:number;
        data:Float32Array;
    }

    export interface IParticleSpriteSheetAnimNodeInfo extends IParticleNodeInfo{
        usesCycle:boolean;
        usesPhase:boolean;
        totalFrames:number;
        colum:number;
        rows:number;
        data:Float32Array;
    }

    export interface IParticleData{
        material:IMaterialData;
        mesh:IMeshData;
        runtime:IParticleRuntimeData;
        setting:IParticleSettingData;
        nodes:{[key:string]:IParticleNodeInfo}
    }

    //====================================================================================
    //  Skill
    //====================================================================================
    export interface ISkillEvent{
        type:SkillEventConst;
        time:number;

        key:string;
        next:ISkillEvent;
        pre:ISkillEvent;

        x:number;
        y:number;
        z:number;

        rx:number;
        ry:number;
        rz:number;

        ou:number;
        ov:number;
        su:number;
        sv:number;

        mr:number;
        mg:number;
        mb:number;
        ma:number;
        
        ar:number;
        ag:number;
        ab:number;
        aa:number;


        fre:number;

        url:string;
        
        repart:number;
    }


    export interface ISkillCreateEvent{
        type:SkillEventConst;
        time:number;
        url:string;

        x:number;
        y:number;
        z:number;

        rx:number;
        ry:number;
        rz:number;
    }

    export interface ISkillPointData{
        events:ISkillEvent[];
        creates:ISkillEvent[];
        time:number;
        index:number;
    }

    export interface ISkillLineData{
        desc:string;            //描述
        duration:number;        //持续时间
        loop:number;           //循环  0 无限循环 n 循环n次
        creates:ISkillCreateEvent[];     //创建列表
        events:ISkillEvent[];      //
    }

    export interface ISkillData{
        duration:number;
        lines:ISkillLineData[];
    }


    export const enum SkillEventConst{
        BIND = 0,
        COLOR = 1,
        ROT = 2,
        SCALE = 3,
        POS = 4,
        UV = 5,
        PLAY_ANIM = 6,
        SYNC_POSITION = 7,
        ALPHA = 8,
        BIND_ONCE = 9,
		TRACE  = 10,	//追踪
		EMIT   = 11,	//发射
		SYNC_ROTATION 	= 12,
		SOUND 		= 13,
		COLLISION     = 14,
		ROT_CASTER     = 15,
		TRANS_CASTER   = 16,
		USER_DEFINE    = 17,
		LIU_GUANG		= 18,
		WARYING		= 19,//扭曲
		LIGHT_RANGE	= 20,//灯光范围
		CAMERA_MOVE 	= 21,
		ALPHA_THRESHOLD= 22,
		PLAY_SKILL     = 23,
		SPRING_TRANSLATE= 24,//弹簧状偏移
		ANIMSPEED 	= 25,
		SWORD_LIGHT 	= 26,//刀光
		LINES 		= 27,// 线渲染器
		SWING_LINES	= 28,
		CASTER_SCALE	= 29,
		TEXTURE_CHANNEL = 30,
		COLOR_TRANFORM = 31,
        EVENTCOUNT,
        

        //创建型(独立);
		INVALID_CREATE= 255,
		EFFECT_CREATE = 256,
		PARTICLE_CREATE = 257,
        LIGHT_CREATE = 258,
        SKILL_CREATE = 259,
		TEFFECT_CREATE
    }}