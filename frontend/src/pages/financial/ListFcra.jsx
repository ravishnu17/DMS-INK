import React, { useEffect } from 'react'
import { tableStyle } from '../../constant/Util';
import DataTable from 'react-data-table-component';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Swal from 'sweetalert2';

function FcraDonations({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);



  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>FCRA Donations List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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

function QuarterlyAbstracts({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>QuarterlyAbstracts List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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

function QuarterlyBankStatements({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Quarterly Bank Statements List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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

//
function QuarterlyReturns({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Quarterly Returns List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                  Close
                </button>
                <button type="submit" className="btn  btn-sm btn-primary px-4 adminBtn" >Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}
function ChiefFunctionaryLetter({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Chief Functionary Letter List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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
function CACertificate({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>CA Certificate List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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
function AnnualAuditStatement({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Annual Audit Statement List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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
function AnnualBankStatements({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Annual Bank Statements List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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
function AnnualBankStatementUtilizationAccounts({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Annual Bank Statement Utilization Accounts List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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
function SignatureoftheChiefFunctionary({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };
  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Signature of the Chief Functionary List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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
function SealoftheAssociation({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Seal of the Association List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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
function AnnualReturns({ navigate }) {
  const columns = [
    {
      name: 'S.No',
      selector: row => row.id,
      width: '150px',
    },
    {
      name: 'FCRA No',
      selector: row => row.fcraNo,
    },
    {
      name: 'Accountant Id',
      selector: row => row.accountantId,
    },
    {
      name: 'Accountant Name',
      selector: row => row.accountantName,
    },
    {
      name: 'Donor Name',
      selector: row => row.donorName,
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
      id: 1,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 2,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
    },
    {
      id: 3,
      fcraNo: "075900035",
      accountantId: "ACC0020",
      accountantName: "Mr. J. Anthony Selvam",
      donorName: "John"
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
    id: yup.string().required('ID is required'),
    name: yup.string().required('Name is required'),
    society: yup.string().required('Society selection is required'),

    accountantId: yup.string().required('Accountant ID is required'),
    accountantName: yup.string().required('Accountant Name is required'),
    purpose: yup.string().required('Purpose is required'),

    donorName: yup.string().required('Donor Name is required'),
    donorType: yup.string().required('Type is required'),
    donationDate: yup.date().required('Donation Received Date is required'),
    donorCountry: yup.string().required('Donor Country is required'),

    office: yup.string().required('Office is required'),
    email: yup.string().email('Invalid email format').required('Email is required'),
    website: yup.string().url('Invalid website URL').required('Website is required'),

    amount: yup.number().positive('Amount must be positive').required('Amount is required'),
    remark: yup.string(),

    abstractName: yup.string().required('Abstract Name is required'),
    address: yup.string().required('Address is required'),
    country: yup.string().required('Country is required'),
  });

  const { register, handleSubmit, setValue, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Simulated Backend Data
  const backendData = {
    id: 1,
    name: "Ajith",
    society: "southindians",
    accountantId: "12344",
    accountantName: "Kumar",
    purpose: "test",
    donorName: "All India",
    donorType: "individual",
    donationDate: "2025-12-02", // Correct date format
    donorCountry: "USA",
    office: "Chennai",
    email: "ajith@gmail.com",
    website: "https://ims.com",
    amount: 500000,
    remark: "Testing",
    abstractName: "Test",
    address: "Chennai",
    country: "India",
  };

  // Populate form fields with backend response
  useEffect(() => {


    if (backendData) {
      Object.keys(backendData).forEach((key) => {
        setValue(key, backendData[key]); // Set each form value
      });
    }
  }, [backendData, setValue]);

  const onSubmit = (data) => {
    console.log('Form Submitted:', data);
    alert('Form submitted successfully!');
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ marginLeft: "10px" }} onClick={() => navigate('/financial/fcra')}></i>
            <h6 className='fw-bold mb-0'>Annual Returns List</h6>
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
                  <label className="form-label">Purpose</label>
                  <p className="ms-2 fw-bold">{backendData.purpose}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Name of Donor</label>
                  <p className="ms-2 fw-bold">{backendData.donorName}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Type</label>
                  <p className="ms-2 fw-bold">{backendData.donorType}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donation Received Date</label>
                  <p className="ms-2 fw-bold">{backendData.donationDate}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Donor Country</label>
                  <p className="ms-2 fw-bold">{backendData.donorCountry}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Office</label>
                  <p className="ms-2 fw-bold">{backendData.office}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Email</label>
                  <p className="ms-2 fw-bold">{backendData.email}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Website</label>
                  <p className="ms-2 fw-bold">{backendData.website}</p>
                </div>

                <div className="col-md-4 mb-1">
                  <label className="form-label">Amount</label>
                  <p className="ms-2 fw-bold">{backendData.amount}</p>
                </div>

                <div className="col mb-2">
                  <label className="form-label">Remark (if any)</label>
                  <p className="ms-2 fw-bold">{backendData.remark}</p>
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
                    <label className="form-label">Purpose</label>
                    <input type="text" className="form-control" placeholder="Enter purpose" {...register("purpose")} />
                    <p className="text-danger">{errors.purpose?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Name of Donor</label>
                    <input type="text" className="form-control" placeholder="Enter donor name" {...register("donorName")} />
                    <p className="text-danger">{errors.donorName?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Type</label>
                    <select className="form-select" {...register("donorType")}>
                      <option value="">Select donor type</option>
                      <option value="individual">Individual</option>
                      <option value="organization">Organization</option>
                    </select>
                    <p className="text-danger">{errors.donorType?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donation Received Date</label>
                    <input type="date" className="form-control" {...register("donationDate")} />
                    <p className="text-danger">{errors.donationDate?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Donor Country</label>
                    <select className="form-select" {...register("donorCountry")}>
                      <option value="">Select country</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                      <option value="India">India</option>
                    </select>
                    <p className="text-danger">{errors.donorCountry?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Office</label>
                    <input type="text" className="form-control" placeholder="Enter office name" {...register("office")} />
                    <p className="text-danger">{errors.office?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" placeholder="Enter email" {...register("email")} />
                    <p className="text-danger">{errors.email?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Website</label>
                    <input type="url" className="form-control" placeholder="Enter website URL" {...register("website")} />
                    <p className="text-danger">{errors.website?.message}</p>
                  </div>

                  <div className="col-md-4 mb-1">
                    <label className="form-label">Amount</label>
                    <input type="number" className="form-control" placeholder="Enter amount" {...register("amount")} />
                    <p className="text-danger">{errors.amount?.message}</p>
                  </div>

                  <div className="col mb-2">
                    <label className="form-label">Remark (if any)</label>
                    <textarea className="form-control" placeholder="Enter remarks" {...register("remark")}></textarea>
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

function ListFcra() {
  const navigate = useNavigate();
  const location = useLocation();
  const formType = location.state?.name;

  console.log("type", formType);


  return (
    formType === 'FCRA Donations' && <FcraDonations navigate={navigate} /> || formType === 'Quarterly Abstracts' && <QuarterlyAbstracts navigate={navigate} />
    || formType === 'Quarterly Bank Statements' && <QuarterlyBankStatements navigate={navigate} /> || formType === 'Quarterly Returns' && <QuarterlyReturns navigate={navigate} />
    || formType === 'Chief Functionary Letter ' && <ChiefFunctionaryLetter navigate={navigate} /> || formType === 'CA Certificate' && <CACertificate navigate={navigate} />
    || formType === 'Annual Audit Statement' && <AnnualAuditStatement navigate={navigate} /> || formType === 'Annual Bank Statements' && <AnnualBankStatements navigate={navigate} />
    || formType === 'Annual Bank Statement Utilization Accounts' && <AnnualBankStatementUtilizationAccounts navigate={navigate} /> || formType === 'Signature of the Chief Functionary' && <SignatureoftheChiefFunctionary navigate={navigate} />
    || formType === 'Seal of the Association' && <SealoftheAssociation navigate={navigate} /> || formType === 'Annual Returns' && <AnnualReturns navigate={navigate} />
  )

}

export default ListFcra