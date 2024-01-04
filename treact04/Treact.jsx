
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
            children: children
            .flat()
            .map(child => {
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

class TreactRoot {
    _internalRoot = null;
    constructor(container) {
        // this.container = container;
        this._internalRoot = {
            current: null,
            containerInfo: container
        }
    }
    workloop() {
        if (workInProgress) {
            workInProgress = this.performUnitOfWork(workInProgress);
            window.requestIdleCallback(this.workloop.bind(this), { timeout: 100 });
        }
    }
    /**
     * 1. 处理当前执行的fiber节点，插入到父级中
     * 2. 初始化children中的fiber节点，返回下一个要执行的fiber节点next
     */
    performUnitOfWork(fiber) {
        console.log('fiber props', fiber.props,fiber.props==null?JSON.stringify(fiber.return.props.children):'' );

        const isFunctionComp = fiber.type instanceof Function;
        if (isFunctionComp) {
            fiber.props.children = [fiber.type(fiber.props)];
        } else {
            if (!fiber.stateNode) {
                fiber.stateNode = fiber.type === 'HostText' ? document.createTextNode('') : document.createElement(fiber.type);
                Object.keys(fiber.props).filter(key => key != 'children').forEach(key => {
                    fiber.stateNode[key] = fiber.props[key];
                })
            }

            if (fiber.return) {
                let tempParenNode = fiber.return;
                while (!tempParenNode.stateNode) {
                    tempParenNode = tempParenNode.return;
                }
                tempParenNode.stateNode.appendChild(fiber.stateNode);
            }
        }
        // 用链表处理child
        let preSibling = null;
        fiber.props.children.forEach((child, idx) => {
            const fiberChild = {
                type: child.type,
                stateNode: null,
                props: child.props,
                return: fiber,
            }
            if (idx == 0) {
                fiber.child = fiberChild;
            } else {
                preSibling.sibling = fiberChild;
            }
            preSibling = fiberChild;
        })

        return this.getNextFiber(fiber);
    }
    /**
     * 遍历顺序
     * child-》sibling
     */
    getNextFiber(fiber) {
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
        window.requestIdleCallback(this.workloop.bind(this), { timeout: 100 });
    }
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