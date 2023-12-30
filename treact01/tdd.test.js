import {describe, it, expect} from 'vitest';

function wait(item){
    return new Promise((resolve, reject)=>{
        setTimeout(()=>{
            resolve(1);
        }, 500);
    });
}

describe('Tdd Test',()=>{
    it('sync works', ()=>{
        const a = 'hello world';
        expect('hello world').toBe(a);
        expect('hello world').equals(a);
    });

    it('async works', async()=>{
        const a = await wait();
        expect(a).toBe(1);
    })
})
