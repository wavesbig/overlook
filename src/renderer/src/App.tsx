import { HashRouter, useRoutes } from 'react-router-dom'
import { Suspense } from 'react'
import RootLayout from '@renderer/layouts/RootLayout'
import { routeChildren } from '@renderer/routes'
function AppRoutes(): React.JSX.Element | null {
  return useRoutes([
    {
      element: <RootLayout />,
      children: routeChildren
    }
  ])
}

function App(): React.JSX.Element {
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
