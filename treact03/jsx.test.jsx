import { describe, it, expect } from 'vitest';
import * as Treact from './Treact';
import { vi } from 'vitest'

// 定义 requestIdleCallback 的兼容处理，不执行则用setTimeout模拟实现
window.requestIdleCallback = window.requestIdleCallback || function (handler) {
    // 闭包，创建的时候记录一下时间
    let startTime = Date.now();
    return setTimeout(function () {
        handler({
            didTimeout: false,
            timeRemaining: function () {
                // 理论上系统给你空闲的时间会低于50ms，所以你的任务最好不要超过50ms，否则还是会卡顿
                return Math.max(0, 50.0 - (Date.now() - startTime));
            }
        });
    }, 1);
};
// 取消任务
window.cancelIdleCallback = window.cancelIdleCallback || function (id) {
    clearTimeout(id);
};

vi.stubGlobal('requestIdleCallback', window.requestIdleCallback)
vi.stubGlobal('cancelIdleCallback', window.cancelIdleCallback)


function wait() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve(1);
        }, 500);
    });
}

describe('async render', () => {
    it('render in async', async () => {
        const ele = (
            <div className="container">
                <span>hello</span>
                <a>w3cdoc.com</a>
            </div>);
        const container = document.createElement('div');
        const root = Treact.createRoot(container);
        root.render(ele);
        // console.log(root);
        expect(container.innerHTML).toBe('');
        await wait();
        console.log('container.innerHTML', container.innerHTML);
        expect(container.innerHTML).toBe('<div class="container"><span>hello</span><a>w3cdoc.com</a></div>');
    })
    it('render with act', async () => {
        const ele = (
            <div className="container">
                <span>hello</span>
                <a>w3cdoc.com</a>
            </div>);
        const container = document.createElement('div');
        const root = Treact.createRoot(container);
        await Treact.act(() => {
            root.render(ele);
            // console.log(root);
            expect(container.innerHTML).toBe('');
        });
        console.log('container.innerHTML', container.innerHTML);
        expect(container.innerHTML).toBe('<div class="container"><span>hello</span><a>w3cdoc.com</a></div>');
    })
})