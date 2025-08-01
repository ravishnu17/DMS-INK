import React, { Suspense, useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { smsRoutes } from "../../routes";
import { ContextProvider } from "../../App";
import { tableStyle } from "../../constant/Util";
import { use } from "react";
import { getAPI } from "../../constant/apiServices";
import { get } from "react-hook-form";

import Loader from "../../constant/loader"; // Add this import

function SmsListView() {
  const navigate = useNavigate();

  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;

  const modulepermission = permissions?.role_permissions?.sms;

  const [sentSms, setSentSms] = useState([]);

  const [loading, setLoading] = useState(false); // Add loading state
  const [dataLoading, setDataLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });

  // const filteredSms = sentSms.filter(sms =>
  //   sms.recipient.includes(searchTerm) || sms.message.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  useEffect(() => {
    getSmsList();
  }, []);
  useEffect(() => {
    getSmsList();
  }, [searchTerm]);

  const getSmsList = () => {
    setLoading(true); // Set loading state
    if (searchTerm) {
      getAPI(
        `communication/communications?type=sms&search=${searchTerm}&skip=${pagination?.skip}&limit=${pagination?.limit}`
      ).then((res) => {
        if (res?.data?.status) {
          // console.log("res", res?.data?.data);

          const formattedData = res?.data?.data.map((item) => ({
            id: item.id,
            recipient: item.recipients.map((r) => r.name).join(", "), // or r.phone_number
            message: item.content,
            timestamp: item.sent_at,
          }));

          setTotalRows(res?.data?.total_count);
          setSentSms(formattedData);
        } else {
          setSentSms([]);
          console.error("Error fetching SMS list:", res?.data?.details);
        }
        setLoading(false); // Reset loading state
        setDataLoading(false);
      });
    } else {
      getAPI(
        `communication/communications?type=sms&skip=${pagination?.skip}&limit=${pagination?.limit}`
      ).then((res) => {
        if (res?.data?.status) {
          //  console.log("res", res?.data);
          const formattedData = res?.data?.data.map((item) => ({
            id: item.id,
            recipient: item.recipients.map((r) => r.name).join(", "), // or r.phone_number
            message: item.content,
            timestamp: item.sent_at,
          }));
          setTotalRows(res?.data?.total_count);
          setSentSms(formattedData);
        } else {
          setSentSms([]);
          console.error("Error fetching SMS list:", res?.data?.details);
        }
        setLoading(false); // Reset loading state
        setDataLoading(false);
      });
    }
  };
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
      skip: (page - 1) * prev.limit,
    }));
  };

  const handlePerRowsChange = (newLimit, page) => {
    setPagination({
      currentPage: 1,
      skip: 0,
      limit: newLimit,
    });
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const customStyles = {
    headRow: {
      style: {
        // minHeight: '30px'
      },
    },
    headCells: {
      style: {
        fontSize: "13px",
        fontWeight: "bold",
      },
    },
    rows: {
      style: {
        borderBottom: "1px solid lightgray",
        padding: "3px",
        "&:hover": {
          boxShadow: "0px 1px 6px 2px #cfcfcf",
          cursor: "pointer",
          backgroundColor: "#f5f5f5",
        },
      },
    },
    cells: {
      style: {
        // fontSize: '12px',
      },
    },
    pagination: {
      style: {
        minHeight: "30px",
      },
    },
  };

  const columns = [
    // {
    //   name: '#',
    //   selector: (row, index) => index + 1,
    //   sortable: true,
    //   width: '60px'
    // },
    {
      name: "Recipient",
      selector: (row) => row.recipient,
      sortable: true,
    },
    {
      name: "Message",
      selector: (row) => row.message,
      sortable: false,
    },
    {
      name: "Sent At",
      selector: (row) => formatDateTime(row.timestamp),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            {currentUser?.role?.name === "Admin" ||
            currentUser?.role?.name === "Super Admin" ? (
              <>
                <div className="form_col ml-1">
                  <span className="custum-group-table">
                    <button
                      type="button"
                      className="btn  btn-sm text-info"
                      title="View"
                      onClick={() => navigate(`/communication/sms/${row.id}`)}
                    >
                      <i className="fas fa-eye" aria-hidden="true" />
                    </button>
                  </span>
                </div>
              </>
            ) : (
              <>
                {modulepermission?.view && (
                  <div className="form_col ml-1">
                    <span className="custum-group-table">
                      <button
                        type="button"
                        className="btn  btn-sm text-info"
                        title="View"
                        onClick={() => navigate(`/communication/sms/${row.id}`)}
                      >
                        <i className="fas fa-eye" aria-hidden="true" />
                      </button>
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ),
      ignoreRowClick: true,
      button: true,
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between p-2 bg-white">
        <div className="p-2">
          <h6 className="fw-bold mb-0">SMS List</h6>
        </div>

        <div className="d-flex justify-content-end col-10">
          <div className="me-2 d-flex align-items-center">
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by category"
              title="Search by category"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          {currentUser?.role?.name === "Admin" ||
          currentUser?.role?.name === "Super Admin" ? (
            <>
              <button
                className=" btn btn-sm btn-success px-4 adminBtn"
                onClick={() => navigate("/communication/sms/compose-sms")}
              >
                Send SMS
              </button>
            </>
          ) : (
            <>
              {modulepermission?.add && (
                <button
                  className=" btn btn-sm btn-success px-4 adminBtn"
                  onClick={() => navigate("/communication/sms/compose-sms")}
                >
                  Send SMS
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="card" style={{ margin: "7px" }}>
        <DataTable
          columns={columns}
          data={sentSms}
          customStyles={tableStyle}
          pagination
          paginationServer
          paginationTotalRows={totalRows}
          paginationDefaultPage={pagination.currentPage}
          paginationPerPage={pagination.limit}
          paginationRowsPerPageOptions={[25, 50, 75, 100]}
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
        />
      </div>
      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "300px" }}
        >
          <Loader />
        </div>
      )}
    </div>
  );
}

const SmsList = () => {
  return (
    <Suspense>
      <Routes>
        {[{ path: "/", element: SmsListView }, ...smsRoutes].map(
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

export default SmsList;
