
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
export function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.flat().map(child => {
                if (typeof child != 'object') {
                    return {
                        type: 'HostText',
                        props: {
                            nodeValue: child,
                            children: []
                        }
                    }
                } else {
                    return child;
                }
            })
        }
    }
}

let workInProgress = null;     // 当前fiber节点
let workInProgressRoot = null; // fiber root节点
let currentHookFiber = null;
let currentHookFiberIndex = 0;

const isEvent = (key) => /^on/.test(key);
const filerProps = (key) => !isEvent(key) && key != 'children';

const isNew = (old, next) => (key) => !(key in old.props) && (key in next.props);
const isChanged = (old, next) => (key) => (key in old.props) && (key in next.props) && old.props[key] != next.props[key];
const isDelete = (old, next) => (key) => (key in old.props) && !(key in next.props);

class TreactRoot {
    _internalRoot = null;
    constructor(container) {
        // this.container = container;
        this._internalRoot = {
            current: null,
            containerInfo: container
        }
    }
    render(element) {
        // this.renderElement(element, this.container);
        this._internalRoot.current = {
            alternate: {
                stateNode: this._internalRoot.containerInfo,
                props: {
                    children: [element]
                }
            }
        }
        workInProgressRoot = this._internalRoot;
        workInProgress = this._internalRoot.current.alternate;
        // setTimeout(this.workloop.bind(this));
        window.requestIdleCallback(workloop, { timeout: 100 });
    }
}
function workloop() {
    if (workInProgress) {
        workInProgress = performUnitOfWork(workInProgress);
        window.requestIdleCallback(workloop, { timeout: 100 });
    }
    if (!workInProgress && workInProgressRoot.current.alternate) {
        commitRoot();
    }
}
/**
 * 1. 处理当前执行的fiber节点，插入到父级中
 * 2. 初始化children中的fiber节点，返回下一个要执行的fiber节点next
 */
function performUnitOfWork(fiber) {
    // console.log('fiber props', fiber.props, fiber.props == null ? JSON.stringify(fiber.return.props.children) : '');
    const isFunctionComp = fiber.type instanceof Function;
    if (isFunctionComp) {
        currentHookFiber = fiber;
        currentHookFiber.memorizedState = [];
        currentHookFiberIndex = 0;
        fiber.props.children = [fiber.type(fiber.props)];
    } else {
        if (!fiber.stateNode) {
            fiber.stateNode = fiber.type === 'HostText' ? document.createTextNode('') : document.createElement(fiber.type);
        }
    }
    reconcile(fiber);
    return getNextFiber(fiber);
}
function reconcile(fiber, needHandleProps) {
    // 用链表处理child
    let preSibling = null;
    // dom diff: mount/update/delete
    let oldFiber = fiber.alternate?.child;
    // fiber.props?.children.forEach((child, idx) => {
    let idx = 0;
    while (idx < fiber.props?.children.length || oldFiber) {
        const child = fiber.props?.children[idx];
        let newFiber = null;
        let isSameType = oldFiber && child && oldFiber.type == child.type;
        if (child && (!oldFiber || !isSameType)) {
            // mount
            newFiber = {
                type: child.type,
                stateNode: null,
                props: child.props,
                return: fiber,
                alternate: null,
                child: null,
                sibling: null,
                effectTag: 'PLACEMENT'
            }
        } else if (isSameType && oldFiber) {
            // update
            newFiber = {
                type: child.type,
                stateNode: oldFiber.stateNode,
                props: child.props,
                return: fiber,
                alternate: oldFiber,
                child: null,
                sibling: null,
                effectTag: 'UPDATE'
            }
        } else if (!isSameType && oldFiber) {
            // delete 
            oldFiber.effectTag = 'DELETE';
            if (!workInProgressRoot.deleteFibers) workInProgressRoot.deleteFibers = [];
            workInProgressRoot.deleteFibers.push(oldFiber);
        }

        if (idx == 0) {
            fiber.child = newFiber;
        } else {
            preSibling && (preSibling.sibling = newFiber);
        }
        if (oldFiber) {
            oldFiber = oldFiber.sibling;
        }
        preSibling = newFiber;

        idx++;
    }
}
/**
 * 遍历顺序
 * child-》sibling
 */
function getNextFiber(fiber) {
    if (fiber.child) {
        return fiber.child;
    }
    let nextFiber = fiber;
    while (nextFiber) {
        if (nextFiber.sibling) {
            return nextFiber.sibling;
        } else {
            nextFiber = nextFiber.return;
        }
    }
    return null;
}

function commitRoot() {
    // 删除节点
    if(workInProgressRoot.deleteFibers){
        workInProgressRoot.deleteFibers?.forEach(commitDOM);
        workInProgressRoot.deleteFibers = [];
    }
    // 处理DOM挂载
    commitDOM(workInProgressRoot.current.alternate.child);
    // fiber节点render之后，交换alternate
    workInProgressRoot.current = workInProgressRoot.current.alternate;
    workInProgressRoot.current.alternate = null;
}

function commitDOM(fiber) {
    let tempParenNode = null;
    if (fiber.return && fiber.stateNode) {
        tempParenNode = fiber.return;
        while (!tempParenNode.stateNode) {
            tempParenNode = tempParenNode.return;
        }
    }
    if (tempParenNode && fiber.effectTag === 'PLACEMENT') {
        updateDom({ props: {} }, fiber);
        tempParenNode.stateNode.appendChild(fiber.stateNode);
    } else if (tempParenNode && fiber.effectTag === 'UPDATE') {
        updateDom(fiber.alternate, fiber);
    } else if (tempParenNode && fiber.effectTag === 'DELETE') {
        deleteDOM(tempParenNode, fiber);
    }
    if (fiber.child) {
        commitDOM(fiber.child);
    }
    if (fiber.sibling) {
        commitDOM(fiber.sibling);
    }
}

function deleteDOM(parent, fiber) {
    if (fiber.stateNode) {
        // 函数式
        if (parent.stateNode.contains(fiber.stateNode)) {
            parent.stateNode.removeChild(fiber.stateNode);
        }
    } else {
        deleteDOM(parent, fiber.child);
    }
}

function updateDom(pre, next) {
    //事件处理
    Object.keys(pre.props).filter(isEvent).filter(
        key => isDelete(pre, next)(key) || isChanged(pre, next)(key)
    ).forEach(key => {
        const eventName = key.toLowerCase().substring(2);
        next.stateNode.removeEventListener(eventName, next.props[key]);
    });
    Object.keys(next.props).filter(isEvent).filter(
        key => isNew(pre, next)(key) || isChanged(pre, next)(key)
    ).forEach(key => {
        const eventName = key.toLowerCase().substring(2);
        next.stateNode.addEventListener(eventName, next.props[key]);
    });
    // 属性处理
    Object.keys(pre.props).filter(filerProps).filter(
        key => isDelete(pre, next)(key)
    ).forEach(key => {
        next.stateNode[key] = '';
    });
    Object.keys(next.props).filter(filerProps).filter(
        key => isNew(pre, next)(key) || isChanged(pre, next)(key)
    ).forEach(key => {
        next.stateNode[key] = next.props[key];
    });
}

export function createRoot(container) {
    return new TreactRoot(container);
}

export function act(callback) {
    callback();
    return new Promise((resolve, reject) => {
        function detect() {
            if (workInProgress) {
                window.requestIdleCallback(detect);
            } else {
                resolve(true);
            }
        }
        detect();
    });

}
export function useState(initialState) {
    const oldHook = currentHookFiber.alternate?.memorizedState[currentHookFiberIndex];
    const hook = {
        state: oldHook ? oldHook.state : initialState,
        queue: [],
        dispatch: oldHook ? oldHook.dispatch : null,
    }

    //todo: 执行所有hooks
    const actions = oldHook ? oldHook.queue : [];
    actions.forEach(action => {
        if (typeof action === 'function') {
            hook.state = action(hook.state);
        } else {
            hook.state = action;
        }
    })

    const setState = oldHook?.dispatch ? oldHook.dispatch : (action) => {
        hook.queue.push(action);
        // start re-render
        workInProgressRoot.current.alternate = {
            stateNode: workInProgressRoot.containerInfo,
            props: workInProgressRoot.current.props,
            alternate: workInProgressRoot.current,
        }
        workInProgress = workInProgressRoot.current.alternate;
        window.requestIdleCallback(workloop, { timeout: 100 });
    }

    currentHookFiber.memorizedState.push(hook);
    currentHookFiberIndex++;
    return [hook.state, setState];
}

export function useReducer(reduce, initialState) {
    const [state, setState] = useState(initialState);
    const dispatch = (action) => {
        setState(state => reduce(state, action))
    }
    return [state, dispatch]
}
