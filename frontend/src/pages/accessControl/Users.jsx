import React, { useState } from 'react'
import { isMobile, tableStyle } from '../../constant/Util';
import DataTable from 'react-data-table-component';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from 'sweetalert2';

function Users() {

  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    mobile_no: yup
      .string()
      .matches(/^\d{10}$/, "Mobile number must be 10 digits")
      .required("Mobile number is required"),
    role: yup.string().required("Role is required"),
    username: yup.string().required("Username is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirm_password: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const schema1 = yup.object().shape({
    oldPassword: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    password: yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    confirm_password: yup
      .string()
      .oneOf([yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const [selectedUser, setSelectedUser] = useState();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showForgotpasswordModal, setShowForgotpasswordModal] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm({ resolver: yupResolver(schema) });

  const { register: register1, setValue: setValue1, handleSubmit: resetpasswordsubmit, formState: { errors: errors1 }, reset: reset1 } = useForm({ resolver: yupResolver(schema1) });


  const updateModelPoup = (row) => {
    console.log(" update row ", row);
    // setValue();
    reset();
    setShowForgotpasswordModal(false);
    setShowViewModal(false);
    setShowEditModal(true);
    reset(row);
    // setValue('email', '');


  }
  const forgotpasswordModelPoup = (row) => {
    // alert("call forgot password")
    console.log("row", row);
    // setValue1();
    setSelectedUser();
    setShowViewModal(false);
    setShowEditModal(false);
    setShowForgotpasswordModal(true);
    setSelectedUser(row);
    // setValue1("password",row.password);
    // setValue1("id",row.id)

    reset1({ "password": 'test' })

  }
  const onSubmit = (data) => {
    console.log("Form Data: ", data);
  };

  const onForgotPasswordSumitSubmit = (data) => {
    // alert("in")
    console.log("data", data);

  }

  const columns = [
    {
      name: 'Name',
      selector: row => row.name,
    },
    {
      name: 'Email ID',
      selector: row => row.email,
    },
    {
      name: 'mobile_no',
      selector: row => row.mobile_no,
    },
    {
      name: 'Role',
      selector: row => row.role,
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-info" data-bs-toggle="modal" data-bs-target="#viewModel" onClick={() => setSelectedUser(row)} title='View' >
                  <i className="fas fa-eye " />
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-success" title='Update' data-bs-toggle="modal" data-bs-target="#updateModel" onClick={() => reset(row)}>
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button type="button" className="btn text-warning btn-sm" title='Password Reset' data-bs-toggle="modal" data-bs-target="#resetModel" onClick={() => reset1(row)}  >
                  <i className="fa fa-key" />
                </button>
              </span>
            </div>
            <div className="form_col">
              <span className="custum-group-table  ">
                <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletefunction(row.id)}>
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
      id: 1,
      name: "John Doe",
      email: "john.doe@example.com",
      mobile_no: "9876543210",
      role: "admin",
      username: "johndoe",
      password: "Password@123", // Sample password
    },
    {
      id: 2,
      name: "Jane Smith",
      email: "jane.smith@example.com",
      mobile_no: "9123456780",
      role: "user",
      username: "janesmith",
      password: "Jane@456",
    },
    {
      id: 3,
      name: "Mike Johnson",
      email: "mike.johnson@example.com",
      mobile_no: "9988776655",
      role: "user",
      username: "mikejohnson",
      password: "Mike@789",
    },
    {
      id: 4,
      name: "Emily Brown",
      email: "emily.brown@example.com",
      mobile_no: "9871234567",
      role: "accountent",
      username: "emilybrown",
      password: "Emily@321",
    },
    {
      id: 5,
      name: "David Wilson",
      email: "david.wilson@example.com",
      mobile_no: "9654321870",
      role: "accountent",
      username: "davidwilson",
      password: "David@654",
    },


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
          text: 'Your file has been deleted.',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: '#28a745',  // success green
          color: '#fff'
        });

      }
    })
  }
  return (
    <>
      <div className='card' style={{ margin: "5px" }}>


        <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
          <div className='p-2 col-lg-5 col-12'>
            <h6 className='fw-bold mb-0'>Users List</h6>
          </div>
          <div className='d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1 mt-2'>
            <div className="me-2">
              <select className="form-control form-select" placeholder="Search by name" title="Search by name" >
                <option value={null} defaultChecked>Filter by role</option>
                <option value="accountant">Accountant</option>
                <option value="ddm">DDM</option>
                <option value="view">Viewer</option>

              </select>
            </div>
            <div className="me-2 d-flex align-items-center ">
              <input type="text" className="form-control adminsearch" placeholder="Search by Name" title="Search" />
              <button className='btn bnt-sm adminsearch-icon'>
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
            </div>
            <button className='btn btn-sm px-4 adminBtn' title='Add' data-bs-toggle="modal" data-bs-target="#AddUserModal">Add </button>
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
        {/* Modal open for add edit */}
        <div className="modal fade" id="AddUserModal" tabIndex="-1" aria-labelledby="AddModalLabel" aria-hidden="true">
          <div className="modal-dialog modal-lg" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User Registration</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" ></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">

                  <div className="row">
                    <div className="col-md-6 mb-1">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" placeholder="Enter name" {...register("name")} />
                      <p className="text-danger">{errors.name?.message}</p>
                    </div>

                    <div className="col-md-6 mb-1">
                      <label className="form-label">Email</label>
                      <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                      <p className="text-danger">{errors.email?.message}</p>
                    </div>

                    <div className="col-md-6 mb-1">
                      <label className="form-label">Mobile No</label>
                      <input type="text" className="form-control" placeholder="Enter mobile number" {...register("mobile_no")} />
                      <p className="text-danger">{errors.mobile_no?.message}</p>
                    </div>

                    <div className="col-md-6 mb-1">
                      <label className="form-label">Role</label>
                      <select className="form-select" {...register("role")}>
                        <option value="">Select role</option>
                        <option value="admin">Accountant</option>
                        <option value="user">DDM</option>
                        <option value="accountent">Viewer</option>
                      </select>
                      <p className="text-danger">{errors.role?.message}</p>
                    </div>

                    <div className="col-md-6 mb-1">
                      <label className="form-label">Username</label>
                      <input type="text" className="form-control" placeholder="Enter username" {...register("username")} />
                      <p className="text-danger">{errors.username?.message}</p>
                    </div>

                    <div className="col-md-6 mb-1">
                      <label className="form-label">Password</label>
                      <input type="password" className="form-control" placeholder="Enter password" {...register("password")} />
                      <p className="text-danger">{errors.password?.message}</p>
                    </div>

                    <div className="col-md-6 mb-1">
                      <label className="form-label">Confirm Password</label>
                      <input type="password" className="form-control" placeholder="Confirm password" {...register("confirm_password")} />
                      <p className="text-danger">{errors.confirm_password?.message}</p>
                    </div>


                  </div>

                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary px-4 adminBtn">Submit</button>
                  <button type="button" className="btn btn-sm btn-secondary ms-2" data-bs-dismiss="modal">Close</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="modal fade " id="viewModel" tabindex="-1" aria-labelledby="viewModelLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View User</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close" ></button>
            </div>

            <div className="modal-body">
              <div className='row ms-1'>
                <div className='col-md-4 mb-1'>
                  <label className='form-label'>Name</label>
                  <p className="ms-2 fw-bold">{selectedUser?.name}</p>

                </div>

                <div className='col-md-4 mb-1'>
                  <label className='form-label'>Email</label>
                  <p className="ms-2 fw-bold">{selectedUser?.email}</p>

                </div>

                <div className='col-md-4 mb-1'>
                  <label className='form-label'>Mobile No</label>
                  <p className="ms-2 fw-bold">{selectedUser?.mobile_no}</p>

                </div>

                <div className='col-md-4 mb-1'>
                  <label className='form-label'>Role</label>
                  <p className="ms-2 fw-bold">{selectedUser?.role}</p>

                </div>

                <div className='col-md-4 mb-1'>
                  <label className='form-label'>User Name</label>
                  <p className="ms-2 fw-bold">{selectedUser?.username}</p>

                </div>

              </div>
            </div>
            <div className="modal-footer">

              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>

          </div>
        </div>
      </div>


      <div className="modal fade " id="updateModel" tabindex="-1" aria-labelledby="updateModelLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View User</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close" ></button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">

                <div className="row">
                  <div className="col-md-6 mb-1">
                    <label className="form-label">Name</label>
                    <input type="text" className="form-control" placeholder="Enter name"  {...register("name")} />
                    <p className="text-danger">{errors.name?.message}</p>
                  </div>

                  <div className="col-md-6 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-6 mb-1">
                    <label className="form-label">Mobile No</label>
                    <input type="text" className="form-control" placeholder="Enter mobile number" {...register("mobile_no")} />
                    <p className="text-danger">{errors.mobile_no?.message}</p>
                  </div>

                  <div className="col-md-6 mb-1">
                    <label className="form-label">Role</label>
                    <select className="form-select" {...register("role")}>
                      <option value="">Select role</option>
                      <option value="admin">Accountant</option>
                      <option value="user">DDM</option>
                      <option value="user">Viewer</option>
                    </select>
                    <p className="text-danger">{errors.role?.message}</p>
                  </div>

                  <div className="col-md-6 mb-1">
                    <label className="form-label">Username</label>
                    <input type="text" className="form-control" placeholder="Enter username" {...register("username")} />
                    <p className="text-danger">{errors.username?.message}</p>
                  </div>

                  <div className="col-md-6 mb-1">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" placeholder="Enter password" {...register("password")} />
                    <p className="text-danger">{errors.password?.message}</p>
                  </div>

                  <div className="col-md-6 mb-1">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" placeholder="Confirm password" {...register("confirm_password")} />
                    <p className="text-danger">{errors.confirm_password?.message}</p>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary px-4 adminBtn">Submit</button>
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </form>

          </div>
        </div>
      </div>


      <div className="modal fade " id="resetModel" tabindex="-1" aria-labelledby="resetModelLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">ForgotPassword</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close" ></button>
            </div>

            <form onSubmit={resetpasswordsubmit(onForgotPasswordSumitSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-1">
                    <label className="form-label">Old Password</label>
                    <input type="password" className="form-control" placeholder="Enter password" {...register1("oldPassword")} />
                    <p className="text-danger">{errors1.oldPassword?.message}</p>
                  </div>
                  <div className="col-md-6 mb-1">
                    <label className="form-label">Password</label>
                    <input type="password" className="form-control" placeholder="Enter password" {...register1("password")} />
                    <p className="text-danger">{errors1.password?.message}</p>
                  </div>

                  <div className="col-md-6 mb-1">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" className="form-control" placeholder="Confirm password" {...register1("confirm_password")} />
                    <p className="text-danger">{errors1.confirm_password?.message}</p>
                  </div>
                </div>

              </div>
              <div className="modal-footer">
                <button type="submit" className="btn btn-primary px-4 adminBtn">Submit</button>
                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </form>

          </div>
        </div>
      </div>

    </>
  )
}

export default Users