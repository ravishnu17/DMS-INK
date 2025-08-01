import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

// Validation Schema
const schema = yup.object().shape({
  departmentNo: yup.string().required("Department No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  remarks: yup.string().optional(),
});

function DepartmentAdd() {
  const location= useLocation();
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
            navigate("/nonfinancial/department");
          }
        });
      } else {
        navigate("/nonfinancial/department");
      }
    };

  return (
      <div className="card p-4 pt-2 shadow m-2">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
          <button className='btn' type='button' onClick={handleBackClick}>
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Department 1 - {location.state?.name}</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Department No</label>
              <input {...register("departmentNo")} className={`form-control ${errors.departmentNo ? "is-invalid" : ""}`} placeholder="Enter Department No" />
              <div className="invalid-feedback">{errors.departmentNo?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Accountant ID</label>
              <input {...register("accountantId")} className={`form-control ${errors.accountantId ? "is-invalid" : ""}`} placeholder="Enter Accountant ID" />
              <div className="invalid-feedback">{errors.accountantId?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Accountant Name</label>
              <input {...register("accountantName")} className={`form-control ${errors.accountantName ? "is-invalid" : ""}`} placeholder="Enter Accountant Name" />
              <div className="invalid-feedback">{errors.accountantName?.message}</div>
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

export default DepartmentAdd;
