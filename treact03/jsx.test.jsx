import {describe, it, expect} from 'vitest';
import * as Treact from './Treact';

function wait(){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(1);
        }, 500);
    });
}

describe('async render',()=>{
    it('render in async', async ()=>{
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
        expect(container.innerHTML).toBe('<div class="container"><span>hello</span><a>w3cdoc.com</a></div>');
    })
})