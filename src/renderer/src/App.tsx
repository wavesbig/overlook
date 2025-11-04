import { HashRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '@renderer/layouts/RootLayout'
import Home from '@renderer/pages/Home'
import Dashboard from '@renderer/pages/Dashboard'
import Settings from '@renderer/pages/Settings'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
      {/* <Versions /> */}
    </HashRouter>
  )
}

export default App
