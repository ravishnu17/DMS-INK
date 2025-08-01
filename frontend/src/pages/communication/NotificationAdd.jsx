import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NotificationAdd = () => {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');

    const handleCreateNotification = () => {
        const newNotification = {
            id: Date.now(), // Temporary ID
            title,
            message,
            timestamp: new Date().toLocaleString()
        };

        console.log("New Notification: ", newNotification);
        alert('Notification Created Successfully!');
        navigate('/communication/notification');
    };

    return (
        <div className="card" style={{ margin: "5px", padding: "15px" }}>
            <div className="card-header">

                <div className="d-flex justify-content-between align-items-center m-2">
                    <div class="d-flex align-items-center gap-2">
                        <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/communication/notification')}></i>
                        <div className="d-flex align-items-center " style={{ marginLeft: "20px" }} >
                           
                            <h6 className='fw-bold mb-0'>Create Notification </h6>
                        </div>
                    </div>
                </div>
            </div>
            <form>
            <div className="card-body">
           
                <div className="mb-3">
                    <label htmlFor="title" className="form-label">Title</label>
                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        placeholder="Enter notification title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="message" className="form-label">Message</label>
                    <textarea
                        className="form-control"
                        id="message"
                        rows="3"
                        placeholder="Enter notification message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

              
           
            </div>
            <div className="card-footer">
                <div className="d-flex justify-content-end">
                <button
                        type="button"
                        className="btn btn-success px-4 adminBtn"
                        onClick={handleCreateNotification}
                    >
                        Create Notification
                    </button>
                    </div>
            </div>

            </form>
        </div>
    );
};

export default NotificationAdd;
