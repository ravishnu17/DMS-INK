import React, { Suspense, useCallback, useEffect, useState } from "react";
import { getAPI } from "../constant/apiServices";
import Swal from "sweetalert2";
// Remove Loader from Util and import from loader
import { tableStyle } from "../constant/Util";
import Loader from "../constant/loader";
import { Route, Routes, useNavigate } from "react-router-dom";
import { prCategoryDetailRoutes } from "../routes";
import DataTable from "react-data-table-component";

function ListOfDDMsReportView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [ddmReportList, setDDMReportList] = useState([]);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [totalRows, setTotalRows] = useState(0);
  const [dataLoading, setDataLoading] = useState(true);
  const getDDMReportList = useCallback(
    (search) => {
      setLoading(true);
      if (search !== undefined) {
        getAPI(
          `/reports/ddmUserList?skip=${pagination?.skip}&limit=${pagination?.limit}&search=` +
            search
        )
          .then((res) => {
            if (res?.data?.status) {
              setDDMReportList(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setDDMReportList([]);
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
          `/reports/ddmUserList?skip=${pagination?.skip}&limit=${pagination?.limit}`
        )
          .then((res) => {
            if (res?.data?.status) {
              setDDMReportList(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setDDMReportList([]);
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
    getDDMReportList();
  }, [getDDMReportList]);

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

  const data = [
    {
      id: "DDM0001",
      name: "Fr. Grace Charles",
      house: "Andaman - DIYYA DON BOSCO",
      phone: "8939323939",
      email: "gracesdb@gmail.com",
    },
    {
      id: "DDM0002",
      name: "Mr. A Maria Francis",
      house: "Mary Help of Christians Church, Polur",
      phone: "9894759221",
      email: "mariafrancis1304@gmail.com",
    },
    // Add more rows...
  ];

  const columns = [
    {
      name: "#",
      selector: (row, index) => index + 1,
      width: "60px", // restrict width for #
      center: true,
    },
    // {
    //     name: 'ID',
    //     selector: row => row.id,
    // },
    {
      name: "DDM Name",
      cell: (row) => (
        <label className="text-truncate" title={row.name}>
          {row?.name}
        </label>
      ),
      width: "180px",
    },
    // {
    //     name: 'House',
    //     cell: (row) => <label className='text-truncate' title={row.house}>{row?.house}</label>,
    //     width: '250px'
    // },
    {
      name: "Phone Number",
      cell: (row) => (
        <label className="text-truncate" title={row.mobile_no}>
          {row?.mobile_no}
        </label>
      ),
      width: "200px",
    },
    {
      name: "Email",
      cell: (row) => (
        <label className="text-truncate" title={row.email}>
          {row?.email}
        </label>
      ),
      width: "250px",
    },
    {
      name: "Reports",
      cell: (row) => (
        <div className="report-buttons-group">
          <button
            className="report-button"
            onClick={() => handleReportClick("monthly", row.id, row)}
          >
            Monthly Docs
          </button>
          <button
            className="report-button"
            onClick={() => handleReportClick("quarterly", row.id, row)}
          >
            Qrtly Docs
          </button>
          <button
            className="report-button"
            onClick={() => handleReportClick("halfyearly", row.id, row)}
          >
            Hlf Yrly Docs
          </button>
          <button
            className="report-button"
            onClick={() => handleReportClick("annual", row.id, row)}
          >
            Annual Docs
          </button>
        </div>
      ),
      minWidth: "450px", // enough to contain 4 buttons
      grow: 2, // allow flex grow
    },
  ];

  const handleReportClick = (type, id, row) => {
    navigate(`/report/byListOfDDMsReport/ddm-detail/${type}/${id}`, {
      state: { category: row },
    });
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
          <div className="p-2 col-lg-5 col-12">
            <h6 className="fw-bold mb-0">List of DDMs</h6>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={ddmReportList}
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
                <div className="text-center  py-4">No data found</div>
              )
            }
            paginationPerPage={25}
          />
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
    </>
  );
}

function ListOfDDMsReport() {
  return (
    <Suspense>
      <Routes>
        {[
          { path: "/", element: ListOfDDMsReportView },
          ...prCategoryDetailRoutes,
        ].map(
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
export default ListOfDDMsReport;
