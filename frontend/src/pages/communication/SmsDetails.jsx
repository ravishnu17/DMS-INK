import React, { useEffect, useState } from 'react';
import { use } from 'react';
import { useParams } from 'react-router-dom';
import { getAPI } from '../../constant/apiServices';

function SmsDetails() {
  const { id } = useParams();

  // console.log("id", id);

  const [sms, setSms] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      fetchSmsDetails();
    }
  }, [id]);

  const fetchSmsDetails = () => {
    setLoading(true);
    getAPI(`communication/communications/${id}`)
      .then((res) => {
        if (res?.data?.status) {
          // console.log("sms details res", res);
          setSms(res?.data);
          setLoading(false);
          // Process the SMS details here
        } else {
          console.error("Error fetching SMS details:", res?.data?.details);
        }
      })
      .catch((error) => {
        console.error("Error fetching SMS details:", error);
      });
    setLoading(false);
  }

const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};


  return (
    <div className="container" style={{ marginTop: "20px" }}>
      <div className="card shadow-sm">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center m-2">
            <div className="d-flex align-items-center gap-2">
              <i
                className="fa-solid fa-circle-left fs-5"
                style={{ marginLeft: "10px", cursor: "pointer" }}
                onClick={() => window.history.back()}
              ></i>
              <h5 className="fw-bold mb-0">SMS Details</h5>
            </div>
          </div>
        </div>

        {/* <div className="card-body">
          {sms ? (
            <>
              <div className="mb-3 d-flex">
                <strong className="me-2">Sent By:</strong>
                <p className="mb-0">{sms.sent_by}</p>
              </div>

              <div className="mb-3">
                <strong className="me-2">Recipients:</strong>
                <ul className="mb-0">
                  {sms.recipients && sms.recipients.length > 0 ? (
                    sms.recipients.map((recipient) => (
                      <li key={recipient.id}>
                        {recipient.name} - {recipient.phone_number}
                      </li>
                    ))
                  ) : (
                    <li>No recipients found</li>
                  )}
                </ul>
              </div>

              <div className="mb-3 d-flex">
                <strong className="me-2">Sent At:</strong>
                <p className="mb-0">{new Date(sms.sent_at).toLocaleString()}</p>
              </div>

              <div className="mb-3 d-flex">
                <strong className="me-2">Message:</strong>
                <p className="mb-0">{sms.content}</p>
              </div>
            </>
          ) : (
            <p>Loading SMS details...</p>
          )}
        </div> */}
        <div className="card-body">
          {sms ? (
            <>
              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Sent By</div>
                <div className="col-md-9">{sms.sent_by}</div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Recipients</div>
                <div className="col-md-9">
                  <ul className="mb-0 ps-3">
                    {sms.recipients && sms.recipients.length > 0 ? (
                      sms.recipients.map((recipient) => (
                        <li key={recipient.id}>
                          {recipient.name} - {recipient.phone_number}
                        </li>
                      ))
                    ) : (
                      <li>No recipients found</li>
                    )
                    
                    }
                  </ul>
                </div>
              </div>

              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Sent At</div>
                <div className="col-md-9">{formatDateTime(sms.sent_at)}</div>
                {/* <div className="col-md-9">{new Date(sms.sent_at).toLocaleString()}</div> */}
              </div>

              <div className="row mb-3">
                <div className="col-md-3 fw-bold">Message</div>
                <div className="col-md-9">{sms.content}</div>
              </div>
            </>
          ) : (
            <p>Loading SMS details...</p>
          )}
        </div>

      </div>
    </div>
  );



}

export default SmsDetails;
