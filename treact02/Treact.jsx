export function createElement(type, props, ...children) {
    return {
        type,
        props: {
            ...props,
            children: children.map(child=>{
                if(typeof child != 'object'){
                    return {
                        type: 'HostText',
                        props:{
                            nodeValue: child,
                            children:[]
                        }
                    }
                }else{
                    return child;
                }
            })
        }
    }
}

class TreactRoot {
    constructor(container) {
        this.container = container;
    }
    render(element) {
        this.renderElement(element, this.container);
    }
    renderElement(ele, parent) {
        const node = ele.type === 'HostText'?document.createTextNode(''):document.createElement(ele.type);
        Object.keys(ele.props).filter(key => key != 'children').forEach(key => {
            node[key] = ele.props[key];
        })
        ele.props.children.forEach(child => {
            this.renderElement(child, node);
        })
        parent.appendChild(node);
    }
}

export function createRoot(container) {
    return new TreactRoot(container);
}