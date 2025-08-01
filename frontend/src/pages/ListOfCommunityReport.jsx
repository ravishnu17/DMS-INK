import React, {
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import DataTable from "react-data-table-component";
import { data, Route, Routes, useNavigate } from "react-router-dom";
import { tableStyle } from "../constant/Util";
import { communityDetailRoutes } from "../routes";
import { ContextProvider } from "../App";
import { getAPI } from "../constant/apiServices";
import Loader from "../constant/loader";

const ListOfCommunityReportView = () => {
  const contextProp = useContext(ContextProvider);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [ddmReportList, setDDMReportList] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [totalRows, setTotalRows] = useState(0);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;
  const AUTH_TOKEN = sessionStorage.getItem("token");

  const communityPermissions = permissions?.role_permissions?.community;

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

  const communityList = useCallback(
    (search) => {
      setLoading(true);
      if (search !== undefined) {
        getAPI(
          `/config/community?skip=${pagination?.skip}&limit=${pagination?.limit}&search=` +
            search
        )
          .then((res) => {
            if (res?.data?.status) {
              setCommunities(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setCommunities([]);
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
          `/config/community?skip=${pagination?.skip}&limit=${pagination?.limit}`
        )
          .then((res) => {
            if (res?.data?.status) {
              setCommunities(res?.data?.data);
              setTotalRows(res?.data?.total_count);
            } else {
              setCommunities([]);
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
    communityList();
  }, [communityList]);

  const handleView = (id) => {
    getCommunityDetails(id, "");
    setLoading(false);
  };

  const data = [
    {
      id: "DDM0001",
      name: "Fr. Grace Charles",
      house: "Andaman - DIYYA DON BOSCO",
      address: "Andaman - DIYYA DON BOSCO",
      ddm: "DDM0001 Gerard",
    },
    {
      id: "DDM0002",
      name: "Mr. A Maria Francis",
      house: "Mary Help of Christians Church, Polur",
      address: "Street 1, Polur, Chennai",
      ddm: "DDM0002 Jerome",
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
    {
      name: "Community Name",
      cell: (row) => (
        <label className="text-truncate" title={row.name}>
          {row?.name}
        </label>
      ),
      width: "350px",
    },
    {
      name: "Address",
      cell: (row) => (
        <label className="text-truncate" title={row.address}>
          {row?.address}
        </label>
      ),
      width: "450px",
    },
    // {
    //     name: 'DDM',
    //     cell: (row) => <label className='text-truncate' title={row.ddm}>{row?.ddm}</label>,
    //     width: '200px'
    // },
    {
      name: "List Community Docs",
      cell: (row) => (  
        <div className="report-buttons-group">
          <button
            className="report-button"
            onClick={() => handleReportClick("list", row?.id, row)}
          >
            List Related docs
          </button>
        </div>
      ),
      minWidth: "350px", // enough to contain 4 buttons
      grow: 2, // allow flex grow
    },
  ];

  const handleReportClick = (type, id, row) => {
    navigate(`/report/byListOfCommunityReport/cmddm-detail/${type}/${id}`, {
      state: { category: row },
    });
  };

  return (
    <>
      <div>
        <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
          <div className="p-2 col-lg-5 col-12">
            <h6 className="fw-bold mb-0">List of Communities</h6>
          </div>
        </div>
        <div className="card" style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={communities}
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
};
function ListOfCommunityReport() {
  return (
    <Suspense>
      <Routes>
        {[
          { path: "/", element: ListOfCommunityReportView },
          ...communityDetailRoutes,
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
export default ListOfCommunityReport;
