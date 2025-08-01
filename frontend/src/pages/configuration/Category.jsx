import React, {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { tableStyle } from "../../constant/Util";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { dynamicRoutes } from "../../routes";
import { ContextProvider } from "../../App";
import { deleteAPI, getAPI } from "../../constant/apiServices";
import Loader from "../../constant/loader";

import "./Category.css";
import txt from "../../assets/images/txt.svg";
import num from "../../assets/images/num.svg";
import mcq_single from "../../assets/images/mcq_single.svg";
import mcq_multiple from "../../assets/images/mcq_multiple.svg";
import dte from "../../assets/images/dte.svg";
import img from "../../assets/images/img.svg";
import loc from "../../assets/images/loc.svg";
import sig from "../../assets/images/sig.svg";
import tme from "../../assets/images/tme.svg";
import sec from "../../assets/images/sec-inverse.svg";

function CategoryView() {
  const [search, setSearch] = useState("");
  const { id } = useParams();
  const navigate = useNavigate();
  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;

  const [categoryViewRecords, setCategoryViewRecords] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const modulepermission = permissions?.role_permissions?.[`category template`];

  const [catagiriesList, setCatagiriesList] = useState([]);

  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);
  // Validation Schema
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    // Conditionally require renewal fields if is_renewal is true
    renewal_period_iteration: yup
      .number()
      .typeError("Renewal Duration must be a number")
      .positive("Must be a positive number")
      .integer("Must be a whole number")
      .when("is_renewal", {
        is: true,
        then: yup.number().required("Renewal Duration is required"),
        otherwise: yup.number().notRequired(),
      }),

    renewal_period_iteration: yup.string().when("is_renewal", {
      is: true,
      then: (schema) => schema.required("Renewal Duration is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
  });
  const initialValues = {
    name: "",
    is_renewal: false,
    renewal_period_iteration: "",
  };
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });

  // Watch the checkbox value
  const isRenewalChecked = watch("is_renewal", false);
  const [isEdit, setIsEdit] = useState(false);

  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
      skip: (page - 1) * prev.limit,
    }));
  };

  // Handle Rows per Page Change
  const handlePerRowsChange = (newLimit) => {
    setPagination((prev) => ({
      ...prev,
      limit: newLimit,
      skip: 0,
      currentPage: 1,
    }));
  };
  //initial
  useEffect(() => {
    getGategoryList();
  }, [pagination]);

  const getGategoryList = useCallback(
    (search) => {
      setLoading(true);
      getAPI(
        `/category/?skip=${pagination?.skip}&limit=${
          pagination?.limit
        }&search=${search ? search : ""}`
      ).then((res) => {
        if (res?.data?.status) {
          setCatagiriesList(res?.data?.data);
          setTotalRows(res?.data?.total_count);
          setLoading(false);
          setDataLoading(false);
        }
      });
    },
    [pagination]
  );

  //pagination or search time
  useEffect(() => {
    getGategoryList();
  }, [getGategoryList]);

  const data = [
    {
      name: "Annual Activity Report",
    },
    {
      name: "Annual Audit Statement",
    },
    {
      name: "Annual Bank Statements and Confirmation",
    },
    {
      name: "Assets Ledger and Bills",
    },
    {
      name: "Fixed Deposit Confirmation",
    },
  ];

  const columns = [
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: "Action",
      center: true,
      cell: (row) => {
        return (
          <>
            <div className="d-flex justify-content-between">
              {currentUser?.role?.name === "Admin" ||
              currentUser?.role?.name === "Super Admin" ? (
                <>
                  <div className="form_col ml-1">
                    <span className="custum-group-table">
                      <button
                        type="button"
                        className="btn 
                          btn-sm text-info"
                        title="View"
                        data-bs-toggle="modal"
                        data-bs-target="#viewModel"
                        onClick={() => handleView(row?.id)}
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
                        onClick={() => {
                          setIsEdit(true), handleFBuildClick(row?.id);
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
                        onClick={() => deleteCategrory(row?.id)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {modulepermission?.view && (
                    <>
                      <div className="form_col ml-1">
                        <span className="custum-group-table">
                          <button
                            type="button"
                            className="btn  btn-sm text-info"
                            title="View"
                          >
                            <i className="fas fa-eye " />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {modulepermission?.edit && (
                    <>
                      <div className="form_col ml-1">
                        <span className="custum-group-table">
                          <button
                            type="button"
                            className="btn  btn-sm text-success"
                            title="Update"
                            onClick={() => {
                              setIsEdit(true), handleFBuildClick(row?.id);
                            }}
                          >
                            <i className="fas fa-edit" />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {modulepermission?.delete && (
                    <>
                      <div className="form_col">
                        <span className="custum-group-table  ">
                          <button
                            type="button"
                            className="btn text-danger btn-sm"
                            title="Delete"
                            onClick={() => deleteCategrory(row?.id)}
                          >
                            <i className="fa fa-trash" />
                          </button>
                        </span>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </>
        );
      },
    },
  ];

  const handleView = (id) => {
    getAPI("/category/" + id)
      .then((res) => {
        setLoading(true);
        if (res?.data?.status) {
          setCategoryViewRecords(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const deleteCategrory = (id) => {
    Swal.fire({
      toast: true,
      title: "Are you sure?",
      text: "You want to delete this category!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "grey",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAPI(`/category/${id}`)
          .then((res) => {
            if (res?.data?.status) {
              // delete message
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

              getGategoryList();
            } else {
              Swal.fire({
                icon: "warning",
                title: "Something went wrong!",
                text: res?.data?.details || "Something went wrong!",
                confirmButtonText: "OK",
                background: "rgb(255, 255, 255)",
                color: "  #000000",
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    });
  };

  const onSubmit = (data) => {
    console.log("Form Data:", data);
  };

  // const handleFBuildClick = () => {
  //   navigate('/config/category/formbuilder'); // This takes you back to the inbox or mail list
  // };

  const handleFBuildClick = (id = null) => {
    if (id) {
      // Navigate with ID for update
      navigate(`/config/category/formbuilder/`, { state: { id: id } });
    } else {
      // Navigate for adding a new form
      navigate("/config/category/formbuilder");
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
        <div className="p-2 col-lg-5 col-12">
          <h6 className="fw-bold mb-0">Categories</h6>
        </div>
        <div className="d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1">
          <div className="me-2 d-flex align-items-center ">
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
            <input
              type="text"
              className="form-control adminsearch "
              placeholder="Search by Name, Place, District"
              title="Search"
              onChange={(e) => getGategoryList(e.target.value)}
            />
          </div>
          {currentUser?.role?.name === "Admin" ||
          currentUser?.role?.name === "Super Admin" ? (
            <>
              <button
                className="btn btn-sm px-4 adminBtn"
                title="Add"
                onClick={() => {
                  setIsEdit(false),
                    reset(initialValues),
                    handleFBuildClick(null);
                }}
              >
                Add{" "}
              </button>
            </>
          ) : (
            <>
              {modulepermission?.add && (
                <button
                  className="btn btn-sm px-4 adminBtn"
                  title="Add"
                  onClick={() => {
                    setIsEdit(false),
                      reset(initialValues),
                      handleFBuildClick(null);
                  }}
                >
                  Add{" "}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="card" style={{ margin: "7px" }}>
        <DataTable
          columns={columns}
          data={catagiriesList}
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
          noDataComponent={
            !dataLoading && (
              <div className="text-center  py-4">No data found</div>
            )
          }
          // progressPending={loading}
          //per page Fixed 25 limit
          paginationPerPage={25}
        />
      </div>

      <div
        className="modal fade"
        id="addModal"
        tabIndex="-1"
        aria-labelledby="addModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit
                  ? "Edit Portfolio Categories"
                  : "Add Portfolio Category"}
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6 mb-1">
                    <label className="form-label">
                      Category Name<span className="text-danger">*</span>{" "}
                    </label>

                    <input
                      {...register("name")}
                      className={`form-control ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter name"
                    />
                    <p className="text-danger">{errors.name?.message}</p>
                  </div>
                  <div className="col-md-4 mb-2">
                    <label
                      className="form-check-label mb-2"
                      htmlFor="customSwitch"
                    >
                      Is Renewal
                    </label>
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="customSwitch"
                        {...register("is_renewal")}
                      />
                    </div>
                  </div>
                  {isRenewalChecked && (
                    <>
                      <div className="col-md-4 mb-1">
                        <label className="form-label">
                          Renewal Period <span className="text-danger">*</span>
                        </label>
                        {/* <input {...register("renewal_period_type")} className={`form-control ${errors.renewal_period_type ? "is-invalid" : ""}`} placeholder="Enter name" /> */}
                        <select
                          {...register("renewal_period_type")}
                          className={`form-control ${
                            errors.renewal_period_type ? "is-invalid" : ""
                          }`}
                        >
                          <option value="">Select Renewal Period</option>
                          <option value="month">Month</option>
                          <option value="year">Year</option>
                        </select>
                        <div className="invalid-feedback">
                          {errors.renewal_period_type?.message}
                        </div>
                      </div>

                      <div className="col-md-4 mb-1">
                        <label className="form-label">
                          Renewal period iteration{" "}
                          <span className="text-danger">*</span>
                        </label>
                        <input
                          {...register("renewal_period_iteration")}
                          type="text"
                          className={`form-control ${
                            errors.renewal_period_iteration ? "is-invalid" : ""
                          }`}
                          placeholder="Enter period"
                          onInput={(e) =>
                            (e.target.value = e.target.value.replace(/\D/g, ""))
                          } // Removes non-numeric characters
                        />
                        <div className="invalid-feedback">
                          {errors.renewal_period_iteration?.message}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-sm btn-primary px-4 adminBtn"
                >
                  Submit
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-secondary ms-2"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* View model */}
      <div
        className="modal fade"
        id="viewModel"
        tabIndex={-1}
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
        data-bs-backdrop="static" // Prevents closing on outside click
        data-bs-keyboard="false" // Prevents closing with Esc key
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <div>
                <div className="mt-2 mb-2">
                  <h2 className=" mb-0 font-weight-bold text-ellipse_title">
                    {categoryViewRecords?.name}
                  </h2>
                </div>
                <div>
                  <p className="text-ellipse_form">
                    {categoryViewRecords?.description}
                  </p>
                </div>
                <div className="d-flex align-question">
                  <p className="font-weight-bold align-items-center">
                    {categoryViewRecords?.category_form?.length} Questions
                  </p>
                  {/* <button className="btn btn-sm btn-custum-primary font-weight-bold ml-4" onClick={categoryButton}>{listParticularTemplates?.data?.templateList[0]?.category?.name}</button> */}
                </div>
              </div>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              />
            </div>
            <div className="modal-body">
              <div>
                {categoryViewRecords?.category_form?.map((item, index) => {
                  console.log(
                    "categoryViewRecords?.category_form",
                    categoryViewRecords
                  );

                  if (item?.data_type?.name === "Text") {
                    return (
                      <div
                        key={item?.id + index}
                        className="d-flex bd-highlight"
                      >
                        <div className="p-2 d-flex align-items-start">
                          <label className="font-weight-bold">
                            {index + 1}.
                          </label>
                        </div>
                        <div className="p-2 flex-grow-1 bd-highlight">
                          <div className="form-group">
                            <label htmlFor="exampleInputEmail1">
                              {item?.name}
                              {item?.is_required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleInputEmail1"
                              aria-describedby="emailHelp"
                              placeholder={item?.placeholder}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="p-2 flex-grow-1  bd-highlight justify-content-end d-flex">
                          <p>
                            {item?.data_type?.name}{" "}
                            <img
                              width="16px"
                              height="16px"
                              src={txt}
                              alt={item?.data_type?.name}
                            />
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (item?.data_type?.name === "Number") {
                    return (
                      <div
                        key={item?.id + index}
                        className="d-flex bd-highlight"
                      >
                        <div className="p-2 d-flex align-items-start">
                          <label className="font-weight-bold">
                            {index + 1}.
                          </label>
                        </div>
                        <div className="p-2 flex-grow-1 bd-highlight">
                          <div className="form-group">
                            <label>
                              {item?.name}
                              {item?.is_required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleInputEmail1"
                              aria-describedby="emailHelp"
                              placeholder={item?.placeholder}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="p-2 flex-grow-1  bd-highlight justify-content-end d-flex">
                          <p>
                            {item?.data_type?.name}{" "}
                            <img
                              width="16px"
                              height="16px"
                              src={num}
                              alt={item?.data_type?.name}
                            />
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (item?.data_type?.name === "Single Choice") {
                    return (
                      <div
                        key={item?.id + index}
                        className="d-flex bd-highlight"
                      >
                        <div className="p-2 d-flex align-items-start">
                          <label className="font-weight-bold">
                            {index + 1}.
                          </label>
                        </div>
                        <div className="p-2 flex-grow-1 bd-highlight">
                          <div className="form-group">
                            <label>
                              {item?.name}
                              {item?.is_required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            {item?.category_form_options?.map(
                              (subItem, index) => (
                                <div
                                  key={subItem?.id + "si"}
                                  className="form-check"
                                >
                                  <input
                                    className="form-check-input"
                                    type="radio"
                                    defaultValue
                                    id="flexCheckDefault"
                                    disabled
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="flexCheckDefault"
                                  >
                                    {subItem?.value}
                                  </label>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div className="p-2 flex-grow-1  bd-highlight justify-content-end d-flex">
                          <p>
                            {item?.data_type?.name}{" "}
                            <img
                              width="16px"
                              height="16px"
                              src={mcq_single}
                              alt={item?.data_type?.name}
                            />
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (item?.data_type?.name === "Multi Choice") {
                    return (
                      <div
                        key={item?.id + index}
                        className="d-flex bd-highlight"
                      >
                        <div className="p-2 d-flex align-items-start">
                          <label className="font-weight-bold">
                            {index + 1}.
                          </label>
                        </div>
                        <div className="p-2 flex-grow-1 bd-highlight">
                          <div className="form-group">
                            <label>
                              {item?.name}
                              {item?.is_required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            {item?.category_form_options?.map(
                              (subItem, index) => (
                                <div
                                  key={subItem?.id + "mi"}
                                  className="form-check"
                                >
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    defaultValue
                                    id="flexCheckDefault"
                                    disabled
                                  />
                                  <label
                                    className="form-check-label"
                                    htmlFor="flexCheckDefault"
                                  >
                                    {subItem?.value}
                                  </label>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                        <div className="p-2 flex-grow-1  bd-highlight justify-content-end d-flex">
                          <p>
                            {item?.data_type?.name}{" "}
                            <img
                              width="16px"
                              height="16px"
                              src={mcq_multiple}
                              alt={item?.data_type?.name}
                            />
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (item?.data_type?.name === "Date") {
                    return (
                      <div
                        key={item?.id + index}
                        className="d-flex bd-highlight"
                      >
                        <div className="p-2 d-flex align-items-start">
                          <label className="font-weight-bold">
                            {index + 1}.
                          </label>
                        </div>
                        <div className="p-2 flex-grow-1 bd-highlight">
                          <div className="form-group">
                            <label>
                              {item?.name}
                              {item?.is_required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            <input
                              type="email"
                              className="form-control"
                              id="exampleInputEmail1"
                              aria-describedby="emailHelp"
                              placeholder={item?.placeholder}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="p-2 flex-grow-1  bd-highlight justify-content-end d-flex">
                          <p>
                            {item?.data_type?.name}{" "}
                            <img
                              width="16px"
                              height="16px"
                              src={dte}
                              alt={item?.data_type?.name}
                            />
                          </p>
                        </div>
                      </div>
                    );
                  }

                  //
                  if (item?.data_type?.name === "Time") {
                    return (
                      <div
                        key={item?.id + index}
                        className="d-flex bd-highlight"
                      >
                        <div className="p-2 d-flex align-items-start">
                          <label className="font-weight-bold">
                            {index + 1}.
                          </label>
                        </div>
                        <div className="p-2 flex-grow-1 bd-highlight">
                          <div className="form-group">
                            <label>
                              {item?.name}
                              {item?.is_required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleInputEmail1"
                              aria-describedby="emailHelp"
                              placeholder={item?.placeholder}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="p-2 flex-grow-1  bd-highlight justify-content-end d-flex">
                          <p>
                            {item?.data_type?.name}{" "}
                            <img
                              width="16px"
                              height="16px"
                              src={tme}
                              alt={item?.data_type?.name}
                            />
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (item?.data_type?.name === "Image") {
                    return (
                      <div
                        key={item?.id + index}
                        className="d-flex bd-highlight"
                      >
                        <div className="p-2 d-flex align-items-start">
                          <label className="font-weight-bold">
                            {index + 1}.
                          </label>
                        </div>
                        <div className="p-2 flex-grow-1 bd-highlight">
                          <div className="form-group">
                            <label>
                              {item?.name}
                              {item?.is_required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleInputEmail1"
                              aria-describedby="emailHelp"
                              placeholder={item?.placeholder}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="p-2 flex-grow-1  bd-highlight justify-content-end d-flex">
                          <p>
                            {item?.data_type?.name}{" "}
                            <img
                              width="16px"
                              height="16px"
                              src={img}
                              alt={item?.data_type?.name}
                            />
                          </p>
                        </div>
                      </div>
                    );
                  }

                  if (item?.data_type?.name === "File Upload") {
                    return (
                      <div
                        key={item?.id + index}
                        className="d-flex bd-highlight"
                      >
                        <div className="p-2 d-flex align-items-start">
                          <label className="font-weight-bold">
                            {index + 1}.
                          </label>
                        </div>
                        <div className="p-2 flex-grow-1 bd-highlight">
                          <div className="form-group">
                            <label>
                              {item?.name}
                              {item?.is_required && (
                                <span className="text-danger">*</span>
                              )}
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="exampleInputEmail1"
                              aria-describedby="emailHelp"
                              placeholder={item?.placeholder}
                              disabled
                            />
                          </div>
                        </div>
                        <div className="p-2 flex-grow-1  bd-highlight justify-content-end d-flex">
                          <p>
                            {item?.data_type?.name}{" "}
                            <img
                              width="16px"
                              height="16px"
                              src={img}
                              alt={item?.data_type?.name}
                            />
                          </p>
                        </div>
                      </div>
                    );
                  }
                })}
              </div>

              {/* no record */}
              {categoryViewRecords?.category_form?.length === 0 && (
                <div className="pane mb-2 ">
                  <div className="">
                    <div className="no_manager"></div>
                    <span className="d-flex justify-content-center">
                      There are no questions
                    </span>
                  </div>
                </div>
              )}

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
      </div>
      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "500px" }}
        >
          <Loader />
        </div>
      )}
    </div>
  );
}

const Category = () => {
  return (
    <Suspense>
      <Routes>
        {[{ path: "/", element: CategoryView }, ...dynamicRoutes].map(
          (route, index) =>
            route.element && (
              <Route
                key={index}
                path={route.path}
                element={<route.element />}
              />
            )
        )}
      </Routes>
    </Suspense>
  );
};

export default Category;
