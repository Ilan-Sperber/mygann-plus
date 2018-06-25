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

export async function registerListeners(elemsFunc, listener) {
  // elemsFunc returns an array of elements, not a NodeList
  waitForLoad(() => elemsFunc().every(e => !!e)) // every element is defined
    .then(() => {
      elemsFunc().forEach(e => e.addEventListener('click', listener));
    });
}

// gets list of already loaded elements by their IDs
export function getElementsByIds(ids) { return ids.map(id => document.getElementById(id)); }
// gets list of unloaded elements by their IDS; is async
export async function getUnloadedElementsByIds(ids) {
  await waitForLoad(() => ids.every(id => document.getElementById(id)));
  return getElementsByIds(ids);
}

export function constructButton(innerText, id, iClassName, onclick) {
  let elem = document.createElement('button');
  let i = document.createElement('i');
  let text = document.createTextNode(innerText);
  elem.id = id;
  elem.className = 'btn btn-sm btn-default';
  i.className = iClassName;
  elem.style = 'color:#000';
  i.style = 'visibility: visible;';
  elem.appendChild(i);
  elem.appendChild(text);
  elem.addEventListener('click', onclick);
  return elem;
}

export function nodeListToArray(nodeList) {
  return [].slice.call(nodeList);
}

export function hasParentWithClassName(element, classnames) {
  const containsClass = c => element.className.split(' ').indexOf(c) >= 0;
  if (element.className && classnames.filter(containsClass).length > 0) {
    return true;
  }
  return element.parentNode && hasParentWithClassName(element.parentNode, classnames);
}

export function insertAfter(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
export function insertBefore(referenceNode, newNode) {
  referenceNode.parentNode.insertBefore(newNode, referenceNode);
}

export function insertCss(css) {
  const styleElem = document.createElement('style');
  styleElem.innerText = css;
  document.head.appendChild(styleElem);
}

export function createElementFromHTML(htmlString) {
  const div = document.createElement('div');
  div.innerHTML = htmlString.trim();
  return div.firstChild;
}

export function addEventListeners(nodes, event, callback) {
  if (!(nodes instanceof Array)) {
    nodes = nodeListToArray(nodes);
  }
  nodes.forEach(node => node.addEventListener(event, callback));
}

export function removeElement(element) {
  element.parentNode.removeChild(element);
}
