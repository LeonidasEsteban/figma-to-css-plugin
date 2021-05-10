figma.showUI(__html__);

const config = {
  remSize: 16,
  format: 'custom-promerties',
}

function pixelToRem(px) {
  const amount = px / config.remSize
  return `${amount}rem`
}

function unitProcessing(unit) {
  switch (unit) {
    case 'PIXELS': return 'px'
    default: return 'px'
  }
}

function set(property, size) {
  config[property] = size
}

figma.ui.onmessage = (message) => {
  switch (message.type) {
    case 'set-rem':
      set('remSize', message.payload)
      break
    case 'set-format':
      set('format', message.payload)
      break
    default:
      break
  }
}

function textToFont(element) {
  // console.log(element)
  const fontSize = pixelToRem(element.fontSize)
  const lineHeight = element.lineHeight.value ? `${pixelToRem(element.lineHeight.value)}` : 'normal'
  const fontFamily = element.fontName.family
  const fontStyle = element.fontName.style.toLowerCase()
  const font = `${fontStyle} ${fontSize}/${lineHeight} ${fontFamily}`
  return font
}

function toCustomProperty(fontStyle, styleName) {
  const customProperty = `--${styleName.replaceAll(' ','').replaceAll('/', '-').toLowerCase()}`
  return `${customProperty}: ${fontStyle};`
}

function toFontProperty(style) {
  return `font: ${style};`
}

function handleChange() {

  const element = figma.currentPage.selection[0]
  if (element.type !== 'TEXT') return false
  let css
  if (config.format === 'custom-properties') {
    css = toCustomProperty(textToFont(element), 'customProp')
  } else {
    css = toFontProperty(textToFont(element))
  }

  figma.ui.postMessage({
    type: 'font',
    payload: css
  })
}

figma.on('selectionchange', handleChange)

const textStyles = figma.getLocalTextStyles()
const fontStyles = textStyles.map((textStyle) => {
  return toCustomProperty(textToFont(textStyle), textStyle.name)
})

figma.ui.postMessage({
  type: 'fontStyles',
  payload: fontStyles
})