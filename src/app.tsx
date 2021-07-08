import * as React from 'react'
import './style.css'


function App() {
  const [isAnimated, setIsAnimated] = React.useState(false)
  const [format, setFormat] = React.useState('custom-promerties')
  const [clipboard, setClipBoard] = React.useState(true)
  const [remSize, setRemSize] = React.useState(16)
  const [styles, setStyles] = React.useState([])

  function handleFormatChange() {
    const newFormat = (format === 'custom-promerties') ? 'font' : 'custom-promerties'
    setFormat(newFormat)
    sendMessage('set-format', newFormat)
  }
  function sendMessage(type, payload) {
    parent.postMessage({
      pluginMessage: {
        type: type,
        payload: payload,
      }
    }, '*')
  }
  function handleClipboardChange() {
    setClipBoard(!clipboard)
  }
  function handleRemChange(event) {
    setRemSize(event.target.value)
    sendMessage('set-rem', event.target.value)
  }
  function buildStr(styles) {
    return styles.reduce((text, style) => {
      return text + `${style} \n`
    }, '')
  }
  function buildStyles(styles) {
    setStyles(styles)
    const str = buildStr(styles)
    console.log('clipboard', clipboard)
    if (clipboard) {
      copyToClipboard(str)
    }
  }
  const str = buildStr(styles)


  function copyToClipboard(str) {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    setIsAnimated(true)
    setTimeout(() => {
      setIsAnimated(false)
    }, 2000)
  }
  function handleMessage(event) {
    const message = event.data.pluginMessage
    switch (message.type) {
      case 'font':
        buildStyles([message.payload])
        break
      case 'styles':
        buildStyles(message.payload)
        break
      default:
        break
    }
  }
  React.useEffect(() => {
    onmessage = handleMessage
  }, [clipboard, format])

  return (
    <div className="grid">
      <input className="tab-radio" defaultChecked id="css-tab" name="tab" type="radio"/>
      <input className="tab-radio" id="config-tab" name="tab" type="radio"/>
      <div className="tabs">
        <label className="css-tab" htmlFor="css-tab" >CSS</label>
        <label className="config-tab" htmlFor="config-tab" >Config</label>
      </div>
      <div className="css">
        <p className={`bubble ${isAnimated ? 'is-animated' : ''}`}>Copied to clipboard</p>
        <pre>
          {str}
        </pre>
      </div>
      <form className="config">
        <label htmlFor="count">
          1rem: <input id="count" defaultValue={remSize} onChange={handleRemChange} />
        </label>
        <hr/>
        {/* <label htmlFor="custom-property">
          Custom properties
          <input
            type="radio"
            id="custom-property"
            name="format"
            checked={(format === 'custom-promerties')}
            onChange={handleFormatChange}
          />
        </label>
        <br/>
        <label htmlFor="font-property">
          Font Property
          <input
            type="radio"
            id="font-property"
            name="format"
            checked={(format === 'font')}
            onChange={handleFormatChange}
          />
        </label> */}
        {/* <hr/> */}
        <label htmlFor="clipboard">
          Copy to the clipboard
          <input
            type="checkbox"
            id="clipboard"
            name="clipboard"
            defaultChecked={clipboard}
            onChange={handleClipboardChange}
          />
        </label>
      </form>
    </div>

  )
}

export default App