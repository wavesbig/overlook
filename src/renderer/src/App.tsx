import { HashRouter, useRoutes } from 'react-router-dom'
import { Suspense, useEffect } from 'react'
import RootLayout from '@renderer/layouts/RootLayout'
import { routeChildren } from '@renderer/routes'
import { setupNetworkListeners } from '@renderer/store/grid'

function AppRoutes(): React.JSX.Element | null {
  return useRoutes([
    {
      element: <RootLayout />,
      children: routeChildren
    }
  ])
}

function App(): React.JSX.Element {
  useEffect(() => {
    setupNetworkListeners()
  }, [])
  return (
    <HashRouter>
      <Suspense fallback={<div className="p-4 text-sm">Loading…</div>}>
        <AppRoutes />
      </Suspense>
      {/* <Versions /> */}
    </HashRouter>
  )
}

export default App
