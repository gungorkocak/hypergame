const state = {
  textColor: 'red',
  font: '12pt Arial',
  text: null
}

const actions = {
  updateText: (text) => ({ text })
}

const text = ({ text: propsText, pos: [x, y] }) => ({ text: stateText, font, textColor }, _, { ctx }) => {
  ctx.font = font
  ctx.fillStyle = textColor
  ctx.fillText(stateText || propsText, x, y)
}

const view = (_state, _actions, _context) =>
  [
    text({ text: 'This text coming from props', pos: [50, 50] })
  ]

const game = ({ w, h }) => (state, actions, view, container) => {
  var globalState = clone(state)
  var wiredActions = wireStateToActions([], globalState, clone(actions))

  var rootElement = (container && container.children[0]) || null
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')

  canvas.width = w || 800
  canvas.height = h || 600

  container.insertBefore(canvas, rootElement)
  container.removeChild(rootElement)

  const resolve = (view) => {
    let children = view(globalState, wiredActions, { ctx })

    if (typeof children === 'function') {
      children = children(globalState, wiredActions, { ctx })
    }

    if (typeof children === 'object' && children.length) {
      for (node of children) {
        resolve(node)
      }
    }
  }

  const update = (timestamp) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    resolve(view)

    window.requestAnimationFrame(update)
  }

  function clone(target, source) {
    let out = {}

    for (var i in target) out[i] = target[i]
    for (var i in source) out[i] = source[i]

    return out
  }

  function setPartialState(path, value, source) {
    var target = {}
    if (path.length) {
      target[path[0]] =
        path.length > 1
          ? setPartialState(path.slice(1), value, source[path[0]])
          : value
      return clone(source, target)
    }
    return value
  }

  function getPartialState(path, source) {
    let i = 0
    while (i < path.length) {
      source = source[path[i++]]
    }
    return source
  }

  function wireStateToActions(path, state, actions) {
    for (let key in actions) {
      typeof actions[key] === 'function'
        ? ((key, action) => {
          actions[key] = (data) => {
            let result = action(data)

            if (typeof result === 'function') {
              result = result(getPartialState(path, globalState), actions)
            }

            if (
              result &&
              result !== (state = getPartialState(path, globalState)) &&
              !result.then
            ) {
              globalState = setPartialState(
                path,
                clone(state, result),
                globalState
              )
            }
          }
        })(key, actions[key])
        : wireStateToActions(
          path.concat(key),
          (state[key] = clone(state[key])),
          (actions[key] = clone(actions[key]))
        )
    }

    return actions
  }

  return { update, actions: wiredActions }
}

const main = game({ w: 400, h: 400 })(state, actions, view, document.body)

// setTimeout(() => window.requestAnimationFrame(main.update), 2000)
main.update()

window.main = main