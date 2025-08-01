import React, { Suspense } from "react";
import DataTable from "react-data-table-component";
import { formatDate, tableStyle } from "../../constant/Util";
import { Route, Routes, useNavigate } from "react-router-dom";
import { docsRoute, itrRoutes } from "../../routes";
import { ContextProvider } from "../../App";

function ITRView() {
  const contextProp = useContext(ContextProvider);
  const navigate = useNavigate();
  const columns = [
    {
      name: "ITR Categories",
      selector: (row) => row.name,
    },
    {
      name: "Renewal Period",
      selector: (row) => row.type,
      cell: (row) => (
        <div
          className={
            row.type !== "Permanent"
              ? "badge text-bg-info"
              : "badge text-bg-warning"
          }
        >
          {row.type}
        </div>
      ),
    },
    {
      name: " Last Updated Date",
      selector: (row) => row.date,
    },

    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-info"
                  onClick={() => {
                    navigate("/financial/itr/itrList", {
                      state: { name: row.name },
                    });
                  }}
                  title="List"
                >
                  <i className="fa-solid fa-list"></i>
                </button>
              </span>
            </div>

            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-success"
                  title="Add"
                  onClick={() => {
                    navigate("/financial/itr/itrAdd", {
                      state: { name: row.name },
                    });
                  }}
                >
                  <i className="fa-solid fa-plus"></i>
                </button>
              </span>
            </div>
            <div className="form_col ml-1">
              <span className="custum-group-table">
                <button
                  type="button"
                  className="btn  btn-sm text-primary"
                  title="Documents"
                  onClick={() => {
                    navigate("/financial/itr/docsview", {
                      state: { name: row.name },
                    });
                  }}
                >
                  <i className="fa-solid fa-list-check"></i>
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

  const data = [
    {
      id: 1,
      name: "ITR Computation",
      type: "Month",
      date: formatDate(new Date()),
    },
    {
      id: 2,
      name: "ITR - V (Verification)",
      type: "Month",
      date: formatDate(new Date()),
    },
    {
      id: 3,
      name: "ITR Form VII",
      type: "Month",
      date: formatDate(new Date()),
    },
    {
      id: 4,
      name: "ITR Form 10B",
      type: "Annual",
      date: formatDate(new Date()),
    },
    {
      id: 5,
      name: "ITR Form 9A",
      type: "Annual",
      date: formatDate(new Date()),
    },
    {
      id: 6,
      name: "ITR Form 10",
      type: "Annual",
      date: formatDate(new Date()),
    },
    {
      id: 7,
      name: "ITR Form VII Approval",
      type: "Annual",
      date: formatDate(new Date()),
    },
  ];

  return (
    <>
      <div>
        {/* <div className="d-flex justify-content-between align-items-center m-2">
          <div>
            <h6 className='fw-bold mb-0'>ITR</h6>
          </div>
          <div className='d-flex justify-content-end col-10'>
            <div className="col-md-4 me-2 d-flex">
              <select className="form-control form-select" >
                <option value="">Select Enitity</option>
                <option value="Enitity1">Enitity1</option>
                <option value="Enitity2">Enitity2</option>
                <option value="Enitity3">Enitity3</option>
              </select>
            </div>
            <div className="me-2 d-flex align-items-center">
              <input type="text" className="form-control adminsearch" placeholder="Search by category" title="Search by category" />
              <button className='btn bnt-sm adminsearch-icon'>
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </div> */}
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
                  ITR - {contextProp?.navState?.name}
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

function ITR() {
  return (
    <Suspense>
      <Routes>
        {[{ path: "/", element: ITRView }, ...itrRoutes, ...docsRoute].map(
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

export default ITR;
