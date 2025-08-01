import React, { useState, useEffect } from 'react';
import './MonthUploadGroup.css';
import { useLocation } from 'react-router-dom';
import { getAPI } from '../constant/apiServices';
import Swal from 'sweetalert2';
import Select from 'react-select';
const years = [2023, 2024, 2025];
// Sample uploadedDocs structure with defaults
const initialDocs = {
  2023: {
    January: true,
    February: false,
    March: true,
    // other months...
  },
  2024: {
    January: false,
    February: true,
    // other months...
  },
  // 2025...
};

const MonthUploadGroup = () => {
  const location = useLocation();
  const [selectedYear, setSelectedYear] = useState();
  const [uploadedDocs, setUploadedDocs] = useState(initialDocs);
  const [financialYearList, setFinancialYearList] = useState([]);
  const [months, setMonths] = useState([]);

  const [response, setResponse] = useState([]);

  const enitity_id = location?.state?.enitity_id;
  const enitity_name = location?.state?.enitity_name;
  const financialPortfolio_id = location?.state?.financialPortfolio_id;
  const financialPortfolio_name = location?.state?.financialPortfolio_name;
  const portfolio_id = location?.state?.portfolio_id;
  const financial_portfolio_id_apicall = location?.state?.financial_portfolio_id_apicall;
  const category_id = location?.state?.category_id;
  const catagory_name = location?.state?.catagory_name;
  const module_name = location?.state?.module_name;
  const catagory_type = location?.state?.catagory_type;
  
  const selectedFinancialYear = location?.state?.selectedFinancialYear;
 

  useEffect(() => {
    if (selectedFinancialYear) {
      setSelectedYear(selectedFinancialYear);
    }
  }, [selectedFinancialYear]);


  useEffect(() => {
    getFinancialYears();
  }, [])


  useEffect(() => {
    if (module_name.toLowerCase() === "community") {
      documentComunityViews();
    } else if (module_name.toLowerCase() === "society") {
      documentSocityViews();
    } else {
      documentLegalEnitityViews();
    }

  }, [location?.state, selectedYear]);

  const getFinancialYears = () => {
    getAPI('category/financialyear?skip=0&limit=0').then((res) => {
      setFinancialYearList(res?.data?.data);
      if (selectedYear || selectedFinancialYear) {
        if(selectedYear){
          setSelectedYear(selectedYear);
        }else{
          setSelectedYear(selectedFinancialYear);
        }
        
      } else {
        const defaultYear = res?.data?.data[0];
        
        const option = {
          value: String(defaultYear?.id),
          label: defaultYear?.year
        }
        setSelectedYear(option);
       

      }
     
    })
  }




  const documentComunityViews = () => {
  
    if (selectedYear) {
      if (financial_portfolio_id_apicall && enitity_id) {

        getAPI(`reports/status/?category_id=${category_id}&financial_year_id=${selectedYear?.value}&cfp_id=${financial_portfolio_id_apicall}`).then((res) => {

          if (res?.data?.status) {
            setResponse(res?.data?.data);
          } else {
            Swal.fire({
              text: "No Data Found",
              icon: "error",
              confirmButtonText: "OK"
            });
          }


        })
      } else if (enitity_id) {
        getAPI(`reports/status/?category_id=${category_id}&financial_year_id=${selectedYear?.value}&community_id=${enitity_id}`).then((res) => {

          if (res?.data?.status) {
            setResponse(res?.data?.data);
          } else {
            Swal.fire({
              icon: "warning",
              title: 'Something went wrong!',
              text: "No Data Found" || 'Something went wrong!',
              confirmButtonText: 'OK',
              background: 'rgb(255, 255, 255)',
              color: '  #000000'
            });
          }




        })
      }


    }


  }
  const documentSocityViews = () => {
    if (selectedYear) {
      if (financial_portfolio_id_apicall && enitity_id) {
        getAPI(`reports/status/?category_id=${category_id}&financial_year_id=${selectedYear?.value}&sfp_id=${financial_portfolio_id_apicall}`).then((res) => {

          if (res?.data?.status) {
            setResponse(res?.data?.data);
          } else {
            Swal.fire({
              icon: "warning",
              title: 'Something went wrong!',
              text: "No Data Found" || 'Something went wrong!',
              confirmButtonText: 'OK',
              background: 'rgb(255, 255, 255)',
              color: '  #000000'
            });
          }


        })
      } else if (enitity_id) {
        getAPI(`reports/status/?category_id=${category_id}&financial_year_id=${selectedYear?.value}&society_id=${enitity_id}`).then((res) => {

          if (res?.data?.status) {
            setResponse(res?.data?.data);
          } else {
            Swal.fire({
              icon: "warning",
              title: 'Something went wrong!',
              text: "No Data Found" || 'Something went wrong!',
              confirmButtonText: 'OK',
              background: 'rgb(255, 255, 255)',
              color: '  #000000'
            });
          }


        })

      }


    }


  }
  const documentLegalEnitityViews = () => {
    if (selectedYear) {

      if (financial_portfolio_id_apicall && enitity_id) {
        getAPI(`reports/status/?category_id=${category_id}&financial_year_id=${selectedYear?.value}&lefp_id=${financial_portfolio_id_apicall}`).then((res) => {

          if (res?.data?.status) {
            setResponse(res?.data?.data);
          } else {
            Swal.fire({
              icon: "warning",
              title: 'Something went wrong!',
              text: "No Data Found" || 'Something went wrong!',
              confirmButtonText: 'OK',
              background: 'rgb(255, 255, 255)',
              color: '  #000000'
            });
          }


        })
      } else if (enitity_id) {
        getAPI(`reports/status/?category_id=${category_id}&financial_year_id=${selectedYear?.value}&legal_entity_id=${enitity_id}`).then((res) => {

          if (res?.data?.status) {
            setResponse(res?.data?.data);
          } else {
            Swal.fire({
              icon: "warning",
              title: 'Something went wrong!',
              text: "No Data Found" || 'Something went wrong!',
              confirmButtonText: 'OK',
              background: 'rgb(255, 255, 255)',
              color: '  #000000'
            });
          }


        })
      }



    }


  }




  const getMonthGroups = (iteration) => {
    const allMonths = [
      'April', 'May', 'June',
      'July', 'August', 'September',
      'October', 'November', 'December',
      'January', 'February', 'March',
    ];

    switch (iteration) {
      case 1: // Every month

        return allMonths.map(month => month);
      case 3: // Quarterly
        return [
          'April to June',
          'July to September',
          'October to December',
          'January to March',
        ];

      case 6: // Semi-annually
        return [
          'April to september',
          'October to March',
        ];
      default:
        return [];
    }
  };


  const getFinancialYearRanges1 = (count) => {


    const today = new Date();
    const currentFYStartYear = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear(); // April–March

    const years = [];
    for (let i = 0; i < count; i++) {
      const startYear = currentFYStartYear - i;
      const endYear = startYear + 1;
      years.push(`${startYear}-${endYear}`);
    }
    return years;
  };

  const getFinancialYearRanges = (count, duration) => {
    const today = new Date();
    const currentFYStartYear = today.getMonth() < 3 ? today.getFullYear() - 1 : today.getFullYear(); // April–March

    const ranges = [];
    for (let i = 0; i < count; i++) {
      const startYear = currentFYStartYear - (i * duration);
      const endYear = startYear + duration;
      ranges.push(`${startYear}-${endYear}`);
    }

    return ranges;
  };






  const handleYearChange = (option) => {
    if(option){
      setSelectedYear(option);
    }else{
      setSelectedYear(null);
    }
   
  };

  const handleMonthToggle = (month) => {
    const updatedDocs = { ...uploadedDocs };
    if (!updatedDocs[selectedYear]) {
      updatedDocs[selectedYear] = {};
    }
    updatedDocs[selectedYear][month] = !updatedDocs[selectedYear][month];
    setUploadedDocs(updatedDocs);
  };

  const handleBackClick = () => {
    window.history.back();
  };


  const response1 = [
    { duration: "April", status: true, uploaded_date: "22/4/2025" },
    { duration: "May", status: true, uploaded_date: "19/5/2025" },
    { duration: "jun", status: true, uploaded_date: "1/6/2025" },
    { duration: "july", status: false, uploaded_date: "" },
    { duration: "Augest", status: false, uploaded_date: "" },
    { duration: "Septermber", status: false, uploaded_date: "" },
    { duration: "October", status: false, uploaded_date: "" },
    { duration: "November", status: false, uploaded_date: "" },
    { duration: "December", status: false, uploaded_date: "" },
    { duration: "Januvary", status: false, uploaded_date: "" },
    { duration: "Febravery", status: false, uploaded_date: "" },
    { duration: "March", status: false, uploaded_date: "" },
  ];





  return (
    <>
      <div className='d-flex justify-content-between p-2 flex-wrap bg-white'>

        <div className='p-2 col-lg-5 col-12'>
          <div className='col p-0'>
            <div className='d-flex align-items-center gap-2'>
              <button className='btn pb-0' type='button' onClick={handleBackClick}>
                <i className='fa-solid fa-circle-left fs-5' />
              </button>
              <div className='d-flex justify-content-between gap-2'>
                <h6 className="fw-bold text-dark mb-0">{enitity_name} </h6>
                {
                  financialPortfolio_name && (
                    <h6 className="fw-bold text-dark mb-0"> - {financialPortfolio_name}</h6>
                  )
                }
                {
                  catagory_name && (
                    <h6 className="fw-bold text-dark mb-0"> -{catagory_name}</h6>
                  )
                }


              </div>

              <div />
            </div>
          </div>
        </div>
        <div className=' d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1'>
          {
            catagory_type.toLowerCase() === "month" && (
              <div className="me-2 align-items-center w-25">
                {/* <label className="">Select Year:</label> */}
                {/* <select
                value={selectedYear}
                onChange={handleYearChange}
                className="form-select  border rounded p-2 mb-4"
              >
                {financialYearList.map(year => (
                  <option key={year?.id} value={year?.id}>{year?.year}</option>
                ))}
              </select> */}

                <Select
                  options={financialYearList.map((data) => ({ value: String(data.id), label: data.year }))}
                  value={selectedYear}
                  className="custom-react-select"
                  placeholder="Select Financial Year"
                  onChange={handleYearChange}
                  isClearable
                />

              </div>
            )
          }


        </div>
      </div>
      <div className="monthly-docs-view p-6 bg-gray-100 min-h-screen">
        <div className="bg-white rounded-2xl shadow-md p-6 w-full max-w-4xl mx-auto">



          {/* Show months grid based on selected year */}
          <div className="month-table">
            {/* {months.map(month => (
              <div
                key={month}
                className={`month-cell ${uploadedDocs[selectedYear]?.[month] ? 'checked' : 'unchecked'}`}
                onClick={() => handleMonthToggle(month)}
              >
                <div className="text-xl font-bold">{month}</div>
                <i className={`fa ${uploadedDocs[selectedYear]?.[month] ? 'fa-check' : 'fa-times'}`} />
              </div>
            ))} */}

            {
              response.length > 0 ?

                response.map(res => (
                  <div
                    key={res?.duration}
                    className={`month-cell ${res?.status ? 'checked' : 'unchecked'} w-100`}
                  // onClick={() => handleMonthToggle(month)}
                  >
                    <div className="text-xl font-bold">{res?.duration}</div>
                    <i className={`fa ${res?.status ? 'fa-check' : 'fa-times'}`} />
                    <span>{res?.uploaded_date}</span>
                  </div>
                ))
                : <div className="flex justify-center items-center h-full text-center font-bold">
                  <span>No Data Found</span>
                </div>
            }
          </div>
        </div>
      </div>
    </>

  );
};

export default MonthUploadGroup;
