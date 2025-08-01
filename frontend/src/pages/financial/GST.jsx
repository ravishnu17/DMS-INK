import React, { Suspense, useContext } from 'react'
import DataTable from 'react-data-table-component';
import { formatDate, tableStyle } from '../../constant/Util';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { docsRoute, gstRoutes } from '../../routes';
import { ContextProvider } from '../../App';

function GSTView() {
  const contextProp = useContext(ContextProvider);
  const navigate = useNavigate();
  const location = useLocation()

  // Get the navigation state
  const navState = location.state || {}
  const data = [
    {
      id: 1,
      communityname: 'Community 1',
      gstnumber: "22ABCDE1234F1Z5",
      gstname: "GST Name 1",
      incharge: 'Ajith',
      viewer: 'Mani',
      lastUpdated: '2023-05-15',

    },
    {
      id: 2,
      communityname: 'Community 2',
      gstname: "GST Name 2",
      gstnumber: "33FGHIJ5678K2M9",
      registrationtype: "Composition",
      incharge: 'Kumar',
      viewer: 'Ravi',
      lastUpdated: '2023-06-20',
      status: 'Active'
    },
    {
      id: 3,
      communityname: 'Community 3',
      gstname: "GST Name 3",
      gstnumber: "44NOPQR9012S3T4",

      registrationtype: "Regular",
      incharge: 'Suresh',
      viewer: 'Gopi',
      lastUpdated: '2023-07-10',
      status: 'Inactive'
    }
  ];



  const columns = [
    {
      name: 'Community',
      selector: row => row.communityname,
      sortable: true,
      width: '150px'
    },
    {
      name: 'Gst Name',
      selector: row => row.gstname,
      sortable: true
    },
    {
      name: 'GST Number',
      selector: row => row.gstnumber,
      sortable: true,
      cell: row => <span className="font-monospace">{row.gstnumber}</span>
    },

    {
      name: 'Incharge',
      selector: row => row.incharge,
      sortable: true
    },
    {
      name: 'Viewer',
      selector: row => row.viewer,
      sortable: true
    },

    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex justify-content-between">
          <div className="form_col ml-1">
            <span className="custum-group-table">
              <button
                type="button"
                className="btn btn-sm gap-1"
                title="Add Manage files"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                  backgroundColor: '#0d6efd',
                  gap: '6px',
                  fontWeight: 500
                }}
              // onClick={() => navigate(`/financial/esi/add/${row.id}`, { state: row })}
              >
                <i className="fa-solid fa-circle-plus" style={{ color: 'white' }}></i>
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
      width: '120px'
    }
  ];

  return (
    <>
      <div >
        <div className='p-2 bg-white'>
          <div className='row m-2'>
            <div className='col p-0'>
              <div className='d-flex align-items-center gap-2'>
                <button className='btn pb-0' type='button' onClick={() => navigate(-1)}>
                  <i className='fa-solid fa-circle-left fs-5' />
                </button>
                <h6 className="fw-bold text-dark mb-0"> {navState?.name} - GST</h6>
                <div />
              </div>
            </div>
            <div className='col p-0'>
              <div className='d-flex justify-content-end'>
                <div className="me-2 d-flex align-items-center">
                  <input type="text" className="form-control adminsearch" placeholder="Search by category" title="Search by category" />
                  <button className='btn bnt-sm adminsearch-icon'>
                    <i className="fa fa-search " aria-hidden="true"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={data}
            customStyles={tableStyle}
            pagination
          />
        </div>
      </div>
    </>
  )


}
function GST() {
  return (
    <Suspense>
      <Routes>
        {[{ path: '/', element: GSTView }, ...gstRoutes, ...docsRoute].map((route, index) => (
          route.element && <Route
            key={index}
            path={route.path}
            element={<route.element />}
          />
        ))}
      </Routes>
    </Suspense>
  )
}

export default GST