
namespace long {

    /**
     * 日志类
     */
    export class Logger {

        private static readonly isNet: boolean = false;

        /**是否显示日志 */
        public static isShowLog: boolean = false;

        public constructor() {
        }

        public static log(obj: any, str: any): void {
            if (Logger.isShowLog) {
                Logger.outPut("[log] [" + Logger.getClassName(obj) + "] " + str);
            }
        }

        public static debug(obj: any, str: any): void {

            let info = "[debug] [" + Logger.getClassName(obj) + "] " + str;
            if (Laya.Browser.onHWMiniGame || Laya.Browser.onTTMiniGame || Laya.Browser.onMiniGame || Laya.Browser.onVVMiniGame) {
                console.info(info);
            } else {
                console.debug(info);
            }
        }

        public static net(obj: any, str: any): void {
            if (Logger.isShowLog && Logger.isNet) {
                Logger.outPut("[net] [" + Logger.getClassName(obj) + "] " + str);
            }
        }

        public static error(obj: any, str: any): void {
            let info = "[debug] [" + Logger.getClassName(obj) + "] " + str;
            console.error(info);
        }

        public static warning(obj: any, str: any): void {
            if (Logger.isShowLog) {
                Logger.outPut("[warning] [" + Logger.getClassName(obj) + "] " + str);
            }
        }
        private static outPut(value: any): void {
            console.info(value);
        }

        private static getClassName(target: any): string {
            if (typeof target === "string") {
                return target;
            }
            if (target && target.constructor.name === "Function") {
                if (target.name) {
                    return target.name;
                } else {
                    console.error("Logger.getClassName 错误!!!");
                }
            }
            return target && target.constructor.name;
        }
    }
}