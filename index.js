import { game } from './bunny'

const state = {
  textColor: 'red',
  font: '12pt Fira Code',
  text: null,
  rect: {
    x: 0,
    y: 80,
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

const main = game({ w: 800, h: 400 })(state, actions, view, document.body)

main.update()

window.main = main