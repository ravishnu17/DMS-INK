import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Dropzone from "react-dropzone";

// Validation Schema
const schema = yup.object().shape({
  societyNo: yup.string().required("Society No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  remarks: yup.string().optional(),
});

function SocietyAdd() {
  const location = useLocation();

  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  const formValues = watch();
  const [isDirty, setIsDirty] = useState(false);
  useEffect(() => {
    // Check if any form field has a value
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
          navigate("/nonfinancial/society");
        }
      });
    } else {
      navigate("/nonfinancial/society");
    }
  };

  return (
    <div className="card p-4 pt-2 shadow">
      <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        <button className='btn' type='button' onClick={handleBackClick}>
          <i className='fa-solid fa-circle-left fs-5' />
        </button>
        <h6 className="fw-bold text-dark mb-0">Society 1 - {location.state.name}</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-md-5 mb-3">
            <label className="form-label">Society No</label>
            <input {...register("societyNo")} className={`form-control ${errors.societyNo ? "is-invalid" : ""}`} placeholder="Enter Society No" />
            <div className="invalid-feedback">{errors.societyNo?.message}</div>

            <label className="form-label mt-2">Accountant ID</label>
            <input {...register("accountantId")} className={`form-control ${errors.accountantId ? "is-invalid" : ""}`} placeholder="Enter Accountant ID" />
            <div className="invalid-feedback">{errors.accountantId?.message}</div>

            <label className="form-label mt-2">Accountant Name</label>
            <input {...register("accountantName")} className={`form-control ${errors.accountantName ? "is-invalid" : ""}`} placeholder="Enter Accountant Name" />
            <div className="invalid-feedback">{errors.accountantName?.message}</div>
          </div>
          <div className="col-md-5 mb-3">
            <label className="form-label">{location.state.name}</label>
            <Dropzone
              onDrop={() => { }}
              accept={{
                "application/pdf": [".pdf"],
                "application/vnd.ms-excel": [".xls"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
                "text/csv": [".csv"],
                "image/jpeg": [".jpg", ".jpeg"],
                "image/png": [".png"],
              }}
              maxFiles={1}
              maxSize={5 * 1024 * 1024} // 5MB
            >
              {({ getRootProps, getInputProps }) => (
                <div
                  {...getRootProps({ className: "dropzone-container" })}
                >
                  <input {...getInputProps()} />
                  <p className="text-muted">Drag & drop files here, or click to select files.</p>
                  <small className="text-secondary">Allowed formats: PDF, Excel, CSV, JPEG, PNG | Max size: 5MB | Only one file </small>
                </div>
              )}
            </Dropzone>
            <li className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2">
              <span className='text-muted text-truncate'>
                <i className={"fa-solid fa-file-csv fs-5 text-primary"} /> &nbsp; reportFile.csv ({(24000 / 1024).toFixed(2)} KB)
              </span>
              <i className="fa-solid fa-circle-xmark fs-5 text-danger" title='Delete file' onClick={() => { }} style={{ cursor: 'pointer' }} />
            </li>

          </div>
        </div>
        <div className="mb-3">
          <label className="form-label">Remarks</label>
          <textarea {...register("remarks")} className="form-control" placeholder="Enter remarks (optional)" ></textarea>
        </div>

        <div className="text-center">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default SocietyAdd;
