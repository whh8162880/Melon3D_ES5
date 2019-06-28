module rf{
    export interface IPANEL_TWEEN_DATA{
        type:string;
        time:number;
        duration?:number;
        lifetime?:number;
    
        offsetDegree?:number | number[];
        ease?:string;
    
        from?:number | number[];
        to?:number | number[];
    
        len?:number | number[];
        degree?:number | number[];
    
        so?:{[key:string]:number};
        eo?:{[key:string]:number};
    
        ef?:string;
        p?:any;
        t?:any;
        sp?:number;
    
        rt?:boolean
    }
    
    
    //======================================================================
    
    export interface IPANEL_GLOBAL_CONFIG_BATTLE{
        time:number;
        atk:number[][];
    }
    
    export interface IPANEL_ENERGY{
        max:number;
        recover:number;
        attack:number;
    }
    
    export interface IPANEL_ATTACK{
        cd:number;
        blood:number;
    
        area:number;
        
        bscd:number;
        bsblood:number;
    }
    
    
    
    export interface IPanel_Global_Config_Data{
        namefontsize:number;
        team_a_pos:{[key:number]:number[]};
        team_b_pos:{[key:number]:number[]};
        battle:IPANEL_GLOBAL_CONFIG_BATTLE;
        energy:IPANEL_ENERGY;
        attack:IPANEL_ATTACK;
        atkorder:{team_a:{[key:number]:number},team_b:{[key:number]:number}};
        bseffect:{[key:string]:{x:number,y:number,jiange:number,anim:IPANEL_TWEEN_DATA[]}}
    }
    
    export interface IPanel_Global_Data{
        config:IPanel_Global_Config_Data;
    }
    
    export interface IDemo_Batter_Unit_Data{
        index:number;
        unit:{type:string,id:number|string,level:number, moban?:string}
    }
    
    export interface IPanel_Demo_Data{
        map:string;
        team_A:IDemo_Batter_Unit_Data[];
        team_B:IDemo_Batter_Unit_Data[];
    }
    
    export interface IPANEL_Demo_ROOT{
        demo:IPanel_Demo_Data
    }
    
    
    export interface IPANEL_FIGHT_FONT_ATTACK{
        type:number;
        add:number;
        dec:number;
        bx:number;
        by:number;
        offset:number;
        prefix:number[];
        unshownum:number;
        tween:IPANEL_TWEEN_DATA[];
    }


    export interface IData{
        [key:string]:any;
        [key:number]:any;
    }
    /**
     * 贴图数据
     * 如果只有url 可以通过context3D.getTextureData(url)获得
     */
    export interface ITextureData extends IData{
        key:string;
        url:string;
        mipmap:boolean;
        mag:number;
        mix:number;
        repeat:number;
    }
}



