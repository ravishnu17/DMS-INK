import React, { Suspense, useContext, useState, useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import DataTable from 'react-data-table-component';
import { notifyRoutes } from '../../routes';
import { ContextProvider } from '../../App';
import { tableStyle } from '../../constant/Util';
import { getAPI } from '../../constant/apiServices';
import { format } from 'date-fns'; // Add for date formatting
import Loader from '../../constant/loader';

// Add this function above NotificationView
function getNotificationIcon(message) {
  if (/password/i.test(message)) return "🔑";
  if (/renewal/i.test(message)) return "📅";
  if (/incharge/i.test(message)) return "👤";
  return "📩";
}

function getNotificationType(message) {
  if (/password/i.test(message)) return "Password";
  if (/renewal/i.test(message)) return "Renewal";
  if (/assigned/i.test(message)) return "Incharge";
  return "Other";
}

function getBadgeColor(type) {
  if (type === "Password") return "#007bff";
  if (type === "Renewal") return "#28a745";
  if (type === "Incharge") return "#ff9800";
  return "#6c757d";
}

const NotificationView = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications, setNotifications] = useState([]);
  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;

  const modulepermission = permissions?.role_permissions?.notification;

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true)
        const response = await getAPI('/notifications/unread');
        if (response.data?.status) {
          const mapped = response.data.data.map((n) => ({
            id: n.id,
            title: `${getNotificationIcon(n.message)} ${n.title}`, // Add icon to title
            message: n.message,
            timestamp: format(new Date(n.created_at), 'dd MMM yyyy, HH:mm'), // formatted
            is_read: n.is_read,
            type: getNotificationType(n.message),
          }));
          setNotifications(mapped);
        }
      } catch (err) {
        console.error("Error fetching notifications", err);
      } finally {
        setLoading(false)
      }
    };

    fetchNotifications();
  }, []);

  // Filter notifications by search term
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      name: 'Title',
      selector: row => row.title,
      sortable: true,
      width: " 350px"
    },
    {
      name: 'Message',
      selector: row => row.message,
      sortable: false,
      width: " 320px"
    },
    {
      name: 'Sent At',
      selector: row => row.timestamp,
      sortable: true,
      width: "250px"
    },
    {
      name: 'Type',
      selector: row => (
        <span
          style={{
            backgroundColor: getBadgeColor(row.type),
            color: "white",
            borderRadius: "8px",
            padding: "2px 8px",
            fontSize: "0.85em",
            verticalAlign: "middle",
            display: "inline-block"
          }}
        >
          {row.type}
        </span>
      ),
      width: "200px",
      center: true,
      sortable: false
    },
    {
      name: 'Action',
      cell: row => (
        <div className="d-flex justify-content-between">
          {
            (currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" || modulepermission?.view) && (
              <div className="form_col ml-1">
                <span className="custum-group-table" >
                  <button
                    type="button"
                    className="btn btn-sm text-info"
                    title='View'
                    onClick={() => navigate(
                      `/communication/notification/${row.id}`,
                      {
                        state: {
                          title: row.title,
                          message: row.message,
                          timestamp: row.timestamp,
                        }
                      }
                    )}
                  >
                    <i className="fas fa-eye" aria-hidden="true" />
                  </button>
                </span>
              </div>
            )
          }
        </div>
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      width: "150px"
    }
  ];

  return (
    <div>
      <div className="d-flex justify-content-between p-2 bg-white">
        <div className='p-2'>
          <h6 className='fw-bold mb-0'>Notification List</h6>
        </div>
        <div className='d-flex justify-content-end col-10'>
          <div className="me-2 d-flex align-items-center">
            <button className='btn bnt-sm adminsearch-icon'>
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by title or message"
              title="Search notifications by title or message"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: "250px" }}
            />
          </div>
          {
            (currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" || modulepermission?.add) && (
              <button className='btn btn-sm btn-success px-4 adminBtn' onClick={() => navigate('/communication/notification/notifycreate')}>
                Create Notification
              </button>
            )
          }
        </div>
      </div>
      <div className='card' style={{ margin: "7px" }}>
        <DataTable
          columns={columns}
          data={filteredNotifications}
          customStyles={tableStyle}
          pagination
          highlightOnHover
          striped
          responsive
        />
      </div>
      {
        loading && (<div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
          <Loader />
        </div>)
      }
    </div>
  );
};

const Notification = () => {
  return (
    <Suspense>
      <Routes>
        {[{ path: '/', element: NotificationView }, ...notifyRoutes].map((route, index) => (
          route.element && <Route
            key={index}
            path={route.path}
            element={<route.element />}
          />
        ))}
      </Routes>
    </Suspense>
  );
};

export default Notification;
