import React, { Suspense, useContext } from 'react'
import DataTable from 'react-data-table-component';
import { formatDate, tableStyle } from '../../constant/Util';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { docsRoute, technicalInstituteRoutes } from '../../routes';
import { ContextProvider } from '../../App';

function TechnicalInstituteView() {
  const contextProp = useContext(ContextProvider);
  const navigate = useNavigate();
  const data = [
    { id: 1, name: "Annual Audit Statement", type: 'Annual', date: formatDate(new Date()) },
    { id: 2, name: "Fire Service NOC",  type: 'Annual',date: formatDate(new Date()) },
    { id: 3, name: "Bank Signature Change Confirmation",  type: 'Annual',date: formatDate(new Date()) },
    { id: 4, name: "Minority Certificate", type: 'Annual', date: formatDate(new Date()) },
    { id: 5, name: "Building Stability Certificate - FORM D", type: 'Annual', date: formatDate(new Date()) },
    { id: 6, name: "Building Soundness Certificate", type: 'Annual', date: formatDate(new Date()) },
    { id: 7, name: "Sanitary Certificate", type: 'Annual', date: formatDate(new Date()) },
    { id: 8, name: "AICTE Approval",  type: 'Annual',date: formatDate(new Date()) },
    { id: 9, name: "DOTE Approval", type: 'Annual', date: formatDate(new Date()) },
  ];
  const columns = [
   
    {
      name: 'Technical Institute Categories', // Updated label
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
                  <button type="button" className="btn btn-sm text-info" onClick={() => { navigate('/nonfinancial/technicalInstitute/technicalInstituteList', { state: { name: row.name } }) }} title='List'>
                    <i className="fa-solid fa-list"></i>
                  </button>
                </span>
              </div>

              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn btn-sm text-success" title='Add' onClick={() => { navigate("/nonfinancial/technicalInstitute/technicalInstituteAdd", { state: { name: row.name } }) }}>
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </span>
              </div>
              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-primary" title='Documents' onClick={() => { navigate("/nonfinancial/technicalInstitute/docsview", { state: { name: row.name } }) }}>
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
      <div >
      <div className='p-2 bg-white'>
          <div className='row m-2'>
            <div className='col p-0'>
              <div className='d-flex align-items-center gap-2'>
                <button className='btn pb-0' type='button' onClick={() => navigate('/technicalInstitute')}>
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

function TechnicalInstitute() {
  return (
    <Suspense>
      <Routes>
        {[{ path: '/', element: TechnicalInstituteView }, ...technicalInstituteRoutes,...docsRoute].map((route, index) => (
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

export default TechnicalInstitute
