
module rf{

    // function CMDA(code: number){

    //     return function (target,propertyKey){

    //     }
    //     // return function (target, propertyKey: string, descriptor: PropertyDescriptor) {
    //         // mvc.MVCInject.AddCMD(target["constructor"], code, descriptor.value);
    //     // };
    // }

    export var u3d_role:Unit3D;

    export var u3d_monster:Monster;

    export var unitlist:{[key:string]:Unit3D};

    export var test_bitmap:BitmapData;

    export var test_text:TextField;

    export var line3d:Line3D;

    // export var VERTEX_ATTRIBUTES_MAP:{} = {
    //     "POSITION": "pos",
    //     "NORMAL":"normal",
    //     "TEXCOORD_0":"uv",
    // }



    export function test_fill(str:string){
        let context = test_bitmap.context;
        context.clearRect(0,0,800,200);

        let size = {x:0,y:0};
        defalue_format.test(context,str,size,1.0);
        defalue_format.draw(context,str,{x:0,y:0,w:size.x,h:size.y});

        test_text.text = str;

        test_text.y = defalue_format.size + 20;


    }



    export class StageDebug extends AppBase{

        map:SnakeMap;


        // @CMDA(1920)
        // cmdtest(stream:Stream){
 
        // }


        // @CMDA(1920)
        // cmdtest2(stream:Stream){

        // }


        resize(w:number,h:number){
            let camera = ROOT.camera2D as Arpg2DCamera;
            let{map}=camera;

            if(map){
                let{watchTarget} = camera;
                let{_x,_y} = watchTarget;
                map.setSize(w,h);
                // map.setviewRect(_x,_y);
                map.setScrollRect(w,h);
                camera.init();
                camera.update(engineNow,16);
            }


            // contextMatrix = newMatrix3D();
            // contextMatrix.m3_scale(0.5,0.5,1);
            // contextMatrix.m3_translation(320,0,0);

            // contextInvMatrix = newMatrix3D();
            // contextInvMatrix.m3_invert(contextMatrix);

            super.resize(w,h);

            // let g = ROOT.graphics;
            // g.clear();
            // g.drawRect(0,0,stageWidth,stageHeight,0x555555);
            // g.end();
        }

        createSource(){
            super.createSource();
            // pixelRatio = 3;
        }


        initROOT(){
            stageWidth = 640;
            stageHeight = 1080;
            offsetResize = {stageWidth, stageHeight, ox:0, oy:0, sx:1, sy:1};
            // Engine.setDisplayArea(1920,1080);
            // Engine.setDisplayArea(stageWidth,stageHeight);
            // ROOT.setScrollRect(stageWidth,stageHeight);
            let r = ROOT;
            r.camera2D = singleton(Arpg2DCamera);
            ROOT.camera3D = new Camera(10000,contextMatrix3D);
            ROOT.cameraPerspective = new Camera(10000,contextMatrix3D);
            ROOT.cameraOrth = new Camera();
            r.camera = r.cameraUI = new Camera();

            
        }

        init(canvas:HTMLCanvasElement){
           
            // let context = canvas.getContext("2d");
            // context.textAlign = "left";
            // context.textBaseline = "middle";

            // context.fillStyle = "#FFFFFF";
            // context.fillRect(0,0,200,200);

            super.init(canvas);
            if(undefined == gl){
                return;
            }


            // scene.camera = ROOT.camera3D;
            // ROOT.scrollRect = {x:0,y:0,w:640,h:1080};
            context3D.defauleMag = WebGLConst.LINEAR;

            // ROOT.setPos(640,0);
            // canvasleft = 640;

            ROOT_PERFIX = `http://${document.domain}/project/h5games/data/`;

            RES_PERFIX = `http://${document.domain}/project/h5games/data/`;

            CONFIG_PERFIX = `https://localres.lingyunetwork.com/chuanshih5/web/config/zhcn/trunk/`;


            // loadRes(RES_PERFIX, "test.km", this.testmesh, this, ResType.amf_inflate);

            // this.testmesh();
            // this.unit3dTest();

            // let source = anim_getSource(RES_PERFIX+"ef/card.ha");
            // source.on(EventT.COMPLETE, this.onSouceComplete, this);

            // skill_setup();

            // this.map2dTest();
            // this.unit3dTest();
            // this.unit3dCamera2DTest()
            
            // let source = anim_getSource(RES_PERFIX+"ef/tankres.ha");
            // source.on(EventT.COMPLETE, this.moreItems, this);

            let gui = singleton(GUIProfile);
            popContainer.addChild(gui);

            // let rocker = singleton(MoveRocker);
            // ROOT.addChild(rocker);

            // ROOT.addChild(singleton(SkillRocker));

            // let timebar = singleton(TimeBar);
            // ROOT.addChild(timebar);
            // timebar.setPos(300, 500);
            // timebar.setData(5000, 200);

            // this.testtest();
            // this.scaleTest();
            // this.unit3dTest();
            // this.initCamera3d()
            // let g2m = new GLTf2MelonLoader();
            // g2m.load();
            // this.gltftest()

            // if(isMobile){
                // Engine.frameRate = 30;
            // }   


            // this.superBatchTest();

            // this.timerTest();


            // let v = `
            //     void main(void) {
            //         gl_Position = vec4(0.0,0.0,0.0,1.0);
            //     }
            // `

            // let f = `
            //     precision mediump float;
            //     uniform sampler2D tex[2];
            //     void main(void) {
            //         vec4 color = texture2D(tex[1], vec2(0.0));
            //         color += texture2D(tex[2], vec2(0.0));
            //         gl_FragColor = color;
            //     }
            // `
            // context3D.createProgram(v,f).awaken();

            // let snake = new Snake();
            // ROOT.addChild(snake);
        }   

        testmesh(e?:EventX){
            let camera = scene.camera = ROOT.cameraPerspective;

            camera = scene.camera = ROOT.camera3D;

            let sun = new DirectionalLight();
            sun.setDirectional(100,200,200);
            sun.color = 0xCCCCCC;
            let v = TEMP_VECTOR3D;
            v[0] = v[1] = v[2] = 0;
            sun.lookat(v);
            scene.sun = sun;

            // let data = e.data;
            // let {mesh:meshdata, material:materialdata, skeletonData} = data as ISkeletonMeshData;
            // let meshdata = data as IMeshData;
            
            let mesh = new KFMMesh();
            mesh.defaultAnim = "Take 001.kf";
            // mesh.setKFM(data);
            mesh.load("test/");

            // let {geometry} = mesh;
            // if (!geometry) {
            //     mesh.geometry = geometry = new GeometryBase(meshdata.variables);
            // }
            // geometry.setData(meshdata);

            // let m = new ColorMaterial(0x999999);
            // m.setData(undefined);
            // m.cull = WebGLConst.NONE;

            // if (!material) {
            //     this.material = material = this.createMaterial();
            // }

            // let material = mesh.createMaterial();
            // material.setData(materialdata);

            // material.setData(materialData);

            // material.diffTex.url = "cloud.png";

            // mesh.material = material;

            scene.addChild(mesh);

            let len = 15;
            
            camera.setPos(0,-0.6*len, len)
            camera.lookat(newVector3D(0,0,0), Z_AXIS);

            // camera.rotationX -= 90;
            
            sun.setDirectional(len,len,-len);

            let ctl = new TrackballControls(camera);
            ctl.lock = true;

            let tr = new Trident(2,2);
            tr.setPos(0,0,0)
            scene.addChild(tr);
        }

        // private onSouceComplete(e:EventX) {
        //     facade.toggle(CombatMediator, 1);
        // }

        moreItems(e:EventX){
            let source = e.currentTarget as Anim2dSource;
            let tx = 0;
            let ty = 0;

            let cp = new Sprite();
            cp.setPos(200, 20);
            cp.renderer = new SuperBatchRenderer(cp);
            ROOT.addChild(cp);
            
            for (let i = 0; i < 10; i++) {
                tx = 0;
                for (let j = 0; j < 20; j++) {
                    let sp = new Sprite(source);
                    let g = sp.graphics;
                    g.clear();
                    // g.drawRect(0, 0, 40, 40, Math.random() * 0xffffff);
                    g.drawBitmap(0, 0, source.getSourceVO(parseInt(Math.random() * 21)));
                    g.end();
                    cp.addChild(sp);
                    sp.setPos(tx, ty);
                    tx += 40;
                }
                ty += 40;
            }
            
            function removeitem(e:EventX){
                let index = 0;//parseInt(Math.random() * cp.childrens.length);
                cp.childrens[index].remove();
            }
            cp.on(MouseEventX.CLICK, removeitem, this);
        }
        // raytest(){
             
        // }
        

        timerTest(){

            function time200(){
                console.log("200");
            }

            function time500(){
                console.log("500");
            }

            getGTimer(1000).add(time500,this);

            getGTimer(100).add(time200,this);

        }

        _time = 0;
        randomtxt(){
            test_text.text = Math.round(Math.random() * 100 + 100) + "";//this._time + "";
            this._time++;
        }

        _isscal:boolean;
        source: PanelSource;
        pcon:Component;

        panel:TestPanel;

        scaleTest(){

            // let sp = new Sprite();
            // sp.renderer = new SuperBatchRenderer(sp);
            // sp.graphics.clear();
            // sp.graphics.drawRect(0, 0, 300, 300, 0);
            // sp.graphics.end();
            // sp.setPos(50, 100);
            // popContainer.addChild(sp);

            // let bg = new Image();
            // bg.load("p/face.png");
            // sp.addChild(bg);
            // bg.setPos(100, 100);

            // test_text = new TextField();
            // test_text.init(textSource);
            // test_text.type = TextFieldType.INPUT;
            // test_text.text = "3232312s";
            // test_text.y = 40;
            // sp.addChild(test_text);

            // time1000.add(this.randomtxt, this);

            let panel = new TestPanel();
            panel.renderer = new SuperBatchRenderer(panel);
            this.panel = panel;

            // panel.effParms = {"show":[{time:0, type:"scale", from:0, to:1, ease:"Quadratic.out", duration:500}, {time:0, type:"alpha", from:0, to:1, ease:"Quadratic.out", duration:500}],"hide":[{time:0, type:"scale", from:1, to:0, ease:"Quadratic.out", duration:500}, {time:0, type:"alpha", from:1, to:0, ease:"Quadratic.out", duration:500}]};

            panel.load();
            panel.on(EventT.COMPLETE, this.panelHandler, this);


            let sp = new Sprite(textSource);
            let g = sp.graphics;
            g.clear();
            g.drawBitmap(0, 0, {source:textSource, scale:1, name:"txtsource", used:1, time:0, rw:1024, rh:1024, ul:0, ur:1.0, vt:0, vb:1.0, ix:0, iy:0, w:1024,h:1024,x:0,y:0})
            g.end();
            popContainer.addChild(sp);
            sp.setPos(100, 200);

            // let source = panelSourceLoad("team");
            // this.pcon = new Component(source);
            // this.pcon.name = "team";
            // this.pcon.renderer = new SuperBatchRenderer(this.pcon);
            // this.source = source;
            // loadRes(RES_PERFIX, source.name, source.loadConfigComplete, source, ResType.amf);
            // source.on(EventT.COMPLETE, this.asyncsourceComplete, this);

            // let sp = new Sprite();
            // sp.renderer = new TestBatchRenderer(sp);
            // popContainer.addChild(sp);
            // let g = sp.graphics;
            // g.clear();
            // g.drawRect(0, 0, 589, 764, 0xffffff);
            // g.end();
            // sp.setPos(20, 100);
            // this._scalesp = sp;

            // // sp.updateSceneTransform();

            // let bg = new Image();
            // bg.load("p/team/bg.png");
            // sp.addChild(bg);

            // bg = new Image();
            // bg.load("p/face.png");
            // sp.addChild(bg);
            // bg.setPos(100, 100);

            // let text_name = new TextField();
            // sp.addChild(text_name);
            // text_name.text = "手册测试";

            // let ani = new Ani();
            // ani.load("ef/card");
            // sp.addChild(ani);

            // // callLater.later(this.scalHandler, this, 1600);
            // this.scalHandler();

            // mainKey.regKeyDown(Keybord.Q, this.scalHandler, this)
        }
        panelHandler(e:EventX) {
            let {panel} = this;
            panel.create();
            panel.show();
        }

        asyncsourceComplete(e?: EventX): void {
            let {pcon, source} = this;
            if (e) {
                e.currentTarget.off(e.type, this.asyncsourceComplete, this);
                //结束面板loading
                facade.simpleDispatch(EventT.PANEL_LOAD_END);
            }
            let cs: IDisplaySymbol = source.config.symbols["ui.asyncpanel.team"];
            if (!cs) {
                return;
            }
            pcon.setSymbol(cs);
            // pcon.updateSceneTransform();
            // pcon.setChange(DChange.batch);

            let bg = new Image();
            bg.renderer = new SuperBatchRenderer(bg);
            bg.load("p/team/bg.png");
            pcon.addChildAt(bg, 0);

            bg = new Image();
            bg.load("p/face.png");
            pcon.addChild(bg);
            bg.setPos(100, 100);

            let text_name = new TextField();
            pcon.addChild(text_name);
            text_name.text = "手册测试";

            popContainer.addChild(pcon);

            this.scalHandler();
            pcon.setPos(50, 50);
        }


        scalHandler(e?:KeyboardEvent){
            // let {pcon} = this;
            // if(!this._isscal){
            //     this._isscal = true;
            //     scriptTween_play(pcon, [{time:0, type:"scale", from:0, to:1, ease:"Quadratic.out", duration:1200}, {time:0, type:"alpha", from:0, to:1, ease:"Quadratic.out", duration:1200}], defaultTimeMixer);
            //     // _scalesp.scale = 0;
            //     // tweenTo({scale:1}, 200, defaultTimeMixer, _scalesp);
            // }else{
            //     this._isscal = false;
            //     scriptTween_play(pcon, [{time:0, type:"scale", from:1, to:0, ease:"Quadratic.out", duration:1200}, {time:0, type:"alpha", from:1, to:0, ease:"Quadratic.out", duration:1200}], defaultTimeMixer);
            //     // tweenTo({scale:0}, 200, defaultTimeMixer, _scalesp);
            // }

            let {panel} = this;
            if(panel.isShow){
                panel.hide();
            }else{
                panel.show();
            }
        }

        // rolldownHandler(event:EventX){
        //     wx.showLog(true);
        // }

        // rollupHandler(event:EventX){
        //     wx.showLog(false);
        // }

        unitA:ActionActor;
        sy:number
        

        
        map2dTest(){

            context3D.use_logdepth_ext = false;
            context3D.logarithmicDepthBuffer = false;

            let camera = scene.camera = ROOT.camera2D as Arpg2DCamera;

            let map = singleton(SnakeMap);

            let data = map_create_data("3",19,14);
            map.init(data,100,100);
            scene.addChild(map);

            let followScene = new NoActiveSprite();
            scene.addChild(followScene);
            camera.map = map;

            singleton(TitleUtils).bind(followScene);

            // let mapContainer = new SceneObject()
            // scene.addChild(mapContainer)

            // mapContainer.addChild(map)
            // map.setSca(1, SY ,  1)
            // mapContainer.setRot(RX,0,0)

            let sun = new DirectionalLight();
            sun.setDirectional(200,200,200);

            let v = newVector3D(600,-400,1000) as IVector3D;
            v.v3_normalize();
            v.v3_scale(2000);

            sun.lightoffset = v;

            sun.setPos(sun.lightoffset[0],sun.lightoffset[1],sun.lightoffset[2]);
            sun.lookat(newVector3D(0,0,0));
            sun.color = 0xCCCCCC;
            v = TEMP_VECTOR3D;
            v[0] = v[1] = v[2] = 0;
            sun.lookat(v);
            scene.sun = sun;



            

            let rx2 = 90 - RX

            let offz = 0;

            let unitA = this.unitA = new ActionActor();
            // unitA.setPos(1140,680,offz);
            unitA.setPos(19 * 60 + 30,22 * 30 + 15,offz);
            // unitA.setPos(0,0,offz);
            unitA.setBody("mesh/actor/a10010m/");
            // unitA.rotation = 0;
            unitA.body.shadowCast = true;
            unitA.body.mediump = true;
            // unitA.setBody("mesh/actor/huangfeihu/");
            // unitA.setWeapon("mesh/actor/jinkubang/");
            // unitA.setWeapon("mesh/actor/a00002/");
            // unitA.weapon.shadowCast = true;

            unitA.setText("行走人民币",0x00FF00);
            // unitA.title.setText("[人民币玩家]", UNIT_TITLE_LEVEL.NAME, 0x00ff00, true, 2);
            // unitA.crateHalo();

            
            // unitA.body.shadowTarget = true;

            // for(let i = 0 ; i < 50 ; i++){
            //     let unitA = new ActionActor();
            //     unitA.setPos(500 + Math.floor( Math.random() * 1000 ),600 + Math.floor( Math.random() * 800 ),offz);
            //     unitA.setBody("mesh/actor/huangfeihu/");
            //     // unitA.randomRun();
            //     unitA.rotation = Math.random() * 360;
            //     unitA.body.shadowCast = true;
            //     map.addChild(unitA);
            // }

            // let dir = newVector3D(10, 0, 0,0);
            // for(let i = 0; i < 10; ++i){
            //     let angle = 70/200
			// 	TEMP_MATRIX2D.m2_rotate(angle*i);
            //     var tmp2:IVector3D = TEMP_MATRIX2D.m2_transformVector(dir);
            //     console.log("i:::::::,", i, tmp2, tmp2.x, tmp2.y)
            // }

            map.on(MouseEventX.CLICK, this.moveTest, this)
            mainKey.regKeyDown(Keybord.Q, this.attack, this)
            mainKey.regKeyDown(Keybord.W, this.attack, this)
            mainKey.regKeyDown(Keybord.E, this.attack, this)
            mainKey.regKeyDown(Keybord.R, this.attack, this)
            mainKey.regKeyDown(Keybord.NUMBER_1, this.attack, this);
            mainKey.regKeyDown(Keybord.NUMBER_2, this.attack, this);
            mainKey.regKeyDown(Keybord.NUMBER_3, this.attack, this);
            mainKey.regKeyDown(Keybord.NUMBER_4, this.attack, this);
            mainKey.regKeyDown(Keybord.NUMBER_5, this.attack, this);
            mainKey.regKeyDown(Keybord.C, this.attack, this);

            map.on(MouseEventX.MouseWheel,this.mouseWheelHandler,this);
            


            let r = 0;
            let{_x, _y} = this.unitA;
            unitlist = {};
            for(let i = 0 ; i < 0 ; i++){
                let monster = new Monster();
                let dr = Math.PI*2*i/15;
                let sin = Math.sin(dr) * 150
                let cos = Math.cos(dr) * 150 / SY 
                
                let ox =  400 + Math.random() * map.data.w - 200;
                let oy =  400 + Math.random() * map.data.h - 200;
                // monster.setPos(ox, oy)
                monster.setPos(_x + sin, _y + cos)
                monster.setBody("mesh/monster/m060001/");
                monster.scale = 0.9;
                monster.body.shadowCast = true;
                monster.faceto(_x, _y)
                monster.follow(this.unitA)
                let name = String.fromCharCode(Math.round(Math.random() * (0x9FA5 - 0x4E00)) + 0x4E00);
                name += String.fromCharCode(Math.round(Math.random() * (0x9FA5 - 0x4E00)) + 0x4E00);
                // monster.setText(name);
                unitlist[monster.guid] = monster;
                map.addChild(monster)

                u3d_monster = monster;
            }
            

            u3d_role = this.unitA;
            unitlist[unitA.guid] = unitA;
            camera.watchTarget = this.unitA


            // let tr = new Trident(100,2);
            // tr.setPos(unitA._x,unitA._y,-100);
            // scene.addChild(tr);


            // let monster = new Monster();
            // monster.setPos(1896,637,offz);
            // monster.scale = 0.9;
            // monster.rotation = 150;
            // map.addChild(monster);
            // // unitA.setBody("mesh/actor/a10010m/");
            // monster.setBody("mesh/monster/m060001/");
            // monster.body.shadowCast = true;
            // monster.follow(this.unitA);

            // monster.setText("重金陪练员",0xFFD0000);

            

            map.addChild(this.unitA);
            
            ROOT.updateSceneTransform(0);
            this.resize(stageWidth,stageHeight);
        }


        mouseWheelHandler(event:EventX){
            
            this.unitA.rotation += ((event.data as IMouseEventData).wheel / 10);
        }

        attack(e:KeyboardEvent){
            // let{unitA}=this
            // if(unitA.state.check(StateDefine.CAST) == false){
            //     return;
            // }
            
            // let camera = ROOT.camera2D;

            // // unitA.state.startState(StateDefine.CAST)
            // // callLater.later(this.stopcast, this, 300)
            // let area:HIT_AREA_VO;
            // let targets = []
            switch(e.keyCode){
            //     case Keybord.Q:
            //         unitA.attack("atks011.kf")
            //     break;
            //     case Keybord.W:
            //         unitA.attack("atks012.kf")
            //     break;
            //     case Keybord.E:
            //         unitA.attack("atks013.kf")
            //     break;
            //     case Keybord.R:
            //         unitA.attack("atks020.kf")
            //     break;
            //     case Keybord.NUMBER_1:
            //         unitA.castSkill("skillA",camera._x + nativeMouseX ,camera._y + nativeMouseY);
            //         // let {_x, _y, _z, rotation:r} = unitA;
            //         // area = {type:HIT_AREA_TYPE.SECTOR, range:300, sra: -60, era:60, h:200  } as HIT_AREA_VO;
            //         // targets = attack_getTargets(unitA, monsters, _x, _y, _z, r , area)
            //         // for (let i = 0; i < targets.length; i++) {
            //         //     const m = targets[i];
            //         //     m.hit(50000, 40000, m._x - _x,  m._y - _y)
            //         // }
            //         // u3d_monster.hit(-50000, 80000, u3d_monster._x - unitA._x,  u3d_monster._y - unitA._y)
            //     break;

            //     case Keybord.NUMBER_2:
            //         unitA.castSkill("skillB",camera._x + nativeMouseX ,camera._y + nativeMouseY);
            //         // area = {type:HIT_AREA_TYPE.SECTOR, range:1000, sra: -60, era:60, h:200  } as HIT_AREA_VO;
            //         // _x = unitA._x;
            //         // _y = unitA._y;
            //         // _z = unitA._z;
            //         // r = unitA.rotation;
            //         // targets = attack_getTargets(unitA, monsters, _x, _y, _z, r , area)
            //         // for (let i = 0; i < targets.length; i++) {
            //         //     const m = targets[i];
            //         //     m.hit(80000, 80000, m._x - _x,  m._y - _y)
            //         // }
            //         // u3d_monster.hit(80000, 80000, u3d_monster.x - unitA._x,  u3d_monster.y - unitA.y)
            //     break;
            //     case Keybord.NUMBER_3:
            //         unitA.castSkill("skillC",camera._x + nativeMouseX ,camera._y + nativeMouseY);
            //         // area = {type:HIT_AREA_TYPE.SECTOR, range:300, sra: -60, era:60, h:500  } as HIT_AREA_VO;
            //         // _x = unitA._x;
            //         // _y = unitA._y;
            //         // _z = unitA._z;
            //         // r = unitA.rotation;
            //         // targets = attack_getTargets(unitA, monsters, _x, _y, _z, r , area)
            //         // for (let i = 0; i < targets.length; i++) {
            //         //     const m = targets[i];
            //         //     m.hit(0, 100000, m._x - _x,  m._y - _y)
            //         // }
            //         // u3d_monster.hit(0, 100000, u3d_monster.x - unitA._x,  u3d_monster.y - unitA._y)
            //     break;
            //     case Keybord.NUMBER_4:
            //         unitA.castSkill("skillD",camera._x + nativeMouseX ,camera._y + nativeMouseY);
            //         // area = {type:HIT_AREA_TYPE.SECTOR, range:500, sra: -60, era:60, h:1000  } as HIT_AREA_VO;
            //         // _x = unitA._x;
            //         // _y = unitA._y;
            //         // _z = unitA._z;
            //         // r = unitA.rotation;
            //         // targets = attack_getTargets(unitA, monsters, _x, _y, _z, r , area)
            //         // for (let i = 0; i < targets.length; i++) {
            //         //     const m = targets[i];
            //         //     m.hit(100000, 0, m._x - _x,  m._y - _y)
            //         // }
            //         // u3d_monster.hit(0, 100000, u3d_monster.x - unitA._x,  u3d_monster.y - unitA._y)
            //     break;


                case Keybord.C:
                    scene.addChild(mesh_fre_alpha_cut(u3d_role.body));
                break;
            }
            
        }

        dibiao:Skill;

        moveTest(e:EventX){
            let{unitA,dibiao} = this;

            let camera = ROOT.camera2D as Arpg2DCamera;
            let{map,watchTarget}=camera;

            let {mouseDownX,mouseDownY} = e.data as IMouseEventData
            // watchTarget.setPos(camera._x + mouseDownX, camera._y + mouseDownY, 0);
            
            // unitA.walkPixTo(camera._x + mouseDownX, camera._y + mouseDownY);
            unitA.findPath(camera._x + mouseDownX, camera._y + mouseDownY);



            if(!dibiao){
                dibiao = new Skill();
                dibiao.setSceneModel(SCENE_MODEL.MAP2D);
                dibiao.rotation = u3d_role.rotation;
                dibiao.load("dibiao.sk");
                // dibiao.load("actor/a10010m/atks020/atks020.sk");
                // this.dibiao = dibiao;
            }

            dibiao.reset();
            dibiao.setPos(camera._x + mouseDownX, camera._y + mouseDownY,2);
            map.addChild(dibiao);



            // var test = new MapObject();
            // test.setSceneModel(SCENE_MODEL.MAP);
            // test.setPos(camera._x + mouseDownX, camera._y + mouseDownY,2);
            // map.addChild(test);

            // test.rotation = 0;

            // let particle = new TestPartilce();
            // particle.tm = defaultTimeMixer;
            // particle.load("a.pa");
            // test.container.addChild(particle);
/*
            var sk = new Skill();
            sk.setSceneModel(SCENE_MODEL.MAP);
            // sk.rotation = u3d_role.rotation;
            // sk.z = 100;
            sk.load("actor/a10010m/atks020/atks020.sk");
            // sk.load("test4.sk");
            // sk.load("test.sk");
            sk.setPos(camera._x + mouseDownX, camera._y + mouseDownY,0);
            map.addChild(sk);
            sk.rotation = Math.atan2(sk.y - u3d_role.y,sk.x-u3d_role.x) * RADIANS_TO_DEGREES;
            */

            // (ROOT.camera2D as Arpg2DCamera).update(0,0);


        }


        mouseWheel3dHandler(event:EventX){
            event.stopImmediatePropagation = true;
            let data = event.data as IMouseEventData;
            u3d_role.rotationY += ((event.data as IMouseEventData).wheel / 10);
        }


        unit3dCamera2DTest(){
            context3D.use_logdepth_ext = false;
            context3D.logarithmicDepthBuffer = false;

            let sun = new DirectionalLight();
            sun.setDirectional(100,200,200);
            sun.color = 0xCCCCCC;
            let v = TEMP_VECTOR3D;
            v[0] = v[1] = v[2] = 0;
            sun.lookat(v);
            scene.sun = sun;

            let camera:Camera;
            camera = scene.camera = ROOT.cameraOrth;

            var sp = new SceneObject();
            sp.setRot(RX,0,0);

            scene.addChild(sp);

            let variables = vertex_mesh_variable;
            let mesh:Mesh;
            let m:Material;
            let skill:TestSkill;

            let w = 500;

            let planeGeo = new PlaneGeometry(variables).create(1920,1080);
            mesh = new Mesh(variables);
            // mesh.y = -0.0001

            m = new ColorMaterial(0x999999);
            m.setData(undefined);

            

            // m.cull = gl.f;
            // mesh.rotationX = -90;
            mesh.geometry = planeGeo;
            mesh.material = m;
            mesh.shadowTarget = true;
            mesh.y = -0.001
            // sp.addChild(mesh);



            skill = new TestSkill();
            skill.rotationZ = 90;
            // skill.setPos(200,200,200)
            skill.setSceneModel(SCENE_MODEL.MAP2D);
            // skill.load("dibiao.sk");
            // skill.load("test.sk");
            // skill.load("actor/a10010m/atks011/atks011_DG.sk");
            // skill.load("actor/a10010m/atks011/atks011.sk");
            skill.load("actor/a10010m/atks020/atks020.sk");
            // skill.scale = 50;
            // skill.y = 0.001;
            // sp.addChild(skill);




            let len = 10;
            // camera.setPos(0,len,0)
            // camera.lookat(newVector3D(0,0,0));
            sun.setDirectional(len,len,len);

            let ctl = new TrackballControls(camera);
            ctl.lock = true;

        }


        unit3dTest(){

            context3D.use_logdepth_ext = false;
            context3D.logarithmicDepthBuffer = false;

            let sun = new DirectionalLight();
            sun.setDirectional(100,200,200);
            sun.color = 0xCCCCCC;
            let v = TEMP_VECTOR3D;
            v[0] = v[1] = v[2] = 0;
            sun.lookat(v);
            scene.sun = sun;


            let camera = scene.camera = ROOT.cameraPerspective;

            camera = scene.camera = ROOT.camera3D;

            let w = 5;

            let variables = vertex_mesh_variable;
            let w_e = w * 1.1
            let m = new PhongMaterial();
            m.setData(undefined);
            m.cull = WebGLConst.BACK;
            // let geo = new BoxGeometry(variables).create(w,w,w)
            
            let mesh:Mesh;

            // let box = new SkyBoxGeometry(vertex_mesh_variable).create();
            // let mesh = new Mesh(vertex_mesh_variable);
            // mesh.geometry = box;
            // mesh.name = "skybox";
            // let msky = new SkyBoxMaterial();
            // msky.setData(undefined);
            // msky.cull = WebGLConst.NONE;
            // msky.diffTex = context3D.getTextureData(RES_PERFIX + "r/t/skybox/");
            // mesh.material = msky;
            // mesh.mouseChildren = mesh.mouseEnabled = false;
            // scene.addChild(mesh);
            let box = new SkyBoxGeometry(vertex_mesh_variable).create();
            mesh = new Mesh(vertex_mesh_variable);
            mesh.geometry = box;
            mesh.name = "skybox";
            let msky = new SkyBoxMaterial();
            msky.setData(undefined);
            msky.cull = WebGLConst.NONE;
            msky.diffTex = context3D.getTextureData(RES_PERFIX + "box/sky/");
            mesh.material = msky;
            mesh.mouseChildren = mesh.mouseEnabled = false;
            scene.addChild(mesh);



/*
            let sphere = new Mesh();
            sphere.geometry = new SphereGeometry().create(50,50,0.5);
            sphere.material = new ColorMaterial(0x999999);
            sphere.material.sun = false;
            sphere.addFilter(new FresnelAlphaFilter(3.0));
            scene.addChild(sphere);


            let kfm = new KFMMesh();
            // kfm.setPos(-1,0,0);
            kfm.material = new ColorMaterial(0x999999);
            // kfm.material = new Material();
            // kfm.material.sun = false;
            kfm.addFilter(new FresnelAlphaFilter(3.0));
            kfm.load("mesh/actor/a10010m/");
            scene.addChild(kfm);
*/
            // (kfm.filters[FilterConst.FRESNEL_ALPHA] as FresnelFilter).tweenTo(5,0,5000);

            

            // let f = 10;
            // for (let i = 0; i < 1000; i++) {
            //     let unit = new Unit3D();
            //     unit.setBody("mesh/a10010m/");
            //     unit.setPos(-f*2 * Math.random() + f ,0, -f*2 * Math.random()+ f);
            //     scene.addChild(unit);
            // }




            // let unit = new ActionActor();
            // // scene.addChild(unit);
            // // unit.setPos(1,0,0)
            // // unit.tm = newTimeMixer(unit,0,defaultTimeMixer,1);
            // unit.setSceneModel(SCENE_MODEL.CONTIANER);
            // // let tm = newTimeMixer(unit,0,defaultTimeMixer);
            // // tm.speed = 0.01;
            // // tm.pause = true;
            // // unit.tm = tm;
            // unit.setBody("mesh/actor/a10010m/");

            // unit.body.outLineMaterial = new OutLineMaterial(0x00FF00,1.0,true);

            // unit.setBody("mesh/miniScene/");
            // unit.setBody("mesh/npc/n003001/");
            // unit.setBody("mesh/actor/huangfeihu/");
            // unit.body.shadowCast = true;
            // unit.body.defaultAnim = "atks011.kf"

            // unit.playAnim("atks011.kf");
           
            // unit.setWeapon("mesh/a00002/");
            // unit.body.defaultAnim = "atks011.kf";
            // unit.setBody("mesh/effect/a10010m/atks011/plan03/");
            
            // unit.body.addFilter(new ColorTransformFilter());

            // let transform = unit.transform;
            // unit.updateTransform();

            // let p1:IVector3D = newVector3D(),q1:IVector3D = newVector3D(),s1:IVector3D = newVector3D();
            // transform.m3_decompose(p1,q1,s1,Orientation3D.QUATERNION);

            // // unit.rotationX = -90;
            // unit.rotationY = -90;
            // unit.rotationZ = -90;
            // unit.updateTransform();
            // let p2:IVector3D = newVector3D(),q2:IVector3D = newVector3D(),s2:IVector3D = newVector3D();
            // transform.m3_decompose(p2,q2,s2,Orientation3D.QUATERNION);

            // let q = qua_lerp(q1,q2,1);

            // transform.m3_recompose(p2,q,s2,Orientation3D.QUATERNION);
            // unit.setTransform(transform);
            // unit.updateTransform();

            // let rot = unit.rot.clone() as IVector3D
            // rot.v3_scale(180/Math.PI)
            // console.log(rot);



            // u3d_role = unit;
            // scene.on(MouseEventX.MouseWheel,this.mouseWheel3dHandler,this,1);


            line3d = new Line3D();
            scene.addChild(line3d);

            scene.on(MouseEventX.MouseMiddleDown,this.rayClickTest,this,1);
            

            

            // unit.setBody("mesh/xian/");
           

            // unit.setWeapon("mesh/jinkubang/")
            // unit.setWeapon("mesh/a00002/");
            
            // unit.setBody("mesh/a00002/");

            // let weapon = new KFMMesh();
            // weapon.defaultAnim = "";
            // weapon.load("mesh/a00002/");
            // weapon.rotationZ = -90;
            // unit.body.bindMesh("Bip002_Prop1",weapon);


            // let liuGuangData = {tex:"tex/particle/E_guangyun_59.png",speed:-1,scale:3} as ILiuGuangData
            // unit.weapon.addFilter(new LiuguangFilter(unit.body,liuGuangData));


            // let xian = new KFMMesh();
            // xian.load("mesh/xian/");
            // xian.setSca(1.08,1.2,1);
            // xian.setPos(-1.4,-0.08,0);
            // xian.addFilter(new UVAnimFilter());
            // unit.weapon.bindMesh("Bone003",xian);

            let tr = new Trident(2,2);
            tr.setPos(0,0,0)
            scene.addChild(tr);
            // unit.body.bindMesh("Bone_wuqi",tr);


            // let plane = new LinePlane(10);
            // plane.y = -0.005
            // scene.addChild(plane);

            // particle_Perfix = "particle/";
            // particle_Texture_Perfix = "tex/particle/"


            // let pa = new Particle();
            // pa.load("effect/ui/dianjilizi.pa");
            // pa.load("a.pa");
            // scene.addChild(pa);

            w = 10

            m = new ColorMaterial(0x999999);
            m.setData(undefined);

            let planeGeo = new PlaneGeometry(variables).create(w*2,w*2);
            mesh = new Mesh(variables);
            // m.cull = gl.f;
            mesh.rotationX = -90;
            mesh.geometry = planeGeo;
            mesh.material = m;
            mesh.shadowTarget = true;
            mesh.y = -0.001
            // scene.addChild(mesh);


            let boxGeo = new TorusGeomerty(variables).create(30,30,0.5,1);
            // let boxGeo =new BoxGeometry(variables).create(1,1,1);
            // let boxGeo =new PlaneGeometry(variables).create(1,1);
            mesh = new Mesh(variables);
            m = new PhongMaterial();
            m.setData(undefined);
            // mesh.shadowTarget = true;
            mesh.shadowCast = true;
            mesh.geometry = boxGeo;
            mesh.material = m;
            mesh.y = 2;
            mesh.rotationX = -90;
            // scene.addChild(mesh);



            boxGeo = new TorusGeomerty(variables).create(30,30,0.5,1);
            mesh = new Mesh(variables);
            m = new PhongMaterial();
            m.setData(undefined);
            mesh.shadowCast = true;
            mesh.geometry = boxGeo;
            mesh.material = m;
            mesh.x = 3;
            mesh.y = 3;
            mesh.z = 3;
            mesh.rotationX = -90;
            mesh.rotationY = 45;
            mesh.rotationZ = 45;
            // scene.addChild(mesh);

            let skill:Skill;
            // skill.load("dibiao.sk");
            // skill.load("actor/a10010m/atks011/atks011.sk");
            // scene.addChild(skill);

            skill = new TestSkill();
            // skill.rotationY = 90;
            skill.setSceneModel(SCENE_MODEL.CONTIANER);
            // skill.load("dibiao.sk");
            // skill.load("test.sk");
            // skill.load("actor/a10010m/atks011/atks011_DG.sk");
            // skill.load("actor/a10010m/atks011/atks011.sk");
            // skill.load("actor/a10010m/atks020/atks020.sk");
            // skill.scale = 80;
            // skill.y = 0.001;
            // scene.addChild(skill);


            let particle = new TestPartilce();
            particle.tm = defaultTimeMixer;
            particle.setPos(1,0)
            particle.load("a.pa");
            // scene.addChild(particle);
            // particle.moveTest();


            let len = 10;
            camera.setPos(len,len,len)
            camera.lookat(newVector3D(0,0,0));
            sun.setDirectional(len,len,len);

            let ctl = new TrackballControls(camera);
            ctl.lock = true;


            
        }


        initCamera3d(){
            context3D.use_logdepth_ext = false;
            context3D.logarithmicDepthBuffer = false;

            let sun = new DirectionalLight();
            sun.setDirectional(100,200,200);
            sun.color = 0xCCCCCC;
            let v = TEMP_VECTOR3D;
            v[0] = v[1] = v[2] = 0;
            sun.lookat(v);
            scene.sun = sun;


            let camera = scene.camera = ROOT.cameraPerspective;
            // camera = scene.camera = ROOT.camera3D;

            // camera = scene.camera = ROOT.camera2D;

            let w = 5;

            let variables = vertex_mesh_variable;
            let w_e = w * 1.1
            let m = new PhongMaterial();
            m.setData(undefined);
            m.cull = WebGLConst.BACK;

            let tr = new Trident(2,2);
            tr.setPos(0,0,0)
            scene.addChild(tr);

            let len = 50;
            camera.setPos(len,len,len)
            
            sun.setDirectional(len,len,len);
            camera.lookat(newVector3D(0,0,0), Y_AXIS);
            let ctl = new TrackballControls(camera, Y_AXIS);
            
            ctl.lock = true;
        }


        rayClickTest(e:EventX){

            


            let camera = ROOT.camera3D;
            let cameraUI = ROOT.cameraUI;
            let rc = singleton(Raycaster);
            let{mouseDownX,mouseDownY} = e.data;
            // mouseDownX = stageWidth >> 1;
            // mouseDownY = stageHeight >> 1;

            let v = TEMP_VECTOR3D;
            v.x = mouseDownX;
            v.y = mouseDownY;
            v.z = 0;
            v.w = 1;
            cameraUI.len.m3_transformVector(v,v);
            rc.setFromCamera(v.x,v.y,camera);

            let ray = rc.ray;

            v = rc.ray.direction.clone() as IVector3D;

            console.log(v.x,v.y,v.z);


            // mouseDownX = stageWidth >> 1;
            // mouseDownY = stageHeight >> 1;
            // let m = TEMP_MATRIX3D.m3_invert(camera.len);
            // let v = TEMP_VECTOR3D;
            // v.x = mouseDownX;
            // v.y = mouseDownY;
            // v.z = 0;
            

            // console.log(mouseDownX,mouseDownY,v.x.toFixed(2),v.y.toFixed(2));

            // v.z = 0.9999;
            // v.w = 1.0;

            // m.m3_transformVector(v,v);

            // camera.transform.m3_transformVector(v, v);

            // v.v4_scale(1/v.w);
            

            // console.log(mouseDownX,mouseDownY,v.x.toFixed(2),v.y.toFixed(2));

            // console.log("----");


            line3d.clear();
            line3d.moveTo(ray.origin.x,ray.origin.y,ray.origin.z,2,0xFF0000);
            v.v3_scale(1000);
            ray.origin.v3_sub(v,v)
            
            // v.v3_add(ray.origin);
            
            line3d.lineTo(v.x,v.y,v.z,2,0xFF0000);
            line3d.end();
        }


        filterTest(){


            let s1 = new Sprite();
            let g:Graphics;

            // s1.renderer = new BatchRenderer(s1);
            // g = s1.graphics;
            // g.drawRect(0,0,stageWidth,stageHeight,0xFF0000);
            // g.end();
            // ROOT.addChild(s1);

            let sp = new Image();
            // sp.scrollRect = {x:0,y:0,w:50,h:60};
            // sp.renderer = new BatchRenderer(sp);

            let hole = new HoleFilter();
            hole.setConstants(40,40,30,10);
            sp.addFilter(hole);
            sp.load("i/zb623.png",ExtensionDefine.PNG);
            sp.setPos(0,0);
            ROOT.addChild(sp);


            // sp = new Image();
            // sp.scrollRect = {x:20,y:20,w:70,h:60};
            // sp.renderer = new BatchRenderer(sp);
            // sp.load("i/zb623.png",ExtensionDefine.PNG);
            // sp.setPos(10,75);

        }



        superBatchTest(){

            ROOT.renderer = new SuperBatchRenderer(ROOT);


            let sp:Sprite;
            let g:Graphics;

            // let source = createUrlSource("i/popchat.png",undefined,e=>{
            //     let sp = new Sprite();
            //     sp.setPos(100,100);
            //     sp.source = source;
            //     g = sp.graphics;
            //     g.clear();
            //     g.drawBitmap(0, 0,source.getSourceVO(0));
            //     g.end();
            //     ROOT.addChild(sp);


            //     sp = new Sprite();
            //     // sp.setSize(100,100);
            //     sp.on(MouseEventX.CLICK,e =>{
            //         g = sp.graphics;
            //         g.clear();
            //         let c = Math.random()*5 + 1;
            //         for (let i = 0; i < c; i++) {
            //             g.drawRect(Math.random() * 100 ,Math.random()*100,100,100,Math.random() * 0xFFFFFF);
            //         }
                    
            //         g.end();
            //     },sp);
            //     // sp.renderer = new SingleRenderer(sp);
            //     g = sp.graphics;
            //     g.clear();
            //     g.drawRect(0,0,100,100,0xFF0000);
            //     g.end();

            //     ROOT.addChild(sp);

            // });

            // sp = new Sprite();
            // g = sp.graphics;
            // g.clear();
            // g.drawRect(0,0,100,100,0xFF0000);
            // g.end();

            // sp.setPos(100,100);

            // sp.rotation = 45;

            // ROOT.addChild(sp);

            // let sp2 = new Sprite();
            // g = sp2.graphics;
            // g.clear();
            // g.drawRect(0,0,50,50,0x00FF00);
            // g.end();
            // sp2.rotation = -45;
            // sp2.setPos(100,0)
            // sp.addChild(sp2);


            // let t = new TextField();
            // t.text = "吃不下了也要吃"
            // t.scale = 1.5
            // sp.addChild(t);

            // max_vc = 60;


            // for (let i = 0; i < 1200; i++) {
            //     sp = new Sprite();
            //     sp.setPos( (i % 20) *20,Math.floor(i/20) * 20);
            //     g = sp.graphics;
            //     g.clear();
            //     g.drawRect(0,0,18,18,0xFF0000);
            //     g.end();
            //     ROOT.addChild(sp);
            // }

            sp = new Sprite();
            g = sp.graphics;
            g.clear();
            g.drawRect(0,0,100,100,0x00FF00);
            g.end();
            ROOT.addChild(sp);


            let sp2 = new Sprite();
            sp2.setPos(50,0);
            sp2.renderer = new SuperBatchRenderer(sp2);
            g = sp2.graphics;
            g.clear();
            g.drawRect(0,0,100,100,0xFF0000);
            g.end();
            ROOT.addChild(sp2);


            sp = new Sprite();
            g = sp.graphics;
            g.clear();
            g.drawRect(100,0,100,100,0xFFFF00);
            g.drawRect(150,0,100,100,0xFF00FF);
            g.end();
            ROOT.addChild(sp);

            sp = new Sprite();
            g = sp.graphics;
            g.clear();
            g.drawRect(200,0,100,100,0xFFFFFF);
            g.end();
            ROOT.addChild(sp);


           



            // setTimeout(() => {
            //     let sp2 = new Sprite();
            //     sp.addChild(sp2);
            // }, 1000);
            




            
            // ROOT.addChild(singleton(GUIProfile))
            
            // sp = new Sprite();
            // sp.renderer = new SuperBatchRenderer(sp);
            // g = sp.graphics;





            // ROOT.addChild(sp);

            // let sourceA = createBitmapSource("test_A",128,128,true);
            // let sA = new Sprite(sourceA);
            // sA.setPos(100,100);
            // g = sA.graphics;
            // g.clear();
            // g.drawRect(0,0,100,100,0xFF0000);
            // g.end();

            // sp.addChild(sA);
            
            // let sourceB = createBitmapSource("test_B",128,128,true);
            // let sB = new Sprite(sourceB);
            // sB.setPos(200,100);
            // g = sA.graphics;
            // g.clear();
            // g.drawRect(0,0,100,100,0xFFDD00);
            // g.end();

            // sp.addChild(sB);

        }



        kfmtest(){


            let sun = new DirectionalLight();
            sun.setPos(100,200,200);
            sun.color = 0xCCCCCC;
            let v = TEMP_VECTOR3D;
            v[0] = v[1] = v[2] = 0;
            sun.lookat(v);
            scene.sun = sun;

            // let camera = ROOT.camera3D;
            // scene.camera = camera;

            // camera.setPos(0,0,-2500);
            // camera.lookat(newVector3D(0,0,0));
            // let ctl = new TrackballControls(camera);
            // ctl.lock = true;

            // var mapdata = testConfig.map[1];

            let camera = singleton(Arpg2DCamera);
            Engine.addTick(camera);
            
            
            // let map = singleton(SnakeMap);
            // map.init(mapdata,stageWidth,stageHeight);
            // scene.addChild(map);

       
            let kfmmesh = new KFMMesh();
            kfmmesh.load("mesh/a10010m/");
            kfmmesh.scale = 100;
            // kfmmesh.setPos(3372, 2348);
            kfmmesh.setPos(200, 200);
            kfmmesh.rotationZ = 180;
            kfmmesh.rotationX = 35;
            scene.addChild(kfmmesh);
            mesh = kfmmesh;

            camera.watchTarget  = kfmmesh;
            // camera.map = map;
            Engine.addResize(camera);

            // map.on(MouseEventX.MouseUp,e => {
            //     kfmmesh.setPos(nativeMouseX+camera._x,nativeMouseY+camera._y);
            //     console.log(nativeMouseX,nativeMouseY);
            //     // tweenTo({x:nativeMouseX + camera._x,y:nativeMouseY + camera._y},2000,defaultTimeMixer,kfmmesh)
            // },this)

            // let pak = new Pak();
            // pak.load("n/0/conf.hp");
            // pak.setPos(3532, 2348);
            // // pak.scale = pixelRatio
            // pak.on(Pak.INFO_COMPLETE,e=>{
            //     pak.anim(0,0,defaultTimeMixer)
            // },this);
            // scene.addChild(pak);

            // Engine.frameRate = 30;
            // let t = new TextField();
            // t.setPos(100,100);
            // ROOT.addChild(t);
            // t.text = pixelFont+" "+pixelRatio + " 大小多少";

            // this.quaternionTest();
        }



        quaternionTest(){

            let m = newMatrix3D();
            m.m3_rotation(45*DEGREES_TO_RADIANS,X_AXIS);
            //mat to qua
            let qua = newVector3D();
            let pos = newVector3D();
            m.m3_decompose(pos,qua,undefined,2);

            let m2 = qua2mat(qua,pos);

        }



        circleTest(){
            let url = "i/zb623.png";
            // url = "p/test.jpg";
            let sp = new Image();
            sp.setPos(20,20);
            // sp.addFilter(new CircleFilter(50,50,50,0));
            sp.load(url);
            ROOT.addChild(sp);

            // sp = new Image();
            // sp.setPos(276,20);
            // // sp.addFilter(new CircleFilter(50,50,50,0));
            // sp.load("m/1/000001.jpg");
            // ROOT.addChild(sp);
        }


        testtest(){
            let bigarr = [];
            let smallarr = [];
            function bigc(){
                for (let i = 65; i < 91; i++) {
                    bigarr.push(String.fromCharCode(i));
                }
            }

            function small(){
                for (let i = 97; i < 123; i++) {
                    smallarr.push(String.fromCharCode(i));
                }
            }

            let xsp = new Sprite();
            xsp.graphics.clear();
            xsp.graphics.drawRect(0, 0, 640, 1080, 0xcccccc);
            xsp.graphics.end();
            popContainer.addChild(xsp);

            bigc();
            small();

            let sz = 16;

            let t = new TextField();
            t.init(textSource);
            t.html = true;
            let format = t.format;
            if(!format){
                format = defalue_format.clone();
            }
            format.align = TextFormatAlign.CENTER;
            format.size = sz;
            t.format = format;
            t.text = "ujst";
            popContainer.addChild(t);

            for (let i = 0; i < bigarr.length; i++) {
                const element = bigarr[i];
                let t = new TextField();
                t.init(textSource);
                let format = t.format;
                if(!format){
                    format = defalue_format.clone();
                }
                format.align = TextFormatAlign.CENTER;
                format.size = sz;
                t.format = format;
                t.text = element;
                popContainer.addChild(t);
                t.x = 100 + i * 40;
                t.y = 40;

                // sz++;
            }

            // sz = 16;

            for (let i = 0; i < smallarr.length; i++) {
                const element = smallarr[i];
                let t = new TextField();
                t.init(textSource);
                let format = t.format;
                if(!format){
                    format = defalue_format.clone();
                }
                format.align = TextFormatAlign.CENTER;
                format.size = sz;
                t.format = format;
                t.text = element;
                popContainer.addChild(t);
                t.x = 100 + i * 40;
                t.y = 90;
                // sz++;
            }

            for (let i = 0; i < smallarr.length; i++) {
                const element = String.fromCharCode(Math.round(Math.random() * (0x9FA5 - 0x4E00)) + 0x4E00);
                let t = new TextField();
                t.init(textSource);
                let format = t.format;
                if(!format){
                    format = defalue_format.clone();
                }
                // format.align = TextFormatAlign.CENTER;
                format.size = sz;
                t.format = format;
                t.text = element;
                popContainer.addChild(t);
                t.x = 100 + i * 60;
                t.y = 140;
                // sz++;
            }


            let sp = new Sprite(textSource);
            sp.renderer = new SuperBatchRenderer(sp);
            let g = sp.graphics;
            g.clear();
            g.drawBitmap(0, 0, {source:textSource, scale:1, name:"txtsource", used:1, time:0, rw:1024, rh:1024, ul:0, ur:1.0, vt:0, vb:1.0, ix:0, iy:0, w:1024,h:1024,x:0,y:0})
            g.end();
            popContainer.addChild(sp);
            sp.setPos(100, 200);
            // wx.request(
            //     {
            //         url:"http://127.0.0.1/zsh5/n/1005/0.png",
            //         complete:(res)=>{
            //             console.log(res);
            //         },
            //         dataType:wx.HttpResponseType.ARRAY_BUFFER,
            //         method:wx.HttpMethod.GET
            //     }
            // )

            



           

/*
            context3D.use_logdepth_ext = false;
            context3D.logarithmicDepthBuffer = false;

            let unitA = new Unit3D();
            unitA.scale = 200;
            // unitA.scaleX *= -1
            unitA.setPos(300,300,1000);
            unitA.setRot(35,0,180);
            scene.addChild(unitA);
            unitA.setBody("mesh/wukong/");
            unitA.setWeapon("mesh/jinkubang/");
            return;
*/
            
            

            // Engine.frameRate = 30;
            // let s = new Sprite();
            // s.renderer = new SingleRenderer(s);
            // let g = s.graphics;
            // g.clear();
            // g.drawRect(0,0,100,100,0xFF0000);
            // g.end();
            // ROOT.addChild(s);

            // let t = new TextField();
            // t.format = new TextFormat();
            // t.format.size = 40;
            // t.setPos(200,900);
            // t.setSize(200,40);
            // t.text = "12345";
            // t.type = TextFieldType.INPUT;
            // ROOT.addChild(t);

            // t = new TextField();
            // t.format = new TextFormat();
            // t.format.size = 40;
            // t.setPos(200,200);
            // t.setSize(200,40);
            // t.text = "12345";
            // t.type = TextFieldType.INPUT;
            // ROOT.addChild(t);


            // wx.log("123456");



            // testConfig = {};
            // let task = new LoadTask();
            // task.on(EventT.COMPLETE,e =>{
            //     this.kfmtest();
            // },this);
            // task.add(CONFIG_PERFIX , "maps.dat",ResType.amf_inflate,e => {
            //     testConfig.map = e.data;
            // },this);

            // this.kfmtest();

            // CONFIG_PERFIX = "http://192.168.1.4/zhushenh5.com/web/config/zhcn/trunk/";



            // this.superBatchTest()


            // loadRes(RES_PERFIX,"m/1.png",(e)=>{

            // })



            // let b:Loader
            // b = new ImageLoader(RES_PERFIX,"n/1005/0.png");
            // b = new Loader(CONFIG_PERFIX,"config.dat");
            // b.on(EventT.COMPLETE,(e)=>{
            //     console.log(e);
            // },this);
            // b.load();
            // b.load(CONFIG_PERFIX,"config.dat")


            // let ani = new Ani();
            // ani.renderer = new SingleRenderer(ani);
            // ani.setPos(200,200);
            // ani.load("ef/1002.ha")
            // ROOT.addChild(ani);

            // let d = new Button();
            // d.setPos(200,200);
            // let graphics = d.graphics;
            // graphics.clear();
            // graphics.drawRect(0,0,200,200,0xFF0000);
            // graphics.end();
            // d.setSize(200,200);
            // d.bindComponents();
            // ROOT.addChild(d);

            // d.on(MouseEventX.CLICK,(e)=>{
            //    wx.showKeyboard(); 
            // },d);

            // let t = new TextField();
            // t.setPos(200,200);
            // t.type = TextFieldType.INPUT;
            // t.text = "点我试一试";
            // ROOT.addChild(t);

            // document.domain = "checkuser.sdk.quicksdk.net";
            // let image = document.createElement("img");
            // image.crossOrigin = "anonymous";
            // image.src = "http://checkuser.sdk.quicksdk.net/v2/checkUserInfo?token=@171@91@163@82@111@88@108@108@105@109@155@111@155@102@100@151@86@96@87@172@159@149@90@114@83@102@105@108@108@100@103@109@97@106@101@104@87@98@89@170@154@164@154@91@111@105@101@106@96@86@152@89@112@83@111@113@101@87@179&uid=13761061158&product_code=45152518333340423707287052755860";

            // d.on(MouseEventX.MouseDown,(e:EventX)=>{
            //     console.log("MouseDown");
            // },this);

            // d.on(MouseEventX.MouseUp,(e:EventX)=>{
            //     console.log("MouseUp");
            // },this);


            // d.on(MouseEventX.CLICK,(e:EventX)=>{
            //     console.log("CLICK");
            // },this);


            // ROOT.update(0,16)
            // setTimeout(() => {
            //     ROOT.update(0,16)
            // }, 200);

            // canvas.width = 800;
            // canvas.height = 500;

            // Engine.removeTick(this);


            /*
            
            


            let g = gl;//canvas.getContext("webgl");

            let c = context3D;

            // c.configureBackBuffer(innerWidth,innerHeight);
            c.clear();

            

            // canvas.width = innerWidth;
            // canvas.height = innerHeight;

            // g.viewport(0, 0, innerWidth, innerHeight);
            // g.disable(g.DEPTH_TEST);
            // g.disable(g.CULL_FACE);
            // g.enable(g.BLEND);
            // g.colorMask(true, true, true, true);
            // g.clearColor(0, 0, 0, 0.5);
            // g.clear(g.COLOR_BUFFER_BIT);
            // console.log(g);

            let vscode = `precision mediump float;
            attribute vec2 pos;
            attribute vec2 uv;
            varying vec2 vUV;
            void main(void){
                vUV = uv;
                gl_Position = vec4(pos,0.0,1.0);
            }`

            let fscode = `precision mediump float;
uniform sampler2D diff;
varying vec2 vUV;
void main(void){
    gl_FragColor = texture2D(diff, vec2(0.0,0.0));
    //vec4(vUV.x,vUV.y,0.0,1.0);
}`


            let program = c.createProgram(vscode,fscode);
            c.setProgram(program);

            



            let source = componentSource

            let{textureData}=source;
            if(!textureData) {
                source.textureData = textureData =  c.getTextureData(source.name,false);
            }

            let t:Texture

            if(!textureData.key){
                t = context3D.createTexture(textureData,source.bmd);
            }else{
                t = context3D.textureObj[textureData.key];
                if(!t){
                    t = context3D.createTexture(textureData,source.bmd);
                }
            }

            t.uploadContext(program,0,"diff")

            // let vs = g.createShader(g.VERTEX_SHADER);
            // g.shaderSource(vs, `
            //  precision mediump float;
            //  attribute vec2 pos;
            //  void main(void){
            //    gl_Position = vec4(pos,0.0,1.0);
            //  }`);
            // g.compileShader(vs);
            
            
            // let fs = g.createShader(g.FRAGMENT_SHADER);
            // g.shaderSource(fs, `precision mediump float;
            //  void main(void){
            //    gl_FragColor = vec4(1.0,1.0,1.0,1.0);
            //  }`);
            // g.compileShader(fs);
            
            
            let p = program.program;

            // g.attachShader(p, vs);
            // g.attachShader(p, fs);
            // g.linkProgram(p);
            
            // g.useProgram(p);

            
            
            // let v = g.createBuffer();
            // g.bindBuffer(g.ARRAY_BUFFER, v);
            // g.bufferData(g.ARRAY_BUFFER, new Float32Array([-1.0,1.0,  1.0,1.0, 1.0,-1.0,  -1.0,-1.0]), g.STATIC_DRAW);
            // let loc = g.getAttribLocation(p, "pos");
            // g.vertexAttribPointer(loc, 2, g.FLOAT, false, 8 , 0);
            // g.enableVertexAttribArray(loc);

            let v = c.createVertexBuffer(
                [
                    -1.0,1.0,0.0,0.0,
                    1.0,1.0,1.0,0.0,
                    1.0,-1.0,1.0,1.0,
                    -1.0,-1.0,0.0,1.0
                ],4);
            v.data.variables = {"pos":{size:2,offset:0},"uv":{size:2,offset:2}}
            v.uploadContext(program);

            let i = c.getIndexByQuad(1);
            if (false == i.readly) {
                i.awaken();
            }
            g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, i.buffer);
                // g.drawElements(g.TRIANGLES, numTriangles * 3, g.UNSIGNED_SHORT, 0);
                
            g.drawElements(g.TRIANGLES,3,g.UNSIGNED_SHORT,0);
            g.drawElements(g.TRIANGLES,3,g.UNSIGNED_SHORT,6);

            // context3D.drawTriangles(context3D.getIndexByQuad(1),2);

            
            // let i = g.createBuffer();
            // g.bindBuffer(g.ELEMENT_ARRAY_BUFFER, i);
            // g.bufferData(g.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,3,1,2,3]), g.STATIC_DRAW);

            // g.drawElements(g.TRIANGLES, 6, g.UNSIGNED_SHORT, 0);
            */

            // this.filterTest();

            // ROOT.on(MouseEventX.ROLL_DOWN, this.rolldownHandler, this);
            // ROOT.on(MouseEventX.ROLL_UP, this.rollupHandler, this);


            // this.circleTest();
    }


    }

    export var mesh:KFMMesh;
    

    export var testConfig:{
        [key:string]:any,
        map?:{[key:string]:IMapData}
    }

    export function qua2mat(qua:IVector3D,pos:IVector3D){
        let xx = qua.x * qua.x;
        let yy = qua.y * qua.y;
        let zz = qua.z * qua.z;
        let ww = qua.w * qua.w;
        let xy2 = 2 * qua.x * qua.y;
        let xz2 = 2 * qua.x * qua.z;
        let xw2 = 2 * qua.x * qua.w;
        let yz2 = 2 * qua.y * qua.z;
        let yw2 = 2 * qua.y * qua.w;
        let zw2 = 2 * qua.z * qua.w;

        var rawData = newMatrix3D();

        rawData[0] = xx - yy - zz + ww;
        rawData[4] = xy2 - zw2;
        rawData[8] = xz2 + yw2;
        rawData[12] = pos.x;
        rawData[1] = xy2 + zw2;
        rawData[5] = -xx + yy - zz + ww;
        rawData[9] = yz2 - xw2;
        rawData[13] = pos.y;
        rawData[2] = xz2 - yw2;
        rawData[6] = yz2 + xw2;
        rawData[10] = -xx - yy + zz + ww;
        rawData[14] = pos.z;
        rawData[3] = 0;
        rawData[7] = 0;
        rawData[11] = 0;
        rawData[15] = 1;

        return rawData;

    }


    // export class TestResize extends Sprite implements IResizeable{
    //     img:Image;
    //     constructor(){
    //         super();

    //         let g = this.graphics;
    //         g.clear();
    //         g.drawRect(0, 0, 640, 1080, 0xffffff);
    //         g.end();

    //         let img = new Image();
    //         img.load("p/bg.jpg");
    //         this.addChild(img);
    //         this.img = img;

    //         this.updateHitArea();

    //         Engine.addResize(this);
    //     }

    //     resize(width:number, height:number){
    //         console.log(height);
    //         this.setPos(0, height - 1080);
    //         this.updateHitArea();
    //     }
    // }

    export class TestPanel extends Panel{
        txt_time:TextField;
        txt_state:TextField;
        txt_name:TextField;
        constructor(){
            super("fightinfo", "ui.asyncpanel.fightinfo");
        }

        create(){

            let txt = this["txt_state"];
            txt.html = true;
            this.txt_state = txt;

            txt = this["txt_time"];
            txt.html = true;
            this.txt_time = txt;

            txt = this["txt_name"];
            txt.text = "名字太显眼";
            txt.type = TextFieldType.INPUT;
            txt.maxChars = 20;
            this.txt_name = txt;

            txt = this["txt_round"];
            txt.text = "第三回合";

            txt = this["txt_num"];
            txt.text = "10/20";

            // let bg = new Image();
            // bg.renderer = new SuperBatchRenderer(bg);
            // bg.load("p/team/bg.png");
            // this.addChildAt(bg, 0);

            // bg = new Image();
            // bg.load("p/face.png");
            // this.addChild(bg);
            // bg.setPos(100, 100);

            // let text_name = new TextField();
            // this.addChild(text_name);
            // text_name.text = "手册测试";

            // let list = new List(this.source, TestListItemRender, 100, 20, 10, 10, true, 2);
            // this.addChild(list);
            // list.setPos(50, 100);
            // list.displayList([,,,,,,,]);

            // list = new List(this.source, TestListItemRender, 100, 20, 10, 10, true, 2);
            // this.addChild(list);
            // list.setPos(50, 300);
            // list.displayList([,,,,,,,,,,,,,,]);

            // time1000.add(this.runtxt, this);

            mainKey.regKeyUp(Keybord.ENTER, this.enterHandle, this);
        }

        enterHandle(e:EventX){
            let txt = new TextField();
            txt.mouseEnabled = false;
            popContainer.addChild(txt);
            txt.text = this.txt_name.text;

            wx.updateKeyboard({value:""} as wx.IKeyboardOption);
        }

        _time = 0;
        runtxt(){
            let {txt_state, txt_time} = this;

            txt_time.text = (this._time) + "";

            let states = ["布队回合", "准备回合", "战斗回合"]
            txt_state.text = `<font color='#ff0000'>${states[Math.round(Math.random() * 2)]}</font>`;
            this._time ++;
        }
    }
}


module skill{
    export var testskill = {}
}