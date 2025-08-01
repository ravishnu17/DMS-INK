import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import { useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Dropzone from "react-dropzone";

function DeducteeEntries ({navigate}){
 // Validation Schema
 const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0"> Add Deductee Entries</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function BankDetails ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Bank Details</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function ChallanDetails ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Challan Details</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function DailyEntries ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Daily Entries</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function Form27AQuarterly ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Form 27A (Quarterly)</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function ProvisionalReceipt ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Provisional Receipt (Quarterly)</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function Form16AQuarterly ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Form 16A (Quarterly)</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function Form16Annual ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Form 16 (Annual)</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function Form16PARTBAnnual ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Form16 PART B (Annual)</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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
function ContractorPANNumber ({navigate}){
   // Validation Schema
const schema = yup.object().shape({
  tdsNo: yup.string().required("TDS No is required"),
  accountantId: yup.string().required("Accountant ID is required"),
  accountantName: yup.string().required("Accountant Name is required"),
  purpose: yup.string().required("Purpose is required"),
  deducteeName: yup.string().required("Deductee Name is required"),
  deducteeAddress: yup.string().required("Deductee Address is required"),
  deducteePAN: yup
    .string()
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/, "Invalid PAN format")
    .required("Deductee PAN is required"),
 
  remarks: yup.string().optional(),

  // panCopy: yup
  // .mixed()
  // .test("fileRequired", "PAN Copy is required", (value) => value.length > 0),
});

  

  const [files, setFiles] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(schema),
  });

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
          navigate("/financial/tds");
        }
      });
    } else {
      navigate("/financial/tds");
    }
  };

  //file upload
  const onDrop = (acceptedFiles,fileRejections) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (fileRejections.length > 0) {

      if (fileRejections[0].file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB.");
      } else {
        alert("Only PNG or JPEG files are allowed.");
      }

      return;
    }

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([file]); // Replace existing file
  };

  const getFileIcon = (type) => {
    switch (type) {
      case "image/jpeg":
      case "image/png":
        return "fa-solid fa-file-image";
      default:
        return "fa-solid fa-file";
    }
  };



  const onSubmit = (data) => {
    console.log("files", files);
    
    if (files?.length === 0) {
      alert("PAN Copy is required!");
      return;
    }
  
    const formData = { ...data, panCopy: files[0] };
    console.log("Form Data:",formData);
  };

  return (
      <div className="card p-4 pt-2 shadow">
        <div className='d-flex align-items-center justify-content-between mb-3 border-bottom'>
        {/* onClick={() => navigate('/financial/tds')} */}
          <button className='btn' type='button' onClick={handleBackClick} >
            <i className='fa-solid fa-circle-left fs-5' />
          </button>
          <h6 className="fw-bold text-dark mb-0">Add Contractor PAN Number</h6>
          <div />
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">TDS No</label>
              <input {...register("tdsNo")} className={`form-control ${errors.tdsNo ? "is-invalid" : ""}`} placeholder="Enter TDS No" />
              <div className="invalid-feedback">{errors.tdsNo?.message}</div>
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

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Purpose</label>
              <input {...register("purpose")} className={`form-control ${errors.purpose ? "is-invalid" : ""}`} placeholder="Enter Purpose" />
              <div className="invalid-feedback">{errors.purpose?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Name</label>
              <input {...register("deducteeName")} className={`form-control ${errors.deducteeName ? "is-invalid" : ""}`} placeholder="Enter Deductee Name" />
              <div className="invalid-feedback">{errors.deducteeName?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee Address</label>
              <input {...register("deducteeAddress")} className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""}`} placeholder="Enter Deductee Address" />
              <div className="invalid-feedback">{errors.deducteeAddress?.message}</div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-4 mb-3">
              <label className="form-label">Deductee PAN</label>
              <input {...register("deducteePAN")} className={`form-control ${errors.deducteePAN ? "is-invalid" : ""}`} placeholder="Enter Deductee PAN" />
              <div className="invalid-feedback">{errors.deducteePAN?.message}</div>
            </div>
            <div className="col-md-8 mb-3">
              <label className="form-label">Upload PAN Copy </label>
               {/* <span className="text-danger"> {"(File size 5mb / .jpg and.png )"}</span> */}
              <div className="row">
                <div className="col-md-5 mb-3"> 
                <Dropzone
        onDrop={onDrop}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
        }}
        maxFiles={1}
        maxSize={5 * 1024 * 1024} // 5MB limit
      >
        {({ getRootProps, getInputProps }) => (
          <div
            {...getRootProps({
              className: "dropzone-container",
              onDrop: (event) => event.stopPropagation(),
            })}
          >
            <input {...getInputProps()} />
            <p className="text-muted">
              Drag & drop a PNG/JPEG file here, or click to select a file.Max size: 5MB | Only one file
            </p>
            {/* <small className="text-secondary">
              
            </small> */}
          </div>
        )}
      </Dropzone>
                   </div>
     

      {/* Display uploaded file name */}
      <div className="col-md-4 mb-3"> 
      <div className="ms-3 mt-2">
        {files.length > 0 && (
          <ul className="list-group">
            {files.map((file, index) => (
              <li
                key={index}
                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
              >
                <span className="text-muted text-truncate">
                  <i className={getFileIcon(file.type) + " fs-5 text-primary"} />{" "}
                  &nbsp; {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </span>
                <i
                  className="fa-solid fa-circle-xmark fs-5 text-danger"
                  title="Delete file"
                  onClick={() => setFiles([])} // Clears the file
                  style={{ cursor: "pointer" }}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
      </div>
     
    </div>

              {/* <input type="file" {...register("panCopy")} className={`form-control ${errors.panCopy ? "is-invalid" : ""}`} /> 
              <div className="invalid-feedback">{errors.panCopy?.message}</div> */}
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


function AddTds() {
  const location = useLocation();
  const formType = location.state?.name;
  console.log("formType" ,formType);
  const navigate = useNavigate();

  return(
    formType === 'Deductee Entries' && <DeducteeEntries navigate={navigate} /> || formType === 'Bank Details' && <BankDetails navigate={navigate} />
    || formType === 'Challan Details' && <ChallanDetails navigate={navigate}/>  || formType === 'Daily Entries' && <DailyEntries navigate={navigate}/>
    || formType === 'Form 27A (Quarterly)' && <Form27AQuarterly navigate={navigate} /> || formType === 'Provisional Receipt (Quarterly)' && <ProvisionalReceipt navigate={navigate} />
    || formType === 'Form 16A (Quarterly)' && <Form16AQuarterly navigate={navigate} /> || formType === 'Form 16 (Annual)'  && <Form16Annual navigate={navigate} />
    || formType === 'Form16 PART B (Annual)' && <Form16PARTBAnnual navigate={navigate} /> || formType === 'Contractor PAN Number' && <ContractorPANNumber navigate={navigate} />
   )

 
}

export default AddTds;
