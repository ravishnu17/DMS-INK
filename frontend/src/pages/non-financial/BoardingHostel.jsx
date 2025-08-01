import React, { Suspense, useContext } from 'react'
import DataTable from 'react-data-table-component';
import { formatDate, tableStyle } from '../../constant/Util';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { boardingHostelRoutes, docsRoute } from '../../routes';
import { ContextProvider } from '../../App';

function BoardingHostelView() {
  const navigate = useNavigate();
  const contextProp = useContext(ContextProvider);
  const data = [
    { id: 1, name: "Fire Service NOC", type: 'Annual',date: formatDate(new Date()) },
    { id: 2, name: "Sanitary Certificate", type: 'Annual',date: formatDate(new Date()) },
    { id: 3, name: "Building Stability Certificate - FORM D",type: 'Annual', date: formatDate(new Date()) },
    { id: 4, name: "Building Soundness Certificate",type: 'Annual', date: formatDate(new Date()) },
    { id: 5, name: "Bank Signature Change Confirmation",type: 'Annual', date: formatDate(new Date()) },
  ];
  const columns = [
  
    {
      name: 'Boarding & Hostel Categories',
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
                  <button type="button" className="btn  btn-sm text-info" onClick={() => { navigate('/nonfinancial/boardingHostel/boardingHostelList', { state: { name: row.name } }) }} title='List'>
                    <i className="fa-solid fa-list"></i>
                  </button>
                </span>
              </div>


              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-success" title='Add' onClick={() => { navigate("/nonfinancial/boardingHostel/boardingHostelAdd", { state: { name: row.name } }) }}>
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </span>
              </div>
              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-primary" title='Documents' onClick={() => { navigate("/nonfinancial/boardingHostel/docsview", { state: { name: row.name } }) }}>
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
      <div className='p-2 bg-white'>
          <div className='row m-2'>
            <div className='col p-0'>
              <div className='d-flex align-items-center gap-2'>
                <button className='btn pb-0' type='button' onClick={() => navigate('/boardingHostel')}>
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

function BoardingHostel() {
  return (
    <Suspense>
      <Routes>
        {[{ path: '/', element: BoardingHostelView }, ...boardingHostelRoutes,...docsRoute].map((route, index) => (
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

export default BoardingHostel