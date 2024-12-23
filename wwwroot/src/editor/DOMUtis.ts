


export class DOMUtils {
    static get<T extends HTMLElement>(query: string, parent?: Element): T {
        return parent ? parent.querySelector(query) as T : document.querySelector(query) as T
    }
    static getAll(query: string, parent?: Element): Array<Element> {
        var results = new Array<Element>();
        let queryResult = parent ? parent.querySelectorAll(query) : document.querySelectorAll(query)
        for (let i = 0; i < queryResult.length; i++) results.push(queryResult.item(i));
        return results;
    }
    static on<T extends HTMLElement>(event: string, element: string | HTMLElement, fn: (event?: any, el?: T) => void, options?: AddEventListenerOptions): T {
        typeof (element) === "string" ? element = DOMUtils.get<T>(element) : element = element;
        element.addEventListener(event, (e: Event) => {
            fn(e, element as T);
        }, options);
        return element as T;
    }
    static removeChilds(parent:HTMLElement):void{
        while (parent.firstChild) {
            parent.firstChild.remove()
        }
    }

    static toggleClasses(element: string | HTMLElement, classes:string[]):DOMUtils {
        typeof (element) === "string" ? element = DOMUtils.get(element) : element = element;
        classes.forEach(className => {
            ((element) as HTMLElement).classList.toggle(className);
        });
        return this
    }

    static create<T extends HTMLElement>(p: string | T, textContent?: string): T {
        let node: T;
        typeof (p) === "string" ? node = document.createElement(p) as T : node = p;
        if (textContent)
            node.textContent = textContent;
        
        return node;
    }

    static prettify(text:string):string{
        let result = text.replace(/^["'](.+(?=["']$))["']$/, '$1'); // remove qoutes at start and end of string
        return result;
    }

    static linkify(text: string) {    
        text = DOMUtils.prettify(text);
        const regex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(regex, (url: string) => {
            return `<a href="${url}" target="_blank">${url}</a>`;
        });
    }

    static truncString(text:string,maxLength:number,ellipsis:string = "..."){   
        if (!text || maxLength <= 0) return ""; 
        // Base case (no truncation):
        if (text.length <= maxLength) return text;
        // Calculate truncation point:
        const truncatedLength = Math.max(0, maxLength - ellipsis.length); 
        return text.slice(0, truncatedLength) + ellipsis;
      }
      


    static toDOM(html: string): any {
        var d = document, i, a = d.createElement("div"), b = d.createDocumentFragment();
        a.innerHTML = html;
        while (i = a.firstChild)
            b.appendChild(i);
        return b;
    }



}