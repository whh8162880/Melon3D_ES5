module rf{

    export const enum IUnitAction{
        STAND,      //主要
        WALK,       
        RUN,        //主要
        DEAD,       //主要
        BRON,
        BEATEN,
        JUMP,
        RIDE,
        ROAR,//咆哮
        HOLD,
        ATTACK,     //主要
        SKILL       //主要
    }


    export interface IControlUnit{
        faceto(value:number);
        action(value:number);

        addWeapon(url:string);
        addWing(url:string);
    }




    export class MeshUnit extends Sprite implements IControlUnit{

        action(value:number){

        }

        faceto(value:number){

        }

        addWeapon(url:string){

        }

        addWing(url:string){

        }

    }




    export class PakUnit extends Sprite implements IControlUnit{

        action(value:number){

        }

        faceto(value:number){

        }

        addWeapon(url:string){

        }
        
        addWing(url:string){

        }
    }



    export class UnitTmp extends Sprite implements IControlUnit{

        unitRender:IControlUnit;


        action(value:number){

        }

        faceto(value:number){

        }

        addWeapon(url:string){

        }
        
        addWing(url:string){

        }

    }
}