import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logo } from '../constant/Util';
import Swal from 'sweetalert2';
import { ContextProvider } from '../App';
import pro from '../assets/pro.png';
import { addUpdateAPI, getAPI } from '../constant/apiServices';

// Helper function to mark a notification as read

const markNotificationAsRead = async (notificationId, setNotifications) => {
  try {
    const res = await addUpdateAPI("POST", "/notifications/mark-read", {
      notification_id: notificationId,
    });
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
  } catch (err) {
    console.error("Error marking as read", err);
  }
}

function Header({ openSideBar, menu }) {
  const { currUser } = useContext(ContextProvider);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);


  const logout = () => {
    Swal.fire({
      title: "Are you sure want to logout?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes",
      cancelButtonText: "No",
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        navigate('/login');
      }
    });
  };
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await getAPI('/notifications/unread');
        if (response.data?.status) {
          const mapped = response.data.data.map((n) => ({
            id: n.id,
            title: n.title,
            content: n.message,
            time: n.created_at,
            is_read: n.is_read,
            // sender: "System", // or add in backend if available
            icon: pro, // default icon
          }));
          setNotifications(mapped);
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <div className='main-header'>
      <nav className="navbar px-2">
        <div className="d-flex align-items-center justify-content-between w-100 flex-nowrap">
          {!menu && (
            <div onClick={openSideBar}>
              <svg
                className=''
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
                viewBox="0 0 448 512"
                width={13}
                role='button'
              >
                <path d="M0 96C0 78.3 14.3 64 32 64H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32H416c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32H416c17.7 0 32-14.3 32 32z" />
              </svg>
            </div>
          )}
          <div className='gap-2'>
            {logo(
              "white",
              currUser?.role_id === 1
                ? "Document Management System"
                : currUser?.province?.name || ""
            )}
          </div>
          <div className='d-flex align-items-center gap-3'>
            {/* Notification */}
            <div className="btn-group dropstart mt-2">
              <button
                type="button"
                className="btn p-0"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                onClick={() => setSelectedNotification(null)}
              >
                <i className="fa fa-bell text-white fs-5" />
                <span className="translate-middle badge rounded-pill bg-danger notification_count small">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              </button>
              <div
                className="dropdown-menu rounded-1 p-2"
                data-bs-auto-close="false"
              >
                <div className="messages">
                  {selectedNotification ? (

                    <div onClick={e => e.stopPropagation()}>
                      <div className="message-details d-flex align-items-center">
                        <button
                          className="btn btn-link p-0 me-2"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedNotification(null)
                          }}
                        >
                          {"<"}
                        </button>
                        <h6 className="message-title mb-0">{selectedNotification.title}</h6>
                      </div>
                      <div className="message-content-section">
                        {/* <p><strong>Sender:</strong> {selectedNotification.sender}</p> */}
                        <p>
                          <strong style={{
                            color: "rgb(0, 0, 0)",
                            fontSize: "1rem",
                            fontWeight: "800"
                          }}>Message:</strong> {selectedNotification.content}
                        </p>
                        <span className="message-time">
                          {selectedNotification.time
                            ? (() => {
                              const dateObj = new Date(selectedNotification.time);
                              return isNaN(dateObj)
                                ? selectedNotification.time
                                : `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
                            })()
                            : ""}
                        </span>
                      </div>
                    </div>
                  ) : (

                    <>
                      {notifications.length > 0 ? (
                        [...notifications]
                          .sort((a, b) => Number(a.is_read) - Number(b.is_read))
                          .map((notification, index) => (
                            <div
                              className={`message${notification.is_read ? " read" : " unread"}`}
                              key={index}
                              onClick={async (event) => {
                                event.stopPropagation();
                                setSelectedNotification(notification);
                                await markNotificationAsRead(notification.id, setNotifications);
                              }}
                              style={{
                                cursor: "pointer",
                                background: notification.is_read ? "#f5f5f5" : "#eaf6ff",
                                fontWeight: notification.is_read ? "normal" : "bold",
                                borderLeft: notification.is_read ? "4px solid #ccc" : "4px solid #007bff"
                              }}
                            >
                              <img src={notification.icon} alt="icon" className="message-icon" />
                              <div className="message-info">
                                <div className="message-header" style={{ display: "flex", alignItems: "center" }}>
                                  <div className="message-title">{notification.title}</div>
                                  {!notification.is_read && (
                                    <span
                                      style={{
                                        marginLeft: 8,
                                        color: "#007bff",
                                        fontSize: "0.8rem",
                                        fontWeight: "bold"
                                      }}
                                    >
                                      • New
                                    </span>
                                  )}
                                </div>
                                <div
                                  className="message-content"
                                  style={{ color: "#888888" }}
                                >
                                  {notification.content.length > 15
                                    ? `${notification.content.substring(0, 15)}...`
                                    : notification.content}
                                </div>
                                <div
                                  className="message-time"
                                  style={{
                                    color: "#b0b0b0",
                                    fontSize: "0.5rem",
                                    marginTop: "0.5rem",
                                    alignSelf: "flex-end",
                                  }}
                                >
                                  {notification.time
                                    ? (() => {
                                      const dateObj = new Date(notification.time);
                                      return isNaN(dateObj)
                                        ? notification.time
                                        : `${dateObj.toLocaleDateString()} ${dateObj.toLocaleTimeString()}`;
                                    })()
                                    : ""}
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <p className="text-muted small">No notifications available</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <div className='adminBtn p-1 rounded' role='button'>
              <svg
                title='Logout'
                onClick={logout}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 512 512"
                width={25}
                fill='white'
                className='p-1'
              >
                <path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
              </svg>
            </div>
          </div>
        </div>
      </nav>


    </div>
  );
}

export default Header;