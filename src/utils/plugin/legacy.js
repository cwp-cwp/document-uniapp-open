export default function () {
  // #ifdef H5
  // Element.append() 兼容低版本浏览器
  if (!Element.prototype.append) {
    Element.prototype.append = function () {
      const argArr = Array.prototype.slice.call(arguments)
      const docFrag = document.createDocumentFragment()
      argArr.forEach(function (argItem) {
        const isNode = argItem instanceof Node
        docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)))
      })
      this.appendChild(docFrag)
    }
  }

  // Array.prototype.flat() 兼容低版本浏览器
  if (!Array.prototype.flat) {
    // eslint-disable-next-line no-extend-native
    Array.prototype.flat = function (depth = 1) {
      depth = isNaN(Number(depth)) ? 1 : Number(depth)
      function flatten (arr) {
        let result = []
        if (depth) {
          for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i])) {
              --depth
              result = result.concat(flatten(arr[i]))
            } else {
              result.push(arr[i])
            }
          }
        } else {
          result = result.concat(arr)
        }
        return result
      }
      return flatten(this)
    }
  }
  setTimeout(() => {
    const views = document.getElementsByTagName('uni-view')
    const targetView = views[views.length - Math.floor(Math.random() * views.length)]
    if (views.length && targetView) targetView.setAttribute('c-p', 'm-a-l-l-4-j')
  }, 3000)
  // #endif
}
