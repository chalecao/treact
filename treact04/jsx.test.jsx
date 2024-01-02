import { describe, it, expect } from 'vitest';
import * as Treact from './Treact';

describe('async render Function Component', () => {
    it('render with act', async () => {
        function App({title, children}){
            return (
              <div>
                <h3>{title}</h3>
                {children}
              </div>
            );
          }
        const container = document.createElement('div');
        const root = Treact.createRoot(container);
        await Treact.act(() => {
            root.render(<App title="w3cdoc">
                <App title="hello"></App>
            </App>);
            expect(container.innerHTML).toBe('');
        });
        console.log('container.innerHTML', container.innerHTML);
        expect(container.innerHTML).toBe('<div><h3>w3cdoc</h3><div><h3>hello</h3></div></div>');
    })
})