import React, { useContext, useEffect, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer'
import AdminContent from './AdminContent';
import { ContextProvider } from '../App';
import { getAPI } from '../constant/apiServices';
import Swal from 'sweetalert2';

function DefaultLayout() {
  const context = useContext(ContextProvider);

  // ✅ Prevents crash if ContextProvider is missing
  if (!context) {
    console.error("ContextProvider is not available!");
    window.location.reload(); 
    return <div>Loading...</div>; // Temporary fallback
  }
  
  const { setCurrUser,setPermissions } = useContext(ContextProvider);
  const [menu, setMenu] = useState(true); // enable sidebar
  const userId = localStorage.getItem("userId");
  const user_id=sessionStorage.getItem("userId")

  useEffect(() => {
    getCurrentuser();
  }, []);
  
  const unknownUser = () => {
    Swal.fire({
      title: 'Session Expired, Please login again',
      icon: 'warning',
      toast: true,
      showConfirmButton: false,
      timer: 1500
    })
  }

  const getCurrentuser = () => {
    getAPI('/access/current-user').then((res) => {
      if (res?.data.status) {        
        setPermissions(res?.data?.permissions);        
        setCurrUser(res?.data?.data)
      } else {
        unknownUser();
      }
    }).catch((err) => {
      unknownUser();
      console.log(err);
    })
  }

  return (
    <div className='min-vh-100'>
      <Sidebar menu={menu}  openSideBar={() => { setMenu(!menu) }}/>
      <div className={` admin-content ${menu ? "open" : ""}`}>
        <Header openSideBar={() => { setMenu(!menu) }} menu={menu}  />
        <AdminContent />
        <Footer menu={menu} />
      </div>
    </div>
  )
}

export default DefaultLayout