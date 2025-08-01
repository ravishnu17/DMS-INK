import React, { Suspense, useContext } from 'react'
import DataTable from 'react-data-table-component';
import { formatDate, tableStyle } from '../../constant/Util';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { docsRoute, sociteyRoutes } from '../../routes';
import { ContextProvider } from '../../App';

function SocietyView() {
  const contextProp = useContext(ContextProvider);
  const navigate = useNavigate();
  const data = [
    { id: 1, name: "Memorandum", type: 'Permanent', date: formatDate(new Date()) },
    { id: 2, name: "12AA Certificate", type: 'Permanent', date: formatDate(new Date()) },
    { id: 3, name: "DARPAN", type: 'Permanent', date: formatDate(new Date()) },
    { id: 4, name: "FCRA Certificate", type: 'Permanent', date: formatDate(new Date()) },
    { id: 5, name: "PAN Number", type: 'Permanent', date: formatDate(new Date()) },
    { id: 6, name: "Society Registration Certificate", type: 'Permanent', date: formatDate(new Date()) },
    { id: 7, name: "TAN Number", type: 'Permanent', date: formatDate(new Date()) },
    { id: 8, name: "Society - Activity Report (Annual)", type: 'Annual', date: formatDate(new Date()) },
    { id: 9, name: "Society - Audit Statement", type: 'Quarter', date: formatDate(new Date()) },
    { id: 10, name: "Annual Bank Statements and Confirmation", type: 'Annual', date: formatDate(new Date()) },
    { id: 11, name: "Assets Ledger and Bills", type: 'Annual', date: formatDate(new Date()) },
    { id: 12, name: "Fixed Deposit Confirmation", type: 'Annual', date: formatDate(new Date()) },
    { id: 13, name: "Governing Body Members Details", type: 'Annual', date: formatDate(new Date()) },
    { id: 14, name: "Society - Governing Body Meeting Minutes", type: 'Annual', date: formatDate(new Date()) },
    { id: 15, name: "Society - Annual General Body Meeting Minutes", type: 'Annual', date: formatDate(new Date()) },
    { id: 16, name: "Society - Annual Renewal Receipt with Supporting Documents", type: 'Annual', date: formatDate(new Date()) },
    { id: 17, name: "Society - Extra-ordinary Annual General Body Meeting Minutes", type: 'Annual', date: formatDate(new Date()) },
    { id: 18, name: "Society - Extra-ordinary Annual General Body Meeting Minutes (Filed Copy with Supporting Documents)", type: 'Annual', date: formatDate(new Date()) },
    { id: 19, name: "Bank Signature Change Confirmation", type: 'Annual', date: formatDate(new Date()) },
    { id: 20, name: "Agreement with Contractors", type: 'Annual', date: formatDate(new Date()) },
    { id: 21, name: "CMDA / DTCP Approval", type: 'Annual', date: formatDate(new Date()) },
    { id: 22, name: "Water Tax", type: 'Annual', date: formatDate(new Date()) },
    { id: 23, name: "Property Tax", type: 'Annual', date: formatDate(new Date()) },
  ];

  const columns = [
    // {
    //   name: 'No',
    //   selector: row => row.id,
    //   width: '150px',
    // },
    {
      name: 'Society Categories',
      selector: row => row.name,
    },
    {
      name: 'Renewal Period',
      selector: row => row.type,
      cell: (row) => <div className={row.type !== 'Permanent' ? 'badge text-bg-info' : 'badge text-bg-warning'}>{row.type}</div>
    },
    {
      name: ' Last Updated Date',
      selector: row => row.date,
    },
    {
      name: "Action",
      cell: (row) => {
        return (
          <>
            <div className="d-flex justify-content-between">
              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-info" onClick={() => { navigate('/nonfinancial/society/societyList', { state: { name: row.name } }) }} title='List'>
                    <i className="fa-solid fa-list"></i>
                  </button>
                </span>
              </div>
              {row?.type !== 'Permanent' && <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-success" title='Add' onClick={() => { navigate("/nonfinancial/society/societyAdd", { state: { name: row.name } }) }}>
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </span>
              </div>}
              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-primary" title='Documents' onClick={() => { navigate("/nonfinancial/society/docsview", { state: { name: row.name } }) }}>
                    <i className="fa-solid fa-list-check"></i>
                  </button>
                </span>
              </div>
            </div>
          </>
        );
      },
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: '600px'
    }
  ];


  return (
    <>
      <div>

        {/* <div className="d-flex justify-content-between align-items-center m-2">
          <div >
            <h6 className='fw-bold mb-0'>Society</h6>
          </div>
          <div className='d-flex justify-content-end col-10'>
            <div className="col-md-4 me-2 d-flex">
              <select className="form-control form-select" >
                <option value="">Select society</option>
                <option value="Society1">Society 1</option>
                <option value="Society2">Society 2</option>
                <option value="Society3">Society 3</option>
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
        <div className='p-2 bg-white'>
          <div className='row m-2'>
            <div className='col p-0'>
              <div className='d-flex align-items-center gap-2'>
                <button className='btn pb-0' type='button' onClick={() => navigate('/society')}>
                  <i className='fa-solid fa-circle-left fs-5' />
                </button>
                <h6 className="fw-bold text-dark mb-0">{contextProp.navState?.name}</h6>
                <div />
              </div>
            </div>
            <div className='col p-0'>
              <div className='d-flex justify-content-end'>
                <div className="me-2 d-flex align-items-center">
                  <button className='btn bnt-sm adminsearch-icon'>
                    <i className="fa fa-search " aria-hidden="true"></i>
                  </button>
                  <input type="text" className="form-control adminsearch" placeholder="Search by category" title="Search by category" />

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

function Society() {
  return (
    <Suspense>
      <Routes>
        {[{ path: '/', element: SocietyView }, ...sociteyRoutes, ...docsRoute].map((route, index) => (
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

export default Society