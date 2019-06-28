module rf{
    export class MoveRocker extends Sprite implements IResizeable{
        btn_left:GrapButton;
        btn_right:GrapButton;
        btn_up:GrapButton;
        btn_down:GrapButton;
        c_point:Point2D;
        constructor(){
            super();

            this.bindComponents();
        }

        bindComponents(){
            let btn = new GrapButton();
            this.addChild(btn);
            this.btn_left = btn;
            btn.label = "左";
            btn.setPos(20, 140);

            this.btn_right = btn = new GrapButton();
            this.addChild(btn);
            btn.setPos(260, 140);
            btn.label = "右";

            this.btn_up = btn = new GrapButton();
            this.addChild(btn);
            btn.setPos(140, 20);
            btn.label = "上";

            this.btn_down = btn = new GrapButton();
            this.addChild(btn);
            btn.setPos(140, 260);
            btn.label = "下";

            let g = this.graphics;
            g.clear();
            g.drawRect(0, 0, 300, 300, 0, 0.5);
            g.drawRect(149, 0, 2, 300, 0xff0000, 0.5);
            g.drawRect(0, 149, 300, 2, 0xff0000, 0.5);
            g.end();

            this.updateHitArea();

            this.c_point = {x:this.w>>1, y:this.h>>1};

            Engine.addResize(this);

            this.on(MouseEventX.MouseDown, this.downHandler, this);
            this.on(MouseEventX.MouseUp, this.upHandler, this);
        }

        downHandler(e:EventX){
            e.stopImmediatePropagation = true;
            ROOT.on(MouseEventX.MouseMove, this.moveHandler, this);
            ROOT.on(MouseEventX.MouseUp, this.upHandler, this);
            ROOT.on(MouseEventX.MouseDown, this.rootdownHandler, this);
            this.moveHandler();
        }

        _otherDown:boolean;
        rootdownHandler(e:EventX){
            this._otherDown = true;
        }

        upHandler(e:EventX){
            if(this._otherDown){
                this._otherDown = false;
                return;
            }
            ROOT.off(MouseEventX.MouseMove, this.moveHandler, this);
            ROOT.off(MouseEventX.MouseUp, this.upHandler, this);
            ROOT.off(EventT.ENTER_FRAME, this.moveTick, this);
            ROOT.off(MouseEventX.MouseDown, this.rootdownHandler, this);

            this._identifier = -1;

            let unit = u3d_role as ActionActor;
            unit.state.stopState(StateDefine.MOVE, StateDefine.MOVE);
            unit.defaultAnim = "stand.kf";
            unit.playDefaultAnim();
            // unit.getAction(StateDefine.NAVIGATION, NavigationLocalAction).end();
        }

        dx:number;
        dy:number;
        _identifier:number;
        moveHandler(e?:EventX){
            if(e){
                let {identifier} = e.data as IMouseEventData;
                if(this._identifier == -1){
                    this._identifier = identifier;
                }
                if(identifier != this._identifier) return;
            }
            let {sceneTransform, c_point} = this;
            let tx = nativeMouseX - sceneTransform[12];
            let ty = nativeMouseY - sceneTransform[13];

            let angle = Math.atan2(ty - c_point.y, tx - c_point.x);
            let tmpx = c_point.x + Math.cos(angle) * c_point.y - c_point.x;
            let tmpy = c_point.y + Math.sin(angle) * c_point.x - c_point.x;
            this.dx = tmpx;
            this.dy = tmpy;

            if(!ROOT.hasEventListener(EventT.ENTER_FRAME)){
                ROOT.on(EventT.ENTER_FRAME, this.moveTick, this);
            }
        }

        moveTick(e:EventX){
            let {dx, dy} = this;
            let unit = u3d_role as ActionActor;

            unit.findPath(unit.x + dx, unit.y + dy);
        }

        resize(width:number, height:number){
            this.x = 10;
            this.y = height - this.h - 10;
        }
    }

    export class SkillRocker extends Sprite{
        btn_one:GrapButton;
        btn_two:GrapButton;
        btn_three:GrapButton;
        btn_four:GrapButton;
        constructor(){
            super();

            this.bindComponents();
        }

        bindComponents(){
            let btn = new GrapButton();
            this.addChild(btn);
            this.btn_one = btn;
            btn.label = "技能1";
            btn.setPos(30, 140);
            btn.addClick(this.skill_click, this);

            this.btn_two = btn = new GrapButton();
            this.addChild(btn);
            btn.setPos(80, 100);
            btn.label = "技能2";
            btn.addClick(this.skill_click, this);

            this.btn_three = btn = new GrapButton();
            this.addChild(btn);
            btn.setPos(140, 80);
            btn.label = "技能3";
            btn.addClick(this.skill_click, this);

            this.btn_four = btn = new GrapButton();
            this.addChild(btn);
            btn.setPos(200, 60);
            btn.label = "技能4";
            btn.addClick(this.skill_click, this);

            let g = this.graphics;
            g.clear();
            g.drawRect(0, 0, 300, 200, 0, 0.5);
            g.end();

            this.updateHitArea();

            Engine.addResize(this);
        }

        skill_click(e:EventX){
            let unit = u3d_role as ActionActor;
            if(unit.state.check(StateDefine.CAST) == false){
                return;
            }
            let {btn_one, btn_two, btn_three, btn_four} = this;
            let camera = ROOT.camera2D;
            switch(e.currentTarget){
                case btn_one:
                    unit.castSkill("skillA",camera._x + nativeMouseX ,camera._y + nativeMouseY);
                break;
                case btn_two:
                    unit.castSkill("skillB",camera._x + nativeMouseX ,camera._y + nativeMouseY);
                break;
                case btn_three:
                    unit.castSkill("skillC",camera._x + nativeMouseX ,camera._y + nativeMouseY);
                break;
                case btn_four:
                    unit.castSkill("skillD",camera._x + nativeMouseX ,camera._y + nativeMouseY);
                break;
            }
        }

        resize(width:number, height:number){
            this.x = width - this.w - 10;
            this.y = height - this.h - 10;
        }
    }
}