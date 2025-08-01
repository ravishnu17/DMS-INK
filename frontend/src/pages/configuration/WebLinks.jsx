import React, { useContext, useEffect, useState } from "react";
import { tableStyle } from "../../constant/Util";
import DataTable from "react-data-table-component";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";
import Swal from "sweetalert2";
import { ContextProvider } from "../../App";
import Loader from "../../constant/loader";

function WebLinks() {
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [links, setLinks] = useState([]);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [editMode, setEditMode] = useState(false);

  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;

  const webLinkPermission = permissions?.role_permissions?.["web links"];
  const AUTH_TOKEN = sessionStorage.getItem("token");

  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    weblink: yup.string().required("Link is required").url("Invalid URL"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ resolver: yupResolver(schema) });

  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
      skip: (page - 1) * prev.limit,
    }));
  };

  const handlePerRowsChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      skip: 0,
      currentPage: 1,
    }));
  };

  const getLinks = () => {
    setLoading(true);
    getAPI(
      `/weblinks/get?skip=${pagination?.skip}&limit=${pagination?.limit}`,
      {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      }
    )
      .then((res) => {
        if (res?.status) {
          setLinks(res?.data?.data);
          setTotalRows(res?.data?.totalCount);
        }
      })
      .catch((err) => console.log(err))
      .finally(() => {
        setLoading(false);
        setDataLoading(false);
      });
  };

  const onSubmit = async (data) => {
    if (!AUTH_TOKEN) {
      Swal.fire(
        "Error!",
        "User is not authenticated. Please log in again.",
        "error"
      );
      return;
    }

    setLoading(true);
    const isUpdating = !!data.id;
    const apiPath = isUpdating
      ? `/weblinks/update/${data.id}`
      : "/weblinks/create";
    const method = isUpdating ? "PUT" : "POST";

    try {
      const res = await addUpdateAPI(method, apiPath, data, {
        headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
      });

      if (res?.status >= 200 && res?.status < 300) {
        //success
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: isUpdating ? "Updated!" : "Created!",
          text: res.data.message || "Success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: " #28a745",
          color: "  #ffff",
        });
        getLinks();
        reset();

        const modalElement = document.getElementById("editModal");
        if (modalElement) {
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          if (modalInstance) modalInstance.hide();
        }
      } else {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong!",
          text: res?.data?.message || "Something went wrong!",
          confirmButtonText: "OK",
          background: "rgb(255, 255, 255)",
          color: "  #000000",
        });
      }
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Request failed due to an unknown error.";
      //error
      Swal.fire({
        icon: "warning",
        title: "Something went wrong!",
        text: message || "Something went wrong!",
        confirmButtonText: "OK",
        background: "rgb(255, 255, 255)",
        color: "  #000000",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (link) => {
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
        deleteAPI(`/weblinks/delete/${link.id}`, {
          headers: { Authorization: `Bearer ${AUTH_TOKEN}` },
        })
          .then((res) => {
            if (res?.status) {
              getLinks();
              // delete message
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Deleted!",
                text: "Web link has been deleted.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: "#28a745", // success green
                color: "#fff",
              });
            } else {
              Swal.fire({
                icon: "warning",
                title: "Something went wrong!",
                text: res?.message || "Something went wrong!",
                confirmButtonText: "OK",
                background: "rgb(255, 255, 255)",
                color: "  #000000",
              });
            }
          })
          .catch((err) => console.log(err));
      }
    });
  };

  const columns = [
    { name: "S.No", selector: (_row, index) => index + 1, width: "100px" },
    { name: "Name", selector: (row) => row.name, width: "150px" },
    {
      name: "Web Link",
      cell: (row) => (
        <a href={row.weblink} target="_blank" rel="noopener noreferrer">
          {row.weblink}
        </a>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          {webLinkPermission?.edit && (
            <button
              type="button"
              className="btn btn-sm text-success"
              title="Update"
              data-bs-toggle="modal"
              data-bs-target="#editModal"
              onClick={() => {
                setEditMode(true);
                reset(row);
              }}
            >
              <i className="fas fa-edit"></i>
            </button>
          )}
          {webLinkPermission?.delete && (
            <button
              onClick={() => handleDelete(row)}
              type="button"
              className="btn text-danger btn-sm"
              title="Delete"
            >
              <i className="fa fa-trash"></i>
            </button>
          )}
        </>
      ),
      button: true,
    },
  ];

  useEffect(() => {
    getLinks();
  }, [pagination]);

  return (
    <>
      <div>
        <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
          <div className="p-2 col-lg-5 col-12">
            <h6 className="fw-bold mb-0">Web Links</h6>
          </div>
          <div className="d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1">
            {(currentUser?.role?.name === "Admin" ||
              currentUser?.role?.name === "Super Admin" ||
              webLinkPermission?.add) && (
              <button
                className="btn btn-sm px-4 adminBtn"
                title="Add"
                data-bs-toggle="modal"
                data-bs-target="#editModal"
                onClick={() => {
                  setEditMode(false);
                  reset({ name: "", weblink: "" });
                }}
              >
                Add
              </button>
            )}
          </div>
        </div>

        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={links}
            customStyles={tableStyle}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationDefaultPage={pagination?.currentPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            highlightOnHover
            pointerOnHover
            responsive
            // progressPending={loading}
            noDataComponent={
              !dataLoading && (
                <div className="text-center  py-4">No data found</div>
              )
            }
            paginationPerPage={25}
          />
        </div>

        <div
          className="modal fade"
          id="editModal"
          tabIndex="-1"
          aria-labelledby="AddModalLabel"
          aria-hidden="true"
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold">
                  {editMode ? "Edit Link" : "Add Link"}
                </h6>
                <button
                  type="button"
                  className="btn-close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={() => setEditMode(false)}
                />
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    <div className="col-12 mb-1">
                      <label className="form-label">
                        Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter name"
                        {...register("name")}
                      />
                      <p className="text-danger">{errors.name?.message}</p>
                    </div>
                    <div className="col-12 mb-1">
                      <label className="form-label">
                        Web Site Link <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter web site link"
                        {...register("weblink")}
                      />
                      <p className="text-danger">{errors.weblink?.message}</p>
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
                        data-bs-dismiss="modal"
                        onClick={() => setEditMode(false)}
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
      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "500px" }}
        >
          <Loader />
        </div>
      )}
    </>
  );
}

export default WebLinks;
