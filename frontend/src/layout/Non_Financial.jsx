import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { nonFinancialRoutes } from '../routes';


function Non_Financial() {
    return (
        <Suspense>
            <Routes>
                {nonFinancialRoutes.map((route, index) => (
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

export default Non_Financial;
