export const game = (systems = {}) => (state, actions, view, container) => {
  var globalState = clone(state)
  var wiredActions = wireStateToActions([], globalState, clone(actions))
  const { contexts, updates } = init(systems, container)

  const update = (timestamp) => {
    for (let update in updates) updates[update](timestamp)

    resolve(view)

    window.requestAnimationFrame(update)
  }

  function resolve(view) {
    let children

    if (typeof view === 'function') {
      children = view(globalState, wiredActions, contexts)
    }
    else if (typeof view === 'object' && view.length) {
      for (let i = 0; i < view.length; i++) resolve(view[i])
    }

    if (typeof children === 'function') {
      children = children(globalState, wiredActions, contexts)
    }
    else if (typeof children === 'object' && children.length) {
      for (let node of children) resolve(node)
    }
  }

  function init(systems, container) {
    var contexts = {}, updates = {}

    for (let system in systems) {
      const { context, update } = systems[system](container)

      contexts[system] = context
      updates[system] = update
    }

    return { contexts, updates }
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