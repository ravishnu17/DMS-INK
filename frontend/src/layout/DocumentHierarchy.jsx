import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { documentRoutes } from '../routes'

export default function DocumentHierarchy() {
  return (
 
    <Suspense>
        <Routes>
            {documentRoutes.map((route, index) => (
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