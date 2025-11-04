import { HashRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '@renderer/layouts/RootLayout'
import { appRoutes } from '@renderer/routes'

function App(): React.JSX.Element {
  return (
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />}>
          {appRoutes.map((r) => (
            <Route key={r.path} path={r.path} element={r.element} />
          ))}
        </Route>
      </Routes>
      {/* <Versions /> */}
    </HashRouter>
  )
}

export default App
