import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getAPI } from '../../constant/apiServices';
import { ContextProvider } from '../../App';

function EmailDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp.currUser;
 
  
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);


  useEffect(() => {
    const fetchEmail = async () => {
      try {
        const res = await getAPI(`/communication/communications/${id}`);
        setEmail(res.data);
      } catch (err) {
        console.error('Error fetching email:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchEmail();
  }, [id]);
  
  // For demonstration, using a static email object


  const handleBackClick = () => {
    navigate('/communication/email'); // This takes you back to the inbox or mail list
  };
  // if (loading) return <div className="text-center mt-5">Loading email...</div>;

  if (notFound || !email) return <div className="text-center mt-5">Email not found!</div>;
  return (
    <div className="container mt-4">
      <div className="card shadow-sm border-0">
        <div className="card-header bg-white border-bottom text-dark">

          <div className="d-flex justify-content-between align-items-center py-2 px-3">
            <div className="d-flex align-items-center gap-3">
              <i className="fa-solid fa-circle-left fs-5 text-secondary cursor-pointer" onClick={() => window.history.back()}></i>
              <h5 className='fw-bold mb-0'>{email.subject}</h5>
              {/* <i className="fas fa-envelope text-primary mr-2"></i> */}
            </div>

  
          </div>
        </div>
        <div className="card-body p-4 bg-white rounded shadow-sm">
  {/* Header Section */}

  {/* Two-column layout for metadata */}
{/* Two-column layout for metadata */}
<div className="row mb-4">
  {/* Left Column - Metadata */}
  <div className="col-12 col-lg-6 mb-3 mb-lg-0">
    <div className="bg-light p-3 rounded h-100">
      <div className="d-flex gap-2 align-items-center text-muted mb-2">
        <i className="fas fa-info-circle mr-2"></i>
        <strong>Metadata</strong>
      </div>
      <div className="d-flex row flex-wrap gap-2">
        { currentUser?.role?.name === "Admin" ||
         currentUser?.role?.name === "Super Admin" 
      && <div className="d-flex align-items-center gap-2">
          <i className="fas fa-user-shield mr-2"></i>
          <span className="text-dark">Sent By: {email.sent_by || 'Not available'}</span>
        </div>}
        <div className="d-flex align-items-center gap-2">
          <i className="far fa-clock mr-2"></i>
          <span className="text-dark">Sent At: {email.sent_at ? new Date(email.sent_at).toLocaleString() : 'Not available'}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-info-circle mr-2"></i>
          Status:
          <span
            className="badge badge-pill d-inline-flex gap-2 align-items-center text-white"
            style={{
              backgroundColor:
                email.status === 'SENT'
                  ? '#28a745'
                  : email.status === 'DRAFT'
                  ? '#dc3545'
                  : '#ffc107',
            }}
          >
            {email.status === 'SENT' ? (
              <i className="fas fa-check-circle mr-1"></i>
            ) : (
              <i className="fas fa-exclamation-triangle mr-1"></i>
            )}
            {(email.status || 'Unknown').charAt(0).toUpperCase() + (email.status || 'Unknown').slice(1).toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Right Column - Recipients */}
  <div className="col-12 col-lg-6">
    <div className="bg-light p-3 rounded h-100">
      <div
        style={{ position: 'sticky', top: '0' }}
        className="d-flex align-items-center gap-2 text-muted mb-2"
      >
        <i className="fas fa-users mr-2"></i>
        <strong>Recipients</strong>
      </div>
      {email.recipients?.length > 0 ? (
        <ul
          style={{ overflowY: 'auto', maxHeight: '150px' }}
          className="list-unstyled mb-0"
        >
          {/* {Array.from({ length: 20 }).map((_, i) => (
            <li
              key={i}
              className="text-dark mb-1 gap-2 d-flex align-items-center"
            >
              <i className="fas fa-user-circle text-info mr-2"></i>
              email_{i}@example.com
            </li>
          ))} */}
          {email.recipients.map((recipient, index) => (
            <li
              key={index}
              className="text-dark mb-1 gap-2 d-flex align-items-center"
            >
              <i className="fas fa-user-circle text-info mr-2"></i>
              {recipient?.name+" - "+recipient?.email}
            </li>
          ))}

        </ul>
      ) : (
        <p className="text-muted font-italic mb-0">No recipients</p>
      )}
    </div>
  </div>
</div>


  {/* Email Content */}
  <div className="mb-4">
    <div className="d-flex gap-2 align-items-center text-muted mb-2">
      <i className="fas fa-envelope-open-text mr-2"></i>
      <strong>Email Body</strong>
    </div>
    {email.content ? (
      <div className="bg-light p-3 rounded border" dangerouslySetInnerHTML={{ __html: email.content }} />
    ) : (
      <div className="bg-light p-3 rounded border text-muted font-italic">No content available</div>
    )}
  </div>

  {/* Attachments */}
  <div className="mb-3">
    <div className="d-flex gap-2 align-items-center text-muted mb-2">
      <i className="fas fa-paperclip mr-2"></i>
      <strong>Attachments</strong>
    </div>
    {email.attachments?.length > 0 ? (
      <div className="row">
        {email.attachments.map((file, i) => (
          <div key={i} className="col-sm-6 mb-2">
            <div className="bg-light p-2 rounded border d-flex gap-2 align-items-center hover-bg">
              <i className="far fa-file-alt text-primary mr-2"></i>
              <span className="text-dark text-truncate">
                {file?.filename.length > 30 
                  ? `${file.filename.substring(0, 27)}...${file.filename.substring(file.filename.lastIndexOf('.'))}` 
                  : file.filename}
              </span>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div className="bg-light p-3 rounded border text-muted font-italic">No attachments</div>
    )}
  </div>
</div>
      </div>
    </div>
  );
}

export default EmailDetails;
