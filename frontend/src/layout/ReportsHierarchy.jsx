import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { reportRoutes } from '../routes'

export default function ReportsHierarchy() {
    return (

        <Suspense>
            <Routes>
                {reportRoutes.map((route, index) => (
                    route.element && <Route
                        key={index}
                        path={route.path + '/*'}
                        element={<route.element />}
                    />
                ))}
            </Routes>
        </Suspense>
    )
}