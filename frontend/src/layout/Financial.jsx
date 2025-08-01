import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { financialRoutes } from '../routes';

function Financial() {
    return (
        <Suspense>
            <Routes>
                {financialRoutes.map((route, index) => (
                    route.element && <Route
                        key={index}
                        path={route.path + '/*'}
                        element={<route.element />}
                    />
                ))}
            </Routes>
        </Suspense>
    );
}

export default Financial;
