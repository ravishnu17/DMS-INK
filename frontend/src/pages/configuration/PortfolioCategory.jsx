import React, { Suspense, useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import { handlePageChange, handlePerRowsChange, tableStyle } from '../../constant/Util';
import { Route, Routes, useNavigate } from 'react-router-dom';



import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from 'sweetalert2';
import { addUpdateAPI, deleteAPI, getAPI } from '../../constant/apiServices';
import Select from 'react-select';
import { portfolioCategoryRoutes } from '../../routes';
import { ContextProvider } from '../../App';
import Loader from '../../constant/loader';

function PortfolioCategoryList() {
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const [portfolioList, setPortfolioList] = useState([]);
  const [portfoliotype, setPortfoliotype] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSerarch] = useState('');
  const [skip, setSkip] = useState(0);
  const [limit, setLimit] = useState(25);
  const [totalRows, setTotalRows] = useState(0);
  const [selectedPortfolio, setSelectedPortfolio] = useState(null);
  const [financialPortfolio, setFinancialPortfolio] = useState([]);
  const [selectedMapp, setSelectedMap] = useState({});

  const contextProp = useContext(ContextProvider);
  const currentUser = contextProp?.currUser;
  const permissions = contextProp?.permissions;

  const modulepermission = permissions?.role_permissions?.[`portfolio category`];

  const schema = yup.object().shape({
    name: yup.string().required("Portfolio is required"),
    type: yup.object().required("Type is required"),
  });

  const { control, register, handleSubmit, reset, formState: { errors } } = useForm({ resolver: yupResolver(schema) });

  const getPortfolioList = () => {
    setLoading(true);
    getAPI(`/category/mapp?skip=${skip}&limit=${limit}&search=${search}`).then((res) => {
      if (res?.data?.status) {
        setPortfolioList(res?.data?.data);
        setTotalRows(res?.data?.total_count);
      } else {
        setPortfolioList([])
        setTotalRows(0)
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setLoading(false)
    })
  }

  const financialPortfolioList = () => {
    setLoading(true)
    getAPI(`/config/portfolio?skip=${0}&limit=${0}&type=Financial`).then((res) => {
      if (res?.data?.status) {
        setFinancialPortfolio(res?.data?.data);
      } else {
        setFinancialPortfolio([])
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => setLoading(false));
  }

  const getMapping = () => {
    getAPI(`/config/financial_map/${selectedPortfolio?.id}`).then((res) => {
      if (res?.data?.status) {
        setSelectedMap(res?.data?.data);
      } else {
        setSelectedMap([])
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => setLoading(false));
  }

  const portfolioType = () => {
    setLoading(true)
    getAPI("/config/portfolioType").then((res) => {
      if (res?.data.status) {
        setPortfoliotype(res?.data?.data);
      }
    }).catch((err) => {
      console.log(err);
    }).finally(() => {
      setLoading(false)
    });
  }

  const addPortfolio = (data) => {
    setLoading(true);
    addUpdateAPI('POST', '/config/portfolio', { name: data.name, type: data.type?.value }).then((res) => {
      if (res?.data?.status) {
        getPortfolioList();
        setLoading(false);
        document.getElementById('modal-close').click();
        //success
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Creeated!',
          text: res?.data?.details || 'Success',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: ' #28a745',
          color: '  #ffff'
        });

      } else {
        setLoading(false);
        //error
        Swal.fire({
          icon: "warning",
          title: 'Something went wrong!',
          text: res?.data?.details || 'Something went wrong!',
          confirmButtonText: 'OK',
          background: 'rgb(255, 255, 255)',
          color: '  #000000'
        });
      }
    })
  }

  const deletePortfolio = (id) => {
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
        deleteAPI('/config/portfolio/' + id).then((res) => {
          if (res?.data.status) {
            getPortfolioList();
            setLoading(false);
            // delete message
            Swal.fire({
              toast: true,
              position: 'top-end',
              icon: 'success',
              title: 'Deleted!',
              text: res.data.details,
              showConfirmButton: false,
              timer: 3000,
              timerProgressBar: true,
              background: '#28a745',  // success green
              color: '#fff'
            });

          } else {
            Swal.fire({
              icon: "warning",
              title: 'Something went wrong!',
              text: res?.data?.details || 'Something went wrong!',
              confirmButtonText: 'OK',
              background: 'rgb(255, 255, 255)',
              color: '  #000000'
            });
          }
        })
      }
    })
  }
  const updatedSelectedMapp = (event, id) => {
    let temp = { ...selectedMapp };
    let index = temp?.financial_name?.findIndex(i => i.portfolio_id === id);
    if (index === -1) {
      temp?.financial_name.push({ portfolio_id: id });
    } else {
      temp?.financial_name.splice(index, 1);
    }

    setSelectedMap(temp);

  }

  const updateMapp = () => {
    setLoading(true);
    const apiData = {
      "non_financial_portfolio_id": selectedPortfolio?.id,
      "financial_portfolio_id": selectedMapp?.financial_name?.map(i => i?.portfolio_id)
    }

    addUpdateAPI('POST', '/config/financial_map', apiData).then((res) => {
      if (res?.data?.status) {
        setFinancialPortfolio();
        setSelectedPortfolio(null);
        setSelectedMap({});
        getPortfolioList();
        document.getElementById('closeModal').click();
        //success
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: 'Mapping Updated!',
          text: res?.data?.details || 'Success',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: ' #28a745',
          color: '  #ffff'
        });

      } else {
        setLoading(false);
        //error
        Swal.fire({
          icon: "warning",
          title: 'Something went wrong!',
          text: res?.data?.details || 'Something went wrong!',
          confirmButtonText: 'OK',
          background: 'rgb(255, 255, 255)',
          color: '  #000000'
        });
      }
    }).catch((err) => {
      setLoading(false);
      console.log(err);
      Swal.fire({
        icon: "warning",
        title: 'Something went wrong!',
        text: res?.data?.details || 'Something went wrong!',
        confirmButtonText: 'OK',
        background: 'rgb(255, 255, 255)',
        color: '  #000000'
      });
    });
  }

  const columns = [

    {
      name: 'Portfolio',
      selector: row => row.name,
    },
    {
      name: 'Category count',
      selector: row => row.category_count,
    },
    {
      name: 'Financial mapped count',
      selector: row => row.mapped_count,
    },
    {
      name: "Action",
      cell: (row) => {
        return (
          <>
            <div className="d-flex justify-content-between">
              {
                currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ?

                  <>
                    <div className="form_col ml-1">
                      {row?.type === "Non Financial" ? <span className="custum-group-table" >
                        <button type="button" className="btn  btn-sm text-success" title='Map Financial portfolio' data-bs-toggle="modal" data-bs-target="#mappModal" onClick={() => setSelectedPortfolio(row)}>
                          <i className="fas fa-link" />
                        </button>
                      </span>
                        :
                        <div className="form_col px-3" />
                      }
                    </div>
                    <div className="form_col ml-1">
                      <span className="custum-group-table" >
                        <button type="button" className="btn  btn-sm text-success" title='Update' onClick={() => navigate('/config/portfolioCategory/mapcategory', { state: { data: row } })}>
                          <i className="fas fa-edit" />
                        </button>
                      </span>
                    </div>
                    <div className="form_col">
                      <span className="custum-group-table  ">
                        <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletePortfolio(row.id)}  >
                          <i className="fa fa-trash" />
                        </button>
                      </span>
                    </div>
                  </>
                  :

                  <>


                    {
                      modulepermission?.edit && (
                        <>
                          <div className="form_col ml-1">
                            <span className="custum-group-table" >
                              <button type="button" className="btn  btn-sm text-success" title='Update' onClick={() => navigate('/config/portfolioCategory/mapcategory', { state: { data: row } })}>
                                <i className="fas fa-edit" />
                              </button>
                            </span>
                          </div>

                        </>
                      )
                    }


                    {
                      modulepermission?.delete && (
                        <>
                          <div className="form_col">
                            <span className="custum-group-table  ">
                              <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deletePortfolio(row.id)}  >
                                <i className="fa fa-trash" />
                              </button>
                            </span>
                          </div>

                        </>
                      )
                    }


                  </>


              }

            </div>
          </>
        );
      },
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: '600px'
    }
  ];

  useEffect(() => {
    getPortfolioList();
  }, [search, skip, limit]);

  useEffect(() => {
    if (selectedPortfolio) {
      financialPortfolioList();
      getMapping();
    }
  }, [selectedPortfolio])

  useEffect(() => {
    portfolioType();
  }, []);

  return (
    <>
      <div >
        <div className='d-flex justify-content-between p-2 flex-wrap bg-white'>
          <div className='p-2 col-lg-5 col-12'>
            <h6 className='fw-bold mb-0'>Portfolio Category</h6>
          </div>
          <div className='d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1'>
            {/* <div className='row justify-content-end col-12'> */}
            <div className='col-md-6 p-0'>
              <div className='d-flex'>
                <div className="me-2 d-flex align-items-center w-100">
                  <button className='btn bnt-sm adminsearch-icon'>
                    <i className="fa fa-search " aria-hidden="true"></i>
                  </button>
                  <input type="text" className="form-control adminsearch" placeholder="Search by Name" title="Search by Name" onChange={(e) => setSerarch(e.target.value)} />

                </div>
                {
                  currentUser?.role?.name === "Admin" || currentUser?.role?.name === "Super Admin" ?
                    <>
                      <button className='btn btn-sm px-4 adminBtn' title='Add' data-bs-toggle="modal" data-bs-target="#AddPortfolioModal"
                        onClick={() => {
                          // navigate("/config/portfolioCategory/mapcategory");
                          setIsEdit(false),
                            reset({ name: "", type: "" })
                        }}
                      > Add </button>
                    </>
                    : <>
                      {
                        modulepermission?.add && (
                          <button className='btn btn-sm px-4 adminBtn' title='Add' data-bs-toggle="modal" data-bs-target="#AddPortfolioModal"
                            onClick={() => {
                              // navigate("/config/portfolioCategory/mapcategory");
                              setIsEdit(false),
                                reset({ name: "", type: "" })
                            }}
                          > Add </button>
                        )

                      }

                    </>
                }

              </div>
            </div>
            {/* </div> */}
          </div>
        </div>
        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={portfolioList}
            customStyles={tableStyle}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            onChangeRowsPerPage={(newPerPage, page) => handlePerRowsChange(newPerPage, page, setSkip, setLimit)}
            onChangePage={(page) => handlePageChange(page, setSkip, limit)}
            paginationPerPage={limit}
            noDataComponent={null}
          />
        </div>
      </div>

      <div className="modal fade" id="AddPortfolioModal" tabIndex={-1} aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editModalLabel">Add Portfolio</h5>
              <button type="button" id="modal-close" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit(addPortfolio)} className='container-fluid'>
                <div className="row">
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="name" className="form-label">Name</label>
                      <input {...register("name", { required: true })} type="text" className="form-control" id="name" placeholder="Enter name" />
                      {errors.name && <span className="text-danger">Name is required</span>}
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="mb-3">
                      <label htmlFor="type" className="form-label">Type</label>
                      <Controller
                        name="type"
                        control={control}
                        render={({ field }) => (
                          <Select
                            {...field}
                            options={portfoliotype}
                            placeholder="Select type"
                            isSearchable
                          />
                        )}
                      />
                      {errors.type && <span className="text-danger">Type is required</span>}
                    </div>
                  </div>
                  <div className="col-12 text-center">
                    <button type="submit" className="btn btn-sm px-4 adminBtn float-end">Save</button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {
        loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
            <Loader />
          </div>
        )
      }

      {/* mapping modal */}
      <div className="modal fade" id="mappModal" tabIndex="-1" aria-labelledby="examplemappModal" aria-hidden="true" backdrop="static" keyboard="false">
        <div className="modal-dialog">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title" id="mappModallabel">{selectedPortfolio?.name} mapping</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div className="modal-body">
              <div className='row p-2'>
                {
                  financialPortfolio?.map((item, index) =>
                    <div className="col-6 form-check p-2 px-3" key={index}>
                      <input className="form-check-input border border-2 border-secondary" type="checkbox" id={`checkboxTitle${index}`} checked={selectedMapp?.financial_name?.map(i => Number(i?.portfolio_id))?.includes(Number(item.id))} onChange={(e) => updatedSelectedMapp(e, item.id)} />
                      <label className="form-check-label" htmlFor={`checkboxTitle${index}`} >
                        {item?.name}
                      </label>
                    </div>
                  )
                }
              </div>
            </div>

            <div className="modal-footer">
              <button id="closeModal" type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-sm adminBtn" onClick={updateMapp}>Save Changes</button>
            </div>

          </div>
        </div>
      </div>

    </>
  )
}

function PortfolioCategory() {
  return (
    <Suspense>
      <Routes>
        {[{ path: '/', element: PortfolioCategoryList }, ...portfolioCategoryRoutes].map((route, index) => (
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

export default PortfolioCategory