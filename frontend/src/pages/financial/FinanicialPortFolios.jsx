import React, { Suspense, useContext, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  formatDate,
  getExampleForName,
  getPatternForName,
  RoleIds,
  tableStyle,
} from "../../constant/Util";
import DataTable from "react-data-table-component";
import { docsRoute, epfRoutes } from "../../routes";
import { ContextProvider } from "../../App";
import { Controller, set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";
import Select from "react-select";

function FinanicialPortFolios() {
  const contextProp = useContext(ContextProvider);
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [navState, setNavState] = useState({
    name: "",
    portfolio_id: null,
    financialPortfolio_id: null,
    financialPortfolio_name: "",
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [modulepermission, setmodulepermission] = useState(null);
  useEffect(() => {
    if (contextProp?.currUser) {
      setCurrentUser(contextProp.currUser);
    }

    if (contextProp?.permissions) {
      setmodulepermission(contextProp?.permissions?.role_permissions || {});
    }
  }, [contextProp]);

  // console.log("currentUser", currentUser);

  const [epfList, setEpfList] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });

  const [useroptions, setUserOptions] = useState([]);
  const [vieweruseroptions, setViewerUserOptions] = useState([]);
  const [editData, setEditData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const baseSchema = {
    name: yup.string().required("Name is required"),
    financial_type: yup
      .string()
      .oneOf(["Registered", "Not Registered", "Not Applicable"])
      .required("Type is required"),
  };

  const dynamicSingleSchema = () => {
    const name = navState?.financialPortfolio_name;

    if (!name) return {};

    const numberField = `${name}_number`;
    const pattern = getPatternForName(name);

    return {
      [numberField]: yup
        .string()
        .nullable()
        .notRequired()
        .test("validate-if-filled", function (value) {
          const { path, createError } = this;

          if (!value) return true; // Allow empty

          const isValid = pattern ? pattern.test(value) : true;
          if (!isValid) {
            const example = getExampleForName(name);
            return createError({
              path,
              message: `Invalid ${name} number format. Example: ${example}`,
            });
          }

          return true;
        }),
    };
  };

  // ✅ Final schema
  const schema = yup.object().shape({
    ...baseSchema,
    ...dynamicSingleSchema(), // merged dynamically
  });

  const getInitialValues = (financialPortfolioName) => {
    return {
      name: "",
      ...(financialPortfolioName
        ? {
            [`${financialPortfolioName}_name`]: "",
            [`${financialPortfolioName}_number`]: "",
          }
        : {}),
      incharge_user_id: null,
      viewr_user_id: null,
    };
  };

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
    watch,
    control,
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: getInitialValues(navState?.financialPortfolio_name),
  });

  const selectedType = watch("financial_type");

  // console.log("epfList", epfList);

  useEffect(() => {
    const stored = sessionStorage.getItem("navState");
    if (stored) {
      setNavState(JSON.parse(stored));
    }
  }, []);
  useEffect(() => {
    if (!navState?.portfolio_id || !navState?.financialPortfolio_id) {
      return;
    }
    getFinancialList();
  }, [navState, pagination, search]);

  useEffect(() => {
    getViewerUserOptions();
    getUserOptions();
  }, []);

  const getFinancialList = () => {
    setDataLoading(true);
    getAPI(
      `config/list-by-financial?non_financial_portfolio_id=${
        navState?.portfolio_id
      }&financial_portfolio_id=${navState?.financialPortfolio_id}&skip=${
        pagination.skip
      }&limit=${pagination.limit} &search=${search ? search : ""}`
    )
      .then((res) => {
        // console.log("Financial List:", res);
        if (res?.status) {
          setEpfList(res?.data?.data || []);
          setTotalRows(res?.data?.total_count);
        }
      })
      .catch((error) => {
        console.error("Error fetching Financial list:", error);
      })
      .finally(() => setDataLoading(false));
  };

  if (!contextProp.navState) {
    return <div className="text-center">Loading...</div>;
  }
  // console.log("navState", navState);

  const getUserOptions = () => {
    getAPI("/access/users-options?role_id=3").then((res) => {
      if (res?.data?.status) {
        setUserOptions(res?.data?.data);
      }
    });
  };
  const getViewerUserOptions = () => {
    getAPI("/access/users-options?role_id=4").then((res) => {
      if (res?.data?.status) {
        setViewerUserOptions(res?.data?.data);
      }
    });
  };

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

  const manageFiles = (row) => {
    // console.log("manageFiles row", row);
    const enitity_id = row?.entity_id;
    const financialPortfolio_id = row?.financial_portfolio_id;
    const financialPortfolio_name = navState?.financialPortfolio_name;
    const portfolio_id = navState?.portfolio_id;
    const enitity_name = row?.entity_name;
    const financial_portfolio_id_apicall = row?.financialPortfolio_record_id;
    const module_name = navState?.name;
    const return_path = "/financial/financialPortfolios";

    // console.log("module_name", module_name);
    // console.log("enitity_id", enitity_id);
    // console.log("financialPortfolio_id", financialPortfolio_id);
    // console.log("financialPortfolio_name", financialPortfolio_name);
    // console.log("portfolio_id", portfolio_id);
    // console.log("enitity_name", enitity_name);
    // console.log("financial_portfolio_id_apicall", financial_portfolio_id_apicall);
    sessionStorage.setItem(
      "navState",
      JSON.stringify({
        enitity_id,
        financialPortfolio_id,
        financialPortfolio_name,
        portfolio_id,
        enitity_name,
        financial_portfolio_id_apicall,
        module_name,
        return_path,
      })
    );
    navigate("/nonfinancial/community");
  };

  const editClick = (row) => {
    // console.log("editClick row", row);
    const enitity_id = row?.entity_id;
    const financialPortfolio_id = row?.financial_portfolio_id;
    const financialPortfolio_name = navState?.financialPortfolio_name; // navState?.financialPortfolio_name
    const portfolio_id = navState?.portfolio_id; // navState?.portfolio_id
    const enitity_name = row?.entity_name;
    const financial_portfolio_id_apicall = row?.financialPortfolio_record_id;
    const module_name = navState?.name;
    const financial_type = row?.financialPortfolio_record_type;
    // navigate("/financial/portfolioEdit", {
    //   state: {
    //     enitity_id,
    //     financialPortfolio_id,
    //     portfolio_id,
    //     module_name
    //   }
    // });

    setEditData(row);
    setValue("name", row?.entity_name);
    // setValue("financialPortfolio_record_name", row?.financialPortfolio_record_name);
    setValue(
      `${navState.financialPortfolio_name}_name`,
      row?.financialPortfolio_record_name
    );
    setValue(
      `${navState.financialPortfolio_name}_number`,
      row?.financialPortfolio_record_number
    );
    setValue("financial_type", row?.financialPortfolio_record_type || "");
    // setValue("incharge_id", row?.incharge_id);
    // setValue("viewer_id", row?.viewer_id);
    // setModalShow(true);

    const incharge = row?.incharge;
    const defaultIncharge = incharge
      ? {
          value: incharge?.id,
          label: incharge?.name,
          roleId: RoleIds?.DDMRoleId,
        }
      : null;
    // console.log("defaultIncharge", defaultIncharge);
    setValue("incharge_user_id", defaultIncharge);

    const viewerUsers = row?.viewer;
    const defaultViewers = viewerUsers
      ? {
          value: viewerUsers?.id,
          label: viewerUsers.name,
          roleId: RoleIds?.ViewerRoleId,
        }
      : null;
    // console.log("defaultViewers 710", defaultViewers);
    setValue("viewer_user_id", defaultViewers);
  };

  const normalizeModuleLabel = (key) => {
    const labelMap = {
      technicalinstitute: "Technical Institute",
      boardinghostel: "Boarding and Hostel",
      socialsector: "Social Sector",
      community: "Community",
      society: "Society",
      parish: "Parish",
      school: "School",
      college: "College",
      department: "Department",
      company: "Company",
    };
    return labelMap[key?.toLowerCase()] || key;
  };

  const moduleKey = contextProp?.navState?.module_name
    ?.toLowerCase()
    ?.replace(/\s+/g, "");
  const displayLabel = normalizeModuleLabel(moduleKey);

  const columns = [
    {
      name: displayLabel,
      sorted: true,
      cell: (row) => (
        <label className="text-truncate" title={row?.entity_name}>
          {row?.entity_name}
        </label>
      ),

      // selector: row => row.entity_name,
    },
    {
      name: navState?.financialPortfolio_name + " Name",
      selector: (row) => row?.financialPortfolio_record_name,
      sortable: true,
    },
    {
      name: navState?.financialPortfolio_name + " Number",
      selector: (row) => row?.financialPortfolio_record_number,
      sortable: true,
    },
    {
      name: "Incharge",
      selector: (row) => row?.incharge?.name,
      sortable: true,
    },
    {
      name: "Viewer",
      selector: (row) => row?.viewer?.name,
      sortable: true,
    },
    {
      name: "Type",
      selector: (row) => row?.financialPortfolio_record_type || "-",
      sortable: true,
    },

    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex justify-content-between">
          {/* Add button: only for Registered */}
          {row?.financialPortfolio_record_type === "Registered" &&
            row?.financialPortfolio_record_name &&
            row?.financialPortfolio_record_number && (
              <div className="form_col ml-1 ">
                <span className="custum-group-table">
                  <button
                    type="button"
                    className="btn btn-sm gap-1"
                    title="Add Manage files"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      color: "white",
                      backgroundColor: "#0d6efd",
                      gap: "6px",
                      fontWeight: 500,
                    }}
                    onClick={() => {
                      manageFiles(row);
                    }}
                  >
                    <i
                      className="fa-solid fa-circle-plus"
                      style={{ color: "white" }}
                    ></i>
                    <span>Add</span>
                  </button>
                </span>
              </div>
            )}

          {/* Edit button: only for NOT Registered */}
          {(currentUser?.role?.name === "Admin" ||
            currentUser?.role?.name === "Super Admin" ||
            currentUser?.id === row?.incharge?.id) && (
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#addModel"
                  onClick={() => {
                    editClick(row);
                  }}
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
          )}
        </div>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const onSubmit = (data) => {
    const isRegistered = data.financial_type === "Registered";
    const payload = {
      portfolio_id: navState?.portfolio_id,
      financial_type: data.financial_type,
      financial_number: isRegistered
        ? data[`${navState?.financialPortfolio_name}_number`] || null
        : "",
      financial_name: isRegistered
        ? data[`${navState?.financialPortfolio_name}_name`] || null
        : "",
      financial_viewer: isRegistered ? data?.viewer_user_id?.value || null : null,
      financial_incharge: isRegistered
        ? data?.incharge_user_id?.value || null
        : null,
    };

    // console.log("payload", payload);

    addUpdateAPI(
      "PUT",
      "/config/entity-portfolio/update?financial_record_id=" +
        editData?.financialPortfolio_record_id,
      payload
    ).then((res) => {
      // console.log("res", res);
      if (res?.status) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: res?.message || "Updated successfully!",
          timer: 2000,
          showConfirmButton: false,
        });
        getFinancialList();
        const modal = document.getElementById("addModel");
        const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
        modalInstance.hide();
        reset();
      }
    });
  };

  // console.log("name", navState?.name);
  console.log("epfList", epfList);

  const handeBackClick = () => {
    if (navState?.name) {
      const nav = sessionStorage.getItem("navState");
      if (nav) {
        const parsedNav = JSON.parse(nav);
        delete parsedNav?.financialPortfolio_id; // remove specific key
        sessionStorage.setItem("navState", JSON.stringify(parsedNav)); // update
      }
      navigate(navState?.name ? `/${navState?.name}` : -1);
    }
  };

  return (
    <>
      <div>
        <div className="p-2 bg-white">
          <div className="row m-2 ">
            <div className="col p-0">
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn pb-0"
                  type="button"
                  onClick={() => handeBackClick()}
                >
                  <i className="fa-solid fa-circle-left fs-5" />
                </button>
                {navState?.name === "community" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    Community - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "society" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    Society - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "parish" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    Parish - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "school" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    School - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "technicalinstitute" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    Technical Institute - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "college" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    College - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "boardinghostel" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    Boarding & Hostel - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "department" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    Department - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "socialsector" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    Social Sector - {navState?.financialPortfolio_name}
                  </h6>
                )}
                {navState?.name === "company" && (
                  <h6 className="fw-bold text-dark mb-0">
                    {" "}
                    Company - {navState?.financialPortfolio_name}
                  </h6>
                )}

                {/* <h6 className="fw-bold text-dark mb-0"> {navState?.name} - {navState?.financialPortfolio_name}</h6> */}
                <div />
              </div>
            </div>
            <div className="col p-0">
              <div className="d-flex justify-content-end">
                <div className="me-2 d-flex align-items-center">
                  <button className="btn bnt-sm adminsearch-icon">
                    <i className="fa fa-search " aria-hidden="true"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control adminsearch"
                    placeholder="Search by category"
                    title="Search by category"
                    onChange={(e) => {
                      setSearch(e.target.value);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={epfList}
            customStyles={tableStyle}
            paginationRowsPerPageOptions={[25, 50, 75, 100]}
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
                <div className="text-center py-4">No data found</div>
              )
            }
            // progressPending={loading}
            //per page Fixed 25 limit
            paginationPerPage={25}
          />
        </div>

        <div
          className="modal fade "
          id="addModel"
          tabIndex="-1"
          aria-labelledby="addModelLabel"
          data-bs-backdrop="static"
          data-bs-keyboard="false"
        >
          <div className="modal-dialog modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {navState?.name} - {navState?.financialPortfolio_name}
                </h5>
                <button
                  type="button"
                  className="btn-sm btn-close"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    reset();
                  }}
                  aria-label="Close"
                ></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="modal-body">
                  <div className="row ms-1">
                    <div className="col-md-3 mb-1">
                      <label className="form-label">
                        {navState?.name} Name
                        <span className="text-danger"> *</span>
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter name"
                        disabled={true}
                        {...register("name", { required: "Name is required" })}
                      />
                      <p className="text-danger">{errors.name?.message}</p>
                    </div>
                    <div className="col-md-3 mb-1">
                      <label className="form-label">
                        Type <span className="text-danger">*</span>
                      </label>
                      <Controller
                        name="financial_type"
                        control={control}
                        defaultValue=""
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={[
                              { value: "Registered", label: "Registered" },
                              {
                                value: "Not Registered",
                                label: "Not Registered",
                              },
                              {
                                value: "Not Applicable",
                                label: "Not Applicable",
                              },
                            ]}
                            classNamePrefix="custom-react-select"
                            placeholder="Select Type"
                            isClearable
                            menuPortalTarget={document.body}
                            menuPosition="fixed"
                            styles={{
                              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                              menu: (base) => ({ ...base, zIndex: 9999 }),
                              control: (base) => ({ ...base, minHeight: 38 }),
                              menuList: (base) => ({
                                ...base,
                                maxHeight: "200px",
                                overflowY: "auto",
                              }),
                            }}
                            onChange={(selectedOption) => {
                              field.onChange(
                                selectedOption ? selectedOption.value : ""
                              );
                            }}
                            value={
                              field.value
                                ? {
                                    value: field.value,
                                    label: field.value,
                                  }
                                : null
                            }
                          />
                        )}
                      />
                      <p className="text-danger">
                        {errors.financial_type?.message}
                      </p>
                    </div>
                    {selectedType === "Registered" && (
                      <>
                        <div className="col-md-3 mb-1">
                          <label className="form-label">
                            {navState?.financialPortfolio_name} Name
                            <span className="text-danger"> </span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter name"
                            {...register(
                              `${navState?.financialPortfolio_name}_name`,
                              {
                                required: "Name is required",
                              }
                            )}
                          />
                          <p className="text-danger">
                            {
                              errors?.[
                                `${navState?.financialPortfolio_name}_name`
                              ]?.message
                            }
                          </p>
                        </div>

                        <div className="col-md-3 mb-1">
                          <label className="form-label">
                            {navState?.financialPortfolio_name} Number
                            <span className="text-danger"> </span>
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Enter number"
                            {...register(
                              `${navState?.financialPortfolio_name}_number`,
                              {
                                required: "Number is required",
                              }
                            )}
                          />
                          <p className="text-danger">
                            {
                              errors?.[
                                `${navState?.financialPortfolio_name}_number`
                              ]?.message
                            }
                          </p>
                        </div>
                        <div className="col-md-3 mb-1">
                          <label className="form-label">Incharge</label>
                          <Controller
                            name="incharge_user_id"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                options={useroptions?.map((data) => ({
                                  value: data.id,
                                  label: data.name,
                                  roleId: RoleIds.DDMRoleId,
                                }))}
                                classNamePrefix="custom-react-select"
                                placeholder="Select Incharge"
                                isClearable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (base) => ({ ...base, zIndex: 9999 }),
                                  control: (base) => ({
                                    ...base,
                                    minHeight: 38,
                                  }),
                                  menuList: (base) => ({
                                    ...base,
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                  }),
                                }}
                                onChange={(selectedOptions) => {
                                  field.onChange(selectedOptions);
                                }}
                              />
                            )}
                          />
                          <p className="text-danger">
                            {errors.user_id?.message}
                          </p>
                        </div>
                        <div className="col-md-3 mb-1">
                          <label className="form-label">Viewer</label>
                          <Controller
                            name="viewer_user_id"
                            control={control}
                            render={({ field }) => (
                              <Select
                                {...field}
                                isMulti={false}
                                options={vieweruseroptions?.map((data) => ({
                                  value: data.id,
                                  label: data.name,
                                  roleId: RoleIds.ViewerRoleId,
                                }))}
                                classNamePrefix="custom-react-select"
                                placeholder="Select Viewer"
                                isClearable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                styles={{
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                  menu: (base) => ({ ...base, zIndex: 9999 }),
                                  control: (base) => ({
                                    ...base,
                                    minHeight: 38,
                                  }),
                                  menuList: (base) => ({
                                    ...base,
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                  }),
                                }}
                                onChange={(selectedOptions) => {
                                  field.onChange(selectedOptions);
                                }}
                              />
                            )}
                          />
                          <p className="text-danger">
                            {errors.viewer_user_id?.message}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-sm btn-secondary"
                    onClick={() => {
                      reset();
                    }}
                    data-bs-dismiss="modal"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-primary px-4 adminBtn"
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FinanicialPortFolios;
