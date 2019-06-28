module  rf{
    export const enum StateDefine{
        MOVE = 1,
        CAST,
        ATTACK,
        JUMP,
        RIDE,
        NAVIGATION,
        NAVIGATION_CITY,
        DEAD,
        HIT,
        
        FOLLOW,
        AUTOFIGHT,
        COUNT
    }

    export const enum Ralation{
        FOBIDDEN,
        BREAK, //
        ALLOW,
    }

    export let stateRelation:number[][];

    // export interface IStateVO{
    //     disables:StateDefine[][]; //不可做的列表 
    //     allows:StateDefine[];   //兼容列表

    //     thisobj:any;
    //     trystop:Function;
    //     stop:Function;

    // }


    export function state_Setup(){
        stateRelation = []
        let arr:number[];

        let allAllow = [];
        for(let i = 0; i < StateDefine.COUNT; ++i){
            allAllow[i] = Ralation.ALLOW;
        }

        stateRelation[StateDefine.MOVE] = arr = []
        arr[StateDefine.MOVE] = 2;
        arr[StateDefine.CAST] = 1;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 2;
        arr[StateDefine.NAVIGATION] = 2;
        arr[StateDefine.NAVIGATION_CITY] = 2
        arr[StateDefine.DEAD] = 1;
        arr[StateDefine.HIT] = 1;
        arr[StateDefine.AUTOFIGHT] = 2;

        stateRelation[StateDefine.JUMP] = arr = []
        arr[StateDefine.MOVE] = 0;
        arr[StateDefine.CAST] = 0;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 0;
        arr[StateDefine.NAVIGATION] = 0;
        arr[StateDefine.NAVIGATION_CITY] = 0
        arr[StateDefine.DEAD] = 1;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.AUTOFIGHT] = 2;

        stateRelation[StateDefine.CAST] = arr = []
        arr[StateDefine.MOVE] = 0;
        arr[StateDefine.CAST] = 0;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 0;
        arr[StateDefine.NAVIGATION] = 0;
        arr[StateDefine.NAVIGATION_CITY] = 0
        arr[StateDefine.DEAD] = 1;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.AUTOFIGHT] = 2;


        stateRelation[StateDefine.ATTACK] = arr = [];
        arr[StateDefine.MOVE] = 2;
        arr[StateDefine.CAST] = 2;
        arr[StateDefine.ATTACK] = 1;
        arr[StateDefine.JUMP] = 2;
        arr[StateDefine.RIDE] = 2;
        arr[StateDefine.NAVIGATION] = 2;
        arr[StateDefine.NAVIGATION_CITY] = 2;
        arr[StateDefine.DEAD] = 2;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.FOLLOW] = 2;
        arr[StateDefine.AUTOFIGHT] = 2;

        stateRelation[StateDefine.NAVIGATION] = arr = []
        arr[StateDefine.MOVE] = 2;
        arr[StateDefine.CAST] = 1;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 2;
        arr[StateDefine.NAVIGATION] = 1;
        arr[StateDefine.NAVIGATION_CITY] = 1;
        arr[StateDefine.DEAD] = 1;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.AUTOFIGHT] = 2;

        stateRelation[StateDefine.NAVIGATION_CITY] = arr = []
        arr[StateDefine.MOVE] = 2;
        arr[StateDefine.CAST] = 1;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 2;
        arr[StateDefine.NAVIGATION] = 1;
        arr[StateDefine.NAVIGATION_CITY] = 1;
        arr[StateDefine.DEAD] = 1;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.AUTOFIGHT] = 2;

        stateRelation[StateDefine.FOLLOW] = arr = []
        arr[StateDefine.MOVE] = 2;
        arr[StateDefine.CAST] = 2;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 2;
        arr[StateDefine.NAVIGATION] = 2;
        arr[StateDefine.DEAD] = 1;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.AUTOFIGHT] = 2;

        stateRelation[StateDefine.HIT] = arr = [];
        arr[StateDefine.MOVE] = 2;
        arr[StateDefine.CAST] = 2;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 2;
        arr[StateDefine.RIDE] = 2;
        arr[StateDefine.NAVIGATION] = 2;
        arr[StateDefine.NAVIGATION_CITY] = 2;
        arr[StateDefine.DEAD] = 2;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.FOLLOW] = 2;
        arr[StateDefine.AUTOFIGHT] = 2;
        
        stateRelation[StateDefine.DEAD] = arr = [];
        arr[StateDefine.MOVE] = 0;
        arr[StateDefine.CAST] = 0;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 0;
        arr[StateDefine.RIDE] = 0;
        arr[StateDefine.NAVIGATION] = 0;
        arr[StateDefine.NAVIGATION_CITY] = 0;
        arr[StateDefine.DEAD] = 0;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.FOLLOW] = 0;
        arr[StateDefine.AUTOFIGHT] = 0;

        stateRelation[StateDefine.AUTOFIGHT] = arr = []
        arr[StateDefine.MOVE] = 2;
        arr[StateDefine.CAST] = 2;
        arr[StateDefine.ATTACK] = 2;
        arr[StateDefine.JUMP] = 2;
        arr[StateDefine.NAVIGATION] = 2;
        arr[StateDefine.DEAD] = 1;
        arr[StateDefine.HIT] = 2;
        arr[StateDefine.AUTOFIGHT] = 2;
    }

}