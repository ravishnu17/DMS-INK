import React from 'react';

function Footer({menu}) {
  
  return (
    <div className={`p-1 d-flex justify-content-center align-items-center footer ${menu ? "open" : ""}`}>
      <p className='text-light mb-0 footer-text'>IMS © {new Date().getFullYear()}</p>
    </div>
  )
}

export default Footer