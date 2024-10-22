"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entity = void 0;
class Entity {
    constructor(key, w, h, props, action) {
        this.key = key;
        this.props = props;
        this.action = action;
        this.canvas = document.createElement("canvas");
        this.canvas.width = w;
        this.canvas.height = h;
        this.ctx = this.canvas.getContext("2d");
    }
    copyToCanvas(targetCanvas) {
        const targetCtx = targetCanvas.getContext("2d");
        if (targetCtx) {
            targetCtx.drawImage(this.canvas, 0, 0);
        }
    }
    update(timeStamp) {
        var _a;
        (_a = this.ctx) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.action && this.ctx && this.props)
            this.action(timeStamp, this.ctx, this.props);
    }
}
exports.Entity = Entity;
