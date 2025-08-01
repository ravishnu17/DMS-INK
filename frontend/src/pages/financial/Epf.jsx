import React, { Suspense, useContext, useEffect, useState } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { formatDate, tableStyle } from "../../constant/Util";
import DataTable from "react-data-table-component";
import { docsRoute, epfRoutes } from "../../routes";
import { ContextProvider } from "../../App";
import { getAPI } from "../../constant/apiServices";

function EpfView() {
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

  const [epfList, setEpfList] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });

  useEffect(() => {
    const stored = sessionStorage.getItem("navState");
    if (stored) {
      setNavState(JSON.parse(stored));
    }
  }, []);
  useEffect(() => {
    getEpfList();
  }, [navState, pagination, search]);

  const getEpfList = () => {
    getAPI(
      `config/list-by-financial?non_financial_portfolio_id=${
        navState?.portfolio_id
      }&financial_portfolio_id=${navState?.financialPortfolio_id}&skip=${
        pagination.skip
      }&limit=${pagination.limit} &search=${search ? search : ""}`
    )
      .then((res) => {
        console.log("EPF List:", res);
        if (res?.status) {
          setEpfList(res?.data?.data || []);
          setTotalRows(res?.data?.total_count);
        }
      })
      .catch((error) => {
        console.error("Error fetching EPF list:", error);
      });
  };

  if (!contextProp.navState) {
    return <div className="text-center">Loading...</div>;
  }
  // console.log("navState", navState);

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

  const columns = [
    {
      name: navState?.name,
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
      selector: (row) => row.financialPortfolio_record_name,
      sortable: true,
    },
    {
      name: navState?.financialPortfolio_name + " Number",
      selector: (row) => row.financialPortfolio_record_number,
      sortable: true,
    },
    {
      name: "Incharge",
      selector: (row) => row.incharge_name,
      sortable: true,
    },
    {
      name: "Viewer",
      selector: (row) => row.viewer_name,
      sortable: true,
    },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            {(row.financialPortfolio_record_name ||
              row.financialPortfolio_record_number) && (
              <div className="form_col ml-1 ">
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

            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Update"
                  data-bs-toggle="modal"
                  data-bs-target="#addModel"
                  // onClick={() => editClick(row)}
                >
                  <i className="fas fa-edit" />
                </button>
              </span>
            </div>
          </div>
        </>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: "600px",
    },
  ];

  // console.log("contextProp.navState?.name", navState?.name);

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
                  onClick={() => navigate(-1)}
                >
                  <i className="fa-solid fa-circle-left fs-5" />
                </button>
                <h6 className="fw-bold text-dark mb-0">
                  {" "}
                  {navState?.name} - {navState?.financialPortfolio_name}
                </h6>
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
              <div className="text-center py-4">No data found</div>
            }
            // progressPending={loading}
            //per page Fixed 25 limit
            paginationPerPage={25}
          />
        </div>
      </div>
    </>
  );
}

function Epf() {
  return (
    <Suspense>
      <Routes>
        {[{ path: "/", element: EpfView }, ...epfRoutes, ...docsRoute].map(
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
}

export default Epf;
