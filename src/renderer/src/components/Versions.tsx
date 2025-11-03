import { useState } from 'react'

function Versions(): React.JSX.Element {
  const [versions] = useState(() => {
    // Guard for non-Electron browser preview where window.electron is undefined
    const v = (window as any)?.electron?.process?.versions
    return (
      v ?? {
        electron: 'dev',
        chrome: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        node:
          typeof process !== 'undefined' && process?.versions?.node
            ? process.versions.node
            : 'unknown'
      }
    )
  })

  return (
    <ul className="versions">
      <li className="electron-version">Electron v{versions.electron}</li>
      <li className="chrome-version">Chromium v{versions.chrome}</li>
      <li className="node-version">Node v{versions.node}</li>
    </ul>
  )
}

export default Versions
