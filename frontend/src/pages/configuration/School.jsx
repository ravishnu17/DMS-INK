import React, {
  use,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Controller, set, useForm } from "react-hook-form";
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
import Swal from "sweetalert2";
import { ContextProvider } from "../../App";
import Select from "react-select";
import LocationConfig from "../../constant/LocationConfig";
import { API_BASE_URL } from "../../constant/baseURL";
import Loader from "../../constant/loader";
import AuditTrail from "./AuditTrail";

function School() {
  const contextProp = useContext(ContextProvider);

  // const currentUser = contextProp?.currUser;
  // const permissions = contextProp?.permissions;
  // const modulepermission = permissions?.role_permissions?.schools;

  const [currentUser, setCurrentUser] = useState(null);
  const [modulepermission, setmodulepermission] = useState(null);
  useEffect(() => {
    if (contextProp?.currUser) {
      setCurrentUser(contextProp.currUser);
    }

    if (contextProp?.permissions) {
      setmodulepermission(
        contextProp?.permissions?.role_permissions?.schools || {}
      );
    }
  }, [contextProp]);

  const [dynamicModules, setDynamicModules] = useState([]);
  const [auditTrail, setAuditTrail] = useState([]);
  const [vieweruseroptions, setViewerUserOptions] = useState([]);
  const [adminuseroptions, setAdminUserOptions] = useState([]);
  const [principaluseroptions, setPrincipalUserOptions] = useState([]);
  const [allViewerUserOptions, setAllViewerUserOptions] = useState([]);
  const [isInchargeModalOpen, setIsInchargeModalOpen] = useState(false);
  const [inchargeModalData, setInchargeModalData] = useState(null);
  const [selectedIncharge, setSelectedIncharge] = useState(null);

  const [editInchargeData, setEditInchargeData] = useState({});

  const [editViewerData, setEditViewerData] = useState({});

  const schoolPortfolioId= useMemo(() => {
    return contextProp?.portfolios?.filter((portfolio) => portfolio?.name?.toLowerCase() === "schools")?.[0]?.id;
  }, [contextProp?.portfolios]);
  
  const handleSaveIncharge = () => {
    if (!editInchargeData.newIncharge) return;

    const dataconstraction = {
      entity_id: editInchargeData?.row?.id, // main data id
      financial_entity_id: null,
      role_id: RoleIds.DDMRoleId, // optional - financial for main data
      users: editInchargeData.newIncharge.value // new incharge user id
        ? [
            {
              user_id: editInchargeData.newIncharge.value,
              role_id: editInchargeData.newIncharge.roleId || RoleIds.DDMRoleId, // default to DDM role if not specified
            },
          ]
        : editInchargeData?.oldIncharge
        ? [
            {
              user_id: editInchargeData?.oldIncharge.user_id,
              role_id:
                editInchargeData?.oldIncharge?.role_id || RoleIds.DDMRoleId, // default to DDM role if not specified
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

          const modal = document.getElementById("editInchargeModal");
          const modalInstance = bootstrap.Modal.getInstance(modal);
          modalInstance.hide();

          getPortFolioList();
          getUserOptions();
          // setExpandedRowId(null);
          setLoading(false);
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
      });
  };

  const handleSaveViewer = () => {
    if (!editViewerData.newViewer) return;

    const dataconstraction = {
      entity_id: editViewerData?.row?.id, // main data id
      financial_entity_id: null,
      role_id: RoleIds.ViewerRoleId, // optional - financial for main data
      users: editViewerData.newViewer.value // new incharge user id
        ? [
            {
              user_id: editViewerData?.newViewer?.value,
              role_id:
                editViewerData?.newViewer?.roleId || RoleIds?.ViewerRoleId, // default to DDM role if not specified
            },
          ]
        : editViewerData?.oldViewer
        ? [
            {
              user_id: editViewerData?.oldViewer.user_id,
              role_id:
                editViewerData?.oldViewer?.role_id || RoleIds?.ViewerRoleId, // default to DDM role if not specified
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

          getPortFolioList();
          getUserOptions();
          // setExpandedRowId(null);
          setLoading(false);
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
      });
  };
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const AUTH_TOKEN = sessionStorage.getItem("token");

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
      name: yup.string().trim().required("Name is required"),
      place: yup.string().trim().required("Place is required"),
      address: yup.string().trim().required("Address is required"),
      region_id: yup.object().required("Region is required"),
      country_id: yup.object().required("country is required"),
      state_id: yup.object().required("State is required"),
      district_id: yup.object().required("District is required"),
      financialAssistance: yup
        .string()
        .trim()
        .required("Financial Assistance is required"),
      schoolBoard: yup.string().trim().required("School Board is required"),
      mediumOfInstitution: yup
        .string()
        .trim()
        .required("Medium Of Institution is required"),
      grade: yup.string().trim().required("Grade is required"),
      community_id: yup.object().required("Community is required"),
      socity_id: yup.object().required("Society is required"),
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
  const initial = {
    community_id: null,
    socity_id: null,
    name: "",
    financialAssistance: "",
    schoolBoard: "",
    mediumOfInstitution: "",
    grade: "",
    place: "",
    address: "",
    country_id: null,
    state_id: null,
    region_id: null,
    district_id: null,
    incharge_user_id: null,
    viewr_user_id: null,
    viewer_admin_user_id: null,
    viewer_principal_user_id: null,
    // Dynamic fields
    // ...dynamicModules.reduce((acc, item) => {
    //   acc[`portfolio_${item.portfolio_id}.${item.type}`] = null;
    //   acc[`portfolio_${item.portfolio_id}.${item.key}`] = "";
    //   acc[`portfolio_${item.portfolio_id}.${item.key1}`] = "";
    //   acc[`portfolio_${item.portfolio_id}.incharge_user_id`] = null;
    //   acc[`portfolio_${item.portfolio_id}.viewer_user_id`] = null;
    //   return acc;
    // }, {})
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
  const [search, setSearch] = useState();
  const [filterProvince, setFilterProvince] = useState();
  const [isEdit, setIsEdit] = useState(false);

  const [editFinanceIncharge, setEditFinanceIncharge] = useState(null);

  const [editIncharge, setEditIncharge] = useState(null);

  const [fileName, setFileName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  //common state
  const [communityList, setCommunityList] = useState([]);
  const [societyList, setSocietyList] = useState([]);
  const [expandedData, setExpandedData] = useState([]);
  const [viewsDynamicModules, setViewsDynamicModules] = useState([]);
  const [portFolioList, setPortFolioList] = useState([]);
  const [useroptions, setUserOptions] = useState([]);
  const [portfolioIds, setPortFolioIds] = useState(null);
  const [portFolioCode, setPortFolioCode] = useState();
  const [expandedRowId, setExpandedRowId] = useState(null); // Store expanded row ID
  const [financialPortfolios, setFinancialPortfolios] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  const communityOptions = communityList.map((comm) => ({
    value: comm.id,
    label: comm.name,
  }));

  const societyOptions = societyList.map((comm) => ({
    value: comm.id,
    label: comm.name,
  }));
  useEffect(() => {
    getCommunityList();
    getSocityList();
    getUserOptions();
    getViewerUserOptions();
    getAdminViewerUserOptions();
    getAllViewerUserOptions();
    getPrincipalUserOptions();
    getPortfolio();
  }, []);

  const getCommunityList = () => {
    getAPI("/config/community?skip=0&limit=0")
      .then((res) => {
        if (res?.data.status) {
          setCommunityList(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const getSocityList = () => {
    getAPI("/config/society?skip=0&limit=0")
      .then((res) => {
        if (res?.data.status) {
          setSocietyList(res?.data?.data);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

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

  const getAdminViewerUserOptions = () => {
    getAPI("/access/users-options?role_id=4&search=ADMIN").then((res) => {
      if (res?.data?.status) {
        setAdminUserOptions(res?.data?.data);
      }
    });
  };

  const getPrincipalUserOptions = () => {
    getAPI("/access/users-options?role_id=4&search=PRINCIPAL").then((res) => {
      if (res?.data?.status) {
        setPrincipalUserOptions(res?.data?.data);
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
  const getPortfolio = () => {
    setLoading(true);
    getAPI(
      "/config/portfolio?skip=0&limit=25&type=Non%20Financial&search=School"
    )
      .then((res) => {
        if (res?.data?.status) {
          getComunityPortfolios(res?.data?.data[0]?.id);
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

  const getComunityPortfolios = (id) => {
    setLoading(true);
    getAPI("/config/financial_map/" + id)
      .then((res) => {
        if (res?.data?.status) {
          setFinancialPortfolios(res?.data?.data?.financial_name);
          generateModules(res?.data?.data?.financial_name);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    getPortFolioList();
  }, [portfolioIds]);

  const getPortFolioList = useCallback(
    (search) => {
      setLoading(true);

      if (portfolioIds != undefined && search != undefined) {
        getAPI(
          `/config/entity?skip=${pagination?.skip}&limit=${pagination?.limit}&portfolio_id=${portfolioIds}&search=` +
            search
        )
          .then((res) => {
            if (res?.data.status) {
              setPortFolioList(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            }
          })
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
            setLoading(false);
            setDataLoading(false);
          });
      } else if (portfolioIds != undefined) {
        getAPI(
          `/config/entity?skip=${pagination?.skip}&limit=${pagination?.limit}&portfolio_id=${portfolioIds}`
        )
          .then((res) => {
            if (res?.data.status) {
              setPortFolioList(res?.data?.data);
              setTotalRows(res?.data?.total_count);
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
    [portfolioIds, pagination]
  );

  useEffect(() => {
    getPortFolioList();
  }, [getPortFolioList]);

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
    const modules = backendData.map((item, index) => {
      const name = item.portfolio.name.toLowerCase();
      // Extracting values dynamically
      const number = item?.number || "N/A";
      const ddmUsers = item?.lefp_user?.find(
        (user) => user?.role_id === RoleIds.DDMRoleId
      );
      const viewers = item?.lefp_user?.filter(
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
        id: item?.id,
        portfolio_id: item?.portfolio_id,
        portfolio_name: item?.portfolio?.name,
        [`no`]: number,
        [`name`]: item?.name || "N/A",
        [`type`]: item?.type || "N/A",
        [`incharge`]: defaultIncharge,
        [`viewer`]: defaultViewers,
      };
    });

    setViewsDynamicModules(modules);
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
      // setValue(
      //   `portfolio_${item.portfolio_id}.incharge_user_id`,
      //   selectedOption
      // );
    });
  };

  const handleViewerChange = (selectedOption) => {
    dynamicModules.forEach((item) => {
      const key = `portfolio_${item.portfolio_id}.viewer_user_id`;
      const existingValue = getValues(key); // Get current value in the form
      const key1 = `portfolio_${item.portfolio_id}.${item.type}`;
      const existingValue1 = getValues(key1);
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
      // if (existingValue) {
      //   return; // Skip if already set
      // }
      // setValue(`portfolio_${item.portfolio_id}.viewer_user_id`, selectedOption);
    });
  };

  const handleRowExpand = (expanded, row) => {
    if (expanded) {
      setExpandedRowId(row.id); // Expand only this row
      getPortfolioDetails(row.id, "expanded");
    } else {
      setExpandedRowId(null); // Collapse row
    }
  };

  const getAuditTrail = (id) => {
    getAPI("audit/legalentity/" + id).then((res) => {
      // console.log("Auit trail", res.data.status);
      if (res?.data?.status) {
        setAuditTrail(res?.data?.data);
      } else {
        setAuditTrail([]);
      }
    });
  };

  const getPortfolioDetails = (id, type) => {
    if (type === "expanded") {
      setRowLoading(true);
    }
    getAPI("/config/entity/" + id)
      .then((res) => {
        if (res?.data?.status) {
          if (type === "expanded") {
            setExpandedData(res?.data?.data?.lefp);
          } else {
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
            setValue("grade", res?.data?.data?.grade || "");
            setValue(
              "mediumOfInstitution",
              res?.data?.data?.medium_of_instruction || ""
            );
            setValue("schoolBoard", res?.data?.data?.school_board || "");
            setValue(
              "financialAssistance",
              res?.data?.data?.financial_assistance
            );
            setValue("community_id", {
              value: res?.data?.data?.community?.id,
              label: res?.data?.data?.community?.name,
            });
            setValue("socity_id", {
              value: res?.data?.data?.society?.id,
              label: res?.data?.data?.society?.name,
            });
            // const ddmUsers = res?.data?.data?.entity_user.filter(user => user.role_id === RoleIds.DDMRoleId);
            const viewerUsers = res?.data?.data?.entity_user.filter(
              (user) => user.role_id === RoleIds.ViewerRoleId
            );
            // const defaultIncharge = ddmUsers.length > 0 ? { value: ddmUsers[0].user_id, label: ddmUsers[0].user.name, roleId: ddmUsers[0]?.role_id } : null;
            // setValue("incharge_user_id", defaultIncharge);
            const defaultViewers =
              viewerUsers?.length > 0
                ? viewerUsers?.map((user) => ({
                    value: user?.user_id,
                    label: user.user.name,
                    roleId: user.role_id,
                  }))
                : [];
            // setValue("viewr_user_id", defaultViewers);
            const ddmUsers = res?.data?.data?.entity_user.find(
              (user) => user.role_id === RoleIds.DDMRoleId
            );
            // const viewerUsers = res?.data?.data?.entity_user.find(user => user.role_id === RoleIds.ViewerRoleId);
            const defaultIncharge = ddmUsers
              ? {
                  value: ddmUsers?.user_id,
                  label: ddmUsers.user.name,
                  roleId: ddmUsers?.role_id,
                }
              : null;
            setValue("incharge_user_id", defaultIncharge);
            // const defaultViewers = viewerUsers ? { value: viewerUsers?.user_id, label: viewerUsers.user.name, roleId: viewerUsers?.role_id } : null;
            // setValue("viewr_user_id", defaultViewers);

            defaultViewers?.map((item, index) => {
              //  console.log("viewer item", item);
              if (item.label?.toUpperCase().endsWith("RECTOR")) {
                setValue("viewr_user_id", item);
              } else if (item.label?.toUpperCase().endsWith("ADMIN")) {
                setValue("viewer_admin_user_id", item);
              } else if (item.label?.toUpperCase().endsWith("PRINCIPAL")) {
                setValue("viewer_principal_user_id", item);
              }
            });

            createViewDynamicModules(res?.data?.data?.lefp);
            // res?.data?.data?.lefp?.map((item, index) => {
            //   const ddmUsers = item?.lefp_user.find((user) => user?.role_id === RoleIds.DDMRoleId);
            //   const viewers = item?.lefp_user.filter((user) => user?.role_id === RoleIds.ViewerRoleId);
            //   const defaultIncharge = ddmUsers ? { value: ddmUsers?.user_id, label: ddmUsers.user.name, roleId: ddmUsers?.role_id } : null;
            //   const defaultViewers = viewers.map(user => ({ value: user?.user_id, label: user.user.name, roleId: user.role_id }));
            //   setValue(`portfolio_${item?.portfolio_id}.${item.portfolio?.name?.toLowerCase()}_no`, item?.number || ""); // Default number
            //   setValue(`portfolio_${item?.portfolio_id}.${item.portfolio?.name?.toLowerCase()}_name`, item?.name || ""); // Default name
            //   setValue(`portfolio_${item?.portfolio_id}.incharge_user_id`, defaultIncharge);
            //   setValue(`portfolio_${item?.portfolio_id}.viewer_user_id`, defaultViewers)
            res?.data?.data?.lefp?.map((item, index) => {
              const portfolioName = item.portfolio?.name?.toLowerCase() || "";
              const portfolioId = item.portfolio_id;

              // Set basic fields
              setValue(
                `portfolio_${portfolioId}.${portfolioName}_no`,
                item?.number || ""
              );
              setValue(
                `portfolio_${portfolioId}.${portfolioName}_name`,
                item?.name || ""
              );

              // Set type field properly
              setValue(
                `portfolio_${portfolioId}.${portfolioName}_type`,
                item?.type ? { label: item.type, value: item.type } : null
              );

              // Set incharge and viewer
              const ddmUsers = item?.lefp_user?.find(
                (user) => user?.role_id === RoleIds.DDMRoleId
              );
              const viewers = item?.lefp_user?.find(
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
                `portfolio_${portfolioId}.incharge_user_id`,
                defaultIncharge
              );
              setValue(
                `portfolio_${portfolioId}.viewer_user_id`,
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

  const deleteIncharge = (row) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to remove incharge of " + String(row.code),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
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
      }
    });
  };

  const deletePortfolio = (id) => {
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
        deleteAPI("/config/entity/" + id).then((res) => {
          if (res?.data.status) {
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
            setSearch("");
            reset(initial);
            getPortFolioList(search, portfolioIds);
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
  };

  const columns = [
    {
      name: "#",
      selector: (row, index) => pagination?.skip + index + 1,
      width: "50px",
    },
    {
      name: "Name",
      cell: (row) => (
        <label className="text-truncate" title={row.name}>
          {row.name}
        </label>
      ),
      width: "200px",
    },
    {
      name: "Place",
      selector: (row) => row.place,
      width: "150px",
    },
    {
      name: <div>Financial Assistance</div>,
      selector: (row) => row?.financial_assistance,
      width: "130px",
    },
    {
      name: <div>School Board</div>,
      selector: (row) => row?.school_board,
      width: "130px",
    },
    {
      name: <div>Medium of Institution</div>,
      selector: (row) => row?.medium_of_instruction,
      width: "130px",
    },
    {
      name: "Grade",
      selector: (row) => row?.grade,
    },
    {
      name: "Incharge",
      width: "200px",
      cell: (row, index) => {
        return (
          <div key={row.id} className="d-flex align-items-center gap-2 w-100">
            {/* Existing incharge display */}
            {row?.entity_user
              ?.filter((item) => item?.role?.name === "DDM")
              .map((item, idx) => (
                <p key={idx}>{item?.user?.name}</p>
              ))}
            {row?.entity_user?.some(
              (item) => item?.role?.name === "DDM"
            ) ? null : (
              <span className="badge text-bg-secondary">No Incharge</span>
            )}
            {/* Add edit button */}
            {modulepermission?.edit && (
              <button
                type="button"
                className="btn btn-sm text-success"
                title="Edit Incharge"
                data-bs-toggle="modal"
                data-bs-target="#editInchargeModal"
                // Inside your columns definition, in the Incharge edit button onClick:
                onClick={() => {
                  const oldIncharge = row?.entity_user?.find(
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
        const viewer = row.entity_user?.find(
          (item) => item?.role?.name === "Viewer"
        );

        return (
          <div key={row.id} className="d-flex align-items-center gap-2 w-100">
            {viewer ? (
              <span className="viewer-badge">{viewer?.user?.name}</span>
            ) : (
              <span className="badge text-bg-secondary">No Viewer</span>
            )}

            {modulepermission?.edit && (
              <button
                type="button"
                className="btn btn-sm text-success"
                title="Edit Viewer"
                data-bs-toggle="modal"
                data-bs-target="#editViewerModal"
                onClick={() => {
                  const oldViewer = row.entity_user?.find(
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
    {
      name: "Action",
      width: "250px",
      center: true,
      cell: (row) => {
        const userRoles = row?.entity_user
          .filter((user) => user?.user_id === currentUser?.id)
          .map((user) => user?.role?.name);

        const hasDDM = userRoles.includes("DDM");
        const hasViewer = userRoles.includes("Viewer");

        return (
          <>
            <div className="d-flex justify-content-between">
              {currentUser?.role?.name === "Admin" ||
              currentUser?.role?.name === "Super Admin" ? (
                <>
                  {/* <div className="form_col ml-1">
                      <span className="custum-group-table" >
                        <button type="button" className="btn  btn-sm text-info" title='Manage files'
                          // onClick={() => { contextProp.setNavState({ ...row, module: 'School' }); navigate('/nonfinancial/school') }} 
                          onClick={() => mainManageFiles(row, navigate, portfolioIds, 'school')}
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
                          mainManageFiles(row, navigate, portfolioIds, "school")
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
                        onClick={() => {
                          getAuditTrail(row.id),
                            getPortfolioDetails(row.id, "");
                        }}
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
                        onClick={() => {
                          setIsEdit(true), getPortfolioDetails(row.id, "");
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
                        onClick={() => deletePortfolio(row.id)}
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </span>
                  </div>
                </>
              ) : (
                <>
                  {(hasDDM || hasViewer) &&
                    (modulepermission?.[`manage files`] ||
                      modulepermission?.[`view files`]) && (
                      <>
                        {/* <div className="form_col ml-1">
                            <span className="custum-group-table" >
                              <button type="button" className="btn  btn-sm text-info" title='Manage files'
                                // onClick={() => { contextProp.setNavState({ ...row, module: 'School' }); navigate('/nonfinancial/school') }}  
                                onClick={() => mainManageFiles(row, navigate, portfolioIds, 'school')}
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
                                  "school"
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
                  {(hasDDM || hasViewer) && modulepermission?.view && (
                    <>
                      <div className="form_col ml-1">
                        <span className="custum-group-table">
                          <button
                            type="button"
                            className="btn  btn-sm text-info"
                            title="View"
                            data-bs-toggle="modal"
                            data-bs-target="#viewModel"
                            onClick={() => {
                              getAuditTrail(row.id),
                                getPortfolioDetails(row.id, "");
                            }}
                          >
                            <i className="fas fa-eye " />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {hasDDM && modulepermission?.edit && (
                    <>
                      <div className="form_col ml-1">
                        <span className="custum-group-table">
                          <button
                            type="button"
                            className="btn  btn-sm text-success"
                            title="Update"
                            data-bs-toggle="modal"
                            data-bs-target="#addModel"
                            onClick={() => {
                              setIsEdit(true), getPortfolioDetails(row.id, "");
                            }}
                          >
                            <i className="fas fa-edit" />
                          </button>
                        </span>
                      </div>
                    </>
                  )}

                  {hasDDM && modulepermission?.delete && (
                    <>
                      <div className="form_col">
                        <span className="custum-group-table  ">
                          <button
                            type="button"
                            className="btn text-danger btn-sm"
                            title="Delete"
                            onClick={() => deletePortfolio(row.id)}
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

  const rowExpandView = (row) => {
    return (
      <div className="p-2 ps-3 pt-3 subtable d-flex ">
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
                const hasAccess = portfolio?.lefp_user?.some(
                  (user) =>
                    user?.user_id === currentUser?.id &&
                    (user?.role?.name === "DDM" ||
                      user?.role?.name === "Viewer")
                );

                return (
                  <tr key={portfolio?.id}>
                    <td>{portfolio?.portfolio?.name || "-"}</td>
                    <td>{portfolio?.number || "-"}</td>
                    <td>{portfolio?.name || "-"}</td>
                    <td className="p-1">
                      {portfolio?.lefp_user
                        ?.filter((item) => item?.role?.name === "DDM") // Filter only "DDM" users
                        .map((item, index) => (
                          <p key={index}>{item?.user?.name}</p> // Proper JSX return inside map
                        ))}
                      {portfolio?.lefp_user?.some(
                        (item) => item?.role.name === "DDM"
                      ) ? null : (
                        <span className="badge text-bg-secondary">
                          No Incharge
                        </span>
                      )}
                    </td>
                    <td className="p-1">
                      {portfolio?.lefp_user?.some(
                        (item) => item?.role?.name === "Viewer"
                      ) ? (
                        <div className="d-flex flex-wrap gap-1 mb-0">
                          {portfolio.lefp_user
                            .filter((item) => item?.role?.name === "Viewer")
                            .map((item, idx) => (
                              <span key={idx} className=" viewer-badge">
                                {item?.user?.name || "N/A"}
                              </span>
                            ))}
                        </div>
                      ) : (
                        <span className="badge text-bg-secondary">No Viewer</span>
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
                              "school"
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
                        {hasAccess &&
                        (modulepermission?.[`manage files`] ||
                          modulepermission?.[`view files`]) ? (
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
                                  "school"
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
    // console.log("data", data);

    // const combinedUsers = [
    //   ...(Array?.isArray(data?.viewr_user_id) ? data?.viewr_user_id : []),
    //   ...(data?.incharge_user_id ? [data?.incharge_user_id] : [])
    // ];
    const combinedUsers = [
      ...(data?.viewr_user_id
        ? Array.isArray(data.viewr_user_id)
          ? data.viewr_user_id
          : [data.viewr_user_id]
        : []),
      ...(data?.incharge_user_id ? [data.incharge_user_id] : []),
      ...(data?.viewer_admin_user_id ? [data.viewer_admin_user_id] : []),
      ...(data?.viewer_principal_user_id
        ? [data.viewer_principal_user_id]
        : []),
    ];

    const entityUsers = combinedUsers?.map((user) => {
      return {
        user_id: user?.value,
        role_id: user?.roleId,
      };
    });

    // const transformedData = Object.entries(data)
    //   .filter(([key]) => key.startsWith("portfolio_")) // Ensure only portfolio keys
    //   .map(([key, value]) => {
    //     const portfolioId = parseInt(key.replace("portfolio_", ""), 10);

    //     // Validate that the parsed portfolioId is a number
    //     if (isNaN(portfolioId)) return null;

    //     // Extract name and number fields dynamically
    //     const nameKey =
    //       Object.keys(value).find((k) => k.endsWith("_name")) || null;
    //     const numberKey =
    //       Object.keys(value).find((k) => k.endsWith("_no")) || null;
    //     const typeKey = Object.keys(value).find(k => k.endsWith('_type'));
    //     const typeValue = typeKey ? value[typeKey]?.value : null;
    //     return {
    //       portfolio_id: portfolioId,
    //       name: nameKey ? value[nameKey] : null,
    //       number: numberKey ? value[numberKey] : null,
    //       type: typeValue ?? null,
    //       // lefp_user: [
    //       //   ...(value?.incharge_user_id
    //       //     ? [{ user_id: value?.incharge_user_id?.value, role_id: value?.incharge_user_id?.roleId }]
    //       //     : []
    //       //   ),
    //       //   ...(Array?.isArray(value?.viewer_user_id)
    //       //     ? value?.viewer_user_id?.map(user => ({
    //       //       user_id: user?.value,
    //       //       role_id: user?.roleId
    //       //     }))
    //       //     : []
    //       //   )

    //       // new code select single viewer

    //       lefp_user: [
    //         ...(value.incharge_user_id
    //           ? [
    //             {
    //               user_id: value.incharge_user_id.value,
    //               role_id: value.incharge_user_id.roleId,
    //             },
    //           ]
    //           : []),
    //         ...(value.viewer_user_id
    //           ? (Array.isArray(value.viewer_user_id)
    //             ? value.viewer_user_id
    //             : [value.viewer_user_id]
    //           ).map((user) => ({
    //             user_id: user.value,
    //             role_id: user.roleId,
    //           }))
    //           : []),
    //       ],
    //     };
    //   })
    //   .filter((item) => item !== null);

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
          lefp_user: [
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

    const mapping = isEdit ? "PUT" : "POST";
    const url = isEdit ? "/config/entity/" + data.id : "/config/entity";

    const submitdata = {
      community_id: data?.community_id?.value || null,
      society_id: data?.socity_id?.value || null,
      portfolio_id: portfolioIds,
      code: data?.code || null,
      name: data.name || null,
      type: data?.type || null,
      financial_assistance: data.financialAssistance || null,
      board: data?.board || null,
      affiliation: data?.affiliation || null,
      Faculty: data?.Faculty || null,
      ug_pg: data?.ug_pg || null,
      school_board: data?.schoolBoard || null,
      medium_of_instruction: data?.mediumOfInstitution || null,
      grade: data?.grade || null,
      place: data?.place || null,
      address: data?.address || null,
      country_id: data?.country_id?.value || null,
      state_id: data?.state_id?.value || null,
      region_id: data?.region_id?.value || null,
      district_id: data?.district_id?.value || null,
      entity_user: entityUsers,
      lefp: transformedData,
    };

    addUpdateAPI(mapping, url, submitdata).then((res) => {
      if (res?.data?.status) {
        setSearch("");
        getPortFolioList();
        getUserOptions();
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
        // ✅ Hide the modal after successful submission
        const modal = document.getElementById("addModel");
        const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
        modalInstance.hide();
        reset(initial);
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
      setLoading(false);
    });
  };

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

  // Form Submit Handler
  const onSubmit1 = (data) => {
    const formData = new FormData();
    formData.append("file", data.file);
    // console.log("Uploading file:", data.file);
    const mapping = "POST";
    addUpdateAPI(mapping, "config/school/import", formData).then((res) => {
      if (res?.data?.status) {
        getPortFolioList();
        getUserOptions();
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

    // ✅ Hide the modal after successful submission
    const modal = document.getElementById("fileImportModal");
    const modalInstance = bootstrap.Modal.getInstance(modal); // Get the Bootstrap modal instance
    modalInstance.hide();
  };

  const downloadExcel = () => {
    fetch(`${API_BASE_URL}config/entities/sample-export?portfolio_id=${schoolPortfolioId}`, {
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
        a.download = "School_Form.xlsx"; // Change the file name if needed
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((error) => console.error("Download failed:", error));
  };

  const downloadCommunityExcel = () => {
    fetch(API_BASE_URL + "config/entity-portfolio/export?portfolio_id="+ String(schoolPortfolioId), {
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
          a.download = "School_List.xlsx"; // Change the file name if needed
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
            {/* <h6 className="fw-bold mb-0">School</h6> */}
            <ul class="nav nav-tabs" id="myTab" role="tablist">
              <li class="nav-item" role="presentation">
                <button
                  class="nav-link active"
                  id="home-tab"
                  data-bs-toggle="tab"
                  data-bs-target="#home"
                  type="button"
                  role="tab"
                  onClick={() => navigate("/school")}
                >
                  School
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
                      financialPortfolioConfig(
                        "school",
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
          <div className="d-flex justify-content-end col-lg-7 col-12 p-2 flex-wrap gap-2 align-items-end">
            <div className="d-flex flex-grow-1" style={{ maxWidth: "300px" }}>
              <button className="btn bnt-sm adminsearch-icon">
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
              <input
                type="text"
                className="form-control adminsearch"
                placeholder="Search by Name, Place, District, Region"
                title="Search"
                value={search}
                onChange={(e) => {
                  getPortFolioList(e.target.value), setSearch(e.target.value);
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
                {modulepermission?.add && (
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

                {modulepermission?.add && (
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

                {modulepermission?.view && (
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
          {/* <StickyLastColumn> */}
          <div className="shadow-table">
            <DataTable
              columns={columns}
              data={portFolioList}
              customStyles={tableStyle}
              pagination
              expandableRows
              expandOnRowClicked
              expandableRowsComponent={rowExpandView}
              onRowExpandToggled={handleRowExpand}
              paginationRowsPerPageOptions={[25, 50, 75, 100]}
              expandableRowExpanded={(row) => row.id === expandedRowId}
              //pagination
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
      </div>

      <div
        className="modal fade "
        id="addModel"
        tabindex="-1"
        aria-labelledby="addModelLabel"
        aria-hidden="true"
        data-bs-backdrop="static" // Prevents closing on outside click
        data-bs-keyboard="false" // Prevents closing with Esc key
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEdit ? "Edit School" : "Add School"}
              </h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => reset(initial)}
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row ms-1">
                  <div className="mb-1 col-md-3">
                    <label className="form-label">
                      Community <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="community_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={communityOptions}
                          className="custom-react-select"
                          placeholder="Select Community"
                          isClearable
                        />
                      )}
                    />
                    <p className="text-danger">
                      {errors.community_id?.message}
                    </p>
                  </div>
                  <div className="mb-1 col-md-3">
                    <label className="form-label">
                      Society <span className="text-danger">*</span>
                    </label>
                    <Controller
                      name="socity_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={societyOptions}
                          className="custom-react-select"
                          placeholder="Select Society"
                          isClearable
                        />
                      )}
                    />
                    <p className="text-danger">{errors.socity_id?.message}</p>
                  </div>
                  {/* {
                    isEdit &&
                    <div className="col-md-3 mb-1">
                      <label className="form-label">
                        Code <span className="text-danger">*</span>{" "}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        disabled
                        placeholder="Enter School"
                        {...register("code", {
                          required: "Community code is required",
                        })}
                      />
                      <p className="text-danger">{errors.code?.message}</p>
                    </div>
                  } */}

                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Name <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control  ${
                        errors.name ? "is-invalid" : ""
                      }`}
                      placeholder="Enter name"
                      {...register("name", { required: "Name is required" })}
                    />
                    <p className="text-danger">{errors.name?.message}</p>
                  </div>

                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Financial Assistance{" "}
                      <span className="text-danger">*</span>
                    </label>

                    <select
                      {...register("financialAssistance")}
                      className={`form-control form-select ${
                        errors.financialAssistance ? "is-invalid" : ""
                      }`}
                    >
                      <option value="" disabled>
                        Select Financial Assistance
                      </option>
                      <option value="Self Financing">Self Financing</option>
                      <option value="Aided">Aided</option>
                      <option value="Partially Aided">Partially Aided</option>
                    </select>
                    <p className="text-danger">
                      {errors.financialAssistance?.message}
                    </p>
                  </div>

                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      {" "}
                      Board <span className="text-danger">*</span>
                    </label>
                    <select
                      {...register("schoolBoard")}
                      className={`form-control form-select ${
                        errors.schoolBoard ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Select Board</option>
                      <option value="IB">IB</option>
                      <option value="CBSE">CBSE</option>
                      <option value="State">State</option>
                      <option value="ICSE">ICSE</option>
                    </select>
                    <p className="text-danger">{errors.schoolBoard?.message}</p>
                  </div>
                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Medium Of Institution
                      <span className="text-danger">*</span>
                    </label>
                    <select
                      {...register("mediumOfInstitution")}
                      className={`form-control form-select ${
                        errors.mediumOfInstitution ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Select medium Of Institution</option>
                      <option value="Tamil">Tamil</option>
                      <option value="English">English</option>
                    </select>
                    <p className="text-danger">
                      {errors.mediumOfInstitution?.message}
                    </p>
                  </div>
                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Grade<span className="text-danger">*</span>
                    </label>
                    <select
                      {...register("grade")}
                      className={`form-control form-select ${
                        errors.grade ? "is-invalid" : ""
                      }`}
                    >
                      <option value="">Select grade</option>
                      <option value="Primary">Primary</option>
                      <option value="Higher Secondary">Higher Secondary</option>
                      <option value="High School">High School</option>
                    </select>
                    <p className="text-danger">{errors.grade?.message}</p>
                  </div>

                  <div className="col-md-3 mb-1">
                    <label className="form-label">
                      Place <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className={`form-control  ${
                        errors.place ? "is-invalid" : ""
                      }`}
                      placeholder="Enter place"
                      {...register("place", {
                        required: "Place is required",
                      })}
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
                            handleInchargeChange(selectedOptions); // Call additional function
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
                          //isMulti
                          isMulti={false}
                          options={vieweruseroptions?.map((data) => ({
                            value: data.id,
                            label: data.name,
                            roleId: RoleIds.ViewerRoleId,
                          }))} // Convert incharge to select options
                          classNamePrefix="custom-react-select"
                          placeholder="Select Viewer"
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
                            field.onChange(selectedOptions); // Update value
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
                            value: data.id,
                            label: data.name,
                            roleId: RoleIds.ViewerRoleId,
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
                    <label className="form-label">Principal</label>
                    <Controller
                      name="viewer_principal_user_id"
                      control={control}
                      render={({ field }) => (
                        <Select
                          {...field}
                          isMulti={false}
                          options={principaluseroptions?.map((data) => ({
                            value: data.id,
                            label: data.name,
                            roleId: RoleIds.ViewerRoleId,
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
                  onClick={() => reset(initial)}
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
        tabindex="-1"
        aria-labelledby="resetModelLabel"
        aria-hidden="true"
        data-bs-backdrop="static" // Prevents closing on outside click
        data-bs-keyboard="false" // Prevents closing with Esc key
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Schools</h5>
              <button
                type="button"
                className="btn-sm btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="row ms-1 border-bottom border-secondary mb-0">
                <div className="col-md-3 mb-1">
                  <label className="form-label">Comunity</label>
                  <p className="ms-2 fw-bold">
                    {watch("community_id")?.label || "N/A"}
                  </p>
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label">Socity</label>
                  <p className="ms-2 fw-bold">
                    {watch("socity_id")?.label || "N/A"}
                  </p>
                </div>
                <div className="col-md-3 mb-1">
                  <label className="form-label">School Code</label>
                  <p className="ms-2 fw-bold">{watch("code")}</p>
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label">Name</label>
                  <p className="ms-2 fw-bold">{watch("name")}</p>
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label">Place</label>
                  <p className="ms-2 fw-bold">{watch("place")}</p>
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label">Financial Assistance </label>

                  <p className="ms-2 fw-bold">{watch("financialAssistance")}</p>
                </div>

                <div className="col-md-3 mb-1">
                  <label className="form-label"> Board </label>

                  <p className="ms-2 fw-bold">{watch("schoolBoard")}</p>
                </div>
                <div className="col-md-3 mb-1">
                  <label className="form-label">Medium Of Institution</label>

                  <p className="ms-2 fw-bold">{watch("mediumOfInstitution")}</p>
                </div>
                <div className="col-md-3 mb-1">
                  <label className="form-label">Grade</label>

                  <p className="ms-2 fw-bold">{watch("grade")}</p>
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
                      <span className="badge text-bg-secondary">No Incharge</span>
                    )}
                  </p>
                </div>

                <div className="col-4 mb-2">
                  <label className="form-label">Rector</label>
                  {
                    // watch("viewr_user_id")?.length > 0 ? (
                    //   <div className="ms-2 fw-bold mb-0 d-flex flex-wrap gap-1">
                    //     {watch("viewr_user_id").map((user, idx) => (
                    //       <span key={idx} className="  viewer-badge" >
                    //         {user?.label || "N/A"}
                    //       </span>
                    //     ))}
                    //   </div>
                    // )
                    watch("viewr_user_id") ? (
                      <div className="ms-2 d-flex flex-wrap gap-1">
                        <span className="ms-2 fw-bold mb-0">
                          {watch("viewr_user_id")?.label || "N/A"}
                        </span>
                      </div>
                    ) : (
                      <p className="ms-2 fw-bold mb-0">
                        <span className="badge text-bg-secondary">No Viewer</span>
                      </p>
                    )
                  }
                </div>
                <div className="col-4 mb-2">
                  <label className="form-label">Admin</label>
                  {watch("viewer_admin_user_id") ? (
                    <div className="ms-2 d-flex flex-wrap gap-1">
                      <span className="ms-2 fw-bold mb-0">
                        {watch("viewer_admin_user_id")?.label || "N/A"}
                      </span>
                    </div>
                  ) : (
                    <p className="ms-2 fw-bold mb-0">
                      <span className="badge text-bg-secondary">No Admin</span>
                    </p>
                  )}
                </div>
                <div className="col-4 mb-2">
                  <label className="form-label">Principal</label>
                  {watch("viewer_principal_user_id") ? (
                    <div className="ms-2 d-flex flex-wrap gap-1">
                      <span className="ms-2 fw-bold mb-0">
                        {watch("viewer_principal_user_id")?.label || "N/A"}
                      </span>
                    </div>
                  ) : (
                    <p className="ms-2 fw-bold mb-0">
                      <span className="badge text-bg-secondary">No Principal</span>
                    </p>
                  )}
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
                        <span className="badge text-bg-secondary">
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
                      <div className="ms-2 fw-bold mb-0 d-flex flex-wrap gap-1">
                        {item.viewer.map((viewer, idx) => (
                          <span key={idx} className=" ms-2 fw-bold mb-0">
                            {viewer.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="ms-2 fw-bold mb-0">
                        <span className="badge text-bg-secondary">No Viewer</span>
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
                className="btn btn-secondary"
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
              <h5 className="modal-title">Import School</h5>
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

export default School;
