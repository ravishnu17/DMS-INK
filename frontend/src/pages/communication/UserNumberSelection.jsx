import React, { useCallback, useEffect, useRef, useState } from 'react'
import { getAPI } from '../../constant/apiServices';
import DataTable from 'react-data-table-component';
import './communication.css';
function UserNumberSelection({ setSelectUser, selectedRecipients, setSelectAll, handleRecipientSelection }) {
 // reference to track if recipient selection has been handled
  const hasHandledSelection = useRef(false);
  // state to store selected recipients
  const [selectedRows, setSelectedRows] = useState([]);
  // state to store user search term
  const [search, setSearch] = useState("");
  // state to store user options
  const [users, setUsers] = useState([]);
  // state to store total count of user options
  const [totalRows, setTotalRows] = useState(0);
  // state to store rows per page
  const [perPage, setPerPage] = useState(25);
  // state to store current page number
  const [currentPage, setCurrentPage] = useState(1);
  // state to track if data is loading
  const [loading, setLoading] = useState(false);



  /**
   * Fetches user options from the backend with pagination and search.
   * @async
   * @param {number} [page=currentPage] - The page number to fetch.
   * @param {number} [limit=perPage] - The number of records per page.
   * @param {string} [searchTerm=search] - The search term to filter users.
   * @returns {Promise<void>}
   */
  const fetchUsers = (page = currentPage, limit = perPage, searchTerm = search) => {
    setLoading(true);
    const skip = (page - 1) * limit;
    getAPI(`/access/users-options?search=${searchTerm}&skip=${skip}&limit=${limit}`)
      .then((res) => {
        if (res?.data?.status) {
            // console.log("res.data.data", res.data.data);
            
          setUsers(res.data.data);
          setTotalRows(res.data.total_count ?? res.data.data.length); // fallback if no count
          setLoading(false);
        } else {
          setLoading(false);
          console.error("Error fetching user options:", res?.data?.details);
        }
      })
      .catch((error) => {
        setLoading(false);
        console.error("Error fetching user options:", error);
      });
  };

  /**
   * Handles the selection or deselection of a row in the user table.
   * Updates the state of selected rows based on the checkbox status.
   * 
   * @param {Object} event - The event object from the checkbox input.
   * @param {Object} row - The row data object corresponding to the selected row.
   */
  const handleRowSelected = (event, row) => {
    // Updates the state of selected rows based on the checkbox status.
    // If the checkbox is unchecked, the row is removed from the selected rows.
    // If the checkbox is checked, the row is added to the selected rows.
    // console.log(event.target.checked, row);
    let status = event?.target?.checked
    if (status == false) {
      setSelectedRows(
        // Filter out the selected row from the current selected rows.
        selectedRows.filter(
          (recip) => recip.id != row.id
        )
      )
    } else {
      setSelectedRows(pre => ([...pre, row]))
    }

  };


  // Returns a boolean indicating if the row is selected based on the selected rows.
  const isRowSelected = useCallback(
    (row) => selectedRows.some((selected) => selected.id === row.id),
    [selectedRows]
  );
  // Handles page change event.
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  // Handles per rows change event.
  const handlePerRowsChange = (newPerPage, page) => {
    setPerPage(newPerPage);
    setCurrentPage(page);
  };


  // Reset the hasHandledSelection state when the users change.
  useEffect(() => {
    hasHandledSelection.current = false;
  }, [users]);

  // Update the selected rows when the selectedRecipients prop changes.
  useEffect(() => {
    setSelectedRows(selectedRecipients)
  }, [selectedRecipients]);

  // Fetch the users when the per page or current page changes.
  useEffect(() => {
    fetchUsers(currentPage);
  }, [perPage, currentPage]);


  const handleSearch = () => {
    setCurrentPage(1); // Reset to first page on search
    fetchUsers(1, perPage, search);
  };
  const columns = [
    {
      name: "",
      cell: (row) => (
        <input
          color="primary"
          type="checkbox"
          checked={isRowSelected(row)}
          onChange={(e) => { handleRowSelected(e, row) }}
        />
      ),
      button: true,
    },
    {
      name: "S.No.",
      selector: (row, index) => index + 1,
      width: "70px",
    },
    {
      name: "Name",
      selector: row => row.name,
      sortable: true,
    },
    {
      name: "Mobile Number",
      selector: (row) => row. mobile_no,
      sortable: true,
      cell: (row) => <div style={{ textAlign: 'left' }} > +{row?.mobile_country_code} {row?. mobile_no}</div>,
    },
  ];

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f7f7f7',
        fontWeight: 'bold',
      },
    },
    rows: {
      style: {
        minHeight: '45px',
        borderBottom: '1px solid #ddd',
        '&:hover': {
          backgroundColor: '#f1f1f1',
        },
      },
    },
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div

        style={{
          background: "white",
          borderRadius: "8px",
          padding: "16px",
          width: "60%",
        }}
      >
        <div className="d-flex mb-2 justify-content-between">

          <h5>Select Users</h5>
          <div className="d-flex mb-2 align-items-center justify-content-between">
            <div className="input-group mb-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search"
                className="form-control"
              />
              <div className="input-group-append">
                <button className="btn btn-sm btn-primary" onClick={handleSearch}>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border shadow-sm rounded" style={{ maxHeight: "250px", overflowY: "scroll" }}>
          <DataTable
            columns={columns}
            data={users}
            customStyles={customStyles}
            highlightOnHover
            striped
            responsive
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationPerPage={perPage}
            paginationDefaultPage={currentPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
          />
        </div>

        <div className="mt-4" style={{ textAlign: "right", margin: "10px" }}>
          <button
            className="btn btn-sm  btn-primary"
            onClick={() => {
              handleRecipientSelection(selectedRows);
              setSelectUser(false);
              if (selectedRows?.length != totalRows) {
                setSelectAll(false)
              } else {
                setSelectAll(true)
              }

            }}
          >
            Submit Selected
          </button>
          <button
            className="btn btn-sm btn-danger"
            style={{ marginLeft: "10px" }}
            onClick={() => setSelectUser(false)}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserNumberSelection