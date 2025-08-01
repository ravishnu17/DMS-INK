import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { communicationRoutes } from '../routes'

export default function Communication() {
  return (
 
    <Suspense>
        <Routes>
            {communicationRoutes.map((route, index) => (
                route.element && <Route
                    key={index}
                    path={route.path+'/*'}
                    element={<route.element />}
                />
            ))}
        </Routes>
    </Suspense>

  )
}
