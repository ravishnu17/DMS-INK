import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Loader from '../../constant/loader';

function NotificationDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true); // Start as true
  const notification = location.state;

  useEffect(() => {
    const timer = setTimeout(() => { setLoading(false); }, 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!notification) return <div>Notification not found!</div>;

  if (loading) {
    return (
      <div className='d-flex justify-content-center align-items-center' style={{ height: "500px" }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className="container" style={{ marginTop: "20px" }}>
      <div className="card shadow-sm">
        <div className="card-header ">
          <div className="d-flex justify-content-between align-items-center m-2">
            <div className="d-flex align-items-center gap-2">
              <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px", cursor: "pointer" }} onClick={() => navigate('/communication/notification')}></i>
              <div className="d-flex align-items-center " style={{ marginLeft: "20px" }} >
                <h5 className='fw-bold mb-0'>Notification Details</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="mb-3">
            <strong>Title:</strong>
            <p>{notification.title}</p>
          </div>
          <div className="mb-3">
            <strong>Message:<p>{notification.message}</p></strong>
          </div>
          <div className="mb-3">
            <strong>Sent At:<p>{notification.timestamp}</p></strong>

          </div>
          {notification.sentBy && (
            <div className="mb-3">
              <strong>Sent By: <p>{notification.sentBy}</p></strong>

            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationDetails;
