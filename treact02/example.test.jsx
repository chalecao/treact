import { describe, expect, it } from "vitest";
import * as Treact from './Treact1';

describe('test jsx', ()=>{

    it('jsx should compile', ()=>{
        const ele = (
            <div className="hello-div">
                hello
                <p>world</p>
            </div>
        );
        // console.log('----');
        // console.log(JSON.stringify(ele));
        expect(JSON.stringify(ele)).toBe('{"type":"div","props":{"className":"hello-div","children":[{"type":"HostText","props":{"nodeValue":"hello","children":[]}},{"type":"p","props":{"children":[{"type":"HostText","props":{"nodeValue":"world","children":[]}}]}}]}}');
    })

    it('jsx should render', ()=>{
        const ele = (
            <div className="hello-div">
                hello
                <p>world</p>
            </div>
        );

        const container = document.createElement('div');
        const root = Treact.createRoot(container);
        root.render(ele);
        // console.log(container.innerHTML);
        expect(container.innerHTML).equals('<div class="hello-div">hello<p>world</p></div>')
    })

})