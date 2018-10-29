import { game } from './game'
import canvas from './systems/canvas'
import physics, { RectBody } from './systems/physics'

const state = {
  textColor: 'red',
  font: '12pt Fira Code',
  text: null,
  rect: {
    x: 0,
    y: 80,
    direction: 'right'
  },
  rects: {
    1: { x: 0, y: 0 },
    2: { x: 80, y: 10 },
    3: { x: 160, y: 20 },
    4: { x: 240, y: 30 },
    5: { x: 320, y: 40 },
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
  },
  rects: {
    move: ({ key, x, y }) => (rects) => ({ ...rects, [key]: { x, y } })
  }
}

const text = ({ text: propsText, x, y }) => ({ text: stateText, font, textColor }, _, { canvas: { ctx } }) => {
  ctx.font = font
  ctx.fillStyle = textColor
  ctx.fillText(stateText || propsText, x, y)
}

const movingrect = ({ color, width, height }) => (state, actions, context) => {
  const { rect: { x, y, direction } } = state
  const { rect: { move, changeDirection } } = actions
  const { canvas: { ctx, w } } = context

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

const rect = ({ key, width, height }) => (state, actions, context) => {
  const { rects } = state
  const { x, y } = rects[key]
  const { rects: { move } } = actions
  const { canvas: { ctx } } = context

  ctx.fillStyle = 'red'
  ctx.fillRect(x, y - height / 2, width, height)

  return [
    RectBody({ key, x, y, width, height, onupdate: (pos) => move({ ...pos, key }), restitution: 0.9 }, []),
  ]
}

const ground = ({ x, y, width, height }) => (state, actions, context) => {
  const { canvas: { ctx } } = context

  ctx.fillStyle = '#212121'
  ctx.fillRect(x, y, width, height)

  return [
    RectBody({ key: 'ground', x, y, width, height, isStatic: true, restitution: 0.95 })
  ]
}

const view = ({ rects }, _actions, _context) =>
  [
    text({ text: 'This text coming from props', x: 50, y: 50 }),
    movingrect({ color: 'blue', width: 50, height: 50 }),
    Object.keys(rects).map(key => rect({ key, width: 60, height: 60 })),
    ground({ x: 0, y: 400, width: 800, height: 10 }),
  ]

const main = game({
  canvas: canvas({ w: 800, h: 400 }),
  physics: physics()
})(state, actions, view, document.body)

main.update()

window.main = main