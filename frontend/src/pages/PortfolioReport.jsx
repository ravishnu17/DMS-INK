import React, { Suspense, useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { Route, Routes, useNavigate } from "react-router-dom";
import { tableStyle } from "../constant/Util";
import Select from "react-select";
import { portfolioDetailRoutes } from "../routes";
import { getAPI } from "../constant/apiServices";
import Loader from "../constant/loader";

export const ddms = [
  {
    id: "DDM0001",
    name: "Fr. Grace Charles",
    phone: "8939232939",
    email: "gracesdb@gmail.com",
  },
  {
    id: "DDM0002",
    name: "Mr. A Maria Francis",
    phone: "9894759221",
    email: "mariafrancis1304@gmail.com",
  },
];

export const portfolios = {
  DDM0001: [
    {
      id: "TDS001",
      type: "TDS",
      org: "Salesian Society, Chennai",
      tan: "CHEA24666F",
    },
    {
      id: "ITR001",
      type: "ITR",
      org: "Salesian Society, Chennai",
      pan: "AAFAA4567Q",
    },
  ],
};

export const documents = {
  TDS001: [
    "Deductee Entries",
    "Bank Details",
    "Challan Details",
    "Daily Entries",
  ],
  ITR001: ["ITR Form", "Acknowledgment", "Assessment Order"],
};

export const communities = [
  {
    id: "COMM001",
    name: "Community A",
    phone: "9000000001",
    email: "communitya@example.com",
  },
  {
    id: "COMM002",
    name: "Community B",
    phone: "9000000002",
    email: "communityb@example.com",
  },
];

export const societies = [
  {
    id: "SOC001",
    name: "Society A",
    phone: "8000000001",
    email: "societya@example.com",
  },
  {
    id: "SOC002",
    name: "Society B",
    phone: "8000000002",
    email: "societyb@example.com",
  },
];

const viewOptions = [
  { value: "DDM", label: "DDM-wise" },
  { value: "Community", label: "Community-wise" },
  { value: "Society", label: "Society-wise" },
];

const PortfolioReportView = () => {
  const [viewType, setViewType] = useState("DDM");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [ddmReportData, setDDMReportData] = useState([]);

  const queryParams = new URLSearchParams({
    ddm: viewType === "DDM" ? "true" : "false",
    community: viewType === "Community" ? "true" : "false",
    society: viewType === "Society" ? "true" : "false",
  });

  const apiUrl = `/reports/ddmWiseUserList?${queryParams.toString()}`;

  const getDDMReportData = useCallback(
    (search) => {
      setLoading(true);
      getAPI(apiUrl)
        .then((res) => {
          if (res?.data?.status) {
            setDDMReportData(res?.data?.data);
          } else {
            setDDMReportData([]);
          }
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setLoading(false);
          setDataLoading(false);
        });
    },
    [apiUrl]
  );

  useEffect(() => {
    getDDMReportData();
  }, [getDDMReportData]);

  const getData = () => {
    if (viewType === "DDM") return ddms;
    if (viewType === "Community") return communities;
    return societies;
  };

  const getColumns = () => {
    const commonColumns = [
      {
        name: "#",
        selector: (row, index) => index + 1,
        width: "60px",
        center: true,
      },
    ];

    const viewSpecificColumns = {
      DDM: [
        {
          name: "DDM Name",
          cell: (row) => (
            <label className="text-truncate" title={row.name}>
              {row?.name}
            </label>
          ),
          width: "180px",
        },
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
      ],
      Community: [
        {
          name: "Community Name",
          cell: (row) => (
            <label className="text-truncate" title={row.name}>
              {row?.name}
            </label>
          ),
          width: "250px",
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
        // {
        //     name: 'Community Place',
        //     cell: (row) => <label className='text-truncate' title={row.place}>{row?.place}</label>,
        //     width: '250px'
        // }
      ],
      Society: [
        {
          name: "Society Name",
          cell: (row) => (
            <label className="text-truncate" title={row.name}>
              {row?.name}
            </label>
          ),
          width: "250px",
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
      ],
    };

    const actionColumn = {
      name: "Show Managed Portfolios",
      cell: (row) => (
        <div className="report-buttons-group">
          <button
            className="report-button"
            onClick={() => handleShowPortfolios(row)}
          >
            Show Portfolios
          </button>
        </div>
      ),
      minWidth: "200px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      // grow: 2,
    };

    return [
      ...commonColumns,
      ...(viewSpecificColumns[viewType] || []),
      actionColumn,
    ];
  };

  const handleShowPortfolios = (row) => {
    const path = viewType.toLowerCase().replace(" ", "-");
    navigate(`/report/byPortfolioReport/portfolio-detail/${path}/${row?.id}`, {
      state: { tableData: row, viewType: path },
    });
  };

  const handleViewChange = (selectedOption) => {
    setViewType(selectedOption.value);
  };

  return (
    <div className="card p-4 pt-2 shadow">
      <div className="page-container">
        <div className="table-card">
          {/* Title Centered on Top of Table */}
          <div className="portfolio-table-title">
            <h5>List of {viewType}</h5>
          </div>

          {/* View Type Dropdown */}
          <div
            className="table-header d-flex align-items-center mb-3"
            style={{ gap: "10px" }}
          >
            <label htmlFor="viewSelect" className="form-label fw-bold mb-0">
              Choose View:
            </label>
            <div style={{ width: "210px" }}>
              <Select
                id="viewSelect"
                options={viewOptions}
                value={viewOptions.find((option) => option.value === viewType)}
                onChange={handleViewChange}
                classNamePrefix="react-select"
                placeholder="Select View"
              />
            </div>
          </div>
          <div className="card" style={{ margin: "7px" }}>
            {/* DataTable */}
            <DataTable
              columns={getColumns()}
              data={ddmReportData}
              customStyles={tableStyle}
              paginationRowsPerPageOptions={[25, 50, 75, 100]}
              pagination
              paginationServer
              // paginationTotalRows={totalRows}
              // paginationDefaultPage={pagination?.currentPage}
              // onChangePage={handlePageChange}
              // onChangeRowsPerPage={handlePerRowsChange}
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
  );
};
function PortfolioReport() {
  return (
    <Suspense>
      <Routes>
        {[
          { path: "/", element: PortfolioReportView },
          ...portfolioDetailRoutes,
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
export default PortfolioReport;
