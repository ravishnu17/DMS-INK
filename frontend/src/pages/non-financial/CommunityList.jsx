import React, { use, useCallback, useContext, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { tableStyle } from '../../constant/Util';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { set, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Dropzone from 'react-dropzone';
import { deleteAPI, getAPI } from '../../constant/apiServices';
import { ContextProvider } from '../../App';
import Select from 'react-select';
import Loader from '../../constant/loader';

function CommunityList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [auditTrail, setAuditTrail] = useState({});
  const [currentFinacialYear, setCurrentFinnaicialYear] = useState({});
  const [answers, setAnswers] = useState(null);
  const [viewAnswer, setViewAnswer] = useState([]);
  const contextProp = useContext(ContextProvider);

  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({ skip: 0, limit: 25, currentPage: 1 });
  const [financialYears, setFinacialYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState();

  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;

  const portfolioId = location?.state?.portfolio_id;
  const catagory_name = location?.state?.catagory_name;
  const categoryId = location?.state?.category_id;
  const enitity_name = location?.state?.enitity_name;
  const enitity_id = location?.state?.enitity_id;

  const financialPortfolio_id = location?.state?.financialPortfolio_id;
  const financialPortfolio_name = location?.state?.financialPortfolio_name;
  const financial_portfolio_id_apicall = location?.state?.financial_portfolio_id_apicall;
  const selectedFinancialYear = location?.state?.selectedFinancialYear;
  const catagory_type = location?.state?.catagory_type;
  const iteration = location?.state?.iteration;
  const isRenewal = location?.state?.isRenewal;

  const [filePermissions, setFilePermissions] = useState({ manageFiles: false, viewFiles: false });

  //date format
  const pad = (n) => n.toString().padStart(2, '0');
  const formatISTDate = (isoDate) => {
    const date = new Date(isoDate);
    const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = pad(istDate.getDate());
    const month = pad(istDate.getMonth() + 1);
    const year = istDate.getFullYear();
    let hours = istDate.getHours();
    const minutes = pad(istDate.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (selectedFinancialYear) {
      setSelectedYear(selectedFinancialYear);
    }
  }, [location?.state])
  useEffect(() => {
    const moduleMap = {
      community: "community",
      society: "society",
      parish: "parishes",
      school: "schools",
      technicalinstitute: "technical institutions",
      college: "colleges",
      boardinghostel: "boarding and hostel",
      department: "departments",
      socialsector: "social sectors",
      company: "companies"
    };

    const rawModule = contextProp?.navState?.module_name?.toLowerCase() || "";
    const moduleName = moduleMap[rawModule];

    const modulePermissions = permissions?.role_permissions?.[moduleName] || {};

    const extractedPermissions = {
      manageFiles: modulePermissions["manage files"] ?? false,
      viewFiles: modulePermissions["view files"] ?? false
    };

    setFilePermissions(extractedPermissions);
  }, [contextProp?.navState?.module_name, permissions]);


  const handleBack = () => {
    const portfolio_id = location?.state?.portfolio_id;
    const catagory_name = location?.state?.catagory_name;
    const category_id = location?.state?.category_id;
    const enitity_name = location?.state?.enitity_name;
    const enitity_id = location?.state?.enitity_id;
    const financialPortfolio_id = location?.state?.financialPortfolio_id;
    const financialPortfolio_name = location?.state?.financialPortfolio_name;
    const financial_portfolio_id_apicall = location?.state?.financial_portfolio_id_apicall;
    const catagory_type = location?.state?.catagory_type;
    const iteration = location?.state?.iteration;
    const isRenewal = location?.state?.isRenewal;

    navigate('/nonfinancial/community', { state: { portfolio_id, catagory_name, category_id, enitity_name, enitity_id, financialPortfolio_id, financialPortfolio_name, financial_portfolio_id_apicall, catagory_type, iteration, isRenewal } })

    // navigate(contextProp?.navState?.module_name ? `/${contextProp?.navState?.module_name}` : -1);
  }


  const upDateCatagory = (row) => {
    const enitity_id = location?.state?.enitity_id;
    const financialPortfolio_id = location?.state?.financialPortfolio_id;
    const financialPortfolio_name = location?.state?.financialPortfolio_name;
    const portfolio_id = location?.state?.portfolio_id;
    const enitity_name = location?.state?.enitity_name;
    const category_id = location?.state?.category_id;
    const catagory_name = location?.state?.catagory_name;
    const financial_portfolio_id_apicall = location?.state?.financial_portfolio_id_apicall;
    const isRenewal = location?.state?.isRenewal;
    navigate("/nonfinancial/community/communityAdd", { state: { enitity_id, financialPortfolio_id, financialPortfolio_name, portfolio_id, enitity_name, category_id, catagory_name, answer_id: row?.id, financial_portfolio_id_apicall, selectedYear, catagory_type, iteration, isRenewal } })
  }



  const financialYearList = () => {
    getAPI(`/category/financialyear?skip=0&limit=25`).then((res) => {
      setLoading(true);
      if (res?.data?.status) {


        setFinacialYears(res?.data?.data);
        // if (selectedYear ) {
        //   if (selectedYear) {
        //     setSelectedYear(selectedYear);
        //   } 
        // } else {
        const defaultYear = res?.data?.data[0];
        const option = {
          value: String(defaultYear?.id),
          label: defaultYear?.year
        }
        setSelectedYear(option);
        // }
        // const currentFinancialYear = getCurrentFinancialYear(res?.data?.data);
        // // Only update state if currentFinancialYear is valid
        // if (currentFinancialYear) {
        //   setCurrentFinnaicialYear(currentFinancialYear);
        //   setLoading(false);
        // } else {
        //   setCurrentFinnaicialYear({});

        //   // Keeps the default empty object
        // }

        setLoading(false);

      }

    })
  }
  const currentDate = new Date();
  const getCurrentFinancialYear = (years) => {
    return years.find(({ start_date, end_date }) => {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      return currentDate >= startDate && currentDate <= endDate;
    }) || null;
  };

  useEffect(() => {


    communityAnswerList();
  }, [selectedYear])
  const communityAnswerList = useCallback((search) => {
    setLoading(true);
    if (!enitity_id || !categoryId) return


    if (search != undefined && search != null && financial_portfolio_id_apicall) {
      getAPI(`answers/list?non_financial_portfolio_id=${portfolioId}&entity_id=${enitity_id}&category_id=${categoryId}&financial_year_id=${selectedYear?.value || 0}&skip=${pagination?.skip}&limit=${pagination?.limit}&financial_entity_id=${financial_portfolio_id_apicall}&search=${search ? search : ""}&show_deleted=false`)
        .then((res) => {
          if (res?.data?.status) {
            setAnswers(res?.data?.data);
            setTotalRows(res?.data?.total_count);
          } else {
            setAnswers(null);
            setTotalRows(0);
          }
        })
        .catch((error) => {
          console.error("Error fetching community answers:", error);
        }).finally(() => {
          setLoading(false);
        });
    } else if (financial_portfolio_id_apicall) {
      getAPI(`answers/list?non_financial_portfolio_id=${portfolioId}&entity_id=${enitity_id}&category_id=${categoryId}&financial_year_id=${selectedYear?.value || 0}&skip=${pagination?.skip}&limit=${pagination?.limit}&financial_entity_id=${financial_portfolio_id_apicall}&show_deleted=false`)
        .then((res) => {
          if (res?.data?.status) {
            setAnswers(res?.data?.data);
            setTotalRows(res?.data?.total_count);
          } else {
            setAnswers(null);
            setTotalRows(0);
          }
        })
        .catch((error) => {
          console.error("Error fetching community answers:", error);
        }).finally(() => {
          setLoading(false);
        });;
    } else if (search != undefined && search != null) {
      getAPI(`answers/list?non_financial_portfolio_id=${portfolioId}&entity_id=${enitity_id}&category_id=${categoryId}&financial_year_id=${selectedYear?.value || 0}&skip=${pagination?.skip}&limit=${pagination?.limit}&search=${search ? search : ""}&show_deleted=false`)
        .then((res) => {
          if (res?.data?.status) {
            setAnswers(res?.data?.data);
            setTotalRows(res?.data?.total_count);
          } else {
            setAnswers(null);
            setTotalRows(0);
          }
        })
        .catch((error) => {
          console.error("Error fetching community answers:", error);
        }).finally(() => {
          setLoading(false);
        });;
    } else {
      getAPI(`answers/list?non_financial_portfolio_id=${portfolioId}&entity_id=${enitity_id}&category_id=${categoryId}&financial_year_id=${selectedYear?.value || 0}&skip=${pagination?.skip}&limit=${pagination?.limit}&show_deleted=false`)
        .then((res) => {


          if (res?.data?.status) {
            setAnswers(res?.data?.data);
            setTotalRows(res?.data?.total_count);
          } else {
            setAnswers(null);
            setTotalRows(0);
          }
        })
        .catch((error) => {
          console.error("Error fetching community answers:", error);
        }).finally(() => {
          setLoading(false);
        });

    }

  }, [enitity_id, categoryId, selectedYear, pagination]);







  const deleteRow = (id) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAPI(`answers/${id}`)
          .then(res => {
            if (res?.data?.status) {
              communityAnswerList();
              // delete message
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Deleted!',
                text: res.data.details,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#28a745',  // success green
                color: '#fff'
              });

            } else {
              Swal.fire(
                'Deleted!',
                res?.data?.details,
                'error'
              );
              // delete message
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Deleted!',
                text: res.data.details,
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#28a745',  // success green
                color: '#fff'
              });


            }
            // Perform any additional actions (e.g., refresh data)
          })
          .catch(error => {
            Swal.fire({
              icon: "warning",
              title: 'Something went wrong!',
              text: res?.data?.details || 'Something went wrong!',
              confirmButtonText: 'OK',
              background: 'rgb(255, 255, 255)',
              color: '  #000000'
            });

            console.error('Delete error:', error);
          });
      }
    });

  }

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB'); // 'en-GB' formats date as DD/MM/YYYY
  };
  const [viewLoading, setViewLoading] = useState(false);
  const viewAnswers = (id) => {
    setViewLoading(true);
    setViewAnswer([]); // Clear previous data
    getAPI(`/answers/${id}`).then((res) => {
      if (res?.data?.status) {
        setViewAnswer(res?.data?.data.answer_data);
        setAuditTrail(res?.data?.data);
      }
    }).finally(() => {
      setTimeout(() => {
        setViewLoading(false);
      }, 500); // Show loader for at least 500ms
    });
  }


  const columns = [
    {
      name: '#',
      selector: (row, index) => index + 1,
    },
    // {
    //   name: 'Community',
    //   selector: row => answers?.answer_details?.community?.name,
    // },
    {
      name: 'DDM',
      selector: row => answers?.answer_details?.entity_users?.length ?
        answers?.answer_details?.entity_users.filter(item => item.role.name === "DDM").map(item => item.user.name)
        : <span className="badge text-bg-secondary">No Incharge</span>
    },
    {
      name: 'Report Date',
      selector: row => formatDate(row?.created_at),
    },
    {
      name: 'Version',
      selector: row => row?.version
    },

    // {
    //   name: "Action",
    //   cell: (row) => (
    //     <>
    //       <div className="d-flex justify-content-between">
    //         {
    //           (filePermissions?.manageFiles || filePermissions?.viewFiles) && (
    //             <div className="form_col ml-1">
    //               <span className="custum-group-table" >

    //                 <button type="button" className="btn  btn-sm text-info" title='View' onClick={() => viewAnswers(row.id)} >
    //                   <i className="fas fa-eye " />
    //                 </button>
    //               </span>
    //             </div>
    //           )

    //         }

    //         {
    //           filePermissions?.manageFiles && (
    //             <>
    //               <div className="form_col ml-1">
    //                 <span className="custum-group-table" >
    //                   <button type="button" className="btn  btn-sm text-success" title='Update'
    //                     onClick={() => { upDateCatagory(row) }}
    //                   >
    //                     <i className="fas fa-edit" />
    //                   </button>
    //                 </span>
    //               </div>
    //               <div className="form_col">
    //                 <span className="custum-group-table  ">
    //                   <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deleteRow(row.id)} >
    //                     <i className="fa fa-trash" />
    //                   </button>
    //                 </span>
    //               </div>
    //             </>
    //           )
    //         }


    //       </div>
    //     </>
    //   ),
    //   ignoreRowClick: true,
    //   allowoverflow: true,
    //   maxwidth: '600px'
    // }
    //new code 
    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <>
              {
                currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ? (
                  <>

                    {
                      (filePermissions?.manageFiles || filePermissions?.viewFiles) && (
                        <div className="form_col ml-1">
                          <span className="custum-group-table" >

                            <button type="button" className="btn  btn-sm text-info" title='View' onClick={() => viewAnswers(row.id)} >
                              <i className="fas fa-eye " />
                            </button>
                          </span>
                        </div>
                      )

                    }

                    {
                      (currentUser?.role?.name != "Admin" && filePermissions?.manageFiles) && (
                        <>
                          <div className="form_col ml-1">
                            <span className="custum-group-table" >
                              <button type="button" className="btn  btn-sm text-success" title='Update'
                                onClick={() => { upDateCatagory(row) }}
                              >
                                <i className="fas fa-edit" />
                              </button>
                            </span>
                          </div>
                          <div className="form_col">
                            <span className="custum-group-table  ">
                              <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deleteRow(row.id)} >
                                <i className="fa fa-trash" />
                              </button>
                            </span>
                          </div>
                        </>
                      )
                    }

                  </>
                )
                  : (<>
                    {
                      (filePermissions?.manageFiles || filePermissions?.viewFiles) && (
                        <div className="form_col ml-1">
                          <span className="custum-group-table" >

                            <button type="button" className="btn  btn-sm text-info" title='View' onClick={() => viewAnswers(row.id)} >
                              <i className="fas fa-eye " />
                            </button>
                          </span>
                        </div>
                      )

                    }

                    {
                      filePermissions?.manageFiles && (
                        <>
                          <div className="form_col ml-1">
                            <span className="custum-group-table" >
                              <button type="button" className="btn  btn-sm text-success" title='Update'
                                onClick={() => { upDateCatagory(row) }}
                              >
                                <i className="fas fa-edit" />
                              </button>
                            </span>
                          </div>
                          <div className="form_col">
                            <span className="custum-group-table  ">
                              <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deleteRow(row.id)} >
                                <i className="fa fa-trash" />
                              </button>
                            </span>
                          </div>
                        </>
                      )
                    }
                  </>)
              }
            </>





          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: '600px'
    }
  ];

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

  const handleYearChange = (year) => {
    setSelectedYear(year);
  }

  useEffect(() => {
    // Only open modal when viewAnswer has data (not just when loading)
    if (viewAnswer && Object.keys(viewAnswer).length > 0) {
      const modalElement = document.getElementById("detailsModal");
      if (modalElement) {
        const modalInstance = new bootstrap.Modal(modalElement);
        modalInstance.show();
      }
    }
  }, [viewAnswer]);

  useEffect(() => {
    const modalElement = document.getElementById("detailsModal");
    if (!modalElement) return;

    const handleModalClose = () => {
      setViewLoading(false);
      setViewAnswer([]);
    };

    modalElement.addEventListener("hidden.bs.modal", handleModalClose);

    return () => {
      modalElement.removeEventListener("hidden.bs.modal", handleModalClose);
    };
  }, []);

  useEffect(() => {
    financialYearList();
    // communityAnswerList();
  }, [])

  useEffect(() => {
    if (selectedYear?.value && enitity_id && categoryId) {
      communityAnswerList();
    }
  }, [selectedYear, enitity_id, categoryId])

  useEffect(() => {
    let nav = sessionStorage.getItem('navState');
    try {
      const parsedNav = JSON.parse(nav);
      if (contextProp?.setNavState) { // Ensure function exists
        contextProp.setNavState(parsedNav);
      }
    } catch (error) {
      console.error("Error parsing navState:", error);
      navigate(-1);
    }
  }, []);



  return (

    <>
      <div >
        <div className='d-flex justify-content-between p-2 flex-wrap bg-white'>
          <div className='p-2 col-lg-1 col-12'>
            <i className="fa-solid fa-circle-left fs-5" onClick={handleBack}></i>
          </div>
          <div className='p-2 col-lg-5 col-12 '>


            <div className="d-flex align-items-center gap-1 me-2">
              <h5 className="fw-bold mb-0">{location.state?.enitity_name}</h5>
              {
                location.state?.financialPortfolio_name && <h6 className="fw-bold mb-0"> - {location.state?.financialPortfolio_name}</h6>
              }
              {
                location.state?.catagory_name && <h6 className="fw-bold mb-0"> - {location.state?.catagory_name}</h6>
              }

            </div>
          </div>
          <div className="d-flex justify-content-end col-lg-6 col-12 flex-wrap gap-1 ">
            {/* <div className="d-flex align-items-center gap-2">
             
            </div> */}


            <div className='d-flex align-items-center gap-1 mb-2'>
              {/* <div>
                <Select
                  name='financial_year'
                  value={selectedYear}
                  options={financialYears?.map((data) => ({ value: String(data.id), label: data.year }))}
                  className="custom-react-select w-100"
                  placeholder="select Year"
                  classNamePrefix="custom-react-select"
                  onChange={(e) => handleYearChange(e)}
                  isClearable
                />
              </div> */}
              <div>
                <Select
                  name="financial_year"
                  value={selectedYear}
                  options={financialYears?.map((data) => ({ value: String(data.id), label: data.year }))}
                  placeholder="Select Year"
                  isClearable

                  /* 1. Render the menu in a portal at document.body */
                  menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                  menuPosition="absolute"      // leave it absolutely-positioned
                  menuShouldBlockScroll        // lock page scroll while open

                  /* 2. Styles to match our control width and allow scrolling */
                  styles={{
                    container: (base) => ({
                      ...base,
                      width: '100%',       // make the control fill its parent
                    }),
                    menuPortal: (base) => ({
                      ...base,
                      zIndex: 9999,        // so it sits on top of everything
                    }),
                    menu: (base) => ({
                      ...base,
                      minWidth: '100%',    // at least as wide as the control
                      maxHeight: '200px',  // or whatever you like
                      overflowY: 'auto',
                    })
                  }}

                  /* your classNames for the rest of your styling */
                  className="custom-react-select w-100"
                  classNamePrefix="custom-react-select"

                  onChange={(e) => handleYearChange(e)}
                />
              </div>


              <div className="me-2 d-flex align-items-center ">
                <button className='btn bnt-sm adminsearch-icon'>
                  <i className="fa fa-search " aria-hidden="true"></i>
                </button>
                <input type="text" className="form-control adminsearch" placeholder="Search by Name" title="Search " onChange={(e) => communityAnswerList(e.target.value)} />
              </div>
            </div>

          </div>
        </div>
        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={answers?.answers}
            customStyles={tableStyle}
            //pagination
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
            noDataComponent={null}
            // progressPending={loading}
            //per page Fixed 25 limit
            paginationPerPage={25}
          />
        </div>

        {
          (answers === null || answers?.answers === null || answers?.answers === undefined || answers?.answers?.length === 0) && (
            <div className='text-center mt-5'>No Data Found</div>
          )
        }
      </div>

      <div className="modal fade" id="detailsModal" tabIndex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              {viewLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
                  <Loader />
                </div>
              ) : (
                <>
                  <div className="row">
                    {Object.entries(viewAnswer ?? {}).map(([key, item]) => {
                      if (Array.isArray(item)) return null;

                      let answerText = "";
                      if (item?.question_type === "Multi Choice" && Array.isArray(item?.answer)) {
                        answerText = item?.answer.map(opt => opt.label).join(", ");
                      } else if (typeof item?.answer === "object" && item?.answer !== null) {
                        answerText = item?.answer.label;
                      } else {
                        answerText = item?.answer;
                      }

                      return (
                        <div key={key} className="col-md-4 mb-3">
                          <label className="form-label">{item?.question_name}</label>
                          <p className="ms-2 fw-bold">{answerText}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* <div className="row">
                    {Object.entries(viewAnswer ?? {}).map(([key, files]) => {
                      if (!Array.isArray(files)) return null;

                      const latestFile = files.reduce((prev, curr) =>
                        curr.version > (prev?.version || 0) ? curr : prev,
                        files[0]
                      );

                      return (
                        <div key={key} className="col-md-6 mb-3">
                          <label className="form-label">{latestFile?.question_name}</label>
                          <div className="text-start ml-5">
                            <a
                              href={latestFile?.file_location}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={latestFile?.file_name}
                            >
                              {["jpg", "png", "jpeg", "gif"].includes(latestFile?.file_extension) ? (
                                <>
                                  <img
                                    src={latestFile?.file_location}
                                    alt={latestFile?.file_name}
                                    className="img-fluid rounded mb-1"
                                    style={{ maxWidth: "100px", maxHeight: "100px" }}
                                  />
                                  <p className="small text-muted">{latestFile?.file_name}</p>
                                </>
                              ) : (
                                <a
                                  href={latestFile?.file_location}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="file-link"
                                  title={latestFile?.file_name}
                                >
                                  📎 {latestFile?.file_name}
                                </a>
                              )}
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div> */}

                  <div className="row">
                    {Object.entries(viewAnswer ?? {}).map(([key, files]) => {
                      if (!Array.isArray(files)) return null;

                      return (
                        <div key={key} className="col-md-6 mb-3">
                          <label className="form-label">{files[0]?.question_name}</label>
                          <div className="text-start ml-5">
                            {files.map((file, idx) => (
                              <div key={file.id || idx} className="mb-2">
                                <a
                                  href={file?.file_location}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={file?.file_name}
                                >
                                  {["jpg", "png", "jpeg", "gif"].includes(file?.file_extension) ? (
                                    <>
                                      <img
                                        src={file?.file_location}
                                        alt={file?.file_name}
                                        className="img-fluid rounded mb-1"
                                        style={{ maxWidth: "100px", maxHeight: "100px" }}
                                      />
                                      <p className="small text-muted mb-0">{file?.file_name} (v{file?.version})</p>
                                    </>
                                  ) : (
                                    <span className="file-link">
                                      📎 {file?.file_name} (v{file?.version})
                                    </span>
                                  )}
                                </a>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-2 border-top border-secondary">
                    <h5 className="mb-3 text-primary text-center mt-2">Activity History</h5>
                    <div className="border rounded shadow-sm p-3 bg-light">
                      <strong className='audit-strong'>Created by {auditTrail?.created_by} on {formatISTDate(auditTrail?.created_at)}</strong><br />
                      <strong className='audit-strong'>Changed by {auditTrail?.updated_by} on {formatISTDate(auditTrail?.updated_at)}</strong><br />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
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
  )

  // return (
  //   <>
  //     <div>
  //       {/* ... [keep all the existing JSX before the modal] ... */}

  //       <div className="modal fade" id="detailsModal" tabIndex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
  //         <div className="modal-dialog modal-xl">
  //           <div className="modal-content">
  //             <div className="modal-header">
  //               <h5 className="modal-title">View Details</h5>
  //               <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
  //             </div>
  //             <div className="modal-body">
  //               {viewLoading ? (
  //                 <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
  //                   <Loader />
  //                 </div>
  //               ) : (
  //                 <>
  //                   <div className="row">
  //                     {Object.entries(viewAnswer ?? {}).map(([key, item]) => {
  //                       if (Array.isArray(item)) return null;

  //                       let answerText = "";
  //                       if (item?.question_type === "Multi Choice" && Array.isArray(item?.answer)) {
  //                         answerText = item?.answer.map(opt => opt.label).join(", ");
  //                       } else if (typeof item?.answer === "object" && item?.answer !== null) {
  //                         answerText = item?.answer.label;
  //                       } else {
  //                         answerText = item?.answer;
  //                       }

  //                       return (
  //                         <div key={key} className="col-md-4 mb-3">
  //                           <label className="form-label">{item?.question_name}</label>
  //                           <p className="ms-2 fw-bold">{answerText}</p>
  //                         </div>
  //                       );
  //                     })}
  //                   </div>

  //                   <div className="row">
  //                     {Object.entries(viewAnswer ?? {}).map(([key, files]) => {
  //                       if (!Array.isArray(files)) return null;

  //                       const latestFile = files.reduce((prev, curr) =>
  //                         curr.version > (prev?.version || 0) ? curr : prev,
  //                         files[0]
  //                       );

  //                       return (
  //                         <div key={key} className="col-md-6 mb-3">
  //                           <label className="form-label">{latestFile?.question_name}</label>
  //                           <div className="text-start ml-5">
  //                             <a
  //                               href={latestFile?.file_location}
  //                               target="_blank"
  //                               rel="noopener noreferrer"
  //                               title={latestFile?.file_name}
  //                             >
  //                               {["jpg", "png", "jpeg", "gif"].includes(latestFile?.file_extension) ? (
  //                                 <>
  //                                   <img
  //                                     src={latestFile?.file_location}
  //                                     alt={latestFile?.file_name}
  //                                     className="img-fluid rounded mb-1"
  //                                     style={{ maxWidth: "100px", maxHeight: "100px" }}
  //                                   />
  //                                   <p className="small text-muted">{latestFile?.file_name}</p>
  //                                 </>
  //                               ) : (
  //                                 <a
  //                                   href={latestFile?.file_location}
  //                                   target="_blank"
  //                                   rel="noopener noreferrer"
  //                                   className="file-link"
  //                                   title={latestFile?.file_name}
  //                                 >
  //                                   📎 {latestFile?.file_name}
  //                                 </a>
  //                               )}
  //                             </a>
  //                           </div>
  //                         </div>
  //                       );
  //                     })}
  //                   </div>

  //                   <div className="mt-2 border-top border-secondary">
  //                     <h5 className="mb-3 text-primary text-center mt-2">Activity History</h5>
  //                     <div className="border rounded shadow-sm p-3 bg-light">
  //                       <strong className='audit-strong'>Created by {auditTrail?.created_by} on {formatISTDate(auditTrail?.created_at)}</strong><br />
  //                       <strong className='audit-strong'>Changed by {auditTrail?.updated_by} on {formatISTDate(auditTrail?.updated_at)}</strong><br />
  //                     </div>
  //                   </div>
  //                 </>
  //               )}
  //             </div>
  //             <div className="modal-footer">
  //               <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
  //                 Close
  //               </button>
  //             </div>
  //           </div>
  //         </div>
  //       </div>

  //       {loading && (
  //         <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
  //           <Loader />
  //         </div>
  //       )}
  //     </div>
  //   </>
  // )

}

export default CommunityList