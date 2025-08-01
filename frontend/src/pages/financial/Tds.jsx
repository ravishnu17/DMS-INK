import React, { Suspense, useContext } from "react";
import DataTable from "react-data-table-component";
import { formatDate, tableStyle } from "../../constant/Util";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { docsRoute, tdsRoutes } from "../../routes";
import { date } from "yup";
import { ContextProvider } from "../../App";

function TdsView() {
  const contextProp = useContext(ContextProvider);
  const navigate = useNavigate();
  const location = useLocation();

  // Get the navigation state
  const navState = location.state || {};
  const data = [
    {
      id: 1,
      communityname: "Community 1",
      tdsname: "TDS on Contractors",
      tdsnumber: "TANABCD12345",
      section: "194C",
      rate: "1%",
      incharge: "Ajith",
      viewer: "Mani",
      lastUpdated: "2023-05-15",
      status: "Active",
    },
    {
      id: 2,
      communityname: "Community 2",
      tdsname: "TDS on Rent",
      tdsnumber: "TANEFGH67890",
      section: "194I",
      rate: "10%",
      incharge: "Kumar",
      viewer: "Ravi",
      lastUpdated: "2023-06-20",
      status: "Active",
    },
    {
      id: 3,
      communityname: "Community 3",
      tdsname: "TDS on Professional Fees",
      tdsnumber: "TANIJKL54321",
      section: "194J",
      rate: "10%",
      incharge: "Suresh",
      viewer: "Gopi",
      lastUpdated: "2023-07-10",
      status: "Inactive",
    },
  ];

  const columns = [
    {
      name: "Community",
      selector: (row) => row.communityname,
      sortable: true,
      width: "150px",
    },
    {
      name: "TDS Name",
      selector: (row) => row.tdsname,
      sortable: true,
    },
    {
      name: "TDS Number",
      selector: (row) => row.tdsnumber,
      sortable: true,
      cell: (row) => <span className="font-monospace">{row.tdsnumber}</span>,
    },
    // {
    //   name: 'Section',
    //   selector: row => row.section,
    //   sortable: true,
    //   cell: row => <span className="badge bg-info">{row.section}</span>
    // },
    // {
    //   name: 'Rate',
    //   selector: row => row.rate,
    //   sortable: true
    // },
    {
      name: "Incharge",
      selector: (row) => row.incharge,
      sortable: true,
    },
    {
      name: "Viewer",
      selector: (row) => row.viewer,
      sortable: true,
    },
    // {
    //   name: 'Status',
    //   selector: row => row.status,
    //   sortable: true,
    //   cell: row => (
    //     <span className={`badge ${
    //       row.status === 'Active' ? 'bg-success' : 'bg-secondary'
    //     }`}>
    //       {row.status}
    //     </span>
    //   )
    // },
    {
      name: "Action",
      width: "300px",
      cell: (row) => (
        <div className="d-flex justify-content-between">
          <div className="form_col ml-1">
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
                // onClick={() => navigate(`/financial/esi/add/${row.id}`, { state: row })}
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
      ),
      ignoreRowClick: true,
      allowOverflow: true,
      width: "120px",
    },
  ];

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
                  {navState?.name} -TDS{" "}
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
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
            noDataComponent={
              <div className="text-center py-4">No data found</div>
            }
          />
        </div>
      </div>
    </>
  );
}

const Tds = () => {
  return (
    <Suspense>
      <Routes>
        {[{ path: "/", element: TdsView }, ...tdsRoutes, ...docsRoute].map(
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
};

export default Tds;
