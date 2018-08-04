import flatten from 'array-flatten';

export function waitForLoad(condition, optionalDocument) {

  const document = optionalDocument || window.document;

  return new Promise(res => {

    if (condition()) {
      return res();
    }

    const observer = new MutationObserver(() => {
      if (condition()) {
        res();
        observer.disconnect();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  });

}

export function constructButton(textContent, id, iClassName, onclick) {
  let elem = document.createElement('button');
  let i = document.createElement('i');
  let text = document.createTextNode(textContent);
  elem.id = id;
  elem.className = 'btn btn-sm btn-default';
  i.className = iClassName;
  elem.style = 'color:#000';
  i.style = 'visibility: visible; margin-right: 5px';
  if (iClassName) {
    elem.appendChild(i);
export function createElement(tagName, props, ...children) {
  const elem = document.createElement(tagName);

  for (const propName in props) {
    const prop = props[propName];
    if (/^on[A-Z]/.test(propName)) {
      let listener;
      let opts = {};
      if (typeof prop === 'function') {
        listener = prop;
      } else {
        // bogus error
        listener = prop.listener; // eslint-disable-line prefer-destructuring
        Object.assign(opts, prop);
      }
      elem.addEventListener(propName.slice(2).toLowerCase(), listener, opts);
    } else if (propName === 'dataset') {
      Object.assign(elem.dataset, prop);
    } else if (propName === 'style') {
      for (const styleProp in prop) {
        if (styleProp.includes('-')) {
          elem.style.setProperty(styleProp, prop[styleProp]);
        } else {
          elem.style[styleProp] = prop[styleProp];
        }
      }
    } else {
      elem[propName] = prop;
    }
  }

  for (let child of flatten(children)) {
    if (typeof child === 'string') {
      child = document.createTextNode(child);
    }
    elem.appendChild(child);
  }
  elem.appendChild(text);
  elem.addEventListener('click', onclick);

  return elem;
}

export function hasParentWithClassName(element, classnames) {
  const containsClass = c => element.className.split(' ').indexOf(c) >= 0;
  if (element.className && classnames.filter(containsClass).length > 0) {
    return true;
  }
  return element.parentNode && hasParentWithClassName(element.parentNode, classnames);
}

export function insertCss(css) {
  const styleElem = document.createElement('style');
  styleElem.textContent = css;
  document.head.appendChild(styleElem);
  return {
    remove() {
      if (styleElem && styleElem.parentNode) {
        styleElem.remove();
      }
    },
  };
}

export function createElementFromHTML(htmlString, parent) {
  parent = parent || document.createElement('div');
  parent.innerHTML = htmlString.trim();
  return parent.firstChild;
}

export function addEventListeners(nodes, event, callback) {
  for (const node of nodes) {
    node.addEventListener(event, callback);
  }
}
