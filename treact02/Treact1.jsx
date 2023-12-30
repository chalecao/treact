

class TreactRoot{
    constructor(container){
        this.container = container;
    }
    render(ele){  //{type, props:{...other,children}}
        this.renderImpl(ele, this.container);
    }
    renderImpl(ele, parent){
        // console.log('ele.props', ele);
        const dom = ele.type === 'HostText'?document.createTextNode(''): document.createElement(ele.type);
        
        Object.keys(ele.props).filter(key=> key !== 'children').forEach(key => {
            dom[key] = ele.props[key];
        });
        ele.props.children.forEach(child=>{
            this.renderImpl(child, dom);
        })
        parent.appendChild(dom);
    }
}


export function createRoot(container){
    return new TreactRoot(container);
}

export function createElement(type, props, ...children){
    return {
        type, 
        props:{
            ...props,
            children: children.map(child=>{
                if(typeof child !== 'object'){
                    return {
                        type:'HostText',
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
