import React, { Suspense, useContext } from 'react'
import DataTable from 'react-data-table-component';
import { formatDate, tableStyle } from '../../constant/Util';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { docsRoute, socialSectorRoutes } from '../../routes';
import { ContextProvider } from '../../App';

function SocialSectorView() {
  const navigate = useNavigate();
  const contextProp = useContext(ContextProvider);
  const data = [
    { id: 1, name: "Annual Report", type: 'Annual', date: formatDate(new Date()) },
    { id: 2, name: "Fire Service NOC", type: 'Annual', date: formatDate(new Date()) },
    { id: 3, name: "Building Stability Certificate – FORM D", type: 'Annual', date: formatDate(new Date()) },
    { id: 4, name: "Building Soundness Certificate", type: 'Annual', date: formatDate(new Date()) },
    { id: 5, name: "Bank Signature Change Confirmation", type: 'Annual', date: formatDate(new Date()) },
    { id: 6, name: "Sanitary Certificate", type: 'Annual', date: formatDate(new Date()) },
  ];
  const columns = [

    {
      name: 'Social Sector Categories',
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
      center: true,
      cell: (row) => {
        return (
          <>
            <div className="d-flex justify-content-between">
              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-info" onClick={() => { navigate('/nonfinancial/socialSector/socialSectorList', { state: { name: row.name } }) }} title='List'>
                    <i className="fa-solid fa-list"></i>
                  </button>
                </span>
              </div>


              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-success" title='Add' onClick={() => { navigate("/nonfinancial/socialSector/socialSectorAdd", { state: { name: row.name } }) }}>
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </span>
              </div>
              <div className="form_col ml-1">
                <span className="custum-group-table">
                  <button type="button" className="btn  btn-sm text-primary" title='Documents' onClick={() => { navigate("/nonfinancial/socialSector/docsview", { state: { name: row.name } }) }}>
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
        <div className="d-flex justify-content-between align-items-center p-2 bg-white">
          <div class="d-flex align-items-center gap-2">
            <button className='btn pb-0' type='button' onClick={() => navigate('/socialSector')}>
              <i className='fa-solid fa-circle-left fs-5' />
            </button>
            <h6 className="fw-bold text-dark mb-0">{contextProp.navState?.name}</h6>
          </div>
          <div className='d-flex justify-content-end col-10'>
            <div className="me-2 d-flex align-items-center">
              <button className='btn bnt-sm adminsearch-icon'>
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
              <input type="text" className="form-control adminsearch" placeholder="Search by category" title="Search by category" />
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

function SocialSector() {
  return (
    <Suspense>
      <Routes>
        {[{ path: '/', element: SocialSectorView }, ...socialSectorRoutes, ...docsRoute].map((route, index) => (
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

export default SocialSector