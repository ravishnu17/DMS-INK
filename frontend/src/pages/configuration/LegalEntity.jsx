import React, { Suspense, useCallback, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import { formatDate, tableStyle } from '../../constant/Util';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { sociteyRoutes } from '../../routes';
import Select from 'react-select';  // Import react-select
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Swal from 'sweetalert2';
import { addUpdateAPI, deleteAPI, getAPI } from '../../constant/apiServices';

function LegalEntity() {

  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalRows, setTotalRows] = useState(0);
  const [pagination, setPagination] = useState({
    skip: 0,
    limit: 25,
    currentPage: 1,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [legalEntityList, setLegalEntityList] = useState([]);
  const [countryList, setCountryList] = useState([]);
  const [stateList, setStateList] = useState([]);
  const [districtList, setDistrictList] = useState([]);
  const [regionList, setRegionList] = useState([]);
  const [selectedRegion, setSelectedRegion] = useState("");
  const [query, setQuery] = useState("");
  const [selectedData, setSelectedData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState(null); // Added state for district
  const [provinceList, setProvinceList] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [communityList, setCommunityList] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [societyList, setSocietyList] = useState([]);
  const [selectedSociety, setSelectedSociety] = useState("");
  const [portfolioList, setPortfolioList] = useState([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState("");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [entityData, setEntityData] = useState("")


  // Validation Schema
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    // code: yup.string().required("Code is required"),
    // place: yup.string().required("Place is required"),
    // type: yup.string().required("Type is required"),
    // financial_assistance: yup.boolean().required("Financial Assistance is required"),
  });
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      code: "",
      address: "",
      financial_assistance: "",
      type: "",
      board: "",
      school_board: "",
      medium_of_instruction: "",
      affiliation: "",
      Faculty: "",
      ug_pg: "",
      grade: "",
      place: "",
      region: "",
      district: "",
      state: "",
      country: "",
      state_id: "",
      district_id: "",
      community_id: "",
      country_id: "",
      region_id: "",
      province_id: "",
      community_id: "",
      society_id: "",
      portfolio_id: "",

    },
  });
  const [data, setCommunities] = useState([
    {
      name: 'Community 1',
      code: 'CO001',
      place: 'Chennai',
      type: 'Community'
    },
    {
      name: 'Society 1',
      code: 'SO001',
      place: 'Chennai',
      type: 'Society'
    },
    {
      name: 'Parish 1',
      code: 'PA001',
      place: 'Chennai',
      type: 'Parish'
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Use useCallback to memoize the function
  const getLegalEntityList = useCallback(() => {

    setLoading(true);
    // getAPI('/configuration/provinces?skip=0&limit=25')
    getAPI(`/configuration/legalentity?skip=${pagination?.skip}&limit=${pagination?.limit}&search=${query}`)
      .then((res) => {
        if (res?.data?.status) {
          setLegalEntityList(res?.data?.data);
          setTotalRows(res?.data?.total_count); // Assuming the API returns the total count
        }
      })
      .catch((err) => {
        console.error("Error fetching legalentity:", err);
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
    getLegalEntityList();
  }, [getLegalEntityList]);

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
    getRegionList();
    getProvinceList();
    getCommunityList();
    getSocietyList();
    getPortfolioList();
  }, [])

  const getProvinceList = () => {
    getAPI(`/configuration/provinces?skip=0&limit=0`).then((res) => {
      if (res?.data.status) {
        setProvinceList(res?.data?.data);
      }
    }).catch((err) => {
      console.log(err);
    })
  }
  const getCommunityList = () => {
    getAPI('/configuration/community?skip=0&limit=0').then((res) => {
      if (res?.data.status) {
        setCommunityList(res?.data?.data);
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  const getSocietyList = () => {
    getAPI('/configuration/society?skip=0&limit=0').then((res) => {
      if (res?.data.status) {
        setSocietyList(res?.data?.data);
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  const getPortfolioList = () => {
    getAPI('/configuration/portfolio?skip=0&limit=0').then((res) => {
      if (res?.data.status) {
        setPortfolioList(res?.data?.data);
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

  const deleteEntity = (id) => {
    Swal.fire({
      toast: true,
      title: 'Are you sure?',
      text: "You want to delete this entity!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: 'red',
      cancelButtonColor: 'grey',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        deleteAPI(`/configuration/legalentity/${id}`)
          .then((res) => {
            if (res?.data?.status) {
              Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'success',
                title: 'Deleted!',
                text: "Legal Entity data has been deleted successfully.",
                showConfirmButton: false,
                timer: 3000,
                timerProgressBar: true,
                background: ' #28a745',
                color: '  #ffff'
              });

              getLegalEntityList();
            }
            else {
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
            console.log(err);
          })
      }
    })
  }

  const onSubmit = (data) => {

    setIsSubmitting(true);
    let apiData = {
      "code": data?.code,
      "name": data?.name,
      "place": data?.place,
      "address": data?.address,
      "community_id": Number(data?.community_id),
      "country_id": Number(data?.country_id),
      "state_id": Number(data?.state_id),
      "region_id": Number(data?.region_id),
      "district_id": Number(data?.district_id),
      "province_id": Number(data?.province_id),
      "society_id": Number(data?.society_id),
      "portfolio_id": Number(data?.portfolio_id),
      "type": data?.type,
      "financial_assistance": data?.financial_assistance,
      "board": data?.board,
      "affiliation": data?.affiliation,
      "Faculty": data?.Faculty,
      "ug_pg": data?.ug_pg,
      "school_board": data?.school_board,
      "medium_of_instruction": data?.medium_of_instruction,
      "grade": data?.grade
    }

    const method = !isEdit ? 'POST' : 'PUT';
    const url = !isEdit ? '/configuration/legalentity/' : `/configuration/legalentity/${selectedData?.id}/`;

    // const fd = new FormData();
    // fd.append("user_data", JSON.stringify(apiData));

    addUpdateAPI(method, url, apiData).then((res) => {
      if (res?.data?.status) {
        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: isEdit ? 'Updated!' : 'Created!',
          text: !isEdit ? 'Legal Entity details saved successfully!' : "Legal Entity details updated successfully!",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: ' #28a745',
          color: '  #ffff'
        });

        reset();
        getLegalEntityList();
        // Close the modal programmatically
        const modalElement = document.getElementById('addModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement); // Get existing modal instance
        modalInstance?.hide();
        resetFormFields();
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

  const columns = [
    {
      name: 'Legal Entity Name',
      selector: row => row.name,
    },
    {
      name: 'Code',
      selector: row => row.code,
    },
    {
      name: 'Place',
      selector: row => row.place,
    },
    {
      name: 'Type',
      selector: row => row.type,
      cell: (row) => <div className='badge text-bg-info'>{row.type}</div>

    },
    {
      name: "Action",
      cell: (row) => {
        return (
          <>
            <div className="d-flex justify-content-between">
              <div className="form_col ml-1">
                <span className="custum-group-table" >
                  <button type="button" className="btn  btn-sm text-info"
                    title='View'
                    data-bs-toggle="modal"
                    data-bs-target="#detailsModal"
                    onClick={() => {
                      // setEntityData(row);
                      handleRowClickToView(row)
                    }}
                  >
                    <i className="fas fa-eye " />
                  </button>
                </span>
              </div>
              <div className="form_col ml-1">
                <span className="custum-group-table" >
                  <button className="btn btn-sm text-success" title='Update' data-bs-toggle="modal" data-bs-target="#addModal"
                    onClick={() => {
                      setIsEdit(true);
                      reset(row);
                      setSelectedData(row);
                      handleRowClick(row)
                    }}
                  >
                    <i className="fas fa-edit" />
                  </button>
                </span>
              </div>
              <div className="form_col">
                <span className="custum-group-table  ">
                  <button type="button" className="btn text-danger btn-sm" title='Delete' onClick={() => deleteEntity(row.id)}  >
                    <i className="fa fa-trash" />
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

  const handleRowClick = (rowData) => {
    // Extract values from the clicked row data
    const { country_id, state_id, district_id, region_id, community_id, portfolio_id, province_id, society_id } = rowData;

    // Set the values in the form using setValue
    setValue("country_id", country_id);  // Set country_id
    setValue("state_id", state_id);      // Set state_id
    setValue("district_id", district_id); // Set district_id
    setValue("region_id", region_id);    // Set region_id
    setValue("community_id", community_id);    // Set community_id
    setValue("portfolio_id", portfolio_id)
    setValue("province_id", province_id)
    setValue("society_id", society_id)

    // Optionally, you can also set the selected country and state for triggering state/district fetches
    setSelectedCountry(country_id);  // Trigger state fetch when country is selected
    setSelectedState(state_id);      // Trigger district fetch when state is selected
    setSelectedDistrict(district_id)
    setSelectedRegion(region_id)
    setSelectedCommunity(community_id)
    setSelectedPortfolio(portfolio_id)
    setSelectedProvince(province_id)
    setSelectedSociety(society_id)


  };

  const handleRowClickToView = (row) => {
    getAPI(`/configuration/legalentity/${row?.id}`).then((res) => {
      if (res?.data.status) {
        setEntityData(res?.data?.data);
      }
    }).catch((err) => {
      console.log(err);
    })

  }

  const provinceOptions = provinceList.map((entity) => ({
    value: entity.id,
    label: entity.name,
  }));

  const handleProvinceChange = (selectedOption) => {
    setSelectedProvince(selectedOption ? selectedOption.value : null);
    setValue("province_id", selectedOption ? selectedOption.value : "");
  };

  const communityOptions = communityList.map((comm) => ({
    value: comm.id,
    label: comm.name,
  }));

  const handleCommunityChange = (selectedOption) => {
    setSelectedCommunity(selectedOption ? selectedOption.value : null);
    setValue("community_id", selectedOption ? selectedOption.value : "");
  };

  const societyOptions = societyList.map((soc) => ({
    value: soc.id,
    label: soc.name,
  }));

  const handleSocietyChange = (selectedOption) => {
    setSelectedSociety(selectedOption ? selectedOption.value : null);
    setValue("society_id", selectedOption ? selectedOption.value : "");
  };

  const portfolioOptions = portfolioList.map((soc) => ({
    value: soc.id,
    label: soc.name,
  }));

  const handlePortfolioChange = (selectedOption) => {
    setSelectedPortfolio(selectedOption)
    // setSelectedPortfolio(selectedOption ? selectedOption.value : null);
    setValue("portfolio_id", selectedOption ? selectedOption.value : "");
  };

  const regionOptions = regionList.map((comm) => ({
    value: comm.id,
    label: comm.name,
  }));
  const handleRegionChange = (selectedOption) => {
    setSelectedRegion(selectedOption ? selectedOption.value : null);
    setValue("region_id", selectedOption ? selectedOption.value : "");
  };

  // Convert country list to options for react-select
  const countryOptions = countryList.map((country) => ({
    value: country.id,
    label: country.name,
  }));

  const handleCountryChange = (selectedOption) => {
    setSelectedCountry(selectedOption ? selectedOption.value : null); // Set the selected country ID
    setValue("country_id", selectedOption ? selectedOption.value : ""); // Set value for the country field in the form
  };

  // Convert state list to options for react-select
  const stateOptions = stateList.map((state) => ({
    value: state.id,
    label: state.name,
  }));

  const handleStateChange = (selectedOption) => {
    setSelectedState(selectedOption ? selectedOption.value : null); // Set the selected state ID
    setValue("state_id", selectedOption ? selectedOption.value : ""); // Set value for the state field in the form
    setDistrictList([]); // Clear district list when state changes
    setSelectedDistrict(null); // Reset district when state changes
    setValue("district_id", ""); // Reset district field in the form
  };

  // Convert district list to options for react-select
  const districtOptions = districtList.map((district) => ({
    value: district.id,
    label: district.name,
  }));

  const handleDistrictChange = (selectedOption) => {
    setSelectedDistrict(selectedOption ? selectedOption.value : null); // Set the selected district ID
    setValue("district_id", selectedOption ? selectedOption.value : ""); // Set value for the district field in the form
  };

  const renderFinancialAssistance = () => {
    return (
      <div className="col-md-4 mb-3">
        <label className="form-label">Financial Assistance</label>
        <input
          {...register("financial_assistance")}
          className={`form-control ${errors.financial_assistance ? "is-invalid" : ""}`}
          placeholder="Enter financial assistance"
        />
        <div className="invalid-feedback">{errors.financial_assistance?.message}</div>
      </div>
    );
  };
  const renderType = () => {
    return (
      <div className="col-md-4 mb-3">
        <label className="form-label">Type</label>
        <input {...register("type")} className={`form-control ${errors.type ? "is-invalid" : ""}`} placeholder="Enter type" />
        <div className="invalid-feedback">{errors.type?.message}</div>
      </div>
    );
  };

  const renderConditionalFields = () => {
    const existingPortfolio = portfolioList?.find((po) => po?.id === selectedPortfolio);
    const labelToCheck = selectedPortfolio?.label?.toLowerCase() || existingPortfolio?.name?.toLowerCase();

    switch (labelToCheck) {
      case 'schools' || 'school':
        return (
          <>
            {renderFinancialAssistance()}
            <div className="col-md-4 mb-3">
              <label className="form-label">School Board</label>
              <input {...register("school_board")} className={`form-control ${errors.school_board ? "is-invalid" : ""}`} placeholder="Enter school board" />
              <div className="invalid-feedback">{errors.school_board?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Medium of instruction</label>
              <input {...register("medium_of_instruction")} className={`form-control ${errors.medium_of_instruction ? "is-invalid" : ""}`} placeholder="Enter medium of instruction" />
              <div className="invalid-feedback">{errors.medium_of_instruction?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Grade</label>
              <input {...register("grade")} className={`form-control ${errors.grade ? "is-invalid" : ""}`} placeholder="Enter grade" />
              <div className="invalid-feedback">{errors.grade?.message}</div>
            </div>
          </>
        );
      case 'colleges' || 'college':
        return (
          <>
            {renderFinancialAssistance()}
            <div className="col-md-4 mb-3">
              <label className="form-label">Affiliation</label>
              <input {...register("affiliation")} className={`form-control ${errors.affiliation ? "is-invalid" : ""}`} placeholder="Enter affiliation" />
              <div className="invalid-feedback">{errors.affiliation?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">Faculty</label>
              <input {...register("faculty")} className={`form-control ${errors.faculty ? "is-invalid" : ""}`} placeholder="Enter faculty" />
              <div className="invalid-feedback">{errors.faculty?.message}</div>
            </div>
            <div className="col-md-4 mb-3">
              <label className="form-label">UG/PG</label>
              <input {...register("ug_pg")} className={`form-control ${errors.ug_pg ? "is-invalid" : ""}`} placeholder="Enter ug/pg" />
              <div className="invalid-feedback">{errors.ug_pg?.message}</div>
            </div>
          </>
        );
      case 'technical institutions' || 'technical institution':
        return (
          <>
            {renderFinancialAssistance()}
            <div className="col-md-4 mb-3">
              <label className="form-label">Board</label>
              <input {...register("board")} className={`form-control ${errors.board ? "is-invalid" : ""}`} placeholder="Enter board" />
              <div className="invalid-feedback">{errors.board?.message}</div>
            </div>
            {renderType()}
          </>
        );
      case 'boarding and hostel' || 'boarding and hostels':
        return (
          <>
            {renderType()}
          </>
        );
      default:
        return null;
    }
  };

  const resetFormFields = () => {
    setSelectedCountry("");
    setSelectedState("");
    setSelectedDistrict("");
    setSelectedCommunity("");
    setSelectedPortfolio("");
    setSelectedProvince("");
    setSelectedSociety("");
    setSelectedRegion("");
    reset({
      name: "",
      code: "",
      address: "",
      financial_assistance: "",
      type: "",
      board: "",
      school_board: "",
      medium_of_instruction: "",
      affiliation: "",
      Faculty: "",
      ug_pg: "",
      grade: "",
      place: "",
      region: "",
      district: "",
      state: "",
      country: "",
      state_id: "",
      district_id: "",
      community_id: "",
      country_id: "",
      region_id: "",
      province_id: "",
      community_id: "",
      society_id: "",
      portfolio_id: "",
    });
  };

  // Helper function to get the name by matching ID
  const getNameById = (list, id) => {
    const foundItem = list?.find((item) => item?.id === id);
    return foundItem ? foundItem?.name : 'N/A';
  };

  return (
    <>
      <div className='card' style={{ margin: "5px" }}>
        <div className="d-flex justify-content-between align-items-center m-2">
          <div>
            <h6 className='fw-bold mb-0'>Legal Entity</h6>
          </div>
          <div className='d-flex justify-content-end col-10'>
            {/* <div className="col-md-4 me-2 d-flex">
              <select className="form-control form-select" >
                <option value="">Select Type</option>
                <option value="Society1">Community</option>
                <option value="Society2">Society</option>
                <option value="Society3">Parish</option>
                <option value="Society3">School</option>
                <option value="Society3">College</option>
                <option value="Society3">Technical Institute</option>
                <option value="Society3">Boarding & Hostels</option>
                <option value="Society3">Departments</option>
                <option value="Society3">Social Sectors</option>
                <option value="Society3">Company</option>
              </select>
            </div> */}
            <div className="me-2 d-flex align-items-center">
              <input type="text" className="form-control adminsearch" placeholder="Search by category" title="Search by category" onChange={handleSearch} />
              <button className='btn bnt-sm adminsearch-icon'>
                <i className="fa fa-search " aria-hidden="true"></i>
              </button>
            </div>
            <button className='btn btn-sm px-4 adminBtn' title='Add' data-bs-toggle="modal" data-bs-target="#addModal" onClick={() => reset()}>Add </button>
          </div>
        </div>
        <div className='card' style={{ margin: "7px" }}>
          <DataTable
            columns={columns}
            data={legalEntityList}
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

      <div className="modal fade" id="detailsModal" tabIndex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">View Details</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Portfolio:</label>
                  {/* <p>{getNameById(portfolioList, entityData?.portfolio_id)}</p> */}
                  <p>{entityData?.portfolio?.name}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Name:</label>
                  <p>{entityData?.name || 'N/A'}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Code:</label>
                  <p>{entityData?.code || 'N/A'}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Address:</label>
                  <p>{entityData?.address || 'N/A'}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Place:</label>
                  <p>{entityData?.place || 'N/A'}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Province:</label>
                  {/* <p>{getNameById(provinceList, entityData?.province_id)}</p> */}
                  <p>{entityData?.province?.name}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Community:</label>
                  {/* <p>{getNameById(communityList, entityData?.community_id)}</p> */}
                  <p>{entityData?.community?.name}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Society:</label>
                  {/* <p>{getNameById(societyList, entityData?.society_id)}</p> */}
                  <p>{entityData?.society?.name}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Country:</label>
                  {/* <p>{getNameById(countryList, entityData?.country_id)}</p> */}
                  <p>{entityData?.country?.name}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">State:</label>
                  {/* <p>{getNameById(stateList, entityData?.state_id)}</p> */}
                  <p>{entityData?.state?.name}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">District:</label>
                  {/* <p>{getNameById(districtList, entityData?.district_id)}</p> */}
                  <p>{entityData?.district?.name}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Region:</label>
                  {/* <p>{getNameById(regionList, entityData?.region_id)}</p> */}
                  <p>{entityData?.region?.name}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Financial Assistance:</label>
                  <p>{entityData?.financial_assistance || 'N/A'}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">School Board:</label>
                  <p>{entityData?.school_board || 'N/A'}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Grade:</label>
                  <p>{entityData?.grade || 'N/A'}</p>
                </div>

                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Medium of Instruction:</label>
                  <p>{entityData?.medium_of_instruction || 'N/A'}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Affiliation:</label>
                  <p>{entityData?.affiliation || 'N/A'}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Faculty:</label>
                  <p>{entityData?.faculty || 'N/A'}</p>
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label fw-bold">Board:</label>
                  <p>{entityData?.board || 'N/A'}</p>
                </div>
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>


      <div className="modal fade" id="addModal" tabindex="-1" aria-labelledby="addModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? 'Edit Legal Entity' : 'Add Legal Entity'}</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"
                onClick={() => {
                  resetFormFields()
                  setIsEdit(false)
                }}
              ></button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">PortFolio</label>
                    <Select
                      options={portfolioOptions}
                      value={portfolioOptions.find((option) => option.value === selectedPortfolio)}
                      onChange={handlePortfolioChange}
                      className="custom-react-select"
                      placeholder="Select PortFolio"
                      isClearable
                    />
                    <p className="text-danger">{errors.portfolio_id?.message}</p>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Name <span className='text-danger'>*</span></label>
                    <input {...register("name")} className={`form-control ${errors.name ? "is-invalid" : ""}`} placeholder="Enter name" />
                    <div className="invalid-feedback">{errors.name?.message}</div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Code</label>
                    <input {...register("code")} className={`form-control ${errors.code ? "is-invalid" : ""}`} placeholder="Enter code" />
                    <div className="invalid-feedback">{errors.code?.message}</div>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Address</label>
                    <input type="text" className="form-control" placeholder="Enter Address" {...register("address")} />
                    <p className="text-danger">{errors.address?.message}</p>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Place</label>
                    <input {...register("place")} className={`form-control ${errors.place ? "is-invalid" : ""}`} placeholder="Enter place" />
                    <div className="invalid-feedback">{errors.place?.message}</div>
                  </div>

                  {renderConditionalFields()}

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Province</label>
                    <Select
                      options={provinceOptions}
                      value={provinceOptions.find((option) => option.value === selectedProvince)}
                      onChange={handleProvinceChange}
                      className="custom-react-select"
                      placeholder="Select Province"
                      isClearable
                    />
                    <p className="text-danger">{errors.province_id?.message}</p>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Community</label>
                    <Select
                      options={communityOptions}
                      value={communityOptions.find((option) => option.value === selectedCommunity)}
                      onChange={handleCommunityChange}
                      className="custom-react-select"
                      placeholder="Select Community"
                      isClearable
                    />
                    <p className="text-danger">{errors.community_id?.message}</p>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Society</label>
                    <Select
                      options={societyOptions}
                      value={societyOptions.find((option) => option.value === selectedSociety)}
                      onChange={handleSocietyChange}
                      className="custom-react-select"
                      placeholder="Select Society"
                      isClearable
                    />
                    <p className="text-danger">{errors.society_id?.message}</p>
                  </div>

                  <div className="mb-3 col-md-4">
                    <label className="form-label">Country</label>
                    <Select
                      options={countryOptions}
                      value={countryOptions.find((option) => option.value === selectedCountry)}
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
                      value={stateOptions.find((option) => option.value === selectedState)}
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
                      value={districtOptions.find((option) => option.value === selectedDistrict)}
                      onChange={handleDistrictChange}
                      className="custom-react-select"
                      placeholder="Select District"
                      isClearable
                      isDisabled={!selectedState} // Disable district dropdown until a state is selected
                    ></Select>
                    <p className="text-danger">{errors.district_id?.message}</p>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Region</label>
                    <Select
                      options={regionOptions}
                      value={regionOptions.find((option) => option.value === selectedRegion)}
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
                      resetFormFields();
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
              </div>
            </form>
          </div>
        </div>
      </div>



      <div className="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
        <div className="modal-dialog modal-lg ">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Edit Community</h5>
              <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form>
              <div className="modal-body">

              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-sm adminBtn btn-primary px-4">Submit</button>
                <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">Close</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

export default LegalEntity