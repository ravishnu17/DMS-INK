import React, { useCallback, useContext, useEffect, useState } from "react";
import { tableStyle } from "../../constant/Util";
import DataTable from "react-data-table-component";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";
import Swal from "sweetalert2";
import { ContextProvider } from "../../App";
import Loader from '../../constant/loader';

function Roles() {
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [rolesList, setRolesList] = useState([]);
  const [roleToEdit, setRoleToEdit] = useState(null);

  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({ skip: 0, limit: 25, currentPage: 1 });
  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;

  const modulepermission = permissions?.role_permissions?.roles;

  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  // Fetch the roles list from API when the component mounts or search term changes
  useEffect(() => {
    listRoles();
  }, []);

  // Fetch the roles
  const listRoles = useCallback(() => {
    setLoading(true)
    getAPI(`/access/roles?skip=${pagination.skip}&limit=${pagination.limit}&search=${search ? search : ""}`)
      .then((res) => {
        if (res?.data?.status) {
          setRolesList(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err);
      }).finally(() => {
        setLoading(false)
      });
  }, [pagination, search]);


  useEffect(() => {
    listRoles();
  }, [listRoles]);


  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
      skip: (page - 1) * prev.limit,
    }));
  };

  const handlePerRowsChange = (newLimit, page) => {
    setPagination({
      currentPage: 1,
      skip: 0,
      limit: newLimit,
    });
  };

  // Submit handler for adding or updating role
  const onSubmit = (data) => {
    setLoading(true);
    const apiUrl = roleToEdit ? `/access/roles/${roleToEdit.id}` : "/access/roles";
    const method = roleToEdit ? "PUT" : "POST";

    const dataToSend = roleToEdit ? data : [data];
    addUpdateAPI(method, apiUrl, dataToSend)
      .then((res) => {
        if (res?.data?.status) {
          //success
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: roleToEdit ? "Updated!" : "Created!",
            text: roleToEdit ? "Role has been updated." : "Role has been created.",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: ' #28a745',
            color: '  #ffff'
          }); listRoles();
          reset();
          closeModal();
          setRoleToEdit(null);
        } else {
          Swal.fire({
            icon: "warning",
            title: 'Something went wrong!',
            text: res?.data?.details || 'Something went wrong!',
            confirmButtonText: 'OK',
            background: 'rgb(255, 255, 255)',
            color: '  #000000'
          });
          console.log("Error:", res?.data?.details);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle search input
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleDelete = (role) => {
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
        deleteAPI(`/access/roles/${role.id}`)
          .then((res) => {
            if (res?.data?.status) {

              listRoles();
              // delete message
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Deleted!',
                text: "Role has been deleted.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#28a745',  // success green
                color: '#fff'
              });

            } else {
              Swal.fire({
                icon: "warning",
                title: 'Something went wrong!',
                text: res?.data?.details || 'Something went wrong!',
                confirmButtonText: 'OK',
                background: 'rgb(255, 255, 255)',
                color: '  #000000'
              });
            }
          })
      }
    });
  }

  // Open modal for Add or Edit Role
  const openModal = (role = null) => {
    setRoleToEdit(role);
    reset({ name: role ? role.name : "" }); // Reset form with current role data
    const modal = document.getElementById("editModal");
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show(); // Show the modal
  };

  // Close modal
  const closeModal = () => {
    const modal = document.getElementById("editModal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide(); // Hide the modal
  };

  const columns = [
    {
      name: "S.No",
      selector: (_row, index) => index + 1,
      width: "150px",
    },
    {
      name: "Role name",
      selector: (row) => row.name,
    },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex justify-content-between">
          {row?.is_default === false ? (
            <div className="form_col ml-1">
              <button
                type="button"
                className="btn btn-sm text-success"
                title="Update"
                onClick={() => openModal(row)} // Open modal for editing
              >
                <i className="fas fa-edit"></i>
              </button>
              <button
                onClick={() => handleDelete(row)}
                type="button"
                className="btn text-danger btn-sm"
                title="Delete"
              >
                <i className="fa fa-trash"></i>
              </button>
            </div>
          ) : (
            <div
              role="button"
              title="You cannot update or delete the default role"
            >
              <span className="badge bg-secondary">Default</span>
            </div>
          )}
        </div>
      ),
      button: true,
    },
  ];

  return (
    <>
      <div  >
        <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
          <div className='p-2 col-lg-5 col-12'>
            <h6 className="fw-bold mb-0">Roles List</h6>
          </div>
          <div className="d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1">
            <button className="btn btn-sm adminsearch-icon">
              <i className="fa fa-search" aria-hidden="true"></i>
            </button>
            <div className="me-2 d-flex align-items-center">
              <input
                type="text"
                className="form-control adminsearch"
                placeholder="Search by Role Name"
                title="Search by Role Name"
                value={search}
                onChange={handleSearchChange}
              />

            </div>

            {
              currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ?

                <>
                  <button
                    className="btn btn-sm px-4 adminBtn"
                    title="Add"
                    onClick={() => openModal()} // Open modal for adding new role
                  >
                    Add
                  </button>
                </>
                : <>
                  {
                    modulepermission?.add && (
                      <button
                        className="btn btn-sm px-4 adminBtn"
                        title="Add"
                        onClick={() => openModal()} // Open modal for adding new role
                      >
                        Add
                      </button>
                    )

                  }

                </>
            }


          </div>
        </div>

        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={rolesList}
            customStyles={tableStyle}
            paginationRowsPerPageOptions={[25, 50, 75, 100]}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationDefaultPage={pagination.currentPage}
            // paginationPerPage={pagination.limit}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            highlightOnHover
            pointerOnHover
            responsive
            noDataComponent={null}
            // progressPending={loading}
            paginationPerPage={25}
          />
        </div>

        {/* Modal for Add or Edit Role */}
        <div
          className="modal fade"
          id="editModal"
          tabIndex="-1"
          aria-labelledby="AddModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {roleToEdit ? "Edit Role" : "Add Role"}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={closeModal}
                ></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col mb-1">
                      <label className="form-label"> Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter name"
                        {...register("name")}
                      />
                      <p className="text-danger">{errors.name?.message}</p>
                    </div>
                    <div className="text-end">
                      <button
                        type="submit"
                        className="btn btn-sm btn-success px-4 adminBtn"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-secondary ms-2"
                        onClick={closeModal}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      {
        loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
            <Loader />
          </div>
        )
      }
    </>
  );
}

export default Roles;
