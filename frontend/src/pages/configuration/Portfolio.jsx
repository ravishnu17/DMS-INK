import React, { Suspense, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { formatDate, tableStyle } from "../../constant/Util";
import { Route, Routes, useNavigate } from "react-router-dom";
import { schoolRoutes } from "../../routes";
import Loader from "../../constant/loader";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";

function Portfolio() {
  const navigate = useNavigate();

  const [isEdit, setIsEdit] = useState(false);
  const [protfolioType, setPortfolioType] = useState([]);
  const [portfolioList, setPortfolioList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState();
  // Validation Schema
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    type: yup.string().required("Type is required"),
  });
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });

  useEffect(() => {
    protfolioList();
    portfolioTypeListget();
  }, [search]);
  const protfolioList = () => {
    setLoading(true);
    if (search !== undefined) {
      getAPI("/configuration/portfolio?skip=0&limit=25&search=" + search)
        .then((res) => {
          if (res?.data?.status) {
            setPortfolioList(res.data.data);
          } else {
            setPortfolioList([]);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      getAPI("/configuration/portfolio?skip=0&limit=25")
        .then((res) => {
          if (res?.data?.status) {
            setPortfolioList(res.data.data);
          } else {
            setPortfolioList([]);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  };
  const portfolioTypeListget = () => {
    setLoading(true);
    getAPI("/configuration/portfolioType")
      .then((res) => {
        // console.log("res portfolio type", res.data.data);
        if (res?.data?.status) {
          setPortfolioType(res.data.data);
        } else {
          setPortfolioType([]);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const data = [
    {
      name: "Community",
      type: "Non - Financial",
    },
    {
      name: "Society",
      type: "Non - Financial",
    },
    {
      name: "College",
      type: "Non - Financial",
    },
    {
      name: "FCRA",
      type: "Financial",
    },
  ];

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
    },
    {
      name: "Type",
      selector: (row) => row.type,
      cell: (row) => (
        <div
          className={
            row.type === "Financial"
              ? "badge text-bg-warning"
              : "badge text-bg-info"
          }
        >
          {row.type}
        </div>
      ),
    },
    {
      name: "Action",
      cell: (row) => {
        return (
          <>
            <div className="d-flex justify-content-between">
              {/* <div className="form_col ml-1">
                <span className="custum-group-table" >
                  <button type="button" className="btn  btn-sm text-info" title='View' data-bs-toggle="modal" data-bs-target="#detailsModal"   >
                    <i className="fas fa-eye " />
                  </button>
                </span>
              </div> */}
              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button
                    type="button"
                    className="btn  btn-sm text-success"
                    title="Update"
                    data-bs-toggle="modal"
                    data-bs-target="#editModal"
                    onClick={() => {
                      setIsEdit(true), reset(row);
                    }}
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
                    onClick={() => deleteEntity(row.id)}
                  >
                    <i className="fa fa-trash" />
                  </button>
                </span>
              </div>
            </div>
          </>
        );
      },
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const onSubmit = (data) => {
    console.log("form submit", data);
    setLoading(true);
    if (isEdit) {
      addUpdateAPI("PUT", "/configuration/portfolio/" + data.id, data)
        .then((res) => {
          console.log("response ", res);

          if (res?.data?.status) {
            // navigate("/dashboard");
            // sessionStorage.setItem('token', res?.data?.access_token);
            protfolioList();
            setLoading(false);
          } else {
            setErrorMsg(res.data.detail);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      addUpdateAPI("POST", "/configuration/portfolio", data)
        .then((res) => {
          // console.log("response ",res);

          if (res?.data.status) {
            // navigate("/dashboard");
            // sessionStorage.setItem('token', res?.data?.access_token);
            protfolioList();
            setLoading(false);
          } else {
            setErrorMsg(res.data.detail);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // ✅ Hide the modal after successful submission
    const modal = document.getElementById("editModal");
    const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
    modalInstance.hide();
  };

  const deleteEntity = (id) => {
    console.log("delete id", id);

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
        deleteAPI("/configuration/portfolio/" + id).then((res) => {
          console.log("res", res);

          if (res?.data.status) {
            // navigate("/dashboard");
            // sessionStorage.setItem('token', res?.data?.access_token);
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Deleted!",
              text: res.data.details,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: "#28a745", // success green
              color: "#fff",
            });

            protfolioList();
            setLoading(false);
          } else {
            setErrorMsg(res.data.detail);
          }
        });

        // Swal.fire(
        //   "Deleted!",
        //   "Your file has been deleted.",
        //   "success"
        // );
      }
    });
  };
  return (
    <>
      <div className="card" style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div>
            <h6 className="fw-bold mb-0">Portfolio</h6> {/* Updated title */}
          </div>
          <div className="d-flex justify-content-end col-10">
            <div className="me-2 d-flex align-items-center">
              <input
                type="text"
                className="form-control adminsearch"
                placeholder="Search by category"
                title="Search by category"
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="btn bnt-sm adminsearch-icon">
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
            </div>
            <button
              className="btn btn-sm px-4 adminBtn"
              title="Add"
              data-bs-toggle="modal"
              data-bs-target="#editModal"
              onClick={() => {
                setIsEdit(false),
                  reset({
                    name: "",
                    type: "",
                  });
              }}
            >
              Add{" "}
            </button>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={portfolioList}
            customStyles={tableStyle}
            noDataComponent={
              <div className="text-center  py-4">No data found</div>
            }
            pagination
          />
        </div>
      </div>

      <div
        className="modal fade"
        id="editModal"
        tabindex="-1"
        aria-labelledby="editModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {" "}
                {isEdit ? "Edit Portfolio" : "Add Portfolio"}
              </h5>
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
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      {...register("name")}
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter name"
                    />
                    <div className="invalid-feedback">
                      {errors.name?.message}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-12 mb-3">
                    <label className="form-label">
                      Type <span className="text-danger">*</span>
                    </label>
                    <select
                      {...register("type")}
                      className={`form-control form-select ${
                        errors.type ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Select Type</option>
                      {protfolioType.length > 0 &&
                        protfolioType?.map((data) => (
                          <option key={data?.value} value={data?.value}>
                            {data?.label}
                          </option>
                        ))}
                    </select>
                    <div className="invalid-feedback">
                      {errors.type?.message}
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-sm adminBtn btn-primary px-4"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </form>
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

export default Portfolio;
