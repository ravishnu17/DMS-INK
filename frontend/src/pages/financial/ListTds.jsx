import React, { useEffect, useState } from "react";
import { formatFileSize, tableStyle } from "../../constant/Util";
import DataTable from "react-data-table-component";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import Dropzone from "react-dropzone";
import bgImage from "../../assets/bg1.jpg";

function DeducteeEntries({ navigate }) {
  const location = useLocation();
  const [deducteeEntries, setDeducteeEntries] = useState([]);
  const [fileView, setFileView] = useState(false);

  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },

    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    {
      name: "Action",
      center: true,
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy: [
      {
        name: "Version-3.jpg",
        fileUrl:
          "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
        size: 102400, // 100 KB in bytes
      },
      {
        name: "Version-2.jpg",
        fileUrl:
          "https://www.shutterstock.com/image-vector/sample-pan-card-mockup-template-1681665596",
        size: 2097152, // 2 MB in bytes
      },
      {
        name: "Version-1.jpg",
        fileUrl:
          "https://www.shutterstock.com/image-vector/example-pan-card-vector-illustration-1681665597",
        size: 5120, // 5 KB in bytes
      },
    ],
    remarks: "Testing",
  };

  // Populate form fields with backend response
  // useEffect(() => {

  //   if (backendData) {
  //     Object.keys(backendData).forEach((key) => {
  //       setValue(key, backendData[key]); // Set each form value
  //     });
  //     // setFiles([backendData.panCopy]);
  //   }
  // }, [backendData, setValue]);

  //new
  useEffect(() => {
    Object.keys(backendData).forEach((key) => {
      setValue(key, backendData[key]);
    });

    if (backendData.panCopy?.length > 0 && files !== backendData.panCopy) {
      setFiles(backendData.panCopy);
    }
  }, [setValue]);

  // console.log("files",files);

  //file upload
  //  const onDrop = (acceptedFiles,fileRejections) => {
  //   if (acceptedFiles.length > 1) {
  //     alert("You can only upload one file at a time.");
  //     return;
  //   }

  //   const file = acceptedFiles[0];

  //   if (fileRejections.length > 0) {

  //     if (fileRejections[0].file.size > 5 * 1024 * 1024) {
  //       alert("File size must be less than 5MB.");
  //     } else {
  //       alert("Only PNG or JPEG files are allowed.");
  //     }

  //     return;
  //   }

  //   if (!["image/jpeg", "image/png"].includes(file.type)) {
  //     alert("Only PNG or JPEG files are allowed.");
  //     return;
  //   }

  //   if (file.size > 5 * 1024 * 1024) { // 5MB limit
  //     alert("File size must be less than 5MB.");
  //     return;
  //   }

  //   setFiles([file]); // Replace existing file
  // };

  //new
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 1) {
      alert("You can only upload one file at a time.");
      return;
    }

    const file = acceptedFiles[0];

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      alert("Only PNG or JPEG files are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    setFiles([{ name: file.name, fileUrl: URL.createObjectURL(file) }]);
  };

  const removeFile = (index) => {
    console.log("index", index);

    setFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
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

  // const onSubmit = (data) => {
  //   console.log("files", files);

  //   if (files?.length === 0) {
  //     alert("PAN Copy is required!");
  //     return;
  //   }

  //   const formData = { ...data, panCopy: files[0] };
  //   console.log("Form Data:",formData);
  // };

  const onSubmit = (data) => {
    if (files.length === 0) {
      alert("PAN Copy is required!");
      return;
    }

    const formData = {
      ...data,
      panCopy: files.map((file) => file.fileUrl || file), // Send either URL (preloaded) or File (uploaded)
    };

    console.log("Form Data:", formData);
  };

  const openFile = (fileUrl) => {
    // window.open(fileUrl, "_blank");
    // window.location.href = fileUrl;
    setFileView(true);
  };

  return (
    <>
      <div className="card p-2" style={{ borderRadius: "0" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0">Deductee Entries List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
          </div>
        </div>
      </div>
      <div className="card" style={{ margin: "7px" }}>
        <DataTable
          columns={columns}
          data={data}
          customStyles={tableStyle}
          pagination
        />
      </div>

      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Remarks</label>
                  <p className="ms-2 fw-bold">{backendData.remarks}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Upload PAN Copy</label>

                  <div className="ms-3">
                    {files.length > 0 && (
                      <ul className="list-group">
                        {files.map((file, index) => (
                          <li
                            key={index}
                            className="d-flex align-items-center me-3 pb-2 gap-2"
                          >
                            <i
                              className={
                                getFileIcon(file.type) + " fs-3 text-primary"
                              }
                            />
                            <span className="text-muted text-truncate small">
                              <a
                                href={file.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {file.name}
                              </a>
                              <br />
                              <span className="small">
                                {formatFileSize(file.size)}
                              </span>
                            </span>
                            <i class="fa-solid fa-file-arrow-down fs-5 ms-5"></i>
                            <i
                              class="fa-solid fa-folder-open fs-5 ms-2"
                              title="View"
                              data-bs-toggle="modal"
                              data-bs-target="#viewImageModel"
                            ></i>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
                  </div>
                  <div className="col-md-8 mb-3">
                    <label className="form-label">Upload PAN Copy </label>
                    <span className="text-danger">
                      {" "}
                      {"(Max File-size 5MB)"}
                    </span>
                    <div className="row">
                      <div className="col-md-6 mb-3">
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
                                Click or Drag & drop a PNG/JPEG file here
                              </p>
                            </div>
                          )}
                        </Dropzone>
                      </div>

                      <div className="col-md-6 mb-3">
                        <div className="ms-3 mt-2">
                          {files.length > 0 && (
                            <ul className="list-group">
                              {files.map((file, index) => (
                                <li
                                  key={index}
                                  className="d-flex align-items-center me-3 pb-2 gap-2"
                                >
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-3 text-primary"
                                    }
                                  />
                                  <span className="text-muted text-truncate small">
                                    <a
                                      href={file.fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {file.name}
                                    </a>
                                    <br />
                                    <span className="small">
                                      {formatFileSize(file.size)}
                                    </span>
                                  </span>
                                  <i
                                    className="fa-solid fa-circle-xmark fs-5 text-danger"
                                    title="Delete file"
                                    onClick={() => removeFile(index)} // Clears the file
                                    style={{ cursor: "pointer" }}
                                  />
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade "
        id="viewImageModel"
        tabindex="-1"
        aria-labelledby="viewImageModelLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View File</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body text-center">
              {/* Show Static Image Always */}
              <img
                src={bgImage} // Replace with your static image URL
                alt="Static Preview"
                className="img-fluid rounded shadow max-height: fit-content;
    "
              />

              {/* If a file is selected, check its type */}
              {/* {selectedFile ? (
          selectedFile.type?.startsWith("image/") ? (
            <img
              src={selectedFile.url}
              alt="Uploaded Image"
              className="img-fluid rounded shadow mt-3"
              style={{ maxWidth: "100%", maxHeight: "400px", objectFit: "contain" }}
            />
          ) : (
            <div className="mt-3">
              <p>Preview not available for this file type.</p>
              <a href={selectedFile.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                Download File
              </a>
            </div>
          )
        ) : (
          <p className="text-muted mt-3">No File Available</p>
        )} */}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
function BankDetails({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };

  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0">Bank Details List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>

      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function ChallanDetails({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };
  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0"> Challan Details List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>
      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function DailyEntries({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };
  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0"> Daily Entries List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>

      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function Form27AQuarterly({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };
  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0"> Form 27A (Quarterly) List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>
      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function ProvisionalReceipt({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };
  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0">
              Provisional Receipt (Quarterly) List{" "}
            </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>

      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function Form16AQuarterly({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };
  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0">Form 16A (Quarterly) List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>
      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function Form16Annual({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };
  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0">Form 16 (Annual) List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>
      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function Form16PARTBAnnual({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };
  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0">Form16 PART B (Annual) List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>
      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
function ContractorPANNumber({ navigate }) {
  const columns = [
    {
      name: "No",
      selector: (row) => row.id,
      width: "150px",
    },
    {
      name: "TDS No",
      selector: (row) => row.tdsNo,
    },
    {
      name: "Accountant Id",
      selector: (row) => row.accountantId,
    },
    {
      name: "Accountant Name",
      selector: (row) => row.accountantName,
    },
    //   {
    //     name: 'Purpose',
    //     selector: row => row.purpose,
    //   },
    {
      name: "Deductee Name",
      selector: (row) => row.deducteeName,
    },
    //   {
    //     name: 'Deductee Address',
    //     selector: row => row.deducteeAddress,
    //   },
    {
      name: "Deductee PAN",
      selector: (row) => row.deducteePAN,
    },
    //   {
    //     name: 'Remarks',
    //     selector: row => row.remarks,
    //   },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  title="View"
                  data-bs-toggle="modal"
                  data-bs-target="#detailsModal"
                >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#editModal"
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button
                  type="button"
                  className="btn text-danger btn-sm"
                  title="Delete"
                  onClick={() => deletefunction(row.id)}
                >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const data = [
    {
      id: 1,
      tdsNo: "TDS001",
      accountantId: "ACC123",
      accountantName: "John Doe",
      purpose: "Consulting",
      deducteeName: "XYZ Pvt Ltd",
      deducteeAddress: "123 Street, City",
      deducteePAN: "ABCDE1234F",
      remarks: "Verified",
    },
    {
      id: 2,
      tdsNo: "TDS002",
      accountantId: "ACC456",
      accountantName: "Jane Smith",
      purpose: "Freelance Work",
      deducteeName: "ABC Ltd",
      deducteeAddress: "456 Avenue, City",
      deducteePAN: "FGHIJ5678K",
      remarks: "Pending Approval",
    },
    {
      id: 3,
      tdsNo: "TDS003",
      accountantId: "ACC789",
      accountantName: "Robert Brown",
      purpose: "Software Development",
      deducteeName: "LMN Solutions",
      deducteeAddress: "789 Boulevard, City",
      deducteePAN: "LMNOP9876Z",
      remarks: "Completed",
    },
  ];

  const deletefunction = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        // delete message
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Deleted!',
          text: "Your file has been deleted.",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });
      }
    });
  };
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
    setValue,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    tdsNo: "001",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    deducteeName: "All India",
    deducteeAddress: "individual",
    deducteePAN: "DKZPA1234F",
    panCopy:
      "https://www.shutterstock.com/image-vector/dummy-pan-card-unique-identity-document-1681665595",
    remarks: "Testing",
  };

  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
      // setFiles([backendData.panCopy]);
    }
  }, [backendData, setValue]);

  //file upload
  const onDrop = (acceptedFiles, fileRejections) => {
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

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
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
    console.log("Form Data:", formData);
  };

  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i
              className="fa-solid fa-circle-left fs-5"
              style={{ marginLeft: "10px" }}
              onClick={() => navigate("/financial/tds")}
            ></i>
            <h6 className="fw-bold mb-0">Contractor PAN Number List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by name"
              title="Search by name"
            />
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>
      <div
        class="modal fade"
        id="detailsModal"
        tabindex="-1"
        aria-labelledby="detailsModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">TDS No</label>
                  <p className="ms-2 fw-bold">{backendData.tdsNo}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant ID</label>
                  <p className="ms-2 fw-bold">{backendData.accountantId}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Accountant Name</label>
                  <p className="ms-2 fw-bold">{backendData.accountantName}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Name</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeName}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee Address</label>
                  <p className="ms-2 fw-bold">{backendData.deducteeAddress}</p>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Deductee PAN</label>
                  <p className="ms-2 fw-bold">{backendData.deducteePAN}</p>
                </div>
                <div className="col-md-8 mb-3">
                  <label className="form-label">Upload PAN Copy</label>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <div className="ms-3 mt-2">
                        {files.length > 0 && (
                          <ul className="list-group">
                            {files.map((file, index) => (
                              <li
                                key={index}
                                className="d-flex align-items-center justify-content-between me-3 pt-2 gap-2"
                              >
                                <span className="text-muted text-truncate">
                                  <i
                                    className={
                                      getFileIcon(file.type) +
                                      " fs-5 text-primary"
                                    }
                                  />{" "}
                                  &nbsp; {file.name} (
                                  {formatFileSize(file.size)})
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Remarks</label>
                <p className="ms-2 fw-bold">{backendData.remarks}</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">TDS No</label>
                    <input
                      {...register("tdsNo")}
                      className={`form-control ${errors.tdsNo ? "is-invalid" : ""
                        }`}
                      placeholder="Enter TDS No"
                    />
                    <div className="invalid-feedback">
                      {errors.tdsNo?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant ID</label>
                    <input
                      {...register("accountantId")}
                      className={`form-control ${errors.accountantId ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant ID"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantId?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Accountant Name</label>
                    <input
                      {...register("accountantName")}
                      className={`form-control ${errors.accountantName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Accountant Name"
                    />
                    <div className="invalid-feedback">
                      {errors.accountantName?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Purpose</label>
                    <input
                      {...register("purpose")}
                      className={`form-control ${errors.purpose ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Purpose"
                    />
                    <div className="invalid-feedback">
                      {errors.purpose?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Name</label>
                    <input
                      {...register("deducteeName")}
                      className={`form-control ${errors.deducteeName ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Name"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeName?.message}
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee Address</label>
                    <input
                      {...register("deducteeAddress")}
                      className={`form-control ${errors.deducteeAddress ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee Address"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteeAddress?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Deductee PAN</label>
                    <input
                      {...register("deducteePAN")}
                      className={`form-control ${errors.deducteePAN ? "is-invalid" : ""
                        }`}
                      placeholder="Enter Deductee PAN"
                    />
                    <div className="invalid-feedback">
                      {errors.deducteePAN?.message}
                    </div>
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
                                Drag & drop a PNG/JPEG file here, or click to
                                select a file.Max size: 5MB | Only one file
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
                                    <i
                                      className={
                                        getFileIcon(file.type) +
                                        " fs-5 text-primary"
                                      }
                                    />{" "}
                                    &nbsp; {file.name} (
                                    {(file.size / 1024).toFixed(2)} KB)
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
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Remarks</label>
                  <textarea
                    {...register("remarks")}
                    className="form-control"
                    placeholder="Enter remarks (optional)"
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn  btn-sm btn-primary px-4 adminBtn"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function ListTds() {
  const navigate = useNavigate();
  const location = useLocation();
  const formType = location.state?.name;
  console.log("formType", formType);

  return (
    (formType === "Deductee Entries" && (
      <DeducteeEntries navigate={navigate} />
    )) ||
    (formType === "Bank Details" && <BankDetails navigate={navigate} />) ||
    (formType === "Challan Details" && (
      <ChallanDetails navigate={navigate} />
    )) ||
    (formType === "Daily Entries" && <DailyEntries navigate={navigate} />) ||
    (formType === "Form 27A (Quarterly)" && (
      <Form27AQuarterly navigate={navigate} />
    )) ||
    (formType === "Provisional Receipt (Quarterly)" && (
      <ProvisionalReceipt navigate={navigate} />
    )) ||
    (formType === "Form 16A (Quarterly)" && (
      <Form16AQuarterly navigate={navigate} />
    )) ||
    (formType === "Form 16 (Annual)" && <Form16Annual navigate={navigate} />) ||
    (formType === "Form16 PART B (Annual)" && (
      <Form16PARTBAnnual navigate={navigate} />
    )) ||
    (formType === "Contractor PAN Number" && (
      <ContractorPANNumber navigate={navigate} />
    ))
  );
}

export default ListTds;
