window.long = {};
(function (long) {
    class Global {
    }
    Global.result = 0;
    Global.isWxmj = false;
    Global.isGaming = false;
    Global.is4399 = false;
    Global.MouseModel = false;
    Global.is233 = false;
    Global.isAndroidOppo = false;
    Global.isAndroidVivo = false;
    Global.isAndroidMZ = false;
    Global.isAndroid4399 = false;
    Global.isAndroidcsj = false;
    Global.isAndroidxm = false;
    long.Global = Global;
})(long || (long = {}));

(function (long) {
    class GlobalConfig {
    }
    GlobalConfig.width = 1280;
    GlobalConfig.height = 720;
    GlobalConfig.scaleMode = Laya.Stage.SCALE_FIXED_HEIGHT;
    GlobalConfig.screenMode = Laya.Stage.SCREEN_HORIZONTAL;
    GlobalConfig.isPortrait = true;
    GlobalConfig.alignV = "top";
    GlobalConfig.alignH = "left";
    GlobalConfig.startScene = "test/TestScene.scene";
    GlobalConfig.sceneRoot = "";
    GlobalConfig.debug = false;
    GlobalConfig.stat = false;
    GlobalConfig.physicsDebug = false;
    GlobalConfig.exportSceneToJson = true;
    GlobalConfig.isDown = false;
    GlobalConfig.isMove = false;
    GlobalConfig.scale = 1;
    GlobalConfig.scaleTime = 0.3;
    GlobalConfig.moveSpeed = 0.2;
    GlobalConfig.viewWidth = 0;
    GlobalConfig.viewHeight = 0;
    GlobalConfig.Font_Normal = "Microsoft YaHei";
    GlobalConfig.isFirstLogin = false;
    GlobalConfig.useGM = false;
    GlobalConfig.drawRect = false;
    GlobalConfig.printLog = true;
    GlobalConfig.scene_scale = 1;
    GlobalConfig.FPS = 1 / 60;
    GlobalConfig.isActive = true;
    long.GlobalConfig = GlobalConfig;
})(long || (long = {}));

(function (long) {
    class Logger {
        constructor() {
        }
        static log(obj, str) {
            if (Logger.isShowLog) {
                Logger.outPut("[log] [" + Logger.getClassName(obj) + "] " + str);
            }
        }
        static debug(obj, str) {
            let info = "[debug] [" + Logger.getClassName(obj) + "] " + str;
            if (Laya.Browser.onHWMiniGame || Laya.Browser.onTTMiniGame || Laya.Browser.onMiniGame || Laya.Browser.onVVMiniGame) {
                console.info(info);
            }
            else {
                console.debug(info);
            }
        }
        static net(obj, str) {
            if (Logger.isShowLog && Logger.isNet) {
                Logger.outPut("[net] [" + Logger.getClassName(obj) + "] " + str);
            }
        }
        static error(obj, str) {
            let info = "[debug] [" + Logger.getClassName(obj) + "] " + str;
            console.error(info);
        }
        static warning(obj, str) {
            if (Logger.isShowLog) {
                Logger.outPut("[warning] [" + Logger.getClassName(obj) + "] " + str);
            }
        }
        static outPut(value) {
            console.info(value);
        }
        static getClassName(target) {
            if (typeof target === "string") {
                return target;
            }
            if (target && target.constructor.name === "Function") {
                if (target.name) {
                    return target.name;
                }
                else {
                    console.error("Logger.getClassName 错误!!!");
                }
            }
            return target && target.constructor.name;
        }
    }
    Logger.isNet = false;
    Logger.isShowLog = false;
    long.Logger = Logger;
})(long || (long = {}));

(function (long) {
    class ActionNoQueue {
        constructor(maxCount = 0) {
            this.maxCount = 0;
            this.actions = new Array();
            this.maxCount = maxCount;
        }
        advanceTime() {
            if (this.actions.length == 0) {
                long.GlobalJugger.remove(this);
                return;
            }
            let length = this.maxCount == 0 || this.actions.length < this.maxCount ? this.actions.length : this.maxCount;
            for (let i = 0; i < length; i++) {
                let curAction = this.actions[i];
                if (curAction.IsComplete()) {
                    curAction.OnComplete();
                    curAction.GC();
                    long.ArrayUtil.RemoveAt(this.actions, i);
                    i--;
                    length--;
                }
                else {
                    curAction.advanceTime();
                }
            }
        }
        ClearAll() {
            for (let action of this.actions) {
                action.GC();
            }
            this.actions.length = 0;
        }
        AddAction(action) {
            if (action == null)
                return;
            this.actions.push(action);
            if (this.actions.length == 1) {
                long.GlobalJugger.add(this);
            }
            action.Run();
        }
        RemoveAction(action) {
            var index = this.actions.indexOf(action);
            if (index != -1) {
                this.actions.splice(index, 1);
                if (this.actions.length == 0)
                    Laya.timer.clear(this, this.advanceTime);
            }
        }
        IsEmpty() {
            return this.actions.length == 0;
        }
    }
    long.ActionNoQueue = ActionNoQueue;
})(long || (long = {}));

(function (long) {
    class ActionQueue {
        constructor() {
            this.actions = new Array();
            this.curAction = null;
            this.handler = null;
        }
        advanceTime() {
            if (this.actions.length == 0) {
                long.GlobalJugger.remove(this);
                if (this.handler != null)
                    this.handler.run();
                return;
            }
            if (this.curAction == null) {
                this.curAction = this.actions[0];
                this.curAction.Run();
                return;
            }
            if (this.curAction.IsComplete()) {
                let curAction = this.actions.shift();
                curAction.OnComplete();
                curAction.GC();
                this.curAction = null;
            }
            else {
                this.curAction.advanceTime();
            }
        }
        ClearAll() {
            for (let action of this.actions) {
                action.GC();
            }
            this.actions.length = 0;
            this.handler = null;
            this.curAction = null;
        }
        AddAction(action) {
            if (action == null)
                return;
            this.actions.push(action);
            if (this.actions.length == 1) {
                long.GlobalJugger.add(this);
            }
        }
        RemoveAction(action) {
            var index = this.actions.indexOf(action);
            if (index != -1) {
                this.actions.splice(index, 1);
                if (this.actions.length == 0)
                    Laya.timer.clear(this, this.advanceTime);
            }
        }
        RemoveActionByCls(cls) {
            for (let i = 0; i < this.actions.length; i++) {
                let action = this.actions[i];
                if (action instanceof cls) {
                    this.actions.splice(i, 1);
                }
            }
        }
        IsEmpty() {
            return this.actions.length == 0;
        }
    }
    long.ActionQueue = ActionQueue;
})(long || (long = {}));

(function (long) {
    class BaseAction {
        constructor() {
            this.cls = null;
            this.complete = null;
            this.m_isComplete = false;
        }
        ;
        Run() {
        }
        advanceTime() {
        }
        IsComplete() {
            return this.m_isComplete;
        }
        OnComplete() {
            if (this.complete != null)
                this.complete.run();
        }
        Reset() {
            this.cls = null;
            this.complete = null;
            this.m_isComplete = false;
        }
        GC() {
        }
    }
    long.BaseAction = BaseAction;
})(long || (long = {}));

(function (long) {
    class LoadAnimationAction extends long.BaseAction {
        constructor() {
            super();
            this.url = null;
            this.handler = null;
            this.level = long.LoadLevel.DEFAULT;
        }
        Run() {
            super.Run();
            long.LoadQueue.Inst.loadAnimationClip(this.url, Laya.Handler.create(this, this.onLoadComplete), false, this.level);
        }
        onLoadComplete(sp) {
            if (this.handler) {
                this.handler.runWith(sp);
                this.handler = null;
            }
            this.m_isComplete = true;
        }
        Reset() {
            super.Reset();
            this.url = null;
            this.handler = null;
        }
        GC() {
            long.ObjectPools.Inst.gcObj(LoadAnimationAction.KEY, this);
        }
    }
    LoadAnimationAction.KEY = "LoadAnimationAction";
    long.LoadAnimationAction = LoadAnimationAction;
})(long || (long = {}));

(function (long) {
    class LoadSprite3dAction extends long.BaseAction {
        constructor() {
            super();
            this.url = null;
            this.handler = null;
            this.level = long.LoadLevel.DEFAULT;
        }
        Run() {
            super.Run();
            long.LoadQueue;
            long.LoadQueue.Inst.loadSprite3D(this.url, Laya.Handler.create(this, this.onLoadComplete), this.level);
        }
        onLoadComplete(sp) {
            if (this.handler) {
                this.handler.runWith(sp);
                this.handler = null;
            }
            this.m_isComplete = true;
        }
        Reset() {
            super.Reset();
            this.url = null;
            this.handler = null;
        }
        GC() {
            long.ObjectPools.Inst.gcObj(LoadSprite3dAction.KEY, this);
        }
    }
    LoadSprite3dAction.KEY = "LoadSprite3dAction";
    long.LoadSprite3dAction = LoadSprite3dAction;
})(long || (long = {}));

(function (long) {
    class SkeletonAnimation extends fgui.GComponent {
        constructor() {
            super();
            this.spineName = null;
            this.mFactory = null;
            this.skeleton = null;
            this.isLoop = true;
            this.isOverRemove = false;
            this.handler = null;
            this.loadComplete = null;
            this.touchable = false;
        }
        play(spineName, isLoop = true, isOverRemove = false, handler = null, aniName = null, local = false) {
            let sl = this;
            if (sl.spineName == spineName)
                return;
            sl.clear();
            sl.spineName = spineName;
            sl.isLoop = isLoop;
            sl.isOverRemove = isOverRemove;
            sl.handler = handler;
            let url = long.UrlUtils.GetSpineUrl(spineName);
            sl.mFactory = new Laya.Templet();
            sl.mFactory.once(Laya.Event.COMPLETE, this, this.onComplete, [aniName]);
            sl.mFactory.loadAni(url);
        }
        onComplete(aniName) {
            this.skeleton = this.mFactory.buildArmature(0);
            this.displayObject.addChild(this.skeleton);
            this.skeleton.pos(0, 0);
            this.skeleton.play(aniName == null || aniName == "" ? 0 : aniName, this.isLoop);
            if (!this.isLoop) {
                this.skeleton.once(Laya.Event.STOPPED, this, this.completeHandler);
            }
            if (this.loadComplete != null) {
                this.loadComplete.run();
                this.loadComplete = null;
            }
            this.updateGray();
        }
        updateGray() {
            if (this.skeleton) {
                fgui.ToolSet.setColorFilter(this.skeleton, this.grayed);
            }
        }
        showSkinByName(name) {
            if (this.skeleton) {
                this.skeleton.showSkinByName(name);
            }
        }
        completeHandler() {
            if (this.handler != null)
                this.handler.run();
            if (this.isOverRemove)
                this.clear();
        }
        PlayAni(aniName, isLoop = true, complete = null) {
            if (this.skeleton && this.skeleton.templet) {
                this.skeleton.play(aniName == null || aniName == "" ? 0 : aniName, isLoop);
                if (!isLoop && complete != null) {
                    this.skeleton.once(Laya.Event.STOPPED, null, function () {
                        complete.run();
                    });
                }
            }
        }
        stop() {
            if (this.skeleton) {
                this.skeleton.index = 0;
                this.skeleton.stop();
            }
        }
        get skeletonWidth() {
            return this.skeleton ? this.skeleton.width : 0;
        }
        get skeletonHeight() {
            return this.skeleton ? this.skeleton.height : 0;
        }
        get isLoaded() {
            return this.skeleton != null;
        }
        get SpineName() {
            return this.spineName;
        }
        clear() {
            this.spineName = null;
            this.isLoop = true;
            this.isOverRemove = false;
            this.loadComplete && this.loadComplete.recover();
            this.handler = null;
            this.loadComplete = null;
            this.displayObject.removeChildren();
            if (this.mFactory != null) {
                this.mFactory.off(Laya.Event.COMPLETE, this, this.onComplete, false);
                this.mFactory = null;
            }
            if (this.skeleton != null) {
                this.skeleton.off(Laya.Event.STOPPED, this, this.completeHandler, false);
                try {
                    this.skeleton.destroy(false);
                }
                catch (e) {
                }
                this.skeleton = null;
            }
        }
        dispose() {
            this.clear();
            this.removeFromParent();
        }
    }
    long.SkeletonAnimation = SkeletonAnimation;
})(long || (long = {}));

(function (long) {
    class Bezier {
        constructor() {
        }
        SetPoints(points) {
            if (points.length < 2) {
                throw (new Error("实例化贝塞尔曲线至少需要2个点"));
            }
            else {
                this.m_Points = new Array();
                this.createdLine = new Array();
                this.CreateLine(points);
            }
        }
        AddPoint(point) {
            this.m_Points.push(point);
            this.CreateLine(this.m_Points);
        }
        AddPointAt(index, point) {
            if (index >= 0 && index < this.m_Points.length) {
                this.m_Points.splice(index, 0, point);
                this.CreateLine(this.m_Points);
            }
            else {
                throw (new Error("索引超出范围"));
            }
        }
        RemovePoint(point) {
            if (this.m_Points.length > 2) {
                for (var i = 0; i < this.m_Points.length; i++) {
                    if (this.m_Points[i] == point) {
                        this.m_Points.splice(i, 1);
                        this.CreateLine(this.m_Points);
                    }
                    else {
                        continue;
                    }
                }
            }
            else {
                new Error("当前曲线锚点数量已经最低，不能移除锚点");
            }
        }
        RemovePointAt(index) {
            if (this.m_Points.length > 2) {
                this.m_Points.splice(index, 1);
                this.CreateLine(this.m_Points);
            }
            else {
                new Error("当前曲线锚点数量已经最低，不能移除锚点");
            }
        }
        UpdatePoint(ListIndex, point) {
            if (ListIndex < 0) {
                throw (new Error("坐标索引参数错误（取值必须大于0）"));
            }
            else if (ListIndex >= this.m_Points.length) {
                throw (new Error("坐标索引参数错误（取值必须x小于曲线顶点的个数）"));
            }
            else {
                this.m_Points[ListIndex] = point;
                this.CreateLine(this.m_Points);
            }
        }
        GetPoint(t) {
            var point = new Laya.Vector3();
            if (t < 0) {
                t = 0;
            }
            else if (t > 1) {
                t = 1;
            }
            var bufListLine = this.createdLine;
            if (bufListLine == null) {
                throw (new Error("曲线锚点为空"));
            }
            while (bufListLine.length > 1) {
                bufListLine = this.CaculateResoultLine(bufListLine, t);
            }
            if (bufListLine.length == 1) {
                point = bufListLine[0].GetPoint(t);
            }
            else {
                throw (new Error("Program Error : Current Line Count is:   " + bufListLine.length));
            }
            return point;
        }
        CaculateResoultLine(Lines, t) {
            let ListLine = new Array();
            for (var i = 0; i < Lines.length - 1; i++) {
                var j = i + 1;
                let bufLine = new long.Line(Lines[i].GetPoint(t), Lines[j].GetPoint(t));
                ListLine.push(bufLine);
            }
            return ListLine;
        }
        CreateLine(points) {
            this.createdLine = new Array();
            this.m_Points = points;
            for (var i = 0; i < points.length; i++) {
                let j = i + 1;
                if (j >= points.length) {
                    break;
                }
                else {
                    let curLine = new long.Line(points[i], points[j]);
                    this.createdLine.push(curLine);
                }
            }
        }
    }
    long.Bezier = Bezier;
})(long || (long = {}));

(function (long) {
    class Bezier2D {
        constructor(obj, time, delayTime, points, ease = Laya.Ease.linearIn, handler = null) {
            this.obj = null;
            this.passtime = 0;
            this.delayTime = 0;
            this.resultPos = null;
            this.obj = obj;
            this.delayTime = delayTime;
            this.time = time;
            this.points = points;
            this.resultPos = new Laya.Point();
            this.ease = ease;
            this.handler = handler;
        }
        start() {
            Laya.timer.frameLoop(1, this, this.fly);
            this.passtime = 0;
        }
        fly() {
            this.passtime += Laya.timer.delta;
            if (this.passtime <= this.delayTime)
                return;
            if ((this.passtime - this.delayTime) > this.time) {
                Laya.timer.clear(this, this.fly);
                try {
                    this.obj.removeSelf();
                }
                catch (_a) {
                    this.obj.removeFromParent();
                }
                this.handler && this.handler.run();
                return;
            }
            if (this.obj != null && this.points.length > 1) {
                let ratio = this.ease(this.passtime - this.delayTime, 0, 1, this.time);
                long.MathUtil.GetBezierPoint(this.points, ratio, this.resultPos);
                this.obj.x = this.resultPos.x;
                this.obj.y = this.resultPos.y;
            }
        }
    }
    long.Bezier2D = Bezier2D;
})(long || (long = {}));

(function (long) {
    class BezierScript extends Laya.Script3D {
        constructor() {
            super();
            this.transform = null;
            this.bezierCurve = null;
            this.moveTime = 0;
            this.startTime = 0;
            this.randomAngle = null;
            this.handler = null;
            this.isRemove = false;
        }
        onAwake() {
            this.bezierCurve = new long.Bezier();
            this.transform = this.owner.transform;
        }
        Play(points, moveTime, handler = null, isRemove = true) {
            this.moveTime = moveTime;
            this.bezierCurve.SetPoints(points);
            this.startTime = Laya.timer.currTimer * 0.001;
            this.randomAngle = new Laya.Vector3(0, Math.random() * 6 - 3, Math.random() * 6 - 3);
            this.handler = handler;
            this.isRemove = isRemove;
        }
        onUpdate() {
            if (this.bezierCurve == null)
                return;
            let curTime = Laya.timer.currTimer * 0.001;
            let passTime = curTime - this.startTime;
            let rate = passTime / this.moveTime;
            if (rate <= 1) {
                this.transform.position = this.bezierCurve.GetPoint(rate);
            }
            else {
                if (this.handler) {
                    this.handler.run();
                    this.handler = null;
                }
                if (this.isRemove)
                    this.destroy();
            }
        }
        Reset() {
            if (this.handler) {
                this.handler.recover();
                this.handler = null;
            }
        }
    }
    long.BezierScript = BezierScript;
})(long || (long = {}));

(function (long) {
    class Line {
        constructor(start, end) {
            this._StartPoint = null;
            this._EndPoint = null;
            this.StartPoint = start;
            this.EndPoint = end;
        }
        set StartPoint(value) {
            this._StartPoint = value;
        }
        get StartPoint() {
            return this._StartPoint;
        }
        set EndPoint(value) {
            this._EndPoint = value;
        }
        get EndPoint() {
            return this._EndPoint;
        }
        isMe(point) {
            if (this.StartPoint == point || this.EndPoint == point) {
                return true;
            }
            else {
                return false;
            }
        }
        GetPoint(t) {
            var point = new Laya.Vector3();
            if (t < 0) {
                t = 0;
            }
            else if (t > 1) {
                t = 1;
            }
            point.x = this.EndPoint.x - this.StartPoint.x;
            point.y = this.EndPoint.y - this.StartPoint.y;
            point.z = this.EndPoint.z - this.StartPoint.z;
            point.x *= t;
            point.y *= t;
            point.z *= t;
            point.x += this.StartPoint.x;
            point.y += this.StartPoint.y;
            point.z += this.StartPoint.z;
            return point;
        }
    }
    long.Line = Line;
})(long || (long = {}));

(function (long) {
    class ForeverData {
        constructor() {
            this.wxSceneId = -1;
            this.enterGameCount = 0;
            this.loginTime = 0;
            this.todayFirstTime = 0;
            this.isMusicOn = 0;
            this.isSoundOn = 0;
            this.cacheCheckData = null;
            this.passData = null;
            this.resetCount = 0;
            this.stamina = 0;
            this.skin = 0;
            this.allSkins = [];
            this.useKeybord = 0;
            this.unlockAll = 0;
            this.curLevelId = 1;
        }
    }
    long.ForeverData = ForeverData;
    class DayData {
        constructor() {
            this.viewFreeAdCount = 0;
        }
    }
    long.DayData = DayData;
    class LocalCache {
        constructor() {
            this._foreverData = null;
            this._dayData = null;
            this.todayIsFirst = false;
        }
        static get Inst() {
            if (this.inst == null) {
                this.inst = new LocalCache();
            }
            return this.inst;
        }
        get foreverData() {
            return this._foreverData;
        }
        get dayData() {
            return this._dayData;
        }
        init(handler, FoverCls = null, DayCls = null) {
            let json = Laya.LocalStorage.getJSON(LocalCache.SAVE_KEY) || {};
            this._foreverData = FoverCls != null ? new FoverCls() : new ForeverData();
            if (json) {
                try {
                    let jsonData = typeof json === "string" ? JSON.parse(json) : json;
                    for (let key in jsonData) {
                        this._foreverData[key] = jsonData[key];
                    }
                    long.Logger.debug(this, '=====>common savedata:' + JSON.stringify(this._foreverData));
                    this._foreverData.cacheCheckData = jsonData["cacheCheckData"] || {};
                    this._foreverData.passData = jsonData["passData"] || {};
                    this._foreverData.resetCount = jsonData["resetCount"] || 3;
                    this._foreverData.skin = jsonData["skin"] || 1;
                    this._foreverData.allSkins = jsonData["allSkins"] || [1];
                    if (this._foreverData.loginTime == 0) {
                        this._foreverData.resetCount = 3;
                        this._foreverData.stamina = 10;
                    }
                    Laya.timer.once(200, this, this.initDay, [handler, DayCls]);
                }
                catch (error) {
                    long.Logger.debug(this, '=====>永久数据解析错误 error: ' + error);
                    handler && handler.runWith(false);
                }
            }
        }
        initDay(handler, DayCls = null) {
            this._dayData = DayCls != null ? new DayCls() : new DayData();
            let json = Laya.LocalStorage.getJSON(LocalCache.SAVE_KEY_DAY) || {};
            try {
                let jsonData = typeof json === "string" ? JSON.parse(json) : json;
                for (let key in jsonData) {
                    this._dayData[key] = jsonData[key];
                }
                if (this._foreverData.loginTime == 0) {
                    this._dayData.viewFreeAdCount = 0;
                }
                this.setLoginTime();
                Laya.timer.loop(1000, this, () => {
                    let todayFirstTime = this._foreverData.todayFirstTime;
                    if (!this.judgeIsOneDay(todayFirstTime)) {
                        this.setLoginTime();
                        long.GameDispatcher.Inst.event(long.UIGameEvent.SKIP_DAY);
                    }
                });
                handler && handler.runWith(true);
            }
            catch (error) {
                long.Logger.debug(this, '=====>每日数据解析错误 error: ' + error);
                handler && handler.runWith(false);
            }
        }
        setLoginTime() {
            let logtime = long.TimeUtil.getLocalTime();
            if (this._foreverData.todayFirstTime == 0) {
                this._foreverData.todayFirstTime = logtime;
                this.todayIsFirst = true;
                this.ClearDayAll();
            }
            else if (!this.judgeIsOneDay(this._foreverData.todayFirstTime)) {
                this._foreverData.todayFirstTime = logtime;
                this.todayIsFirst = true;
                this.ClearDayAll();
            }
            if (this._foreverData.loginTime == 0) {
            }
            if (this.todayIsFirst) {
                this._foreverData.stamina += 5;
            }
            this._foreverData.loginTime = logtime;
            this.SaveToDisk();
        }
        judgeIsOneDay(time) {
            let date = new Date();
            let nowDay = date.getDay();
            let nowYear = date.getFullYear();
            let nowMonth = date.getMonth();
            date.setTime(time);
            let prevDay = date.getDay();
            let preYear = date.getFullYear();
            let preMonth = date.getMonth();
            if (nowYear != preYear || nowMonth != preMonth || nowDay != prevDay) {
                return false;
            }
            return true;
        }
        get wxSceneId() {
            let sid = this._foreverData && this._foreverData.wxSceneId;
            return sid + "";
        }
        GetMusic() {
            return this._foreverData.isMusicOn == 0;
        }
        GetSound() {
            return this._foreverData.isSoundOn == 0;
        }
        setCacheLevel(level, data) {
            if (this._foreverData.cacheCheckData == null) {
                this._foreverData.cacheCheckData = {};
            }
            this._foreverData.cacheCheckData[level] = data;
            long.Logger.debug(this, "====>缓存关卡数据 level: " + level + " data: " + JSON.stringify(data));
            this.SaveToDisk();
        }
        getCacheLevel(level) {
            return this._foreverData.cacheCheckData && this._foreverData.cacheCheckData[level];
        }
        get isNewer() {
            if (this._foreverData.passData) {
                for (const key in this._foreverData.passData) {
                    if (key) {
                        return false;
                    }
                }
            }
            return true;
        }
        getPassLevel(id) {
            return this._foreverData.passData ? this._foreverData.passData[id] : null;
        }
        costResetCount(value = 1) {
            if (this._foreverData.resetCount >= value) {
                this._foreverData.resetCount -= value;
                this.SaveToDisk();
                return true;
            }
            return false;
        }
        SaveToDisk() {
            Laya.timer.clear(this, this.saveForeveData);
            Laya.timer.once(200, this, this.saveForeveData);
        }
        saveForeveData() {
            let json = JSON.stringify(this._foreverData);
            Laya.LocalStorage.setJSON(LocalCache.SAVE_KEY, json);
        }
        SaveDayToDisk() {
            Laya.timer.clear(this, this.saveDayData);
            Laya.timer.once(200, this, this.saveDayData);
        }
        saveDayData() {
            let json = JSON.stringify(this._dayData);
            Laya.LocalStorage.setJSON(LocalCache.SAVE_KEY_DAY, json);
        }
        ClearDayAll() {
            this._dayData.viewFreeAdCount = 0;
            Laya.LocalStorage.setJSON(LocalCache.SAVE_KEY_DAY, "{}");
        }
        clearAll() {
            Laya.LocalStorage.setJSON(LocalCache.SAVE_KEY, "{}");
            Laya.LocalStorage.setJSON(LocalCache.SAVE_KEY_DAY, "{}");
            Laya.LocalStorage.clear();
        }
    }
    LocalCache.SAVE_KEY = "ForeverSaveData";
    LocalCache.SAVE_KEY_DAY = "DaySaveData";
    LocalCache.inst = null;
    long.LocalCache = LocalCache;
})(long || (long = {}));

(function (long) {
    class EventObj {
        constructor(type, listener, thisObject, target) {
            this.type = type;
            this.listener = listener;
            this.thisObject = thisObject;
            this.target = target;
        }
        static create(type, listener, thisObject, target) {
            let eo = long.ObjectPools.Inst.getObj(EventObj.KEY, EventObj);
            eo.type = type;
            eo.listener = listener;
            eo.thisObject = thisObject;
            eo.target = target;
            return eo;
        }
        static recover(eo) {
            long.ObjectPools.Inst.gcObj(EventObj.KEY, eo);
        }
        addListen() {
            if (!this.type) {
                return;
            }
            if (this.target) {
                this.target.off(this.type, this.thisObject, this.listener);
                this.target.on(this.type, this.thisObject, this.listener);
            }
            else {
                long.GameDispatcher.Inst.off(this.type, this.thisObject, this.listener);
                long.GameDispatcher.Inst.on(this.type, this.thisObject, this.listener);
            }
        }
        removeListen() {
            if (!this.type) {
                return;
            }
            if (this.target) {
                this.target.off(this.type, this.thisObject, this.listener);
            }
            else {
                long.GameDispatcher.Inst.off(this.type, this.thisObject, this.listener);
            }
        }
        Reset() {
            this.removeListen();
            this.type = null;
            this.listener = null;
            this.thisObject = null;
            this.target = null;
        }
        GC() {
            EventObj.recover(this);
        }
    }
    EventObj.KEY = "ObjectPool.EventObj";
    long.EventObj = EventObj;
})(long || (long = {}));

(function (long) {
    class EventPool {
        constructor() {
            this.pool = null;
            this.pool = new Array();
        }
        AddListenerInPool(type, listener, thisObject, target) {
            this.addListener(type, listener, thisObject, target);
        }
        RemoveListenerFromPool(type, listener, thisObject, target) {
            let eObj = this.getEventObj(type, listener, target, thisObject);
            if (eObj) {
                eObj.removeListen();
            }
        }
        ClearListenerFromPool() {
            this.removeAllListener();
        }
        addListener(type, listener, thisObject, target) {
            let eObj = this.getEventObj(type, listener, target, thisObject);
            if (eObj == null) {
                eObj = long.EventObj.create(type, listener, thisObject, target);
                this.pool.push(eObj);
            }
            eObj.addListen();
        }
        removeAllListener() {
            let len = this.pool.length;
            let eObj;
            for (let i = 0; i < len; i++) {
                eObj = this.pool[i];
                eObj.removeListen();
            }
        }
        getEventObj(type, listener, target, thisObject) {
            let eObj = null;
            for (eObj of this.pool) {
                if (eObj && eObj.type == type && eObj.listener == listener) {
                    if (target && eObj.target != target) {
                        return null;
                    }
                    else if (thisObject && eObj.thisObject != thisObject) {
                        return null;
                    }
                    else {
                        return eObj;
                    }
                }
            }
            return null;
        }
        hasEventListener(type, listener, target, thisObject) {
            let obj = this.getEventObj(type, listener, target, thisObject);
            return obj != null;
        }
        Reset() {
            if (this.pool != null) {
                let eObj;
                for (eObj of this.pool) {
                    if (eObj) {
                        eObj.GC();
                    }
                }
                this.pool.length = 0;
            }
        }
    }
    long.EventPool = EventPool;
})(long || (long = {}));

(function (long) {
    class GameDispatcher extends Laya.EventDispatcher {
        constructor() {
            super();
        }
        static get Inst() {
            if (this._Inst == null)
                this._Inst = new GameDispatcher();
            return this._Inst;
        }
    }
    GameDispatcher._Inst = null;
    long.GameDispatcher = GameDispatcher;
})(long || (long = {}));

(function (long) {
    class BaseState {
        constructor(id) {
            this.id = id;
        }
        GetNextState() {
            if (this.isFinished) {
                return this.nextState;
            }
            return 0;
        }
        OnEnter(exitState, param) {
            this.isFinished = false;
            this.nextState = 0;
            this.passTime = 0;
            this.deltaTime = 0;
            this._DoEnter(exitState, param);
        }
        OnRunning(param, dt) {
            if (this.isFinished)
                return;
            this.deltaTime = dt;
            this.passTime += dt;
            this._DoRunning(param);
        }
        OnExit(enterState, param) {
            this._DoExit(enterState, param);
        }
        OnLateUpdate(dt) {
            if (this.isFinished)
                return;
            this._DoLateUpdate(dt);
        }
        _DoLateUpdate(dt) { }
        _DoEnter(exitState, param) { }
        _DoRunning(param) { }
        _DoExit(enterState, param) { }
    }
    long.BaseState = BaseState;
})(long || (long = {}));

(function (long) {
    class StateMachine {
        constructor() {
            this._states = new long.LTDictionary();
        }
        get count() {
            return this._states.length;
        }
        Add(addState) {
            this._states.set(addState.id, addState);
        }
        Remove(id) {
            return this._states.remove(id);
        }
        RemoveAll() {
            this._states.clear();
            this.currState = null;
        }
        ExitCurrState(param = null) {
            if (null != this.currState) {
                this.currState.OnExit(null, param);
                this.currState = null;
            }
        }
        ChangeState(id, param = null) {
            var state = this.Find(id);
            if (state != null) {
                if (null != this.currState) {
                    this.currState.OnExit(state, param);
                }
                this.lastState = this.currState;
                this.currState = state;
                state.OnEnter(this.lastState, param);
                return true;
            }
            console.error("不存在的状态ID:" + id);
            return false;
        }
        LogicUpdate(dt) {
            let nextState = this.currState.GetNextState();
            if (nextState != 0) {
                this.ChangeState(nextState);
            }
            this.OnRunning(null, dt);
        }
        OnRunning(param, dt) {
            if (null == this.currState) {
                return;
            }
            this.currState.OnRunning(param, dt);
        }
        Find(id) {
            return this._states.get(id);
        }
    }
    long.StateMachine = StateMachine;
})(long || (long = {}));

(function (long) {
    class HttpUrl {
        constructor() {
            this.m_success = null;
            this.m_fail = null;
            this.m_url = null;
            this.index = 0;
            this.xhr = null;
        }
        sendGet(url, success = null, fail = null) {
            this.m_url = url;
            this.m_success = success;
            this.m_fail = fail;
            this.xhr = new Laya.HttpRequest();
            this.xhr.http.timeout = 10000;
            this.xhr.once(Laya.Event.COMPLETE, this, this.completeHandler);
            this.xhr.once(Laya.Event.ERROR, this, this.errorHandler);
            this.xhr.send(url, "", "get", "text");
        }
        errorHandler(data) {
            this.clear();
            this.index++;
            if (this.index >= 3) {
                if (this.m_fail != null)
                    this.m_fail.run();
                return;
            }
            else {
                this.sendGet(this.m_url, this.m_success, this.m_fail);
            }
        }
        completeHandler(data) {
            this.clear();
            if (this.m_success != null)
                this.m_success.runWith(data);
        }
        clear() {
            this.xhr.off(Laya.Event.COMPLETE, this, this.completeHandler);
            this.xhr.off(Laya.Event.ERROR, this, this.completeHandler);
        }
        sendPost(url, postMsg, success = null, fail = null) {
            this.m_url = url;
            this.m_success = success;
            this.m_fail = fail;
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            const postData = JSON.stringify(postMsg);
            xhr.send(postData);
            xhr.onload = function () {
                if (xhr.status == 200) {
                    const re = JSON.parse(xhr.responseText);
                    success.runWith(re);
                }
                else {
                    console.error('请求api失败!' + xhr.status);
                    fail.runWith(xhr.status);
                }
            };
        }
    }
    long.HttpUrl = HttpUrl;
})(long || (long = {}));

(function (long) {
    class AnimationJugger {
        constructor(fps) {
            this.animatinArr = new Array();
            this.lastTime = 0;
            this.fps = fps;
            this.frameTime = 1 / fps;
        }
        advanceTime() {
            let sel = this;
            sel.lastTime += long.GlobalJugger.delta;
            if (sel.lastTime >= sel.frameTime) {
                let framePass = Math.floor(sel.lastTime / sel.frameTime);
                sel.lastTime = sel.lastTime % sel.frameTime;
                let leng = sel.animatinArr.length;
                for (var i = leng - 1; i >= 0; i--) {
                    sel.animatinArr[i].UpdateFrame(framePass);
                }
            }
        }
        add(value) {
            if (this.animatinArr.indexOf(value) == -1) {
                if (this.animatinArr.length == 0)
                    long.GlobalJugger.add(this);
                this.animatinArr.push(value);
            }
        }
        remove(value) {
            var index = this.animatinArr.indexOf(value);
            if (index != -1) {
                this.animatinArr.splice(index, 1);
                if (this.animatinArr.length == 0)
                    long.GlobalJugger.remove(this);
            }
        }
    }
    AnimationJugger.global = new AnimationJugger(12);
    long.AnimationJugger = AnimationJugger;
})(long || (long = {}));

(function (long) {
    class FrameQueueJugger {
        constructor() {
            this.delayArr = new Array();
        }
        static get Inst() {
            if (this._Inst == null)
                this._Inst = new FrameQueueJugger();
            return this._Inst;
        }
        UpdateFrame(frame) {
            if (this.delayArr.length <= 0) {
                return;
            }
            var handler = this.delayArr[0];
            handler.run();
            this.removeAt(0);
        }
        add(value) {
            if (this.delayArr.indexOf(value) == -1) {
                if (this.delayArr.length == 0)
                    long.AnimationJugger.global.add(this);
                this.delayArr.push(value);
            }
        }
        remove(value) {
            var index = this.delayArr.indexOf(value);
            if (index != -1) {
                this.removeAt(index);
            }
        }
        removeAt(index) {
            this.delayArr.splice(index, 1);
            if (this.delayArr.length == 0) {
                long.AnimationJugger.global.remove(this);
            }
        }
    }
    long.FrameQueueJugger = FrameQueueJugger;
})(long || (long = {}));

(function (long) {
    class FrameVO {
        constructor() {
            this.delayFrame = 0;
            this.handler = null;
            this._frame = 0;
        }
        addFame(value) {
            var sel = this;
            sel._frame += value;
            if (sel._frame >= sel.delayFrame) {
                if (sel.handler != null)
                    sel.handler.run();
                long.KeyFrameJugger.Inst.remove(sel);
            }
        }
        GC() {
            long.ObjectPools.Inst.gcObj(FrameVO.KEY, this);
        }
        Reset() {
            this.delayFrame = 0;
            this.handler = null;
        }
    }
    FrameVO.KEY = "FrameVO";
    long.FrameVO = FrameVO;
})(long || (long = {}));

(function (long) {
    class JuggerEvent {
    }
    JuggerEvent.UPDATE_FPS = "UPDATE_FPS";
    long.JuggerEvent = JuggerEvent;
    class GlobalJugger {
        constructor() {
        }
        static start() {
            Laya.timer.frameLoop(1, this, this.entter_frame);
            GlobalJugger.timeMS = Laya.timer.currTimer;
        }
        static stop() {
            Laya.timer.clear(this, this.entter_frame);
        }
        static entter_frame() {
            if (!long.GlobalConfig.isActive) {
                GlobalJugger.fps = GlobalJugger.checkFps60;
                GlobalJugger.checkLastTime = 0;
                return;
            }
            GlobalJugger.delta = Laya.timer.delta;
            this.CheckFps();
            if (GlobalJugger.delta > GlobalJugger.fps) {
                GlobalJugger.delta = GlobalJugger.fps;
            }
            GlobalJugger.timeMS += GlobalJugger.delta;
            GlobalJugger.time = GlobalJugger.timeMS * 0.001;
            for (let ianimatable of GlobalJugger.animatinArr) {
                ianimatable.advanceTime();
            }
        }
        static CheckFps() {
            if (GlobalJugger.delta >= GlobalJugger.checkFps20) {
                if (GlobalJugger.fps == GlobalJugger.checkFps20) {
                    GlobalJugger.checkLastTime = 0;
                    return;
                }
                GlobalJugger.checkLastTime += GlobalJugger.delta;
                if (GlobalJugger.checkLastTime > GlobalJugger.checkFpsTime) {
                    GlobalJugger.fps = GlobalJugger.checkFps20;
                    GlobalJugger.checkLastTime = 0;
                    long.GameDispatcher.Inst.event(JuggerEvent.UPDATE_FPS, GlobalJugger.checkFps20);
                }
                return;
            }
            if (GlobalJugger.delta >= GlobalJugger.checkFps30) {
                if (GlobalJugger.fps == GlobalJugger.checkFps30) {
                    GlobalJugger.checkLastTime = 0;
                    return;
                }
                GlobalJugger.checkLastTime += GlobalJugger.delta;
                if (GlobalJugger.checkLastTime > GlobalJugger.checkFpsTime) {
                    GlobalJugger.fps = GlobalJugger.checkFps30;
                    GlobalJugger.checkLastTime = 0;
                    long.GameDispatcher.Inst.event(JuggerEvent.UPDATE_FPS, GlobalJugger.checkFps30);
                }
                return;
            }
            if (GlobalJugger.delta >= GlobalJugger.checkFps45) {
                if (GlobalJugger.fps == GlobalJugger.checkFps45) {
                    GlobalJugger.checkLastTime = 0;
                    return;
                }
                GlobalJugger.checkLastTime += GlobalJugger.delta;
                if (GlobalJugger.checkLastTime > GlobalJugger.checkFpsTime) {
                    GlobalJugger.fps = GlobalJugger.checkFps45;
                    GlobalJugger.checkLastTime = 0;
                    long.GameDispatcher.Inst.event(JuggerEvent.UPDATE_FPS, GlobalJugger.checkFps45);
                }
                return;
            }
            if (GlobalJugger.delta >= GlobalJugger.checkFps60) {
                if (GlobalJugger.fps == GlobalJugger.checkFps60) {
                    GlobalJugger.checkLastTime = 0;
                    return;
                }
                GlobalJugger.checkLastTime += GlobalJugger.delta;
                if (GlobalJugger.checkLastTime > GlobalJugger.checkFpsTime) {
                    GlobalJugger.fps = GlobalJugger.checkFps60;
                    GlobalJugger.checkLastTime = 0;
                    long.GameDispatcher.Inst.event(JuggerEvent.UPDATE_FPS, GlobalJugger.checkFps60);
                }
                return;
            }
        }
        static add(value) {
            if (this.animatinArr.indexOf(value) == -1) {
                if (this.animatinArr.length == 0)
                    this.start();
                this.animatinArr.push(value);
            }
        }
        static remove(value) {
            var index = this.animatinArr.indexOf(value);
            if (index != -1) {
                long.ArrayUtil.RemoveAt(this.animatinArr, index);
                if (this.animatinArr.length == 0)
                    this.stop();
            }
        }
    }
    GlobalJugger.timeMS = 0;
    GlobalJugger.time = 0;
    GlobalJugger.delta = 0;
    GlobalJugger.animatinArr = new Array();
    GlobalJugger.fps = 1 / 60 * 1000;
    GlobalJugger.checkLastTime = 0;
    GlobalJugger.checkFpsTime = 10000;
    GlobalJugger.checkFps20 = 1 / 20 * 1000;
    GlobalJugger.checkFps30 = 1 / 30 * 1000;
    GlobalJugger.checkFps45 = 1 / 45 * 1000;
    GlobalJugger.checkFps60 = 1 / 60 * 1000;
    long.GlobalJugger = GlobalJugger;
})(long || (long = {}));

(function (long) {
    class KeyFrameJugger {
        constructor() {
            this.animatinArr = new Array();
        }
        static get Inst() {
            if (this._Inst == null)
                this._Inst = new KeyFrameJugger();
            return this._Inst;
        }
        UpdateFrame(frame) {
            var animatinArr = this.animatinArr;
            var leng = animatinArr.length;
            for (var i = leng - 1; i >= 0; i--) {
                var ianimatable = animatinArr[i];
                ianimatable.addFame(frame);
            }
        }
        add(value) {
            if (this.animatinArr.indexOf(value) == -1) {
                if (this.animatinArr.length == 0)
                    long.AnimationJugger.global.add(this);
                this.animatinArr.push(value);
            }
        }
        remove(value) {
            var index = this.animatinArr.indexOf(value);
            if (index != -1) {
                long.ArrayUtil.RemoveAt(this.animatinArr, index);
                value.GC();
                if (this.animatinArr.length == 0)
                    long.AnimationJugger.global.remove(this);
            }
        }
        static delayFrame(delayFrame, handler = null) {
            var vo = null;
            if (delayFrame > 0) {
                vo = long.ObjectPools.Inst.getObj(long.FrameVO.KEY, long.FrameVO);
                vo.delayFrame = delayFrame;
                vo.handler = handler;
                KeyFrameJugger.Inst.add(vo);
            }
            return null;
        }
    }
    long.KeyFrameJugger = KeyFrameJugger;
})(long || (long = {}));

(function (long) {
    class LoadLevel {
        constructor() { }
    }
    LoadLevel.UI_MODEL = 0;
    LoadLevel.DEFAULT = 1;
    LoadLevel.SCENE = 2;
    LoadLevel.SOUND = 3;
    LoadLevel.PROLOADING = 4;
    long.LoadLevel = LoadLevel;
})(long || (long = {}));

(function (long) {
    class LoadQueue {
        constructor() {
            this.currentActions = new Array();
            this._curByteLoad = 0;
            this._byteLoaded = 0;
            this.byteTotal = 0;
            Laya.loader.retryNum = 3;
            long.AssetCache.Init();
        }
        static get Inst() {
            if (this._Inst == null) {
                this._Inst = new LoadQueue();
            }
            return this._Inst;
        }
        loadPageSub(url, handler = null, isRecover = false, level = long.LoadLevel.DEFAULT) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.SubLoadTask.KEY, long.SubLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            loadTask.isRecover = isRecover;
            this.addTask(loadTask);
            return true;
        }
        loadSound(url, handler = null, level = long.LoadLevel.SOUND) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.SoundLoadTask.KEY, long.SoundLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            this.addTask(loadTask);
        }
        loadAtlas(url, handler = null, level = long.LoadLevel.DEFAULT) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = new long.LayaAltasLoadTask();
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            this.addTask(loadTask);
        }
        loadTexture(url, handler = null, level = long.LoadLevel.DEFAULT) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.TextureLoadTask.KEY, long.TextureLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            this.addTask(loadTask);
        }
        loadFguiIcon(pkgName, iconName, path = long.UrlUtils.UI, handler = null, isRecover = false, level = long.LoadLevel.DEFAULT) {
            this.loadFguiPkg(pkgName, path, Laya.Handler.create(this, (pkgName, iconName, handler, res) => {
                res.loadResName(iconName, handler);
            }, [pkgName, iconName, handler]), isRecover, level);
        }
        loadFguiPkg(pkgName, path = long.UrlUtils.UI, handler = null, isRecover = false, level = long.LoadLevel.DEFAULT) {
            if (fgui.UIPackage.getByName(pkgName)) {
                let res = long.AssetCache.assetDic[path + pkgName];
                handler && handler.runWith(res);
                return;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.GroupSheetLoadTask.KEY, long.GroupSheetLoadTask);
            loadTask.handlers.push(handler);
            loadTask.pkgName = pkgName;
            loadTask.url = path + pkgName;
            loadTask.level = level;
            loadTask.isRecover = isRecover;
            this.addTask(loadTask);
        }
        loadUI(pkgName, handler = null, isRecover = true, path = long.UrlUtils.UI, level = long.LoadLevel.UI_MODEL) {
            let url = path + pkgName;
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.UILoadTask.KEY, long.UILoadTask);
            loadTask.handlers.push(handler);
            loadTask.pkgName = pkgName;
            loadTask.url = url;
            loadTask.isRecover = isRecover;
            loadTask.level = level;
            this.addTask(loadTask);
        }
        loadSpine(url, handler = null, isRecover = true, level = long.LoadLevel.UI_MODEL) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.SpineLoadTask.KEY, long.SpineLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            loadTask.isRecover = isRecover;
            this.addTask(loadTask);
        }
        loadParticle(url, handler = null, level = long.LoadLevel.DEFAULT) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.ParticleLoadTask.KEY, long.ParticleLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            this.addTask(loadTask);
        }
        loadSprite3D(url, handler = null, level = long.LoadLevel.DEFAULT) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.Sprite3DLoadTask.KEY, long.Sprite3DLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            this.addTask(loadTask);
        }
        loadScene3D(url, handler = null, level = long.LoadLevel.SCENE) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.Scene3DLoadTask.KEY, long.Scene3DLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            this.addTask(loadTask);
        }
        loadBin(url, handler = null, level = long.LoadLevel.DEFAULT) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.ByteLoadTask.KEY, long.ByteLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            this.addTask(loadTask);
        }
        loadAnimationClip(url, handler = null, isRecover = true, level = long.LoadLevel.DEFAULT) {
            if (this.checkCache(url, handler)) {
                return true;
            }
            if (this.checkQueue(url, handler)) {
                return false;
            }
            var loadTask = long.ObjectPools.Inst.getObj(long.AnimationClipLoadTask.KEY, long.AnimationClipLoadTask);
            loadTask.handlers.push(handler);
            loadTask.url = url;
            loadTask.level = level;
            loadTask.isRecover = isRecover;
            this.addTask(loadTask);
        }
        checkCache(url, handler) {
            var cache = long.AssetCache.assetDic[url];
            if (cache != null) {
                this.byteTotal++;
                this.byteLoaded++;
                if (handler != null) {
                    handler.runWith(cache);
                }
                return true;
            }
            else {
                return false;
            }
        }
        checkQueue(url, handler) {
            var task;
            var leng = this.currentActions.length;
            for (var i = 0; i < leng; i++) {
                task = this.currentActions[i];
                if (task.url == url) {
                    if (handler != null) {
                        task.handlers.push(handler);
                    }
                    return true;
                }
            }
            return false;
        }
        addTask(value) {
            this.byteTotal++;
            long.Logger.log(this, "加载数量：    " + this.byteTotal + "" + value.url);
            var leng = this.currentActions.length;
            if (leng == 0) {
                Laya.timer.frameLoop(1, this, this.advanceTime);
            }
            this.currentActions.push(value);
            value.run();
        }
        advanceTime() {
            if (this.isEmpty) {
                Laya.timer.clear(this, this.advanceTime);
                return;
            }
            var self = this;
            var task;
            var leng = self.currentActions.length;
            for (var i = 0; i < leng; i++) {
                task = self.currentActions[i];
                task.onUpdate();
                if (task.state == long.LoadTask.STATE_COMPLETE) {
                    self.currentActions.splice(i, 1);
                    leng--;
                    i--;
                    self.byteLoaded++;
                    task.GC();
                }
            }
        }
        GetRate() {
            var rate = 0;
            var self = this;
            var task;
            self.curByteLoad = self.byteLoaded;
            var leng = self.currentActions.length;
            for (var i = 0; i < leng; i++) {
                task = self.currentActions[i];
                self.curByteLoad += task.rate;
            }
            if (self.byteTotal == 0)
                return 0;
            return self.curByteLoad / self.byteTotal;
        }
        get isEmpty() {
            return this.currentActions.length == 0;
        }
        clearRate() {
            this.curByteLoad = 0;
            this.byteLoaded = 0;
            this.byteTotal = this.currentActions.length;
        }
        set curByteLoad(value) {
            this._curByteLoad = value;
        }
        get curByteLoad() {
            return this._curByteLoad;
        }
        set byteLoaded(value) {
            this._byteLoaded = value;
        }
        get byteLoaded() {
            return this._byteLoaded;
        }
    }
    long.LoadQueue = LoadQueue;
})(long || (long = {}));

(function (long) {
    class AssetCache {
        constructor() { }
        static Init() {
            Laya.timer.loop(AssetCache.LOOP_TIME, AssetCache, AssetCache.CheckCache);
        }
        static CheckCache() {
            let resDic = AssetCache.assetDic;
            var iRes = null;
            for (let key in resDic) {
                iRes = resDic[key];
                if (iRes.IsCanGc()) {
                    iRes.Destroy();
                    delete resDic[key];
                }
            }
            Laya.Resource.destroyUnusedResources();
        }
        static AddResource(url, resource) {
            AssetCache.assetDic[url] = resource;
        }
        static GetResource(url) {
            return Laya.loader.getRes(url);
        }
        static LoadIcon(loader, url, handler = null) {
            if (!loader || !url)
                return;
            url = decodeURIComponent(url);
            long.LoadQueue.Inst.loadTexture(url, Laya.Handler.create(null, function () {
                loader.url = url;
                if (handler != null)
                    handler.run();
            }));
        }
    }
    AssetCache.assetDic = {};
    AssetCache.LOOP_TIME = 1 * 30 * 1000;
    long.AssetCache = AssetCache;
})(long || (long = {}));

(function (long) {
    class Resource {
        constructor() {
            this.gcTime = Number.MAX_VALUE;
            this.count = 0;
            this.url = null;
            this.data = null;
            this.isRecover = true;
        }
        SetUrl(url) {
            this.url = url;
        }
        Decode(data) {
            this.data = data;
            this.resetGcTime();
        }
        GetRes() {
            this.count++;
            return this.data;
        }
        IsCanGc() {
            return this.isRecover && this.count <= 0 && Laya.timer.currTimer >= this.gcTime;
        }
        resetGcTime() {
            this.gcTime = Laya.timer.currTimer + Resource.CACHE_TIME;
        }
        Dispose() {
            this.count--;
            if (this.count == 0) {
                this.resetGcTime();
                long.Logger.warning(this, "资源达到回收条件：	" + this.url);
            }
            else if (this.count < 0) {
                long.Logger.error(this, "资源有多余销毁次数：	" + this.url);
            }
        }
        Destroy() {
            Resource.DestroyByName(this.url);
            this.GC();
        }
        static DestroyByName(url) {
            Laya.loader.clearRes(url);
            long.Logger.warning(this, "资源销毁成功：	" + url);
        }
        GC() {
        }
        Reset() {
            this.gcTime = Number.MAX_VALUE;
            this.url = null;
            this.data = null;
            this.count = 0;
            this.isRecover = true;
        }
    }
    Resource.CACHE_TIME = 120000;
    Resource.CACHE_OBJECT_TIME = 120000;
    Resource.CACHE_UI_TIME = 60000;
    long.Resource = Resource;
    class AnimationClipResource extends Resource {
        constructor() {
            super();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(AnimationClipResource.KEY, this);
        }
    }
    AnimationClipResource.KEY = "AnimationClipResource";
    long.AnimationClipResource = AnimationClipResource;
    class ByteResource extends Resource {
        constructor() {
            super();
        }
        Destroy() {
            this.GetRes().clear();
            super.Destroy();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(ByteResource.KEY, this);
        }
    }
    ByteResource.KEY = "ByteResource";
    long.ByteResource = ByteResource;
    class GroupSheetResource extends Resource {
        constructor() {
            super();
            this.urls = null;
            this.sourceMap = {};
        }
        setUrls(urls) {
            this.urls = urls;
        }
        setRes(url, source) {
            this.sourceMap[url] = source;
        }
        getRes(resName) {
            let url = fgui.UIPackage.getItemURL(this.pkgName, resName);
            let res = this.sourceMap[url];
            if (res == null) {
                let pkg = fgui.UIPackage.getByName(this.pkgName);
                let item = pkg && pkg.getItemByName(resName);
                let sprite = item && pkg["_sprites"][item.id];
                let atlasItem = sprite && sprite.atlas;
                if (atlasItem && atlasItem.texture) {
                    atlasItem.load();
                    res = fgui.UIPackage.getItemAssetByURL(url);
                    this.setRes(url, res);
                }
            }
            return res;
        }
        loadResName(resName, handler) {
            let url = fgui.UIPackage.getItemURL(this.pkgName, resName);
            let texture = this.getRes(url);
            if (texture) {
                handler && handler.runWith(url);
            }
            else {
                long.PanelRegister.loadUrl(url, Laya.Handler.create(this, (handler, url) => {
                    let texture = fgui.UIPackage.getItemAssetByURL(url);
                    this.setRes(url, texture);
                    handler && handler.runWith(url);
                }, [handler]));
            }
        }
        Reset() {
            super.Reset();
            this.urls = null;
            this.pkgName = "";
            this.sourceMap = {};
        }
        GC() {
            long.ObjectPools.Inst.gcObj(GroupSheetResource.KEY, this);
        }
    }
    GroupSheetResource.KEY = "GroupSheetResource";
    long.GroupSheetResource = GroupSheetResource;
    class ParticleResource extends Resource {
        constructor() {
            super();
        }
        GetRes() {
            let res = super.GetRes();
            if (res == null) {
                return null;
            }
            return res.clone();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(ParticleResource.KEY, this);
        }
    }
    ParticleResource.KEY = "ParticleResource";
    long.ParticleResource = ParticleResource;
})(long || (long = {}));

(function (long) {
    class Scene3DResource extends long.Resource {
        constructor() {
            super();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(Scene3DResource.KEY, this);
        }
        Destroy() {
            this.data.destroy();
            super.Destroy();
        }
    }
    Scene3DResource.KEY = "Scene3DResource";
    long.Scene3DResource = Scene3DResource;
})(long || (long = {}));

(function (long) {
    class SoundResource extends long.Resource {
        constructor() {
            super();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(SoundResource.KEY, this);
        }
    }
    SoundResource.KEY = "SoundResource";
    long.SoundResource = SoundResource;
})(long || (long = {}));

(function (long) {
    class SpineResource extends long.Resource {
        constructor() {
            super();
        }
        Decode(data) {
            data.lock = true;
            super.Decode(data);
        }
        Destroy() {
            if (this.data) {
                this.data.lock = false;
                this.data.destroy();
            }
            super.Destroy();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(SpineResource.KEY, this);
        }
    }
    SpineResource.KEY = "SpineResource";
    long.SpineResource = SpineResource;
})(long || (long = {}));

(function (long) {
    class Sprite3DResource extends long.Resource {
        constructor() {
            super();
        }
        GetRes() {
            let res = super.GetRes();
            if (res == null)
                return null;
            return res.clone();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(Sprite3DResource.KEY, this);
        }
    }
    Sprite3DResource.KEY = "Sprite3DResource";
    long.Sprite3DResource = Sprite3DResource;
})(long || (long = {}));

(function (long) {
    class SubResource extends long.Resource {
        constructor() {
            super();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(SubResource.KEY, this);
        }
    }
    SubResource.KEY = "SubResource";
    long.SubResource = SubResource;
})(long || (long = {}));

(function (long) {
    class TextureResource extends long.Resource {
        constructor() {
            super();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(TextureResource.KEY, this);
        }
    }
    TextureResource.KEY = "TextureResource";
    long.TextureResource = TextureResource;
})(long || (long = {}));

(function (long) {
    class TxtResource extends long.Resource {
        constructor() {
            super();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(TxtResource.KEY, this);
        }
    }
    TxtResource.KEY = "TxtResource";
    long.TxtResource = TxtResource;
})(long || (long = {}));

(function (long) {
    class UIResource extends long.Resource {
        constructor() {
            super();
        }
        Destroy() {
            let index = this.url.lastIndexOf("/");
            if (index != -1) {
                let packageName = this.url.substring(index + 1);
                if (fgui.UIPackage.getByName(packageName))
                    fgui.UIPackage.removePackage(packageName);
            }
            super.Destroy();
        }
        GC() {
            long.ObjectPools.Inst.gcObj(UIResource.KEY, this);
        }
    }
    UIResource.KEY = "UIResource";
    long.UIResource = UIResource;
})(long || (long = {}));

(function (long) {
    class LoadTask {
        constructor() {
            this.handlers = new Array();
            this.level = 0;
            this.state = LoadTask.STATE_DEFAULT;
            this.isRecover = true;
            this.rate = 0;
        }
        run() {
            this.state = LoadTask.STATE_RUN;
        }
        onComplete(iRes, isCache = true) {
            if (iRes)
                long.Logger.log(this, "加载完成：    " + this.url);
            else
                long.Logger.log(this, "加载失败：    " + this.url);
            if (isCache && iRes != null && iRes instanceof long.Resource) {
                iRes.SetUrl(this.url);
                long.AssetCache.AddResource(this.url, iRes);
            }
            this.state = LoadTask.STATE_COMPLETE;
            var leng = this.handlers.length;
            var func;
            for (var i = 0; i < leng; i++) {
                func = this.handlers[i];
                if (func) {
                    iRes != null ? func.runWith(iRes) : func.run();
                }
            }
            this.handlers.length = 0;
            this.rate = 1;
        }
        onUpdate() {
            if (this.rate < 0.95) {
                this.rate += 0.01;
            }
        }
        onLoadProgress(rate) {
            if (rate > 1)
                rate = 1;
            this.rate = rate;
        }
        GetSubName() {
            return null;
        }
        GC() {
        }
        Reset() {
            this.handlers.length = 0;
            this.url = null;
            this.level = 0;
            this.state = LoadTask.STATE_DEFAULT;
            this.isRecover = true;
            this.rate = 0;
        }
    }
    LoadTask.STATE_DEFAULT = 0;
    LoadTask.STATE_RUN = 1;
    LoadTask.STATE_COMPLETE = 2;
    long.LoadTask = LoadTask;
    class AnimationClipLoadTask extends LoadTask {
        constructor() {
            super();
        }
        run() {
            super.run();
            let subName = this.GetSubName();
            if (subName != null) {
                long.LoadQueue.Inst.loadPageSub(subName, Laya.Handler.create(this, this.StartLoad));
            }
            else {
                this.StartLoad(true);
            }
        }
        StartLoad(isSuccess) {
            Laya.loader.load(this.url, Laya.Handler.create(this, this.onLoadComplete), Laya.Handler.create(this, this.onLoadProgress, null, false), Laya.Loader.ANIMATIONCLIP, this.level);
        }
        onLoadComplete(ani) {
            let iRes = long.ObjectPools.Inst.getObj(long.AnimationClipResource.KEY, long.AnimationClipResource);
            if (!this.isRecover) {
                if (ani)
                    ani.lock = true;
            }
            iRes.Decode(ani);
            iRes.isRecover = this.isRecover;
            super.onComplete(iRes);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(AnimationClipLoadTask.KEY, this);
        }
    }
    AnimationClipLoadTask.KEY = "AnimationClipLoadTask";
    long.AnimationClipLoadTask = AnimationClipLoadTask;
    class ByteLoadTask extends LoadTask {
        constructor() { super(); }
        run() {
            super.run();
            Laya.loader.load(this.url, Laya.Handler.create(this, this.onLoadComplete), Laya.Handler.create(this, this.onLoadProgress, null, false), Laya.Loader.BUFFER, this.level);
        }
        onLoadComplete(buffer) {
            let bytes = new Laya.Byte(buffer);
            super.onComplete(bytes);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(ByteLoadTask.KEY, this);
        }
    }
    ByteLoadTask.KEY = "ByteLoadTask";
    long.ByteLoadTask = ByteLoadTask;
    class GroupSheetLoadTask extends LoadTask {
        constructor() {
            super();
        }
        run() {
            super.run();
            let subName = this.GetSubName();
            if (subName != null) {
                long.LoadQueue.Inst.loadPageSub(subName, Laya.Handler.create(this, this.StartLoad));
            }
            else {
                this.StartLoad(true);
            }
        }
        StartLoad(isSuccess) {
            let resKey = this.url;
            let url = resKey + "." + fgui.UIConfig.packageFileExtension;
            fgui.AssetProxy.inst.load(url, Laya.Handler.create(this, this.descCompleteHandler, [resKey]), null, Laya.Loader.BUFFER);
        }
        descCompleteHandler(resKey, asset) {
            let pkg = new fgui.UIPackage();
            pkg["_resKey"] = resKey;
            pkg["loadPackage"](new fgui.ByteBuffer(asset), resKey);
            let cnt = pkg["_items"].length;
            let urls = [];
            for (var i = 0; i < cnt; i++) {
                var pi = pkg["_items"][i];
                if (pi.type == fgui.PackageItemType.Atlas)
                    urls.push({ url: pi.file, type: Laya.Loader.IMAGE });
                else if (pi.type == fgui.PackageItemType.Sound)
                    urls.push({ url: pi.file, type: Laya.Loader.SOUND });
            }
            pkg["_customId"] = resKey;
            fgui.UIPackage["_instById"][pkg.id] = pkg;
            fgui.UIPackage["_instByName"][pkg.name] = pkg;
            this.onLoadComplete(urls);
        }
        onLoadComplete(urls) {
            var resource = new long.GroupSheetResource();
            resource.pkgName = this.pkgName;
            resource.setUrls(urls);
            super.onComplete(resource);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(GroupSheetLoadTask.KEY, this);
        }
    }
    GroupSheetLoadTask.KEY = "GroupSheetLoadTask";
    long.GroupSheetLoadTask = GroupSheetLoadTask;
    class LayaAltasLoadTask extends LoadTask {
        constructor() { super(); }
        run() {
            super.run();
            Laya.loader.load(this.url, Laya.Handler.create(this, this.onLoadComplete), Laya.Handler.create(this, this.onLoadProgress, null, false), Laya.Loader.ATLAS, this.level);
        }
        onLoadComplete(texture) {
            super.onComplete(texture);
        }
    }
    long.LayaAltasLoadTask = LayaAltasLoadTask;
})(long || (long = {}));

(function (long) {
    class ParticleLoadTask extends long.LoadTask {
        constructor() { super(); }
        run() {
            super.run();
            let subName = this.GetSubName();
            if (subName != null) {
                long.LoadQueue.Inst.loadPageSub(subName, Laya.Handler.create(this, this.StartLoad));
            }
            else {
                this.StartLoad(true);
            }
        }
        StartLoad(isSuccess) {
            Laya.loader.load(this.url, Laya.Handler.create(this, this.onLoadComplete), Laya.Handler.create(this, this.onLoadProgress, null, false), Laya.Loader.HIERARCHY, this.level);
        }
        onLoadComplete(sprite) {
            sprite = sprite && sprite.clone();
            super.onComplete(sprite);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(ParticleLoadTask.KEY, this);
        }
    }
    ParticleLoadTask.KEY = "ParticleLoadTask";
    long.ParticleLoadTask = ParticleLoadTask;
})(long || (long = {}));

(function (long) {
    class Scene3DLoadTask extends long.LoadTask {
        constructor() { super(); }
        run() {
            super.run();
            let subName = this.GetSubName();
            if (subName != null) {
                long.LoadQueue.Inst.loadPageSub(subName, Laya.Handler.create(this, this.StartLoad));
            }
            else {
                this.StartLoad(true);
            }
        }
        StartLoad(isSuccess) {
            Laya.loader.load(this.url, Laya.Handler.create(this, this.onLoadComplete), Laya.Handler.create(this, this.onLoadProgress, null, false), Laya.Loader.HIERARCHY, this.level);
        }
        onLoadComplete(scene) {
            super.onComplete(scene);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(Scene3DLoadTask.KEY, this);
        }
    }
    Scene3DLoadTask.KEY = "Scene3DLoadTask";
    long.Scene3DLoadTask = Scene3DLoadTask;
})(long || (long = {}));

(function (long) {
    class SoundLoadTask extends long.LoadTask {
        constructor() { super(); }
        run() {
            super.run();
            let subName = this.GetSubName();
            if (subName != null) {
                long.LoadQueue.Inst.loadPageSub(subName, Laya.Handler.create(this, this.StartLoad));
            }
            else {
                this.StartLoad(true);
            }
        }
        StartLoad(isSuccess) {
            Laya.loader.load(this.url, Laya.Handler.create(this, this.onLoadComplete), Laya.Handler.create(this, this.onLoadProgress, null, false), Laya.Loader.SOUND, this.level);
        }
        onLoadComplete(sound) {
            super.onComplete(sound);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(SoundLoadTask.KEY, this);
        }
    }
    SoundLoadTask.KEY = "SoundLoadTask";
    long.SoundLoadTask = SoundLoadTask;
})(long || (long = {}));

(function (long) {
    class SpineLoadTask extends long.LoadTask {
        constructor() {
            super();
        }
        run() {
            super.run();
            long.Logger.log(this, "开始加载：    " + this.url);
            let templet = new Laya.Templet();
            templet.loadAni(this.url);
            templet.once(Laya.Event.COMPLETE, this, this.onLoadSpineTemplet, [templet]);
        }
        onLoadSpineTemplet(templet) {
            let res = long.ObjectPools.Inst.getObj(long.SpineResource.KEY, long.SpineResource);
            res.isRecover = this.isRecover;
            res.Decode(templet);
            this.onComplete(res, true);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(SpineLoadTask.KEY, this);
        }
    }
    SpineLoadTask.KEY = "SpineLoadTask";
    long.SpineLoadTask = SpineLoadTask;
})(long || (long = {}));

(function (long) {
    class Sprite3DLoadTask extends long.LoadTask {
        constructor() { super(); }
        run() {
            super.run();
            let subName = this.GetSubName();
            if (subName != null) {
                long.LoadQueue.Inst.loadPageSub(subName, Laya.Handler.create(this, this.StartLoad));
            }
            else {
                this.StartLoad(true);
            }
        }
        StartLoad(isSuccess) {
            Laya.loader.load(this.url, Laya.Handler.create(this, this.onLoadComplete), Laya.Handler.create(this, this.onLoadProgress, null, false), Laya.Loader.HIERARCHY, this.level);
        }
        onLoadComplete(sp) {
            sp = sp && sp.clone();
            super.onComplete(sp);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(Sprite3DLoadTask.KEY, this);
        }
    }
    Sprite3DLoadTask.KEY = "Sprite3DLoadTask";
    long.Sprite3DLoadTask = Sprite3DLoadTask;
})(long || (long = {}));

(function (long) {
    class SubLoadTask extends long.LoadTask {
        constructor() {
            super();
            this.count = 0;
        }
        run() {
            super.run();
            let self = this;
            let platform = null;
            if (Laya.Browser.onMiniGame) {
                platform = window["wx"];
            }
            else if (Laya.Browser.onQQMiniGame) {
                platform = window["qq"];
            }
            else if (Laya.Browser.onBDMiniGame) {
                platform = window["swan"];
            }
            else if (Laya.Browser.onQGMiniGame || Laya.Browser.onVVMiniGame) {
                platform = window["qg"];
            }
            if (platform != null) {
                this.loadSub(platform);
            }
            else {
                self.onLoadComplete(true);
            }
        }
        loadSub(platform) {
            let self = this;
            console.log("加载分包: " + this.url);
            let LoadSubpackageTask = platform["loadSubpackage"]({
                name: self.url,
                success: function (res) {
                    console.log("加载分包成功！");
                    self.onLoadComplete(true);
                },
                fail: function (res) {
                    console.log("加载分包失败！");
                    self.count++;
                    if (self.count > 3) {
                        self.onLoadComplete(true);
                    }
                    else {
                        self.loadSub(platform);
                    }
                },
                complete: function () {
                }
            });
            if (LoadSubpackageTask && LoadSubpackageTask.onProgressUpdate != null) {
                LoadSubpackageTask.onProgressUpdate(function (res) {
                    self.onLoadProgress(res.progress);
                });
            }
        }
        onLoadComplete(isSuccess) {
            let iRes = long.ObjectPools.Inst.getObj(long.SubResource.KEY, long.SubResource);
            iRes.isRecover = this.isRecover;
            iRes.Decode(isSuccess);
            super.onComplete(iRes);
            this.count = 0;
        }
        GC() {
            long.ObjectPools.Inst.gcObj(SubLoadTask.KEY, this);
        }
        Reset() {
            super.Reset();
            this.count = 0;
        }
    }
    SubLoadTask.KEY = "SubLoadTask";
    long.SubLoadTask = SubLoadTask;
})(long || (long = {}));

(function (long) {
    class TextureLoadTask extends long.LoadTask {
        constructor() { super(); }
        run() {
            super.run();
            let subName = this.GetSubName();
            if (subName != null) {
                long.LoadQueue.Inst.loadPageSub(subName, Laya.Handler.create(this, this.StartLoad));
            }
            else {
                this.StartLoad(true);
            }
        }
        StartLoad(isSuccess) {
            Laya.loader.load(this.url, Laya.Handler.create(this, this.onLoadComplete), Laya.Handler.create(this, this.onLoadProgress, null, false), Laya.Loader.TEXTURE2D, this.level);
        }
        onLoadComplete(texture) {
            super.onComplete(texture);
        }
        GC() {
            long.ObjectPools.Inst.gcObj(TextureLoadTask.KEY, this);
        }
    }
    TextureLoadTask.KEY = "TextureLoadTask";
    long.TextureLoadTask = TextureLoadTask;
})(long || (long = {}));

(function (long) {
    class UILoadTask extends long.LoadTask {
        constructor() {
            super();
            this.urls = null;
        }
        run() {
            super.run();
            this.StartLoad(null);
        }
        StartLoad(iRes) {
            let self = this;
            let resKey = this.url;
            let url = resKey + "." + fgui.UIConfig.packageFileExtension;
            var descCompleteHandler = Laya.Handler.create(this, function (asset) {
                let pkg = new fgui.UIPackage();
                pkg["_resKey"] = resKey;
                pkg["loadPackage"](new fgui.ByteBuffer(asset), resKey);
                let cnt = pkg["_items"].length;
                this.urls = [];
                for (var i = 0; i < cnt; i++) {
                    var pi = pkg["_items"][i];
                    if (pi.type == fgui.PackageItemType.Atlas)
                        self.urls.push({ url: pi.file, type: Laya.Loader.IMAGE });
                    else if (pi.type == fgui.PackageItemType.Sound)
                        self.urls.push({ url: pi.file, type: Laya.Loader.SOUND });
                }
                if (self.urls.length > 0) {
                    Laya.loader.create(self.urls, Laya.Handler.create(self, self.onLoadComplete, [self.url]), Laya.Handler.create(self, this.onLoadProgress, null, false), null, null, self.level);
                }
                else
                    self.onLoadComplete(self.url, true);
            });
            fgui.AssetProxy.inst.load(url, descCompleteHandler, null, Laya.Loader.BUFFER);
        }
        onLoadComplete(url, isSuccess) {
            if (url == this.url) {
                if (isSuccess) {
                    if (!fgui.UIPackage.getByName(this.pkgName)) {
                        fgui.UIPackage.addPackage(this.url);
                    }
                    let iRes = long.ObjectPools.Inst.getObj(long.UIResource.KEY, long.UIResource);
                    iRes.isRecover = this.isRecover;
                    iRes.Decode(isSuccess);
                    super.onComplete(iRes);
                }
            }
        }
        GC() {
            long.ObjectPools.Inst.gcObj(UILoadTask.KEY, this);
        }
    }
    UILoadTask.KEY = "UILoadTask";
    long.UILoadTask = UILoadTask;
})(long || (long = {}));

(function (long) {
    class Dictionary extends Object {
        constructor() {
            super();
        }
    }
    long.Dictionary = Dictionary;
})(long || (long = {}));

(function (long) {
    class ObjectPool {
        constructor(key, cls) {
            this.gcTime = Number.MAX_VALUE;
            this.objs = null;
            this.cls = null;
            this.key = null;
            this.key = key;
            this.cls = cls;
            this.objs = new Array();
        }
        IsCanGc() {
            return this.objs.length > 0 && Laya.timer.currTimer >= this.gcTime;
        }
        Dispose() {
            this.objs.length = 0;
            this.gcTime = Number.MAX_VALUE;
        }
        getObj(...agrs) {
            if (this.objs.length > 0) {
                let obj = this.objs.pop();
                return obj;
            }
            else if (this.cls != null) {
                return new this.cls(...agrs);
            }
            else {
                return null;
            }
        }
        gcObj(obj) {
            if (obj == null) {
                return;
            }
            if (long.Logger.isShowLog && this.objs.indexOf(obj) != -1) {
                long.Logger.warning(this, "重复回收对象");
                return;
            }
            obj.Reset();
            this.objs.push(obj);
            this.gcTime = Laya.timer.currTimer + long.Resource.CACHE_OBJECT_TIME;
        }
    }
    long.ObjectPool = ObjectPool;
})(long || (long = {}));

(function (long) {
    class ObjectPools {
        constructor() {
            this._classPool = {};
            Laya.timer.loop(long.Resource.CACHE_OBJECT_TIME, this, this.CheckCache);
        }
        static get Inst() {
            if (this._Inst == null)
                this._Inst = new ObjectPools();
            return this._Inst;
        }
        CheckCache() {
            let _classPool = this._classPool;
            let ppol = null;
            for (let key in _classPool) {
                ppol = _classPool[key];
                if (ppol.IsCanGc()) {
                    ppol.Dispose();
                }
            }
        }
        unRegistPoolForClass(key, cls) {
            if (key == null) {
                long.Logger.error(this, key + "key is null!");
                return;
            }
            var pool = this._classPool[key];
            if (pool != null) {
                delete this._classPool[key];
            }
            return pool;
        }
        getObj(key, cls = null, ...agrs) {
            var pool = this._classPool[key];
            if (pool == null) {
                pool = this.registPoolForClass(key, cls);
            }
            return pool.getObj(...agrs);
        }
        registPoolForClass(key, cls) {
            if (key == null) {
                long.Logger.error(this, key + "key is null!");
                return;
            }
            if (key in this._classPool) {
                long.Logger.error(this, key + "key has register!");
                return;
            }
            var pool = new long.ObjectPool(key, cls);
            this._classPool[key] = pool;
            return pool;
        }
        gcObj(key, obj) {
            var pool = this._classPool[key];
            if (pool == null) {
                long.Logger.error(this, "unregister Class");
            }
            pool.gcObj(obj);
        }
    }
    ObjectPools._Inst = null;
    long.ObjectPools = ObjectPools;
})(long || (long = {}));

(function (long) {
    class ToonWaterMaterial extends Laya.Material {
        constructor() {
            super();
            this.setShaderName("ToonWaterShader");
        }
        get NoisTexture() {
            return this._shaderValues.getTexture(ToonWaterMaterial.NOISTEXTURE);
        }
        set NoisTexture(value) {
            this._shaderValues.setTexture(ToonWaterMaterial.NOISTEXTURE, value);
        }
        get TilingOffset() {
            return this._shaderValues.getVector3(ToonWaterMaterial.TILINGOFFSET);
        }
        set TilingOffset(value) {
            this._shaderValues.setVector3(ToonWaterMaterial.TILINGOFFSET, value);
        }
        get WaterColor_1() {
            return this._shaderValues.getVector3(ToonWaterMaterial.WATERCOLOR_1);
        }
        set WaterColor_1(value) {
            this._shaderValues.setVector3(ToonWaterMaterial.WATERCOLOR_1, value);
        }
        get WaterColor_2() {
            return this._shaderValues.getVector3(ToonWaterMaterial.WATERCOLOR_2);
        }
        set WaterColor_2(value) {
            this._shaderValues.setVector3(ToonWaterMaterial.WATERCOLOR_2, value);
        }
        get Water_time() {
            return this._shaderValues.getNumber(ToonWaterMaterial.WATERTIME);
        }
        set Water_time(value) {
            this._shaderValues.setNumber(ToonWaterMaterial.WATERTIME, value);
        }
        static initShader() {
            var attributeMap = {
                'a_Position': Laya.VertexMesh.MESH_POSITION0,
                'a_Normal': Laya.VertexMesh.MESH_NORMAL0,
                'a_Texcoord': Laya.VertexMesh.MESH_TEXTURECOORDINATE0,
                'a_Color': Laya.VertexMesh.MESH_COLOR0
            };
            var uniformMap = {
                'u_MvpMatrix': Laya.Shader3D.PERIOD_SPRITE,
                'u_WorldMat': Laya.Shader3D.PERIOD_SPRITE,
                'u_CameraPos': Laya.Shader3D.PERIOD_CAMERA,
                'u_Texture': Laya.Shader3D.PERIOD_MATERIAL,
                'u_Time': Laya.Shader3D.PERIOD_SCENE,
                'TilingOffset': Laya.Shader3D.PERIOD_MATERIAL,
                'u_WaterColor_1': Laya.Shader3D.PERIOD_MATERIAL,
                'u_WaterColor_2': Laya.Shader3D.PERIOD_MATERIAL,
                'u_Water_time': Laya.Shader3D.PERIOD_MATERIAL,
            };
            var vs = `
            
            #include "Lighting.glsl";
            attribute vec4 a_Position;
            attribute vec2 a_Texcoord;
            attribute vec3 a_Normal;
            attribute vec4 a_Color;
            uniform mat4 u_MvpMatrix;
            uniform vec3 u_CameraPos;
            uniform mat4 u_WorldMat;
            //uniform float u_Time;
            varying vec2 v_Texcoord;
            varying vec3 v_Normal;
            varying vec3 v_ViewDir;
            
            
            varying vec4 v_Color;
            varying vec3 v_PositionWorld;
           
            void main()
            {
                
                    gl_Position=u_MvpMatrix * a_Position;
                    mat3 worldMat=mat3(u_WorldMat);
                    v_Normal=worldMat*a_Normal;
              
                    v_Texcoord=a_Texcoord;
                
                    v_Color = a_Color;
                    v_PositionWorld=(u_WorldMat*a_Position).xyz;            
              
               
                v_ViewDir = u_CameraPos- v_PositionWorld;    //相机视角
    
                gl_Position=remapGLPositionZ(gl_Position); 
            }`;
            var ps = `
            #ifdef FSHIGHPRECISION
                precision highp float;
            #else
                precision mediump float;
            #endif
            #include "Lighting.glsl";
                varying vec2 v_Texcoord;
                varying vec3  v_Normal;
                varying vec3 v_ViewDir;
                varying mat3 ModelViewMatrix;
                varying vec4 v_Color;
                uniform sampler2D u_Texture;
                uniform float u_Time;
                uniform vec3 TilingOffset;
                uniform vec3 u_WaterColor_1;  
                uniform vec3 u_WaterColor_2; 
                uniform float u_Water_time;
            void main()
            {    
                // float T = fract(u_Time*0.1);
                float T = u_Water_time;
                vec3 ViewDir = normalize(v_ViewDir);
                vec3 normal = normalize(v_Normal);
                float F0  = clamp(dot(ViewDir,normal),0.0,1.0);
                vec3 Speed = vec3(-1.0,2.0,0.0);
               vec3 WaterColor =   v_Color.rgb;
               vec3 WaterNois0 =  texture2D(u_Texture,v_Texcoord*TilingOffset.xy+(Speed.xy*T*-1.0)).rgb;
               vec3 WaterNois1 =  texture2D(u_Texture,v_Texcoord*TilingOffset.xy+(WaterNois0.x*0.3)).rgb;
               vec3 F1WaterColor =  WaterColor+smoothstep(0.98,1.0,v_Color.a*(WaterNois0.x+1.0))*u_WaterColor_1;
               vec3 F2WaterColor =  smoothstep(TilingOffset.z,0.5,(WaterNois1.z*1.3)*WaterNois0.x)*u_WaterColor_2+F1WaterColor;
              
                 gl_FragColor =  vec4(F2WaterColor,0.75);
            }`;
            var customShader = Laya.Shader3D.add("ToonWaterShader");
            var subShader = new Laya.SubShader(attributeMap, uniformMap);
            customShader.addSubShader(subShader);
            var ShaderPass = subShader.addShaderPass(vs, ps);
            ShaderPass.renderState.cull = Laya.RenderState.CULL_BACK;
            ShaderPass.renderState.blend = Laya.RenderState.BLEND_ENABLE_ALL;
            ShaderPass.renderState.srcBlend = Laya.RenderState.BLENDPARAM_SRC_ALPHA;
            ShaderPass.renderState.dstBlend = Laya.RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            ShaderPass.renderState.depthWrite = false;
            ShaderPass.renderState.depthTest = Laya.RenderState.DEPTHTEST_LEQUAL;
        }
    }
    ToonWaterMaterial.NOISTEXTURE = Laya.Shader3D.propertyNameToID("u_Texture");
    ToonWaterMaterial.TILINGOFFSET = Laya.Shader3D.propertyNameToID("TilingOffset");
    ToonWaterMaterial.WATERCOLOR_1 = Laya.Shader3D.propertyNameToID("u_WaterColor_1");
    ToonWaterMaterial.WATERCOLOR_2 = Laya.Shader3D.propertyNameToID("u_WaterColor_2");
    ToonWaterMaterial.WATERTIME = Laya.Shader3D.propertyNameToID("u_Water_time");
    long.ToonWaterMaterial = ToonWaterMaterial;
})(long || (long = {}));

(function (long) {
    class SoundMgr {
        constructor() {
            this._isMusicPlay = true;
            this._isSoundPlay = true;
            this._bgUrl = null;
            Laya.SoundManager.autoReleaseSound = false;
            this.replay();
        }
        static get Inst() {
            if (this._Inst == null)
                this._Inst = new SoundMgr();
            return this._Inst;
        }
        play(resName, isSound = true, loops = 1, complete = null) {
            let url = long.UrlUtils.GetMusic(resName);
            if (isSound) {
                long.Logger.debug(this, "=====>播放音效 sound: " + url);
                this.playSound(url, loops, complete);
            }
            else {
                this.playMusic(url, loops, complete);
            }
        }
        playSound(url, loops = 1, complete = null, soundClass = null, startTime = 0) {
            if (!url)
                return;
            if (!this._isSoundPlay)
                return;
            Laya.SoundManager.playSound(url, loops, complete, soundClass, startTime);
        }
        playMusic(url, loops = 0, complete = null, startTime = 0) {
            if (this._bgUrl == url)
                return;
            this.playBackMusic(url, loops, complete, startTime);
        }
        playBackMusic(url, loops = 0, complete = null, startTime = 0) {
            let self = this;
            this._bgUrl = url;
            if (!this._isMusicPlay)
                return;
            long.LoadQueue.Inst.loadSound(url, Laya.Handler.create(null, function (iRes) {
                Laya.SoundManager.stopMusic();
                Laya.timer.once(100, this, () => {
                    Laya.SoundManager.playMusic(url, loops, complete, startTime);
                });
            }));
        }
        set isMusicPlay(value) {
            this._isMusicPlay = value;
            if (!value) {
                Laya.SoundManager.stopMusic();
                if (this.innerAudioContext != null) {
                    this.innerAudioContext.stop();
                }
            }
            else if (this._bgUrl != null) {
                this.playBackMusic(this._bgUrl);
            }
        }
        get isMusicPlay() {
            return this._isMusicPlay;
        }
        set isSoundPlay(value) {
            this._isSoundPlay = value;
        }
        get isSoundPlay() {
            return this._isSoundPlay;
        }
        get bgUrl() {
            return this._bgUrl;
        }
        stop() {
            this.isMusicPlay = false;
            this.isSoundPlay = false;
        }
        replay() {
            this.isMusicPlay = long.LocalCache.Inst.GetMusic();
            this.isSoundPlay = long.LocalCache.Inst.GetSound();
        }
    }
    SoundMgr.back = "back";
    SoundMgr.merge = "merge";
    SoundMgr.click = "click";
    SoundMgr._Inst = null;
    long.SoundMgr = SoundMgr;
})(long || (long = {}));

(function (long) {
    class LinkList {
        constructor() {
            this.root = null;
            this.last = null;
        }
        static create() {
            let list = this.pool.pop() || new LinkList();
            return list;
        }
        static recover(list) {
            if (list) {
                list.clear();
                if (this.pool.indexOf(list) == -1) {
                    this.pool.push(list);
                }
            }
        }
        addNode(node) {
            if (this.root == null) {
                this.root = this.last = node;
                this.root.parentNode = this.last.parentNode = null;
            }
            else {
                let parent = this.last;
                this.last.nextNode = node;
                this.last = node;
                this.last.parentNode = parent;
                this.last.nextNode = null;
            }
        }
        removeNode(node, isAll = false) {
            if (!node)
                return null;
            if (node == this.root) {
                this.clear();
                return node;
            }
            let prev = null;
            let tempNode = this.root;
            while (tempNode !== null) {
                if (tempNode === node) {
                    if (prev == null) {
                        if (node.nextNode == null) {
                            this.root.parentNode = null;
                            this.root.nextNode = null;
                        }
                        this.root = node.nextNode;
                        if (this.root)
                            this.root.parentNode = null;
                    }
                    else if (node.nextNode != null) {
                        if (isAll) {
                            prev.nextNode = null;
                            node.parentNode = null;
                            this.clearNode(node);
                            this.last = prev;
                            prev = null;
                            return node;
                        }
                        else {
                            prev.nextNode = node.nextNode;
                            prev.nextNode.parentNode = prev;
                        }
                    }
                    if (node === this.last) {
                        this.last = prev;
                    }
                    node.ResetNode();
                    return node;
                }
                prev = tempNode;
                tempNode = tempNode.nextNode;
            }
            return null;
        }
        hasNode(node) {
            let tempNode = this.root;
            while (tempNode != null) {
                if (tempNode == node) {
                    return true;
                }
                tempNode = tempNode.nextNode;
            }
            return false;
        }
        clearNode(parentNode) {
            let last = parentNode;
            while (last) {
                if (last.nextNode == null) {
                    break;
                }
                last = last.nextNode;
            }
            let prev;
            for (let node = last; node; node = node.parentNode) {
                node.nextNode = null;
                if (prev) {
                    prev.parentNode = null;
                }
                prev = node;
            }
            if (parentNode) {
                parentNode.ResetNode();
            }
        }
        reverse() {
            let list = [];
            for (let node = this.root; node; node = node.nextNode) {
                list.push(node);
            }
            this.clear();
            while (list.length > 0) {
                this.addNode(list.pop());
            }
            return this;
        }
        clear() {
            let prev;
            for (let node = this.last; node; node = node.parentNode) {
                node.nextNode = null;
                if (prev) {
                    prev.parentNode = null;
                }
                prev = node;
            }
            if (prev) {
                prev.ResetNode();
            }
            this.root = null;
            this.last = null;
        }
        recover() {
            LinkList.recover(this);
        }
    }
    LinkList.pool = [];
    long.LinkList = LinkList;
})(long || (long = {}));

(function (long) {
    class LinkNode {
        constructor() {
            this.parentNode = null;
            this.nextNode = null;
        }
        ResetNode() {
            this.parentNode = null;
            this.nextNode = null;
        }
    }
    long.LinkNode = LinkNode;
})(long || (long = {}));

(function (long) {
    class ArrayUtil {
        static Remove(value, i) {
            value[i] = value[value.length - 1];
            value.pop();
        }
        static randomArray(value, length = 6) {
            var arr = value && value.slice();
            if (arr != null) {
                var rnd;
                var temp;
                var len = arr.length;
                for (var i = 0; i < len; i++) {
                    temp = arr[i];
                    rnd = Math.floor(Math.random() * len);
                    arr[i] = arr[rnd];
                    arr[rnd] = temp;
                }
                arr = arr.slice(0, length);
            }
            return arr;
        }
        static RemoveAt(arr, index) {
            let obj = arr.pop();
            if (index < arr.length) {
                arr[index] = obj;
            }
        }
        static shuffle(arr) {
            let i = arr.length;
            if (i > 1) {
                while (i) {
                    let j = Math.floor(Math.random() * i--);
                    [arr[j], arr[i]] = [arr[i], arr[j]];
                }
            }
            return arr;
        }
        static sortOn(arr, props) {
            return arr.sort(function (a, b) {
                let arr = [a, b];
                arr = arr.concat(props);
                return ArrayUtil.sortByProps.apply(null, arr);
            });
        }
        static sortByProps(item1, item2, ...params) {
            let props = [];
            for (let _i = 2; _i < arguments.length; _i++) {
                props[_i - 2] = arguments[_i];
            }
            let cps = [];
            let asc = true;
            if (props.length < 1) {
                for (let p in item1) {
                    if (item1[p] > item2[p]) {
                        cps.push(1);
                        break;
                    }
                    else if (item1[p] === item2[p]) {
                        cps.push(0);
                    }
                    else {
                        cps.push(-1);
                        break;
                    }
                }
            }
            else {
                for (let i = 0; i < props.length; i++) {
                    let prop = props[i];
                    for (let o in prop) {
                        asc = prop[o] === ArrayUtil.NUMERIC;
                        if (item1[o] > item2[o]) {
                            cps.push(asc ? 1 : -1);
                            break;
                        }
                        else if (item1[o] === item2[o]) {
                            cps.push(0);
                        }
                        else {
                            cps.push(asc ? -1 : 1);
                            break;
                        }
                    }
                }
            }
            for (let j = 0; j < cps.length; j++) {
                if (cps[j] === 1 || cps[j] === -1) {
                    return cps[j];
                }
            }
            return 0;
        }
        static getPages(arr, items = 5) {
            var pages = 0;
            if (arr && arr.length > 0) {
                pages = (arr.length % items) > 0 ? parseInt("" + (arr.length / items)) + 1 : parseInt("" + (arr.length / items));
            }
            else {
                pages = 0;
            }
            return pages || 1;
        }
        static getPageList(arr, page = 1, items = 5) {
            var newArr = new Array;
            var pages = 0;
            if (arr.length > 0) {
                pages = (arr.length % items) > 0 ? parseInt("" + (arr.length / items)) + 1 : parseInt("" + (arr.length / items));
            }
            else {
                pages = 0;
                return newArr;
            }
            if (page > pages) {
                return null;
            }
            var min = (page - 1) * items;
            var max = page * items;
            if (parseInt("" + (arr.length % items)) == 0) {
                max = page * items;
            }
            else {
                max = page == pages ? (page - 1) * items + parseInt("" + (arr.length % items)) : page * items;
            }
            for (var i = min; i < max; i++) {
                newArr.push(arr[i]);
            }
            return newArr;
        }
        static printArray(data, row, list) {
            long.Logger.debug(this, "================打印二维数据================start");
            let arr = null;
            for (let i = 1; i <= row; i++) {
                arr = ArrayUtil.getPageList(data, i, list);
                long.Logger.debug(this, (i - 1) + ": " + arr.join(","));
            }
            long.Logger.debug(this, "================打印二维数据================end");
        }
    }
    ArrayUtil.DESCENDING = "desc";
    ArrayUtil.NUMERIC = "asc";
    long.ArrayUtil = ArrayUtil;
})(long || (long = {}));

(function (long) {
    class Color {
        constructor(r = 1, g = 1, b = 1, a = 1) {
            this.r = r;
            this.g = g;
            this.b = b;
            this.a = a;
        }
        static gammaToLinearSpace(value) {
            if (value <= 0.04045)
                return value / 12.92;
            else if (value < 1.0)
                return Math.pow((value + 0.055) / 1.055, 2.4);
            else
                return Math.pow(value, 2.4);
        }
        static linearToGammaSpace(value) {
            if (value <= 0.0)
                return 0.0;
            else if (value <= 0.0031308)
                return 12.92 * value;
            else if (value <= 1.0)
                return 1.055 * Math.pow(value, 0.41666) - 0.055;
            else
                return Math.pow(value, 0.41666);
        }
        toLinear(out) {
            out.r = Color.gammaToLinearSpace(this.r);
            out.g = Color.gammaToLinearSpace(this.g);
            out.b = Color.gammaToLinearSpace(this.b);
        }
        toGamma(out) {
            out.r = Color.linearToGammaSpace(this.r);
            out.g = Color.linearToGammaSpace(this.g);
            out.b = Color.linearToGammaSpace(this.b);
        }
        cloneTo(destObject) {
            var destColor = destObject;
            destColor.r = this.r;
            destColor.g = this.g;
            destColor.b = this.b;
            destColor.a = this.a;
        }
        clone() {
            var dest = new Color();
            this.cloneTo(dest);
            return dest;
        }
        forNativeElement() {
        }
    }
    Color.RED = new Color(1, 0, 0, 1);
    Color.GREEN = new Color(0, 1, 0, 1);
    Color.BLUE = new Color(0, 0, 1, 1);
    Color.CYAN = new Color(0, 1, 1, 1);
    Color.YELLOW = new Color(1, 0.92, 0.016, 1);
    Color.MAGENTA = new Color(1, 0, 1, 1);
    Color.GRAY = new Color(0.5, 0.5, 0.5, 1);
    Color.WHITE = new Color(1, 1, 1, 1);
    Color.BLACK = new Color(0, 0, 0, 1);
    long.Color = Color;
})(long || (long = {}));

(function (long) {
    class ColorUtil {
        static toHexColor(color) {
            return Laya.Utils.toHexColor(color);
        }
        static toRGBA(color, alpha = 1) {
            let c = this.HexToColor(color);
            return this.MakeStyleString(c.r, c.g, c.b, alpha);
        }
        static MakeStyleString(r, g, b, a = 1.0) {
            r *= 255;
            g *= 255;
            b *= 255;
            if (a < 1) {
                return `rgba(${r},${g},${b},${a})`;
            }
            else {
                return `rgb(${r},${g},${b})`;
            }
        }
        static RgbToHex(r, g, b) {
            var color = r << 16 | g << 8 | b;
            var str = color.toString(16);
            while (str.length < 6)
                str = "0" + str;
            return "#" + str;
        }
        static ColorToHex(color) {
            return this.RgbToHex(color.r * 255, color.g * 255, color.b * 255);
        }
        static HexToColor(colorHex, alpha = 1) {
            if (colorHex.startsWith("#")) {
                colorHex = colorHex.substring(1);
            }
            let cr = colorHex.substring(0, 2);
            let cg = colorHex.substring(2, 4);
            let cb = colorHex.substring(4, 6);
            let ca = colorHex.substring(6, 8);
            let nr = parseInt(cr, 16);
            let ng = parseInt(cg, 16);
            let nb = parseInt(cb, 16);
            let na = alpha ? alpha : parseInt(ca, 16);
            return new long.Color(nr / 255, ng / 255, nb / 255, na);
        }
        static ToV3(color) {
            return new Laya.Vector3(color.r, color.g, color.b);
        }
        static ToV4(color) {
            return new Laya.Vector4(color.r, color.g, color.b, color.a);
        }
        static HexToV3(colorHex) {
            if (colorHex.startsWith("#")) {
                colorHex = colorHex.substring(1);
            }
            let cr = colorHex.substring(0, 2);
            let cg = colorHex.substring(2, 4);
            let cb = colorHex.substring(4, 6);
            let nr = parseInt(cr, 16);
            let ng = parseInt(cg, 16);
            let nb = parseInt(cb, 16);
            return new Laya.Vector3(nr / 255, ng / 255, nb / 255);
        }
        static HexToV4(colorHex, alpha = null) {
            if (colorHex.startsWith("#")) {
                colorHex = colorHex.substring(1);
            }
            let cr = colorHex.substring(0, 2);
            let cg = colorHex.substring(2, 4);
            let cb = colorHex.substring(4, 6);
            let ca = colorHex.substring(6, 8);
            let nr = parseInt(cr, 16);
            let ng = parseInt(cg, 16);
            let nb = parseInt(cb, 16);
            let na = alpha ? alpha : parseInt(ca, 16);
            return new Laya.Vector4(nr / 255, ng / 255, nb / 255, na);
        }
    }
    long.ColorUtil = ColorUtil;
})(long || (long = {}));

(function (long) {
    class CurveUtil {
        static CreateCurvePath(p0, p1, p2, pathLength) {
            let pathList = [];
            if (pathLength < 2) {
                return pathList;
            }
            let ratio = 1 / (pathLength - 1);
            for (let i = 0; i < pathLength; i++) {
                pathList.push(this.BesselCurve(p0, p1, p2, ratio * i));
            }
            return pathList;
        }
        static BesselCurve(p0, p1, p2, t) {
            if (t < 0) {
                t = 0;
            }
            else if (t > 1) {
                t = 1;
            }
            let result = new Laya.Point(Math.pow(1 - t, 2) * p0.x + 2 * t * (1 - t) * p1.x + Math.pow(t, 2) * p2.x, Math.pow(1 - t, 2) * p0.y + 2 * t * (1 - t) * p1.y + Math.pow(t, 2) * p2.y);
            return result;
        }
    }
    long.CurveUtil = CurveUtil;
})(long || (long = {}));

(function (long) {
    class JSUtil {
        constructor() {
        }
        static getRequest(url = location.search) {
            if (JSUtil._rquest == null) {
                var theRequest = this.getRequestParams(url);
                JSUtil._rquest = theRequest;
            }
            return JSUtil._rquest;
        }
        static getRequestParams(url) {
            if (!url)
                return {};
            var theRequest = new Object();
            var index = url.indexOf("?");
            if (index != -1) {
                var str = url.substring(index + 1);
                var strs = str.split("&");
                for (var i = 0; i < strs.length; i++) {
                    var arr = strs[i].split("=");
                    theRequest[arr[0]] = arr[1];
                }
            }
            return theRequest;
        }
        static getHref(url = window.location.href) {
            let index = url.lastIndexOf("?");
            if (index != -1) {
                url = url.substring(0, index);
            }
            index = url.lastIndexOf(".html");
            if (index != -1) {
                index = url.lastIndexOf("/");
                url = url.substring(0, index);
            }
            else {
                let lastStr = url.substr(url.length - 1, 1);
                if (lastStr == "/") {
                    url = url.substr(0, url.length - 1);
                }
            }
            return url;
        }
        static openHttpUrl(url, target = "_self") {
            window.open(url, target);
        }
    }
    long.JSUtil = JSUtil;
})(long || (long = {}));

(function (long) {
    class LTDictionary {
        constructor() {
            this.items = {};
        }
        set(key, value) {
            this.items[key] = value;
        }
        has(key) {
            return this.items.hasOwnProperty(key);
        }
        remove(key) {
            if (!this.has(key))
                return false;
            delete this.items[key];
            return true;
        }
        get(key) {
            return this.has(key) ? this.items[key] : undefined;
        }
        keys() {
            return Object.keys(this.items);
        }
        get length() {
            return this.keys().length;
        }
        clear() {
            this.items = {};
        }
    }
    long.LTDictionary = LTDictionary;
})(long || (long = {}));

(function (long) {
    class MathUtil {
        static calculateLinePoint(bpoint, direction, distance, out = null) {
            Laya.Vector3.normalize(direction, direction);
            if (out == null) {
                out = new Laya.Vector3();
            }
            out.setValue(bpoint.x + direction.x * distance, bpoint.y + direction.y * distance, bpoint.z + direction.z * distance);
            return out;
        }
        static GetForward(transform) {
            let out = new Laya.Vector3();
            transform.getForward(out);
            Laya.Vector3.scale(out, -1, out);
            return out;
        }
        static localToGlobal(sp, parent) {
            if (sp.parent == parent)
                return;
            let position = sp.transform.position.clone();
            let rotationEuler = sp.transform.rotationEuler.clone();
            parent.addChild(sp);
            sp.transform.position = position;
            sp.transform.rotationEuler = rotationEuler;
        }
        static globalToLocal(sp, parent) {
            let position = sp.transform.localPosition.clone();
            let rotationEuler = sp.transform.localRotationEuler.clone();
            parent.addChild(sp);
            sp.transform.localPosition = MathUtil.InverseTransformPoint(parent.transform, position);
            sp.transform.localRotationEuler = rotationEuler;
        }
        static translate(ts, offset) {
            let pos = new Laya.Vector3();
            Laya.Matrix4x4.createFromQuaternion(ts.rotation, Laya.Transform3D['_tempMatrix0']);
            Laya.Vector3.transformCoordinate(offset, Laya.Transform3D['_tempMatrix0'], Laya.Transform3D['_tempVector30']);
            Laya.Vector3.add(ts.position, Laya.Transform3D['_tempVector30'], pos);
            return pos;
        }
        static InverseTransformPoint(parent, position) {
            let tempMatrix = new Laya.Matrix4x4();
            parent.worldMatrix.invert(tempMatrix);
            let v3 = new Laya.Vector3();
            Laya.Vector3.transformCoordinate(position, tempMatrix, v3);
            return v3;
        }
        static GetPointFrom3DWorld(camera, pos3d, ui = null) {
            let uiPos = new Laya.Vector4();
            camera && camera.viewport.project(pos3d, camera.projectionViewMatrix, uiPos);
            uiPos.x = Math.ceil(uiPos.x);
            uiPos.y = Math.ceil(uiPos.y);
            if (ui != null) {
                return ui.globalToLocal(uiPos.x, uiPos.y);
            }
            else {
                return new Laya.Point(uiPos.x, uiPos.y);
            }
        }
        static GetScalePos(sPos, ePos, scale) {
            let dir = new Laya.Vector3();
            Laya.Vector3.subtract(ePos, sPos, dir);
            Laya.Vector3.scale(dir, scale, dir);
            return new Laya.Vector3(sPos.x + dir.x, sPos.y + dir.y, sPos.z + dir.z);
        }
        static distance(px1, py1, px2, py2) {
            let dx = px1 - px2;
            let dy = py1 - py2;
            return Math.sqrt(dx * dx + dy * dy);
        }
        static distanceNS(sx, sy, tx, ty) {
            let dx = tx - sx;
            let dy = ty - sy;
            return dx * dx + dy * dy;
        }
        static random(jilv, maxJilv = MathUtil.max) {
            if (jilv == 0)
                return false;
            let base = Math.random() * maxJilv;
            return base <= jilv;
        }
        static makeRandom(min, max) {
            let num = min + Math.random() * (max - min);
            return num < max ? Math.floor(num) : max;
        }
        static angleToRadian(angle) {
            let l = angle * Math.PI / 180;
            return l;
        }
        static radianToAngle(l) {
            return l * 180 / Math.PI;
        }
        static GetMeshSprite3D(sp) {
            if (sp == null)
                return null;
            if (sp instanceof Laya.MeshSprite3D) {
                return sp;
            }
            let length = sp.numChildren;
            for (let i = 0; i < length; i++) {
                const element = sp.getChildAt(i);
                let node = MathUtil.GetMeshSprite3D(element);
                if (node != null)
                    return node;
            }
            return null;
        }
        static GetMaterial(sp) {
            if (sp == null)
                return null;
            if (sp instanceof Laya.MeshSprite3D) {
                return sp.meshRenderer.sharedMaterial;
            }
            let length = sp.numChildren;
            for (let i = 0; i < length; i++) {
                const element = sp.getChildAt(i);
                let mat = MathUtil.GetMaterial(element);
                if (mat != null)
                    return mat;
            }
            return null;
        }
        static FindSprite3DByName(parent, name) {
            if (parent == null)
                return null;
            if (parent.name == name) {
                return parent;
            }
            let length = parent.numChildren;
            for (let i = 0; i < length; i++) {
                const element = parent.getChildAt(i);
                let node = MathUtil.FindSprite3DByName(element, name);
                if (node != null)
                    return node;
            }
            return null;
        }
        static FindPhysicsCollider(parent) {
            if (parent == null)
                return null;
            let phy = parent.getComponent(Laya.PhysicsCollider);
            if (phy != null) {
                return phy;
            }
            let length = parent.numChildren;
            for (let i = 0; i < length; i++) {
                const element = parent.getChildAt(i);
                let node = MathUtil.FindPhysicsCollider(element);
                if (node != null)
                    return node;
            }
            return null;
        }
        static MultiPointBezier(points, t, resultPos) {
            resultPos.setTo(0, 0);
            var len = points.length;
            var erxiangshi = function (start, end) {
                var cs = 1, bcs = 1;
                while (end > 0) {
                    cs *= start;
                    bcs *= end;
                    start--;
                    end--;
                }
                return (cs / bcs);
            };
            for (var i = 0; i < len; i++) {
                var point = points[i];
                resultPos.x += point.x * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
                resultPos.y += point.y * Math.pow((1 - t), (len - 1 - i)) * Math.pow(t, i) * (erxiangshi(len - 1, i));
            }
            return resultPos;
        }
        static angle(a, b) {
            let aa = new Laya.Vector3();
            Laya.Vector3.normalize(a, aa);
            let bb = new Laya.Vector3();
            Laya.Vector3.normalize(b, bb);
            let angle = Math.acos(Laya.Vector3.dot(aa, bb));
            return angle * (180 / Math.PI);
        }
        static changeToM180To180(sourceAngel) {
            let x = MathUtil.clampAngle(sourceAngel.x, -180);
            let y = MathUtil.clampAngle(sourceAngel.y, -180);
            let z = MathUtil.clampAngle(sourceAngel.z, -180);
            return new Laya.Vector3(x, y, z);
        }
        static ClampRotationEulerRange(curRot, targetRot) {
            curRot.x = MathUtil.clampAngle(curRot.x, targetRot.x - 180);
            curRot.x = MathUtil.MinNearAngle(curRot.x, targetRot.x);
            curRot.y = MathUtil.clampAngle(curRot.y, targetRot.y - 180);
            curRot.y = MathUtil.MinNearAngle(curRot.y, targetRot.y);
            curRot.z = MathUtil.clampAngle(curRot.z, targetRot.z - 180);
            curRot.z = MathUtil.MinNearAngle(curRot.z, targetRot.z);
            return curRot;
        }
        static clampAngle(angle, min) {
            if (angle < min) {
                angle += 360;
                angle = MathUtil.clampAngle(angle, min);
            }
            else if (angle > min + 360) {
                angle -= 360;
                angle = MathUtil.clampAngle(angle, min);
            }
            return angle;
        }
        static MinNearAngle(curAngle, angle) {
            if (angle > curAngle) {
                if (angle - curAngle < (curAngle + 360) - angle) {
                    return curAngle;
                }
                else {
                    return curAngle + 360;
                }
            }
            else {
                if (curAngle - angle < angle - (curAngle - 360)) {
                    return curAngle;
                }
                else {
                    return curAngle - 360;
                }
            }
        }
        static GetBezierPoint(points, t, retPos) {
            retPos.setTo(0, 0);
            var getPoint = function (start, end, t) {
                let x = start.x + (end.x - start.x) * t;
                let y = start.y + (end.y - start.y) * t;
                return new Laya.Point(x, y);
            };
            let newPointArr = [];
            for (let i = 0; i < points.length; i++) {
                newPointArr.push(points[i]);
            }
            while (newPointArr.length > 1) {
                let arr = [];
                for (let i = 0; i < newPointArr.length - 1; i++) {
                    arr.push(getPoint(newPointArr[i], newPointArr[i + 1], t));
                }
                newPointArr = arr;
            }
            retPos.x = newPointArr[0].x;
            retPos.y = newPointArr[0].y;
            return retPos;
        }
        static GetRandomItemByWeight(list, count = 1) {
            if (list == null || list.length <= 0) {
                return null;
            }
            let totalWeight = 0;
            for (let i = 0; i < list.length; i++) {
                let item = list[i];
                if (item.weight == null) {
                    item.weight = 1;
                }
                totalWeight += item.weight;
            }
            let list1 = list.slice();
            list1 = list1.sort((a, b) => {
                if (a.weight < b.weight)
                    return -1;
                else if (a.weight > b.weight)
                    return 1;
                else
                    return 0;
            });
            let retArr = [];
            for (let i = 0; i < count; i++) {
                let reItem = MathUtil.GetRandomItem2(list1, totalWeight);
                totalWeight -= reItem.weight;
                retArr.push(reItem);
            }
            return retArr;
        }
        static GetRandomItem(list, totalWeight = 10000) {
            if (list == null || list.length <= 0) {
                return null;
            }
            let list1 = list.slice();
            list1 = list1.sort((a, b) => {
                if (a.weight < b.weight)
                    return -1;
                else if (a.weight > b.weight)
                    return 1;
                else
                    return 0;
            });
            let random = MathUtil.makeRandom(0, totalWeight);
            let length = list1.length;
            let startJv = 0;
            let item = null;
            for (let i = 0; i < length; i++) {
                let roll = list1[i];
                startJv += roll.weight;
                if (random < startJv) {
                    item = roll;
                    list1.splice(i, 1);
                    break;
                }
            }
            return item;
        }
        static GetRandomItem2(list1, totalWeight = 10000) {
            if (list1 == null || list1.length <= 0) {
                return null;
            }
            let random = MathUtil.makeRandom(0, totalWeight);
            let length = list1.length;
            let startJv = 0;
            let item = null;
            for (let i = 0; i < length; i++) {
                let roll = list1[i];
                startJv += roll.weight;
                if (random < startJv) {
                    item = roll;
                    list1.splice(i, 1);
                    break;
                }
            }
            return item;
        }
        static rotateAroundAxis(V1, T, angle) {
            let retVector = new Laya.Vector3();
            let tempVector1 = new Laya.Vector3();
            let tempValue1 = Laya.Vector3.dot(T, V1);
            tempVector1.x = tempValue1 * T.x;
            tempVector1.y = tempValue1 * T.y;
            tempVector1.z = tempValue1 * T.z;
            Laya.Vector3.subtract(V1, tempVector1, retVector);
            retVector.x = Math.cos(angle) * retVector.x;
            retVector.y = Math.cos(angle) * retVector.y;
            retVector.z = Math.cos(angle) * retVector.z;
            let tempVector2 = new Laya.Vector3();
            Laya.Vector3.cross(T, V1, tempVector2);
            tempVector2.x = Math.sin(angle) * tempVector2.x;
            tempVector2.y = Math.sin(angle) * tempVector2.y;
            tempVector2.z = Math.sin(angle) * tempVector2.z;
            Laya.Vector3.add(retVector, tempVector2, retVector);
            Laya.Vector3.add(retVector, tempVector1, retVector);
            return retVector;
        }
        static WorldToScreen2(camera, point) {
            var pointA = this.InverseTransformPoint2(camera.transform, point);
            var distance = pointA.z;
            var out = new Laya.Vector3();
            camera.viewport.project(point, camera.projectionViewMatrix, out);
            var value = new Laya.Vector3(out.x / Laya.stage.clientScaleX, out.y / Laya.stage.clientScaleY, distance);
            return value;
        }
        static ScreenToWorld(camera, point) {
            var halfFOV = (camera.fieldOfView * 0.5) * Math.PI / 180;
            let height = point.z * Math.tan(halfFOV);
            let width = height * camera.aspectRatio;
            let lowerLeft = this.GetLowerLeft(camera.transform, point.z, width, height);
            let v = this.GetScreenScale(width, height);
            var value = new Laya.Vector3();
            var lowerLeftA = this.InverseTransformPoint2(camera.transform, lowerLeft);
            value = new Laya.Vector3(-point.x / v.x, point.y / v.y, 0);
            Laya.Vector3.add(lowerLeftA, value, value);
            value = this.TransformPoint(camera.transform, value);
            return value;
        }
        static GetScreenScale(width, height) {
            var v = new Laya.Vector3();
            v.x = Laya.stage.width / width / 2;
            v.y = Laya.stage.height / height / 2;
            return v;
        }
        static GetLowerLeft(transform, distance, width, height) {
            var lowerLeft = new Laya.Vector3();
            var right = new Laya.Vector3();
            transform.getRight(right);
            Laya.Vector3.normalize(right, right);
            var xx = new Laya.Vector3(right.x * width, right.y * width, right.z * width);
            Laya.Vector3.add(transform.position, xx, lowerLeft);
            var up = new Laya.Vector3();
            transform.getUp(up);
            Laya.Vector3.normalize(up, up);
            var yy = new Laya.Vector3(up.x * height, up.y * height, up.z * height);
            Laya.Vector3.subtract(lowerLeft, yy, lowerLeft);
            var forward = new Laya.Vector3();
            transform.getForward(forward);
            Laya.Vector3.normalize(forward, forward);
            var zz = new Laya.Vector3(forward.x * distance, forward.y * distance, forward.z * distance);
            Laya.Vector3.subtract(lowerLeft, zz, lowerLeft);
            return lowerLeft;
        }
        static InverseTransformPoint2(origin, point) {
            var xx = new Laya.Vector3();
            origin.getRight(xx);
            var yy = new Laya.Vector3();
            origin.getUp(yy);
            var zz = new Laya.Vector3();
            origin.getForward(zz);
            var zz1 = new Laya.Vector3(-zz.x, -zz.y, -zz.z);
            var x = this.ProjectDistance(point, origin.position, xx);
            var y = this.ProjectDistance(point, origin.position, yy);
            var z = this.ProjectDistance(point, origin.position, zz1);
            var value = new Laya.Vector3(x, y, z);
            return value;
        }
        static TransformPoint(origin, point) {
            var value = new Laya.Vector3();
            Laya.Vector3.transformQuat(point, origin.rotation, value);
            Laya.Vector3.add(value, origin.position, value);
            return value;
        }
        static ProjectDistance(A, C, B) {
            var CA = new Laya.Vector3();
            Laya.Vector3.subtract(A, C, CA);
            var angle = this.Angle2(CA, B) * Math.PI / 180;
            var distance = Laya.Vector3.distance(A, C);
            distance *= Math.cos(angle);
            return distance;
        }
        static Angle2(ma, mb) {
            var v1 = (ma.x * mb.x) + (ma.y * mb.y) + (ma.z * mb.z);
            var ma_val = Math.sqrt(ma.x * ma.x + ma.y * ma.y + ma.z * ma.z);
            var mb_val = Math.sqrt(mb.x * mb.x + mb.y * mb.y + mb.z * mb.z);
            var cosM = v1 / (ma_val * mb_val);
            if (cosM < -1)
                cosM = -1;
            if (cosM > 1)
                cosM = 1;
            var angleAMB = Math.acos(cosM) * 180 / Math.PI;
            return angleAMB;
        }
        static GetPosByStr(strArr) {
            return new Laya.Vector3(-parseFloat(strArr[0]), parseFloat(strArr[1]), parseFloat(strArr[2]));
        }
        static GetRotByStr(strArr) {
            return new Laya.Vector3(-parseFloat(strArr[0]), 180 - parseFloat(strArr[1]), parseFloat(strArr[2]));
        }
        static GetColorByStr(strArr) {
            return new Laya.Vector3(parseFloat(strArr[0]), parseFloat(strArr[1]), parseFloat(strArr[2]));
        }
        static replaceAll(str, replace1, replace2) {
            str = str.replace(replace1, replace2);
            if (str.indexOf(replace1) != -1) {
                str = MathUtil.replaceAll(str, replace1, replace2);
            }
            return str;
        }
    }
    MathUtil.max = 10000;
    long.MathUtil = MathUtil;
})(long || (long = {}));

(function (long) {
    class ObjectUtils {
        constructor() { }
        static addChildTo(child, toParent) {
            let gp = child.localToGlobal();
            let lp = toParent.globalToLocal(gp.x, gp.y);
            child.removeFromParent();
            toParent.addChild(child);
            child.setXY(lp.x, lp.y);
        }
        static findChild(sp, name, ...args) {
            if (sp == null) {
                return null;
            }
            if (sp.name == name)
                return sp;
            else
                return this._findChild(sp._children, name, args);
        }
        static _findChild(spArr, name, args) {
            var arr = [];
            for (var i = 0; i < spArr.length; i++) {
                var child = spArr[i];
                if (!child.active)
                    continue;
                if (child.name == name || args.indexOf(child.name) != -1) {
                    return child;
                }
                else if (child.numChildren) {
                    arr = arr.concat(child._children);
                }
            }
            if (!arr.length)
                return null;
            return this._findChild(arr, name, args);
        }
        static getParentOf(cls, self = null) {
            let parent = self ? self.parent : null;
            let p = null;
            if (parent != null) {
                if (parent instanceof cls) {
                    return parent;
                }
                else {
                    return this.getParentOf(cls, parent);
                }
            }
            return null;
        }
        static globalIsIn(target, gp = null) {
            if (gp == null) {
                gp = new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
            }
            if (target == null || target.parent == null) {
                return false;
            }
            let targetGP = target.parent.localToGlobal(target.x, target.y);
            if (target.pivotAsAnchor) {
                let hw = target.width * 0.5;
                let hh = target.height * 0.5;
                if (gp.x >= targetGP.x - hw && gp.x <= (targetGP.x + hw) && gp.y >= targetGP.y - hh && gp.y <= (targetGP.y + hh)) {
                    return true;
                }
            }
            else {
                if (gp.x >= targetGP.x && gp.x <= (targetGP.x + target.width) && gp.y >= targetGP.y && gp.y <= (targetGP.y + target.height)) {
                    return true;
                }
            }
            return false;
        }
        static globalIsInRange(gp = null, range = null, target = null) {
            gp = gp || new Laya.Point(Laya.stage.mouseX, Laya.stage.mouseY);
            if (target && range == null) {
                let targetGP = target.localToGlobal(0, 0);
                range = range || this.range;
                if (target.pivotAsAnchor) {
                    let hw = target.width * 0.5;
                    let hh = target.height * 0.5;
                    range.x = targetGP.x - hw;
                    range.y = targetGP.y - hh;
                    range.width = target.width;
                    range.height = target.height;
                }
                else {
                    range.x = targetGP.x;
                    range.y = targetGP.y;
                    range.width = target.width;
                    range.height = target.height;
                }
            }
            return range && range.contains(gp.x, gp.y);
        }
        static getScreenTexture() {
            try {
                let img = Laya.stage.drawToTexture(Laya.stage.width, Laya.stage.height, 0, 0);
                return img;
            }
            catch (error) {
            }
            return null;
        }
    }
    ObjectUtils.range = new Laya.Rectangle();
    long.ObjectUtils = ObjectUtils;
})(long || (long = {}));

(function (long) {
    class SkeletonUtils {
        static getSkeleton() {
            let skeleton = this.pool.pop();
            if (skeleton == null) {
                skeleton = new long.SkeletonAnimation();
            }
            skeleton.visible = true;
            return skeleton;
        }
        static recover(skeleton) {
            if (skeleton && this.pool.indexOf(skeleton) == -1) {
                skeleton.clear();
                skeleton.removeFromParent();
                this.pool.push(skeleton);
            }
        }
    }
    SkeletonUtils.pool = [];
    long.SkeletonUtils = SkeletonUtils;
})(long || (long = {}));

(function (long) {
    class StringUtil {
        static replaceEndStr(value, len = -1, sign = "") {
            let result = "";
            if (value && value.length > len) {
                result = value.slice(0, len - 1) + sign;
            }
            else {
                result = value;
            }
            return result;
        }
        static formatToTime(time, formart = "00:00:00") {
            time = Number(time.toFixed(0));
            let second = time % 60;
            let minute = ((time - second) / 60) % 60;
            let hour = (time - 60 * minute - second) / 3600;
            let strSecond = second < 10 ? "0" + second.toString() : second.toString();
            let strMinute = minute < 10 ? "0" + minute.toString() : minute.toString();
            let strHour = hour < 10 ? "0" + hour.toString() : hour.toString();
            if (formart == "hms") {
                return strHour + "h " + strMinute + "m " + strSecond + "s";
            }
            else if (formart == "00:00") {
                return strMinute + ":" + strSecond;
            }
            else if (formart == "hms2") {
                let day = Math.floor(hour / 24);
                hour = Math.ceil(hour % 24);
                return (day > 0 ? day + "天" : "") + (hour > 0 ? hour + "小时" : "") + (minute > 0 ? minute + "分钟" : "") + (second > 0 ? second + "秒" : "");
            }
            else if (formart == "天00:00:00") {
                let day = Math.floor(hour / 24);
                hour = Math.ceil(hour % 24);
                let hourStr = hour < 10 ? "0" + hour.toString() : hour.toString();
                return day + "天" + hourStr + ":" + strMinute + ":" + strSecond;
            }
            return strHour + ":" + strMinute + ":" + strSecond;
        }
    }
    long.StringUtil = StringUtil;
})(long || (long = {}));

(function (long) {
    class TimeUtil {
        static toInt(value, wi = 1) {
            return value - value % wi;
        }
        static getLocalTime() {
            return new Date().getTime();
        }
        static formatToHMS(time, flex = ":") {
            time = TimeUtil.toInt(time);
            var h = (time - time % 3600) / 3600 % 24;
            var m = ((time % 3600) - (time % 60)) / 60;
            var s = time % 60;
            var mStr = "";
            if (h < 10)
                mStr += "0";
            mStr += h;
            mStr += flex;
            if (m < 10)
                mStr += "0";
            mStr += m;
            mStr += flex;
            if (s < 10)
                mStr += "0";
            mStr += s;
            return mStr;
        }
        static formatToMS(time, flex = ":") {
            var h = (time - time % 3600) / 3600 % 24;
            var m = ((time % 3600) - (time % 60)) / 60;
            var s = Math.floor(time % 60);
            var mStr = "";
            if (h > 0) {
                m += h * 60;
            }
            if (m < 10)
                mStr += "0";
            mStr += m;
            mStr += flex;
            if (s < 10)
                mStr += "0";
            mStr += s;
            return mStr;
        }
        static judgeInTime(timeStr, type = "all") {
            let arr = timeStr.split("~");
            let start = arr[0];
            let end = arr[1];
            arr = start.indexOf(":") != -1 ? start.split(":") : start.split(".");
            let start_year = parseInt(arr[0]);
            let start_month = parseInt(arr[1]);
            let start_day = parseInt(arr[2]);
            let start_hour = parseInt(arr[3]) || 0;
            let start_minute = parseInt(arr[4]) || 0;
            let start_second = parseInt(arr[5]) || 0;
            arr = end.indexOf(":") != -1 ? end.split(":") : end.split(".");
            let end_year = parseInt(arr[0]);
            let end_month = parseInt(arr[1]);
            let end_day = parseInt(arr[2]);
            let end_hour = parseInt(arr[3]) || 23;
            let end_minute = parseInt(arr[4]) || 59;
            let end_second = parseInt(arr[5]) || 59;
            let date = new Date();
            let time = date.getTime();
            let nowYear = date.getFullYear();
            let nowMonth = date.getMonth() + 1;
            let nowDay = date.getDay();
            let nowHours = date.getHours();
            let nowMinutes = date.getMinutes();
            let nowSeconds = date.getSeconds();
            date.setFullYear(start_year, start_month - 1, start_day);
            date.setHours(start_hour, start_minute, start_second);
            let startTime = date.getTime();
            date.setFullYear(end_year, end_month - 1, end_day);
            date.setHours(end_hour, end_minute, end_second);
            let endTime = date.getTime();
            if (type == "all") {
                return time >= startTime && time <= endTime;
            }
            else if (type == "hms") {
                let min = start_hour * 60 + start_minute * 60 + start_second;
                let max = end_hour * 60 + end_minute * 60 + end_second;
                let cur = nowHours * 60 + nowMinutes * 60 + nowSeconds;
                return cur >= min && cur <= max;
            }
            else if (type == "ymd") {
                return nowYear >= start_year && nowYear <= end_year && nowMonth >= start_month && nowMonth <= end_month && nowDay >= start_day && nowDay <= end_day;
            }
            return false;
        }
    }
    long.TimeUtil = TimeUtil;
})(long || (long = {}));

(function (long) {
    class GameLayer {
        static start() {
            Laya.stage.addChild(fgui.GRoot.inst.displayObject);
            GameLayer.fightLayer = new fgui.GComponent();
            GameLayer.mainDownLayer = new fgui.GComponent();
            GameLayer.mainLayer = new fgui.GComponent();
            GameLayer.windowLayer = new fgui.GComponent();
            GameLayer.alertLayer = new fgui.GComponent();
            GameLayer.topLayer = new fgui.GComponent();
            GameLayer.adLayer = new fgui.GComponent();
            GameLayer.fightLayer.name = "fightLayer";
            GameLayer.mainDownLayer.name = "mainDownLayer";
            GameLayer.mainLayer.name = "mainLayer";
            GameLayer.windowLayer.name = "windowLayer";
            GameLayer.alertLayer.name = "alertLayer";
            GameLayer.topLayer.name = "topLayer";
            fgui.GRoot.inst.addChild(GameLayer.fightLayer);
            fgui.GRoot.inst.addChild(GameLayer.mainDownLayer);
            fgui.GRoot.inst.addChild(GameLayer.mainLayer);
            fgui.GRoot.inst.addChild(GameLayer.windowLayer);
            fgui.GRoot.inst.addChild(GameLayer.alertLayer);
            fgui.GRoot.inst.addChild(GameLayer.adLayer);
            fgui.GRoot.inst.addChild(GameLayer.topLayer);
            GameLayer.topLayer.touchable = false;
            fgui.GRoot.inst.name = "GRoot";
            fgui.UIConfig.defaultFont = long.GlobalConfig.Font_Normal;
            fgui.UIConfig.packageFileExtension = "lm";
            Laya.stage.on(Laya.Event.RESIZE, GameLayer, GameLayer.onResize);
            this.onResize();
            if (long.GlobalConfig.stat) {
                fgui.GRoot.inst.on(Laya.Event.MOUSE_DOWN, this, this.onMouseDown);
            }
        }
        static onMouseDown(event) {
            this.checkNode(fgui.GRoot.inst, event.target, "");
        }
        static checkNode(parent, target, nodeName) {
            let length = parent.numChildren;
            for (let i = 0; i < length; i++) {
                const element = parent.getChildAt(i);
                if (element.displayObject == target) {
                    nodeName += element.name;
                    long.Logger.debug(this, "=====>" + nodeName);
                    return;
                }
                if (element instanceof fgui.GComponent || element instanceof fgui.GMovieClip) {
                    GameLayer.checkNode(element, target, nodeName + element.name + "|");
                }
            }
        }
        static onResize() {
            fgui.GRoot.inst.setSize(Laya.stage.width, Laya.stage.height);
            long.GlobalConfig.viewWidth = fgui.GRoot.inst.viewWidth;
            long.GlobalConfig.viewHeight = fgui.GRoot.inst.viewHeight;
            GameLayer.onUpdate(GameLayer.fightLayer);
            GameLayer.onUpdate(GameLayer.mainDownLayer);
            GameLayer.onUpdate(GameLayer.mainLayer);
            GameLayer.onUpdate(GameLayer.windowLayer);
            GameLayer.onUpdate(GameLayer.alertLayer);
            GameLayer.onUpdate(GameLayer.adLayer);
            GameLayer.onUpdate(GameLayer.topLayer);
        }
        static onUpdate(parent) {
            let length = parent.numChildren;
            var view = null;
            for (var i = 0; i < length; i++) {
                view = parent.getChildAt(i);
                if (view != null && view.isLoaded) {
                    view.onResize();
                }
            }
        }
    }
    long.GameLayer = GameLayer;
})(long || (long = {}));

(function (long) {
    class LayerType {
        static SetWindowLayout(view) {
            let vs = view.GetViewStruct();
            switch (vs.layout) {
                case LayerType.LAYOUT_LEFT_TOP:
                    {
                        view.x = 0;
                        view.y = 0;
                        view.setSize(Laya.stage.width, Laya.stage.height);
                        break;
                    }
                case LayerType.LAYOUT_CENTER_TOP:
                    {
                        view.x = (Laya.stage.width - view.viewWidth) * 0.5;
                        view.y = 0;
                        break;
                    }
                case LayerType.LAYOUT_RIGHT_TOP:
                    {
                        view.x = Laya.stage.width - view.viewWidth;
                        view.y = 0;
                        break;
                    }
                case LayerType.LAYOUT_LEFT_CENTER:
                    {
                        view.x = 0;
                        view.y = (Laya.stage.height - view.viewHeight) * 0.5;
                        break;
                    }
                case LayerType.LAYOUT_CENTER:
                    {
                        view.x = (Laya.stage.width - view.viewWidth) * 0.5;
                        view.y = (Laya.stage.height - view.viewHeight) * 0.5;
                        break;
                    }
                case LayerType.LAYOUT_RIGHT_CENTER:
                    {
                        view.x = Laya.stage.width - view.viewWidth;
                        view.y = (Laya.stage.height - view.viewHeight) * 0.5;
                        break;
                    }
                case LayerType.LAYOUT_LEFT_BOTTOM:
                    {
                        view.x = 0;
                        view.y = Laya.stage.height - view.viewHeight;
                        break;
                    }
                case LayerType.LAYOUT_CENTER_BOTTOM:
                    {
                        view.x = (Laya.stage.width - view.viewWidth) * 0.5;
                        view.y = Laya.stage.height - view.viewHeight;
                        break;
                    }
                case LayerType.LAYOUT_RIGHT_BOTTOM:
                    {
                        view.x = Laya.stage.width - view.viewWidth;
                        view.y = Laya.stage.height - view.viewHeight;
                        break;
                    }
            }
        }
        static SetWindowLayer(view) {
            let i = 0;
            let len = 0;
            let panel;
            let isExclusion = view.GetViewStruct().isExclusion;
            switch (view.GetViewStruct().layerType) {
                case LayerType.TYPE_SCENE:
                    {
                        if (isExclusion) {
                            len = long.GameLayer.fightLayer.numChildren;
                            for (i = len - 1; i >= 0; i--) {
                                panel = long.GameLayer.fightLayer.getChildAt(i);
                                if (panel && panel.GetViewStruct().isExclusion)
                                    long.UISystem.Inst.RemoveWindowView(panel);
                            }
                        }
                        long.GameLayer.fightLayer.addChild(view);
                        break;
                    }
                case LayerType.TYPE_MAIN_DOWN:
                    {
                        if (isExclusion) {
                            len = long.GameLayer.mainDownLayer.numChildren;
                            for (i = len - 1; i >= 0; i--) {
                                panel = long.GameLayer.mainDownLayer.getChildAt(i);
                                if (panel.GetViewStruct().isExclusion)
                                    long.UISystem.Inst.RemoveWindowView(panel);
                            }
                        }
                        long.GameLayer.mainDownLayer.addChild(view);
                        break;
                    }
                case LayerType.TYPE_MAIN:
                    {
                        if (isExclusion) {
                            len = long.GameLayer.mainLayer.numChildren;
                            for (i = len - 1; i >= 0; i--) {
                                panel = long.GameLayer.mainLayer.getChildAt(i);
                                if (panel.GetViewStruct().isExclusion)
                                    long.UISystem.Inst.RemoveWindowView(panel);
                            }
                        }
                        long.GameLayer.mainLayer.addChild(view);
                        break;
                    }
                case LayerType.TYPE_WINDOW:
                    {
                        if (isExclusion) {
                            len = long.GameLayer.windowLayer.numChildren;
                            for (i = len - 1; i >= 0; i--) {
                                panel = long.GameLayer.windowLayer.getChildAt(i);
                                if (panel.GetViewStruct().isExclusion)
                                    long.UISystem.Inst.RemoveWindowView(panel);
                            }
                        }
                        long.GameLayer.windowLayer.addChild(view);
                        break;
                    }
                case LayerType.TYPE_ALERT:
                    {
                        if (isExclusion) {
                            len = long.GameLayer.alertLayer.numChildren;
                            for (i = len - 1; i >= 0; i--) {
                                panel = long.GameLayer.alertLayer.getChildAt(i);
                                if (panel.GetViewStruct().isExclusion)
                                    long.UISystem.Inst.RemoveWindowView(panel);
                            }
                        }
                        long.GameLayer.alertLayer.addChild(view);
                        break;
                    }
                case LayerType.TYPE_TOP:
                    if (isExclusion) {
                        len = long.GameLayer.topLayer.numChildren;
                        for (i = len - 1; i >= 0; i--) {
                            panel = long.GameLayer.topLayer.getChildAt(i);
                            if (panel instanceof long.UIBaseWindow && panel.GetViewStruct().isExclusion) {
                                long.UISystem.Inst.RemoveWindowView(panel);
                            }
                        }
                    }
                    long.GameLayer.topLayer.addChild(view);
                    break;
                case LayerType.TYPE_AD:
                    if (isExclusion) {
                        len = long.GameLayer.adLayer.numChildren;
                        for (i = len - 1; i >= 0; i--) {
                            panel = long.GameLayer.adLayer.getChildAt(i);
                            if (panel.GetViewStruct().isExclusion)
                                long.UISystem.Inst.RemoveWindowView(panel);
                        }
                    }
                    long.GameLayer.adLayer.addChild(view);
                    break;
            }
        }
    }
    LayerType.TYPE_SCENE = 1;
    LayerType.TYPE_MAIN_DOWN = 2;
    LayerType.TYPE_MAIN = 3;
    LayerType.TYPE_WINDOW = 4;
    LayerType.TYPE_ALERT = 5;
    LayerType.TYPE_TOP = 6;
    LayerType.TYPE_AD = 7;
    LayerType.LAYOUT_LEFT_TOP = 1;
    LayerType.LAYOUT_CENTER_TOP = 2;
    LayerType.LAYOUT_RIGHT_TOP = 3;
    LayerType.LAYOUT_LEFT_CENTER = 4;
    LayerType.LAYOUT_CENTER = 5;
    LayerType.LAYOUT_RIGHT_CENTER = 6;
    LayerType.LAYOUT_LEFT_BOTTOM = 7;
    LayerType.LAYOUT_CENTER_BOTTOM = 8;
    LayerType.LAYOUT_RIGHT_BOTTOM = 9;
    long.LayerType = LayerType;
})(long || (long = {}));

(function (long) {
    class PanelRegister {
        static registerClass(pkgName, resName, cls, pkg = long.UrlUtils.UI) {
            let pkgUrl = long.UrlUtils.getFairyPkg(pkgName, pkg);
            if (pkgName && !fgui.UIPackage.getByName(pkgName)) {
                fgui.UIPackage.addPackage(pkgUrl);
            }
            let url = fgui.UIPackage.getItemURL(pkgName, resName);
            fgui.UIObjectFactory.setPackageItemExtension(url, cls);
        }
        static createGObject(pkgName, resName) {
            let obj = null;
            let _id = pkgName + "_" + resName;
            obj = Laya.Pool.getItem(_id);
            if (obj) {
                obj.displayObject.active = true;
                return obj;
            }
            let count = this.poolCount.hasOwnProperty(_id) ? this.poolCount[_id] : 0;
            let url = this.getUrl(pkgName, resName);
            obj = fgui.UIPackage.createObjectFromURL(url);
            obj._id = _id + "_" + count;
            count++;
            this.poolCount[_id] = count;
            obj.displayObject.active = true;
            return obj;
        }
        static recover(obj) {
            if (obj != null) {
                let _id = obj.id.substr(0, obj.id.lastIndexOf("_"));
                obj.displayObject.active = false;
                obj.removeFromParent();
                fgui.GTween.kill(obj);
                Laya.Pool.recover(_id, obj);
            }
        }
        static getUrl(pkgName, resName) {
            let url = fgui.UIPackage.getItemURL(pkgName, resName);
            return url;
        }
        static loadUrl(url, handler = null) {
            let item = fgui.UIPackage.getItemByURL(url);
            let pkg = item && item.owner;
            let sprite = pkg && pkg["_sprites"][item.id];
            let atlasItem = sprite && sprite.atlas;
            if (atlasItem && atlasItem.texture == null) {
                let urls = [{ url: atlasItem.file, type: Laya.Loader.IMAGE }];
                fgui.AssetProxy.inst.load(urls, Laya.Handler.create(this, function (url, atlasItem, handler) {
                    atlasItem.load();
                    handler && handler.runWith(url);
                }, [url, atlasItem, handler]));
            }
            else {
                handler && handler.runWith(url);
            }
        }
        static getTextureBy(pkgName, resName) {
            let url = this.getUrl(pkgName, resName);
            return this.getTexture(url);
        }
        static getTexture(url) {
            let item = fgui.UIPackage.getItemByURL(url);
            if (item) {
                item.load();
            }
            return item ? item.texture : null;
        }
        static getItemAsset(pkgName, resName) {
            let url = fgui.UIPackage.getItemURL(pkgName, resName);
            return fgui.UIPackage.getItemAssetByURL(url);
        }
    }
    PanelRegister.poolCount = {};
    long.PanelRegister = PanelRegister;
})(long || (long = {}));

(function (long) {
    class UISystem {
        constructor() {
            this.m_view = new long.Dictionary();
            this.m_gc_view = new long.Dictionary();
            Laya.timer.loop(long.Resource.CACHE_UI_TIME, UISystem, UISystem.CheckCache);
        }
        static get Inst() {
            if (this._Inst == null)
                this._Inst = new UISystem();
            return this._Inst;
        }
        static CheckCache() {
            let viewDic = UISystem.Inst.GetGcViewCache();
            let view = null;
            for (let key in viewDic) {
                view = viewDic[key];
                if (view.IsCanGc()) {
                    view.Destroy();
                    delete viewDic[key];
                }
            }
        }
        GetGcViewCache() {
            return this.m_gc_view;
        }
        HasView(cls) {
            return this.m_view[cls] != null;
        }
        GetViewByGc(cls) {
            let view = this.m_gc_view[cls];
            if (view != null) {
                delete this.m_gc_view[cls];
                return view;
            }
            return null;
        }
        CreateWindowView(cls, param = null) {
            if (cls == null) {
                return;
            }
            let view = this.m_view[cls];
            if (view != null) {
                return;
            }
            if (view == null) {
                view = this.GetViewByGc(cls);
                if (view == null) {
                    view = new cls();
                    view.cls = cls;
                }
                this.m_view[cls] = view;
            }
            view.Init(param);
            view.LoadAtlas();
            return view;
        }
        RemoveWindowClass(cls) {
            this.RemoveWindowView(this.m_view[cls]);
        }
        RemoveWindowView(view) {
            if (view == null || view.parent == null) {
                return;
            }
            if (view.cls in this.m_view) {
                delete this.m_view[view.cls];
                this.m_gc_view[view.cls] = view;
            }
            else {
                return;
            }
            view.hide();
            long.GameDispatcher.Inst.event(long.UIGameEvent.ON_HIDE_VIEW, view);
        }
        GetWindowView(cls) {
            return this.m_view[cls];
        }
        GetWindowByName(panelName) {
            let window;
            for (const key in this.m_view) {
                window = this.m_view[key];
                if (window && window.panelName == panelName) {
                    return window;
                }
            }
            return null;
        }
        GetOpenViews() {
            let views = [];
            let view;
            for (let key in this.m_view) {
                view = this.m_view[key];
                if (view) {
                    views.push(view);
                }
            }
            return views;
        }
        removeAllFromMain(exceptLayers = null) {
            let views = this.GetOpenViews();
            let view;
            for (let i = views.length - 1; i >= 0; i--) {
                view = views[i];
                if (view instanceof long.UIBaseWindow) {
                    if (view.GetViewStruct().layerType == long.LayerType.TYPE_SCENE
                        || view.GetViewStruct().layerType == long.LayerType.TYPE_MAIN_DOWN
                        || view.GetViewStruct().layerType == long.LayerType.TYPE_MAIN) {
                        continue;
                    }
                    if (exceptLayers == null || exceptLayers.indexOf(view.GetViewStruct().layerType) == -1) {
                        this.RemoveWindowView(view);
                    }
                }
            }
        }
        removeAllView() {
            let views = this.GetOpenViews();
            let view;
            for (let i = views.length - 1; i >= 0; i--) {
                view = views[i];
                if (view instanceof long.UIBaseWindow) {
                    this.RemoveWindowView(view);
                }
            }
        }
        hasAnyViewOnMain(excepts = null) {
            let views = this.GetOpenViews();
            let view;
            for (let i = views.length - 1; i >= 0; i--) {
                view = views[i];
                if (view instanceof long.UIBaseWindow) {
                    if (view.GetViewStruct().layerType == long.LayerType.TYPE_SCENE
                        || view.GetViewStruct().layerType == long.LayerType.TYPE_MAIN_DOWN
                        || view.GetViewStruct().layerType == long.LayerType.TYPE_MAIN
                        || view.GetViewStruct().layerType == long.LayerType.TYPE_AD) {
                        continue;
                    }
                    if (excepts && excepts.indexOf(view) != -1) {
                        continue;
                    }
                    if (excepts && excepts.indexOf(view.cls) != -1) {
                        continue;
                    }
                    return true;
                }
            }
            return false;
        }
        hasAnyShowBanner() {
            let key;
            for (key in this.m_view) {
                let view = this.m_view[key];
                if (view && view.isShowBanner) {
                    return true;
                }
            }
            return false;
        }
        GetPanelByName(panelName) {
            let views = this.GetOpenViews();
            let view;
            for (let i = views.length - 1; i >= 0; i--) {
                view = views[i];
                if (view instanceof long.UIBaseWindow && view.panelName == panelName) {
                    return view;
                }
            }
            return null;
        }
        getTopWindow(excetps = null) {
            let key;
            let prev = -1;
            let view = null;
            for (key in this.m_view) {
                let v = this.m_view[key];
                if (v instanceof long.UIBaseWindow && v.parent) {
                    if (v.GetViewStruct().isAdLayer) {
                        continue;
                    }
                    if (excetps && excetps.indexOf(v.cls) != -1) {
                        continue;
                    }
                    let index = fgui.GRoot.inst.getChildIndex(v.parent);
                    if (index > prev) {
                        view = v;
                        prev = index;
                    }
                }
            }
            return view;
        }
        static showLoadingLeaf() {
        }
        static hideLoadingLeaf() {
        }
    }
    long.UISystem = UISystem;
})(long || (long = {}));

(function (long) {
    class TComponent extends fgui.GComponent {
        constructor() {
            super();
            this.discriminator = "I-AM-IComponent";
            this.canCallShow = true;
            this.m_eventPool = null;
            this.m_param = null;
            this.$gid = 0;
            this.m_eventPool = new long.EventPool();
            this.$gid = Laya.Utils.getGID();
        }
        onConstruct() {
            super.onConstruct();
            this.InitFairyGui();
            this.InitUI();
        }
        InitFairyGui() {
        }
        InitUI() {
            this.c1 = this.getController("c1");
        }
        show(param) {
            long.CheckComponent(this, "show");
        }
        get Data() {
            return this.m_param;
        }
        AddListener() {
            long.CheckComponent(this, "AddListener");
        }
        RemoveListener() {
            long.CheckComponent(this, "RemoveListener");
        }
        AddGameListener(type, listener, thisObject, target) {
            this.m_eventPool.AddListenerInPool(type, listener, thisObject, target);
        }
        RemoveGameListener(type, listener, thisObject, target) {
            this.m_eventPool.RemoveListenerFromPool(type, listener, thisObject, target);
        }
        addComponent(script) {
            let sc = this.displayObject && this.displayObject.addComponent(script);
            sc["$owner"] = this;
            return sc;
        }
        hide() {
            let components = this.displayObject.getComponents(Laya.Component);
            let comp;
            if (components) {
                for (let i = components.length - 1; i >= 0; i--) {
                    comp = components[i];
                    comp && comp.destroy();
                }
            }
            if (this.m_eventPool != null) {
                this.m_eventPool.Reset();
            }
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            fgui.GTween.kill(this);
            long.CheckComponent(this, "hide");
        }
        Destroy() {
            if (this.m_eventPool) {
                this.m_eventPool.Reset();
                this.m_eventPool = null;
            }
            this.m_param = null;
            long.CheckComponent(this, "Destroy");
        }
    }
    long.TComponent = TComponent;
    class View extends TComponent {
        constructor() {
            super();
            this.cls = null;
            this.gcTime = 0;
        }
        Init(param) {
            this.m_param = param;
            this.gcTime = Number.MAX_VALUE;
        }
        onResize() {
        }
        get Data() {
            return this.m_param;
        }
        hide() {
            super.hide();
            this.gcTime = Laya.timer.currTimer + long.Resource.CACHE_UI_TIME;
        }
        IsCanGc() {
            return Laya.timer.currTimer >= this.gcTime;
        }
        Destroy() {
            super.Destroy();
            this.cls = null;
        }
    }
    long.View = View;
    class UIBaseWindow extends View {
        constructor(pkgName = "", resName = "", ui_res = long.UrlUtils.UI) {
            super();
            this._pkgName = "";
            this._resName = "";
            this._view = null;
            this.m_mask = null;
            this.m_imgBg = null;
            this.btn_close = null;
            this.viewStruct = null;
            this._btns = null;
            this._isLoaded = false;
            this._iRes = null;
            this.isReset = false;
            this.ui_res = null;
            this._isShowbanner = false;
            this._bannerData = null;
            this.isLockBanner = false;
            this.name = pkgName;
            this._pkgName = pkgName;
            this._resName = resName;
            this.ui_res = ui_res;
            this._btns = [];
            this.SetViewStruct();
            Object.defineProperty(this, "viewWidth", {
                get: function () {
                    return this._view && this._view.viewWidth;
                }
            });
            Object.defineProperty(this, "viewHeight", {
                get: function () {
                    return this._view && this._view.viewHeight;
                }
            });
        }
        LoadAtlas() {
            this.visible = false;
            this.isReset = false;
            if (this.isLoaded) {
                this.onDelay();
            }
            else {
                if (!fgui.UIPackage.getByName(this._pkgName)) {
                    this.showLoadingLeaf();
                }
                long.LoadQueue.Inst.loadUI(this._pkgName, Laya.Handler.create(this, this.onLoaded), true, this.ui_res);
            }
        }
        showLoadingLeaf() {
            if (!this.viewStruct.isShowLoadCircle) {
                return;
            }
        }
        hideLoadingLeaf() {
            if (!this.viewStruct.isShowLoadCircle)
                return;
        }
        onLoaded(iRes) {
            this.hideLoadingLeaf();
            if (iRes == null || this.isReset)
                return;
            this._iRes = iRes;
            let isSuccess = iRes.GetRes();
            if (!isSuccess)
                return;
            this.loadComplete();
        }
        loadComplete() {
            let self = this;
            self._isLoaded = true;
            self.registerClasses();
            self._view = fgui.UIPackage.createObject(self._pkgName, self._resName);
            if (self._view instanceof fgui.GComponent) {
                self.setSize(self._view.viewWidth, self._view.viewHeight);
                self.addChild(self._view);
                self._view.name = self._resName;
                long.FairyUtils.setVar(self._view, self, self._btns);
                self.InitUI();
                self.onDelay();
                long.GameDispatcher.Inst.event(long.UIGameEvent.ON_SHOW_VIEW, this);
            }
            else {
                throw new Error(`暂无界面 ${self._pkgName}_${self._resName}`);
            }
        }
        onDelay() {
            let self = this;
            long.LayerType.SetWindowLayer(self);
            self.visible = true;
            self.viewStruct.isShowMaskBg ? self.showMask() : self.hideMask();
            self.viewStruct.isShowImgBg ? self.showImgBg() : self.hideImgBg();
            self.onResize();
            self.AddListener();
            self.show(self.m_param);
            if (self._view instanceof fgui.GComponent && self.viewStruct.isEffect) {
                long.EffectUtil.openWindowEffect(self._view, this.onEffectEnd, this);
            }
            this.OpenWindow();
        }
        registerClasses() {
        }
        InitUI() {
            this.c1 = this._view instanceof fgui.GComponent && this._view.getController("c1");
            if (Laya.Browser.onMiniGame) {
                if (long.Global.isWxmj) {
                    if (this.c1 && this.c1.hasPage("wxmj")) {
                        this.c1.selectedPage = "wxmj";
                    }
                    else {
                        if (this.c1 && this.c1.hasPage("wx"))
                            this.c1.selectedPage = "wx";
                    }
                }
                else {
                    if (this.c1 && this.c1.hasPage("wx"))
                        this.c1.selectedPage = "wx";
                }
            }
            else if (Laya.Browser.onTTMiniGame) {
                if (this.c1 && this.c1.hasPage("tt"))
                    this.c1.selectedPage = "tt";
            }
            else if (long.Global.is233) {
                if (this.c1 && this.c1.hasPage("233"))
                    this.c1.selectedPage = "233";
            }
            else if (Laya.Browser.onQGMiniGame) {
                if (this.c1 && this.c1.hasPage("oppo"))
                    this.c1.selectedPage = "oppo";
            }
            else if (Laya.Browser.onVVMiniGame) {
                if (this.c1 && this.c1.hasPage("vivo"))
                    this.c1.selectedPage = "vivo";
            }
        }
        AddListener() {
            super.AddListener();
            for (let btn of this._btns) {
                btn.onClick(this, this.onBtnClick, [btn]);
            }
        }
        RemoveListener() {
            super.RemoveListener();
            for (let btn of this._btns) {
                btn.offClick(this, this.onBtnClick);
            }
        }
        show(param) {
            this.m_param = param;
            long.CheckComponent(this._view, "show");
        }
        onEffectEnd() {
        }
        OpenWindow() {
            if (this.viewStruct.isCtrlTimerScale) {
            }
        }
        CloseWindow() {
            if (this.viewStruct.isCtrlTimerScale) {
            }
        }
        get isLoaded() {
            return this._isLoaded;
        }
        onBtnClick(btn) {
            if (btn.sound != "none") {
                if (!btn.sound) {
                    long.SoundMgr.Inst.play(long.SoundMgr.click);
                }
                else if (btn.sound.indexOf("ui://") != 0) {
                    long.SoundMgr.Inst.play(btn.sound);
                }
            }
            if (btn == this.btn_close) {
                this.onBtnCloseClick();
            }
        }
        onBtnCloseClick() {
            this.close();
        }
        close() {
            long.UISystem.Inst.RemoveWindowClass(this.cls);
        }
        SetViewStruct() {
            if (this.viewStruct == null) {
                this.viewStruct = new long.ViewStruct();
            }
        }
        get panelName() {
            return this._resName;
        }
        GetViewStruct() {
            return this.viewStruct;
        }
        onResize() {
            long.LayerType.SetWindowLayout(this);
            if (this.m_mask != null) {
                this.m_mask.viewWidth = Laya.stage.width;
                this.m_mask.viewHeight = Laya.stage.height;
                let img = this.m_mask.getChild("img").asImage;
                img.width = Laya.stage.width;
                img.height = Laya.stage.height;
                this.m_mask.x = -this.x;
                this.m_mask.y = -this.y;
            }
            if (this.m_imgBg != null) {
                this.m_imgBg.width = Laya.stage.width;
                this.m_imgBg.height = Laya.stage.height;
                this.m_imgBg.x = -this.x;
                this.m_imgBg.y = -this.y;
            }
            this.resetScrollRect();
        }
        resetScrollRect() {
            if (Laya.stage.scrollRect) {
                if (this.viewStruct.layout == long.LayerType.LAYOUT_CENTER) {
                    this.setXY(Laya.stage.scrollRect.x + (Laya.stage.width - this.viewWidth) * 0.5, Laya.stage.scrollRect.y + (Laya.stage.height - this.viewHeight) * 0.5);
                }
                else {
                    this.setXY(Laya.stage.scrollRect.x, Laya.stage.scrollRect.y);
                }
            }
            else {
                this.setXY(0, 0);
            }
        }
        showMask() {
            if (this.m_mask == null) {
                this.m_mask = fgui.UIPackage.createObject("common", this.viewStruct.maskName).asCom;
                this.addChildAt(this.m_mask, 0);
                this.m_mask.touchable = true;
                this.m_mask.alpha = this.viewStruct.mashBgAlpha;
            }
        }
        hideMask() {
            if (this.m_mask != null) {
                if (this.m_mask.parent != null)
                    this.m_mask.parent.removeChild(this.m_mask);
                this.m_mask = null;
            }
        }
        showImgBg() {
            if (this.m_imgBg == null) {
                this.m_imgBg = fgui.UIPackage.createObject("common", "bg").asImage;
                this.addChildAt(this.m_imgBg, 0);
            }
        }
        hideImgBg() {
            if (this.m_imgBg != null) {
                if (this.m_imgBg.parent != null)
                    this.m_imgBg.parent.removeChild(this.m_mask);
                this.m_imgBg = null;
            }
        }
        set isThrough(value) {
            if (this._view instanceof fgui.GComponent) {
                this._view.opaque = !value;
            }
        }
        get isThrough() {
            return this._view instanceof fgui.GComponent && !this._view.opaque;
        }
        setSize(wv, hv, ignorePivot) {
            super.setSize(wv, hv, ignorePivot);
            if (this._view instanceof fgui.GComponent) {
                this._view.setSize(wv, hv, ignorePivot);
            }
        }
        getController(name) {
            return this._view instanceof fgui.GComponent && this._view.getController(name);
        }
        getTransition(name) {
            return this._view instanceof fgui.GComponent && this._view.getTransition(name);
        }
        hide() {
            this.removeFromParent();
            this.RemoveListener();
            this.isReset = true;
            this.CloseWindow();
            if (this.viewStruct.isEffect) {
                fgui.GTween.kill(this._view);
            }
            Laya.timer.clearAll(this);
            Laya.updateTimer.clearAll(this);
            Laya.Tween.clearAll(this);
            fgui.GTween.kill(this);
            this.m_param = null;
            this.hideBanner();
            this.hideInsertAd();
            super.hide();
        }
        get ui() {
            return this._view;
        }
        Destroy() {
            super.Destroy();
            this.hideMask();
            this.hideImgBg();
            if (this._iRes != null) {
                this._iRes.Dispose();
                this._iRes = null;
            }
            if (this._view instanceof fgui.GComponent) {
                this._view.dispose();
                this._view = null;
            }
            this._isLoaded = false;
            this._resName = "";
        }
        showBanner(data = null) {
            this._bannerData = data;
            this._isShowbanner = true;
            long.GameDispatcher.Inst.event(long.UIGameEvent.SHOW_BANNER, this._bannerData);
        }
        get isShowBanner() {
            if (this.isLockBanner) {
                return false;
            }
            return this._isShowbanner;
        }
        reshowBanner() {
            this.showBanner(this._bannerData);
        }
        hideBanner() {
            this.isLockBanner = false;
            this._isShowbanner = false;
            this._bannerData = null;
            long.GameDispatcher.Inst.event(long.UIGameEvent.HIDE_BANNER);
        }
        showInsertAd(data = null) {
            long.GameDispatcher.Inst.event(long.UIGameEvent.SHOW_INSERT, data);
        }
        hideInsertAd() {
            long.GameDispatcher.Inst.event(long.UIGameEvent.HIDE_INSERT);
        }
    }
    long.UIBaseWindow = UIBaseWindow;
})(long || (long = {}));

(function (long) {
    class ViewStruct {
        constructor() {
            this.layerType = long.LayerType.TYPE_WINDOW;
            this.layout = long.LayerType.LAYOUT_CENTER;
            this.isShowMaskBg = false;
            this.mashBgAlpha = 0.7;
            this.isShowImgBg = false;
            this.maskName = "sp_mask";
            this.isExclusion = true;
            this.isEffect = false;
            this.isCtrlTimerScale = false;
            this.isShowLoadCircle = false;
        }
        get isAdLayer() {
            return this.layerType == long.LayerType.TYPE_AD;
        }
    }
    long.ViewStruct = ViewStruct;
})(long || (long = {}));

(function (long) {
    class BaseProgressBar extends fgui.GProgressBar {
        constructor() {
            super();
            this.discriminator = "I-AM-IComponent";
            this.canCallShow = true;
            this._data = null;
        }
        Init(param) {
        }
        onConstruct() {
            super.onConstruct();
            long.FairyUtils.setVar(this, this);
            this.InitUI();
        }
        InitUI() { }
        AddListener() { }
        RemoveListener() { }
        show(param) {
            this._data = param;
        }
        get Data() {
            return this._data;
        }
        hide() {
            this._data = null;
        }
        Destroy() {
        }
    }
    long.BaseProgressBar = BaseProgressBar;
})(long || (long = {}));

(function (long) {
    class ChessGrid {
        constructor(row = 10, list = 10, sw = 80, sh = 80) {
            this.singleWidth = 80;
            this.singleHeight = 80;
            this.x = 0;
            this.y = 0;
            this.row = 10;
            this.list = 10;
            this.gapW = 0;
            this.gapH = 0;
            this._range = new Laya.Rectangle();
            this.graphics = null;
            this.setGrid(row, list, sw, sh);
        }
        setPos(x, y) {
            this.x = x;
            this.y = y;
        }
        setGrid(row, list, sw = 80, sh = 80) {
            this.row = row;
            this.list = list;
            this.singleWidth = sw;
            this.singleHeight = sh;
        }
        get gridWidth() {
            return this.list * this.singleWidth + (this.list - 1) * this.gapW;
        }
        get gridHeight() {
            return this.row * this.singleHeight + (this.row - 1) * this.gapH;
        }
        getXYAt(row, list) {
            let x = list * (this.singleWidth + this.gapW);
            let y = row * (this.singleHeight + this.gapH);
            let p = new Laya.Point(x, y);
            return this.contains(p) ? p : null;
        }
        getGridByPos(x, y) {
            if (!this.range.contains(x, y)) {
                return null;
            }
            let row = Math.floor((y - this.y) / (this.singleHeight + this.gapH));
            let list = Math.floor((x - this.x) / (this.singleWidth + this.gapW));
            return { "row": row, "list": list };
        }
        containsRL(row, list) {
            let p = this.getXYAt(row, list);
            return p != null;
        }
        contains(lg) {
            return lg && this.range.contains(lg.x, lg.y);
        }
        get range() {
            this._range.setTo(this.x, this.y, this.gridWidth, this.gridHeight);
            return this._range;
        }
        setGraphics(graphics) {
            this.graphics = graphics;
        }
        drawGridWith(sx, sy, color = "#00ff00") {
            let graphics = this.graphics;
            if (!graphics)
                return;
            graphics.clear();
            graphics.save();
            let gridWidth = this.gridWidth * sx;
            let gridHeight = this.gridHeight * sy;
            let sw = (this.singleWidth + this.gapW) * sx;
            let sh = (this.singleHeight + this.gapH) * sy;
            let fillGreenColor = long.ColorUtil.toRGBA(color, 1);
            graphics.translate(this.x, this.y);
            for (let i = 0; i <= gridWidth; i += sw) {
                graphics.drawLine(i, 0, i, gridHeight, fillGreenColor, 1);
            }
            for (let i = 0; i <= gridHeight; i += sh) {
                graphics.drawLine(0, i, gridWidth, i, fillGreenColor, 1);
            }
            graphics.restore();
        }
        drawGrid(graphics = null, color = "#00ff00") {
            graphics = graphics || this.graphics;
            if (!graphics)
                return;
            graphics.clear();
            graphics.save();
            let fillGreenColor = long.ColorUtil.toRGBA(color, 1);
            graphics.translate(this.x, this.y);
            for (let i = 0; i <= this.gridWidth; i += (this.singleWidth + this.gapW)) {
                graphics.drawLine(i, 0, i, this.gridHeight, fillGreenColor, 1);
            }
            for (let i = 0; i <= this.gridHeight; i += (this.singleHeight + this.gapH)) {
                graphics.drawLine(0, i, this.gridWidth, i, fillGreenColor, 1);
            }
            graphics.restore();
        }
        drawCircle(graphics = null, row, list, fillColor = "#ffcc00", fillAlpha = 1, lineColor = "#ff00ff", lineAlpha = 1) {
            graphics = graphics || this.graphics;
            if (!graphics)
                return;
            fillColor = long.ColorUtil.toRGBA(fillColor, fillAlpha);
            lineColor = long.ColorUtil.toRGBA(lineColor, lineAlpha);
            let x = list * (this.singleWidth + this.gapW);
            let y = row * (this.singleHeight + this.gapH);
            let hw = this.singleWidth >> 1;
            let hh = this.singleHeight >> 1;
            let r = Math.ceil(Math.sqrt(hw * hw + hh * hh));
            let radius = Math.ceil(r / Math.sqrt(2));
            graphics.drawCircle(x + hw, y + hh, radius, fillColor, lineColor, 1);
        }
        drawCircleAt(graphics = null, x, y, fillColor = "#ffcc00", fillAlpha = 1, lineColor = "#ff00ff", lineAlpha = 1) {
            graphics = graphics || this.graphics;
            if (!graphics)
                return;
            fillColor = long.ColorUtil.toRGBA(fillColor, fillAlpha);
            lineColor = long.ColorUtil.toRGBA(lineColor, lineAlpha);
            let hw = this.singleWidth >> 1;
            let hh = this.singleHeight >> 1;
            let r = Math.ceil(Math.sqrt(hw * hw + hh * hh));
            let radius = Math.ceil(r / Math.sqrt(2));
            graphics.drawCircle(x + hw, y + hh, radius, fillColor, lineColor, 1);
        }
        clear() {
            if (this.graphics) {
                this.graphics.clear();
            }
        }
    }
    long.ChessGrid = ChessGrid;
})(long || (long = {}));

(function (long) {
    class TMoveClip {
        constructor() {
            this.fps = 60;
            this.interval = 0;
            this.swing = false;
            this.repeatDelay = 0;
            this.timeScale = 1;
            this._playing = false;
            this._frameCount = 0;
            this._frame = 0;
            this._start = 0;
            this._end = 0;
            this._times = 0;
            this._endAt = 0;
            this._status = 0;
            this._endHandler = null;
            this._frameElapsed = 0;
            this._reversed = false;
            this._repeatedCount = 0;
            this._frames = null;
            this.setPlaySettings();
        }
        static createFrames(picName, pkgName = "IconProp", frameCount = 1) {
            let texture;
            let frame;
            let frames = [];
            for (let i = 0; i < frameCount; i++) {
                let index = i < 10 ? "0" + i : i;
                let frameName = picName + "_" + index;
                texture = long.PanelRegister.getTextureBy(pkgName, frameName);
                if (i == 0 && !texture) {
                    texture = long.PanelRegister.getTextureBy(pkgName, picName);
                }
                if (!texture) {
                    continue;
                }
                frame = Laya.Pool.getItem("fgui.Frame") || new fgui.Frame();
                frame.texture = texture;
                frames.push(frame);
            }
            return frames;
        }
        get frames() {
            return this._frames;
        }
        set frames(value) {
            this._frames = value;
            if (this._frames != null) {
                this._frameCount = this._frames.length;
                if (this._end == -1 || this._end > this._frameCount - 1)
                    this._end = this._frameCount - 1;
                if (this._endAt == -1 || this._endAt > this._frameCount - 1)
                    this._endAt = this._frameCount - 1;
                if (this._frame < 0 || this._frame > this._frameCount - 1)
                    this._frame = this._frameCount - 1;
                this._frameElapsed = 0;
                this._repeatedCount = 0;
                this._reversed = false;
            }
            else
                this._frameCount = 0;
            this.drawFrame();
            this.checkTimer();
            let rate = (60 / this.fps);
            this.interval = this._frames ? Math.ceil(1000 * rate / this._frames.length) : Math.ceil(1000 * rate / 30);
        }
        get frameCount() {
            return this._frameCount;
        }
        get frame() {
            return this._frame;
        }
        set frame(value) {
            if (this._frame != value) {
                if (this._frames != null && value >= this._frameCount)
                    value = this._frameCount - 1;
                this._frame = value;
                this._frameElapsed = 0;
                this.drawFrame();
            }
        }
        get playing() {
            return this._playing;
        }
        set playing(value) {
            if (this._playing != value) {
                this._playing = value;
                this.checkTimer();
            }
        }
        rewind() {
            this._frame = 0;
            this._frameElapsed = 0;
            this._reversed = false;
            this._repeatedCount = 0;
            this.drawFrame();
        }
        syncStatus(anotherMc) {
            this._frame = anotherMc._frame;
            this._frameElapsed = anotherMc._frameElapsed;
            this._reversed = anotherMc._reversed;
            this._repeatedCount = anotherMc._repeatedCount;
            this.drawFrame();
        }
        advance(timeInMiniseconds) {
            var beginFrame = this._frame;
            var beginReversed = this._reversed;
            var backupTime = timeInMiniseconds;
            while (true) {
                var tt = this.interval + this._frames[this._frame].addDelay;
                if (this._frame == 0 && this._repeatedCount > 0)
                    tt += this.repeatDelay;
                if (timeInMiniseconds < tt) {
                    this._frameElapsed = 0;
                    break;
                }
                timeInMiniseconds -= tt;
                if (this.swing) {
                    if (this._reversed) {
                        this._frame--;
                        if (this._frame <= 0) {
                            this._frame = 0;
                            this._repeatedCount++;
                            this._reversed = !this._reversed;
                        }
                    }
                    else {
                        this._frame++;
                        if (this._frame > this._frameCount - 1) {
                            this._frame = Math.max(0, this._frameCount - 2);
                            this._repeatedCount++;
                            this._reversed = !this._reversed;
                        }
                    }
                }
                else {
                    this._frame++;
                    if (this._frame > this._frameCount - 1) {
                        this._frame = 0;
                        this._repeatedCount++;
                    }
                }
                if (this._frame == beginFrame && this._reversed == beginReversed) {
                    var roundTime = backupTime - timeInMiniseconds;
                    timeInMiniseconds -= Math.floor(timeInMiniseconds / roundTime) * roundTime;
                }
            }
            this.drawFrame();
        }
        setPlaySettings(start = 0, end = -1, times = 0, endAt = -1, endHandler = null) {
            this._start = start;
            this._end = end;
            if (this._end == -1 || this._end > this._frameCount - 1)
                this._end = this._frameCount - 1;
            this._times = times;
            this._endAt = endAt;
            if (this._endAt == -1)
                this._endAt = this._end;
            this._status = 0;
            this._endHandler = endHandler;
            this.frame = start;
        }
        update() {
            if (!this._playing || this._frameCount == 0 || this._status == 3)
                return;
            var dt = Laya.timer.delta;
            if (dt > 100)
                dt = 100;
            if (this.timeScale != 1)
                dt *= this.timeScale;
            this._frameElapsed += dt;
            var tt = this.interval + this._frames[this._frame].addDelay;
            if (this._frame == 0 && this._repeatedCount > 0)
                tt += this.repeatDelay;
            if (this._frameElapsed < tt)
                return;
            this._frameElapsed -= tt;
            if (this._frameElapsed > this.interval)
                this._frameElapsed = this.interval;
            if (this.swing) {
                if (this._reversed) {
                    this._frame--;
                    if (this._frame <= 0) {
                        this._frame = 0;
                        this._repeatedCount++;
                        this._reversed = !this._reversed;
                    }
                }
                else {
                    this._frame++;
                    if (this._frame > this._frameCount - 1) {
                        this._frame = Math.max(0, this._frameCount - 2);
                        this._repeatedCount++;
                        this._reversed = !this._reversed;
                    }
                }
            }
            else {
                this._frame++;
                if (this._frame > this._frameCount - 1) {
                    this._frame = 0;
                    this._repeatedCount++;
                }
            }
            if (this._status == 1) {
                this._frame = this._start;
                this._frameElapsed = 0;
                this._status = 0;
            }
            else if (this._status == 2) {
                this._frame = this._endAt;
                this._frameElapsed = 0;
                this._status = 3;
                if (this._endHandler != null) {
                    var handler = this._endHandler;
                    this._endHandler = null;
                    handler.run();
                }
            }
            else {
                if (this._frame == this._end) {
                    if (this._times > 0) {
                        this._times--;
                        if (this._times == 0)
                            this._status = 2;
                        else
                            this._status = 1;
                    }
                    else if (this._start != 0)
                        this._status = 1;
                }
            }
            this.drawFrame();
        }
        drawFrame() {
            if (this._frameCount > 0 && this._frame < this._frames.length) {
                var frame = this._frames[this._frame];
                this.texture = frame.texture;
            }
            else {
                this.texture = null;
            }
        }
        checkTimer() {
            if (this._playing && this._frameCount > 0) {
                Laya.updateTimer.clear(this, this.update);
                Laya.updateTimer.frameLoop(1, this, this.update);
            }
            else
                Laya.updateTimer.clear(this, this.update);
        }
        play(times = 0, handler = null) {
            this._playing = false;
            Laya.updateTimer.clear(this, this.update);
            this.setPlaySettings(0, -1, times, -1, handler);
            this.rewind();
        }
        startRender() {
            this.playing = true;
        }
        pauseRender() {
            this.playing = false;
        }
        stop() {
            this.pauseRender();
            this._frame = 0;
        }
        recoverFrames() {
            let frame = null;
            while (this._frames && this._frames.length > 0) {
                frame = this._frames.pop();
                if (frame) {
                    frame.addDelay = 0;
                    frame.texture = null;
                    Laya.Pool.recover("fgui.Frame", frame);
                }
            }
        }
        clear() {
            this.stop();
            this._frame = 0;
            this._frameCount = 0;
            this._status = 0;
            this._repeatedCount = 0;
            this.texture = null;
            this._frames = null;
            Laya.updateTimer.clear(this, this.update);
            Laya.updateTimer.clearAll(this);
        }
    }
    long.TMoveClip = TMoveClip;
})(long || (long = {}));

(function (long) {
    function isIListItem(item) {
        return item.discriminator == "I-AM-IComponent" && item.discriminator2 == "I-AM-IListItem";
    }
    long.isIListItem = isIListItem;
    class EGList extends Laya.EventDispatcher {
        constructor(list, thisObject = null) {
            super();
            this.discriminator = "I-AM-IComponent";
            this.canCallShow = true;
            this.list = null;
            this._data = null;
            this._thisObject = null;
            this._itemRenderer = null;
            this.isAutoSize = false;
            this.isAutoScroll = false;
            this.autoHScrollSpeed = 1;
            this.autoVScrollSpeed = 1;
            this.autoVScrollInitY = 0;
            this._preSelectedIndex = -1;
            this.stageMouseDown = false;
            this.focusItem = null;
            this.doScrollEffect = false;
            this.list = list;
            this._thisObject = thisObject;
            this._data = [];
            if (this.list != null) {
                this._thisObject = thisObject || this;
                this.list.itemRenderer = new Laya.Handler(this, this.listItemRender, null, false);
                if (this.list.scrollPane) {
                    this.list.setVirtual();
                }
                this.list[EGList.EGLIST] = this;
            }
        }
        listItemRender(index, item) {
            if (this.array && (item instanceof long.TComponent || item instanceof long.TBaseButton)) {
                item.show(this.array[index]);
            }
        }
        AddListener() {
            Laya.timer.clear(this, this.loopVScroll);
            Laya.timer.clear(this, this.loopHScroll);
            fgui.GTween.kill(this);
            this.list.on(fgui.Events.CLICK_ITEM, this, this.clickItem);
            this.list.on(fgui.Events.SCROLL, this, this.listScroll);
            this.list.on(fgui.Events.SCROLL_END, this, this.listScrollEnd);
            if (this.isAutoScroll) {
                Laya.stage.on(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
                Laya.stage.on(Laya.Event.MOUSE_UP, this, this.mouseUp);
            }
        }
        RemoveListener() {
            this.list.off(fgui.Events.CLICK_ITEM, this, this.clickItem);
            this.list.off(fgui.Events.SCROLL, this, this.listScroll);
            this.list.off(fgui.Events.SCROLL_END, this, this.listScrollEnd);
            this.list.off(fgui.Events.SCROLL, this, this.doSpecialEffect);
            Laya.stage.off(Laya.Event.MOUSE_DOWN, this, this.mouseDown);
            Laya.stage.off(Laya.Event.MOUSE_UP, this, this.mouseUp);
        }
        show(data) {
            Laya.timer.clear(this, this.loopVScroll);
            Laya.timer.clear(this, this.loopHScroll);
            fgui.GTween.kill(this);
            this._data = data;
            if (data instanceof Array) {
                this.array = data;
            }
        }
        get isSingle() {
            return this.list.selectionMode == fgui.ListSelectionMode.Single;
        }
        set selectionMode(val) {
            this.list.selectionMode = val;
        }
        get selectionMode() {
            return this.list.selectionMode;
        }
        clickItem(target) {
            if (this.isSingle && this._preSelectedIndex != this.list.selectedIndex || this._preSelectedIndex == -1) {
                this.selectItem(target);
            }
            else if (!this.isSingle) {
                this.selectItem(target);
            }
            this._preSelectedIndex = this.list.selectedIndex;
            if (isIListItem(target)) {
                if (this.focusItem)
                    this.focusItem.isFocus = false;
                if (this.focusItem != target) {
                    this.focusItem = target;
                    this.focusItem.isFocus = true;
                    this.event(Laya.Event.FOCUS, target);
                }
            }
        }
        selectItem(item) {
            this.event(fgui.Events.CLICK_ITEM, item);
        }
        set itemUrl(value) {
            this.list.defaultItem = value;
        }
        get itemUrl() {
            return this.list.defaultItem;
        }
        set numItems(value) {
            this.list.numItems = value;
        }
        get numItems() {
            return this.list.numItems;
        }
        set data(value) {
            this.list.data = value;
        }
        get data() {
            return this.list.data;
        }
        set array(value) {
            if (this.focusItem)
                this.focusItem.isFocus = false;
            this._data = value || [];
            this.list.numItems = this._data.length;
            this.setAutoSize();
        }
        get array() {
            return this._data;
        }
        get Data() {
            return this._data;
        }
        getSelection(result) {
            return this.list.getSelection(result);
        }
        setArray(arr, doScrollEffect = false, scale = 0.5) {
            if (this.focusItem)
                this.focusItem.isFocus = false;
            this.doScrollEffect = doScrollEffect;
            if (doScrollEffect) {
                this.list.setVirtualAndLoop();
            }
            this.array = arr;
            if (this.isSingle) {
                this.scrollToTop();
                this._preSelectedIndex = -1;
                this.selectedIndex = 0;
            }
            if (doScrollEffect) {
                this.list.off(fgui.Events.SCROLL, this, this.doSpecialEffect);
                this.list.on(fgui.Events.SCROLL, this, this.doSpecialEffect, [scale]);
                this.doSpecialEffect(scale);
            }
        }
        doSpecialEffect(scale = 0.5) {
            var midX = this.list.scrollPane.posX + this.list.viewWidth / 2;
            var cnt = this.list.numChildren;
            for (var i = 0; i < cnt; i++) {
                var obj = this.list.getChildAt(i);
                var dist = Math.abs(midX - obj.x - obj.width / 2);
                if (dist > obj.width)
                    obj.setScale(1, 1);
                else {
                    var ss = 1 + (1 - dist / obj.width) * scale;
                    obj.setScale(ss, ss);
                }
            }
            this._preSelectedIndex = -1;
            let index = (this.list.getFirstChildInView() + 1) % this.list.numItems;
            this.selectedIndex = index;
            this.event(fgui.Events.SCROLL);
        }
        setPosX(value, ani) {
            if (this.list && this.list.scrollPane) {
                this.list.scrollPane.setPosX(value, ani);
            }
        }
        canelSelect() {
            this._preSelectedIndex = -1;
            this.list.clearSelection();
        }
        setAutoSize() {
            if (this.isAutoSize) {
                let w = 0;
                let h = 0;
                let item = null;
                if (this.isHScroll) {
                    for (let i = 0; i < this.list.numChildren; i++) {
                        item = this.list.getChildAt(i);
                        if (item != null) {
                            w += item.width;
                        }
                    }
                    w += this._data.length > 1 ? (this._data.length - 1) * this.list.columnGap : 0;
                    this.list.setSize(w, this.list.height);
                }
                else if (this.isVScroll) {
                    for (let i = 0; i < this.list.numChildren; i++) {
                        item = this.list.getChildAt(i);
                        if (item != null) {
                            h += item.height;
                        }
                    }
                    h += this._data.length > 1 ? (this._data.length - 1) * this.list.lineGap : 0;
                    this.list.setSize(this.list.width, h);
                }
            }
            if (this.isAutoScroll) {
                if (this.isHScroll) {
                    let gap = this.contentWidth - this.list.viewWidth;
                    if (gap > 0) {
                        Laya.timer.frameLoop(1, this, this.loopHScroll);
                    }
                }
                else if (this.isVScroll) {
                    let gap = this.contentHeight - this.list.viewHeight;
                    if (gap > 0) {
                        Laya.timer.frameLoop(1, this, this.loopVScroll);
                    }
                }
            }
        }
        loopVScroll() {
            if (long.ObjectUtils.globalIsIn(this.list) && this.stageMouseDown) {
                return;
            }
            if (this.isScrollTween) {
                return;
            }
            this.list.scrollPane.posY += this.autoVScrollSpeed;
        }
        loopHScroll() {
            if (long.ObjectUtils.globalIsIn(this.list) && this.stageMouseDown) {
                return;
            }
            if (this.isScrollTween) {
                return;
            }
            this.list.scrollPane.posX += this.autoHScrollSpeed;
        }
        setSize(w, h, ignorePivot) {
            this.list.setSize(w, h, ignorePivot);
        }
        getAllWidth(singleW = 60, isVirtual = true) {
            if (this.isHScroll) {
                return this.list.height;
            }
            else if (isVirtual) {
                let w = 0;
                let item = null;
                for (let i = 0; i < this.list.numChildren; i++) {
                    item = this.list.getChildAt(i);
                    if (item != null) {
                        w += item.width;
                    }
                }
                w += this._data.length > 1 ? (this._data.length - 1) * this.list.columnGap : 0;
                return w;
            }
            else {
                let item = this.list.getChildAt(0);
                let sw = item ? item.width : singleW;
                let w = sw * this._data.length;
                w += this._data.length > 1 ? (this._data.length - 1) * this.list.columnGap : 0;
                return w;
            }
        }
        getAllHeight(singleH = 60, isVirtual = true) {
            if (this.isHScroll) {
                return this.list.height;
            }
            else if (isVirtual) {
                let h = 0;
                let item = null;
                for (let i = 0; i < this.list.numChildren; i++) {
                    item = this.list.getChildAt(i);
                    if (item != null) {
                        h += item.height;
                    }
                }
                h += this._data.length > 1 ? (this._data.length - 1) * this.list.lineGap : 0;
                return h;
            }
            else {
                let item = this.list.getChildAt(0);
                let sh = item ? item.height : singleH;
                let h = sh * this._data.length;
                h += this._data.length > 1 ? (this._data.length - 1) * this.list.lineGap : 0;
                return h;
            }
        }
        mouseDown() {
            this.stageMouseDown = true;
        }
        mouseUp() {
            this.stageMouseDown = false;
            if (this.focusItem && !this.focusItem.globalIsIn()) {
                this.focusItem.isFocus = false;
                this.focusItem = null;
            }
        }
        rightClickItem(item) {
            if (isIListItem(item)) {
                if (this.focusItem)
                    this.focusItem.isFocus = false;
                item.isFocus = true;
                this.focusItem = item;
            }
        }
        listScroll() {
            this.event(fgui.Events.SCROLL);
        }
        listScrollEnd() {
            this.mouseUp();
            this.event(fgui.Events.SCROLL_END);
        }
        get displayObject() {
            return this.list;
        }
        InitUI() {
        }
        get numChildren() {
            return this.list && this.list.numChildren;
        }
        getChildAt(index) {
            return this.list && this.list.getChildAt(index);
        }
        get items() {
            let arr = [];
            for (let i = 0; i < this.list.numChildren; i++) {
                arr.push(this.list.getChildAt(i));
            }
            return arr;
        }
        set visible(value) {
            this.list.visible = value;
        }
        get visible() {
            return this.list.visible;
        }
        get scrollPane() {
            return this.list.scrollPane;
        }
        killTween() {
            return this.scrollPane && this.scrollPane["killTween"]();
        }
        get isScrollTween() {
            return this.scrollPane && this.scrollPane["_tweening"] != 0;
        }
        get viewWidth() {
            return this.list.viewWidth;
        }
        get viewHeight() {
            return this.list.viewHeight;
        }
        setScale(sx, sy) {
            this.list && this.list.setScale(sx, sy);
        }
        setVirtual() {
            if (this.list.scrollPane) {
                this.list.setVirtual();
            }
        }
        setVirtualAndLoop() {
            if (this.list.scrollPane) {
                this.list["_virtual"] = false;
                this.list.setVirtualAndLoop();
            }
        }
        get scrollType() {
            return this.list && this.list.scrollPane && this.list.scrollPane["_scrollType"];
        }
        get isVScroll() {
            return this.list.layout == fgui.ListLayoutType.SingleColumn || this.scrollType == fgui.ScrollType.Vertical;
        }
        get isHScroll() {
            return this.list.layout == fgui.ListLayoutType.SingleRow || this.scrollType == fgui.ScrollType.Horizontal;
        }
        set touchable(value) {
            this.list && (this.list.touchable = value);
        }
        get touchable() {
            return this.list && this.list.touchable;
        }
        set isTouchScroll(value) {
            if (this.list && this.list.scrollPane) {
                this.list.scrollPane.touchEffect = value;
            }
        }
        get isTouchScroll() {
            return this.list && this.list.scrollPane && this.list.scrollPane.touchEffect;
        }
        get isBoth() {
            return this.scrollType == fgui.ScrollType.Both;
        }
        get contentWidth() {
            return this.list.scrollPane ? this.list.scrollPane.contentWidth : this.list.width;
        }
        get contentHeight() {
            return this.list.scrollPane ? this.list.scrollPane.contentHeight : this.list.height;
        }
        get width() {
            return this.list ? this.list.width : 0;
        }
        get height() {
            return this.list ? this.list.height : 0;
        }
        set height(val) {
            if (this.list) {
                this.list.height = val;
            }
        }
        set x(value) {
            this.list.x = value;
        }
        get x() {
            return this.list.x;
        }
        set y(value) {
            this.list.y = value;
        }
        get y() {
            return this.list.y;
        }
        setInitSelectedIndex() {
            this.list.selectedIndex = 0;
            this._preSelectedIndex = -1;
        }
        set listSelectedIndex(value) {
            this.list.selectedIndex = value;
        }
        set selectedIndex(value) {
            this.list.selectedIndex = value;
            let item = null;
            for (let i = 0; i < this.list.numChildren; i++) {
                item = this.list.getChildAt(i);
                if (this._data && item.Data == this._data[value]) {
                    this.clickItem(item);
                    break;
                }
            }
            this._preSelectedIndex = value;
        }
        get selectedIndex() {
            if (this.list.selectedIndex == -1) {
                return 0;
            }
            return this.list.selectedIndex;
        }
        get selectData() {
            if (this._preSelectedIndex == -1) {
                return null;
            }
            return this._data && this._data[this._preSelectedIndex];
        }
        toPrev() {
            if (this.list.scrollPane) {
                this.list.scrollPane.scrollLeft(1, true);
            }
        }
        toNext() {
            if (this.list.scrollPane) {
                this.list.scrollPane.scrollRight(1, true);
            }
        }
        scrollToView(index, ani = false, setFirst = false) {
            this.list.scrollToView(index, ani, setFirst);
        }
        set scrollEnabled(value) {
            if (this.list.scrollPane) {
                this.list.scrollPane.touchEffect = value;
            }
        }
        get scrollEnabled() {
            return this.list.scrollPane && this.list.scrollPane.touchEffect;
        }
        scrollLeft(ratio, ani) {
            if (this.list.scrollPane != null) {
                this.list.scrollPane.scrollLeft(ratio, ani);
            }
        }
        scrollRight(ratio, ani) {
            if (this.list.scrollPane != null) {
                this.list.scrollPane.scrollRight(ratio, ani);
            }
        }
        scrollToTop(ani) {
            if (this.list.scrollPane != null) {
                this.list.scrollPane.scrollTop(ani);
            }
        }
        scrollToBottom(ani) {
            if (this.list.scrollPane != null) {
                this.list.scrollPane.scrollBottom(ani);
            }
        }
        scrollUp(step = 1) {
            this.list.scrollPane.scrollStep = step;
            if (this.list.scrollPane != null) {
                this.list.scrollPane.scrollUp();
            }
        }
        scrollDown(step = 1) {
            this.list.scrollPane.scrollStep = step;
            if (this.list.scrollPane != null) {
                this.list.scrollPane.scrollDown();
            }
        }
        set lineCount(value) {
            this.list.lineCount = value;
        }
        get lineCount() {
            return this.list.lineCount;
        }
        set columnCount(value) {
            this.list.columnCount = value;
        }
        get columnCount() {
            return this.list.columnCount;
        }
        set lineGap(value) {
            this.list.lineGap = value;
        }
        get lineGap() {
            return this.list.lineGap;
        }
        set columnGap(value) {
            this.list.columnGap = value;
        }
        get columnGap() {
            return this.list.columnGap;
        }
        get GList() {
            return this.list;
        }
        localToGlobal(ax, ay) {
            return this.list.localToGlobal(ax, ay);
        }
        hide() {
            let item;
            for (let i = 0; i < this.numChildren; i++) {
                item = this.getChildAt(i);
                if (isIListItem(item)) {
                    item.hide && item.hide();
                }
            }
            fgui.GTween.kill(this);
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            Laya.timer.clear(this, this.loopVScroll);
            Laya.timer.clear(this, this.loopHScroll);
            this._data = null;
            this._preSelectedIndex = -1;
            if (this.focusItem)
                this.focusItem.isFocus = false;
            this.focusItem = null;
        }
        Destroy() {
            this.hide();
        }
    }
    EGList.EGLIST = "$eglist";
    long.EGList = EGList;
})(long || (long = {}));

(function (long) {
    class TBaseButton extends fgui.GButton {
        constructor() {
            super();
            this.discriminator = "I-AM-IComponent";
            this.canCallShow = true;
            this.m_data = null;
            this.initTouchEffect = 0;
            this._btns = null;
            this._isFocus = false;
            this.$gid = 0;
            this.$gid = Laya.Utils.getGID();
        }
        onConstruct() {
            super.onConstruct();
            this._btns = [];
            long.FairyUtils.setVar(this, this, this._btns);
            this.initTouchEffect = this["_downEffect"];
            this.InitUI();
        }
        InitUI() {
            this.c1 = this.getController("c1");
        }
        AddListener() {
        }
        RemoveListener() {
        }
        show(data) {
            this.m_data = data;
            this.AddListener();
        }
        get Data() {
            return this.m_data;
        }
        set isFocus(value) {
            this._isFocus = value;
        }
        get isFocus() {
            return this._isFocus;
        }
        set selectedPage(value) {
            this.c1 = this.c1 || this.getController("c1");
            if (this.c1 != null) {
                this.c1.selectedPage = value;
            }
            this.updateState();
        }
        get selectedPage() {
            return this.c1 && this.c1.selectedPage;
        }
        hasPage(name) {
            return this.c1 && this.c1.hasPage(name);
        }
        updateState() {
        }
        set touchEffect(value) {
            this["_downEffect"] = value ? this.initTouchEffect : 0;
        }
        get touchEffect() {
            return this["_downEffect"] != 0;
        }
        set touchEffectValue(value) {
            this["_downEffectValue"] = value;
        }
        get touchEffectValue() {
            return this["_downEffectValue"];
        }
        addComponent(script) {
            let sc = this.displayObject && this.displayObject.addComponent(script);
            sc["$owner"] = this;
            return sc;
        }
        hide() {
            let components = this.displayObject.getComponents(Laya.Component);
            let comp;
            if (components) {
                for (let i = components.length - 1; i >= 0; i--) {
                    comp = components[i];
                    comp && comp.destroy();
                }
            }
            this.RemoveListener();
            fgui.GTween.kill(this);
            Laya.timer.clearAll(this);
            Laya.Tween.clearAll(this);
            this.m_data = null;
        }
        Destroy() {
            this.hide();
            if (!this.isDisposed) {
                this.dispose();
            }
        }
    }
    long.TBaseButton = TBaseButton;
    class TListButtonItem extends TBaseButton {
        constructor() {
            super();
            this.discriminator2 = "I-AM-IListItem";
            this.m_eventPool = null;
            this._isFocus = false;
            this.m_eventPool = new long.EventPool();
        }
        onConstruct() {
            super.onConstruct();
        }
        set isFocus(value) {
            this._isFocus = value;
        }
        get isFocus() {
            return this._isFocus;
        }
        setIcon(url) {
            long.PanelRegister.loadUrl(url, Laya.Handler.create(this, (url) => {
                this.icon = url;
            }));
        }
        show(data) {
            super.show(data);
        }
        AddListener() {
            if (this._btns) {
                let btn;
                for (let i = 0; i < this._btns.length; i++) {
                    btn = this._btns[i];
                    btn && btn.onClick(this, this.onBtnClick, [btn]);
                }
            }
            long.CheckComponent(this, "AddListener");
        }
        RemoveListener() {
            if (this._btns) {
                let btn;
                for (let i = 0; i < this._btns.length; i++) {
                    btn = this._btns[i];
                    btn && btn.offClick(this, this.onBtnClick);
                }
            }
            long.CheckComponent(this, "RemoveListener");
        }
        AddGameListener(type, listener, thisObject, target) {
            this.m_eventPool.AddListenerInPool(type, listener, thisObject, target);
        }
        RemoveGameListener(type, listener, thisObject, target) {
            this.m_eventPool.RemoveListenerFromPool(type, listener, thisObject, target);
        }
        get eglistParent() {
            let list = long.ObjectUtils.getParentOf(fgui.GList, this);
            return list && list["$eglist"];
        }
        globalIsIn(gp = null) {
            return this.globalIsInRange(gp);
        }
        globalIsInRange(gp = null, range = null) {
            return long.ObjectUtils.globalIsInRange(gp, range, this);
        }
        onBtnClick(btn) {
            if (!btn.sound) {
                long.SoundMgr.Inst.play(long.SoundMgr.click);
            }
            else if (btn.sound.indexOf("ui://") != 0) {
                long.SoundMgr.Inst.play(btn.sound);
            }
            let eglist = this.parent && this.parent["$eglist"];
            if (eglist) {
                eglist.event(long.UIGameEvent.CLICK_LIST_BUTTON, [btn, this]);
            }
        }
        hide() {
            super.hide();
            if (this.m_eventPool != null) {
                this.m_eventPool.Reset();
            }
            long.CheckComponent(this, "hide");
        }
        Destroy() {
            long.CheckComponent(this, "Destroy");
            if (this.m_eventPool) {
                this.m_eventPool = null;
            }
            this.m_data = null;
        }
    }
    long.TListButtonItem = TListButtonItem;
    class TSpineButton extends TBaseButton {
        constructor() {
            super();
            this.spineName = null;
            this.iRes = null;
            this.skeleton = null;
            this.isLoop = true;
            this.isOverRemove = false;
            this.handler = null;
            this._isLoad = false;
            this.touchable = true;
        }
        InitUI() {
            super.InitUI();
        }
        show(data) {
            super.show(data);
            if (this._iconObject instanceof fgui.GLoader) {
                this.visible = this._iconObject.visible = this._iconObject.icon != "";
            }
            if (typeof data === "string") {
                this.play(data);
            }
            else if (typeof data === "object") {
                if (data.spineName) {
                    let isLoop = data.hasOwnProperty("isLoop") ? data.isLoop : true;
                    let handler = data.handler;
                    this.play(data.spineName, NaN, NaN, isLoop, false, handler, data.aniName, data);
                }
            }
        }
        play(spineName, x = NaN, y = NaN, isLoop = true, isOverRemove = false, handler = null, aniName = null, data = null) {
            let self = this;
            if (self.spineName == spineName) {
                return;
            }
            self.hide();
            this.m_data = data;
            self.visible = true;
            self.spineName = spineName;
            self.isLoop = isLoop;
            self.isOverRemove = isOverRemove;
            self.handler = handler;
            let url = long.UrlUtils.GetSpineUrl(spineName);
            long.LoadQueue.Inst.loadSpine(url, Laya.Handler.create(this, this.onComplete, [spineName, aniName, x, y]));
        }
        onComplete(spineName, aniName, x, y, iRes) {
            this._isLoad = true;
            this.iRes = iRes;
            this.skeleton = iRes.GetRes().buildArmature(0);
            if (!this.skeleton || this.skeleton.destroyed || this.isDisposed) {
                console.error("spine资源已释放!!! spineName: " + spineName + " aniName: " + aniName);
                return;
            }
            this.displayObject && this.displayObject.addChildAt(this.skeleton, 0);
            x = isNaN(x) ? this.width * 0.5 : x;
            y = isNaN(y) ? this.height * 0.5 : y;
            this.skeleton.pos(x, y);
            if (!this.isLoop) {
                this.skeleton.once(Laya.Event.STOPPED, this, this.completeHandler);
            }
            this.skeleton.play(aniName == null ? 0 : aniName, this.isLoop);
            let loadComplete = this.m_data && this.m_data.loadComplete;
            if (loadComplete) {
                loadComplete.run();
            }
        }
        completeHandler() {
            this.handler && this.handler.run();
            if (this.isOverRemove) {
                this.hide();
            }
        }
        PlayAni(aniName, isLoop = true, handler = null) {
            if (!this.skeleton) {
                long.Logger.debug(this, "=====>skeleton is null.");
                return;
            }
            this.skeleton.play(aniName, isLoop);
            this.handler = handler;
            if (!isLoop) {
                this.skeleton.once(Laya.Event.STOPPED, this, this.completeHandler);
            }
        }
        get isShow() {
            return this.visible && this.skeleton != null;
        }
        hide() {
            super.hide();
            this.spineName = null;
            this.isLoop = true;
            this.isOverRemove = false;
            this.handler = null;
            this.visible = false;
            if (this._iconObject) {
                this._iconObject.visible = false;
            }
            if (this.skeleton != null) {
                this.skeleton.removeSelf();
                this.skeleton.off(Laya.Event.STOPPED, this, this.completeHandler, false);
                this.skeleton = null;
            }
            if (this.iRes != null) {
                this.iRes.Dispose();
                this.iRes = null;
            }
            this.displayObject && this.displayObject.removeChildren();
            this._isLoad = false;
        }
    }
    long.TSpineButton = TSpineButton;
    class Icon extends TBaseButton {
        constructor() {
            super();
        }
        InitUI() {
            this.touchable = false;
            if (this._iconObject instanceof fgui.GLoader) {
                this._iconObject.icon = "";
            }
        }
        show(data) {
            super.show(data);
            if (data instanceof Laya.Texture) {
            }
            else if (data) {
                this.setIcon(data);
            }
            else {
                this.hide();
            }
        }
        set url(value) {
            if (!value) {
                this.hide();
            }
            else {
                let pkgItem = fgui.UIPackage.getItemByURL(value);
                let url = pkgItem.owner.name + "|" + pkgItem.name;
                this.setIcon(url);
            }
        }
        get url() {
            return this._iconUrl;
        }
        setIcon(url, callback = null) {
            this._iconUrl = url;
            if (!url) {
                callback && callback.run();
                this.hide();
            }
            else if (url.indexOf("|") != -1) {
                let arr = url.split("|");
                this.setSheet(arr[0], arr[1]);
            }
            else {
                this.icon = url;
            }
        }
        setSheet(pkgName, resName, path = long.UrlUtils.UI) {
            long.LoadQueue.Inst.loadFguiPkg(pkgName, path, Laya.Handler.create(this, this.onloadSheetComplete, [pkgName, resName]));
        }
        onloadSheetComplete(pkgName, resName, value) {
            if (!value.getRes(resName)) {
                value.loadResName(resName, Laya.Handler.create(this, (pkgName, resName) => {
                    this.icon = long.PanelRegister.getUrl(pkgName, resName);
                }, [pkgName, resName]));
            }
            else {
                this.icon = long.PanelRegister.getUrl(pkgName, resName);
            }
        }
        set texture(value) {
            if (this._iconObject instanceof fgui.GLoader) {
                this._iconObject["onExternalLoadSuccess"](value);
            }
        }
        get texture() {
            if (this._iconObject instanceof fgui.GLoader) {
                return this._iconObject.content.texture;
            }
            return null;
        }
        hide() {
            super.hide();
            this.icon = "";
            this._iconUrl = "";
        }
    }
    long.Icon = Icon;
    class EButton extends TBaseButton {
        constructor() {
            super();
            this.m_param = null;
            this.playSound = true;
        }
        breath(range = 1.2) {
            fgui.GTween.to(1, range, 0.6).setTarget(this).setEase(fgui.EaseType.SineInOut).setRepeat(-1, true)
                .onUpdate((tw) => {
                this.setScale(tw.value.x, tw.value.x);
            }, this);
        }
        stopBreath() {
            this.setScale(1, 1);
            fgui.GTween.kill(this);
        }
        InitUI() {
            super.InitUI();
            this.c1 = this.getController("c1");
            if (this._iconObject) {
                this._iconObject.touchable = false;
            }
            if (this._titleObject) {
                this._titleObject.touchable = false;
            }
        }
        show(param) {
            super.show(param);
            this.m_param = param;
        }
        get Data() {
            return this.m_param;
        }
        setTooltips(value) {
            this.off(Laya.Event.ROLL_OVER, this, this.rollOver);
            this.off(Laya.Event.ROLL_OUT, this, this.rollOut);
            this["_tooltips"] = value;
            if (this["_tooltips"]) {
                this.on(Laya.Event.ROLL_OVER, this, this.rollOver);
                this.on(Laya.Event.ROLL_OUT, this, this.rollOut);
            }
        }
        rollOver() {
            Laya.timer.once(100, this, this.showTooltip);
        }
        rollOut() {
            Laya.timer.clear(this, this.showTooltip);
            fgui.GRoot.inst.hideTooltips();
        }
        showTooltip(pos = null) {
        }
        set selectedPage(value) {
            this.c1 = this.c1 || this.getController("c1");
            if (this.c1 != null) {
                this.c1.selectedPage = value;
            }
            this.updateState();
        }
        get selectedPage() {
            return this.c1 && this.c1.selectedPage;
        }
        set selectedIndex(value) {
            if (this.c1) {
                this.c1.selectedIndex = value;
            }
            this.updateState();
        }
        get selectedIndex() {
            return this.c1 ? this.c1.selectedIndex : 0;
        }
        updateState() {
        }
        toTop(child) {
            child = child || this;
            if (this.numChildren > 1 && this.getChildIndex(child) != -1) {
                this.setChildIndex(child, this.numChildren - 1);
            }
        }
        toBottom(child) {
            child = child || this;
            if (this.getChildIndex(child) != -1) {
                this.setChildIndex(child, 0);
            }
        }
        get allVisible() {
            return this.internalVisible && this.internalVisible2 && this.internalVisible3;
        }
        showScaleEffect(btn) {
            if (btn == null)
                return;
            fgui.GTween.to3(0, 0, 0, 1, 1, 1, 0.3).setTarget(btn)
                .setEase(fgui.EaseType.SineInOut)
                .onUpdate(function onUpdate(tw) {
                btn.setScale(tw.value.x, tw.value.y);
                btn.alpha = tw.value.z;
            })
                .onComplete(function onComplete() {
            });
        }
        get privoGlobalPoint() {
            return this.localToGlobal(Math.ceil(this.pivotX * this.width), Math.ceil(this.pivotY * this.height));
        }
        RemoveListener() {
            super.RemoveListener();
            this.off(Laya.Event.ROLL_OVER, this, this.rollOver);
            this.off(Laya.Event.ROLL_OUT, this, this.rollOut);
        }
        hide() {
            super.hide();
            this.m_param = null;
            fgui.GTween.kill(this);
            Laya.Tween.clearAll(this);
        }
    }
    long.EButton = EButton;
})(long || (long = {}));

(function (long) {
    function CheckComponent(parent, funName = "show", param = null) {
        if (parent == null || !funName)
            return;
        let child;
        let numChildren = parent.numChildren;
        for (let i = numChildren - 1; i >= 0; i--) {
            child = parent.getChildAt(i);
            if (child instanceof fgui.GList) {
                CheckEGlistCompoent(child, funName, param);
            }
            else if (instanceOfIComponet(child) && child.canCallShow) {
                param != null ? child[funName](param) : child[funName]();
            }
            else if (child.numChildren > 0) {
                CheckComponent(child, funName, param);
            }
        }
    }
    long.CheckComponent = CheckComponent;
    function CheckEGlistCompoent(child, funName = "show", param = null) {
        let eglist = child[long.EGList.EGLIST];
        if (eglist != null) {
            param != null ? eglist[funName](param) : eglist[funName]();
        }
        else if (child instanceof fgui.GList) {
            CheckComponent(child, funName, param);
        }
    }
    long.CheckEGlistCompoent = CheckEGlistCompoent;
    function instanceOfIComponet(obj) {
        return obj.discriminator == "I-AM-IComponent";
    }
    long.instanceOfIComponet = instanceOfIComponet;
})(long || (long = {}));

(function (long) {
    class TListItem extends long.TComponent {
        constructor() {
            super();
            this.discriminator2 = "I-AM-IListItem";
            this._btns = null;
            this._isFocus = false;
        }
        onConstruct() {
            super.onConstruct();
            this.AddListener();
        }
        InitFairyGui() {
            this._btns = new Array();
            long.FairyUtils.setVar(this, this, this._btns);
        }
        show(param) {
            this.m_param = param;
        }
        set isFocus(value) {
            this._isFocus = value;
        }
        get isFocus() {
            return this._isFocus;
        }
        globalIsIn(gp = null) {
            return this.globalIsInRange(gp);
        }
        globalIsInRange(gp = null, range = null) {
            return long.ObjectUtils.globalIsInRange(gp, range, this);
        }
        hide() {
            super.hide();
        }
    }
    long.TListItem = TListItem;
})(long || (long = {}));

(function (long) {
    class TPoint extends Laya.Point {
        GC() {
            long.ObjectPools.Inst.gcObj(TPoint.KEY, this);
        }
        Reset() {
        }
        static GCArray(value) {
            if (value == null) {
                for (const tp of value) {
                    tp.GC();
                }
                value.length = 0;
            }
        }
    }
    TPoint.KEY = "TPoint";
    long.TPoint = TPoint;
})(long || (long = {}));

(function (long) {
    class UIGameEvent {
    }
    UIGameEvent.ON_ACTIVE = "ON_ACTIVE";
    UIGameEvent.ON_SHOW_VIEW = "ON_SHOW_VIEW";
    UIGameEvent.ON_HIDE_VIEW = "ON_HIDE_VIEW";
    UIGameEvent.SHOW_BANNER = "SHOW_BANNER";
    UIGameEvent.HIDE_BANNER = "HIDE_BANNER";
    UIGameEvent.UPDATE_BANNER = "UPDATE_BANNER";
    UIGameEvent.SHOW_INSERT = "SHOW_INSERT";
    UIGameEvent.HIDE_INSERT = "HIDE_INSERT";
    UIGameEvent.SHOW_TIP = "SHOW_TIP";
    UIGameEvent.SKIP_DAY = "UIGameEvent.skipDay";
    UIGameEvent.CLICK_LIST_BUTTON = "CLICK_LIST_BUTTON";
    UIGameEvent.STOP_RECORD = "STOP_RECORD";
    UIGameEvent.SHARE_FAIL = "SHARE_FAIL";
    UIGameEvent.GET_MENU_BUTTON = "GET_MENU_BUTTON";
    long.UIGameEvent = UIGameEvent;
})(long || (long = {}));

(function (long) {
    class EffectUtil {
        constructor() { }
        static listEffect(list, time = 200, delayTime = 0, extTime = 0) {
            let item = null;
            for (let i = 0; i < list.numChildren; i++) {
                item = list.getChildAt(i);
                item.alpha = 0;
                Laya.Tween.clearTween(item);
                Laya.Tween.to(item, { "alpha": 1 }, time, null, null, extTime + i * delayTime);
            }
        }
        static itemEffect(item, time) {
            item.alpha = 0.5;
            Laya.Tween.clearTween(item);
            Laya.Tween.to(item, { "alpha": 1 }, time, null, null);
        }
        static itemEffectReverse(item, time) {
            item.alpha = 1;
            Laya.Tween.clearTween(item);
            Laya.Tween.to(item, { "alpha": 0.5 }, time, null, null);
        }
        static openWindowEffect(window, complete = null, thisObj = null, params = null, isMust = false) {
            fgui.GTween.kill(window);
            window.scaleX = window.scaleY = 0.3;
            window.alpha = 1;
            let w = window.viewWidth;
            let h = window.viewHeight;
            window.x = (w - window.scaleX * w) * 0.5;
            window.y = (h - window.scaleY * h) * 0.5;
            let _self = null;
            fgui.GTween.to2(0.3, 0.3, 1.05, 1.05, 0.3)
                .setTarget(window, _self)
                .onUpdate(onUpdate, _self)
                .onComplete(function onComplete() {
                fgui.GTween.to2(1.05, 1.05, 0.98, 0.98, 0.3).setTarget(window, _self).onUpdate(onUpdate, _self).onComplete(function onComplete1() {
                    fgui.GTween.to2(0.98, 0.98, 1, 1, 0.2).setTarget(window, _self).onUpdate(onUpdate, _self).onComplete(function onComplete2() {
                        fgui.GTween.kill(window);
                        if (complete != null) {
                            complete.apply(thisObj, params);
                        }
                    }, _self);
                }, _self);
            }, _self);
            function onUpdate(tw) {
                window.scaleX = tw.value.x;
                window.scaleY = tw.value.y;
                window.x = (w - window.scaleX * w) * 0.5;
                window.y = (h - window.scaleY * h) * 0.5;
            }
        }
        static closeWindowEffect(window, complete = null, thisObj = null, params = null, isMust = false) {
            if (window) {
                if (!isMust && window["isWindowEffect"]) {
                    return;
                }
                else if (isMust) {
                    fgui.GTween.kill(window);
                }
                window.alpha = 1;
                window.scaleX = window.scaleY = 1;
                let w = window.width;
                let h = window.height;
                fgui.GTween.to3(1, 1, 1, 0.8, 0.8, 0, 0.3).setTarget(window, this)
                    .onUpdate(function onUpdate(tw) {
                    window.scaleX = tw.value.x;
                    window.scaleY = tw.value.y;
                    window.alpha = tw.value.z;
                    window.x = (Laya.Browser.width - window.scaleX * w) * 0.5;
                    window.y = (Laya.Browser.height - window.scaleY * h) * 0.5;
                }, this)
                    .onComplete(function onComplete() {
                    fgui.GTween.kill(window);
                    if (complete != null) {
                        complete.apply(thisObj, params);
                    }
                }, this);
            }
        }
        static FlyPlaceGoldEffect(parent, pkgName, resName, sx, sy, ex, ey, time = 800, num = 1, radius = 50, complete = null) {
            let maxDistance = Math.abs(sy - ey);
            let distance = 0;
            let rate = maxDistance / time;
            for (var i = 0; i < num; i++) {
                var item = fgui.UIPackage.createObject(pkgName, resName);
                item.setPivot(0.5, 0.5, true);
                item.touchable = false;
                parent.addChild(item);
                let points = [];
                let deltax = long.MathUtil.makeRandom(0, radius * 2) - radius;
                let deltay = long.MathUtil.makeRandom(0, radius * 2) - radius;
                item.x = sx + deltax;
                item.y = sy + deltay;
                points.push(new Laya.Point(item.x, item.y));
                points.push(new Laya.Point(sx + deltax * 2, ey + (sy - ey) * 0.5));
                points.push(new Laya.Point(ex, ey));
                distance = Math.abs(item.y - ey);
                var flyobj = new long.Bezier2D(item, distance / rate, (maxDistance - distance) * 5, points);
                flyobj.start();
            }
            if (complete) {
                Laya.timer.once(time, this, () => {
                    complete && complete.run();
                });
            }
        }
        static PlayTarget(value, start, end, complete = null, time = 700, resName = "coin") {
            if (!start || !end || start.isDisposed || end.isDisposed)
                return;
            let st = start.pivotAsAnchor ? start.localToGlobal(0, 0) : start.localToGlobal(start.width * 0.5, start.height * 0.5);
            let ed = end.pivotAsAnchor ? end.localToGlobal(0, 0) : end.localToGlobal(end.width * 0.5, end.height * 0.5);
            EffectUtil.PlayGold(value, st.x, st.y, 50, ed.x, ed.y, time, complete, resName);
        }
        static PlayGold(value, sx = long.GlobalConfig.viewWidth * 0.5, sy = long.GlobalConfig.viewHeight * 0.5, radius = 50, ex = 0, ey = 0, time = 700, complete = null, resName = "coin") {
            if (value <= 0)
                return;
            if (ex == 0) {
                ex = long.GlobalConfig.viewWidth - (long.GlobalConfig.width - 571 - 25);
                ey = 70;
            }
            let count = value > 20 ? 20 : value;
            EffectUtil.FlyPlaceGoldEffect(long.GameLayer.topLayer, "common", resName, Math.ceil(sx), Math.ceil(sy), Math.ceil(ex), Math.ceil(ey), time, count, radius, complete);
        }
    }
    long.EffectUtil = EffectUtil;
})(long || (long = {}));

(function (long) {
    class FairyUtils {
        static setVar(parent, thisObject, btns = null) {
            if (!parent)
                return;
            if (parent != null && thisObject != null) {
                let transObj;
                for (let i = 0; i < parent.numChildren; i++) {
                    transObj = parent.getChildAt(i);
                    if (transObj.name == "icon" || transObj.name == "title") {
                        continue;
                    }
                    if (thisObject != null) {
                        thisObject[transObj.name] = transObj;
                    }
                    if (transObj instanceof fgui.GTextField && transObj.font) {
                    }
                    else if (transObj.name && transObj.name.indexOf("eglist_") == 0 && transObj instanceof fgui.GList) {
                        thisObject[transObj.name] = new long.EGList(transObj, thisObject);
                    }
                    else if (btns != null && transObj instanceof fgui.GButton) {
                        if (transObj.name && transObj.name.indexOf("spine_") == 0) {
                            let index = transObj.name.indexOf("_");
                        }
                        btns.push(transObj);
                    }
                    if (transObj instanceof fgui.GComponent) {
                        this.setVar(transObj, null, btns);
                    }
                }
            }
        }
    }
    long.FairyUtils = FairyUtils;
})(long || (long = {}));

(function (long) {
    class UrlUtils {
        constructor() { }
        static GetTemplateUrl(resName) {
            return UrlUtils.TEMPLATE + resName + UrlUtils.resLm;
        }
        static GetMusic(resName, isWav = false) {
            if (resName == "")
                return null;
            if (isWav || window["conch"]) {
                return UrlUtils.MUSIC + resName + UrlUtils.resWav;
            }
            else {
                return UrlUtils.MUSIC + resName + UrlUtils.resMP3;
            }
        }
        static GetSpineUrl(resName) {
            return UrlUtils.SPINE + resName + UrlUtils.resSk;
        }
        static getFairyPkg(resName, pkg = UrlUtils.UI) {
            let url = pkg + resName;
            return url;
        }
    }
    UrlUtils.RES = "res/";
    UrlUtils.MUSIC = "sound/";
    UrlUtils.TEMPLATE = UrlUtils.RES + "template/";
    UrlUtils.UI = UrlUtils.RES + "fgui/";
    UrlUtils.SPINE = UrlUtils.RES + "spine/";
    UrlUtils.resPng = ".png";
    UrlUtils.resJpg = ".jpg";
    UrlUtils.resMP3 = ".mp3";
    UrlUtils.resWav = ".wav";
    UrlUtils.resJson = ".json";
    UrlUtils.resLm = ".lm";
    UrlUtils.resLh = ".lh";
    UrlUtils.resLs = ".ls";
    UrlUtils.resSk = ".sk";
    UrlUtils.resLmat = ".lmat";
    UrlUtils.resAtlas = ".atlas";
    UrlUtils.version = "?" + (new Date()).getTime().toString();
    long.UrlUtils = UrlUtils;
})(long || (long = {}));
