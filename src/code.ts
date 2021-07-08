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

function buildFontStyle(style) {
  switch (style) {
    case 'light':
      return 300
    case 'regular':
      return 400
    case 'medium':
      return 500
    case 'semibold':
      return 600
    case 'bold':
      return 700
    case 'black':
      return 800
    default:
      return style
  }
}

function textToFont(element) {
  // console.log(element)
  const fontSize = pixelToRem(element.fontSize)
  const lineHeight = element.lineHeight.value ? `${pixelToRem(element.lineHeight.value)}` : 'normal'
  const fontFamily = element.fontName.family
  let fontStyle = buildFontStyle(element.fontName.style.toLowerCase())

  const font = `${fontStyle} ${fontSize}/${lineHeight} ${fontFamily}`
  return font
}

function toCustomProperty(value, name) {
  const customProperty = `--${name.replaceAll(' ','').replaceAll('/', '-').toLowerCase()}`
  return `${customProperty}: ${value};`
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


// Colors

const colorStyles = figma.getLocalPaintStyles();
var hexValueAndName = []; // array of hex values and their names
var hexValues = []; //array with hex values only

function makeHex(r, g, b) {
  let red = rgbToHex(r);
  let green = rgbToHex(g);
  let blue = rgbToHex(b);
  return red + green + blue;
}

function rgbToHex(int) {
  var hex = Number(int).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
}

colorStyles.forEach(style => {
  let name = style.name;
  let r = Math.round(255 * (style.paints[0].color.r));
  let g = Math.round(255 * (style.paints[0].color.g));
  let b = Math.round(255 * (style.paints[0].color.b));
  let hex = makeHex(r, g, b);
  let result = { name, hex };
  hexValueAndName.push(result);
  hexValues.push(hex);
});

const colorStylesProps = hexValueAndName.map((color) => {
  return toCustomProperty(`#${color.hex}`, color.name)
})


figma.ui.postMessage({
  type: 'styles',
  payload: [...colorStylesProps, ...fontStyles]
})