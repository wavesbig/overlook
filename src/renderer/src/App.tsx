import Versions from './components/Versions'
import { Button } from '@renderer/components/ui/button'

function App(): React.JSX.Element {
  const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="actions">
        <div className="action" onClick={ipcHandle}>
          <Button>213123</Button>
        </div>
      </div>
      <Versions></Versions>
    </>
  )
}

export default App
