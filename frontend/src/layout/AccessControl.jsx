import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { accessControlRoutes } from '../routes';

function AccessControl() {
    return (
        <>
            <Suspense>
                <Routes>
                    {accessControlRoutes.map((route, index) => (
                        route.element && <Route
                            key={index}
                            path={route.path + '/*'}
                            element={<route.element />}
                        />
                    ))}
                </Routes>
            </Suspense>
        </>
    );
}

export default AccessControl;
