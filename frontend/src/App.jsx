import { createContext, lazy, useEffect, useState } from 'react'
import './App.css'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom';
import Forgot_Password from './pages/Forgot_Password';
import Recover_password from './pages/Recover_password';
import { getAPI } from './constant/apiServices';

const DefaultLayout = lazy(() => import('./layout/DefaultLayout'));
const Login = lazy(() => import('./pages/Login'));

export const ContextProvider = createContext(null);

function App() {
  // manage navigation state data
  const [navState, setNavState] = useState({});
  const [currUser, setCurrUser] = useState({});
  const [permissions, setPermissions] = useState({});
  const [portfolios, setPortfolios] = useState([]);

  const routes = [
    { path: '/', element: <Navigate to="/login" /> },
    { path: '/login', element: <Login /> },
    { path: '/forgot-password', element: <Forgot_Password /> },
    { path: '/recover-password', element: <Recover_password /> },
    { path: '*', element: <DefaultLayout /> },
  ]
  const hashRouter = createHashRouter(routes);

  const getPortfolios = async () => {
    if (currUser?.id) {
      getAPI("/config/portfolio?skip=0&limit=25").then((res) => {
        if (res?.data?.status) {
          setPortfolios(res?.data?.data);
        }
      }).catch((err) => {
        console.log(err);
      });
    }

  };

  useEffect(() => {
    getPortfolios();
  }, [currUser]);

  return (
    <ContextProvider.Provider value={{ navState, setNavState, currUser, setCurrUser, permissions, setPermissions, portfolios, setPortfolios }}>
      <RouterProvider router={hashRouter} />
    </ContextProvider.Provider>
  )
}

export default App
