/**
 * @author 3tion
 */
namespace jy {

    export const enum UnitResourceConst {

        /**
         * 单配置文件的路径
         */
        CfgFile = "d.json"
    }

    function setJTexture(bmp: egret.Bitmap, texture: egret.Texture) {
        bmp.texture = texture;
        let tx: number, ty: number;
        if (texture) {
            ({ tx, ty } = texture);
        }
        bmp.anchorOffsetX = tx || 0;
        bmp.anchorOffsetY = ty || 0;
    }


	/**
	 * 单位资源<br/>
	 * 图片按动作或者方向的序列帧，装箱处理后的图片位图资源<br/>
	 * 以及图片的坐标信息
	 */
    export class UnitResource {

        /**
         * 资源标识
         */
        key: string;
        /**
         * 加载列队
         */
        qid?: Res.ResQueueID;

        /**
         * 占位用的纹理
         */
        placehoder: egret.Texture;
        /**
         * 纹理的配置文件的加载地址
         */
        readonly url: string;
        readonly uri: string;
        /**
         * 资源打包分隔信息
         */
        readonly pst: PstInfo;

        state = RequestState.UNREQUEST;

        /**
         * 获取数据
         */
        private _datas: { [index: number]: egret.Texture[][] };

        constructor(key: string, pstInfo: PstInfo) {
            this.key = key;
            let uri = this.uri = key + "/" + UnitResourceConst.CfgFile;
            this.url = ConfigUtils.getResUrl(uri);
            this.pst = pstInfo;
        }

        /**
         * 解析数据
         */
        public decodeData(data: {}) {
            var _datas: { [index: number]: egret.Texture[][] } = {};
            for (let action in data) {
                let dData: egret.Texture[][] = [];
                _datas[action] = dData;
                let actData = data[action];
                if (!actData) continue;
                for (let d = 0, len = actData.length; d < len; d++) {
                    let fData: egret.Texture[] = [];
                    dData[d] = fData;
                    let dirData: any[] = actData[d];
                    if (!dirData) continue;
                    for (let f = 0, flen = dirData.length; f < flen; f++) {
                        if (dirData[f] !== 0) {
                            fData[f] = getTextureFromImageData(dirData[f]);
                        }
                    }
                }
            }
            this._datas = _datas;
            this.state = RequestState.COMPLETE;
            return;
            /**
             * 从数据中获取纹理
             */
            function getTextureFromImageData(data) {
                var texture = new egret.Texture();
                var sx: number = data[0];
                var sy: number = data[1];
                texture.tx = data[2] || 0;
                texture.ty = data[3] || 0;
                var width: number = data[4];
                var height: number = data[5];
                texture.$initData(sx, sy, width, height, 0, 0, width, height, width, height);
                return texture;
            }
        }

        /**
         * 加载数据
         */
        public loadData() {
            if (this.state == RequestState.UNREQUEST) {
                this.state = RequestState.REQUESTING;
                Res.load(this.uri, this.url, CallbackInfo.get(this.dataLoadComplete, this), this.qid);
            }
        }

        /**
         * 资源加载完成
         */
        dataLoadComplete(item: Res.ResItem) {
            let { uri, data } = item;
            if (uri == this.uri) {
                this.decodeData(data);
            }
        }

        /**
         * 将资源渲染到位图容器中
         * 
         * @param {egret.Bitmap} bitmap 要被绘制的位图
         * @param {IDrawInfo} drawInfo  绘制信息
         * @param {number} now 当前时间戳
         * @returns {boolean} true 表示绘制成功
         *                    其他情况标识绘制失败
         * @memberof UnitResource
         */
        draw(bitmap: egret.Bitmap, drawInfo: IDrawInfo, now: number) {
            let frame = this.getTexture(drawInfo);
            if (frame) {
                let { a, d } = drawInfo;
                let res = this.loadRes(d, a);
                res.lastUseTime = Global.now;
                if (frame.bitmapData) {
                    setJTexture(bitmap, frame);
                    return true;
                } else {
                    if (res.state == RequestState.COMPLETE) {
                        res.bindTexture(frame);
                    }
                }
            }
            setJTexture(bitmap, this.placehoder);
        }

        /**
         * 根据 `动作``方向``帧数`获取纹理数据
         * @param info 
         */
        getTexture(info: IDrawInfo) {
            const datas = this._datas;
            if (datas) {
                const { a, f, d } = info;
                let dDatas = datas[a];
                if (dDatas) {
                    let frames = dDatas[d];
                    if (frames) {
                        var frame = frames[f];
                        if (frame) {
                            return frame;
                        }
                    }
                }
            }
        }

        loadRes(direction: number, action: number) {
            let r = this.pst.getResKey(direction, action);
            let uri = this.getUri2(r);
            return ResManager.get(uri, this.noRes, this, uri, r);
        }

        noRes(uri: string, r: string) {
            let tmp = new SplitUnitResource(uri, this.getUrl(uri));
            tmp.qid = this.qid;
            tmp.bindTextures(this._datas, this.pst.getADKey(r));
            tmp.load();
            return tmp;
        }
        getUri(direction: number, action: number) {
            return this.getUri2(this.pst.getResKey(direction, action));
        }

        getUri2(resKey: string) {
            return this.key + "/" + resKey + Ext.PNG;
        }
        getUrl(uri: string) {
            return ConfigUtils.getResUrl(uri + Global.webp);
        }
        isResOK(direction: number, action: number) {
            let uri = this.getUri(direction, action);
            let res = ResManager.getResource(uri) as SplitUnitResource;
            return !!(res && res.bmd);
        }

        /**
         * 遍历Res所有资源
         * @param { (uri: string, adKey: number): any } forEach 如果 forEach 方法返回 真 ，则停止遍历
         */
        checkRes(forEach: { (uri: string, adKey: number): any }) {
            const dict = this.pst.splitInfo.adDict;
            for (let resKey in dict) {
                let uri = this.getUri2(resKey);
                if (forEach(uri, dict[resKey])) {
                    return
                }
            }
        }
    }
}
