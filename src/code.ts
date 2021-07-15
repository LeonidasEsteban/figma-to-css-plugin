
figma.showUI(__html__, {
  width: 500,
  height: 500,
});


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
    case 'thin':
      return 100
    case 'extra-light':
      return 200
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
    case 'extra-bold':
      return 800
    case 'black':
      return 900
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
  return '#' + red + green + blue;
}

function rgbToHex(int) {
  var hex = Number(Math.round(255 * int)).toString(16);
  if (hex.length < 2) {
    hex = "0" + hex;
  }
  return hex;
}

function convertToDegrees(matrix) {
  const values = [...matrix[0], ...matrix[1]];
  const a = values[0];
  const b = values[1];
  const angle = Math.round(Math.atan2(b, a) * (180 / Math.PI));
  return angle < 0 ? angle + 360 : angle;
}

function getTx(deg) {
  if (deg >= 120) {
    if (deg >= 180) {
      return 1;
    }
    return 0.5;
  }
  return 0;
}

function getDegreesForMatrix(matrix) {
  const degrees = convertToDegrees(matrix) || 0;
  return `${degrees}deg`;
}

function convertFigmaGradientToString(paint: GradientPaint) {
  const { gradientTransform, gradientStops } = paint;
  const gradientStopsString = gradientStops
    .map((stop) => {
      console.log(stop.color.r)
      return `#${rgbToHex(stop.color.r)}${rgbToHex(stop.color.g)}${rgbToHex(stop.color.b)} ${Math.round(stop.position * 100 * 100) / 100}%`
    })
    .join(', ');
  const gradientTransformString = getDegreesForMatrix(gradientTransform);
  return `linear-gradient(${gradientTransformString}, ${gradientStopsString})`;
}

colorStyles.forEach(style => {
  let name = style.name;
  if (style.paints[0].type.includes('GRADIENT')) {
    // debugger
    hexValueAndName.push({
      name,
      hex: convertFigmaGradientToString(style.paints[0]),
    })
    return false
  }

  let hex = makeHex(style.paints[0].color.r, style.paints[0].color.g, style.paints[0].color.b);
  let result = { name, hex };
  hexValueAndName.push(result);
  hexValues.push(hex);
});

const colorStylesProps = hexValueAndName.map((color) => {
  return toCustomProperty(color.hex, color.name)
})


figma.ui.postMessage({
  type: 'styles',
  payload: [...colorStylesProps, ...fontStyles]
})