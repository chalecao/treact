export function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child => {
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
        while (workInProgress) {
            workInProgress = this.performUnitOfWork(workInProgress);
        }
    }
    /**
     * 1. 处理当前执行的fiber节点，插入到父级中
     * 2. 初始化children中的fiber节点，返回下一个要执行的fiber节点next
     */
    performUnitOfWork(fiber) {
        if (!fiber.stateNode) {
            fiber.stateNode = fiber.type === 'HostText' ? document.createTextNode('') : document.createElement(fiber.type);
            Object.keys(fiber.props).filter(key => key != 'children').forEach(key => {
                fiber.stateNode[key] = fiber.props[key];
            })
        }
        if(fiber.return){
            fiber.return.stateNode.appendChild(fiber.stateNode);
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
            if(idx == 0){
                fiber.child = fiberChild;
            }else{
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
    getNextFiber(fiber){
        if(fiber.child){
            return fiber.child;
        }

        let nextFiber = fiber;
        while(nextFiber){
            if(nextFiber.sibling){
                return nextFiber.sibling;
            }else{
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
                props:{
                    children: [element]
                }
            }
        }
        workInProgressRoot = this._internalRoot;
        workInProgress = this._internalRoot.current.alternate;
        setTimeout(this.workloop.bind(this));
    }
}

export function createRoot(container) {
    return new TreactRoot(container);
}