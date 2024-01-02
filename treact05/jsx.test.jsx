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

describe('fiber useState test', () => {
  it('render useState', async () => {
    const globalObj = {};

    function App({ title, children }) {
      const [count, setCount] = Treact.useState(0);
      globalObj.count = count;
      globalObj.setCount = setCount;
      return (
        <div>{count}</div>
      );
    }
    const container = document.createElement('div');
    const root = Treact.createRoot(container);
    await Treact.act(() => {
      root.render(<App />);
      expect(container.innerHTML).toBe('');
    });

    await Treact.act(() => {
      globalObj.setCount(count => count + 1);
    });

    await Treact.act(() => {
      globalObj.setCount(globalObj.count + 1);
    });

    console.log('globalObj.count', globalObj.count);
    expect(globalObj.count).toBe(2);
  });
})
describe('fiber useReducer test', () => {
  it('render useReducer', async () => {
    const globalObj = {};

    function reducer(state, action){
      switch(action.type){
        case 'add': return state + 1;
        case 'sub': return state - 1;
        default: return state;
      }
    }
    function App() {
      const [count, dispatch] = Treact.useReducer(reducer, 10);
      globalObj.count = count;
      globalObj.dispatch = dispatch;
      return (
        <div>{count}</div>
      );
    }
    const container = document.createElement('div');
    const root = Treact.createRoot(container);
    await Treact.act(() => {
      root.render(<App />);
      expect(container.innerHTML).toBe('');
    });
    
    await Treact.act(() => {
      globalObj.dispatch({type: 'add'});
    });
    console.log('globalObj.count', globalObj.count);
    expect(globalObj.count).toBe(11);

    await Treact.act(() => {
      globalObj.dispatch({type: 'sub'});
    });
    console.log('globalObj.count', globalObj.count);
    expect(globalObj.count).toBe(10);
  });
})