"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFadeOutTransition = exports.createFadeInTransition = void 0;
const createFadeInTransition = (duration = 1000) => (ctx, progress) => {
    ctx.globalAlpha = Math.min(1, progress * duration / 1000);
};
exports.createFadeInTransition = createFadeInTransition;
const createFadeOutTransition = (duration = 1000) => (ctx, progress) => {
    ctx.globalAlpha = Math.max(0, 1 - (progress * duration / 1000));
};
exports.createFadeOutTransition = createFadeOutTransition;
