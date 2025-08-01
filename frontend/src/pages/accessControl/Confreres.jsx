import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { tableStyle } from "../../constant/Util";
import PhoneInput from "react-phone-input-2";
import { isValidPhoneNumber } from "libphonenumber-js";
import "react-phone-input-2/lib/style.css";
import { data } from "react-router-dom";
import Swal from "sweetalert2";
import { ContextProvider } from "../../App";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";
import { API_BASE_URL } from "../../constant/baseURL";
import { countryLengths, countryNames } from "../../constant/Util";
import Loader from "../../constant/loader";
function Confreres() {
  //Validation Yup
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),

    country_code: yup.string().required("Country code is required"),

    mobile_no: yup
      .string()
      .required("Mobile number is required")
      .test("valid-for-country", function (value) {
        const country_code = this.parent.country_code;
        if (!country_code) {
          return this.createError({ message: "Select country code first" });
        }

        const expectedLen = countryLengths[country_code];
        const countryName = countryNames[country_code] || country_code;
        const full = `+${country_code}${value || ""}`;

        if (!isValidPhoneNumber(full)) {
          if (expectedLen) {
            return this.createError({
              message: `${countryName} numbers must be ${expectedLen} digits`,
            });
          }
          return this.createError({
            message: `Invalid number for +${country_code}`,
          });
        }

        // additionally enforce length if defined
        if (expectedLen && value.length !== expectedLen) {
          return this.createError({
            message: `${countryName} numbers must be ${expectedLen} digits`,
          });
        }

        return true;
      }),

    code: yup.string(),
  });

  //import vaildation
  const schema1 = yup.object().shape({
    file: yup
      .mixed()
      .required("File is required")
      .test(
        "fileType",
        "Only Excel files (.xls, .xlsx) are allowed",
        (value) => {
          if (!value) return false;
          const allowedTypes = [
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          ];
          return allowedTypes.includes(value.type);
        }
      ),
  });
  const initial = {
    code: "",
    name: "",
    email: "",
    mobile_no: "",
    country_code: "",
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    control,
  } = useForm({ resolver: yupResolver(schema), defaultValues: initial });
  const {
    register: register1,
    handleSubmit: handleSubmit1,
    setValue: setValue1,
    getValues: getValues1,
    reset: reset1,
    formState: { errors: errors1 },
    watch: watch1,
    control: control1,
    setError: setError1,
    clearErrors: clearErrors1,
  } = useForm({ resolver: yupResolver(schema1) });

  // edit obj
  const [search, setSearch] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [selectedConf, setSelectedConf] = useState(null);
  const [phone, setPhone] = useState({
    country_code: "91",
    mobile_no: "",
    value: "",
    error: "",
  });
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const [confreres, setConfreres] = useState([]);
  // console.log(confreres, "confreres");
  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const [query, setQuery] = useState("");
  const AUTH_TOKEN = sessionStorage.getItem("token");

  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;

  const modulepermission = permissions?.role_permissions?.confreres;

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

  const editClick = (data) => {
    data.country_code = data?.country_code || "91";
    setIsEdit(true);

    // Always use a string for mobile_no, remove leading zeros
    let mobile_no = (data.mobile_no ?? "").toString().replace(/^0+/, "");
    let country_code = data.country_code || "91";

    // Set the phone state with the full value
    setPhone({
      country_code,
      mobile_no,
      value: `${country_code}${mobile_no}`,
      error: "",
    });

    // Reset form with the data
    reset({
      ...data,
      country_code,
      mobile_no,
    });
  };

  const handlePhoneChange = (phoneValue, country) => {
    let number = phoneValue?.slice(country?.dialCode?.length) || "";
    var isValidNumber = null;
    if (number?.split("")?.every((item) => item === "0")) {
      isValidNumber = false;
    } else if (number?.split("")?.[0] === "0") {
      isValidNumber = false;
    } else {
      isValidNumber = isValidPhoneNumber(
        phoneValue,
        country?.countryCode?.toUpperCase()
      );
    }
    setPhone({
      mobile_no: number,
      country_code: country?.dialCode,
      error: isValidNumber ? "" : "Enter a valid number",
      value: phoneValue, // Always set the full value
    });
    setValue("country_code", country?.dialCode);
    setValue("mobile_no", number, { shouldValidate: true });
  };

  //search
  const getConfreres = useCallback(
    (search) => {
      setLoading(true);
      getAPI(
        `/confreres/get?skip=${pagination?.skip}&limit=${
          pagination?.limit
        }&search=${search || ""}`
      )
        .then((res) => {
          if (res?.data?.status) {
            setConfreres(res?.data?.data);
            setTotalRows(res?.data?.total_count); // if total_count exists in response
          } else {
            setConfreres([]);
          }
        })
        .catch((err) => {
          console.error("Error fetching confreres:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    },
    [pagination, query]
  );

  const handleSearch = (e) => {
    getConfreres(e.target.value);
  };

  //get Method
  const confreresList = useCallback(
    (search) => {
      setLoading(true);
      if (search !== undefined) {
        getAPI(
          `/confreres/get?skip=${pagination?.skip}&limit=${pagination?.limit}&search=` +
            search
        )
          .then((res) => {
            console.log("Get-confreres", res?.data);

            if (res?.data?.status) {
              setConfreres(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setConfreres([]);
            }
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
            setDataLoading(false);
          });
      } else {
        getAPI(
          `/confreres/get?skip=${pagination?.skip}&limit=${pagination?.limit}`
        )
          .then((res) => {
            if (res?.data?.status) {
              setConfreres(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setConfreres([]);
            }
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
            setDataLoading(false);
          });
      }
    },
    [pagination]
  );

  const onSubmit = (data) => {
    let apiData = {
      name: data?.name,
      email: data?.email,
      mobile_no: phone?.mobile_no, // Use phone state for mobile number
      country_code: phone?.country_code, // Use phone state for country code
    };

    //post & Put Method
    const method = !isEdit ? "POST" : "PUT";
    const url = !isEdit ? "/confreres/post" : `/confreres/${data?.id}`;

    addUpdateAPI(method, url, apiData)
      .then((res) => {
        if (res?.data?.status) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: isEdit ? "Updated!" : "Created!",
            text: !isEdit
              ? "Confrere details saved successfully!"
              : "Confrere details updated successfully!",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: " #28a745",
            color: "  #ffff",
          });
          setSearch("");
          reset(initial);
          setIsEdit(false);
          setPhone({ country_code: "91", mobile_no: "", value: "", error: "" }); // Reset phone state properly
          const modalElement = document.getElementById("addModel");
          const modalInstance = bootstrap.Modal.getInstance(modalElement);
          modalInstance?.hide();
          confreresList(""); // trigger fresh fetch
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  //Delete Method
  const handeleDelete = (id) => {
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
        deleteAPI("/confreres/" + id).then((res) => {
          if (res?.data.status) {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Deleted!",
              text: "Deleted successfully.",
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: "#28a745", // success green
              color: "#fff",
            });

            confreresList(""); // trigger fresh fetch
            setLoading(false);
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
        });
      }
    });
  };

  useEffect(() => {
    confreresList();
  }, []);
  useEffect(() => {
    confreresList();
  }, [confreresList]);

  const columns = [
    { name: "Code", selector: (row) => row.code, sortable: true },
    { name: "Name", selector: (row) => row.name, sortable: true },
    { name: "Email", selector: (row) => row.email },
    { name: "Mobile", selector: (row) => row.mobile_no },
    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            {currentUser?.role?.name === "Admin" ||
            currentUser?.role?.name === "Super Admin" ? (
              <>
                <div className="form_col ml-1">
                  <span className="custum-group-table">
                    <button
                      type="button"
                      className="btn  btn-sm text-info"
                      data-bs-toggle="modal"
                      data-bs-target="#viewModel"
                      title="View"
                      onClick={() => setSelectedConf(row)}
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
                      data-bs-target="#addModel"
                      onClick={() => editClick(row)}
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
                      onClick={() => handeleDelete(row?.id)}
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
                          data-bs-toggle="modal"
                          data-bs-target="#viewModel"
                          title="View"
                          onClick={() => setSelectedConf(row)}
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
                          data-bs-toggle="modal"
                          data-bs-target="#addModel"
                          onClick={() => editClick(row)}
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
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  //Import Export Excel

  // Handle File Selection (Manually Selected)
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ];

      if (!allowedTypes.includes(file.type)) {
        setError1("file", {
          type: "manual",
          message: "Only Excel files (.xls, .xlsx) are allowed",
        });
      } else {
        clearErrors1("file");
        setFileName(file.name);
        setValue1("file", file); // Store file in React Hook Form
      }
    }
  };

  // Handle Drag and Drop
  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      const allowedTypes = [
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/octet-stream", // Add this
      ];

      if (!allowedTypes.includes(file.type)) {
        setError1("file", {
          type: "manual",
          message: "Only Excel files (.xls, .xlsx) are allowed",
        });
      } else {
        clearErrors1("file");
        setFileName(file.name);
        setValue1("file", file);
      }
    }
  };

  // Drag Events
  const handleDragOver = (event) => {
    event.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const onSubmit1 = (data) => {
    const formData = new FormData();
    formData.append("file", data.file);
    // console.log("Uploading file:", data.file);
    const mapping = "POST";
    addUpdateAPI(mapping, "confreres/import", formData).then((res) => {
      if (res?.data?.status) {
        confreresList(""); // trigger fresh fetch
        setLoading(false);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "uploaded!",
          text: res?.data?.message || "Success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: " #28a745",
          color: "  #ffff",
        });
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
    });

    // ✅ Hide the modal after successful submission
    const modal = document.getElementById("fileImportModal");
    const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
    modalInstance.hide();
  };

  const downloadExcel = () => {
    fetch(API_BASE_URL + "confreres/sample-excel", {
      method: "GET",
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    })
      .then((response) => response.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "confreres-sample.xlsx"; // Change the file name if needed
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => console.error("Download failed:", error));
  };

  const downloadCommunityExcel = () => {
    fetch(API_BASE_URL + "confreres/export", {
      method: "GET",
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        Authorization: `Bearer ${AUTH_TOKEN}`,
      },
    })
      .then((response) => {
        response.blob().then((blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "confreres.xlsx"; // Change the file name if needed
          document.body.appendChild(a);
          a.click();
          a.remove();
        });
      })
      .catch((error) => console.error("Download failed:", error));
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
          <div className="p-2 col-lg-5 col-12">
            <h6 className="fw-bold mb-0">Confreres</h6>
          </div>
          <div className="d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1">
            <div className="me-2 d-flex align-items-center">
              <button className="btn bnt-sm adminsearch-icon">
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
              <input
                type="text"
                className="form-control adminsearch"
                placeholder="Search by Name, Mobile, Email"
                title="Search"
                value={search}
                onChange={(e) => {
                  getConfreres(e.target.value), setSearch(e.target.value);
                }}
              />
            </div>
            {/* {
              currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ?

                <>
                  <button
                    className="btn btn-sm adminBtn px-4" data-bs-toggle="modal" data-bs-target="#addModel"> Add</button>
                </>
                : <>
                  {
                    modulepermission?.add && (
                      <button
                        className="btn btn-sm adminBtn px-4" data-bs-toggle="modal" data-bs-target="#addModel"> Add</button>
                    )

                  }

                </>
            } */}
            {currentUser?.role?.name === "Admin" ||
            currentUser?.role?.name === "Super Admin" ? (
              <>
                <button
                  className="btn btn-sm px-4 adminBtn"
                  title="Add"
                  data-bs-toggle="modal"
                  data-bs-target="#addModel"
                  onClick={() => {
                    setIsEdit(false);
                    setSelectedConf(null);
                    reset(initial);
                    setPhone({
                      mobile_no: "",
                      country_code: "91",
                      value: "",
                      error: "",
                    });
                  }}
                >
                  Add{" "}
                </button>
                <button
                  className="btn btn-sm px-4   btn-success"
                  data-bs-toggle="modal"
                  data-bs-target="#fileImportModal"
                  title="Import"
                  onClick={() => {
                    reset1({ file: "" }); // Reset React Hook Form value
                    setFileName(""); // Clear file name from state
                    if (fileInputRef.current) {
                      fileInputRef.current.value = ""; // Clear file input manually
                    }
                  }}
                >
                  Import{" "}
                </button>
                <button
                  className="btn btn-sm px-4  btn-primary"
                  title="Export"
                  onClick={downloadCommunityExcel}
                >
                  Export{" "}
                </button>
              </>
            ) : (
              <>
                {modulepermission?.add && (
                  <button
                    className="btn btn-sm px-4 adminBtn"
                    title="Add"
                    data-bs-toggle="modal"
                    data-bs-target="#addModel"
                    onClick={() => {
                      setIsEdit(false);
                      setSelectedConf(null);
                      reset(initial);
                    }}
                  >
                    Add{" "}
                  </button>
                )}

                {modulepermission?.add && (
                  <>
                    <button
                      className="btn btn-sm px-4   btn-success"
                      data-bs-toggle="modal"
                      data-bs-target="#fileImportModal"
                      title="Import"
                      onClick={() => {
                        reset1({ file: "" }); // Reset React Hook Form value
                        setFileName(""); // Clear file name from state
                        if (fileInputRef.current) {
                          fileInputRef.current.value = ""; // Clear file input manually
                        }
                      }}
                    >
                      Import{" "}
                    </button>
                  </>
                )}

                {modulepermission?.view && (
                  <>
                    <button
                      className="btn btn-sm px-4  btn-primary"
                      title="Export"
                      onClick={downloadCommunityExcel}
                    >
                      Export{" "}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={confreres}
            customStyles={tableStyle}
            paginationRowsPerPageOptions={[25, 50, 75, 100]} //pagination
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
      </div>

      <div
        className="modal fade "
        id="addModel"
        tabIndex="-1"
        aria-labelledby="addModelLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? "Edit Confrere" : "Add Confrere"}
              </h5>
              <button
                type="button"
                id="closeAddmodal"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  reset(initial);
                  setPhone({
                    country_code: "91",
                    mobile_no: "",
                    value: "",
                    error: "",
                  }); // Reset phone state to initial values
                  setIsEdit(false); // Reset edit state
                }}
              ></button>
            </div>
            <form
              onSubmit={handleSubmit(onSubmit, (errors) => {
                // console.log('Form has errors:', errors);
              })}
            >
              <div className="modal-body">
                <div className="row ms-1">
                  <div className="col-6 mb-1">
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

                  <div className="col-6 mb-3">
                    <label className="form-label">
                      Email <span className="text-danger">*</span>
                    </label>
                    <input
                      type="email"
                      {...register("email")}
                      className={`form-control`}
                      placeholder="Enter email"
                    />
                    <p className="text-danger ">{errors.email?.message}</p>
                  </div>

                  <div className="col-6 mb-3">
                    <label className="form-label">
                      Mobile <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="mobile_no"
                      control={control}
                      render={({ field }) => (
                        <PhoneInput
                          {...field}
                          country={phone.country_code ? undefined : "in"}
                          value={phone.value || ""}
                          enableSearch={true}
                          placeholder="Enter mobile number"
                          inputStyle={{ width: "100%", height: "30px" }}
                          dropdownStyle={{ color: "black" }}
                          onChange={(phoneValue, country) => {
                            handlePhoneChange(phoneValue, country);
                            // Update react-hook-form value as well
                            field.onChange(
                              phoneValue?.slice(country?.dialCode?.length) || ""
                            );
                          }}
                        />
                      )}
                    />

                    <div className="text-danger small mt-1">
                      {errors.mobile_no?.message}
                    </div>
                  </div>
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
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    reset(initial);
                    setPhone({
                      country_code: "91",
                      mobile_no: "",
                      value: "",
                      error: "",
                    }); // Reset phone state to initial values
                    setIsEdit(false); // Reset edit state
                  }}
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div
        className="modal fade "
        id="viewModel"
        tabIndex="-1"
        aria-labelledby="addModelLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Confreres</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              <div className="row ms-1">
                <div className="col-6 mb-1">
                  <label className="form-label">Confrere Code </label>
                  <p className="fw-bold text-dark">{selectedConf?.code}</p>
                </div>

                <div className="col-6 mb-1">
                  <label className="form-label">Name </label>
                  <p className="fw-bold text-dark">{selectedConf?.name}</p>
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Email </label>
                  <p className="fw-bold text-dark ">{selectedConf?.email}</p>
                </div>

                <div className="col-6 mb-3">
                  <label className="form-label">Mobile </label>
                  <div className="fw-bold text-dark">
                    {selectedConf?.mobile_no}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => {
                  reset(initial);
                  setPhone({
                    country_code: "91",
                    mobile_no: "",
                    value: "",
                    error: "",
                  }); // Reset phone state to initial values
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* import modal */}
      <div
        className="modal fade"
        id="fileImportModal"
        tabIndex="-1"
        aria-labelledby="fileImportModalLabel"
      >
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Import confreres</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <form onSubmit={handleSubmit1(onSubmit1)}>
              <div className="modal-body">
                <div
                  className={`drop-zone ${dragActive ? "active" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current.click()}
                >
                  <p>
                    Drag & drop an{" "}
                    <strong>Excel file (.xls, .xlsx) only</strong> here
                  </p>
                  <p className="text-dark">or</p>
                  <p>
                    <span className="browse-text">Select an Excel file</span>
                  </p>

                  <input
                    type="file"
                    className="form-control d-none"
                    accept=".xls,.xlsx"
                    {...register1("file")}
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                </div>

                {errors1.file && (
                  <p className="text-danger mt-2">{errors1.file.message}</p>
                )}
                {fileName && (
                  <p className="mt-2 text-success">Selected File: {fileName}</p>
                )}
                <div className="mt-3 text-end">
                  {" "}
                  <button
                    type="button"
                    className="btn btn-sm btn-link px-4"
                    onClick={downloadExcel}
                  >
                    Download Example file
                  </button>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="submit"
                  className="btn btn-sm btn-primary px-4 adminBtn"
                  disabled={!fileName}
                >
                  Upload
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

        {/* Styling for drag-and-drop area */}
        <style>
          {`
          .drop-zone {
            border: 2px dashed #007bff;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            cursor: pointer;
            transition: all 0.3s ease;
            }

          .drop-zone.active {
            background-color: #f8f9fa;
            border-color: #0056b3;
          }

          .browse-text {
            color: #007bff;
            font-weight: bold;
          }
        `}
        </style>
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

export default Confreres;
