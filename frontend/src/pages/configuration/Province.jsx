import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { tableStyle } from '../../constant/Util';
import DataTable from 'react-data-table-component';
import Swal from 'sweetalert2';
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { addUpdateAPI, deleteAPI, getAPI } from '../../constant/apiServices';
import Select from 'react-select';  // Import react-select

function ProvinceList() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isEdit, setIsEdit] = useState(false);
  const [viewData, setViewData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [provinceList, setProvinceList] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [query, setQuery] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null); // Added state for district

  const schema = yup.object().shape({
    name: yup.string().required("Province Name is required"),
    // code: yup.string().required("Code is required"),
    // address: yup.string().required("Address is required"),
    // region_id: yup.string().required("Region is required"),
    // district_id: yup.string().required("District is required"),
    // state_id: yup.string().required("State is required"),
    // country_id: yup.string().required("Country is required"),
  });

  const { register, handleSubmit, setValue, reset: reset1, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      provinceName: "",
      code: "",
      address: "",
      place: "",
      region_id: 0,
      district_id: 0,
      state_id: 0,
      country_id: 0,
    },
  });

  // Memoize columns to prevent re-renders
  const columns = useMemo(() => [
    { name: 'Province Name', selector: row => row.name, sortable: true },
    { name: 'Code', selector: row => row.code, sortable: true },
    { name: 'Address', selector: row => row.address },
    { name: 'Place', selector: row => row.place },
    // { name: 'Region', selector: row => row.region_id },
    // { name: 'District', selector: row => row.district_id },
    // { name: 'State', selector: row => row.state_id },
    // { name: 'Country', selector: row => row.country_id },
    {
      name: "Action",
      cell: (row) => (
        <div className="d-flex justify-content-between">
          <button className="btn btn-sm text-info" title='View' data-bs-toggle="modal" data-bs-target="#detailsModal"
            onClick={() => {
              setViewData(row);
            }}
          >
            <i className="fas fa-eye " />
          </button>
          <button className="btn btn-sm text-success" title='Update' data-bs-toggle="modal" data-bs-target="#addModal"
            onClick={() => {
              setIsEdit(true);
              reset1(row);
              setSelectedData(row);
              handleRowClick(row)
            }}
          >
            <i className="fas fa-edit" />
          </button>
          <button className="btn text-danger btn-sm" title='Delete' onClick={() => deleteProvince(row?.id)}>
            <i className="fa fa-trash" />
          </button>
        </div>
      ),
      ignoreRowClick: true,
      allowoverflow: true,
      maxwidth: '600px'
    }
  ], []);

  // Use useCallback to memoize the function
  const getProvinceList = useCallback(() => {

    setLoading(true);
    // getAPI('/configuration/provinces?skip=0&limit=25')
    getAPI(`/configuration/provinces?skip=${pagination?.skip}&limit=${pagination?.limit}&search=${query}`)
      .then((res) => {
        if (res?.data?.status) {
          setProvinceList(res?.data?.data);
          setTotalRows(res?.data?.total_count); // Assuming the API returns the total count
        }
      })
      .catch((err) => {
        console.error("Error fetching provinces:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [pagination, query]);

  // Handle search input change
  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Initial data load
  useEffect(() => {
    getProvinceList();
  }, [getProvinceList]);

  // Handle Page Change
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
      skip: 0, // Reset to first page
      currentPage: 1,
    }));
  };

  useEffect(() => {
    // getCountryList();
    // getStatseList();
    // getdistrictList();
    getRegionList();
    // getProvinceList()
  }, [])

  // Fetch all countries on component mount
  useEffect(() => {
    getAPI('/configuration/country?limit=0')
      .then((res) => {
        if (res?.data?.status) {
          setCountryList(res?.data?.data);
        }
      })
      .catch((err) => console.log("Error fetching countries:", err));
  }, []);

  // Fetch states when a country is selected
  useEffect(() => {
    if (selectedCountry) {

      getAPI(`/configuration/state?limit=0&country_id=${selectedCountry}`)
        .then((res) => {
          if (res?.data?.status) {
            setStateList(res?.data?.data);
            if (isEdit) {
              // Check if the selected state still exists in the fetched list
              if (res?.data?.data?.some((state) => state.id === selectedState)) {
                setValue("state_id", selectedState);  // Reset state if exists in new stateList
              } else {
                setValue("state_id", "");  // Reset if the state is no longer available
              }
            } else {
              setSelectedState(null); // Reset state when country changes
              setDistrictList([]); // Clear districts when country changes
              setSelectedDistrict(null); // Reset district when country changes
              setValue("state_id", ""); // Reset state field in the form
              setValue("district_id", ""); // Reset district field in the form
            }
          }
        })
        .catch((err) => console.log("Error fetching states:", err));
    } else {
      setStateList([]);
      setDistrictList([]);
    }
  }, [selectedCountry, setValue]);

  // Fetch districts when a state is selected
  useEffect(() => {
    if (selectedState) {
      getAPI(`/configuration/district?limit=0&state_id=${selectedState}`)
        .then((res) => {
          if (res?.data?.status) {
            setDistrictList(res?.data?.data);
            if (isEdit) {
              // Check if the selected district still exists in the fetched list
              if (res?.data?.data?.some((district) => district?.id === selectedDistrict)) {
                setValue("district_id", selectedDistrict);  // Reset district if exists in new districtList
              } else {
                setValue("district_id", "");  // Reset if the district is no longer available
              }
            } else {
              setSelectedDistrict(null); // Reset district when state changes
              setValue("district_id", ""); // Reset district field in the form
            }
          }
        })
        .catch((err) => console.log("Error fetching districts:", err));
    } else {
      setDistrictList([]);
    }
  }, [selectedState, setValue]);

  const handleRowClick = (rowData) => {
    // Extract values from the clicked row data
    const { country_id, state_id, district_id, region_id } = rowData;

    // Set the values in the form using setValue
    setValue("country_id", country_id);  // Set country_id
    setValue("state_id", state_id);      // Set state_id
    setValue("district_id", district_id); // Set district_id
    setValue("region_id", region_id);    // Set region_id

    // Optionally, you can also set the selected country and state for triggering state/district fetches
    setSelectedCountry(country_id);  // Trigger state fetch when country is selected
    setSelectedState(state_id);      // Trigger district fetch when state is selected
    setSelectedDistrict(district_id)
    setSelectedRegion(region_id)
  };

  const handleRegionChange = (selectedOption) => {
    setSelectedRegion(selectedOption ? selectedOption.value : null);
    setValue("region_id", selectedOption ? selectedOption.value : "");
  };
  // Handle country selection change
  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption ? selectedOption.value : null); // Set the selected country ID
    setValue("country_id", selectedOption ? selectedOption.value : ""); // Set value for the country field in the form
    setSelectedState(null); // Reset state when country changes
  };

  // Handle state selection change
  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption ? selectedOption.value : null); // Set the selected state ID
    setValue("state_id", selectedOption ? selectedOption.value : ""); // Set value for the state field in the form
    setSelectedDistrict(null); // Reset district when state changes
    setValue("district_id", ""); // Reset district field in the form
  };
  // Handle district selection change
  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : null); // Set the selected district ID
    setValue("district_id", selectedOption ? selectedOption.value : ""); // Set value for the district field in the form
  };


  const getCountryList = () => {
    getAPI('/configuration/country').then((res) => {
      if (res?.data?.status) {
        setCountryList(res?.data?.data)
      }
    }).catch((err) => {
      console.log(err);
    })
  }
  const getStatseList = () => {
    getAPI('/configuration/state').then((res) => {
      if (res?.data?.status) {
        setStateList(res?.data?.data);
      }
    }).catch((err) => {
      console.log(err);
    })
  }
  const getdistrictList = () => {
    getAPI('/configuration/district?skip=0&limit=10').then((res) => {
      if (res?.data?.status) {
        setDistrictList(res?.data?.data);
      }
    }).catch((err) => {
      console.log(err);
    })
  }
  const getRegionList = () => {
    getAPI('/configuration/region?limit=0').then((res) => {
      if (res?.data.status) {
        setRegionList(res?.data?.data);
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  const onSubmit = (data) => {
    setIsSubmitting(true); // Disable button and show spinner
    let apiData = {
      "code": data?.code,
      "name": data?.name,
      "place": data?.place,
      "address": data?.address,
      "country_id": Number(data?.country_id),
      "state_id": Number(data?.state_id),
      "region_id": Number(data?.region_id),
      "district_id": Number(data?.district_id),
    }

    // const url = `/configuration/province/`;
    // const method = 'POST';
    const method = !isEdit ? 'POST' : 'PUT';
    const url = !isEdit ? '/configuration/province/' : `/configuration/province/${selectedData?.id}/`;

    // const fd = new FormData();
    // fd.append("user_data", JSON.stringify(apiData));

    addUpdateAPI(method, url, apiData).then((res) => {
      if (res?.data?.status) {
        //success
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: isEdit ? 'Updated!' : 'Created!',
          text: !isEdit ? 'Province details saved successfully!' : "Province details updated successfully!",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: ' #28a745',
          color: '  #ffff'
        });

        resetForm();
        getProvinceList();
        // Close the modal programmatically
        const modalElement = document.getElementById('addModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement); // Get existing modal instance
        modalInstance?.hide();
        // or
        // document.querySelector('#addModal .btn-close').click();
        setIsEdit(false);
      }
      setIsSubmitting(false); // Re-enable button after request completes
    }).catch((err) => {
      console.log(err);
      setIsSubmitting(false); // Re-enable button after request completes
    }).finally(() => {
      setLoading(false);
      setIsSubmitting(false); // Re-enable button after request completes
    })

  };
  const resetForm = () => {
    reset1({
      code: "",
      name: "",
      place: "",
      address: "",
      country_id: null,
      state_id: null,
      region_id: null,
      district_id: null,
    });
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedRegion("");
  };
  const deleteProvince = (id) => {
    Swal.fire({
      toast: true,
      title: 'Are you sure?',
      text: "You want to delete this province!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'grey',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAPI(`/configuration/province/${id}`)
          .then((res) => {
            if (res?.data?.status) {
              // delete message
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Deleted!',
                text: "Province data has been deleted successfully.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: '#28a745',  // success green
                color: '#fff'
              });

              getProvinceList();
            }
            else {
              Swal.fire({
                icon: "warning",
                title: 'Something went wrong!',
                text: res?.data?.detail || 'Something went wrong!',
                confirmButtonText: 'OK',
                background: 'rgb(255, 255, 255)',
                color: '  #000000'
              });
            }
          }).catch((err) => {
            console.log(err);
          })
      }
    })
  }

  // Convert country list to options for react-select
  const regionOptions = regionList.map((comm) => ({
    value: comm.id,
    label: comm.name,
  }));

  // Convert country list to options for react-select
  const countryOptions = countryList.map((country) => ({
    value: country.id,
    label: country.name,
  }));

  // Convert state list to options for react-select
  const stateOptions = stateList.map((state) => ({
    value: state.id,
    label: state.name,
  }));

  // Convert district list to options for react-select
  const districtOptions = districtList.map((district) => ({
    value: district.id,
    label: district.name,
  }));

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div>
            <h6 className='fw-bold mb-0'>Province</h6>
          </div>
          <div className='d-flex justify-content-end col-10'>
            <div className="me-2 d-flex align-items-center">
              <input
                type="text"
                className="form-control adminsearch"
                placeholder="Search by name"
                title="Search by name"
                // value={query}
                onChange={handleSearch}
              />
              <button className='btn bnt-sm adminsearch-icon'>
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
            </div>
            <button className="btn btn-sm adminBtn px-4" data-bs-toggle="modal" data-bs-target="#addModal"
              onClick={() => {
                setIsEdit(false);
                setSelectedData(null);
                resetForm()
                handleRowClick(null);
              }}
            > Add </button>
            <div>
            </div>
          </div>
        </div>

        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={provinceList}
            customStyles={tableStyle}
            pagination
            paginationServer
            paginationTotalRows={totalRows}
            paginationDefaultPage={pagination?.currentPage}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handlePerRowsChange}
            highlightOnHover
            pointerOnHover
            responsive
            progressPending={loading}
          />
        </div>
      </div>

      {/* Details Modal */}
      <div className="modal fade" id="detailsModal" tabIndex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button onClick={() => resetForm()} type="button" className="btn-sm btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Province Name</label>
                  <p className="ms-2 fw-bold">{viewData?.name}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Code</label>
                  <p className="ms-2 fw-bold">{viewData?.code}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Address</label>
                  <p className="ms-2 fw-bold">{viewData?.address}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Region</label>
                  <p className="ms-2 fw-bold">{viewData?.region?.name}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">District</label>
                  <p className="ms-2 fw-bold">{viewData?.district?.name}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">State</label>
                  <p className="ms-2 fw-bold">{viewData?.state?.name}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Country</label>
                  <p className="ms-2 fw-bold">{viewData?.country?.name}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>


      {/* Add/Edit Details Modal */}
      <div className="modal fade" id="addModal" tabIndex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? 'Edit Details' : 'Add Details'}</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal"
                onClick={() => {
                  setSelectedCountry("");
                  setSelectedState("");
                  setSelectedDistrict("");
                  resetForm() // Reset form values using react-hook-form
                  setIsEdit(false)
                }}
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body row">
                <div className="mb-3 col-md-4">
                  <label className="form-label">Province Name  <span className='text-danger'>*</span></label>
                  <input type="text" className={`form-control ${errors.name ? "is-invalid" : ""}`} placeholder="Enter Province Name" {...register("name")} />
                  <p className="text-danger">{errors.provinceName?.message}</p>
                </div>

                <div className="mb-3 col-md-4">
                  <label className="form-label">Code</label>
                  <input type="text" className="form-control" placeholder="Enter Province Code" {...register("code")} />
                  <p className="text-danger">{errors.code?.message}</p>
                </div>

                <div className="mb-3 col-md-4">
                  <label className="form-label">Address</label>
                  <input type="text" className="form-control" placeholder="Enter Address" {...register("address")} />
                  <p className="text-danger">{errors.address?.message}</p>
                </div>
                <div className="mb-3 col-md-4">
                  <label className="form-label">Place</label>
                  <input type="text" className="form-control" placeholder="Enter Place" {...register("place")} />
                  <p className="text-danger">{errors.place?.message}</p>
                </div>
                <div className="mb-3 col-md-4">
                  <label className="form-label">Country</label>
                  <Select
                    options={countryOptions}
                    value={selectedCountry ? countryOptions.find((option) => option.value === selectedCountry) : null}
                    onChange={handleCountryChange}
                    className="custom-react-select"
                    placeholder="Select Country"
                    isClearable
                  />
                  <p className="text-danger">{errors.country_id?.message}</p>
                </div>
                <div className="mb-3 col-md-4">
                  <label className="form-label">State</label>
                  <Select
                    options={stateOptions}
                    value={selectedState ? stateOptions.find((option) => option.value === selectedState) : null}
                    onChange={handleStateChange}
                    className="custom-react-select"
                    placeholder="Select State"
                    isClearable
                    isDisabled={!selectedCountry} // Disable state dropdown until a country is selected
                  />
                  <p className="text-danger">{errors.state_id?.message}</p>
                </div>

                <div className="mb-3 col-md-4">
                  <label className="form-label">District</label>
                  <Select
                    options={districtOptions}
                    value={selectedDistrict ? districtOptions.find((option) => option.value === selectedDistrict) : null}
                    onChange={handleDistrictChange}
                    className="custom-react-select"
                    placeholder="Select District"
                    isClearable
                    isDisabled={!selectedState} // Disable district dropdown until a state is selected
                  ></Select>
                  <p className="text-danger">{errors.district_id?.message}</p>
                </div>

                <div className="mb-3 col-md-4">
                  <label className="form-label">Region</label>
                  <Select
                    options={regionOptions}
                    value={selectedRegion ? regionOptions.find((option) => option.value === selectedRegion) : null}
                    onChange={handleRegionChange}
                    className="custom-react-select"
                    placeholder="Select Region"
                    isClearable
                  />
                  <p className="text-danger">{errors.region_id?.message}</p>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal"
                  onClick={() => {
                    setSelectedCountry("");
                    setSelectedState("");
                    setSelectedDistrict("");
                    reset1(); // Reset form values using react-hook-form
                    setIsEdit(false)
                  }}
                >Close</button>
                <button
                  type="submit"
                  className="btn btn-sm adminBtn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Saving...
                    </>
                  ) : (
                    isEdit ? "Update Changes" : "Save Changes"
                  )}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProvinceList;
