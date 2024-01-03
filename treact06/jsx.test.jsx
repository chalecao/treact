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
      // console.log('container.innerHTML', container.innerHTML);
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

    // console.log('globalObj.count', globalObj.count);
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
    // console.log('globalObj.count', globalObj.count);
    expect(globalObj.count).toBe(11);

    await Treact.act(() => {
      globalObj.dispatch({type: 'sub'});
    });
    // console.log('globalObj.count', globalObj.count);
    expect(globalObj.count).toBe(10);
  });
})

describe('event handler test', () => {
  it('add event', async () => {
    const globalObj = {};

    function App() {
      const [count, setCount] = Treact.useState(0);
      globalObj.count = count;
      return (
        <div className="button" onClick={()=>{setCount(count+1)}}>{count}</div>
      );
    }
    const container = document.createElement('div');
    const root = Treact.createRoot(container);
    await Treact.act(() => {
      root.render(<App />);
      expect(container.innerHTML).toBe('');
    });
    
    await Treact.act(() => {
      container.querySelector('.button').click();
    });
    console.log('globalObj.count', globalObj.count);
    expect(globalObj.count).toBe(1);
  });

  it('render and commit', async () => {
    const globalObj = {};

    function App() {
      const [count, setCount] = Treact.useState(0);
      globalObj.count = count;

      const getLi = ()=>{
        let arr=[];
        for(let i=0; i< count; i++){
          arr.push(<li>{i}</li>);
        }
        return arr
      }
      return (
        <div className="button" onClick={()=>{setCount(count=>count+1)}}>
          {count}
          <ol>
            {getLi()}
          </ol>
        </div>
      );
    }
    const container = document.createElement('div');
    const root = Treact.createRoot(container);
    await Treact.act(() => {
      root.render(<App />);
      expect(container.innerHTML).toBe('');
    });
    
    await Treact.act(() => {
      container.querySelector('.button').click();
      container.querySelector('.button').click();
    });
    
    console.log('container.innerHTML', container.innerHTML);
    expect(globalObj.count).toBe(2);
    expect(container.innerHTML).toBe('<div class="button">2<ol><li>0</li><li>1</li></ol></div>');
  });
  it('update and delete', async () => {
    const globalObj = {};

    function App() {
      const [count, setCount] = Treact.useState(0);
      globalObj.count = count;

      const getLi = ()=>{
        let arr=[];
        for(let i=0; i< count; i++){
          arr.push(<li>{i}</li>);
        }
        return arr
      }
      return (
        <div >
          <span className="add" onClick={()=>{setCount(count=>count+1)}}>+</span>
          <span className="del" onClick={()=>{setCount(count=>count-1)}}>-</span>
          {count}
          <ol>
            {getLi()}
          </ol>
        </div>
      );
    }
    const container = document.createElement('div');
    const root = Treact.createRoot(container);
    await Treact.act(() => {
      root.render(<App />);
      expect(container.innerHTML).toBe('');
    });
    
    await Treact.act(() => {
      container.querySelector('.add').click();
      container.querySelector('.add').click();
    });
    console.log('container.innerHTML', container.innerHTML);
    expect(globalObj.count).toBe(2);
    expect(container.innerHTML).toBe('<div><span class="add">+</span><span class="del">-</span>2<ol><li>0</li><li>1</li></ol></div>');
    await Treact.act(() => {
      container.querySelector('.del').click();
      container.querySelector('.del').click();
    });
    console.log('container.innerHTML', container.innerHTML);
    expect(globalObj.count).toBe(0);
    expect(container.innerHTML).toBe('<div><span class="add">+</span><span class="del">-</span>0<ol></ol></div>');
  });
})


