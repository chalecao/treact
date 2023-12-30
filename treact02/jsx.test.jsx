import {describe, it, expect} from 'vitest';
import * as Treact from './Treact';

function wait(item){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(1);
        }, 500);
    });
}

describe('jsx Test',()=>{
    it('build jsx', ()=>{
        const ele = (
        <div className="container">
            <span>hello</span>
            <a>w3cdoc.com</a>
        </div>);
        // console.log(JSON.stringify(ele));
    })
    
    it('build virtual DOM', ()=>{
        const ele = (
        <div className="container">
            <span>hello</span>
            <a>w3cdoc.com</a>
        </div>);
        const container = document.createElement('div');
        const root = Treact.createRoot(container);
        root.render(ele);
        expect(root.container.innerHTML).toBe('<div class="container"><span>hello</span><a>w3cdoc.com</a></div>');
    })
})