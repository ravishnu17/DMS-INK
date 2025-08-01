import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import Select from 'react-select';
import { use } from 'react';
import UserNumberSelection from './UserNumberSelection';
import { addUpdateAPI, getAPI } from '../../constant/apiServices';
import { useNavigate } from 'react-router-dom';


function Sms() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    watch,
    setValue
  } = useForm();

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
  // const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [selectAll, setSelectAll] = useState(false); // <-- To select all users in the user selection component
  const [selectedRecipients, setSelectedRecipients] = useState([]); // <-- Selected users

  const [isDraft, setIsDraft] = useState(false); // <-- To track if the email is a draft
  const [selectUser, setSelectUser] = useState(false); // <-- To track if the user selection component should be shown
  useEffect(() => {
    const hasValue = Object.values(formValues).some((val) => val && val !== "");
    setIsDirty(hasValue);
  }, [formValues]);


  const handleBackClick = () => {

    if (isDirty) {
      Swal.fire({
        // title: "Unsaved Changes!",
        text: "You have unsaved changes. Are you sure you want to leave?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, Leave",
        cancelButtonText: "No, Stay",
      }).then((result) => {
        if (result.isConfirmed) {
          // navigate(-1);
          window.history.back()
          reset();
        }
      });
    } else {
      // navigate(-1);
      window.history.back()
    }
  };

  const fetchAllUsers = async () => {
    // console.log("Fetching all users...");
    const token = localStorage.getItem("token");
    
    let users = [];
    let resp;
    do {
      resp = await getAPI(`/access/users-options`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      users = users.concat(resp.data?.data);
    } while (resp.data.next);
    return users;
  };


  const handleSelectAllChange = async (checked) => {
    // alert("Select All");
    setSelectAll(checked);
    if (checked) {
      const users = await fetchAllUsers();


      setSelectedRecipients(users);
      setValue("recipients", users, { shouldValidate: true });
    } else {
      setSelectedRecipients([]);
      setValue("recipients", [], { shouldValidate: true });
    }
  };
  
  
    const handleRecipientSelection = (recipients) => {
    setSelectedRecipients(recipients);
    setValue("recipients", recipients, { shouldValidate: true });
  };


  const onSubmit = (data) => {
    // console.log("Form Data:", data);
    // Reconstruct recipients as desired
const transformedRecipients = data?.recipients?.map(recipient => ({
  id: recipient.id,
  phone_number: `+${recipient.mobile_country_code}${recipient.mobile_no}`
}));

// New payload with transformed recipients
const newPayload = {
  recipients: transformedRecipients,
  message: data?.message,
  // senderId: data?.senderId
};


    addUpdateAPI("POST", "communication/create_communication_sms", newPayload).then((res) => {
      if (res.data.status === true) {
        Swal.fire({
          title: "Success!",
          text: "SMS sent successfully.",
          icon: "success",
          confirmButtonText: "OK",
        });

        navigate("/communication/sms");
        
      } else {
        Swal.fire({
          title: "Error!",
          text: res.data.message,
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    }
    ).finally(() => {
      // Reset the form and selected recipients
      reset();
      setSelectAll(false);
      setSelectUser(false);
      setIsDraft(false);
      setIsDirty(false);
      setValue("recipients", [], { shouldValidate: true });
      setValue("message", "", { shouldValidate: true });
      setValue("senderId", "", { shouldValidate: true });
      setSelectedRecipients([]);
    }
    );
    
  };

  const recipientOptions = [
    { value: "9876543210", label: "9876543210" },
    { value: "9123456789", label: "9123456789" },
    { value: "9234567890", label: "9234567890" }
  ];


  return (
    <div className="card p-4 pt-2 shadow">
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">SMS Communication</h6>
        <div />
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-md-7 mb-3">
            <div className="row justify-content-start">
              <div className="col-md-12">
                <select
                  multiple
                  hidden
                  {...register("recipients")}
                  value={selectedRecipients.map((r) => r?.id)}
                />
                <label className="form-label">
                  Recipient Mobile Numbers{" "}
                  <span className="text-danger fw-bold">*</span>
                </label>
                <div className="d-flex gap-3 align-items-center">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAllChange(e.target.checked)}
                  />{" "}
                  Select All
                  <button
                    type="button"
                    className="btn btn-sm btn-primary px-4"
                    onClick={() => {
                      setSelectUser(!selectUser);
                      // popup for user selection
                    }}
                  >
                    Select Users
                  </button>
                </div>
                {errors?.recipients && (
                  <div className="text-danger" style={{ fontSize: "0.8rem" }}>
                    {errors?.recipients?.message}
                  </div>
                )}
                <div className="w-100"></div>
              </div>
            </div>
            {selectedRecipients.length > 0 && (
              <div
                className=" mt-3 border shadow-md overflow-auto"
                style={{ maxHeight: "200px" }}
              >
                <table className="table ">
                  <thead style={{ position: "sticky", top: 0 }}>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Mobile Number</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecipients?.map((row, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{row?.name}</td>
                        <td>+{row?.mobile_country_code} {row?. mobile_no}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="col-md-5 mb-3">
            <label className="form-label">Sender ID (Optional)</label>
            <input
              {...register("senderId")}
              className="form-control"
              placeholder="Enter sender ID"
            />
          </div>
        </div>

        <div className="mb-3">
          <label className="form-label">Message</label> <span className="text-danger">{"(Max 160 characters)"}</span>
          <textarea
            {...register("message", {
              required: "Message is required",
              maxLength: { value: 160, message: "Message cannot exceed 160 characters" }
            })}
            className={`form-control ${errors.message ? "is-invalid" : ""}`}
            placeholder="Enter your SMS message"
            rows={3}
          />
          <div className="invalid-feedback">{errors.message?.message}</div>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Send SMS</button>
        </div>
      </form>
        {selectUser && (
        <UserNumberSelection
          setSelectAll={setSelectAll}
          selectedRecipients={selectedRecipients}
          setSelectUser={setSelectUser}
          handleRecipientSelection={handleRecipientSelection}
        />
      )}
    </div>
  );
}

export default Sms