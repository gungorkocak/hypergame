export default ({ w, h }) => (container) => {
  var rootElement = (container && container.children[0]) || null
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')

  canvas.width = w || 800
  canvas.height = h || 600

  container.insertBefore(canvas, rootElement)
  container.removeChild(rootElement)

  const update = (timestamp) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return {
    context: { ctx, w, h },
    update
  }
}