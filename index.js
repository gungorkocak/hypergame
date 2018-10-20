const state = {
  textColor: 'red',
  font: '12pt Arial',
  text: null,
  rect: {
    x: 0,
    y: 50,
    direction: 'right'
  }
}

const actions = {
  updateText: (text) => ({ text }),
  rect: {
    move: ({ x, y }) => (state) => {
      x = x ? state.direction === 'left' ? -x : x : 0
      y = y ? y : 0

      return { x: state.x + x, y: state.y + y }
    },
    changeDirection: (direction) => ({ direction })
  }
}

const text = ({ text: propsText, x, y }) => ({ text: stateText, font, textColor }, _, { ctx }) => {
  ctx.font = font
  ctx.fillStyle = textColor
  ctx.fillText(stateText || propsText, x, y)
}

const rect = ({ color, width, height }) => (state, actions, context) => {
  const { rect: { x, y, direction } } = state
  const { rect: { move, changeDirection } } = actions
  const { ctx, w, h } = context

  ctx.fillStyle = color
  ctx.fillRect(x, y, width, height)

  if ((x + width) >= w && direction !== 'left') {
    changeDirection('left')
  }
  else if (x <= 0 && direction !== 'right') {
    changeDirection('right')
  }

  move({ x: 3 })
}

const view = (_state, _actions, _context) =>
  [
    text({ text: 'This text coming from props', x: 50, y: 50 }),
    rect({ color: 'blue', width: 50, height: 50 })
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
    let children = view(globalState, wiredActions, { ctx, w, h })

    if (typeof children === 'function') {
      children = children(globalState, wiredActions, { ctx, w, h })
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

const main = game({ w: 800, h: 400 })(state, actions, view, document.body)

// setTimeout(() => window.requestAnimationFrame(main.update), 2000)
main.update()

window.main = main