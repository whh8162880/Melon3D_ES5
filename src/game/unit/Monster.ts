///<reference path="./Unit3D.ts" />
module rf{
    export class Monster extends ActionActor{
        constructor(){
            super()
            this.movespeed = 300/1000;
        }

        follow(target:ActionActor){
            let action = this.getAction(StateDefine.FOLLOW, FollowAction)
            action.target = target;
            action.start(this)
        }
        

    }

}