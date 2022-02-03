function at(value) {
  return {
    type: 'at',
    value,
  }
}

function greaterOrEqualAndBelow(a, b) {
  return createInterval(a, true, b, false)
}

function greaterOrEqualAndAtOrBelow(a, b) {
  return createInterval(a, true, b, true)
}

function createInterval(from, fromInclusive, to, toInclusive) {
  return {
    type: 'interval',
    from,
    fromInclusive,
    to,
    toInclusive,
  }
}

function convertLevelToString(level) {
  if (level.type === 'at') {
    return String(level.value)
  } else if (level.type === 'interval') {
    return convertIntervalLevelToString(level)
  }
}

function convertIntervalLevelToString(level) {
  let string = ''
  string += level.fromInclusive ? '[' : '('
  string += `${ level.from }; ${ level.to }`
  string += level.toInclusive ? ']' : ')'
  return string
}

const data = [
  {
    level: greaterOrEqualAndAtOrBelow(700, 1000),
    name: 'enlightenment',
  },
  {
    level: greaterOrEqualAndBelow(600, 700),
    name: 'peace',
  },
  {
    level: greaterOrEqualAndBelow(540, 600),
    name: 'unconditional love',
  },
  {
    level: greaterOrEqualAndBelow(500, 600),
    name: 'love',
  },
  {
    level: greaterOrEqualAndBelow(400, 500),
    name: 'reason',
  },
  {
    level: at(405),
    name: 'rational (positive personality trait)',
  },
]

const canvas = document.getElementById('canvas')

const gap = 10
const gapBetweenTicks = gap
const tickWidth = 1
const footHeight = 1 + gapBetweenTicks
const headHeight = 20

const fromLevel = 1
const toLevel = 1000

canvas.width = 60

const numberOfTicks = toLevel - fromLevel + 1
canvas.height = headHeight + (numberOfTicks * tickWidth + (numberOfTicks - 1) * gapBetweenTicks) + footHeight

const context = canvas.getContext('2d')
context.strokeWidth = 1

const offsetX = 26

function drawScale() {
  context.beginPath()
  drawArrow()
  drawBody()
  drawFoot()

  context.stroke()
}

function drawArrow() {
  context.moveTo(offsetX + 5, 0)
  context.lineTo(offsetX + 0, 9)
  context.moveTo(offsetX + 5, 0)
  context.lineTo(offsetX + 10, 9)
}

function drawBody() {
  context.moveTo(offsetX + 5, canvas.height - 2)
  context.lineTo(offsetX + 5, 0)

  const from = headHeight
  const to = canvas.height - 1 - footHeight

  for (let i = 0; to - i * (gapBetweenTicks + tickWidth) >= from; i++) {
    const y = to - i * (gapBetweenTicks + tickWidth)
    context.moveTo(offsetX + 3, y)
    context.lineTo(offsetX + 7, y)
    const text = String(fromLevel + i)
    const textMetrics = context.measureText(text)
    const actualHeight = textMetrics.actualBoundingBoxAscent + textMetrics.actualBoundingBoxDescent
    context.fillText(text, offsetX - textMetrics.width, y + Math.floor(0.5 * actualHeight))
  }
}

function drawFoot() {
  context.moveTo(offsetX + 0, canvas.height - 1)
  context.lineTo(offsetX + 10, canvas.height - 1)
}

drawScale()

for (const entry of data) {
  renderEntry(entry)
}

function renderEntry(entry) {
  if (entry.level.type === 'at') {
    renderValue(entry)
  } else if (entry.level.type === 'interval') {
    renderInterval(entry)
  }
}

function renderValue(entry) {
  const box = document.createElement('div')
  box.textContent = entry.name
  box.style.position = 'absolute'
  const y = -3 + headHeight + (1000 - entry.level.value) * (gapBetweenTicks + tickWidth)
  const height = 18
  box.style.left = `${ determineNextX(y, height) }px`
  box.style.top = `${ y }px`
  box.title = entry.name + ': ' + convertLevelToString(entry.level)
  document.body.appendChild(box)
}

function renderInterval(entry) {
  const box = document.createElement('div')
  box.textContent = entry.name
  box.style.position = 'absolute'
  box.style.border = '1px solid black'
  box.style.padding = '0.25rem'
  const y = 7 + headHeight + (1000 - entry.level.to) * (gapBetweenTicks + tickWidth)
  const height = (entry.level.to - entry.level.from) * (gapBetweenTicks + tickWidth) - 8
  box.style.left = `${ determineNextX(y, height) }px`
  box.style.top = `${ y }px`
  box.style.height = `${ height }px`
  box.style.display = 'flex'
  box.style.alignItems = 'center'
  box.title = entry.name + ': ' + convertLevelToString(entry.level)
  document.body.appendChild(box)
}

function determineNextX(y, height) {
  const endY = y + height
  const a = Array.from(document.body.children)
    .filter(element => {
      const elementStartY = element.offsetTop
      const elementEndY = elementStartY + element.clientHeight
      return (
        (elementStartY <= y && elementEndY <= endY) ||
        (elementStartY >= y && elementEndY >= endY) ||
        (elementStartY <= y && elementEndY >= endY) ||
        (elementStartY >= y && elementEndY <= endY)
      )
    })
  return Math.max(...a.map(element => element.offsetLeft + element.clientWidth)) + gap
}
