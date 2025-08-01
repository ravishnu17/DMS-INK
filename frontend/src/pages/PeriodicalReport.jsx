import React, { Suspense, useCallback, useEffect, useState } from "react";
import { getAPI } from "../constant/apiServices";
import Swal from "sweetalert2";
import Loader from "../constant/loader";
import { Route, Routes, useNavigate } from "react-router-dom";
import { prCategoryDetailRoutes } from "../routes";

function PeriodicalReportView() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [prReportList, setPrReportList] = useState([]);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? prReportList : prReportList.slice(0, 3);
  const [expandedCards, setExpandedCards] = useState({});

  const getprReportList = useCallback(
    (search) => {
      setLoading(true);
      if (search !== undefined) {
        getAPI(`/reports/periodicallist` + search)
          .then((res) => {
            if (res?.data?.status) {
              setPrReportList(res?.data?.data);
            } else {
              setPrReportList([]);
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
        getAPI(`/reports/periodicallist`)
          .then((res) => {
            if (res?.data?.status) {
              setPrReportList(res?.data?.data);
            } else {
              setPrReportList([]);
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
    getprReportList();
  }, [getprReportList]);

  const handleEditTemp = (event, row, category) => {
    event.stopPropagation();
  };
  const handleViewTemp = (e, row) => {
    e.preventDefault();
  };
  // On delete message
  const onDeletePrReport = (event, item) => {
    event.stopPropagation();
    Swal.fire({
      title: "Are you sure?",
      text: "Are you sure you want to delete?",
      showDenyButton: false,
      showCancelButton: true,
      showConfirmButton: true,
      cancelButtonText: "No, go back",
      confirmButtonText: "Delete User",
      denyButtonText: "Don't",
      icon: "warning",
      reverseButtons: true,
      confirmButtonColor: "rgb(244, 91, 91)",
    }).then((result) => {
      if (result.isConfirmed) {
      } else if (result.isDenied) {
      }
    });
  };

  const toggleCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const buttonStyle = {
    padding: "10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    backgroundColor: "#f8f8f8",
    cursor: "pointer",
    fontSize: "14px",
  };

  const handleBoxClick = (category, itemCategory) => {
    navigate("/report/byPeriodicalReport/category-detail", {
      state: { category, itemCategory },
    });
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
          <div className="p-2 col-lg-5 col-12">
            <h6 className="fw-bold mb-0">Periodical Report</h6>
          </div>
          <div className=" d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1">
            <div className="me-2 d-flex align-items-center  ">
              {/* <button className='btn bnt-sm adminsearch-icon'>
                <i className="fa fa-search " aria-hidden="true"></i>
              </button> */}
              {/* <input type="text" className="form-control adminsearch  " placeholder="Search by Code, Name, Place, District" title="Search" onChange={(e) => getprReportList(e.target.value)} /> */}
            </div>
          </div>
        </div>

        {dataLoading ? (
          <div className="text-center py-4">No data found</div>
        ) : (
          <div className="row mt-2 mr-1">
            {prReportList?.map((data) => (
              <div key={data?.id} className="col-sm-3 mb-3">
                <div
                  className="card w-100 h-100 mb-2 shadow-sm"
                  style={{ borderRadius: "10px", overflow: "hidden" }}
                >
                  {/* Header with separate color */}
                  <div
                    className="card-header text-white"
                    style={{ backgroundColor: "#007bff" }}
                  >
                    <h5 className="card-title mb-0 font-weight-bold text-ellipse_title">
                      {data?.name}
                    </h5>
                  </div>

                  {/* Scrollable body */}
                  <div
                    className="card-body"
                    style={{ maxHeight: "200px", overflowY: "auto" }}
                  >
                    <div style={{ textAlign: "left" }}>
                      {data?.portfolio_category_map?.map((item) => (
                        <button
                          key={item?.id}
                          style={{
                            ...buttonStyle,
                            width: "100%",
                            textAlign: "left",
                            marginBottom: "10px",
                          }}
                          onClick={() => handleBoxClick(data, item)}
                        >
                          {item?.category?.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

function PeriodicalReport() {
  return (
    <Suspense>
      <Routes>
        {[
          { path: "/", element: PeriodicalReportView },
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

export default PeriodicalReport;
