import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { tableStyle } from '../../constant/Util';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

function CompanyList() {
  const navigate = useNavigate();
  const location = useLocation();
  const data = [
    {
      id: 1,
      name: "Company 1",
      accountant: "Anthony Selvam",
      reportDate: "2024-05-15",
    },
    {
      id: 2,
      name: "Company 1",
      accountant: "Anthony Selvam",
      reportDate: "2024-04-15",
    },
    {
      id: 3,
      name: "Company 1",
      accountant: "Anthony Selvam",
      reportDate: "2024-03-15",
    },

  ]

  const schema = yup.object().shape({
    companyName: yup.string().required("Company Name is required"),
    accountantName: yup.string().required("Accountant Name is required"),
    updatedOn: yup.date().required("Updated On is required"),
  });

  const { register, handleSubmit, formState: { errors }, } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      companyName: "",
      accountantName: "",
      updatedOn: "",
    },
  });

  const onSubmit = (data) => {
    onSave(data);
  };


  const deleteRow = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    })
  }

  const columns = [
    // {
    //   name: 'No',
    //   selector: row => row.id,
    // },
    {
      name: 'Company',
      selector: row => row.name,
    },
    {
      name: 'Accountant',
      selector: row => row.accountant,
    },
    {
      name: 'Report Date',
      selector: row => row.reportDate,
    },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table" >
                <button type="button" className="btn  btn-sm text-info" title='View' data-bs-toggle="modal" data-bs-target="#detailsModal" >
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
                <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deleteRow()} >
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


  return (
    <>
      <div>
        <div className="d-flex justify-content-between align-items-center p-2 bg-white">
          <div class="d-flex align-items-center gap-2">
            <i className="fa-solid fa-circle-left fs-5" style={{ margin: "10px" }} onClick={() => navigate('/nonfinancial/company')}></i>
            <h6 className="fw-bold mb-0">Company 1 - {location.state?.name}</h6>
          </div>
          <div className="me-2 d-flex align-items-center">
            <button className='btn bnt-sm adminsearch-icon'>
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
            <input type="text" className="form-control adminsearch" placeholder="Search by name" title="Search by name" />
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
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Company Name</label>
                <p className="ms-2 fw-bold">Company 1</p>
              </div>

              <div className="mb-3">
                <label className="form-label">Accountant Name</label>
                <p className="ms-2 fw-bold">Anthony Selvam</p>
              </div>

              <div className="mb-3">
                <label className="form-label">Updated On</label>
                <p className="ms-2 fw-bold">2024-05-15</p>
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
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Company Name</label>
                  <input type="text" className="form-control" {...register("companyName")} placeholder='Enter Company Name' />
                  <p className="text-danger">{errors.companyName?.message}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Accountant Name</label>
                  <input type="text" className="form-control" {...register("accountantName")} placeholder='Enter Accountant Name' />
                  <p className="text-danger">{errors.accountantName?.message}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label">Updated On</label>
                  <input type="date" className="form-control" {...register("updatedOn")} placeholder='Enter Updated On' />
                  <p className="text-danger">{errors.updatedOn?.message}</p>
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

export default CompanyList