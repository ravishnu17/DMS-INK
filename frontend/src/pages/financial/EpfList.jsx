import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { useLocation, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { tableStyle } from "../../constant/Util";

function SalaryStatementForm({ navigate }) {
  const columns = [
    {
      name: 'Employee Id',
      selector: row => row.employeeId,
      width: '150px',
    },
    {
      name: 'Employee Name',
      selector: row => row.employeeName,
    },
    {
      name: 'Designation',
      selector: row => row.designation,
    },
    {
      name: 'Basic Salary',
      selector: row => row.basicSalary,
    },
    {
      name: 'Bonus',
      selector: row => row.bonus,
    },
    {
      name: 'Deductions',
      selector: row => row.deductions,
    },
    {
      name: 'Net Salary',
      selector: row => row.netSalary,
    },
    {
      name: 'salaryMonth',
      selector: row => row.salaryMonth,
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
      employeeId: "101",
      employeeName: "John Doe",
      designation: "Software Engineer",
      basicSalary: 50000,
      bonus: 5000,
      deductions: 2000,
      netSalary: 53000,
      salaryMonth: "January 2025"
    },
    {
      employeeId: "102",
      employeeName: "Jane Smith",
      designation: "Product Manager",
      basicSalary: 70000,
      bonus: 7000,
      deductions: 3000,
      netSalary: 74000,
      salaryMonth: "January 2025"
    },
    {
      employeeId: "103",
      employeeName: "Mark Johnson",
      designation: "HR Manager",
      basicSalary: 60000,
      bonus: 6000,
      deductions: 2500,
      netSalary: 63500,
      salaryMonth: "January 2025"
    },
    {
      employeeId: "104",
      employeeName: "Emily Davis",
      designation: "Data Analyst",
      basicSalary: 55000,
      bonus: 5000,
      deductions: 1500,
      netSalary: 58500,
      salaryMonth: "January 2025"
    },
    {
      employeeId: "105",
      employeeName: "Samuel Lee",
      designation: "Software Tester",
      basicSalary: 45000,
      bonus: 4500,
      deductions: 1800,
      netSalary: 49300,
      salaryMonth: "January 2025"
    }
  ];

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
    employeeName: "Ajith",
    employeeId: "001",
    designation: "Java Developer",
    department: "Java",
    basicSalary: "20000",
    hra: "1000",
    salaryMonth: "10000",
    paymentMode: "Bank Pass book",
    bankAccountNumber: "1739104000399",
    da: "12333",
    otherAllowances: "100",
    deductions: "2000",
    netSalary: "18000",

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
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/epf')}></i>
            <h5 className='fw-bold mb-0'>Salary Statement List </h5>
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

      <div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row ms-1">
                <div className="col-md-4 mb-1">
                  <label className="form-label">Employee Name</label>
                  <p className="ms-2 fw-bold">{backendData.employeeName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Employee ID</label>
                  <p className="ms-2 fw-bold">{backendData.employeeId}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Designation</label>
                  <p className="ms-2 fw-bold">{backendData.designation}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Department</label>
                  <p className="ms-2 fw-bold">{backendData.department}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Basic Salary</label>
                  <p className="ms-2 fw-bold">{backendData.basicSalary}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">HRA</label>
                  <p className="ms-2 fw-bold">{backendData.hra}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Salary Month</label>
                  <p className="ms-2 fw-bold">{backendData.salaryMonth}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Mode</label>
                  <p className="ms-2 fw-bold">{backendData.paymentMode}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Bank Account Number</label>
                  <p className="ms-2 fw-bold">{backendData.bankAccountNumber}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">DA (Dearness Allowance)</label>
                  <p className="ms-2 fw-bold">{backendData.da}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Other Allowances</label>
                  <p className="ms-2 fw-bold">{backendData.otherAllowances}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Deductions (PF, Tax, etc.)</label>
                  <p className="ms-2 fw-bold">{backendData.deductions}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Net Salary</label>
                  <p className="ms-2 fw-bold">{backendData.netSalary}</p>
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
                    <label className="form-label">Employee Name</label>
                    <input type="text" className="form-control" {...register("employeeName")} />
                    <p className="text-danger">{errors.employeeName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Employee ID</label>
                    <input type="text" className="form-control" {...register("employeeId")} />
                    <p className="text-danger">{errors.employeeId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Designation</label>
                    <input type="text" className="form-control" {...register("designation")} />
                    <p className="text-danger">{errors.designation?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" {...register("department")} />
                    <p className="text-danger">{errors.department?.message}</p>
                  </div>

                  {/* Salary Details */}
                  <div className="col-md-4 mb-1">
                    <label className="form-label">Basic Salary</label>
                    <input type="number" className="form-control" {...register("basicSalary")} />
                    <p className="text-danger">{errors.basicSalary?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">HRA</label>
                    <input type="number" className="form-control" {...register("hra")} />
                    <p className="text-danger">{errors.hra?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Salary Month</label>
                    <input type="month" className="form-control" {...register("salaryMonth")} />
                    <p className="text-danger">{errors.salaryMonth?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Mode</label>
                    <select className="form-select" {...register("paymentMode")}>
                      <option value="">Select Payment Mode</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                    <p className="text-danger">{errors.paymentMode?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Bank Account Number</label>
                    <input type="text" className="form-control" {...register("bankAccountNumber")} />
                    <p className="text-danger">{errors.bankAccountNumber?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">DA (Dearness Allowance)</label>
                    <input type="number" className="form-control" {...register("da")} />
                    <p className="text-danger">{errors.da?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Other Allowances</label>
                    <input type="number" className="form-control" {...register("otherAllowances")} />
                    <p className="text-danger">{errors.otherAllowances?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Deductions (PF, Tax, etc.)</label>
                    <input type="number" className="form-control" {...register("deductions")} />
                    <p className="text-danger">{errors.deductions?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Net Salary</label>
                    <input type="number" className="form-control" {...register("netSalary")} />
                    <p className="text-danger">{errors.netSalary?.message}</p>
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
function EpfChallan({ navigate }) {
  const columns = [
    {
      name: 'Challan Id',
      selector: row => row.challanId,
      width: '150px',
    },
    {
      name: 'Employee Name',
      selector: row => row.employeeName,
    },
    {
      name: 'Designation',
      selector: row => row.designation,
    },
    {
      name: 'Basic Salary',
      selector: row => row.basicSalary,
    },
    {
      name: 'Bank Account Number',
      selector: row => row.bankAccountNumber,
    },
    {
      name: 'Deductions',
      selector: row => row.deductions,
    },
    {
      name: 'Net Salary',
      selector: row => row.netSalary,
    },
    {
      name: 'salaryMonth',
      selector: row => row.salaryMonth,
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
      "challanId": "CH001",
      "employeeName": "John Doe",
      "employeeId": "E101",
      "designation": "Software Engineer",
      "department": "IT",
      "basicSalary": 50000,
      "hra": 5000,
      "salaryMonth": "January 2025",
      "paymentMode": "Bank Transfer",
      "bankAccountNumber": "1234567890",
      "da": 3000,
      "otherAllowances": 2000,
      "deductions": 1000,
      "netSalary": 57000
    },
    {
      "challanId": "CH002",
      "employeeName": "Jane Smith",
      "employeeId": "E102",
      "designation": "Product Manager",
      "department": "Marketing",
      "basicSalary": 70000,
      "hra": 7000,
      "salaryMonth": "January 2025",
      "paymentMode": "Bank Transfer",
      "bankAccountNumber": "2345678901",
      "da": 4000,
      "otherAllowances": 3000,
      "deductions": 1500,
      "netSalary": 78000
    },
    {
      "challanId": "CH003",
      "employeeName": "Mark Johnson",
      "employeeId": "E103",
      "designation": "HR Manager",
      "department": "Human Resources",
      "basicSalary": 60000,
      "hra": 6000,
      "salaryMonth": "January 2025",
      "paymentMode": "Cash",
      "bankAccountNumber": "",
      "da": 3500,
      "otherAllowances": 2500,
      "deductions": 1200,
      "netSalary": 67500
    },
    {
      "challanId": "CH004",
      "employeeName": "Emily Davis",
      "employeeId": "E104",
      "designation": "Data Analyst",
      "department": "Data Science",
      "basicSalary": 55000,
      "hra": 5500,
      "salaryMonth": "January 2025",
      "paymentMode": "Bank Transfer",
      "bankAccountNumber": "3456789012",
      "da": 3200,
      "otherAllowances": 1800,
      "deductions": 900,
      "netSalary": 60100
    },
    {
      "challanId": "CH005",
      "employeeName": "Samuel Lee",
      "employeeId": "E105",
      "designation": "Software Tester",
      "department": "Quality Assurance",
      "basicSalary": 45000,
      "hra": 4500,
      "salaryMonth": "January 2025",
      "paymentMode": "Bank Transfer",
      "bankAccountNumber": "4567890123",
      "da": 2500,
      "otherAllowances": 1500,
      "deductions": 1000,
      "netSalary": 48500
    }
  ]



  const schema = yup.object().shape({
    challanId: yup.string().required("Challan ID is required"),
    employeeName: yup.string().required("Employee Name is required"),
    employeeId: yup.string().required("Employee ID is required"),
    designation: yup.string().required("Designation is required"),
    department: yup.string().required("Department is required"),
    basicSalary: yup.number().positive("Salary must be positive").required("Basic Salary is required"),
    hra: yup.number().positive("HRA must be positive").required("HRA is required"),
    salaryMonth: yup.string().required("Salary Month is required"),
    paymentMode: yup.string().required("Payment Mode is required"),
    bankAccountNumber: yup.string().when('paymentMode', {
      is: 'Bank Transfer',
      then: yup.string().required('Bank Account Number is required')
    }),
    da: yup.number().positive("DA must be positive").required("DA is required"),
    otherAllowances: yup.number().positive("Other Allowances must be positive"),
    deductions: yup.number().positive("Deductions must be positive"),
    netSalary: yup.number().positive("Net Salary must be positive").required("Net Salary is required"),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch } = useForm({ resolver: yupResolver(schema) });

  const backendData = {
    "challanId": "CH005",
    "employeeName": "Samuel Lee",
    "employeeId": "E105",
    "designation": "Software Tester",
    "department": "Quality Assurance",
    "basicSalary": 45000,
    "hra": 4500,
    "salaryMonth": "January 2025",
    "paymentMode": "Bank Transfer",
    "bankAccountNumber": "4567890123",
    "da": 2500,
    "otherAllowances": 1500,
    "deductions": 1000,
    "netSalary": 48500
  }
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
  // Populate form fields with backend response
  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        if (watch(key) !== backendData[key]) { // Only update if different
          setValue(key, backendData[key], { shouldDirty: false, shouldValidate: false });
        }
      });
    }
  }, [backendData, setValue, watch]);
  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert(" submitted successfully!");
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/epf')}></i>
            <h6 className='fw-bold mb-0'>Chalan List </h6>
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

      <div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row ms-1">
                <div className="col-md-4 mb-1">
                  <label className="form-label">Challan ID</label>
                  <p className="ms-2 fw-bold">{backendData.challanId}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Employee Name</label>
                  <p className="ms-2 fw-bold">{backendData.employeeName}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Employee ID</label>
                  <p className="ms-2 fw-bold">{backendData.employeeId}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Designation</label>
                  <p className="ms-2 fw-bold">{backendData.designation}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Department</label>
                  <p className="ms-2 fw-bold">{backendData.department}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Basic Salary</label>
                  <p className="ms-2 fw-bold">{backendData.basicSalary}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">HRA (House Rent Allowance)</label>
                  <p className="ms-2 fw-bold">{backendData.hra}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Salary Month</label>
                  <p className="ms-2 fw-bold">{backendData.salaryMonth}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Mode</label>
                  <p className="ms-2 fw-bold">{backendData.paymentMode}</p>
                </div>
                {watch("paymentMode") === "Bank Transfer" && (
                  <div className="col-md-4 mb-1">
                    <label className="form-label">Bank Account Number</label>
                    <p className="ms-2 fw-bold">{backendData.bankAccountNumber}</p>
                  </div>
                )}
                <div className="col-md-4 mb-1">
                  <label className="form-label">DA (Dearness Allowance)</label>
                  <p className="ms-2 fw-bold">{backendData.da}</p>
                  <p className="text-danger">{errors.da?.message}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Other Allowances</label>
                  <p className="ms-2 fw-bold">{backendData.otherAllowances}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Deductions (PF, Tax, etc.)</label>
                  <p className="ms-2 fw-bold">{backendData.deductions}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Net Salary</label>
                  <p className="ms-2 fw-bold">{backendData.netSalary}</p>
                  <p className="text-danger">{errors.netSalary?.message}</p>
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
                    <label className="form-label">Challan ID</label>
                    <input type="text" className="form-control" placeholder="Enter Challan ID" {...register("challanId")} />
                    <p className="text-danger">{errors.challanId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Employee Name</label>
                    <input type="text" className="form-control" placeholder="Enter Employee Name" {...register("employeeName")} />
                    <p className="text-danger">{errors.employeeName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Employee ID</label>
                    <input type="text" className="form-control" placeholder="Enter Employee ID" {...register("employeeId")} />
                    <p className="text-danger">{errors.employeeId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Designation</label>
                    <input type="text" className="form-control" placeholder="Enter Designation" {...register("designation")} />
                    <p className="text-danger">{errors.designation?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" placeholder="Enter Department" {...register("department")} />
                    <p className="text-danger">{errors.department?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Basic Salary</label>
                    <input type="number" className="form-control" placeholder="Enter Basic Salary" {...register("basicSalary")} />
                    <p className="text-danger">{errors.basicSalary?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">HRA (House Rent Allowance)</label>
                    <input type="number" className="form-control" placeholder="Enter HRA" {...register("hra")} />
                    <p className="text-danger">{errors.hra?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Salary Month</label>
                    <input type="text" className="form-control" placeholder="Enter Salary Month" {...register("salaryMonth")} />
                    <p className="text-danger">{errors.salaryMonth?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Mode</label>
                    <select className="form-select" {...register("paymentMode")}>
                      <option value="">Select Payment Mode</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Cash">Cash</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                    <p className="text-danger">{errors.paymentMode?.message}</p>
                  </div>

                  {watch("paymentMode") === "Bank Transfer" && (
                    <div className="col-md-4 mb-1">
                      <label className="form-label">Bank Account Number</label>
                      <input type="text" className="form-control" placeholder="Enter Bank Account Number" {...register("bankAccountNumber")} />
                      <p className="text-danger">{errors.bankAccountNumber?.message}</p>
                    </div>
                  )}

                  <div className="col-md-4 mb-1">
                    <label className="form-label">DA (Dearness Allowance)</label>
                    <input type="number" className="form-control" placeholder="Enter DA" {...register("da")} />
                    <p className="text-danger">{errors.da?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Other Allowances</label>
                    <input type="number" className="form-control" placeholder="Enter Other Allowances" {...register("otherAllowances")} />
                    <p className="text-danger">{errors.otherAllowances?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Deductions (PF, Tax, etc.)</label>
                    <input type="number" className="form-control" placeholder="Enter Deductions" {...register("deductions")} />
                    <p className="text-danger">{errors.deductions?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Net Salary</label>
                    <input type="number" className="form-control" placeholder="Enter Net Salary" {...register("netSalary")} />
                    <p className="text-danger">{errors.netSalary?.message}</p>
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
function PenaltyChallan({ navigate }) {
  const columns = [
    {
      name: 'Challan Id',
      selector: row => row.challanId,
      width: '150px',
    },
    {
      name: 'Penalty Amount',
      selector: row => row.penaltyAmount,
    },
    {
      name: 'Penalty Reason',
      selector: row => row.penaltyReason,
    },
    {
      name: 'Employee Name',
      selector: row => row.employeeName,
    },
    {
      name: 'Issue Date',
      selector: row => row.paymentStatus,
    },
    {
      name: 'Deductions',
      selector: row => row.issueDate,
    },
    {
      name: 'Due Date',
      selector: row => row.dueDate,
    },
    {
      name: 'Comments',
      selector: row => row.comments,
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
      "challanId": "CHL001",
      "penaltyAmount": 5000,
      "penaltyReason": "Late submission of documents",
      "employeeId": "EMP101",
      "employeeName": "John Doe",
      "department": "Finance",
      "issueDate": "2024-02-01",
      "dueDate": "2024-02-10",
      "paymentStatus": "Paid",
      "paymentMode": "Bank Transfer",
      "bankDetails": "HDFC Bank - A/C 1234567890",
      "comments": "Penalty cleared successfully."
    },
    {
      "challanId": "CHL002",
      "penaltyAmount": 2500,
      "penaltyReason": "Unauthorized leave",
      "employeeId": "EMP102",
      "employeeName": "Jane Smith",
      "department": "HR",
      "issueDate": "2024-01-15",
      "dueDate": "2024-01-25",
      "paymentStatus": "Unpaid",
      "paymentMode": "",
      "bankDetails": "",
      "comments": "Pending clearance."
    },
    {
      "challanId": "CHL003",
      "penaltyAmount": 7000,
      "penaltyReason": "Misuse of company resources",
      "employeeId": "EMP103",
      "employeeName": "Michael Brown",
      "department": "IT",
      "issueDate": "2024-01-20",
      "dueDate": "2024-02-05",
      "paymentStatus": "Paid",
      "paymentMode": "Cash",
      "bankDetails": "",
      "comments": "Paid in office."
    },
    {
      "challanId": "CHL004",
      "penaltyAmount": 3000,
      "penaltyReason": "Incomplete project submission",
      "employeeId": "EMP104",
      "employeeName": "Emily Johnson",
      "department": "Operations",
      "issueDate": "2024-02-05",
      "dueDate": "2024-02-15",
      "paymentStatus": "Paid",
      "paymentMode": "Bank Transfer",
      "bankDetails": "SBI Bank - A/C 9876543210",
      "comments": "Processed online."
    },
    {
      "challanId": "CHL005",
      "penaltyAmount": 4500,
      "penaltyReason": "Violation of company policies",
      "employeeId": "EMP105",
      "employeeName": "Robert Wilson",
      "department": "Admin",
      "issueDate": "2024-02-10",
      "dueDate": "2024-02-20",
      "paymentStatus": "Unpaid",
      "paymentMode": "",
      "bankDetails": "",
      "comments": "Under review."
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
    challanId: yup.string().required("Challan ID is required"),
    penaltyAmount: yup.number().positive("Penalty amount must be positive").required("Penalty amount is required"),
    penaltyReason: yup.string().required("Penalty reason is required"),
    employeeId: yup.string().required("Employee ID is required"),
    employeeName: yup.string().required("Employee Name is required"),
    department: yup.string().required("Department is required"),
    issueDate: yup.date().required("Issue Date is required").max(new Date(), "Issue date cannot be in the future"),
    dueDate: yup.date().required("Due Date is required").min(yup.ref('issueDate'), "Due date must be after Issue date"),
    paymentStatus: yup.string().required("Payment status is required"),
    paymentMode: yup.string().when('paymentStatus', {
      is: 'Paid',
      then: yup.string().required("Payment Mode is required"),
    }),
    bankDetails: yup.string().when('paymentMode', {
      is: 'Bank Transfer',
      then: yup.string().required("Bank Details are required"),
    }),
    comments: yup.string().optional(),
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const backendData = {
    "challanId": "CHL001",
    "penaltyAmount": 5000,
    "penaltyReason": "Late submission of documents",
    "employeeId": "EMP101",
    "employeeName": "John Doe",
    "department": "Finance",
    "issueDate": "2024-02-01",
    "dueDate": "2024-02-10",
    "paymentStatus": "Paid",
    "paymentMode": "Bank Transfer",
    "bankDetails": "HDFC Bank - A/C 1234567890",
    "comments": "Penalty cleared successfully."
  }
  const onSubmit = (data) => {
    console.log("Form Submitted:", data);
    alert("Salary statement submitted successfully!");
  };

  useEffect(() => {
    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        if (watch(key) !== backendData[key]) { // Only update if different
          setValue(key, backendData[key], { shouldDirty: false, shouldValidate: false });
        }
      });
    }
  }, [backendData, setValue, watch]);


  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/epf')}></i>
            <h6 className='fw-bold mb-0'>Penalty Challan List </h6>
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

      <div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row ms-1">
                <div className="col-md-4 mb-1">
                  <label className="form-label">Challan ID</label>
                  <p className="ms-2 fw-bold">{backendData.challanId}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Employee Name</label>
                  <p className="ms-2 fw-bold">{backendData.employeeName}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Employee ID</label>
                  <p className="ms-2 fw-bold">{backendData.employeeId}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Designation</label>
                  <p className="ms-2 fw-bold">{backendData.designation}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Department</label>
                  <p className="ms-2 fw-bold">{backendData.department}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Basic Salary</label>
                  <p className="ms-2 fw-bold">{backendData.basicSalary}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">HRA (House Rent Allowance)</label>
                  <p className="ms-2 fw-bold">{backendData.hra}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Salary Month</label>
                  <p className="ms-2 fw-bold">{backendData.salaryMonth}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Mode</label>
                  <p className="ms-2 fw-bold">{backendData.paymentMode}</p>
                </div>
                {watch("paymentMode") === "Bank Transfer" && (
                  <div className="col-md-4 mb-1">
                    <label className="form-label">Bank Account Number</label>
                    <p className="ms-2 fw-bold">{backendData.bankAccountNumber}</p>
                  </div>
                )}
                <div className="col-md-4 mb-1">
                  <label className="form-label">DA (Dearness Allowance)</label>
                  <p className="ms-2 fw-bold">{backendData.da}</p>
                  <p className="text-danger">{errors.da?.message}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Other Allowances</label>
                  <p className="ms-2 fw-bold">{backendData.otherAllowances}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Deductions (PF, Tax, etc.)</label>
                  <p className="ms-2 fw-bold">{backendData.deductions}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Net Salary</label>
                  <p className="ms-2 fw-bold">{backendData.netSalary}</p>
                  <p className="text-danger">{errors.netSalary?.message}</p>
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
                    <label className="form-label">Challan ID</label>
                    <input type="text" className="form-control" placeholder="Enter Challan ID" {...register("challanId")} />
                    <p className="text-danger">{errors.challanId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Penalty Amount</label>
                    <input type="number" className="form-control" placeholder="Enter Penalty Amount" {...register("penaltyAmount")} />
                    <p className="text-danger">{errors.penaltyAmount?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Penalty Reason</label>
                    <input type="text" className="form-control" placeholder="Enter Penalty Reason" {...register("penaltyReason")} />
                    <p className="text-danger">{errors.penaltyReason?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Employee ID</label>
                    <input type="text" className="form-control" placeholder="Enter Employee ID" {...register("employeeId")} />
                    <p className="text-danger">{errors.employeeId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Employee Name</label>
                    <input type="text" className="form-control" placeholder="Enter Employee Name" {...register("employeeName")} />
                    <p className="text-danger">{errors.employeeName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" placeholder="Enter Department" {...register("department")} />
                    <p className="text-danger">{errors.department?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Issue Date</label>
                    <input type="date" className="form-control" {...register("issueDate")} />
                    <p className="text-danger">{errors.issueDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-control" {...register("dueDate")} />
                    <p className="text-danger">{errors.dueDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Payment Status</label>
                    <select className="form-select" {...register("paymentStatus")}>
                      <option value="">Select Payment Status</option>
                      <option value="Paid">Paid</option>
                      <option value="Unpaid">Unpaid</option>
                    </select>
                    <p className="text-danger">{errors.paymentStatus?.message}</p>
                  </div>

                  {watch("paymentStatus") === "Paid" && (
                    <div className="col-md-4 mb-1">
                      <label className="form-label">Payment Mode</label>
                      <select className="form-select" {...register("paymentMode")}>
                        <option value="">Select Payment Mode</option>
                        <option value="Cash">Cash</option>
                        <option value="Bank Transfer">Bank Transfer</option>
                      </select>
                      <p className="text-danger">{errors.paymentMode?.message}</p>
                    </div>
                  )}

                  {watch("paymentMode") === "Bank Transfer" && (
                    <div className="col-md-4 mb-1">
                      <label className="form-label">Bank Details</label>
                      <input type="text" className="form-control" placeholder="Enter Bank Details" {...register("bankDetails")} />
                      <p className="text-danger">{errors.bankDetails?.message}</p>
                    </div>
                  )}

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Comments</label>
                    <textarea className="form-control" placeholder="Enter any additional comments" {...register("comments")} />
                    <p className="text-danger">{errors.comments?.message}</p>
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
function ECRStatement({ navigate }) {
  const columns = [
    {
      name: 'Employee Id',
      selector: row => row.employeeId,
      width: '150px',
    },
    {
      name: 'Employee Name',
      selector: row => row.employeeName,
    },
    {
      name: 'Department',
      selector: row => row.department,
    },
    {
      name: 'Contribution Type',
      selector: row => row.contributionType,
    },
    {
      name: 'Contribution Amount',
      selector: row => row.contributionAmount,
    },
    {
      name: 'Ecr Date',
      selector: row => row.ecrDate,
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
      "employeeId": "EMP101",
      "employeeName": "John Doe",
      "department": "Finance",
      "contributionType": "EPF",
      "contributionAmount": 5000,
      "ecrDate": "2024-02-01"
    },
    {
      "employeeId": "EMP102",
      "employeeName": "Jane Smith",
      "department": "HR",
      "contributionType": "ESI",
      "contributionAmount": 3200,
      "ecrDate": "2024-02-05"
    },
    {
      "employeeId": "EMP103",
      "employeeName": "Michael Brown",
      "department": "IT",
      "contributionType": "EPF",
      "contributionAmount": 4700,
      "ecrDate": "2024-02-10"
    },
    {
      "employeeId": "EMP104",
      "employeeName": "Emily Johnson",
      "department": "Operations",
      "contributionType": "ESI",
      "contributionAmount": 2900,
      "ecrDate": "2024-02-12"
    },
    {
      "employeeId": "EMP105",
      "employeeName": "Robert Wilson",
      "department": "Admin",
      "contributionType": "EPF",
      "contributionAmount": 5300,
      "ecrDate": "2024-02-15"
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
    employeeId: yup.string().required("Employee ID is required"),
    employeeName: yup.string().required("Employee Name is required"),
    department: yup.string().required("Department is required"),
    contributionType: yup.string().required("Contribution Type is required"),
    contributionAmount: yup
      .number()
      .positive("Contribution amount must be positive")
      .required("Contribution Amount is required"),
    ecrDate: yup
      .date()
      .required("Date is required")
      .max(new Date(), "Date cannot be in the future"),
  });
  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });

  const backendData = {
    "employeeId": "EMP105",
    "employeeName": "Robert Wilson",
    "department": "Admin",
    "contributionType": "EPF",
    "contributionAmount": 5300,
    "ecrDate": "2024-02-15"
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
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/epf')}></i>
            <h6 className='fw-bold mb-0'>ECR Statement List </h6>
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

      <div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row ms-1">
                <div className="col-md-4 mb-1">
                  <label className="form-label">Challan ID</label>
                  <p className="ms-2 fw-bold">{backendData.challanId}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Employee Name</label>
                  <p className="ms-2 fw-bold">{backendData.employeeName}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Employee ID</label>
                  <p className="ms-2 fw-bold">{backendData.employeeId}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Designation</label>
                  <p className="ms-2 fw-bold">{backendData.designation}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Department</label>
                  <p className="ms-2 fw-bold">{backendData.department}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Basic Salary</label>
                  <p className="ms-2 fw-bold">{backendData.basicSalary}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">HRA (House Rent Allowance)</label>
                  <p className="ms-2 fw-bold">{backendData.hra}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Salary Month</label>
                  <p className="ms-2 fw-bold">{backendData.salaryMonth}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Payment Mode</label>
                  <p className="ms-2 fw-bold">{backendData.paymentMode}</p>
                </div>
                {watch("paymentMode") === "Bank Transfer" && (
                  <div className="col-md-4 mb-1">
                    <label className="form-label">Bank Account Number</label>
                    <p className="ms-2 fw-bold">{backendData.bankAccountNumber}</p>
                  </div>
                )}
                <div className="col-md-4 mb-1">
                  <label className="form-label">DA (Dearness Allowance)</label>
                  <p className="ms-2 fw-bold">{backendData.da}</p>
                  <p className="text-danger">{errors.da?.message}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Other Allowances</label>
                  <p className="ms-2 fw-bold">{backendData.otherAllowances}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Deductions (PF, Tax, etc.)</label>
                  <p className="ms-2 fw-bold">{backendData.deductions}</p>
                </div>
                <div className="col-md-4 mb-1">
                  <label className="form-label">Net Salary</label>
                  <p className="ms-2 fw-bold">{backendData.netSalary}</p>
                  <p className="text-danger">{errors.netSalary?.message}</p>
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
                    <label className="form-label">Employee ID</label>
                    <input type="text" className="form-control" placeholder="Enter Employee ID" {...register("employeeId")} />
                    <p className="text-danger">{errors.employeeId?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Employee Name</label>
                    <input type="text" className="form-control" placeholder="Enter Employee Name" {...register("employeeName")} />
                    <p className="text-danger">{errors.employeeName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Department</label>
                    <input type="text" className="form-control" placeholder="Enter Department" {...register("department")} />
                    <p className="text-danger">{errors.department?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Contribution Type</label>
                    <select className="form-select" {...register("contributionType")}>
                      <option value="">Select Contribution Type</option>
                      <option value="EPF">EPF</option>
                      <option value="ESI">ESI</option>
                      <option value="Gratuity">Gratuity</option>
                    </select>
                    <p className="text-danger">{errors.contributionType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Contribution Amount</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Enter Contribution Amount"
                      {...register("contributionAmount")}
                    />
                    <p className="text-danger">{errors.contributionAmount?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">ECR Date</label>
                    <input type="date" className="form-control" {...register("ecrDate")} />
                    <p className="text-danger">{errors.ecrDate?.message}</p>
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
function PaymentConfirmation({ navigate }) {
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
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/epf')}></i>
            <h6 className='fw-bold mb-0'>Payment Confirmation  List </h6>
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

      <div class="modal fade" id="detailsModal" tabindex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
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
                  <p className="ms-2 fw-bold">{backendData.confirmationStatus ? "Confirmed" : "Not Confirmed"}</p>
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

function EpfList() {
  const location = useLocation();
  const formType = location.state?.name;

  console.log("formType", formType);


  const navigate = useNavigate();

  return (
    formType === 'Salary Statement' && <SalaryStatementForm navigate={navigate} /> || formType === 'Challan' && <EpfChallan navigate={navigate} />
    || formType === 'Penalty Challan' && <PenaltyChallan navigate={navigate} /> || formType === 'ECR Statement' && <ECRStatement navigate={navigate} />
    || formType === 'Payment Confirmation' && <PaymentConfirmation navigate={navigate} />

  )
}

export default EpfList