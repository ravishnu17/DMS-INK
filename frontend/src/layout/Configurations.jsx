import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { configRoutes } from '../routes';

function Configurations() {
    return (
        <>

            <Suspense>
                <Routes>
                    {configRoutes.map((route, index) => (
                        route.element && <Route
                            key={index}
                            path={route.path + "/*"}
                            element={<route.element />}
                        />
                    ))}
                </Routes>
            </Suspense>

        </>
    );
}

export default Configurations;
