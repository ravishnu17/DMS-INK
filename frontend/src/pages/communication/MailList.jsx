import React, { Suspense, useContext, useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { emailRoutes } from "../../routes";
import { ContextProvider } from "../../App";
import axios from "axios";
import { deleteAPI, getAPI } from "../../constant/apiServices";
import Swal from "sweetalert2";
import Loader from "../../constant/loader";
import { tableStyle } from "../../constant/Util";

function MailListView() {
  const navigate = useNavigate();

  const contextProp = useContext(ContextProvider);  
  const currentUser = contextProp.currUser;
  const permissions = contextProp.permissions;
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const modulepermission = permissions?.role_permissions?.email;

  const [sentMails, setSentMails] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1); // Page number (starts from 1)
  const [perPage, setPerPage] = useState(10); // Items per page
  const [totalRows, setTotalRows] = useState(0); // Total items from backend

  const filteredMails = sentMails?.filter(
    (mail) =>
      mail.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mail.recipients.some((recipient) =>
        recipient.toLowerCase().includes(searchTerm.toLowerCase())
      )
  );
  const fetchMails = async (page = 1, limit = 10) => {
    setLoading(true);
    const skip = (page - 1) * limit;

    try {
      const response = await getAPI(
        `/communication/communications?type=mail&skip=${skip}&limit=${limit}`
      );
      const result = response?.data;

      // Format data
      const formatted = result?.data?.map((mail) => ({
        ...mail,
        timestamp: mail.sent_at ?? "N/A",
        sentBy: mail.sent_by ?? "Unknown",
        recipients: mail.recipients?.map((r) => r.email ?? r) || [],
        attachments: mail.attachments || [],
        status:
          mail.status.charAt(0).toUpperCase() +
          mail.status.slice(1).toLowerCase(),
      }));

      setSentMails(formatted);

      // You'll need to update the backend to return total count!
      setTotalRows(result?.total_count || 0);
    } catch (err) {
      console.error("Failed to fetch communications:", err);
    } finally {
      setLoading(false);
      setDataLoading(false);
    }
  };

  const handlePageChange = (page) => {
    setPage(page);
    fetchMails(page, perPage);
  };

  const handlePerRowsChange = async (newPerPage, page) => {
    setPerPage(newPerPage);
    setPage(page);
    fetchMails(page, newPerPage);
  };

  const deleteCommunication = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAPI(`/communication/communication_delete/${id}`)
          .then((res) => {
            if (res.data.status === true) {
              // delete message
              Swal.fire({
                toast: true,
                position: "top-end",
                icon: "success",
                title: "Deleted!",
                text: "Your file has been deleted.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: "#28a745", // success green
                color: "#fff",
              });

              const newMailList = sentMails.filter((mail) => mail.id !== id);
              setSentMails(newMailList);
            } else {
              Swal.fire({
                icon: "warning",
                title: "Something went wrong!",
                text: res.data.message || "Something went wrong!",
                confirmButtonText: "OK",
                background: "rgb(255, 255, 255)",
                color: "  #000000",
              });
            }
          })
          .catch((err) => {
            console.error(err);
          });
      }
    });
  };

  useEffect(() => {
    fetchMails(page, perPage);
  }, [page, perPage, currentUser, modulepermission]);

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
      name: "Subject",
      selector: (row) => row.subject || "No Data",
      sortable: true,
    },
    {
      name: "Recipients",
      selector: (row) => row.recipients?.join(", ") || "No Data",
      sortable: false,
    },
    {
      name: "Attachments",
      cell: (row) =>
        row.attachments.length > 0 ? (
          <div className="d-flex flex-wrap gap-1">
            {row.attachments.map((file, i) => (
              <span key={i} className="badge bg-primary me-1">
                {file?.filename?.length > 10
                  ? `${file?.filename.slice(0, 10)}...${file?.filename
                      .split(".")
                      .pop()}`
                  : file?.filename}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-muted">No Attachments</span>
        ),
    },
    {
      name: "Sent At",
      selector: (row) =>
        row.timestamp
          ? new Intl.DateTimeFormat("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(row.timestamp))
          : "No Data",
      sortable: true,
    },
    currentUser?.role?.name === "Admin" ||
      (currentUser?.role?.name === "Super Admin" && {
        name: "Sent By",
        selector: (row) => row?.sentBy ?? "Unknown",
        sortable: true,
        cell: (row) =>
          row.sentBy ? (
            <span>{row.sentBy}</span>
          ) : (
            <span className="text-muted">Unknown</span>
          ),
      }),
    {
      name: "Status",
      selector: (row) => row.status ?? "No Data",
      sortable: true,
      width: "100px",
      cell: (row) => (
        <span
          className={`badge ${
            row.status === "Sent"
              ? "bg-success"
              : row.status === "Draft"
              ? "bg-danger"
              : "bg-success"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: "Action",
      cell: (row) => (
        <>
          <div className="d-flex justify-content-between">
            {currentUser?.role?.name === "Admin" ||
            currentUser?.role?.name === "Super Admin" ||
            modulepermission?.view ? (
              <>
                <div className="form_col ml-1 d-flex">
                  {row.status === "Draft" && (
                    <div className="form_col ml-1">
                      <span className="custum-group-table">
                        <button
                          type="button"
                          className="btn  btn-sm text-warning"
                          title="Edit Draft"
                          onClick={() =>
                            navigate(`/communication/email/draft/${row.id}`)
                          }
                        >
                          <i className="fas fa-edit" aria-hidden="true" />
                        </button>
                      </span>
                    </div>
                  )}
                  <span className="custum-group-table">
                    <button
                      type="button"
                      className="btn  btn-sm text-info"
                      title="View"
                      onClick={() => navigate(`/communication/email/${row.id}`)}
                    >
                      <i className="fas fa-eye" aria-hidden="true" />
                    </button>
                  </span>
                  {row.status === "Draft" && (
                    <div className="form_col ml-1">
                      <span className="custum-group-table  ">
                        <button
                          type="button"
                          className="btn text-danger btn-sm"
                          title="Delete Draft"
                          onClick={() => deleteCommunication(row.id)}
                        >
                          <i className="fa fa-trash" aria-hidden="true" />
                        </button>
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </>
      ),
      button: true,
      width: "100px",
    },
  ];

  return (
    <div>
      <div className="d-flex justify-content-between p-2 bg-white">
        <div className="p-2">
          <h6 className="fw-bold mb-0">Mail List</h6>
        </div>
        <div className="d-flex justify-content-end col-10">
          {/* <div className="me-2 d-flex align-items-center">
            <button className="btn bnt-sm adminsearch-icon">
              <i className="fa fa-search " aria-hidden="true"></i>
            </button>
            <input
              type="text"
              className="form-control adminsearch"
              placeholder="Search by category"
              title="Search by category"
            />
          </div> */}
          {currentUser?.role?.name === "Admin" ||
          currentUser?.role?.name === "Super Admin" ? (
            <>
              <button
                className=" btn btn-sm btn-success px-4 adminBtn"
                onClick={() => navigate("/communication/email/compose-mail")}
              >
                Compose Email
              </button>
            </>
          ) : (
            <>
              {modulepermission?.add && (
                <button
                  className=" btn btn-sm btn-success px-4 adminBtn"
                  onClick={() => navigate("/communication/email/compose-mail")}
                >
                  Compose Email
                </button>
              )}
            </>
          )}
        </div>
      </div>
      <div className="card" style={{ margin: "7px" }}>
        <DataTable
          columns={columns}
          data={filteredMails}
          customStyles={tableStyle}
          pagination
          paginationServer // 👈 this enables backend pagination
          paginationTotalRows={totalRows} // total from backend
          onChangePage={handlePageChange} // page change handler
          onChangeRowsPerPage={handlePerRowsChange} // limit change handler
          highlightOnHover
          striped
          noDataComponent={
            !dataLoading && (
              <div className="text-center  py-4">No data found</div>
            )
          }
          responsive
        />
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
}

const MailList = () => {
  return (
    <Suspense>
      <Routes>
        {[{ path: "/", element: MailListView }, ...emailRoutes].map(
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

export default MailList;
