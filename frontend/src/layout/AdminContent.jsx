import React, { Suspense } from 'react'
import { routes } from '../routes'
import { Route, Routes } from 'react-router-dom'
function AdminContent() {
  return (
    <div className='pb-5'>
    <Suspense>
    <Routes>
      {routes.map((route, index) => (
        route.element && <Route
          key={index}
          path={route.path}
          element={<route.element />}
        />
      ))}
    </Routes>
  </Suspense>
  </div>
  )
}

export default AdminContent