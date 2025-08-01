import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { tableStyle } from "../../constant/Util";


function GSTR1MonthlyChallans({ navigate }) {
  const columns = [
    {
      name: 'Payment Id',
      selector: row => row.paymentId,
      width: '150px',
    },
    {
      name: 'Amount',
      selector: row => row.amount,
    },
    {
      name: 'Payment Date',
      selector: row => row.paymentDate,
    },
    {
      name: 'Payment Method',
      selector: row => row.paymentMethod,
    },
    {
      name: 'Confirmation Status',
      selector: row => row.confirmationStatus,
    },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-info" title='View' data-bs-toggle="modal" data-bs-target="#detailsModal"  >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-success" title='Update' data-bs-toggle="modal" data-bs-target="#editModal">
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)} >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: '600px'
    }
  ];

  const data = [
    {
      paymentId: "PAY1001",
      amount: 5000,
      paymentDate: "2024-02-10",
      paymentMethod: "Bank Transfer",
      confirmationStatus: "Confirmed"
    },
    {
      paymentId: "PAY1002",
      amount: 3200,
      paymentDate: "2024-02-12",
      paymentMethod: "Credit Card",
      confirmationStatus: "Pending"
    },
    {
      paymentId: "PAY1003",
      amount: 4700,
      paymentDate: "2024-02-15",
      paymentMethod: "UPI",
      confirmationStatus: "Confirmed"
    },
    {
      paymentId: "PAY1004",
      amount: 2900,
      paymentDate: "2024-02-18",
      paymentMethod: "Cash",
      confirmationStatus: "Failed"
    },
    {
      paymentId: "PAY1005",
      amount: 5300,
      paymentDate: "2024-02-20",
      paymentMethod: "Net Banking",
      confirmationStatus: "Confirmed"
    }
  ]


  const deletefunction = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
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
    })
  }

  const schema = yup.object().shape({
    employeeName: yup.string().required("Employee Name is required"),
    employeeId: yup.string().required("Employee ID is required"),
    designation: yup.string().required("Designation is required"),
    department: yup.string().required("Department is required"),

    basicSalary: yup.number().positive("Basic Salary must be positive").required("Basic Salary is required"),
    hra: yup.number().min(0, "HRA must be non-negative").required("HRA is required"),
    salaryMonth: yup.string().required("Salary Month is required"),

    paymentMode: yup.string().required("Payment Mode is required"),
    bankAccountNumber: yup.string().when("paymentMode", {
      is: "Bank Transfer",
      then: (schema) => schema.required("Bank Account Number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    da: yup.number().min(0, "DA must be non-negative").required("DA is required"),
    otherAllowances: yup.number().min(0, "Other Allowances must be non-negative").required("Other Allowances are required"),
    deductions: yup.number().min(0, "Deductions must be non-negative").required("Deductions are required"),
    netSalary: yup.number().positive("Net Salary must be positive").required("Net Salary is required"),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const backendData = {
    paymentId: "PAY1005",
    amount: 5300,
    paymentDate: "2024-02-20",
    paymentMethod: "Net Banking",
    confirmationStatus: "Confirmed"

  }
  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Salary statement submitted successfully!");
  };

  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);


  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/gst')}></i>
            <h6 className='fw-bold mb-0'>GSTR-1 Monthly Challans  List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input type="text" className="form-control adminsearch" placeholder="Search by name" title="Search by name" />
            <button className='btn bnt-sm adminsearch-icon'>
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>

      </div>

      <div className="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="row ms-1">

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment ID</label>
                  <p className="ms-2 fw-bold">{backendData.paymentId}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Date</label>
                  <p className="ms-2 fw-bold">{backendData.paymentDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Method</label>
                  <p className="ms-2 fw-bold">{backendData.paymentMethod}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Confirmation Status</label>
                  <p className="ms-2 fw-bold">
                    {backendData.confirmationStatus ? "Confirmed" : "Not Confirmed"}
                  </p>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row ms-1">

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment ID</label>
                    <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
                    <p className="text-danger">{errors.paymentId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Date</label>
                    <input type="date" className="form-control" {...register("paymentDate")} />
                    <p className="text-danger">{errors.paymentDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" {...register("paymentMethod")}>
                      <option value="">Select Payment Method</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                    </select>
                    <p className="text-danger">{errors.paymentMethod?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Confirmation Status</label>
                    <select className="form-select" {...register("confirmationStatus")}>
                      <option value="">Select Confirmation Status</option>
                      <option value={true}>Confirmed</option>
                      <option value={false}>Not Confirmed</option>
                    </select>
                    <p className="text-danger">{errors.confirmationStatus?.message}</p>
                  </div>

                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" className="btn  btn-sm btn-primary px-4 adminBtn">Save Changes</button>
              </div>
            </form>

          </div>
        </div>
      </div>

    </>
  )
}
function GSTR3BMonthlyChallans({ navigate }) {
  const columns = [
    {
      name: 'Payment Id',
      selector: row => row.paymentId,
      width: '150px',
    },
    {
      name: 'Amount',
      selector: row => row.amount,
    },
    {
      name: 'Payment Date',
      selector: row => row.paymentDate,
    },
    {
      name: 'Payment Method',
      selector: row => row.paymentMethod,
    },
    {
      name: 'Confirmation Status',
      selector: row => row.confirmationStatus,
    },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-info" title='View' data-bs-toggle="modal" data-bs-target="#detailsModal"  >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-success" title='Update' data-bs-toggle="modal" data-bs-target="#editModal">
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)} >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: '600px'
    }
  ];

  const data = [
    {
      paymentId: "PAY1001",
      amount: 5000,
      paymentDate: "2024-02-10",
      paymentMethod: "Bank Transfer",
      confirmationStatus: "Confirmed"
    },
    {
      paymentId: "PAY1002",
      amount: 3200,
      paymentDate: "2024-02-12",
      paymentMethod: "Credit Card",
      confirmationStatus: "Pending"
    },
    {
      paymentId: "PAY1003",
      amount: 4700,
      paymentDate: "2024-02-15",
      paymentMethod: "UPI",
      confirmationStatus: "Confirmed"
    },
    {
      paymentId: "PAY1004",
      amount: 2900,
      paymentDate: "2024-02-18",
      paymentMethod: "Cash",
      confirmationStatus: "Failed"
    },
    {
      paymentId: "PAY1005",
      amount: 5300,
      paymentDate: "2024-02-20",
      paymentMethod: "Net Banking",
      confirmationStatus: "Confirmed"
    }
  ]


  const deletefunction = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
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
    })
  }

  const schema = yup.object().shape({
    employeeName: yup.string().required("Employee Name is required"),
    employeeId: yup.string().required("Employee ID is required"),
    designation: yup.string().required("Designation is required"),
    department: yup.string().required("Department is required"),

    basicSalary: yup.number().positive("Basic Salary must be positive").required("Basic Salary is required"),
    hra: yup.number().min(0, "HRA must be non-negative").required("HRA is required"),
    salaryMonth: yup.string().required("Salary Month is required"),

    paymentMode: yup.string().required("Payment Mode is required"),
    bankAccountNumber: yup.string().when("paymentMode", {
      is: "Bank Transfer",
      then: (schema) => schema.required("Bank Account Number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    da: yup.number().min(0, "DA must be non-negative").required("DA is required"),
    otherAllowances: yup.number().min(0, "Other Allowances must be non-negative").required("Other Allowances are required"),
    deductions: yup.number().min(0, "Deductions must be non-negative").required("Deductions are required"),
    netSalary: yup.number().positive("Net Salary must be positive").required("Net Salary is required"),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const backendData = {
    paymentId: "PAY1005",
    amount: 5300,
    paymentDate: "2024-02-20",
    paymentMethod: "Net Banking",
    confirmationStatus: "Confirmed"

  }
  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Salary statement submitted successfully!");
  };

  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);


  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/gst')}></i>
            <h6 className='fw-bold mb-0'>GSTR-3B Monthly Challans  List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input type="text" className="form-control adminsearch" placeholder="Search by name" title="Search by name" />
            <button className='btn bnt-sm adminsearch-icon'>
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>

      </div>

      <div className="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="row ms-1">

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment ID</label>
                  <p className="ms-2 fw-bold">{backendData.paymentId}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Date</label>
                  <p className="ms-2 fw-bold">{backendData.paymentDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Method</label>
                  <p className="ms-2 fw-bold">{backendData.paymentMethod}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Confirmation Status</label>
                  <p className="ms-2 fw-bold">
                    {backendData.confirmationStatus ? "Confirmed" : "Not Confirmed"}
                  </p>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row ms-1">

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment ID</label>
                    <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
                    <p className="text-danger">{errors.paymentId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Date</label>
                    <input type="date" className="form-control" {...register("paymentDate")} />
                    <p className="text-danger">{errors.paymentDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" {...register("paymentMethod")}>
                      <option value="">Select Payment Method</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                    </select>
                    <p className="text-danger">{errors.paymentMethod?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Confirmation Status</label>
                    <select className="form-select" {...register("confirmationStatus")}>
                      <option value="">Select Confirmation Status</option>
                      <option value={true}>Confirmed</option>
                      <option value={false}>Not Confirmed</option>
                    </select>
                    <p className="text-danger">{errors.confirmationStatus?.message}</p>
                  </div>

                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" className="btn  btn-sm btn-primary px-4 adminBtn">Save Changes</button>
              </div>
            </form>

          </div>
        </div>
      </div>

    </>
  )
}
function GSTRMonthlyPaymentConfirmations({ navigate }) {
  const columns = [
    {
      name: 'Payment Id',
      selector: row => row.paymentId,
      width: '150px',
    },
    {
      name: 'Amount',
      selector: row => row.amount,
    },
    {
      name: 'Payment Date',
      selector: row => row.paymentDate,
    },
    {
      name: 'Payment Method',
      selector: row => row.paymentMethod,
    },
    {
      name: 'Confirmation Status',
      selector: row => row.confirmationStatus,
    },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-info" title='View' data-bs-toggle="modal" data-bs-target="#detailsModal"  >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-success" title='Update' data-bs-toggle="modal" data-bs-target="#editModal">
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)} >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: '600px'
    }
  ];

  const data = [
    {
      paymentId: "PAY1001",
      amount: 5000,
      paymentDate: "2024-02-10",
      paymentMethod: "Bank Transfer",
      confirmationStatus: "Confirmed"
    },
    {
      paymentId: "PAY1002",
      amount: 3200,
      paymentDate: "2024-02-12",
      paymentMethod: "Credit Card",
      confirmationStatus: "Pending"
    },
    {
      paymentId: "PAY1003",
      amount: 4700,
      paymentDate: "2024-02-15",
      paymentMethod: "UPI",
      confirmationStatus: "Confirmed"
    },
    {
      paymentId: "PAY1004",
      amount: 2900,
      paymentDate: "2024-02-18",
      paymentMethod: "Cash",
      confirmationStatus: "Failed"
    },
    {
      paymentId: "PAY1005",
      amount: 5300,
      paymentDate: "2024-02-20",
      paymentMethod: "Net Banking",
      confirmationStatus: "Confirmed"
    }
  ]


  const deletefunction = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
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
    })
  }

  const schema = yup.object().shape({
    employeeName: yup.string().required("Employee Name is required"),
    employeeId: yup.string().required("Employee ID is required"),
    designation: yup.string().required("Designation is required"),
    department: yup.string().required("Department is required"),

    basicSalary: yup.number().positive("Basic Salary must be positive").required("Basic Salary is required"),
    hra: yup.number().min(0, "HRA must be non-negative").required("HRA is required"),
    salaryMonth: yup.string().required("Salary Month is required"),

    paymentMode: yup.string().required("Payment Mode is required"),
    bankAccountNumber: yup.string().when("paymentMode", {
      is: "Bank Transfer",
      then: (schema) => schema.required("Bank Account Number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    da: yup.number().min(0, "DA must be non-negative").required("DA is required"),
    otherAllowances: yup.number().min(0, "Other Allowances must be non-negative").required("Other Allowances are required"),
    deductions: yup.number().min(0, "Deductions must be non-negative").required("Deductions are required"),
    netSalary: yup.number().positive("Net Salary must be positive").required("Net Salary is required"),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const backendData = {
    paymentId: "PAY1005",
    amount: 5300,
    paymentDate: "2024-02-20",
    paymentMethod: "Net Banking",
    confirmationStatus: "Confirmed"

  }
  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Salary statement submitted successfully!");
  };

  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);


  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/gst')}></i>
            <h6 className='fw-bold mb-0'>GSTR Monthly Payment Confirmations  List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input type="text" className="form-control adminsearch" placeholder="Search by name" title="Search by name" />
            <button className='btn bnt-sm adminsearch-icon'>
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>

      </div>

      <div className="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="row ms-1">

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment ID</label>
                  <p className="ms-2 fw-bold">{backendData.paymentId}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Date</label>
                  <p className="ms-2 fw-bold">{backendData.paymentDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Method</label>
                  <p className="ms-2 fw-bold">{backendData.paymentMethod}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Confirmation Status</label>
                  <p className="ms-2 fw-bold">
                    {backendData.confirmationStatus ? "Confirmed" : "Not Confirmed"}
                  </p>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row ms-1">

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment ID</label>
                    <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
                    <p className="text-danger">{errors.paymentId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Date</label>
                    <input type="date" className="form-control" {...register("paymentDate")} />
                    <p className="text-danger">{errors.paymentDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" {...register("paymentMethod")}>
                      <option value="">Select Payment Method</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                    </select>
                    <p className="text-danger">{errors.paymentMethod?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Confirmation Status</label>
                    <select className="form-select" {...register("confirmationStatus")}>
                      <option value="">Select Confirmation Status</option>
                      <option value={true}>Confirmed</option>
                      <option value={false}>Not Confirmed</option>
                    </select>
                    <p className="text-danger">{errors.confirmationStatus?.message}</p>
                  </div>

                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" className="btn  btn-sm btn-primary px-4 adminBtn">Save Changes</button>
              </div>
            </form>

          </div>
        </div>
      </div>

    </>
  )
}
function GSTR9AnnualReturn({ navigate }) {
  const columns = [
    {
      name: 'Payment Id',
      selector: row => row.paymentId,
      width: '150px',
    },
    {
      name: 'Amount',
      selector: row => row.amount,
    },
    {
      name: 'Payment Date',
      selector: row => row.paymentDate,
    },
    {
      name: 'Payment Method',
      selector: row => row.paymentMethod,
    },
    {
      name: 'Confirmation Status',
      selector: row => row.confirmationStatus,
    },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-info" title='View' data-bs-toggle="modal" data-bs-target="#detailsModal"  >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-success" title='Update' data-bs-toggle="modal" data-bs-target="#editModal">
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)} >
                  <i className="fa fa-trash" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: '600px'
    }
  ];

  const data = [
    {
      paymentId: "PAY1001",
      amount: 5000,
      paymentDate: "2024-02-10",
      paymentMethod: "Bank Transfer",
      confirmationStatus: "Confirmed"
    },
    {
      paymentId: "PAY1002",
      amount: 3200,
      paymentDate: "2024-02-12",
      paymentMethod: "Credit Card",
      confirmationStatus: "Pending"
    },
    {
      paymentId: "PAY1003",
      amount: 4700,
      paymentDate: "2024-02-15",
      paymentMethod: "UPI",
      confirmationStatus: "Confirmed"
    },
    {
      paymentId: "PAY1004",
      amount: 2900,
      paymentDate: "2024-02-18",
      paymentMethod: "Cash",
      confirmationStatus: "Failed"
    },
    {
      paymentId: "PAY1005",
      amount: 5300,
      paymentDate: "2024-02-20",
      paymentMethod: "Net Banking",
      confirmationStatus: "Confirmed"
    }
  ]


  const deletefunction = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
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
    })
  }

  const schema = yup.object().shape({
    employeeName: yup.string().required("Employee Name is required"),
    employeeId: yup.string().required("Employee ID is required"),
    designation: yup.string().required("Designation is required"),
    department: yup.string().required("Department is required"),

    basicSalary: yup.number().positive("Basic Salary must be positive").required("Basic Salary is required"),
    hra: yup.number().min(0, "HRA must be non-negative").required("HRA is required"),
    salaryMonth: yup.string().required("Salary Month is required"),

    paymentMode: yup.string().required("Payment Mode is required"),
    bankAccountNumber: yup.string().when("paymentMode", {
      is: "Bank Transfer",
      then: (schema) => schema.required("Bank Account Number is required"),
      otherwise: (schema) => schema.notRequired(),
    }),

    da: yup.number().min(0, "DA must be non-negative").required("DA is required"),
    otherAllowances: yup.number().min(0, "Other Allowances must be non-negative").required("Other Allowances are required"),
    deductions: yup.number().min(0, "Deductions must be non-negative").required("Deductions are required"),
    netSalary: yup.number().positive("Net Salary must be positive").required("Net Salary is required"),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const backendData = {
    paymentId: "PAY1005",
    amount: 5300,
    paymentDate: "2024-02-20",
    paymentMethod: "Net Banking",
    confirmationStatus: "Confirmed"

  }
  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Salary statement submitted successfully!");
  };

  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);


  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/gst')}></i>
            <h6 className='fw-bold mb-0'>GSTR-9 Annual Return  List </h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <input type="text" className="form-control adminsearch" placeholder="Search by name" title="Search by name" />
            <button className='btn bnt-sm adminsearch-icon'>
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
          </div>
        </div>
        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>

      </div>

      <div className="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className="row ms-1">

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment ID</label>
                  <p className="ms-2 fw-bold">{backendData.paymentId}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Date</label>
                  <p className="ms-2 fw-bold">{backendData.paymentDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Method</label>
                  <p className="ms-2 fw-bold">{backendData.paymentMethod}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Confirmation Status</label>
                  <p className="ms-2 fw-bold">
                    {backendData.confirmationStatus ? "Confirmed" : "Not Confirmed"}
                  </p>
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row ms-1">

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment ID</label>
                    <input type="text" className="form-control" placeholder="Enter Payment ID" {...register("paymentId")} />
                    <p className="text-danger">{errors.paymentId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter Amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Date</label>
                    <input type="date" className="form-control" {...register("paymentDate")} />
                    <p className="text-danger">{errors.paymentDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Method</label>
                    <select className="form-select" {...register("paymentMethod")}>
                      <option value="">Select Payment Method</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Debit Card">Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                    </select>
                    <p className="text-danger">{errors.paymentMethod?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Confirmation Status</label>
                    <select className="form-select" {...register("confirmationStatus")}>
                      <option value="">Select Confirmation Status</option>
                      <option value={true}>Confirmed</option>
                      <option value={false}>Not Confirmed</option>
                    </select>
                    <p className="text-danger">{errors.confirmationStatus?.message}</p>
                  </div>

                </div>

              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" className="btn  btn-sm btn-primary px-4 adminBtn">Save Changes</button>
              </div>
            </form>

          </div>
        </div>
      </div>

    </>
  )
}
function GSTList() {
  const navigate = useNavigate();
  const location = useLocation();
  const formType = location.state?.name;

  console.log("formType", formType);
  return (
    formType === 'GSTR-1 Monthly Challans' && <GSTR1MonthlyChallans navigate={navigate} /> || formType === 'GSTR-3B Monthly Challans' && <GSTR3BMonthlyChallans navigate={navigate} /> || formType === 'GSTR Monthly Payment Confirmations' && <GSTRMonthlyPaymentConfirmations navigate={navigate} /> || formType === 'GSTR-9 Annual Return' && <GSTR9AnnualReturn navigate={navigate} />
  )
}

export default GSTList