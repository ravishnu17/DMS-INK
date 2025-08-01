import React, {
  Suspense,
  use,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { RoleIds, tableStyle } from "../constant/Util";
import { data, Link, useNavigate } from "react-router-dom";

import { Controller, set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { addUpdateAPI, deleteAPI, getAPI } from "../constant/apiServices";
import Select from "react-select";
import { ContextProvider } from "../App";
import LocationConfig from "../constant/LocationConfig";
import styled from "styled-components";
import { API_BASE_URL } from "../constant/baseURL";
import Loader from "../constant/loader";

const StickyLastColumn = styled.div`
  .rdt_TableHeadRow .rdt_TableCol:last-child,
  .rdt_TableRow .rdt_TableCell:last-child {
    position: sticky;
    right: 0;
    background-color: white;
    z-index: 10;
  }

   .rdt_TableRow:hover .rdt_TableCell:last-child {
    background-color:rgb(243, 243, 243);

  .rdt_TableHeadRow .rdt_TableCol:last-child {
    z-index: 12;
  }
`;
const Diocese = () => {
  const contextProp = useContext(ContextProvider);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;
  const AUTH_TOKEN = sessionStorage.getItem("token");

  const diocesePermissions = permissions?.role_permissions?.dioceses;
  // console.log("diocesePermissions ",diocesePermissions);
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
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    address: yup.string().required("Address is required"),
    place: yup.string().required("Place is required"),
    region_id: yup.object().required("Region is required"),
    country_id: yup.object().required("country is required"),
    state_id: yup.object().required("State is required"),
    district_id: yup.object().required("District is required"),
  });
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
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    reset,
    formState: { errors },
    watch,
    control,
  } = useForm({ resolver: yupResolver(schema) });
  //upload File
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
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [search, setSearch] = useState();
  const [filterProvince, setFilterProvince] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [useroptions, setUserOptions] = useState([]);
  const [Dioceses, setDioceses] = useState([]);
  // console.log("state dioceses", Dioceses);

  const [editIncharge, setEditIncharge] = useState(null);
  const [editFinanceIncharge, setEditFinanceIncharge] = useState(null);
  const [dynamicModules, setDynamicModules] = useState([]);
  const [viewsDynamicModules, setViewsDynamicModules] = useState([]);
  const [portfolioIds, setPortFolioIds] = useState(null);
  const [expandedData, setExpandedData] = useState([]);
  const generateModules = (backendData) => {
    const modules = backendData.map((item) => ({
      id: item.id,
      portfolio_id: item.portfolio_id,
      name: item.name,
      key: `${item.name.toLowerCase()}_no`,
      key1: `${item.name.toLowerCase()}_name`,
      description: `${item.name} Number As per Certification`,
      description1: `${item.name} Name As per Certification`,
    }));
    setDynamicModules(modules);
  };

  const createViewDynamicModules = (backendData) => {
    const modules = backendData.map((item, index) => {
      const name = item.portfolio.name.toLowerCase();
      const number = item.number || "N/A";
      const ddmUsers = item?.cfp_user.find(
        (user) => user?.role_id === RoleIds.DDMRoleId
      );
      const viewers = item?.cfp_user.filter(
        (user) => user?.role_id === RoleIds.ViewerRoleId
      );
      const defaultIncharge = ddmUsers?.user?.name
        ? { name: ddmUsers?.user?.name }
        : "No Incharge Assign";
      const defaultViewers =
        viewers.length > 0
          ? viewers.map((user) => ({ name: user.user.name }))
          : "No Viewer Assign";
      return {
        id: item.id,
        portfolio_id: item.portfolio_id,
        portfolio_name: item.portfolio.name,
        [`no`]: number,
        [`name`]: item.name || "N/A",
        [`incharge`]: defaultIncharge,
        [`viewer`]: defaultViewers,
      };
    });

    setViewsDynamicModules(modules);
  };
  useEffect(() => {
    getPortfolio();
    getUserOptions();
    DiocesesList();
  }, []);
  const getUserOptions = () => {
    getAPI("/access/users-options").then((res) => {
      // console.log("res", res);

      if (res?.data?.status) {
        setUserOptions(res?.data?.data);
      }
    });
  };

  const getPortfolio = () => {
    setLoading(true);
    getAPI(
      "/config/portfolio?skip=0&limit=25&type=Non%20Financial&search=Community"
    )
      .then((res) => {
        if (res?.data?.status) {
          // getComunityPortfolios(res?.data?.data[0]?.id);
          setPortFolioIds(res?.data?.data[0]?.id);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const DiocesesList = useCallback(
    (search) => {
      setLoading(true);
      if (search !== undefined) {
        getAPI(
          `/config/diocese?skip=${pagination?.skip}&limit=${pagination?.limit}&search=` +
            search
        )
          .then((res) => {
            // console.log("diocese res", res);

            if (res?.data?.status) {
              setDioceses(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setDioceses([]);
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
        setLoading(true);
        getAPI(
          `/config/diocese?skip=${pagination?.skip}&limit=${pagination?.limit}`
        )
          .then((res) => {
            if (res?.data?.status) {
              setDioceses(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setDioceses([]);
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

  useEffect(() => {
    DiocesesList();
  }, [DiocesesList]);

  const deleteDiocese = (id) => {
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
        deleteAPI("/config/diocese/" + id).then((res) => {
          if (res?.data.status) {
            // navigate("/dashboard");
            // sessionStorage.setItem('token', res?.data?.access_token);
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

            DiocesesList();
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

  const editClick = (row) => {
    setIsEdit(true);
    getDioceseDetails(row.id, "");
  };

  const handleView = (id) => {
    getDioceseDetails(id, "");
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => pagination?.skip + index + 1,
      width: "50px",
    },
    // {
    //   name: 'Code',
    //   selector: row => row.code,
    // },
    {
      name: "Name",
      cell: (row) => (
        <label className="text-truncate" title={row.name}>
          {row?.name}
        </label>
      ),
      width: "250px",
    },
    {
      name: "Address",
      cell: (row) => (
        <label className="text-truncate" title={row.address}>
          {row?.address}
        </label>
      ),
      width: "250px",
    },
    {
      name: "Place",
      selector: (row) => row.place,
      width: "150px",
    },
    {
      name: "Region",
      selector: (row) => row?.region?.name || "",
      width: "150px",
    },
    {
      name: "District",
      selector: (row) => row?.district?.name,
      width: "150px",
    },

    {
      name: "Action",
      center: true,
      width: "180px",
      cell: (row, index) => {
        // const userRoles = row.community_user
        //     .filter(user => user.user_id === currentUser.id)
        //     .map(user => user.role.name);

        // const hasDDM = userRoles.includes("DDM");
        // const hasViewer = userRoles.includes("Viewer");

        return (
          <>
            <div className="d-flex justify-content-between">
              {currentUser?.role?.name === "Admin" ||
              currentUser?.role?.name === "Super Admin" ? (
                <>
                  {/* <div className="form_col ml-1">
                                            <span className="custum-group-table" >
                                                <button type="button" className="btn  btn-sm text-info" title='Manage files' onClick={() => { sessionStorage.setItem('navState', JSON.stringify({ ...row, module: 'Community', portfolio_id: portfolioIds })); navigate('/nonfinancial/community') }}   >
                                                    <i className="fa-solid fa-arrow-up-right-from-square text-success"></i>
                                                </button>
                                            </span>
                                        </div> */}

                  <div className="form_col ml-1">
                    <span className="custum-group-table">
                      <button
                        type="button"
                        className="btn  btn-sm text-info"
                        title="View"
                        data-bs-toggle="modal"
                        data-bs-target="#viewModel"
                        onClick={() => handleView(row.id)}
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
                        onClick={() => deleteDiocese(row?.id)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {/* ((hasDDM || hasViewer) && diocesePermissions?.view) && ( */}
                  {diocesePermissions?.view && (
                    <>
                      {/* <div className="form_col ml-1">
                                                        <span className="custum-group-table">
                                                            <button type="button" className="btn btn-sm text-info" title='Manage files'
                                                                onClick={() => { contextProp.setNavState({ ...row, module: 'Community' }); navigate('/nonfinancial/community') }}
                                                                
                                                            >
                                                                <i className="fa-solid fa-arrow-up-right-from-square text-success"></i>
                                                            </button>
                                                        </span>
                                                    </div> */}
                      <div className="form_col ml-1">
                        <span className="custum-group-table">
                          <button
                            type="button"
                            className="btn btn-sm text-info"
                            title="View"
                            data-bs-toggle="modal"
                            data-bs-target="#viewModel"
                            onClick={() => handleView(row.id)}
                          >
                            <i className="fas fa-eye" />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {diocesePermissions?.edit && (
                    <>
                      <div className="form_col ml-1">
                        <span className="custum-group-table">
                          <button
                            type="button"
                            className="btn btn-sm text-success"
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

                  {diocesePermissions?.delete && (
                    <>
                      <div className="form_col">
                        <span className="custum-group-table">
                          <button
                            type="button"
                            className="btn text-danger btn-sm"
                            title="Delete"
                            onClick={() => deleteDiocese(row?.id)}
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
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  const getDioceseDetails = (id, type) => {
    getAPI("/config/diocese/" + id)
      .then((res) => {
        // console.log("d-res", res);

        if (res?.data?.status) {
          if (type === "expanded") {
            setExpandedData(res?.data?.data?.cfp);
          } else {
            console.log("res?.data?.data", res?.data?.data);

            setValue("id", res?.data?.data?.id);
            setValue("name", res?.data?.data?.name || "");
            setValue("address", res?.data?.data?.address || "");
            setValue("code", res?.data?.data?.code || "");
            setValue("place", res?.data?.data?.place || "");
            setValue("country_id", {
              value: res?.data?.data?.country?.id,
              label: res?.data?.data?.country?.name,
            });
            setValue("state_id", {
              value: res?.data?.data?.state?.id,
              label: res?.data?.data?.state?.name,
            });
            setValue("region_id", {
              value: res?.data?.data?.region?.id,
              label: res?.data?.data?.region?.name,
            });
            setValue("district_id", {
              value: res?.data?.data?.district?.id,
              label: res?.data?.data?.district?.name,
            });

            const ddmUsers = res?.data?.data?.community_user.filter(
              (user) => user.role_id === RoleIds.DDMRoleId
            );
            const viewerUsers = res?.data?.data?.community_user.filter(
              (user) => user.role_id === RoleIds.ViewerRoleId
            );

            const defaultIncharge =
              ddmUsers.length > 0
                ? {
                    value: ddmUsers[0].user_id,
                    label: ddmUsers[0].user.name,
                    roleId: ddmUsers[0]?.role_id,
                  }
                : null;
            setValue("incharge_user_id", defaultIncharge);
            const defaultViewers = viewerUsers.map((user) => ({
              value: user?.user_id,
              label: user.user.name,
              roleId: user.role_id,
            }));
            setValue("viewr_user_id", defaultViewers);
            createViewDynamicModules(res?.data.data.cfp);
            res?.data?.data?.cfp?.map((item, index) => {
              const ddmUsers = item?.cfp_user.find(
                (user) => user?.role_id === RoleIds.DDMRoleId
              );
              const viewers = item?.cfp_user.filter(
                (user) => user?.role_id === RoleIds.ViewerRoleId
              );
              const defaultIncharge = ddmUsers
                ? {
                    value: ddmUsers?.user_id,
                    label: ddmUsers.user.name,
                    roleId: ddmUsers?.role_id,
                  }
                : null;
              const defaultViewers = viewers.map((user) => ({
                value: user?.user_id,
                label: user.user.name,
                roleId: user.role_id,
              }));
              setValue(
                `portfolio_${item?.portfolio_id}.number`,
                item?.number || ""
              );
              setValue(
                `portfolio_${item?.portfolio_id}.name`,
                item?.name || ""
              );
              setValue(
                `portfolio_${item?.portfolio_id}.incharge_user_id`,
                defaultIncharge
              );
              setValue(
                `portfolio_${item?.portfolio_id}.viewer_user_id`,
                defaultViewers
              );
            });
          }
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const rowExpandView = (row) => {
    return (
      <div className="p-2 ps-3 pt-3 subtable d-flex">
        <table className="table w-50 bg-light rounded overflow-hidden">
          <thead>
            <tr className="table-primary border-bottom border-danger">
              <th scope="col">Portfolio</th>
              <th scope="col">Number</th>
              <th scope="col">Name</th>
              <th scope="col">Incharge</th>
              <th scope="col">Viewer</th>
              <th scope="col" className="text-center">
                Manage Files
              </th>
            </tr>
          </thead>
          <tbody>
            {expandedData?.map((portfolio, index) => {
              const hasAccess = portfolio?.cfp_user?.some(
                (user) =>
                  user?.user_id === currentUser.id &&
                  (user?.role?.name === "DDM" || user?.role?.name === "Viewer")
              );

              return (
                <tr key={portfolio?.portfolio_id}>
                  <td>{portfolio?.portfolio?.name || "-"}</td>
                  <td>{portfolio?.number || "-"}</td>
                  <td>{portfolio?.name || "-"}</td>
                  <td className="p-1">
                    {portfolio?.cfp_user
                      ?.filter((item) => item?.role?.name === "DDM")
                      .map((item, idx) => (
                        <p key={idx}>{item?.user?.name}</p>
                      ))}
                    {!portfolio?.cfp_user?.some(
                      (item) => item?.role?.name === "DDM"
                    ) && (
                      <span className="badge text-bg-secondary">No Incharge</span>
                    )}
                  </td>
                  <td className="p-1">
                    {portfolio?.cfp_user
                      ?.filter((item) => item?.role?.name === "Viewer")
                      .map((item, idx) => (
                        <p key={idx}>{item?.user?.name}</p>
                      ))}
                    {!portfolio?.cfp_user?.some(
                      (item) => item?.role?.name === "Viewer"
                    ) && (
                      <span className="badge text-bg-secondary">No Viewer</span>
                    )}
                  </td>
                  {hasAccess ? (
                    <td className="p-1 text-center">
                      <Link
                        to={`/financial/${portfolio?.name?.toLowerCase()}`}
                        onClick={() =>
                          contextProp.setNavState({
                            ...row.data,
                            module: "Community",
                          })
                        }
                      >
                        <i
                          className="fa-solid fa-arrow-up-right-from-square text-success"
                          title="Manage files"
                        ></i>
                      </Link>
                    </td>
                  ) : (
                    <td className="p-1 text-center"></td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const onSubmit = (data) => {
    const combinedCommityUsers = [
      ...(Array?.isArray(data?.viewr_user_id) ? data?.viewr_user_id : []),
      ...(data?.incharge_user_id ? [data.incharge_user_id] : []),
    ];

    const commuityUsers = combinedCommityUsers?.map((user) => {
      return {
        user_id: user?.value,
        role_id: user?.roleId,
      };
    });

    const transformedData = Object.entries(data)
      .filter(([key]) => key.startsWith("portfolio_"))
      .map(([key, value]) => {
        const portfolioId = parseInt(key.replace("portfolio_", ""), 10);

        if (isNaN(portfolioId)) return null;

        const nameKey =
          Object.keys(value).find((k) => k.endsWith("_name")) || null;
        const numberKey =
          Object.keys(value).find((k) => k.endsWith("_no")) || null;

        return {
          portfolio_id: portfolioId,
          name: nameKey ? value[nameKey] : null,
          number: numberKey ? value[numberKey] : null,
          cfp_user: [
            ...(value.incharge_user_id
              ? [
                  {
                    user_id: value?.incharge_user_id?.value,
                    role_id: value?.incharge_user_id?.roleId,
                  },
                ]
              : []),
            ...(Array?.isArray(value?.viewer_user_id)
              ? value?.viewer_user_id?.map((user) => ({
                  user_id: user.value,
                  role_id: user.roleId,
                }))
              : []),
          ],
        };
      })
      .filter((item) => item !== null);

    const submitdata = {
      code: data?.code,
      name: data?.name,
      place: data?.place,
      address: data?.address,
      country_id: data?.country_id?.value,
      state_id: data?.state_id?.value,
      region_id: data?.region_id?.value,
      district_id: data?.district_id?.value,
      community_user: commuityUsers || [],
      cfp: transformedData || [],
    };

    const mapping = isEdit ? "PUT" : "POST";
    const url = isEdit ? "/config/diocese/" + data.id : "/config/diocese";
    addUpdateAPI(mapping, url, submitdata)
      .then((res) => {
        if (res?.data?.status) {
          setSearch("");

          DiocesesList();
          setLoading(false);
          //success
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: isEdit ? "Updated!" : "Created!",
            text: res?.data?.details || "Success",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: " #28a745",
            color: "  #ffff",
          });
          const modal = document.getElementById("addModel");
          const modalInstance = bootstrap.Modal.getInstance(modal);
          modalInstance.hide();
          reset();
        } else {
          //error
          Swal.fire({
            icon: "warning",
            title: "Something went wrong!",
            text: res?.data?.details || "Something went wrong!",
            confirmButtonText: "OK",
            background: "rgb(255, 255, 255)",
            color: "  #000000",
          });
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleInchargeChange = (selectedOption) => {
    dynamicModules.forEach((item) => {
      setValue(
        `portfolio_${item.portfolio_id}.incharge_user_id`,
        selectedOption
      );
    });
  };

  const handleViewerChange = (selectedOption) => {
    dynamicModules.forEach((item) => {
      setValue(`portfolio_${item.portfolio_id}.viewer_user_id`, selectedOption);
    });
  };

  const getPatternForName = (name) => {
    switch (name.toUpperCase()) {
      case "EPF":
        return /^[A-Z]{2}\/[A-Z]{3}\/\d{7}\/\d{3}\/\d{7}$/; // TN/MAD/1234567/000/0000000
      case "ESI":
        return /^\d{17}$/; // 12345678901234567
      case "GST":
        return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}[Z]{1}[0-9]{1}$/; // 33ABCDE1234F1Z5
      case "TAN":
        return /^[A-Z]{4}[0-9]{5}[A-Z]{1}$/; // ABCD12345A
    }
  };

  const [expandedRowId, setExpandedRowId] = useState(null);

  const handleRowExpand = (expanded, row) => {
    if (expanded) {
      setExpandedRowId(row.id);
      getDioceseDetails(row.id, "expanded");
    } else {
      setExpandedRowId(null);
    }
  };

  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
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
        setValue1("file", file);
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);

    const file = event.dataTransfer.files[0];
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

  // Form Submit Handler
  const onSubmit1 = (data) => {
    const formData = new FormData();
    formData.append("file", data.file);
    const mapping = "POST";
    addUpdateAPI(mapping, "config/diocese/import", formData).then((res) => {
      if (res?.data?.status) {
        DiocesesList();
        setLoading(false);
        //success
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "uploaded!",
          text: res?.data?.details || "Success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: " #28a745",
          color: "  #ffff",
        });
      } else {
        //error
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

    const modal = document.getElementById("fileImportModal");
    const modalInstance = bootstrap.Modal.getInstance(modal);
    modalInstance.hide();
  };

  const downloadExcel = () => {
    fetch(API_BASE_URL + "config/diocese/sample-excel", {
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
        a.download = "Dioceses_Form.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => console.error("Download failed:", error));
  };

  const downloadCommunityExcel = () => {
    fetch(API_BASE_URL + "config/diocese/export", {
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
          a.download = "Diocese_List.xlsx";
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
            <h6 className="fw-bold mb-0">Diocese</h6>
          </div>
          <div className="d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1">
            <div className="me-2 d-flex align-items-center ">
              <button className="btn bnt-sm adminsearch-icon">
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
              <input
                value={search}
                type="text"
                className="form-control adminsearch"
                placeholder="Search by Name, Place, District"
                title="Search"
                onChange={(e) => {
                  DiocesesList(e.target.value), setSearch(e.target.value);
                }}
              />
            </div>

            {currentUser?.role?.name === "Admin" ||
            currentUser?.role?.name === "Super Admin" ? (
              <>
                <button
                  className="btn btn-sm px-4 adminBtn"
                  title="Add"
                  data-bs-toggle="modal"
                  data-bs-target="#addModel"
                  onClick={() => {
                    setIsEdit(false),
                      reset({
                        name: "",
                        place: "",
                        address: "",
                        country_id: "",
                        state_id: "",
                        region_id: "",
                        district_id: "",
                        incharge_user_id: "",

                        acme_code: "",
                      });
                  }}
                >
                  Add{" "}
                </button>
              </>
            ) : (
              <>
                {diocesePermissions?.add && (
                  <button
                    className="btn btn-sm px-4 adminBtn"
                    title="Add"
                    data-bs-toggle="modal"
                    data-bs-target="#addModel"
                    onClick={() => {
                      setIsEdit(false),
                        reset({
                          name: "",
                          place: "",
                          address: "",
                          country_id: "",
                          state_id: "",
                          region_id: "",
                          district_id: "",
                          incharge_user_id: "",

                          acme_code: "",
                        });
                    }}
                  >
                    Add{" "}
                  </button>
                )}
              </>
            )}

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
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          {/* <StickyLastColumn> */}
          <DataTable
            columns={columns}
            data={Dioceses}
            customStyles={tableStyle}
            // expandableRows
            // expandOnRowClicked
            // expandableRowsComponent={rowExpandView}
            onRowExpandToggled={handleRowExpand}
            paginationRowsPerPageOptions={[25, 50, 75, 100]}
            expandableRowExpanded={(row) => row.id === expandedRowId} // Only one row expands
            //pagination
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
          {/* </StickyLastColumn> */}
        </div>
      </div>

      <div
        className="modal fade "
        id="addModel"
        tabIndex="-1"
        aria-labelledby="addModelLabel"
        data-bs-backdrop="static" // Prevents closing on outside click
        data-bs-keyboard="false" // Prevents closing with Esc key
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? "Edit Diocese" : "Add Diocese"}
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
                <div className="row ms-1">
                  {/* <div className="col-md-3 mb-1">
                                        <label className="form-label">Branch office code (acme code)</label>
                                        <input
                                            type="text"
                                            {...register("acme_code")}
                                            className={`form-control`}
                                            placeholder="Enter acme Code"
                                        />
                                        <div className="text-danger">{errors.acme_code?.message}</div>
                                    </div> */}

                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Name (As per certificate){" "}
                      <span className="text-danger"> *</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter name"
                      {...register("name", { required: "Name is required" })}
                    />
                    <p className="text-danger">{errors.name?.message}</p>
                  </div>

                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Place <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter place"
                      {...register("place", { required: "Place is required" })}
                    />
                    <p className="text-danger">{errors.place?.message}</p>
                  </div>

                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Address <span className="text-danger">*</span>
                    </label>
                    <textarea
                      type="text"
                      className="form-control"
                      placeholder="Enter Address"
                      {...register("address")}
                    />
                    <p className="text-danger">{errors.address?.message}</p>
                  </div>

                  <LocationConfig
                    errors={errors}
                    setValue={setValue}
                    watch={watch}
                    control={control}
                  />

                  {/* <div className='col-md-3 mb-1'>
                                        <label className='form-label'>Incharge</label>

                                        <Controller
                                            name="incharge_user_id"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    options={useroptions?.map(data => ({
                                                        value: data.id,
                                                        label: data.name,
                                                        roleId: RoleIds.DDMRoleId
                                                    }))}
                                                    classNamePrefix="custom-react-select"
                                                    placeholder="Select Incharge"
                                                    isClearable
                                                    onChange={(selectedOptions) => {
                                                        field.onChange(selectedOptions);
                                                        handleInchargeChange(selectedOptions); // Call additional function
                                                    }}
                                                />
                                            )}
                                        />
                                        <p className='text-danger'>{errors.user_id?.message}</p>
                                    </div>
                                    <div className='col-md-3 mb-1'>
                                        <label className='form-label'>Viewer</label>
                                        <Controller
                                            name="viewr_user_id"
                                            control={control}
                                            render={({ field }) => (
                                                <Select
                                                    {...field}
                                                    isMulti  // Enables multi-select
                                                    options={useroptions?.map(data => ({
                                                        value: data.id,
                                                        label: data.name,
                                                        roleId: RoleIds.ViewerRoleId
                                                    }))}  // Convert incharge to select options
                                                    classNamePrefix="custom-react-select"
                                                    placeholder="Select Viewer"
                                                    isClearable
                                                    onChange={(selectedOptions) => {
                                                        field.onChange(selectedOptions);  // Update value
                                                        handleViewerChange(selectedOptions);
                                                    }}
                                                />
                                            )}
                                        />
                                        <p className='text-danger'>{errors.viewr_user_id?.message}</p>
                                    </div> */}
                </div>
                {dynamicModules?.map((item, index) => (
                  <div key={index} className="row ms-1">
                    <div className="col-md-3 mb-1">
                      <label className="form-label">
                        {item.name} No{" "}
                        <span className="text-danger  small">
                          {" "}
                          {"(" + item.description + ")"}
                        </span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Enter ${item.name} No`}
                        {...register(
                          `portfolio_${item.portfolio_id}.${item.key}`
                        )}
                      />

                      {errors[`portfolio_${item.portfolio_id}`]?.[item.key] && (
                        <p className="text-danger">
                          {
                            errors[`portfolio_${item.portfolio_id}`][item.key]
                              ?.message
                          }
                        </p>
                      )}
                    </div>
                    <div className="col-md-3 mb-1">
                      <label className="form-label">
                        {item.name} Name{" "}
                        <span className="text-danger  small">
                          {" "}
                          {"(" + item.description1 + ")"}
                        </span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={`Enter ${item.name} Name`}
                        // {...register(`${item.key1}`)}

                        {...register(
                          `portfolio_${item.portfolio_id}.${item.key1}`
                        )}
                      />
                      {errors[`portfolio_${item.portfolio_id}`]?.[
                        item.key1
                      ] && (
                        <p className="text-danger">
                          {
                            errors[`portfolio_${item.portfolio_id}`][item.key1]
                              ?.message
                          }
                        </p>
                      )}
                    </div>

                    {/* <div className="col-md-3 mb-1">
                                                <label className="form-label">{item.name} Incharge</label>

                                                <Controller
                                                    name={`portfolio_${item.portfolio_id}.incharge_user_id`} // Unique field name
                                                    control={control} // Validation
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            options={useroptions?.map(data => ({
                                                                value: data.id,
                                                                label: data.name,
                                                                roleId: RoleIds.DDMRoleId,
                                                            }))}
                                                            classNamePrefix="custom-react-select"
                                                            placeholder="Select Incharge"
                                                            isClearable
                                                        />
                                                    )}
                                                />
                                                {errors[`portfolio_${item.portfolio_id}`]?.incharge_user_id && (
                                                    <p className="text-danger">{errors[`portfolio_${item.portfolio_id}`].incharge_user_id?.message}</p>
                                                )}
                                            </div>
                                            <div className="col-md-3 mb-1">
                                                <label className="form-label">{item.name} Viewer</label>
                                                <Controller
                                                    name={`portfolio_${item.portfolio_id}.viewer_user_id`} // Unique field name
                                                    control={control}
                                                    rules={{ required: "Please select at least one Viewer" }}  // Validation
                                                    render={({ field }) => (
                                                        <Select
                                                            {...field}
                                                            isMulti  // Enables multi-select
                                                            options={useroptions?.map(data => ({
                                                                value: data.id,
                                                                label: data.name,
                                                                roleId: RoleIds.ViewerRoleId
                                                            }))}  // Convert incharge to select options
                                                            classNamePrefix="custom-react-select"
                                                            placeholder="Select Viewer"
                                                            isClearable
                                                            onChange={(selectedOptions) => {
                                                                field.onChange(selectedOptions);  // Update value
                                                            }}
                                                        />
                                                    )}
                                                />

                                                {errors[`portfolio_${item.portfolio_id}`]?.viewer_user_id && (
                                                    <p className="text-danger">{errors[`portfolio_${item.portfolio_id}`].viewer_user_id?.message}</p>
                                                )}
                                            </div> */}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
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

      <div
        className="modal fade "
        id="viewModel"
        tabIndex="-1"
        aria-labelledby="resetModelLabel"
        aria-hidden="true"
        data-bs-backdrop="static" // Prevents closing on outside click
        data-bs-keyboard="false" // Prevents closing with Esc key
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Diocese</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row ms-1 border-bottom border-secondary mb-0">
                <div className="col-md-3">
                  <label className="form-label">Diocese Code</label>
                  <p className="ms-2 fw-bold">{watch("code") || "N/A"}</p>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Name</label>
                  <p className="ms-2 fw-bold">{watch("name") || "N/A"}</p>
                </div>
                {/* </div> */}

                <div className="col-md-3">
                  <label className="form-label">Address</label>
                  <p className="ms-2 fw-bold">{watch("address") || "N/A"}</p>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Place</label>
                  <p className="ms-2 fw-bold">{watch("place") || "N/A"}</p>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Country</label>
                  <p className="ms-2 fw-bold">
                    {watch("country_id")?.label || "N/A"}
                  </p>
                </div>
                <div className="col-md-3">
                  <label className="form-label">State</label>
                  <p className="ms-2 fw-bold">
                    {watch("state_id")?.label || "N/A"}
                  </p>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Region</label>
                  <p className="ms-2 fw-bold">
                    {watch("region_id")?.label || "N/A"}
                  </p>
                </div>

                <div className="col-md-3">
                  <label className="form-label">District</label>
                  <p className="ms-2 fw-bold">
                    {watch("district_id")?.label || "N/A"}
                  </p>
                </div>
              </div>
              {viewsDynamicModules?.map((item, index) => (
                <div className="row ms-1 mt-2" key={index}>
                  <div className="col-md-3">
                    <label className="form-label">
                      {item?.portfolio_name} Number
                    </label>
                    <p className="ms-2 fw-bold">{item?.no || "N/A"}</p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      {item?.portfolio_name} Name
                    </label>
                    <p className="ms-2 fw-bold">{item?.name || "N/A"}</p>
                  </div>

                  <div className="col-md-3">
                    <label className="form-label">
                      {item?.portfolio_name} Incharge
                    </label>
                    <p className="ms-2 fw-bold">
                      {item?.incharge.name || (
                        <span className="badge text-bg-secondary">
                          No Incharge
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">
                      {item?.portfolio_name} Viewer
                    </label>
                    {Array?.isArray(item?.viewer) ? (
                      item.viewer.map((viewer, index) => (
                        <p className="ms-2 fw-bold" key={index}>
                          {viewer.name}
                        </p>
                      ))
                    ) : (
                      <p className="ms-2 fw-bold">
                        <span className="badge text-bg-secondary">No Viewer</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

      <div
        className="modal fade"
        id="fileImportModal"
        tabIndex="-1"
        aria-labelledby="fileImportModalLabel"
        data-bs-backdrop="static" // Prevents closing on outside click
        data-bs-keyboard="false" // Prevents closing with Esc key
      >
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Import Diocese</h5>
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
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="btn btn-sm btn-primary px-4 adminBtn"
                  disabled={!fileName}
                >
                  Upload
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
};

export default Diocese;
