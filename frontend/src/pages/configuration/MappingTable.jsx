import React, {
  use,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { RoleIds, tableStyle } from "../../constant/Util";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { get, set, useForm } from "react-hook-form";
import Select from "react-select";
import { Link } from "react-router-dom";
import { ContextProvider } from "../../App";
import { addUpdateAPI, getAPI } from "../../constant/apiServices";
import Swal from "sweetalert2";
import "./MappingTable.css";
import Loader from "../../constant/loader";
function MappingTable() {
  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [loading, setLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const modulepermission = permissions?.role_permissions?.[`mapping table`];

  const [expandedRowId, setExpandedRowId] = useState(null); // Store expanded row ID
  const [expandedData, setExpandedData] = useState([]);

  const [expanderRow, setExpanderRow] = useState({});
  const schema = {};

  //modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [isViewerModalOpen, setIsViewerModalOpen] = useState(false);
  const [viewerModalData, setViewerModalData] = useState(null);
  const [isFinanceViewerModalOpen, setIsFinanceViewerModalOpen] =
    useState(false);
  const [financeViewerModalData, setFinanceViewerModalData] = useState(null);
  const [isFinanceInchargeModalOpen, setIsFinanceInchargeModalOpen] =
    useState(false);
  const [financeInchargeModalData, setFinanceInchargeModalData] =
    useState(null);

  const [editIncharge, setEditIncharge] = useState(null);
  const [editViewer, setEditViewer] = useState(null);

  const [editFinanceIncharge, setEditFinanceIncharge] = useState(null);
  const [editFinanceViewer, setEditFinanceViewer] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
    watch,
  } = useForm({ resolver: yupResolver(schema) });
  const [moduleList, setModuleList] = useState([]);
  const [communites, setCommunites] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [userOptions, setUserOptions] = useState([]);
  const [vieweruseroptions, setViewerUserOptions] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState([]);
  const [selectedCommunityOptions, setSelectedCommunityOptions] = useState([]);
  const [search, setSearch] = useState("");
  const [inchargeValues, setInchargeValues] = useState({});
  const [viewerValues, setViewerValues] = useState({});
  //dublicted values using useState
  const [originalInchargeValues, setOriginalInchargeValues] = useState({});
  const [originalViewerValues, setOriginalViewerValues] = useState({});

  const [financialInchargeValues, setFinancialInchargeValues] = useState({});
  const [financialViewerValues, setFinancialViewerValues] = useState({});

  const [financialInchargeValues1, setFinancialInchargeValues1] = useState({});
  const [financialViewerValues1, setFinancialViewerValues1] = useState({});

  const [nonFinancialPortfoliosId, setNonFinancialPortfoliosId] = useState("");

  useEffect(() => {
    getModuleList();
    getCommuniyList();
    getNonFinancialPortfolios();
    getUserOptions();
    getViewerUserOptions();
  }, []);

  // console.log("selectedCommunityOptions",selectedCommunityOptions);

  useEffect(() => {
    if (selectedCommunityOptions?.value && selectedPortfolio?.value) {
      // getPortfolioFilterList();
      getCommunityPortfolioList();
    } else if (
      selectedCommunityOptions?.value &&
      (selectedPortfolio?.length === 0 ||
        selectedPortfolio === null ||
        selectedPortfolio === undefined)
    ) {
      getCommunityPortfolioList();
    } else {
      getModuleList();
    }
  }, [selectedCommunityOptions, selectedPortfolio]);

  const getUserOptions = () => {
    getAPI("/access/users-options?role_id=3&ddm=true").then((res) => {
      if (res?.data?.status) {
        setUserOptions(res?.data?.data);
      }
    });
  };
  const getViewerUserOptions = () => {
    getAPI("/access/users-options?role_id=4").then((res) => {
      if (res?.data?.status) {
        // console.log("viewer res?.data?.data",res?.data?.data);

        setViewerUserOptions(res?.data?.data);
      }
    });
  };

  // console.log("vieweruseroptions",vieweruseroptions);

  const getModuleList = useCallback((search) => {
    setLoading(true);

    getAPI(
      `config/community/options?skip=${pagination?.skip}&limit=${
        pagination?.limit
      }&search=${search || ""}`
    ).then((res) => {
      if (res?.data?.status) {
        setModuleList(res?.data?.data);
        setTotalRows(res?.data?.data?.length);

        const initialValues = {};
        const initialValues2 = {};

        res?.data?.data.forEach((row, index) => {
          const ddmUser = row.community_user?.find(
            (user) => user.role?.name === "DDM"
          );

          if (ddmUser) {
            initialValues[index] = {
              value: ddmUser?.user_id,
              label: ddmUser?.user.name,
              roleId: ddmUser?.role_id,
            };
          }
        });

        setInchargeValues(initialValues);
        setOriginalInchargeValues(initialValues);

        res?.data?.data.forEach((row, index) => {
          const viewerUser = row.community_user?.filter(
            (user) => user.role?.name === "Viewer"
          );

          if (viewerUser?.length > 0) {
            initialValues2[index] = viewerUser?.map((viewer) => ({
              value: viewer?.user_id,
              label: viewer?.user.name,
              roleId: viewer?.role_id,
            }));
          }
        });

        setViewerValues(initialValues2);
        setOriginalViewerValues(initialValues2);
        setLoading(false);
        setDataLoading(false);
      }
    });
  });

  const getCommunityPortfolioList = useCallback((serach) => {
    setLoading(true);
    getAPI(
      `/config/community/portfolio?community_id=${
        selectedCommunityOptions?.value ? selectedCommunityOptions?.value : 0
      }&portfolio_id=${
        selectedPortfolio?.value ? selectedPortfolio?.value : 0
      }&search=${serach || ""}`
    )
      .then((res) => {
        if (res?.data?.status) {
          setModuleList(res?.data?.data);
          setTotalRows(res?.data?.total_count);

          const initialValues = {};
          const initialValues2 = {};

          res?.data?.data.forEach((row, index) => {
            const ddmUser = row.community_user?.find(
              (user) => user.role?.name === "DDM"
            );

            if (ddmUser) {
              initialValues[index] = {
                value: ddmUser?.user_id,
                label: ddmUser?.user.name,
                roleId: ddmUser?.role_id,
              };
            }
          });

          setInchargeValues(initialValues);
          setOriginalInchargeValues(initialValues);

          res?.data?.data.forEach((row, index) => {
            const viewerUser = row.community_user?.filter(
              (user) => user.role?.name === "Viewer"
            );

            if (viewerUser?.length > 0) {
              initialValues2[index] = viewerUser?.map((viewer) => ({
                value: viewer?.user_id,
                label: viewer?.user.name,
                roleId: viewer?.role_id,
              }));
            }
          });

          setViewerValues(initialValues2);
          setOriginalViewerValues(initialValues2);
        } else {
          setModuleList([]);
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  });

  const getCommuniyList = () => {
    getAPI("config/community/options?skip=0&limit=0").then((res) => {
      if (res?.data?.status) {
        const communitesoptions = res?.data?.data.map((item) => ({
          value: item.id,
          label: item.name,
        }));

        setCommunites(communitesoptions);
      }
    });
  };

  const getNonFinancialPortfolios = () => {
    getAPI("config/portfolio?skip=0&limit=0&type=Non%20Financial").then(
      (res) => {
        if (res?.data?.status) {
          const portfoliosoptions = res?.data?.data
            .map((item) => ({ value: item.id, label: item.name }))
            .filter((item) => item.value !== 1);

          setPortfolios(portfoliosoptions);
        }
      }
    );
  };

  const handleInchargeChange = (selectedOption, rowIndex) => {
    setInchargeValues((prev) => ({
      ...prev,
      [rowIndex]: selectedOption,
    }));
  };
  const handleCanceInchargeChange = (rowIndex) => {
    setInchargeValues((prev) => ({
      ...prev,
      [rowIndex]: originalInchargeValues[rowIndex] || null,
    }));
    setEditIncharge(null);
  };

  const handleCanceViwerChange = (rowIndex) => {
    setViewerValues((prev) => ({
      ...prev,
      [rowIndex]: originalViewerValues[rowIndex] || null,
    }));
    setEditViewer(null);
  };

  const mainInchargeSave = (selectedOption, row, index) => {
    // console.log("selectedOption", inchargeValues[index]);

    // console.log("mainInchargeSave", selectedOption, row, index)

    const dataconstraction = {
      entity_id: row?.id, // main data id
      financial_entity_id: null,
      role_id: RoleIds.DDMRoleId, // optional - financial for main data
      users: selectedOption
        ? [
            {
              user_id: selectedOption.value,
              role_id: selectedOption.roleId,
            },
          ]
        : [],
    };

    addUpdateAPI(
      "PUT",
      `config/users/portfolio?non_financial_portfolio_id=${row?.portfolio_id}`,
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

          getModuleList();
          setSelectedPortfolio([]);
          setSelectedCommunityOptions([]);
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

    setEditIncharge(null);
    setEditViewer(null);
  };

  const handleViewerChange = (selectedOption, index) => {
    setViewerValues((prev) => ({
      ...prev,
      [index]: selectedOption || null,
    }));
  };

  const mainViewerSave = (selectedOption, row, index) => {
    const converted = selectedOption
      ? [
          {
            user_id: selectedOption.value,
            role_id: selectedOption.roleId,
          },
        ]
      : [];

    const dataconstraction = {
      entity_id: row?.id,
      financial_entity_id: null,
      role_id: RoleIds.ViewerRoleId,
      users: converted,
    };

    addUpdateAPI(
      "PUT",
      `config/users/portfolio?non_financial_portfolio_id=${row?.portfolio_id}`,
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
          getModuleList();
          setSelectedPortfolio([]);
          setSelectedCommunityOptions([]);
          setLoading(false);

          setOriginalViewerValues((prev) => {
            const updated = { ...prev };
            delete updated[index];
            return updated;
          });
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

    setEditViewer(null);
    setEditIncharge(null);
  };
  const handleCancelEdit = (index) => {
    setViewerValues((prev) => ({
      ...prev,
      [index]: originalViewerValues[index] || [],
    }));
    setEditViewer(null);
  };
  const getDropdownMenuPlacement = (index) => {
    const element = document.getElementById(`row-${index}`);
    if (element) {
      const rect = element.getBoundingClientRect();
      const bottomSpace = window.innerHeight - rect.bottom;
      if (bottomSpace < 200) {
        return "top";
      }
    }
    return "auto";
  };

  const columns = [
    {
      name: "Type",
      style: { padding: "0.25rem" },
      selector: (row) => row.type,
      sortable: true,
    },
    { name: "Name", selector: (row) => row.name, sortable: true },
    {
      name: "Incharge",
      width: 300,
      cell: (row, index) => {
        const isEditing = String(index) === editIncharge;
        const hasIncharge = row?.community_user?.some(
          (item) => item?.role?.name === "DDM"
        );
        // console.log(index,"expanderRow",expanderRow);

        const isEditRow = expanderRow
          ? expanderRow?.id === row.id && expanderRow?.status === true
          : false;

        // console.log(index, "isEditRow", isEditRow);

        return (
          <div
            key={row.id}
            className="d-flex justify-content-between align-items-center w-100"
            style={{ gap: "2px" }}
            id={`row-${index}`}
          >
            <div className="flex-grow-1">
              {isEditing ? (
                <Select
                  options={userOptions?.map((data) => ({
                    value: data.id,
                    label: data.name,
                    roleId: RoleIds.DDMRoleId,
                  }))}
                  value={inchargeValues[index] || null}
                  onChange={(option) => handleInchargeChange(option, index)}
                  className="custom-react-select"
                  placeholder="Select Incharge"
                  classNamePrefix="react-select"
                  isClearable
                  isSearchable
                  menuPosition="fixed"
                  menuPortalTarget={document.body}
                  menuPlacement={getDropdownMenuPlacement(index)}
                />
              ) : (
                <>
                  {hasIncharge ? (
                    row.community_user
                      .filter((item) => item?.role?.name === "DDM")
                      .map((item, idx) => (
                        <p key={idx} className="mb-0">
                          {item?.user?.name}
                        </p>
                      ))
                  ) : (
                    <span className="badge text-bg-secondary">No Incharge</span>
                  )}
                </>
              )}
            </div>

            <div className="d-flex gap-2 justify-content-end">
              {isEditing && isEditRow === false ? (
                <>
                  <i
                    className="fa-solid fa-circle-xmark text-danger"
                    title="Cancel"
                    // onClick={() => { setEditIncharge(null) }}
                    onClick={() => {
                      setEditIncharge(null), handleCanceInchargeChange(index);
                    }}
                  />
                  <i
                    className="fa fa-save text-success"
                    title="Save"
                    onClick={() =>
                      mainInchargeSave(inchargeValues[index], row, index)
                    }
                  />
                </>
              ) : (
                modulepermission?.edit &&
                isEditRow === false && (
                  <i
                    className="fa fa-edit text-success"
                    title="Edit"
                    onClick={() => {
                      setModalData({
                        oldIncharge: row.community_user?.find(
                          (item) => item?.role?.name === "DDM"
                        ),
                        row,
                        index,
                      });
                      setIsModalOpen(true);
                      setEditIncharge(null);
                      handleCanceViwerChange(index);
                      setEditViewer(null);
                      setEditFinanceIncharge(null);
                      setEditFinanceViewer(null);
                    }}
                  />
                )
              )}
            </div>
          </div>
        );
      },
    },
    {
      name: "Viewer",
      width: 300,
      cell: (row, index) => {
        const isEditing = String(index) === editViewer;
        const hasViewer = row?.community_user?.some(
          (item) => item?.role?.name === "Viewer"
        );
        const isEditRow = expanderRow
          ? expanderRow?.id === row.id && expanderRow?.status === true
          : false;
        return (
          <div
            key={row.id}
            className="d-flex justify-content-between align-items-center w-100"
            style={{ gap: "2px" }}
            id={`row-${index}`}
          >
            <div className="flex-grow-1">
              {isEditing ? (
                <Select
                  id={`dropdown-${index}`}
                  className="w-100 viewer-expand-select-width"
                  classNamePrefix="viewerExpand"
                  placeholder="Select Viewer"
                  menuPortalTarget={document.body}
                  menuPlacement={getMenuPlacement(index, totalRows)}
                  options={userOptions?.map((data) => ({
                    value: data.id,
                    label: data.name,
                    roleId: RoleIds.ViewerRoleId,
                  }))}
                  value={financialViewerValues[index] || null}
                  onChange={(option) =>
                    handlePortfolioViewerChange(option, index)
                  }
                  isDisabled={String(index) !== editFinanceViewer}
                />
              ) : (
                <>
                  {hasViewer ? (
                    <div className="d-flex flex-wrap gap-2">
                      {row?.community_user
                        ?.filter((item) => item?.role?.name === "Viewer")
                        .map((item, idx) => (
                          <span key={idx} className=" viewer-badge">
                            {item?.user?.name}
                          </span>
                        ))}
                    </div>
                  ) : (
                    <span className="badge text-bg-secondary">No Viewer</span>
                  )}
                </>
              )}
            </div>
            <div className="d-flex gap-2 justify-content-end">
              {isEditing && isEditRow === false ? (
                <>
                  <i
                    className="fa-solid fa-circle-xmark text-danger"
                    title="Cancel"
                    onClick={() => {
                      handleCanceViwerChange(index), setEditViewer(null);
                    }}
                  />
                  <i
                    className="fa fa-save text-success"
                    title="Save"
                    onClick={() =>
                      mainViewerSave(viewerValues[index], row, index)
                    }
                  />
                </>
              ) : (
                modulepermission?.edit &&
                isEditRow === false && (
                  <i
                    className="fa fa-edit text-success"
                    title="Edit"
                    onClick={() => {
                      setViewerModalData({
                        oldViewers: row.community_user?.filter(
                          (item) => item?.role?.name === "Viewer"
                        ),
                        row,
                        index,
                      });
                      setIsViewerModalOpen(true);
                      setEditViewer(null);
                      handleCanceInchargeChange(index);
                      setEditIncharge(null);
                      setEditFinanceIncharge(null);
                      setEditFinanceViewer(null);
                    }}
                  />
                )
              )}
            </div>
          </div>
        );
      },
    },
  ];

  // console.log("expanderRow",expanderRow);

  const handleRowExpand = (expanded, row) => {
    setEditIncharge(null);
    setEditViewer(null);
    setEditFinanceIncharge(null);
    setEditFinanceViewer(null);
    // console.log("expanded", expanded,row.id);
    const rowExpended = {
      id: row.id,
      status: expanded,
    };
    // console.log("rowExpended converted", rowExpended);

    setExpanderRow(rowExpended);

    setNonFinancialPortfoliosId(row?.portfolio_id);

    if (expanded) {
      setExpandedRowId(row.id); // Expand only this row
      if (row?.portfolio_id === 1) {
        getCommunityDetails(row.id, "expanded");
      } else if (row?.portfolio_id === 2) {
        getSocietyDetails(row.id, "expanded");
      } else {
        getPortfolioDetails(row.id, "expanded");
      }
    } else {
      setExpandedRowId(null); // Collapse row
      setExpanderRow({});
    }
  };

  const getCommunityDetails = (id, type) => {
    if (type === "expanded") {
      setRowLoading(true);
    }

    getAPI("/config/community/" + id)
      .then((res) => {
        if (res?.data?.status) {
          if (type === "expanded") {
            setExpandedData(res?.data?.data?.cfp);

            const initialValues = {};
            const initialValues2 = {};

            res?.data?.data?.cfp?.forEach((row, index) => {
              const ddmUser = row?.cfp_user?.find(
                (user) => user.role?.name === "DDM"
              );

              if (ddmUser) {
                initialValues[index] = {
                  value: ddmUser?.user_id,
                  label: ddmUser?.user.name,
                  roleId: ddmUser?.role_id,
                };
              }
            });

            setFinancialInchargeValues(initialValues);
            setFinancialInchargeValues1(initialValues);

            res?.data?.data?.cfp?.forEach((row, index) => {
              const viewerUser = row?.cfp_user?.filter(
                (user) => user.role?.name === "Viewer"
              );

              if (viewerUser?.length > 0) {
                initialValues2[index] =
                  viewerUser?.length > 0
                    ? {
                        value: viewerUser[0]?.user_id,
                        label: viewerUser[0]?.user.name,
                        roleId: viewerUser[0]?.role_id,
                      }
                    : null;
              }
            });

            setFinancialViewerValues(initialValues2);
            setFinancialViewerValues1(initialValues2);
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

  const getSocietyDetails = (id, type) => {
    setLoading(true);
    getAPI("/config/society/" + id)
      .then((res) => {
        if (res?.data?.status) {
          if (type === "expanded") {
            const updatedData = transformResponse(res?.data?.data?.sfp);

            setExpandedData(updatedData);
            const initialValues = {};
            const initialValues2 = {};

            updatedData?.forEach((row, index) => {
              const ddmUser = row?.cfp_user?.find(
                (user) => user.role?.name === "DDM"
              );

              if (ddmUser) {
                initialValues[index] = {
                  value: ddmUser?.user_id,
                  label: ddmUser?.user.name,
                  roleId: ddmUser?.role_id,
                };
              }
            });

            setFinancialInchargeValues(initialValues);
            setFinancialInchargeValues1(initialValues);

            updatedData?.forEach((row, index) => {
              const viewerUser = row?.cfp_user?.filter(
                (user) => user.role?.name === "Viewer"
              );

              if (viewerUser?.length > 0) {
                initialValues2[index] =
                  viewerUser?.length > 0
                    ? {
                        value: viewerUser[0]?.user_id,
                        label: viewerUser[0]?.user.name,
                        roleId: viewerUser[0]?.role_id,
                      }
                    : null;
              }
            });

            setFinancialViewerValues(initialValues2);
            setFinancialViewerValues1(initialValues2);

            // setFetchedIds((prev) => new Set(prev).add(id));
          }
        }
      })
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const transformResponse = (data) => {
    return data.map((item) => {
      const { sfp_user, society_id, ...rest } = item;
      return {
        ...rest,
        community_id: society_id,
        cfp_user: sfp_user,
      };
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
            const updatedData = transformResponse1(res?.data?.data?.lefp);

            setExpandedData(updatedData);

            const initialValues = {};
            const initialValues2 = {};

            updatedData?.forEach((row, index) => {
              const ddmUser = row?.cfp_user?.find(
                (user) => user.role?.name === "DDM"
              );

              if (ddmUser) {
                initialValues[index] = {
                  value: ddmUser?.user_id,
                  label: ddmUser?.user.name,
                  roleId: ddmUser?.role_id,
                };
              }
            });

            setFinancialInchargeValues(initialValues);
            setFinancialInchargeValues1(initialValues);

            updatedData?.forEach((row, index) => {
              const viewerUser = row?.cfp_user?.filter(
                (user) => user.role?.name === "Viewer"
              );

              if (viewerUser?.length > 0) {
                initialValues2[index] =
                  viewerUser?.length > 0
                    ? {
                        value: viewerUser[0]?.user_id,
                        label: viewerUser[0]?.user.name,
                        roleId: viewerUser[0]?.role_id,
                      }
                    : null;
              }
            });

            setFinancialViewerValues(initialValues2);
            setFinancialViewerValues1(initialValues2);
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

  const transformResponse1 = (data) => {
    return data.map((item) => {
      const { lefp_user, legal_entity_id, ...rest } = item;
      return {
        ...rest,
        community_id: legal_entity_id,
        cfp_user: lefp_user,
      };
    });
  };

  const handlePortfolioInchargeChange = (selectedOption, rowIndex) => {
    setFinancialInchargeValues((prev) => ({
      ...prev,
      [rowIndex]: selectedOption,
    }));
  };

  const handlePortfolioViewerChange = (selectedOption, index) => {
    setFinancialViewerValues((prev) => ({
      ...prev,
      [index]: selectedOption || null,
    }));

    // Optional: Do something with selected viewers
    const selectedUserNames = selectedOption.map((opt) => opt.label);
    const selectedUserIds = selectedOption.map((opt) => opt.value);
  };

  const portfolioInchargeSave = (selectedOption, row, index) => {
    const dataconstraction = {
      entity_id: row?.community_id, // main data id
      financial_entity_id: row?.id, // optional - financial for main data
      role_id: RoleIds.DDMRoleId,
      users: selectedOption
        ? [
            {
              user_id: selectedOption.value,
              role_id: selectedOption.roleId,
            },
          ]
        : [],
    };

    addUpdateAPI(
      "PUT",
      `config/users/portfolio?non_financial_portfolio_id=${nonFinancialPortfoliosId}`,
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
          getModuleList();
          setSelectedPortfolio([]);
          setSelectedCommunityOptions([]);
          setExpandedRowId(null);
          setEditFinanceIncharge(null);
          setEditFinanceViewer(null);
          setExpanderRow({});
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

    // getModuleList();
    // setSelectedPortfolio([]);
    // setSelectedCommunityOptions([]);
    // setExpandedRowId(null);
  };

  const portFolioViewerUpdate = (selectedOption, row, index) => {
    const users = selectedOption
      ? [
          {
            user_id: selectedOption.value,
            role_id: selectedOption.roleId,
          },
        ]
      : [];

    const dataconstraction = {
      entity_id: row?.community_id,
      financial_entity_id: row?.id,
      role_id: RoleIds.ViewerRoleId,
      users: users,
    };

    addUpdateAPI(
      "PUT",
      `config/users/portfolio?non_financial_portfolio_id=${nonFinancialPortfoliosId}`,
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
          setExpandedRowId(null);
          getModuleList();
          setSelectedPortfolio([]);
          setSelectedCommunityOptions([]);
          setEditFinanceIncharge(null);
          setEditFinanceViewer(null);
          setLoading(false);
          setExpanderRow({});
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

    // setExpandedRowId(null);
  };
  const handleEditIncharge = (index) => {
    setOriginalInchargeValues((prev) => ({
      ...prev,
      [index]: financialInchargeValues[index] || null, // Store the current value before editing
    }));
    setEditFinanceIncharge(String(index));
    handleCancelViewer(index);
    setEditIncharge(null);
    setEditViewer(null);
    setEditFinanceViewer(null);
  };

  const handleEditViewer = (index) => {
    setOriginalViewerValues((prev) => ({
      ...prev,
      [index]: financialViewerValues[index] || [], // Store the current value before editing
    }));
    setEditFinanceViewer(String(index));
    handleCancelIncharge(index);
    setEditIncharge(null);
    setEditViewer(null);
    setEditFinanceIncharge(null);
  };
  const handleCancelIncharge = (index) => {
    setFinancialInchargeValues((prev) => ({
      ...prev,
      [index]: financialInchargeValues1[index] || null, // Revert to original value
    }));
    setEditFinanceIncharge(null);
  };

  const handleCancelViewer = (index) => {
    setFinancialViewerValues((prev) => ({
      ...prev,
      [index]: financialViewerValues1[index] || [], // Revert to original value
    }));
    setEditFinanceViewer(null);
  };

  const rowExpandView = (row) => {
    // Function to determine whether the dropdown should open upwards or downwards
    const getMenuPlacement = (index, totalRows) => {
      if (index === totalRows - 1) {
        return "top"; // Always open upwards for the last row
      }

      const dropdownElement = document.getElementById(`dropdown-${index}`);
      if (!dropdownElement) return "bottom";

      const rect = dropdownElement.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // If there is less space below the dropdown than above, open upwards
      return spaceBelow < spaceAbove ? "top" : "bottom";
    };

    return (
      <div className="container-fluid p-2 subtable">
        <table className="table w-100 bg-light">
          <thead>
            <tr className="table-primary border-bottom border-danger">
              <th scope="col">Portfolio</th>
              <th scope="col">Number</th>
              <th scope="col">Name</th>
              <th scope="col">Incharge</th>
              <th scope="col">Viewer</th>
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
                const isAdmin =
                  currentUser?.role?.name === "Admin" ||
                  currentUser?.role?.name === "Super Admin";
                const totalRows = expandedData.length;

                return (
                  <tr key={portfolio.id}>
                    <td>{portfolio?.portfolio?.name || "-"}</td>
                    <td>{portfolio?.number || "-"}</td>
                    <td>{portfolio?.name || "-"}</td>

                    {/* Incharge Column */}
                    <td style={{ width: "20%" }}>
                      <div className="d-flex justify-content-between align-items-center w-100">
                        <div className="d-flex gap-1 flex-wrap">
                          {String(index) !== editFinanceIncharge &&
                            portfolio?.cfp_user
                              ?.filter((item) => item?.role?.name === "DDM")
                              .map((item, idx) => (
                                <span key={idx}>{item?.user?.name}</span>
                              ))}

                          {String(index) !== editFinanceIncharge &&
                            !portfolio?.cfp_user?.some(
                              (item) => item?.role?.name === "DDM"
                            ) && (
                              <span className="badge text-bg-secondary">
                                No Incharge
                              </span>
                            )}
                        </div>

                        <div
                          className="ms-auto d-flex gap-2"
                          style={{ alignItems: "center" }}
                        >
                          {String(index) === editFinanceIncharge ? (
                            <>
                              <Select
                                className="w-100 row-expand-select-width"
                                classNamePrefix="rowExpand"
                                id={`dropdown-${index}`}
                                options={userOptions?.map((data) => ({
                                  value: data.id,
                                  label: data.name,
                                  roleId: RoleIds.DDMRoleId,
                                }))}
                                value={financialInchargeValues[index] || null}
                                onChange={(option) =>
                                  handlePortfolioInchargeChange(option, index)
                                }
                                placeholder="Select Incharge"
                                isClearable
                                isSearchable
                                menuPortalTarget={document.body}
                                menuPosition="fixed"
                                menuPlacement={getMenuPlacement(
                                  index,
                                  totalRows
                                )}
                              />
                              <i
                                className="fa-solid fa-circle-xmark text-danger"
                                title="Cancel"
                                onClick={() => handleCancelIncharge(index)}
                              />
                              <i
                                className="fa fa-save text-success"
                                title="Save"
                                onClick={() =>
                                  portfolioInchargeSave(
                                    financialInchargeValues[index],
                                    portfolio,
                                    index
                                  )
                                }
                              />
                            </>
                          ) : (
                            <>
                              {(isAdmin || modulepermission?.edit) && (
                                <i
                                  className="fa fa-edit text-success"
                                  title="Edit"
                                  onClick={() => {
                                    setFinanceInchargeModalData({
                                      oldIncharge: portfolio?.cfp_user?.find(
                                        (item) => item?.role?.name === "DDM"
                                      ),
                                      portfolio,
                                      index,
                                    });
                                    setIsFinanceInchargeModalOpen(true);
                                    setEditFinanceIncharge(null);
                                    setEditFinanceViewer(null);
                                  }}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Viewer Column */}
                    <td style={{ width: "20%" }}>
                      <div className="d-flex justify-content-between align-items-center  gap-1 w-100">
                        <div className="d-flex gap-2 flex-wrap">
                          {String(index) !== editFinanceViewer && (
                            <>
                              {portfolio?.cfp_user
                                ?.filter(
                                  (item) => item?.role?.name === "Viewer"
                                )
                                .map((item, idx) => (
                                  <span key={idx} className=" viewer-badge">
                                    {item?.user?.name}
                                  </span>
                                ))}

                              {!portfolio?.cfp_user?.some(
                                (item) => item?.role?.name === "Viewer"
                              ) && (
                                <span className="badge text-bg-secondary">
                                  No Viewer
                                </span>
                              )}
                            </>
                          )}
                        </div>

                        <div
                          className="ms-auto d-flex gap-2"
                          style={{ alignItems: "center" }}
                        >
                          {String(index) === editFinanceViewer ? (
                            <>
                              <Select
                                id={`dropdown-${index}`}
                                className="w-100 viewer-expand-select-width"
                                classNamePrefix="viewerExpand"
                                placeholder="Select Viewer"
                                menuPortalTarget={document.body}
                                menuPlacement={getMenuPlacement(
                                  index,
                                  totalRows
                                )}
                                options={userOptions?.map((data) => ({
                                  value: data.id,
                                  label: data.name,
                                  roleId: RoleIds.ViewerRoleId,
                                }))}
                                value={financialViewerValues[index] || null}
                                onChange={(option) =>
                                  handlePortfolioViewerChange(option, index)
                                }
                                isDisabled={String(index) !== editFinanceViewer}
                              />
                              <i
                                className="fa-solid fa-circle-xmark text-danger"
                                title="Cancel"
                                onClick={() => handleCancelViewer(index)}
                              />
                              <i
                                className="fa fa-save text-success"
                                title="Save"
                                onClick={() =>
                                  portFolioViewerUpdate(
                                    financialViewerValues[index],
                                    portfolio,
                                    index
                                  )
                                }
                              />
                            </>
                          ) : (
                            <>
                              {(isAdmin || modulepermission?.edit) && (
                                <i
                                  className="fa fa-edit text-success"
                                  title="Edit"
                                  onClick={() => {
                                    setFinanceViewerModalData({
                                      oldViewers: portfolio?.cfp_user?.filter(
                                        (item) => item?.role?.name === "Viewer"
                                      ),
                                      portfolio,
                                      index,
                                    });
                                    setIsFinanceViewerModalOpen(true);
                                    setEditFinanceViewer(null);
                                    setEditFinanceIncharge(null);
                                  }}
                                />
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const handleCommunityChange = (selectedOption) => {
    setEditIncharge(null);
    setEditFinanceViewer(null);
    setEditFinanceIncharge(null);
    setEditFinanceViewer(null);

    if (selectedOption) {
      setSelectedCommunityOptions(selectedOption);
    } else {
      setSelectedCommunityOptions(null);
    }
  };

  const handlePortfolioChange = (selectedOption) => {
    setEditIncharge(null);
    setEditFinanceViewer(null);
    setEditFinanceIncharge(null);
    setEditFinanceViewer(null);
    if (selectedOption) {
      setSelectedPortfolio(selectedOption);
    } else {
      setSelectedPortfolio(null);
    }
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

  const handlesearch = (e) => {
    const value = e?.target?.value;

    if (selectedCommunityOptions?.value && selectedPortfolio?.value) {
      // getPortfolioFilterList(value);
      getCommunityPortfolioList(value);
    } else if (
      selectedCommunityOptions?.value &&
      selectedPortfolio?.length === 0
    ) {
      getCommunityPortfolioList(value);
    } else {
      getModuleList(value);
    }
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
          <div className="p-2 col-lg-5 col-12">
            <h6 className="fw-bold mb-0">Mapping Table</h6>
          </div>
          <div className="d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1">
            <div className="row w-100 m-0">
              <div className="col-12 col-md-4 mb-2 mb-md-0 px-1">
                <label className="form-label p-0">Filter by Community</label>
                <Select
                  options={communites}
                  className="custom-react-select"
                  placeholder="Select Community"
                  value={selectedCommunityOptions}
                  // onChange={handleCommunityChange}
                  onChange={(selectedOptions) => {
                    // field.onChange(selectedOptions); // updates form field
                    if (selectedOptions) {
                      handleCommunityChange(selectedOptions); // safe to call with value
                    } else {
                      handleCommunityChange(null); // optional: handle clearing case
                    }
                  }}
                  isClearable
                  isSearchable
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({
                      ...base,
                      maxHeight: 200, // controls dropdown height
                      overflowY: "auto", // enables vertical scrollbar
                      zIndex: 100,
                      "::-webkit-scrollbar": {
                        display: "none",
                      },
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }),
                  }}
                />
              </div>
              <div className="col-md-4 p-0 pe-2">
                <label className="form-label p-0">Filter by Portfolio</label>
                <Select
                  options={portfolios}
                  className="custom-react-select"
                  placeholder="Select Portfolio"
                  isClearable
                  isSearchable
                  value={selectedPortfolio}
                  onChange={handlePortfolioChange}
                  isDisabled={
                    selectedCommunityOptions?.length === 0 ||
                    selectedCommunityOptions === null
                  }
                  styles={{
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                    menu: (base) => ({
                      ...base,
                      maxHeight: 200, // controls dropdown height
                      overflowY: "auto", // enables vertical scrollbar
                      zIndex: 100,
                      "::-webkit-scrollbar": {
                        display: "none",
                      },
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }),
                  }}
                />
              </div>
              <div className="col-md-4 p-0">
                <label className="form-label p-0 opacity-0">Search</label>
                <div className="d-flex">
                  <div className="me-2 d-flex align-items-center w-100">
                    <button className="btn btn-sm adminsearch-icon">
                      <i className="fa fa-search" aria-hidden="true"></i>
                    </button>
                    <input
                      type="text"
                      className="form-control adminsearch"
                      placeholder="Search by Name"
                      title="Search"
                      onChange={(e) => handlesearch(e)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="non-sticky-module">
          <div
            className="card"
            style={{
              margin: "7px",
              borderRadius: "0.5rem",
              overflow: "hidden",
            }}
          >
            <div className="responsive-table-wrapper">
              <DataTable
                columns={columns}
                data={moduleList}
                customStyles={tableStyle}
                expandableRows
                expandOnRowClicked
                onRowExpandToggled={handleRowExpand}
                expandableRowsComponent={rowExpandView}
                paginationRowsPerPageOptions={[25, 50, 75, 100]}
                expandableRowExpanded={(row) => row.id === expandedRowId}
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
        {loading && (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "500px" }}
          >
            <Loader />
          </div>
        )}
      </div>

      {isModalOpen && modalData && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{
            background: "rgba(0,0,0,0.5)",
            height: "100vh",
            width: "100vw",
            overflowY: "auto",
          }}
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
                  onClick={() => setIsModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body d-flex justify-content-between align-items-center gap-2">
                <div className="flex-fill" style={{ paddingLeft: "25px" }}>
                  <label className="fw-bold">Old Incharge</label>
                  <div className="mt-2">
                    {modalData.oldIncharge ? (
                      <span className="badge bg-secondary">
                        {modalData.oldIncharge.user?.name}
                      </span>
                    ) : (
                      <span className="badge bg-danger">No Incharge</span>
                    )}
                  </div>
                </div>
                <div className="flex-fill">
                  <label className="fw-bold">New Incharge</label>
                  <Select
                    options={userOptions?.map((data) => ({
                      value: data.id,
                      label: data.name,
                      roleId: RoleIds.DDMRoleId,
                    }))}
                    value={inchargeValues[modalData.index] || null}
                    onChange={(option) =>
                      handleInchargeChange(option, modalData.index)
                    }
                    className="custom-react-select"
                    placeholder="Select Incharge"
                    classNamePrefix="react-select"
                    isClearable
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    mainInchargeSave(
                      inchargeValues[modalData.index],
                      modalData.row,
                      modalData.index
                    );
                    setIsModalOpen(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isViewerModalOpen && viewerModalData && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
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
                  onClick={() => setIsViewerModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body d-flex justify-content-between align-items-center gap-3">
                <div className="flex-fill" style={{ paddingLeft: "25px" }}>
                  <label className="fw-bold" style={{ padding: "10pz" }}>
                    Old Viewer(s)
                  </label>
                  <div className="mt-2">
                    {viewerModalData.oldViewers &&
                    viewerModalData.oldViewers.length > 0 ? (
                      viewerModalData.oldViewers.map((item, idx) => (
                        <span key={idx} className="badge bg-secondary me-1">
                          {item.user?.name}
                        </span>
                      ))
                    ) : (
                      <span className="badge bg-danger">No Viewer</span>
                    )}
                  </div>
                </div>
                <div className="flex-fill">
                  <label className="fw-bold">New Viewer</label>
                  <Select
                    // isMulti // <-- REMOVE THIS LINE
                    options={vieweruseroptions?.map((data) => ({
                      value: data.id,
                      label: data.name,
                      roleId: RoleIds.ViewerRoleId,
                    }))}
                    value={viewerValues[viewerModalData.index] || null}
                    onChange={(option) =>
                      handleViewerChange(option, viewerModalData.index)
                    }
                    className="custom-react-select"
                    placeholder="Select Viewer"
                    classNamePrefix="react-select"
                    isClearable
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsViewerModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    mainViewerSave(
                      viewerValues[viewerModalData.index],
                      viewerModalData.row,
                      viewerModalData.index
                    );
                    setIsViewerModalOpen(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFinanceViewerModalOpen && financeViewerModalData && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
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
                  onClick={() => setIsFinanceViewerModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body d-flex justify-content-between align-items-center gap-3">
                <div className="flex-fill" style={{ paddingLeft: "25px" }}>
                  <label className="fw-bold" style={{ padding: "10pz" }}>
                    Old Viewer(s)
                  </label>
                  <div className="mt-2">
                    {financeViewerModalData.oldViewers &&
                    financeViewerModalData.oldViewers.length > 0 ? (
                      financeViewerModalData.oldViewers.map((item, idx) => (
                        <span key={idx} className="badge bg-secondary me-1">
                          {item.user?.name}
                        </span>
                      ))
                    ) : (
                      <span className="badge bg-danger">No Viewer</span>
                    )}
                  </div>
                </div>
                <div className="flex-fill">
                  <label className="fw-bold">New Viewer</label>
                  <Select
                    // isMulti // <-- REMOVE THIS LINE
                    options={vieweruseroptions?.map((data) => ({
                      value: data.id,
                      label: data.name,
                      roleId: RoleIds.ViewerRoleId,
                    }))}
                    value={
                      financialViewerValues[financeViewerModalData.index] ||
                      null
                    }
                    onChange={(option) =>
                      handlePortfolioViewerChange(
                        option,
                        financeViewerModalData.index
                      )
                    }
                    className="custom-react-select"
                    placeholder="Select Viewer"
                    classNamePrefix="react-select"
                    isClearable
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsFinanceViewerModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    portFolioViewerUpdate(
                      financialViewerValues[financeViewerModalData.index],
                      financeViewerModalData.portfolio,
                      financeViewerModalData.index
                    );
                    setIsFinanceViewerModalOpen(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isFinanceInchargeModalOpen && financeInchargeModalData && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}
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
                  onClick={() => setIsFinanceInchargeModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body d-flex justify-content-between align-items-center gap-3">
                <div className="flex-fill" style={{ paddingLeft: "25px" }}>
                  <label className="fw-bold">Old Incharge</label>
                  <div className="mt-2">
                    {financeInchargeModalData.oldIncharge ? (
                      <span className="badge bg-secondary">
                        {financeInchargeModalData.oldIncharge.user?.name}
                      </span>
                    ) : (
                      <span className="badge bg-danger">No Incharge</span>
                    )}
                  </div>
                </div>
                <div className="flex-fill">
                  <label className="fw-bold">New Incharge</label>
                  <Select
                    options={userOptions?.map((data) => ({
                      value: data.id,
                      label: data.name,
                      roleId: RoleIds.DDMRoleId,
                    }))}
                    value={
                      financialInchargeValues[financeInchargeModalData.index] ||
                      null
                    }
                    onChange={(option) =>
                      handlePortfolioInchargeChange(
                        option,
                        financeInchargeModalData.index
                      )
                    }
                    className="custom-react-select"
                    placeholder="Select Incharge"
                    classNamePrefix="react-select"
                    isClearable
                    isSearchable
                    menuPortalTarget={document.body}
                    menuPosition="fixed"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsFinanceInchargeModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-success"
                  onClick={() => {
                    portfolioInchargeSave(
                      financialInchargeValues[financeInchargeModalData.index],
                      financeInchargeModalData.portfolio,
                      financeInchargeModalData.index
                    );
                    setIsFinanceInchargeModalOpen(false);
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default MappingTable;
