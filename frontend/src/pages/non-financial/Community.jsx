import React, { Suspense, useCallback, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import { tableStyle } from '../../constant/Util';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { communityRoutes, docsRoute } from '../../routes';
import { ContextProvider } from '../../App';
import { getAPI } from '../../constant/apiServices';
import Loader from '../../constant/loader';
import Select from 'react-select';
function CommunityView() {
  const contextProp = useContext(ContextProvider);
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [portfolioCategory, setPortfolioCategory] = useState([]);

  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ skip: 0, limit: 25, currentPage: 1 });

  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(25);
  const [totalRows, setTotalRows] = useState(0);

  const [isContextReady, setIsContextReady] = useState(false);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;
  const [filePermissions, setFilePermissions] = useState({ manageFiles: false, viewFiles: false });

  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);




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
    // console.log("Module Permissions:", modulePermissions);


    const extractedPermissions = {
      manageFiles: modulePermissions["manage files"] ?? false,
      viewFiles: modulePermissions["view files"] ?? false
    };

    setFilePermissions(extractedPermissions);
  }, [contextProp?.navState?.module_name, permissions]);

  // console.log("premissions", permissions);
  // console.log("contextProp?.navState.module_name", contextProp?.navState?.module_name);
  // console.log("filePermissions", filePermissions);



  useEffect(() => {
    getFinancialYears();
  }, []);

  const getFinancialYears = () => {
    getAPI('category/financialyear?skip=0&limit=0').then((res) => {
      if (res?.data?.status) {
        // console.log("financial year res ", res?.data?.data);
        setFinancialYears(res?.data?.data);
        const defaultYear = res?.data?.data[0];
        // console.log("default year", defaultYear);
        const option = {
          value: String(defaultYear?.id),
          label: defaultYear?.year
        }
        setSelectedFinancialYear(option);

      } else {
        setFinancialYears([]);
      }
    }).catch((err) => {
      console.log(err);
    })
  }

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


  const portfolioCategoryList = useCallback(() => {
    setLoading(true);
    const navState = contextProp?.navState;
    if (!navState?.portfolio_id) return;

    const idToUse = navState?.financialPortfolio_id || navState?.portfolio_id;

    getAPI(`/category/mapp/${idToUse}?skip=${pagination?.skip}&limit=${pagination?.limit}&search=${search || ''}`)
      .then((res) => {
        if (res?.data?.status) {
          // console.log("Fetched data:", res.data.data);
          setPortfolioCategory(res.data.data);
          setTotalRows(res.data.total_count);
        } else {
          setPortfolioCategory([]);
          setTotalRows(0);
        }
      })
      .catch(console.log).finally(() => {
        setLoading(false);
      });


  }, [contextProp?.navState, pagination, search]);


  console.log("portfolioCategory", portfolioCategory);


  useEffect(() => {
    portfolioCategoryList();
  }, [portfolioCategoryList]);

  const columns = [
    // {
    //   name: 'No',
    //   selector: row => row.id,
    //   width: '150px',
    // },
    {
      name: 'Categories',
      selector: row => row.category?.name,
    },
    // {
    //   name: 'Renewal Period',
    //   selector: row => row.category?.type,
    //   cell: (row) => <div className='badge text-bg-info'>{row.category?.is_renewal ? `Every ${row?.category?.renewal_iteration} ${row.category?.type}` : row.category?.type}</div>
    // },
    // {
    //   name: 'Is Due',
    //   selector: row => row.category?.is_due ? 'Yes' : 'No',
    // },
    {
      name: 'Renewal Period',
      selector: row => row.category?.type,
      cell: (row) => row.category?.is_renewal ? (
        <div className='badge text-bg-info'>
          {`Every ${row?.category?.renewal_iteration} ${row.category?.type}`}
        </div>
      ) : <div className='badge text-bg-warning'>Permanent</div>,
      // omit: !data.some(row => row.category?.is_renewal) // Hide column if no renewals
    },
    {
      name: 'Is Due',
      selector: row => row.category?.is_due ? 'Yes' : 'No',
      cell: (row) => row.category?.is_due ? 'Yes' : null,
      // omit: !data.some(row => row.category?.is_due) // Hide column if no dues
    },

    {
      name: "Action",
      cell: (row) => {
        const buttonStyle = {
          width: '32px',
          height: '32px',
          padding: '0',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        };

        const isAdmin = currentUser?.role?.name === "Admin";
        const isSuperAdmin = currentUser?.role?.name === "Super Admin";
        const canManage = filePermissions?.manageFiles;
        const canView = filePermissions?.viewFiles;
        const isRenewal = row.category?.is_renewal === true && row.category?.name !== "non renewal";

        return (
          <div className="d-flex justify-content-start gap-1">
            {/* List Button */}
            <div className="form_col">
              {
                (isAdmin || isSuperAdmin || canManage || canView) ? (
                  <span className="custum-group-table">
                    <button
                      type="button"
                      className="btn btn-sm text-info"
                      onClick={() => { catagirieslist(row) }}
                      title='List'
                      style={buttonStyle}
                    >
                      <i className="fa-solid fa-list"></i>
                    </button>
                  </span>
                ) : (
                  <div style={buttonStyle} />
                )
              }
            </div>

            {/* Add Button */}
            <div className="form_col">
              {
                (!isAdmin && canManage) ? (
                  <span className="custum-group-table">
                    <button
                      type="button"
                      className="btn btn-sm text-success"
                      onClick={() => { addCatagies(row) }}
                      title='Add'
                      style={buttonStyle}
                    >
                      <i className="fa-solid fa-plus"></i>
                    </button>
                  </span>
                ) : (
                  <div style={buttonStyle} />
                )
              }
            </div>

            {/* Documents Button */}
            <div className="form_col">
              {
                isRenewal && (canManage || canView) ? (
                  <span className="custum-group-table">
                    <button
                      type="button"
                      className="btn btn-sm text-primary"
                      onClick={() => { viewDocumentsCatagies(row) }}
                      title='Documents'
                      style={buttonStyle}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                        className="bi bi-ui-checks-grid" viewBox="0 0 16 16">
                        <path d="M2 10h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1m9-9h3a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1m0 9a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1zm0-10a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM2 9a2 2 0 0 0-2 2v3a2 2 0 0 0 2 2h3a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2zm7 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2zM0 2a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm5.354.854a.5.5 0 1 0-.708-.708L3 3.793l-.646-.647a.5.5 0 1 0-.708.708l1 1a.5.5 0 0 0 .708 0z" />
                      </svg>
                    </button>
                  </span>
                ) : (
                  <div style={buttonStyle} />
                )
              }
            </div>
          </div>
        );
      },
      ignoreRowClick: true,
      allowOverflow: true,
      maxWidth: '600px'
    }

    
  ];

  const catagirieslist = (row) => {
    const enitity_id = contextProp?.navState?.enitity_id;
    const financialPortfolio_id = contextProp?.navState?.financialPortfolio_id;
    const financialPortfolio_name = contextProp?.navState?.financialPortfolio_name;
    const portfolio_id = contextProp?.navState?.portfolio_id;
    const enitity_name = contextProp?.navState?.enitity_name;
    const category_id = row?.category_id;
    const catagory_name = row?.category?.name;
    const financial_portfolio_id_apicall = contextProp?.navState?.financial_portfolio_id_apicall;
    const catagory_type = row?.category?.type;
    const iteration = row?.category?.renewal_iteration;
    const isRenewal = row?.category?.is_renewal;
    navigate('/nonfinancial/community/communityList', { state: { enitity_id, financialPortfolio_id, financialPortfolio_name, portfolio_id, enitity_name, category_id, catagory_name, financial_portfolio_id_apicall, module_name: contextProp?.navState?.module_name, catagory_type, iteration, isRenewal } });
  }

  const addCatagies = (row) => {
    // console.log("row",row);

    const enitity_id = contextProp?.navState?.enitity_id;
    const financialPortfolio_id = contextProp?.navState?.financialPortfolio_id;
    const financialPortfolio_name = contextProp?.navState?.financialPortfolio_name;
    const portfolio_id = contextProp?.navState?.portfolio_id;
    const enitity_name = contextProp?.navState?.enitity_name;
    const category_id = row?.category_id;
    const catagory_name = row?.category?.name;
    const financial_portfolio_id_apicall = contextProp?.navState?.financial_portfolio_id_apicall;
    const catagory_type = row?.category?.type;
    const iteration = row?.category?.renewal_iteration;
    const isRenewal = row?.category?.is_renewal;

    navigate('/nonfinancial/community/communityAdd', { state: { enitity_id, financialPortfolio_id, financialPortfolio_name, portfolio_id, enitity_name, category_id, catagory_name, financial_portfolio_id_apicall, catagory_type, iteration, isRenewal } });
  }

  const viewDocumentsCatagies = (row) => {
    const enitity_id = contextProp?.navState?.enitity_id;
    const financialPortfolio_id = contextProp?.navState?.financialPortfolio_id;
    const financialPortfolio_name = contextProp?.navState?.financialPortfolio_name;
    const portfolio_id = contextProp?.navState?.portfolio_id;
    const enitity_name = contextProp?.navState?.enitity_name;
    const category_id = row?.category_id;
    const catagory_name = row?.category?.name;
    const financial_portfolio_id_apicall = contextProp?.navState?.financial_portfolio_id_apicall;
    const module_name = contextProp?.navState?.module_name;
    const catagory_type = row?.category?.type;
    const isRenewal = row?.category?.is_renewal;
    if (enitity_id && financial_portfolio_id_apicall) {
      // console.log("financial  based navigate");
      navigate("/nonfinancial/community/docsview", { state: { enitity_id, enitity_name, financialPortfolio_id, financialPortfolio_name, portfolio_id, financial_portfolio_id_apicall, category_id, catagory_name, catagory_type, module_name, isRenewal } })
    } else if (enitity_id) {
      // console.log("enity based navigate");

      navigate("/nonfinancial/community/docsview", { state: { enitity_id, enitity_name, category_id, catagory_name, catagory_type, module_name, isRenewal } })
    }




  }

  useEffect(() => {

    if (isContextReady && contextProp?.navState?.portfolio_id) {
      portfolioCategoryList();
    }

  }, [skip, limit, search, contextProp?.navState]);

  useEffect(() => {
    let nav = sessionStorage.getItem('navState');
    try {
      const parsedNav = JSON.parse(nav);
      if (contextProp?.setNavState) { // Ensure function exists
        contextProp.setNavState(parsedNav);
        setIsContextReady(true); // context is now ready
      }
    } catch (error) {
      console.error("Error parsing navState:", error);
      navigate(-1);
    }
  }, []);

  const handleBack = () => {
    // sessionStorage.setItem('navState', JSON.stringify({})); // clear all keys
    const return_path = contextProp?.navState?.return_path;
    const financialPortfolio_id = contextProp?.navState?.financialPortfolio_id;
    const financialPortfolio_name = contextProp?.navState?.financialPortfolio_name;
    const portfolio_id = contextProp?.navState?.portfolio_id;
    const name = contextProp?.navState?.module_name;

    // console.log("return_path", return_path);
    // console.log("financialPortfolio_id", financialPortfolio_id);
    // console.log("financialPortfolio_name", financialPortfolio_name);
    // console.log("portfolio_id", portfolio_id);
    // console.log("name", name);


    if (return_path) {
      sessionStorage.setItem('navState', JSON.stringify({ name, portfolio_id, financialPortfolio_id, financialPortfolio_name }));
      navigate(return_path);
    } else {
      const nav = sessionStorage.getItem('navState');
      if (nav) {
        const parsedNav = JSON.parse(nav);
        delete parsedNav?.financialPortfolio_id; // remove specific key
        sessionStorage.setItem('navState', JSON.stringify(parsedNav)); // update
      }
      navigate(contextProp?.navState?.module_name ? `/${contextProp?.navState?.module_name}` : -1);
    }


  };

  const handleYearChange = (selectedOption) => {
    // console.log("selected year e", selectedOption);
    if (selectedOption) {
      setSelectedFinancialYear(selectedOption);
    } else {
      setSelectedFinancialYear(null);
    }
  }

  // console.log("selectedFinancialYear", selectedFinancialYear);


  return (
    <>
      <div>
        <div className='d-flex justify-content-between p-2 flex-wrap bg-white'>
          <div className='p-2 col-lg-1 col-12' style={{ width: "5px" }}>
            <button className='btn pb-0' type='button' onClick={handleBack}>
              <i className='fa-solid fa-circle-left fs-5' />
            </button>
          </div>
          <div className='p-2 col-lg-5 col-12 ' style={{ margin: "5px" }}>

            <div className='d-flex align-items-center gap-2'>
              <h5 className="fw-bold text-dark mb-0">{contextProp?.navState?.enitity_name}</h5>
              {
                contextProp?.navState?.financialPortfolio_name &&
                <div className='d-flex align-items-center gap-2'>
                  <h6 className="fw-bold text-dark mb-0">-</h6>
                  <h6 className="fw-bold text-dark mb-0">{contextProp?.navState?.financialPortfolio_name}</h6>
                </div>
              }
              <div />
            </div>
          </div>
          <div className='d-flex justify-content-end col-lg-6 col-12 flex-wrap gap-1'>
            <div className='me-2 d-flex align-items-center '>

              {/* <div className="me-2 d-flex align-items-center">
                <Select
                  options={financialYears.map((data) => ({ value: String(data.id), label: data.year }))}
                  value={selectedFinancialYear}
                  className="custom-react-select"
                  placeholder="Select Financial Year"
                  onChange={handleYearChange}
                  // isClearable
                />

              </div> */}

              <div className=''>
                <div className='d-flex justify-content-end'>
                  <div className="me-2 d-flex align-items-center">
                    <button className='btn bnt-sm adminsearch-icon'>
                      <i className="fa fa-search " aria-hidden="true"></i>
                    </button>
                    <input type="text" className="form-control adminsearch" placeholder="Search by category" title="Search by category" onChange={(e) => setSearch(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={portfolioCategory}
            customStyles={tableStyle}
            // pagination
            // paginationServer
            // paginationTotalRows={totalRows}
            // onChangeRowsPerPage={(newPerPage, page) => handlePerRowsChange(newPerPage, page, setSkip, setLimit)}
            // onChangePage={(page) => handlePageChange(page, setSkip, limit)}
            // paginationPerPage={limit}
            paginationRowsPerPageOptions={[25, 50, 75, 100]}
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
            noDataComponent={null}
            // progressPending={loading}
            //per page Fixed 25 limit
            paginationPerPage={25}
          />
        </div>
        {
          portfolioCategory?.length === 0 && <div className='text-center mt-5'>No Data Found</div>
        }
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
}

function Community() {
  return (
    <Suspense>
      <Routes>
        {[{ path: '/', element: CommunityView }, ...communityRoutes, ...docsRoute].map((route, index) => (
          route.element && <Route
            key={index}
            path={route.path}
            element={<route.element />}
          />
        ))}
      </Routes>
    </Suspense>
  )
}

export default Community