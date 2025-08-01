import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import {
  financialPortfolioConfig,
  getExampleForName,
  getPatternForName,
  mainManageFiles,
  manageFiles,
  RoleIds,
  tableStyle,
} from "../../constant/Util";
import { useNavigate } from "react-router-dom";

import { Controller, set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from "sweetalert2";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";
import Select from "react-select";
import { ContextProvider } from "../../App";
import LocationConfig from "../../constant/LocationConfig";
import { API_BASE_URL } from "../../constant/baseURL";
import Loader from "../../constant/loader";
import AuditTrail from "./AuditTrail";

function Community() {
  const contextProp = useContext(ContextProvider);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });

  const [currentUser, setCurrentUser] = useState(null);
  const [communityPermissions, setCommunityPermissions] = useState(null);
  useEffect(() => {
    if (contextProp?.currUser) {
      setCurrentUser(contextProp.currUser);
    }

    if (contextProp?.permissions) {
      setCommunityPermissions(
        contextProp?.permissions?.role_permissions?.community || {}
      );
    }
  }, [contextProp]);

  const [financialPortfolios, setFinancialPortfolios] = useState([]);

  // const currentUser = contextProp?.currUser;
  // const permissions = contextProp?.permissions;
  const AUTH_TOKEN = sessionStorage.getItem("token");
  const [dynamicModules, setDynamicModules] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  // console.log("permissions", permissions?.role_permissions?.community);

  // const communityPermissions = permissions?.role_permissions?.community;
  // console.log("communityPermissions", communityPermissions);

  // console.log("current user", currentUser);
  // Handle Page Change
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

  // const buildValidationSchema = (modules) => {
  //   const dynamicSchema = modules.reduce((acc, item) => {
  //     const key = `portfolio_${item.portfolio_id}`;
  //     const pattern = getPatternForName(item.name);

  //     acc[key] = yup.object({
  //       [item.key]: yup
  //         .string()
  //         .nullable()
  //         .notRequired()
  //         .test(
  //           'validate-if-filled',
  //           function (value) {
  //             const { path, createError } = this;
  //             if (!value) return true;

  //             const isValid = pattern ? pattern.test(value) : true;
  //             if (!isValid) {
  //               const example = getExampleForName(item.name);
  //               return createError({ path, message: `Invalid ${item.name} number format ${example}` });
  //             }

  //             return true;
  //           }
  //         ),

  //       [item.key1]: yup.string().nullable().notRequired(),
  //       incharge_user_id: yup.object().nullable().notRequired(),
  //       viewer_user_id: yup.array().nullable().notRequired()
  //     });

  //     return acc;
  //   }, {});

  //   return yup.object().shape({
  //     name: yup.string().required("Name is required").matches(/^[a-zA-ZÀ-ÿ0-9 -]+$/, "Name must not contain special characters like . or '"),
  //     address: yup.string().required("Address is required"),
  //     place: yup.string().required("Place is required"),
  //     region_id: yup.object().required("Region is required"),
  //     country_id: yup.object().required("Country is required"),
  //     state_id: yup.object().required("State is required"),
  //     district_id: yup.object().required("District is required"),
  //     ...dynamicSchema
  //   });
  // };

  const buildValidationSchema = (modules) => {
    const dynamicSchema = modules.reduce((acc, item) => {
      const key = `portfolio_${item.portfolio_id}`;
      const pattern = getPatternForName(item.name);

      acc[key] = yup.object({
        [item.key]: yup
          .string()
          .nullable()
          .notRequired()
          .test("validate-if-filled", function (value) {
            const { path, createError } = this;
            if (!value) return true;

            const isValid = pattern ? pattern.test(value) : true;
            if (!isValid) {
              const example = getExampleForName(item.name);
              return createError({
                path,
                message: `Invalid ${item.name} number format ${example}`,
              });
            }

            return true;
          }),

        [item.key1]: yup.string().nullable().notRequired(),
        incharge_user_id: yup.object().nullable().notRequired(),

        // ✅ CHANGED: from array() to object()
        viewer_user_id: yup.object().nullable().notRequired(),
      });

      return acc;
    }, {});

    return yup.object().shape({
      name: yup
        .string()
        .trim()
        .required("Name is required")
        .matches(
          /^[a-zA-ZÀ-ÿ0-9 -]+$/,
          "Name must not contain special characters like . or '"
        ),
      address: yup.string().trim().required("Address is required"),
      place: yup.string().trim().required("Place is required"),
      region_id: yup.object().required("Region is required"),
      country_id: yup.object().required("Country is required"),
      state_id: yup.object().required("State is required"),
      district_id: yup.object().required("District is required"),
      ...dynamicSchema,
    });
  };

  const schema = useMemo(
    () => buildValidationSchema(dynamicModules),
    [dynamicModules]
  );

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
  // const initial = {
  //   code: "",
  //   name: "",
  //   address: "",
  //   diocese_id: null,
  //   type: null,
  //   place: "",
  //   socity_id: null,
  //   community_id: null,
  //   country_id: null,
  //   state_id: null,
  //   region_id: null,
  //   district_id: null,
  //   incharge_user_id: null,
  //   viewr_user_id: null,

  //   // Add dynamic fields
  // ...dynamicModules.reduce((acc, item) => {
  //   acc[`portfolio_${item.portfolio_id}.${item.type}`] = null;
  //   acc[`portfolio_${item.portfolio_id}.${item.key}`] = "";
  //   acc[`portfolio_${item.portfolio_id}.${item.key1}`] = "";
  //   acc[`portfolio_${item.portfolio_id}.incharge_user_id`] = null;
  //   acc[`portfolio_${item.portfolio_id}.viewer_user_id`] = null;
  //   return acc;
  // }, {})

  //   // admin_user_id: null,
  // };

  const initial = {
    code: "",
    name: "",
    address: "",
    place: "",
    country_id: null,
    state_id: null,
    region_id: null,
    district_id: null,
    incharge_user_id: null,
    viewr_user_id: null,
    viewer_admin_user_id: null,
    acme_code: "",

    // Add dynamic fields
    ...dynamicModules.reduce((acc, item) => {
      acc[`portfolio_${item.portfolio_id}`] = {
        [item.type]: { label: "Registered", value: "Registered" },
        [item.key]: "",
        [item.key1]: "",
        incharge_user_id: null,
        viewer_user_id: null,
      };
      return acc;
    }, {}),
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
  } = useForm({ resolver: yupResolver(schema), defaultValues: initial });
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
  const [rowLoading, setRowLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [fpDataLoading, setFpDataLoading] = useState(true);
  const [search, setSearch] = useState();
  const [filterProvince, setFilterProvince] = useState();
  const [isEdit, setIsEdit] = useState(false);
  const [useroptions, setUserOptions] = useState([]);
  const [vieweruseroptions, setViewerUserOptions] = useState([]);
  const [adminuseroptions, setAdminUserOptions] = useState([]);
  const [allViewerUserOptions, setAllViewerUserOptions] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [communityCode, setCommunityCode] = useState();
  const [editIncharge, setEditIncharge] = useState(null);
  const [editFinanceIncharge, setEditFinanceIncharge] = useState(null);
  const [viewsDynamicModules, setViewsDynamicModules] = useState([]);
  const [portfolioIds, setPortFolioIds] = useState(null);
  const [expandedData, setExpandedData] = useState([]);

  const [epfId, setEpfId] = useState(null);
  const [gstId, setGstId] = useState(null);
  const [tdsId, setTdsId] = useState(null);
  const [esiId, setEsiId] = useState(null);

  const [isInchargeModalOpen, setIsInchargeModalOpen] = useState(false);
  const [inchargeModalData, setInchargeModalData] = useState(null);
  const [selectedIncharge, setSelectedIncharge] = useState(null);

  const [editInchargeData, setEditInchargeData] = useState({
    row: {
      id: null,
      name: "",
      place: "",
      address: "",
      country_id: null,
      state_id: null,
      region_id: null,
      district_id: null,
    },
    oldIncharge: null,
    newIncharge: null,
  });

  const [editViewerData, setEditViewerData] = useState({
    row: {
      id: null,
      name: "",
      place: "",
      address: "",
      country_id: null,
      state_id: null,
      region_id: null,
      district_id: null,
    },
    oldViewer: null, // Single viewer object
    newViewer: null, // Single selected viewer

    // oldViewers: [], // Array of current viewers
    // newViewers: [], // Array of selected new viewers
  });

  const handleSaveIncharge = () => {
    if (!editInchargeData.newIncharge) return;

    const dataconstraction = {
      entity_id: editInchargeData?.row?.id,
      financial_entity_id: null,
      role_id: RoleIds?.DDMRoleId,
      users: editInchargeData?.newIncharge?.value
        ? [
            {
              user_id: editInchargeData.newIncharge.value,
              role_id: RoleIds?.DDMRoleId,
            },
          ]
        : editInchargeData?.oldIncharge?.value
        ? [
            {
              user_id: editInchargeData.oldIncharge.value,
              role_id: RoleIds?.DDMRoleId,
            },
          ]
        : [],
    };
    // console.log("dataconstraction", dataconstraction);

    addUpdateAPI(
      "PUT",
      `config/users/portfolio?non_financial_portfolio_id=${portfolioIds}`,
      dataconstraction
    )
      .then((response) => {
        if (response?.data?.status) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Updated!",
            text: response.data.details || "Success",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: " #28a745",
            color: "  #ffff",
          });
          communityList();
          getUserOptions();
          const modal = document.getElementById("editInchargeModal");
          const modalInstance = bootstrap.Modal.getInstance(modal);
          modalInstance.hide();
        } else {
          Swal.fire({
            icon: "warning",
            title: "Something went wrong!",
            text: response?.details || "Something went wrong!",
            confirmButtonText: "OK",
            background: "rgb(255, 255, 255)",
            color: "  #000000",
          });
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        Swal.fire({
          icon: "warning",
          title: "Something went wrong!",
          text: "There was an error while saving viewers.",
          confirmButtonText: "OK",
          background: "rgb(255, 255, 255)",
          color: "  #000000",
        });
      });

    // Prepare the data for API call
    // const submitData = {
    //   id: editInchargeData.row.id,
    //   name: editInchargeData.row.name,
    //   place: editInchargeData.row.place,
    //   address: editInchargeData.row.address,
    //   country_id: editInchargeData.row.country_id,
    //   state_id: editInchargeData.row.state_id,
    //   region_id: editInchargeData.row.region_id,
    //   district_id: editInchargeData.row.district_id,
    //   community_user: [
    //     {
    //       user_id: editInchargeData.newIncharge.value,
    //       role_id: RoleIds.DDMRoleId
    //     }
    //   ]
    // };
    // console.log("submitData for incharge update:", submitData);

    // Call API to update incharge
    // addUpdateAPI("PUT", `/config/community/${editInchargeData.row.id}`, submitData)
    //   .then((res) => {
    //     // console.log("Update Incharge Response:", res);
    //     if (res?.data?.status) {
    //       // Close modal
    //       const modal = document.getElementById("editInchargeModal");
    //       const modalInstance = bootstrap.Modal.getInstance(modal);
    //       modalInstance.hide();

    //       // Show success message
    //       Swal.fire({
    //         toast: true,
    //         position: "top-end",
    //         icon: "success",
    //         title: "Updated!",
    //         text: res?.data?.details || "Success",
    //         showConfirmButton: false,
    //         timer: 3000,
    //         timerProgressBar: true,
    //         background: "#28a745",
    //         color: "#fff",
    //       });

    //       // Refresh the community list
    //       communityList();
    //     } else {
    //       Swal.fire({
    //         icon: "warning",
    //         title: "Something went wrong!",
    //         text: res?.data?.details || "Something went wrong!",
    //         confirmButtonText: "OK",
    //         background: "rgb(255, 255, 255)",
    //         color: "#000000",
    //       });
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //     Swal.fire({
    //       icon: "error",
    //       title: "Error!",
    //       text: "Failed to update incharge",
    //       confirmButtonText: "OK",
    //       background: "rgb(255, 255, 255)",
    //       color: "#000000",
    //     });
    //   });
  };

  const handleSaveViewer = () => {
    if (!editViewerData.newViewer) return;
    const dataconstraction = {
      entity_id: editViewerData?.row?.id,
      financial_entity_id: null,
      role_id: RoleIds?.ViewerRoleId,
      users: editViewerData?.newViewer?.value
        ? [
            {
              user_id: editViewerData.newViewer.value,
              role_id: RoleIds.ViewerRoleId,
            },
          ]
        : editViewerData?.oldViewer?.value
        ? [
            {
              user_id: editViewerData.oldViewer.value,
              role_id: RoleIds.ViewerRoleId,
            },
          ]
        : [],
    };

    addUpdateAPI(
      "PUT",
      `config/users/portfolio?non_financial_portfolio_id=${portfolioIds}`,
      dataconstraction
    )
      .then((response) => {
        if (response?.data?.status) {
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Updated!",
            text: response.data.details || "Success",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: " #28a745",
            color: "  #ffff",
          });
          const modal = document.getElementById("editViewerModal");
          const modalInstance = bootstrap.Modal.getInstance(modal);
          modalInstance.hide();
          communityList();
          getUserOptions();
        } else {
          Swal.fire({
            icon: "warning",
            title: "Something went wrong!",
            text: response?.details || "Something went wrong!",
            confirmButtonText: "OK",
            background: "rgb(255, 255, 255)",
            color: "  #000000",
          });
        }
      })
      .catch((err) => {
        console.error("API Error:", err);
        Swal.fire({
          icon: "warning",
          title: "Something went wrong!",
          text: "There was an error while saving viewers.",
          confirmButtonText: "OK",
          background: "rgb(255, 255, 255)",
          color: "  #000000",
        });
      });

    // const submitData = {
    //   id: editViewerData.row.id,
    //   name: editViewerData.row.name,
    //   place: editViewerData.row.place,
    //   address: editViewerData.row.address,
    //   country_id: editViewerData.row.country_id,
    //   state_id: editViewerData.row.state_id,
    //   region_id: editViewerData.row.region_id,
    //   district_id: editViewerData.row.district_id,
    //   community_user: [
    //     // Keep existing incharge (if any)
    //     ...(editInchargeData.oldIncharge ? [{
    //       user_id: editInchargeData.oldIncharge.value,
    //       role_id: RoleIds.DDMRoleId
    //     }] : []),
    //     // Add new viewer
    //     {
    //       user_id: editViewerData.newViewer.value,
    //       role_id: RoleIds.ViewerRoleId
    //     }
    //   ]
    // };

    // Call API to update viewer
    //   addUpdateAPI("PUT", `/config/community/${editViewerData.row.id}`, submitData)
    //     .then((res) => {
    //       if (res?.data?.status) {
    //         // Close modal
    //         const modal = document.getElementById("editViewerModal");
    //         const modalInstance = bootstrap.Modal.getInstance(modal);
    //         modalInstance.hide();

    //         // Show success message
    //         Swal.fire({
    //           toast: true,
    //           position: "top-end",
    //           icon: "success",
    //           title: "Updated!",
    //           text: res?.data?.details || "Viewer updated successfully",
    //           showConfirmButton: false,
    //           timer: 3000,
    //           timerProgressBar: true,
    //           background: "#28a745",
    //           color: "#fff",
    //         });

    //         // Refresh the community list
    //         communityList();
    //       } else {
    //         Swal.fire({
    //           icon: "warning",
    //           title: "Error!",
    //           text: res?.data?.details || "Failed to update viewer",
    //           confirmButtonText: "OK",
    //           background: "rgb(255, 255, 255)",
    //           color: "#000000",
    //         });
    //       }
    //     })
    //     .catch((err) => {
    //       console.error(err);
    //       Swal.fire({
    //         icon: "error",
    //         title: "Error!",
    //         text: "An error occurred while updating viewer",
    //         confirmButtonText: "OK",
    //         background: "rgb(255, 255, 255)",
    //         color: "#000000",
    //       });
    //     })
  };

  // console.log("editInchargeData", editInchargeData);

  // const generateModules = (backendData) => {
  //   const modules = backendData.map((item) => ({
  //     id: item.id,
  //     portfolio_id: item.portfolio_id,
  //     name: item.name,
  //     key: `${item.name.toLowerCase()}_no`,
  //     key1: `${item.name.toLowerCase()}_name`,
  //     description: `${item.name} Number As per Certification`,
  //     description1: `${item.name} Name As per Certification`,
  //   }));
  //   setDynamicModules(modules);
  // };
  const generateModules = (backendData) => {
    const modules = backendData.map((item) => ({
      id: item.id,
      portfolio_id: item.portfolio_id,
      name: item.name,
      type: `${item.name.toLowerCase()}_type`, // Add type field
      key: `${item.name.toLowerCase()}_no`,
      key1: `${item.name.toLowerCase()}_name`,

      description: `${item.name} Number As per Certification`,
      description1: `${item.name} Name As per Certification`,
    }));
    setDynamicModules(modules);
  };

  const createViewDynamicModules = (backendData) => {
    // console.log("backendData", backendData);

    const modules = backendData.map((item, index) => {
      // console.log("item", item);

      const name = item.portfolio.name.toLowerCase();
      // Extracting values dynamically
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
        [`name`]: item?.name || "N/A",
        [`type`]: item?.type?.value || item?.type || "N/A",
        [`incharge`]: defaultIncharge,
        [`viewer`]: defaultViewers,
      };
    });
    // console.log("modules", modules);

    setViewsDynamicModules(modules);
  };
  useEffect(() => {
    getPortfolio();
    getUserOptions();
    getAllViewerUserOptions();
    getViewerUserOptions();
    getAdminViewerUserOptions();
    communityList();
  }, []);
  const getUserOptions = () => {
    getAPI("/access/users-options?role_id=3&ddm=true").then((res) => {
      if (res?.data?.status) {
        setUserOptions(res?.data?.data);
      }
    });
  };
  const getViewerUserOptions = () => {
    getAPI("/access/users-options?role_id=4&search=RECTOR").then((res) => {
      if (res?.data?.status) {
        setViewerUserOptions(res?.data?.data);
      }
    });
  };
  const getAllViewerUserOptions = () => {
    getAPI("/access/users-options?role_id=4").then((res) => {
      if (res?.data?.status) {
        setAllViewerUserOptions(res?.data?.data);
      }
    });
  };

  const getAdminViewerUserOptions = () => {
    getAPI("/access/users-options?role_id=4&search=ADMIN").then((res) => {
      if (res?.data?.status) {
        setAdminUserOptions(res?.data?.data);
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
          getComunityPortfolios(res?.data?.data[0]?.id);
          setPortFolioIds(res?.data?.data[0]?.id);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getComunityPortfolios = (id) => {
    getAPI("/config/financial_map/" + id)
      .then((res) => {
        if (res?.data?.status) {
          // console.log("res?.data?.data?.financial_name", res?.data?.data?.financial_name);
          setFinancialPortfolios(res?.data?.data?.financial_name);
          res?.data?.data?.financial_name?.forEach((row) => {
            switch (row.name.trim().toUpperCase()) {
              case "EPF":
                setEpfId(row.portfolio_id);
                break;
              case "ESI":
                setEsiId(row.portfolio_id);
                break;
              case "GST":
                setGstId(row.portfolio_id);
                break;
              case "TDS":
                setTdsId(row.portfolio_id);
                break;
              default:
                break;
            }
          });

          generateModules(res?.data?.data?.financial_name);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const communityList = useCallback(
    (search) => {
      setLoading(true);
      if (search !== undefined) {
        getAPI(
          `/config/community?skip=${pagination?.skip}&limit=${pagination?.limit}&search=` +
            search
        )
          .then((res) => {
            if (res?.data?.status) {
              setCommunities(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setCommunities([]);
            }
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setLoading(false); // <-- FIX: Ensure loader is turned off after search
            setDataLoading(false);
          });
      } else {
        getAPI(
          `/config/community?skip=${pagination?.skip}&limit=${pagination?.limit}`
        )
          .then((res) => {
            if (res?.data?.status) {
              setCommunities(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setCommunities([]);
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

  // Call API whenever pagination changes
  useEffect(() => {
    communityList();
  }, [communityList]);

  const deleteCommunity = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: " #3085d6",
      cancelButtonColor: " #d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAPI("/config/community/" + id).then((res) => {
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
              background: " #28a745",
              color: " #fff",
            });
            communityList();
            reset(initial);
            setSearch("");
            setIsEdit(false);
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
    getCommunityDetails(row.id, "");
    setLoading(false);
  };

  //Audit Trail
  const pad = (n) => n.toString().padStart(2, "0");

  const formatISTDate = (isoDate) => {
    const date = new Date(isoDate);
    const istDate = new Date(
      date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
    );
    const day = pad(istDate.getDate());
    const month = pad(istDate.getMonth() + 1);
    const year = istDate.getFullYear();
    let hours = istDate.getHours();
    const minutes = pad(istDate.getMinutes());
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  const ArrowIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      className="bi bi-arrow-right"
      viewBox="0 0 16 16"
    >
      <path
        fillRule="evenodd"
        d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"
      />
    </svg>
  );
  const handleView = (id) => {
    getCommunityDetails(id, "");
    getAPI("audit/community/" + id).then((res) => {
      // console.log("Auit trail", res);
      if (res?.data?.status) {
        setAuditTrail(res?.data?.data);
      } else {
        setAuditTrail([]);
      }
    });
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => pagination.skip + index + 1,
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
      name: "Incharge",
      width: "200px",
      cell: (row, index) => {
        return (
          <div key={row.id} className="d-flex align-items-center gap-2 w-100">
            {/* Existing incharge display */}
            {row?.community_user
              ?.filter((item) => item?.role?.name === "DDM")
              .map((item, idx) => (
                <p key={idx}>{item?.user?.name}</p>
              ))}
            {row?.community_user?.some(
              (item) => item?.role?.name === "DDM"
            ) ? null : (
              <span className="badge badge text-bg-secondary">No Incharge</span>
            )}
            {/* Add edit button */}
            {communityPermissions?.edit && (
              <button
                type="button"
                className="btn btn-sm text-success"
                title="Edit Incharge"
                data-bs-toggle="modal"
                data-bs-target="#editInchargeModal"
                // Inside your columns definition, in the Incharge edit button onClick:
                onClick={() => {
                  const oldIncharge = row?.community_user?.find(
                    (item) => item?.role?.name === "DDM"
                  );
                  setEditInchargeData({
                    row: {
                      id: row.id,
                      name: row.name,
                      place: row.place,
                      address: row.address,
                      country_id: row.country?.id ?? null,
                      state_id: row.state?.id ?? null,
                      region_id: row.region?.id ?? null,
                      district_id: row.district?.id ?? null,
                    },
                    oldIncharge,
                    newIncharge: null,
                  });
                }}
              >
                <i className="fas fa-edit" />
              </button>
            )}
          </div>
        );
      },
    },
    {
      name: "Viewer",
      width: "250px",
      cell: (row, index) => {
        const viewer = row.community_user?.find(
          (item) => item?.role?.name === "Viewer"
        );

        return (
          <div key={row.id} className="d-flex align-items-center gap-2 w-100">
            {viewer ? (
              <span className="viewer-badge">{viewer?.user?.name}</span>
            ) : (
              <span className="badge badge text-bg-secondary">No Viewer</span>
            )}

            {communityPermissions?.edit && (
              <button
                type="button"
                className="btn btn-sm text-success"
                title="Edit Viewer"
                data-bs-toggle="modal"
                data-bs-target="#editViewerModal"
                onClick={() => {
                  const oldViewer = row.community_user?.find(
                    (item) => item?.role?.name === "Viewer"
                  );

                  setEditViewerData({
                    row: {
                      id: row.id,
                      name: row.name,
                      place: row.place,
                      address: row.address,
                      country_id: row.country?.id ?? null,
                      state_id: row.state?.id ?? null,
                      region_id: row.region?.id ?? null,
                      district_id: row.district?.id ?? null,
                    },
                    oldViewer: oldViewer
                      ? {
                          value: oldViewer.user_id,
                          label: oldViewer.user.name,
                          roleId: oldViewer.role_id,
                        }
                      : null,
                    newViewer: null,
                  });
                }}
              >
                <i className="fas fa-edit" />
              </button>
            )}
          </div>
        );
      },
    },

    // {
    //   name: "Admin",
    //   width: "250px",
    //   cell: (row, index) => {
    //     return (
    //       <div key={row.id} className="d-flex align-items-center gap-2 w-100">
    //         {String(index) === editIncharge ? (
    //           <>
    //             <Select
    //               className=""
    //               options={useroptions?.map((incharge) => {
    //                 return { value: incharge.id, label: incharge.name };
    //               })}
    //               isDisabled={String(index) !== editIncharge}
    //             />
    //             <i
    //               className="fa-solid fa-circle-xmark text-danger"
    //               title="Cancel"
    //               onClick={() => {
    //                 setEditIncharge("");
    //               }}
    //             />
    //             <i
    //               className="fa fa-save text-success"
    //               title="Save"
    //               onClick={() => {
    //                 setEditIncharge("");
    //               }}
    //             />
    //           </>
    //         ) : (
    //           <>
    //             {row.community_user?.some(
    //               (item) => item?.role?.name === "Viewer"
    //             ) ? (
    //               <div className="d-flex flex-wrap gap-1">
    //                 {row.community_user
    //                   .filter((item) => item?.role?.name === "Viewer")
    //                   .map((item, idx) => (
    //                     <span key={idx} className=" viewer-badge">
    //                       {item?.user?.name}
    //                     </span>
    //                   ))}
    //               </div>
    //             ) : (
    //               <span className="badge badge text-bg-secondary">No Viewer</span>
    //             )}
    //           </>
    //         )}
    //       </div>
    //     );
    //   },
    // },

    {
      name: "Action",
      width: "250px",
      cell: (row, index) => {
        // Check if the current user is part of the community
        const userRoles = row?.community_user
          ?.filter((user) => user?.user_id === currentUser?.id)
          ?.map((user) => user?.role?.name);

        const hasDDM = userRoles?.includes("DDM");
        const hasViewer = userRoles?.includes("Viewer");

        return (
          <>
            <div className="d-flex justify-content-between">
              {currentUser?.role?.name === "Admin" ||
              currentUser?.role?.name === "Super Admin" ? (
                <>
                  {/* <div className="form_col ml-1">
                      <span className="custum-group-table" >
                        <button type="button" className="btn  btn-sm text-info" title='Manage files' onClick={() => mainManageFiles(row, navigate, portfolioIds, 'community')}   >
                          <i className="fa-solid fa-arrow-up-right-from-square text-success"></i>
                        </button>
                      </span>
                    </div> */}

                  <div className="form_col ml-1">
                    <span className="custum-group-table">
                      <button
                        type="button"
                        className="btn btn-sm  gap-1"
                        title="Add Manage files"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          color: "white",
                          backgroundColor: "#0d6efd",
                          gap: "6px",
                          fontWeight: 500,
                        }}
                        onClick={() =>
                          mainManageFiles(
                            row,
                            navigate,
                            portfolioIds,
                            "community"
                          )
                        }
                      >
                        <i
                          className="fa-solid fa-circle-plus"
                          style={{ color: "white" }}
                        ></i>
                        <span>Add</span>
                      </button>
                    </span>
                  </div>

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
                        onClick={() => deleteCommunity(row?.id)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {(hasDDM || hasViewer) &&
                    (communityPermissions?.[`manage files`] ||
                      communityPermissions?.[`view files`]) && (
                      <>
                        {/* <div className="form_col ml-1">
                            <span className="custum-group-table">
                              <button type="button" className="btn btn-sm text-info" title='Manage files'
                                // onClick={() => { sessionStorage.setItem('navState',JSON.stringify({ ...row, module: 'Community', portfolio_id: portfolioIds ,enitity_id:row?.id})); navigate('/nonfinancial/community') }}
                                onClick={() => mainManageFiles(row, navigate, portfolioIds, 'community')}
                              >
                                <i className="fa-solid fa-arrow-up-right-from-square text-success"></i>
                              </button>
                            </span>
                          </div> */}
                        <div className="form_col ml-1">
                          <span className="custum-group-table">
                            <button
                              type="button"
                              className="btn btn-sm  gap-1"
                              title="Add Manage files"
                              style={{
                                display: "flex",
                                alignItems: "center",
                                color: "white",
                                backgroundColor: "#0d6efd",
                                gap: "6px",
                                fontWeight: 500,
                              }}
                              onClick={() =>
                                mainManageFiles(
                                  row,
                                  navigate,
                                  portfolioIds,
                                  "community"
                                )
                              }
                            >
                              <i
                                className="fa-solid fa-circle-plus"
                                style={{ color: "white" }}
                              ></i>
                              <span>Add</span>
                            </button>
                          </span>
                        </div>
                      </>
                    )}
                  {(hasDDM || hasViewer) && communityPermissions?.view && (
                    <>
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

                  {hasDDM && communityPermissions?.edit && (
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
                            disabled={!hasDDM} // Only DDM can edit
                          >
                            <i className="fas fa-edit" />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {hasDDM && communityPermissions?.delete && (
                    <>
                      <div className="form_col">
                        <span className="custum-group-table">
                          <button
                            type="button"
                            className="btn text-danger btn-sm"
                            title="Delete"
                            onClick={() => deleteCommunity(row?.id)}
                            disabled={!hasDDM} // Only DDM can delete
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

  const getCommunityDetails = (id, type) => {
    if (type === "expanded") {
      setRowLoading(true);
    }
    getAPI("/config/community/" + id)
      .then((res) => {
        if (res?.data?.status) {
          if (type === "expanded") {
            setExpandedData(res?.data?.data?.cfp);
          } else {
            // console.log("res?.data?.data", res?.data?.data);

            setValue("id", res?.data?.data?.id);
            setValue("name", res?.data?.data?.name || "");
            setValue("acme_code", res?.data?.data?.acme_code || "");
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

            // const ddmUsers = res?.data?.data?.community_user.filter(user => user.role_id === RoleIds.DDMRoleId);
            const viewerUsers = res?.data?.data?.community_user.filter(
              (user) => user?.role_id === RoleIds?.ViewerRoleId
            );

            const ddmUsers = res?.data?.data?.community_user.find(
              (user) => user.role_id === RoleIds.DDMRoleId
            );
            // const viewerUsers = res?.data?.data?.community_user.find(
            //   (user) => user.role_id === RoleIds.ViewerRoleId
            // );
            // console.log("community ddmUsers", ddmUsers);
            // console.log("community viewerUsers", viewerUsers);

            // const defaultIncharge = ddmUsers.length > 0 ? { value: ddmUsers[0].user_id, label: ddmUsers[0].user.name, roleId: ddmUsers[0]?.role_id } : null;
            const defaultIncharge = ddmUsers
              ? {
                  value: ddmUsers?.user_id,
                  label: ddmUsers.user.name,
                  roleId: ddmUsers?.role_id,
                }
              : null;
            // console.log("defaultIncharge 706", defaultIncharge);
            setValue("incharge_user_id", defaultIncharge);
            //old code
            const defaultViewers =
              viewerUsers?.length > 0
                ? viewerUsers?.map((user) => ({
                    value: user?.user_id,
                    label: user.user.name,
                    roleId: user.role_id,
                  }))
                : [];
            // const defaultViewers = viewerUsers
            //   ? {
            //     value: viewerUsers?.user_id,
            //     label: viewerUsers.user.name,
            //     roleId: viewerUsers?.role_id,
            //   }
            //   : null;
            // console.log("defaultViewers 710", defaultViewers);

            defaultViewers?.map((item, index) => {
              // console.log("viewer item", item);
              if (item.label?.toUpperCase().endsWith("RECTOR")) {
                setValue("viewr_user_id", item);
              } else if (item.label?.toUpperCase().endsWith("ADMIN")) {
                setValue("viewer_admin_user_id", item);
              }
            });

            createViewDynamicModules(res?.data.data.cfp);
            // set multiple viewer user id   old code

            // res?.data?.data?.cfp?.map((item, index) => {
            //   const ddmUsers = item?.cfp_user.find((user) => user?.role_id === RoleIds.DDMRoleId);
            //   const viewers = item?.cfp_user.filter((user) => user?.role_id === RoleIds.ViewerRoleId);
            //   const defaultIncharge = ddmUsers ? { value: ddmUsers?.user_id, label: ddmUsers.user.name, roleId: ddmUsers?.role_id } : null;
            //   const defaultViewers = viewers.map(user => ({ value: user?.user_id, label: user.user.name, roleId: user.role_id }));
            //   setValue(`portfolio_${item?.portfolio_id}.${item.portfolio?.name?.toLowerCase()}_no`, item?.number || ""); // Default number
            //   setValue(`portfolio_${item?.portfolio_id}.${item.portfolio?.name?.toLowerCase()}_name`, item?.name || ""); // Default name
            //   setValue(`portfolio_${item?.portfolio_id}.incharge_user_id`, defaultIncharge);
            //   setValue(`portfolio_${item?.portfolio_id}.viewer_user_id`, defaultViewers);
            // });

            // new code single viewer user id
            res?.data?.data?.cfp?.map((item, index) => {
              const ddmUsers = item?.cfp_user.find(
                (user) => user?.role_id === RoleIds.DDMRoleId
              );
              const viewers = item?.cfp_user.find(
                (user) => user?.role_id === RoleIds.ViewerRoleId
              );
              const defaultIncharge = ddmUsers
                ? {
                    value: ddmUsers?.user_id,
                    label: ddmUsers.user.name,
                    roleId: ddmUsers?.role_id,
                  }
                : null;
              const defaultViewers = viewers
                ? {
                    value: viewers?.user_id,
                    label: viewers.user.name,
                    roleId: viewers?.role_id,
                  }
                : null;

              setValue(
                `portfolio_${
                  item?.portfolio_id
                }.${item.portfolio?.name?.toLowerCase()}_no`,
                item?.number || ""
              );
              setValue(
                `portfolio_${
                  item?.portfolio_id
                }.${item.portfolio?.name?.toLowerCase()}_name`,
                item?.name || ""
              );
              // Set the type value here
              setValue(
                `portfolio_${
                  item?.portfolio_id
                }.${item.portfolio?.name?.toLowerCase()}_type`,
                item?.type ? { label: item.type, value: item.type } : null
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
      })
      .finally(() => {
        // Only stop loader if it was started for row expand
        if (type === "expanded") {
          setRowLoading(false);
        }
      });
  };

  const rowExpandView = (row) => {
    return (
      <div className="p-2 ps-3 pt-3 subtable d-flex">
        <table className="table w-75 bg-light rounded overflow-hidden">
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
            {rowLoading ? (
              <tr>
                <td colSpan="6" className="text-center">
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "200px" }}
                  >
                    <Loader />
                  </div>
                </td>
              </tr>
            ) : (
              expandedData?.map((portfolio, index) => {
                const hasAccess = portfolio?.cfp_user?.some(
                  (user) =>
                    user?.user_id === currentUser.id &&
                    (user?.role?.name === "DDM" ||
                      user?.role?.name === "Viewer")
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
                        <span className="badge badge text-bg-secondary">
                          No Incharge
                        </span>
                      )}
                    </td>
                    <td className="p-1">
                      {portfolio?.cfp_user?.some(
                        (item) => item?.role?.name === "Viewer"
                      ) ? (
                        <div className="d-flex flex-wrap gap-1">
                          {portfolio.cfp_user
                            .filter((item) => item?.role?.name === "Viewer")
                            .map((item, idx) => (
                              <span key={idx} className=" viewer-badge">
                                {item?.user?.name}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="badge badge text-bg-secondary">No Viewer</span>
                      )}
                    </td>

                    {currentUser?.role?.name === "Admin" ||
                    currentUser?.role?.name === "Super Admin" ? (
                      <td className="p-1 text-center">
                        <button
                          type="button"
                          className="btn btn-sm text-info"
                          title="Manage files"
                          onClick={() =>
                            manageFiles(
                              portfolio,
                              row,
                              portfolioIds,
                              navigate,
                              "Community"
                            )
                          }
                        >
                          <i
                            className="fa-solid fa-arrow-up-right-from-square text-success"
                            title="Manage files"
                          ></i>
                        </button>
                      </td>
                    ) : (
                      <>
                        {(communityPermissions?.[`manage files`] ||
                          communityPermissions?.[`view files`]) &&
                        hasAccess ? (
                          <td className="p-1 text-center">
                            <button
                              type="button"
                              className="btn btn-sm text-info"
                              title="Manage files"
                              onClick={() =>
                                manageFiles(
                                  portfolio,
                                  row,
                                  portfolioIds,
                                  navigate,
                                  "Community"
                                )
                              }
                            >
                              <i
                                className="fa-solid fa-arrow-up-right-from-square text-success"
                                title="Manage files"
                              ></i>
                            </button>
                          </td>
                        ) : (
                          <td className="p-1 text-center"></td>
                        )}
                      </>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const onSubmit = (data) => {
    // console.log("Form Data:", data);

    // Merge both `viewr_user_id` and `incharge_user_id` into `community_user`
    // const combinedCommityUsers = [...data?.viewr_user_id, data?.incharge_user_id];
    setLoading(true);

    // select multiple viewer  old code
    // const combinedCommityUsers = [
    //   ...(Array?.isArray(data?.viewr_user_id) ? data?.viewr_user_id : []),
    //   ...(data?.incharge_user_id ? [data.incharge_user_id] : [])
    // ];

    // select single viewer new code
    const combinedCommityUsers = [
      ...(data?.viewr_user_id
        ? Array.isArray(data.viewr_user_id)
          ? data.viewr_user_id
          : [data.viewr_user_id]
        : []),
      ...(data?.incharge_user_id ? [data.incharge_user_id] : []),
      ...(data?.viewer_admin_user_id ? [data.viewer_admin_user_id] : []),
    ];

    const commuityUsers = combinedCommityUsers?.map((user) => {
      return {
        user_id: user?.value,
        role_id: user?.roleId,
      };
    });

    // console.log("community commuityUsers", commuityUsers);
    console.log("data", data);

    const transformedData = Object.entries(data)
      .filter(
        ([key]) =>
          key.startsWith("portfolio_") &&
          typeof data[key] === "object" &&
          data[key] !== null
      )
      .map(([key, value]) => {
        const portfolioId = parseInt(key.replace("portfolio_", ""), 10);
        if (isNaN(portfolioId)) return null;
        const nameKey =
          Object.keys(value).find((k) => k.endsWith("_name")) || null;
        const numberKey =
          Object.keys(value).find((k) => k.endsWith("_no")) || null;
        const typeKey =
          Object.keys(value).find((k) => k.endsWith("_type")) || null;
        const typeValue = typeKey ? value[typeKey]?.value : null;
        return {
          portfolio_id: portfolioId,
          name: nameKey ? value[nameKey] : null,
          number: numberKey ? value[numberKey] : null,
          type: typeValue ?? null,
          //old code select multiple viewer
          // cfp_user: [
          //   ...(value.incharge_user_id
          //     ? [{ user_id: value?.incharge_user_id?.value, role_id: value?.incharge_user_id?.roleId }]
          //     : []
          //   ),
          //   ...(Array?.isArray(value?.viewer_user_id)
          //     ? value?.viewer_user_id?.map(user => ({
          //       user_id: user.value,
          //       role_id: user.roleId
          //     }))
          //     : []
          //   )
          // ]
          // new code select single viewer
          cfp_user: [
            ...(value.incharge_user_id
              ? [
                  {
                    user_id: value.incharge_user_id.value,
                    role_id: value.incharge_user_id.roleId,
                  },
                ]
              : []),
            ...(value.viewer_user_id
              ? (Array.isArray(value.viewer_user_id)
                  ? value.viewer_user_id
                  : [value.viewer_user_id]
                ).map((user) => ({
                  user_id: user.value,
                  role_id: user.roleId,
                }))
              : []),
          ],
        };
      })
      .filter((item) => item !== null);

    // console.log("transformedData", transformedData);

    const submitdata = {
      acme_code: data.acme_code,
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

    // console.log("submitdata", submitdata);

    const mapping = isEdit ? "PUT" : "POST";
    const url = isEdit ? "/config/community/" + data.id : "/config/community";

    addUpdateAPI(mapping, url, submitdata)
      .then((res) => {
        if (res?.data?.status) {
          setSearch("");
          communityList();
          getUserOptions();
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

          // ✅ Hide the modal after successful submission
          const modal = document.getElementById("addModel");
          const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
          modalInstance.hide();
          reset(initial);
        } else {
          Swal.fire({
            icon: "warning",
            title: "Something Went Wrong !",
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

  const handleInchargeChange = (selectedOption) => {
    dynamicModules.forEach((item) => {
      // console.log("item", item);
      const key = `portfolio_${item.portfolio_id}.incharge_user_id`;
      const existingValue = getValues(key); // Get current value in the form
      const key1 = `portfolio_${item.portfolio_id}.${item.type}`;
      const existingValue1 = getValues(key1); // Get current value in the form
      // console.log("existingValue", existingValue);
      if (existingValue1?.value === "Registered") {
        if (existingValue) {
          return; // Skip if already set
        }
        setValue(
          `portfolio_${item.portfolio_id}.incharge_user_id`,
          selectedOption
        );
      } else {
        setValue(`portfolio_${item.portfolio_id}.incharge_user_id`, null);
      }
    });
  };

  const handleViewerChange = (selectedOption) => {
    dynamicModules.forEach((item) => {
      const key = `portfolio_${item.portfolio_id}.viewer_user_id`;
      const key1 = `portfolio_${item.portfolio_id}.${item.type}`;
      const existingValue1 = getValues(key1);
      const existingValue = getValues(key); // Get current value in the form
      if (existingValue1?.value === "Registered") {
        if (existingValue) {
          return; // Skip if already set
        }
        setValue(
          `portfolio_${item.portfolio_id}.viewer_user_id`,
          selectedOption
        );
      } else {
        setValue(`portfolio_${item.portfolio_id}.viewer_user_id`, null);
      }
      // Get current value in the form
    });
  };

  const [expandedRowId, setExpandedRowId] = useState(null); // Store expanded row ID

  const handleRowExpand = (expanded, row) => {
    if (expanded) {
      setExpandedRowId(row.id); // Expand only this row
      getCommunityDetails(row.id, "expanded");
    } else {
      setExpandedRowId(null); // Collapse row
    }
  };

  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  // Handle file selection
  // Handle file selection
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

  // console.log("errors", errors);

  // Form Submit Handler
  const onSubmit1 = (data) => {
    // console.log("Data:", data);

    const formData = new FormData();
    formData.append("file", data.file);
    // console.log("Uploading file:", data.file);
    const mapping = "POST";
    addUpdateAPI(mapping, "config/community/import", formData).then((res) => {
      if (res?.data?.status) {
        communityList();
        setLoading(false);
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Uploaded!",
          text: res?.data?.details || "Success",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: "#28a745",
          color: "#fff",
        });
      } else {
        Swal.fire({
          icon: "warning",
          title: "Something went wrong!",
          text: res?.data?.details,
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
    fetch(API_BASE_URL + "config/community/sample-excel", {
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
        a.download = "Community_Form.xlsx"; // Change the file name if needed
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => console.error("Download failed:", error));
  };

  const downloadCommunityExcel = () => {
    fetch(API_BASE_URL + "config/community/export", {
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
          a.download = "Community_List.xlsx"; // Change the file name if needed
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
            {/* <h6 className="fw-bold mb-0">Community</h6> */}
            <ul class="nav nav-tabs" id="myTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link active"
                  id="home-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#home"
                  type="button"
                  role="tab"
                  onClick={() => navigate("/community")}
                >
                  Community
                </button>
              </li>

              {financialPortfolios?.map((item) => (
                <li className="nav-item" role="presentation" key={item.id}>
                  <button
                    className="nav-link"
                    id={`${item.name.toLowerCase()}-tab`}
                    data-bs-toggle="tab"
                    data-bs-target={`#${item.name.toLowerCase()}`}
                    type="button"
                    role="tab"
                    onClick={() =>
                      // financialPortfolioConfig("Community", portfolioIds, item?.portfolio_id, item.name, navigate, routeMap[item?.name])

                      financialPortfolioConfig(
                        "community",
                        portfolioIds,
                        item?.portfolio_id,
                        item.name,
                        navigate,
                        "/financial/financialPortfolios"
                      )
                    }
                  >
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className=" d-flex justify-content-end col-lg-7 p-2 col-12 flex-wrap gap-2 align-items-end">
            <div className="d-flex flex-grow-1" style={{ maxWidth: "300px" }}>
              <button className="btn bnt-sm adminsearch-icon">
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
              <input
                type="text"
                className="form-control adminsearch  "
                placeholder="Search by Name, Place, District, Region"
                title="Search"
                value={search}
                onChange={(e) => {
                  communityList(e.target.value);
                  setSearch(e.target.value);
                }}
              />
            </div>

            {currentUser?.role?.name === "Admin" ||
            currentUser?.role?.name === "Super Admin" ? (
              <>
                <button
                  className="btn btn-sm  adminBtn"
                  title="Add"
                  style={{ minWidth: "80px", minHeight: "34px" }}
                  data-bs-toggle="modal"
                  data-bs-target="#addModel"
                  onClick={() => {
                    setIsEdit(false), reset(initial);
                  }}
                >
                  Add{" "}
                </button>
                <button
                  className="btn btn-sm    btn-success"
                  data-bs-toggle="modal"
                  style={{ minWidth: "80px", minHeight: "34px" }}
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
                  className="btn btn-sm   btn-primary"
                  title="Export"
                  style={{ minWidth: "80px", minHeight: "34px" }}
                  onClick={downloadCommunityExcel}
                >
                  Export{" "}
                </button>
              </>
            ) : (
              <>
                {communityPermissions?.add && (
                  <button
                    className="btn btn-sm  adminBtn"
                    title="Add"
                    style={{ minWidth: "80px", minHeight: "34px" }}
                    data-bs-toggle="modal"
                    data-bs-target="#addModel"
                    onClick={() => {
                      setIsEdit(false), reset(initial);
                    }}
                  >
                    Add{" "}
                  </button>
                )}

                {communityPermissions?.add && (
                  <>
                    <button
                      className="btn btn-sm    btn-success"
                      data-bs-toggle="modal"
                      style={{ minWidth: "80px", minHeight: "34px" }}
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

                {communityPermissions?.view && (
                  <>
                    <button
                      className="btn btn-sm   btn-primary"
                      title="Export"
                      style={{ minWidth: "80px", minHeight: "34px" }}
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
          <div className="shadow-table">
            <DataTable
              columns={columns}
              data={communities}
              customStyles={tableStyle}
              expandableRows
              expandOnRowClicked
              expandableRowsComponent={rowExpandView}
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
          </div>
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
                {isEdit ? "Edit Community" : "Add Community"}
              </h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => {
                  reset(initial);
                }}
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row ms-1">
                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Branch office code (acme code)
                    </label>
                    <input
                      type="text"
                      {...register("acme_code")}
                      className={`form-control`}
                      placeholder="Enter acme Code"
                    />
                    <div className="text-danger">
                      {errors.acme_code?.message}
                    </div>
                  </div>

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
                          menuPortalTarget={document.body} // Renders dropdown outside scroll area
                          menuPosition="fixed" // Avoids clipping by modal/container
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({ ...base, minHeight: 38 }),
                            menuList: (base) => ({
                              ...base,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }), // adds scroll only to options
                          }}
                          onChange={(selectedOptions) => {
                            field.onChange(selectedOptions);
                            handleInchargeChange(selectedOptions);
                          }}
                        />
                      )}
                    />
                    <p className="text-danger">{errors.user_id?.message}</p>
                  </div>
                  <div className="col-md-3 mb-1">
                    <label className="form-label">Rector</label>
                    <Controller
                      name="viewr_user_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti={false}
                          options={vieweruseroptions?.map((data) => ({
                            value: data?.id,
                            label: data?.name,
                            roleId: RoleIds?.ViewerRoleId,
                          }))}
                          classNamePrefix="custom-react-select"
                          placeholder="Select Viewer"
                          isClearable
                          menuPortalTarget={document.body} // Render dropdown outside scrollable container
                          menuPosition="fixed" // Prevents clipping inside modal
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure it floats over everything
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({ ...base, minHeight: 38 }),
                            menuList: (base) => ({
                              ...base,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }), // Smooth scroll inside dropdown
                          }}
                          onChange={(selectedOptions) => {
                            field.onChange(selectedOptions);
                            handleViewerChange(selectedOptions);
                          }}
                        />
                      )}
                    />
                    <p className="text-danger">
                      {errors.viewr_user_id?.message}
                    </p>
                  </div>
                  <div className="col-md-3 mb-1">
                    <label className="form-label"> Admin</label>
                    <Controller
                      name="viewer_admin_user_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti={false}
                          options={adminuseroptions?.map((data) => ({
                            value: data?.id,
                            label: data?.name,
                            roleId: RoleIds?.ViewerRoleId,
                          }))}
                          classNamePrefix="custom-react-select"
                          placeholder="Select Viewer"
                          isClearable
                          menuPortalTarget={document.body} // Render dropdown outside scrollable container
                          menuPosition="fixed" // Prevents clipping inside modal
                          styles={{
                            menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensure it floats over everything
                            menu: (base) => ({ ...base, zIndex: 9999 }),
                            control: (base) => ({ ...base, minHeight: 38 }),
                            menuList: (base) => ({
                              ...base,
                              maxHeight: "200px",
                              overflowY: "auto",
                            }), // Smooth scroll inside dropdown
                          }}
                          onChange={(selectedOptions) => {
                            field.onChange(selectedOptions);
                            handleViewerChange(selectedOptions);
                          }}
                        />
                      )}
                    />
                    <p className="text-danger">
                      {errors.viewr_user_id?.message}
                    </p>
                  </div>
                </div>
                {dynamicModules?.map((item, index) => {
                  const typeValue = watch(
                    `portfolio_${item.portfolio_id}.${item.type}`
                  );

                  return (
                    <div key={index} className="row ms-1 mb-5 mt-5">
                      <div className="col-md-4 mb-1">
                        <label className="form-label">
                          {item.name} Type
                          <span className="text-danger small"> </span>
                        </label>
                        <Controller
                          name={`portfolio_${item.portfolio_id}.${item.type}`}
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              value={field?.value}
                              options={[
                                { label: "Registered", value: "Registered" },
                                {
                                  label: "Not Registered",
                                  value: "Not Registered",
                                },
                                {
                                  label: "Not Applicable",
                                  value: "Not Applicable",
                                },
                              ]}
                              classNamePrefix="custom-react-select"
                              placeholder={`Select ${item.name} Type`}
                              isClearable
                              menuPortalTarget={document.body}
                              menuPosition="fixed"
                              styles={{
                                menuPortal: (base) => ({
                                  ...base,
                                  zIndex: 9999,
                                }),
                                menu: (base) => ({ ...base, zIndex: 9999 }),
                                control: (base) => ({ ...base, minHeight: 38 }),
                                menuList: (base) => ({
                                  ...base,
                                  maxHeight: "200px",
                                  overflowY: "auto",
                                }),
                              }}
                              onChange={(selectedOptions) => {
                                field.onChange(selectedOptions); // Update value
                                // financialPortfolioTypeChange(selectedOptions);
                                setValue(
                                  `portfolio_${item.portfolio_id}.${item.key}`,
                                  ""
                                );
                                setValue(
                                  `portfolio_${item.portfolio_id}.${item.key1}`,
                                  ""
                                );
                                setValue(
                                  `portfolio_${item.portfolio_id}.incharge_user_id`,
                                  null
                                );
                                setValue(
                                  `portfolio_${item.portfolio_id}.viewer_user_id`,
                                  null
                                );
                              }}
                            />
                          )}
                        />
                        {errors[`portfolio_${item.portfolio_id}`]?.[
                          item.type
                        ] && (
                          <p className="text-danger">
                            {
                              errors[`portfolio_${item.portfolio_id}`][
                                item.type
                              ]?.message
                            }
                          </p>
                        )}
                      </div>

                      {/* Show these fields only if type is "Register" */}
                      {typeValue?.value === "Registered" && (
                        <>
                          <div className="col-md-4 mb-1">
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
                            {errors[`portfolio_${item.portfolio_id}`]?.[
                              item.key
                            ] && (
                              <p className="text-danger">
                                {
                                  errors[`portfolio_${item.portfolio_id}`][
                                    item.key
                                  ]?.message
                                }
                              </p>
                            )}
                          </div>
                          <div className="col-md-4 mb-1">
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
                              {...register(
                                `portfolio_${item.portfolio_id}.${item.key1}`
                              )}
                            />
                            {errors[`portfolio_${item.portfolio_id}`]?.[
                              item.key1
                            ] && (
                              <p className="text-danger">
                                {
                                  errors[`portfolio_${item.portfolio_id}`][
                                    item.key1
                                  ]?.message
                                }
                              </p>
                            )}
                          </div>
                          <div className="col-md-4 mb-1">
                            <label className="form-label">
                              {item.name} Incharge
                            </label>
                            <Controller
                              name={`portfolio_${item.portfolio_id}.incharge_user_id`}
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
                                />
                              )}
                            />
                            {errors[`portfolio_${item.portfolio_id}`]
                              ?.incharge_user_id && (
                              <p className="text-danger">
                                {
                                  errors[`portfolio_${item.portfolio_id}`]
                                    .incharge_user_id?.message
                                }
                              </p>
                            )}
                          </div>
                          <div className="col-md-4 mb-1">
                            <label className="form-label">
                              {item.name} Viewer
                            </label>
                            <Controller
                              name={`portfolio_${item.portfolio_id}.viewer_user_id`}
                              control={control}
                              rules={{
                                required: "Please select at least one Viewer",
                              }}
                              render={({ field }) => (
                                <Select
                                  {...field}
                                  isMulti={false}
                                  options={allViewerUserOptions?.map(
                                    (data) => ({
                                      value: data.id,
                                      label: data.name,
                                      roleId: RoleIds.ViewerRoleId,
                                    })
                                  )}
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
                            {errors[`portfolio_${item.portfolio_id}`]
                              ?.viewer_user_id && (
                              <p className="text-danger">
                                {
                                  errors[`portfolio_${item.portfolio_id}`]
                                    .viewer_user_id?.message
                                }
                              </p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  data-bs-dismiss="modal"
                  onClick={() => {
                    reset();
                  }}
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
              <h5 className="modal-title">View Community</h5>
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
                  <label className="form-label">Community Code</label>
                  <p className="ms-2 fw-bold">{watch("code") || "N/A"}</p>
                </div>
                <div className="col-md-3">
                  <label className="form-label">Branch office Code</label>
                  <p className="ms-2 fw-bold">{watch("acme_code") || "N/A"}</p>
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

                <div className="col-md-3">
                  <label className="form-label">Incharge</label>
                  <p className="ms-2 fw-bold">
                    {watch("incharge_user_id")?.label || (
                      <span className="badge badge text-bg-secondary">No Incharge</span>
                    )}
                  </p>
                </div>

                <div className="col-md-3">
                  <label className="form-label">Rector</label>

                  {
                    // watch("viewr_user_id")?.length > 0 ? (
                    //   <div className="ms-2 fw-bold mb-0 d-flex flex-wrap gap-1">
                    //     {watch("viewr_user_id").map((user, idx) => (
                    //       <span key={idx} className="badge text-white viewer-badge" >
                    //         {user?.label || "N/A"}
                    //       </span>
                    //     ))}
                    //   </div>
                    // )
                    watch("viewr_user_id") ? (
                      <div className="ms-2 fw-bold mb-0 d-flex flex-wrap ">
                        <p className="ms-2 fw-bold mb-0">
                          {watch("viewr_user_id")?.label || "N/A"}
                        </p>
                      </div>
                    ) : (
                      <p className="ms-2 fw-bold mb-0">
                        <span className="badge badge text-bg-secondary">No Rector</span>
                      </p>
                    )
                  }
                </div>
                <div className="col-md-3">
                  <label className="form-label">Admin</label>

                  {
                    // watch("viewr_user_id")?.length > 0 ? (
                    //   <div className="ms-2 fw-bold mb-0 d-flex flex-wrap gap-1">
                    //     {watch("viewr_user_id").map((user, idx) => (
                    //       <span key={idx} className="badge text-white viewer-badge" >
                    //         {user?.label || "N/A"}
                    //       </span>
                    //     ))}
                    //   </div>
                    // )
                    watch("viewer_admin_user_id") ? (
                      <div className="ms-2 fw-bold mb-0 d-flex flex-wrap ">
                        <p className="ms-2 fw-bold mb-0">
                          {watch("viewer_admin_user_id")?.label || "N/A"}
                        </p>
                      </div>
                    ) : (
                      <p className="ms-2 fw-bold mb-0">
                        <span className="badge badge text-bg-secondary">No Admin</span>
                      </p>
                    )
                  }
                </div>
              </div>
              {viewsDynamicModules?.map((item, index) => (
                <div className="row ms-1 mt-5 mb-5" key={index}>
                  <div className="col-md-4">
                    <label className="form-label">
                      {item?.portfolio_name} Type
                    </label>
                    <p className="ms-2 fw-bold">{item?.type || "N/A"}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">
                      {item?.portfolio_name} Number
                    </label>
                    <p className="ms-2 fw-bold">{item?.no || "N/A"}</p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">
                      {item?.portfolio_name} Name
                    </label>
                    <p className="ms-2 fw-bold">{item?.name || "N/A"}</p>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">
                      {item?.portfolio_name} Incharge
                    </label>
                    <p className="ms-2 fw-bold">
                      {item?.incharge.name || (
                        <span className="badge badge text-bg-secondary">
                          No Incharge
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label">
                      {item?.portfolio_name} Viewer
                    </label>
                    {Array.isArray(item?.viewer) && item.viewer.length > 0 ? (
                      <div className="ms-2 d-flex flex-wrap gap-1">
                        {item.viewer.map((viewer, index) => (
                          <p key={index} className="ms-2 fw-bold mb-0">
                            {viewer.name}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="ms-2 fw-bold mb-0">
                        <span className="badge badge text-bg-secondary">No Viewer</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-2 border-top border-secondary">
                <h5 className="mb-3 text-primary text-center mt-2">
                  Activity History
                </h5>
                <AuditTrail history={auditTrail} />
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
              <h5 className="modal-title">Import Community</h5>
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
      </div>

      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "500px" }}
        >
          <Loader />
        </div>
      )}
      <div
        className="modal fade"
        id="editViewerModal"
        tabIndex="-1"
        aria-labelledby="editViewerModalLabel"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ minWidth: "700px", maxWidth: "900px", minHeight: "400px" }}
        >
          <div
            className="modal-content"
            style={{ height: "350px", width: "1500px" }}
          >
            <div className="modal-header">
              <h5 className="modal-title">Change Viewer</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body d-flex justify-content-between align-items-center gap-2">
              <div className="flex-fill" style={{ paddingLeft: "25px" }}>
                <label className="fw-bold">Current Viewer</label>
                <div className="mt-2">
                  {editViewerData.oldViewer ? (
                    <span className="badge bg-secondary">
                      {editViewerData.oldViewer.label}
                    </span>
                  ) : (
                    <span className="badge bg-danger">No Viewer</span>
                  )}
                </div>
              </div>
              <div className="flex-fill">
                <label className="fw-bold">New Viewer</label>
                <Select
                  value={editViewerData.newViewer}
                  options={vieweruseroptions?.map((data) => ({
                    value: data.id,
                    label: data.name,
                    roleId: RoleIds.ViewerRoleId,
                  }))}
                  onChange={(selected) =>
                    setEditViewerData((prev) => ({
                      ...prev,
                      newViewer: selected,
                    }))
                  }
                  className="custom-react-select"
                  placeholder="Select Viewer"
                  classNamePrefix="react-select"
                  isClearable
                  isSearchable
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
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSaveViewer}
                disabled={!editViewerData.newViewer} // Changed from newViewers to newViewer
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
      <div
        className="modal fade"
        id="editInchargeModal"
        tabIndex="-1"
        aria-labelledby="editInchargeModalLabel"
        data-bs-backdrop="static"
        data-bs-keyboard="false"
      >
        <div
          className="modal-dialog modal-dialog-centered"
          style={{ minWidth: "700px", maxWidth: "900px", minHeight: "400px" }}
        >
          <div
            className="modal-content"
            style={{ height: "350px", width: "1500px" }}
          >
            <div className="modal-header">
              <h5 className="modal-title">Change Incharge</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body d-flex justify-content-between align-items-center gap-2">
              <div className="flex-fill" style={{ paddingLeft: "25px" }}>
                <label className="fw-bold">Old Incharge</label>
                <div className="mt-2">
                  {editInchargeData?.oldIncharge?.user?.name ? (
                    <span className="badge bg-secondary">
                      {editInchargeData.oldIncharge.user.name}
                    </span>
                  ) : (
                    <span className="badge bg-danger">No Incharge</span>
                  )}
                </div>
              </div>
              <div className="flex-fill">
                <label className="fw-bold">New Incharge</label>
                <Select
                  value={editInchargeData?.newIncharge}
                  options={useroptions?.map((data) => ({
                    value: data.id,
                    label: data.name,
                    roleId: RoleIds.DDMRoleId,
                  }))}
                  onChange={(selected) =>
                    setEditInchargeData((prev) => ({
                      ...prev,
                      newIncharge: selected,
                    }))
                  }
                  className="custom-react-select"
                  placeholder="Select Incharge"
                  classNamePrefix="react-select"
                  isClearable
                  isSearchable
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
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-success"
                onClick={handleSaveIncharge}
                disabled={!editInchargeData?.newIncharge}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Community;
