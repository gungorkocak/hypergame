import { Engine, World, Bodies } from 'matter-js'

export const RectBody = (props) => (_state, _actions, context) => {
  const { key, x, y, width, height, onupdate, ...rest } = props
  const { physics: { bodies: { rect }, world: { add } } } = context

  const body = rect(key, x, y, width, height, rest)
  add(key, body)

  if (typeof onupdate === 'function') {
    onupdate(body.position)
  }
}

export default () => () => {
  var engine = Engine.create()
  var bodies = {}

  const rect = (key, x, y, width, height, options) =>
    !!bodies[key] ? bodies[key] : Bodies.rectangle(x, y, width, height, options)

  const add = (key, body) => {
    !bodies[key] && (bodies[key] = body) && World.add(engine.world, body)
  }

  return {
    context: { bodies: { rect }, world: { add } },
    update: () => {
      Engine.update(engine, 1000 / 60)
    }
  }
}