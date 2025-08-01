import React, { use, useContext, useEffect, useRef, useState } from "react";
import Dropzone from "react-dropzone";
import Select from "react-select";
import { addUpdateAPI, getAPI } from "../../constant/apiServices";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm, Controller, set } from "react-hook-form";
import axios from "axios";
import { API_BASE_URL } from "../../constant/baseURL";
import Swal from "sweetalert2";
import { ContextProvider } from "../../App";
import Loader from "../../constant/loader";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../custom-datepicker.css'
import TimePicker from 'react-time-picker';
import 'react-time-picker/dist/TimePicker.css';
import 'react-clock/dist/Clock.css';

const DynamicForm = () => {

  const navigate = useNavigate();
  const location = useLocation();
  const contextProp = useContext(ContextProvider);
  const { control, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm();
  const [dynamicForms, setDynamicForms] = useState([]);
  const [uploadedImages, setUploadedImages] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [loading, setLoading] = useState(false);

  const [currentFinacialYear, setCurrentFinnaicialYear] = useState({});
  const [months, setMonths] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(null);

  const portfolioId = location?.state?.portfolio_id;
  const catagory_name = location?.state?.catagory_name;
  const categoryId = location?.state?.category_id;
  const enitity_name = location?.state?.enitity_name;
  const enitity_id = location?.state?.enitity_id;

  const financialPortfolio_id = location?.state?.financialPortfolio_id;
  const financialPortfolio_name = location?.state?.financialPortfolio_name;

  const financial_portfolio_id_apicall = location?.state?.financial_portfolio_id_apicall;

  // const selectedFinancialYear1 = location?.state?.selectedFinancialYear;
  // console.log("selectedFinancialYear1", selectedFinancialYear1);

  const catagory_type = location?.state?.catagory_type;
  const iteration = location?.state?.iteration;
  const isRenewal = location?.state?.isRenewal;
  const answer_id = location?.state?.answer_id;
  const [financialYears, setFinancialYears] = useState([]);
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(null);

  // console.log("iteration", iteration);

  // console.log("errors", errors);


  const hasFetched = useRef(false);
  useEffect(() => {
    hasFetched.current = false;
    getFinancialYears();
  }, []);
  // useEffect(() => {
  //   if (selectedFinancialYear1) {
  //     setSelectedFinancialYear(selectedFinancialYear1);
  //   }
  // }, [selectedFinancialYear1]);

  useEffect(() => {

    if (location?.state?.catagory_type?.toLowerCase() === 'month') {
      // console.log("iteration", iteration);
      if (iteration) {



        const monthGroups = getMonthGroups(iteration, selectedFinancialYear?.label);
        // console.log("useEffect monthGroups ", monthGroups);

        setMonths(monthGroups);
      }
    }
  }, [location?.state, selectedFinancialYear]);











  const getMonthGroups = (iteration, selectedYearLabel) => {
    if (!selectedYearLabel || !selectedYearLabel.includes("-")) return [];

    const [startYearStr, endYearStr] = selectedYearLabel.split("-");
    // console.log("startYearStr", startYearStr);
    // console.log("endYearStr", endYearStr);


    const startYear = parseInt(startYearStr.trim(), 10);
    const endYear = parseInt(endYearStr.trim(), 10);

    if (isNaN(startYear) || isNaN(endYear)) return [];



    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const getDate = (monthIndex, year, isEnd = false) =>
      isEnd ? new Date(year, monthIndex + 1, 0) : new Date(year, monthIndex, 1);

    const fullMonths = [
      { label: "April", month: 3, year: startYear },
      { label: "May", month: 4, year: startYear },
      { label: "June", month: 5, year: startYear },
      { label: "July", month: 6, year: startYear },
      { label: "August", month: 7, year: startYear },
      { label: "September", month: 8, year: startYear },
      { label: "October", month: 9, year: startYear },
      { label: "November", month: 10, year: startYear },
      { label: "December", month: 11, year: startYear },
      { label: "January", month: 0, year: endYear },
      { label: "February", month: 1, year: endYear },
      { label: "March", month: 2, year: endYear },
    ];

    if (iteration === 1) {
      // Monthly
      return fullMonths.map(({ label, month, year }) => {
        const start = getDate(month, year);
        const end = getDate(month, year, true);
        return {
          label,
          value: `${formatDate(start)} - ${formatDate(end)}`,
        };
      });
    }

    if (iteration === 3) {
      // Quarterly
      const quarters = [
        { label: "April to June (Quarter 1)", start: { m: 3, y: startYear }, end: { m: 5, y: startYear } },
        { label: "July to September (Quarter 2)", start: { m: 6, y: startYear }, end: { m: 8, y: startYear } },
        { label: "October to December (Quarter 3)", start: { m: 9, y: startYear }, end: { m: 11, y: startYear } },
        { label: "January to March (Quarter 4)", start: { m: 0, y: endYear }, end: { m: 2, y: endYear } },
      ];

      // return quarters.map(({ label, start, end }) => ({
      //   label,
      //   value: `${formatDate(getDate(start.m, start.y))} - ${formatDate(getDate(end.m, end.y, true))}`,
      //   // value: `${formatDate(getDate(start.m, start.y))} - ${formatDate(getDate(end.m, end.y, true))}`,
      // }));
      return quarters.map(({ label, start, end }) => ({
        label,
        value: `${formatDate(getDate(start.m, start.y))} - ${formatDate(getDate(end.m, end.y, true))}`,
      }));
    }

    if (iteration === 6) {
      // Semi-Annually
      const halves = [
        { label: "April to September (First Half)", start: { m: 3, y: startYear }, end: { m: 8, y: startYear } }, // { label: "April to August", start: { m: 3, y: startYear }, end: { m: 8, y: startYear } },
        { label: "October to March (Second Half)", start: { m: 9, y: startYear }, end: { m: 2, y: endYear } }, // { label: "September to March", start: { m: 9, y: startYear }, end: { m: 2, y: endYear } },
      ];

      return halves.map(({ label, start, end }) => ({
        label,
        value: `${formatDate(getDate(start.m, start.y))} - ${formatDate(getDate(end.m, end.y, true))}`,
      }));
    }

    return [];
  };



  const getFinancialYears = () => {
    getAPI('category/financialyear?skip=0&limit=0').then((res) => {
      if (res?.data?.status) {
        setFinancialYears(res?.data?.data);
        const defaultYear = res?.data?.data[0];
        const option = {
          value: String(defaultYear?.id),
          label: defaultYear?.year
        }
        setSelectedFinancialYear(option);

      } else {
        setFinancialYears([]);
      }
    }).catch((err) => {
      console.log(err);
    })
  }


  useEffect(() => {
    if (answer_id) {
      getAnswerValues(answer_id);
    }

  }, [answer_id]);



  useEffect(() => {

    if (financialYears?.length > 0 && months?.length > 0 && !hasFetched.current) {
      if (answer_id) {

        getAnswerValues(answer_id);
        hasFetched.current = true;
      }
    }
  }, [financialYears, months]);



  const handleYearChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedFinancialYear(selectedOption);
      // console.log("selectedOption", selectedOption);

      const monthGroups = getMonthGroups(iteration, selectedOption?.label);
      // console.log("monthGroups", monthGroups);

      setMonths(monthGroups);
      setSelectedMonth(null);
    } else {
      setSelectedFinancialYear(null);
    }
  }

  const handleMonthChange = (selectedOption) => {
    if (selectedOption) {
      setSelectedMonth(selectedOption);
    } else {
      setSelectedMonth(null);
    }
  }

  // Get the current date
  const currentDate = new Date();

  const backPath = answer_id ? '/nonfinancial/community/communityList' : '/nonfinancial/community'

  const goback = () => {
    const portfolio_id = location?.state?.portfolio_id;
    const catagory_name = location?.state?.catagory_name;
    const category_id = location?.state?.category_id;
    const enitity_name = location?.state?.enitity_name;
    const enitity_id = location?.state?.enitity_id;

    const financialPortfolio_id = location?.state?.financialPortfolio_id;
    const financialPortfolio_name = location?.state?.financialPortfolio_name;

    const financial_portfolio_id_apicall = location?.state?.financial_portfolio_id_apicall;

    // const selectedFinancialYear = location?.state?.selectedFinancialYear;
    const catagory_type = location?.state?.catagory_type;
    const iteration = location?.state?.iteration;
    const isRenewal = location?.state?.isRenewal;
    const answer_id = location?.state?.answer_id;


    navigate(backPath, { state: { enitity_id, financialPortfolio_id, financialPortfolio_name, portfolio_id, enitity_name, category_id, catagory_name, answer_id, financial_portfolio_id_apicall, catagory_type, iteration, isRenewal } });
  }

  const getAnswerValues = (id) => {
    getAPI(`/answers/${id}`).then((res) => {
      // console.log("answer res", res);

      if (res?.data?.status) {

        const endDate1 = res?.data?.data?.end_date;
        const startDate1 = res?.data?.data?.start_date;


        // Format combinedDate in the same format as month.value
        const combinedDate = `${new Date(startDate1).toISOString().split('T')[0]} - ${new Date(endDate1).toISOString().split('T')[0]}`;
        // console.log("financialYears", financialYears);


        const selected = financialYears.find(
          (item) => item.year === res?.data?.data?.financial_year_data?.year
        );

        // console.log("selected year", selected);

        if (selected) {
          const option = {
            value: String(selected?.id),
            label: selected?.year
          }
          setSelectedFinancialYear(option);
        }

        // console.log("find response inside ",months);

        const monthGroups = getMonthGroups(iteration, selected?.year);
        // console.log("response inside monthGroups", monthGroups);

        setMonths(monthGroups);

        // console.log("combinedDate", combinedDate);

        const normalize = (str) => str.replace(/\s+/g, ' ').trim();

        // const selectedMonth = monthGroups.find(
        //   (month) => normalize(month.value) === normalize(combinedDate)
        // );

        const selectedMonth = monthGroups.find((month) => month.value === combinedDate);

        // console.log("selectedMonth", selectedMonth);

        if (selectedMonth) {
          setSelectedMonth(selectedMonth);
        }


        setValue("id", res?.data?.data?.id);

        Object.entries(res?.data?.data?.answer_data).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            // File upload handling
            if (value.length > 0 && "file_name" in value[0]) {
              // console.log("value", value);
              // if (value[0].question_type === "File Upload") {
              //   setUploadedFiles((prev) => ({ ...prev, [String(key)]: value[0] }));
              // } else if (value[0].question_type === "Image") {
              //   setUploadedImages((prev) => ({ ...prev, [String(key)]: value[0] }));
              // }

              setValue(key, value[0]);
            } else {
              // Multi-choice handling
              // setValue(key, value.map(v => ({label: v.label, value: v.value })));
              setValue(key, value.answer);
            }
          } else if (typeof value === "object" && value !== null) {
            // Standard fields like text, numbers, date, and single choice
            setValue(key, value.answer);
          }
        });


      }
    })
  }



  const getPortfolioBasedForm = async (id) => {
    try {
      setLoading(true);
      const res = await getAPI(`/category/${id}`);
      // console.log("category_form Qustion", res?.data?.data?.category_form);

      if (res?.data?.status) {
        setDynamicForms(res?.data?.data?.category_form);

      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching form data:", error);
      setLoading(false);
    }
  };

  const handleFileDrop = (acceptedFiles, question) => {
    const file = acceptedFiles[0];
    if (!file) return;
    if (question.data_type.name === "Image") {
      setUploadedImages((prev) => ({ ...prev, [String(question.id)]: file }));
    } else if (question.data_type.name === "File Upload") {
      setUploadedFiles((prev) => ({ ...prev, [String(question.id)]: file }));
    }

    setValue(String(question.id), file);
    trigger(String(question.id));
  };
  const parseDDMMYYYY = (dateStr) => {
    const [day, month, year] = dateStr.trim().split('/');
    return new Date(`${year}-${month}-${day}`);
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0'); // JS months are 0-indexed
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get start and end date  financial year  and iteration based
  const getStartAndEndDate = (financialYearStart, iterationYears = 1) => {
    const startYear = Number(financialYearStart); // Ensure numeric
    const startDate1 = `${startYear}-04-01`;
    const endYear = startYear + iterationYears;
    const endDate1 = `${endYear}-03-31`;
    return { startDate1, endDate1 };
  };

  const onSubmit = (data) => {
    // console.log("Form Data:", data);

    const answer_data = transformData(data);

    // Merge both objects into a single array
    const fileList = [...Object.values(uploadedImages), ...Object.values(uploadedFiles)];

    const formData = new FormData();
    formData.append("answer_data", JSON.stringify(answer_data));
    fileList.forEach((fileItem) => formData.append("file", fileItem))
    const method = answer_id ? "PUT" : "POST";
    //  financial_entity_id
    //  const url = answer_id ? `answers/community_answer/${answer_id}` : `answers/community_answer?community_id=${community_Id}&category_id=${categoryId}&financial_id=${currentFinacialYear?.id}`;

    let startDate = "";
    let endDate = "";

    // console.log("category_type", catagory_type);
    // console.log("isRenewal",isRenewal);

    // console.log("selectedMonth", selectedMonth);

    if (selectedMonth) {
      const [startDateStr, endDateStr] = selectedMonth?.value.split(" - ");
      // console.log("startDateStr", startDateStr);
      // console.log("endDateStr", endDateStr);

      const parsedStartDate = parseDDMMYYYY(startDateStr);
      const parsedEndDate = parseDDMMYYYY(endDateStr);
      startDate = startDateStr;
      endDate = endDateStr;
    } else if (catagory_type.toLowerCase() === "year" && isRenewal) {

      // console.log("selectedFinancialYear", selectedFinancialYear);

      const [startYearStr, endYearStr] = selectedFinancialYear?.label.split("-");

      // console.log("startYearStr", startYearStr);

      const { startDate1, endDate1 } = getStartAndEndDate(startYearStr, iteration);
      // console.log("startDate", startDate1);
      // console.log("endDate", endDate1);

      startDate = startDate1;
      endDate = endDate1;




    }

    // console.log("startDate", startDate);
    // console.log("endDate", endDate);
    // console.log("selectedFinancialYear", selectedFinancialYear);


    let url = "";

    if (startDate && endDate) {
      url = answer_id ? `answers/${answer_id}?financial_year_id=${selectedFinancialYear?.value}&start_date=${startDate || ""}&end_date=${endDate || ""}` : financial_portfolio_id_apicall ? `answers/?non_financial_portfolio_id=${portfolioId}&entity_id=${enitity_id}&category_id=${categoryId}&financial_year_id=${selectedFinancialYear?.value}&financial_entity_id=${financial_portfolio_id_apicall}&start_date=${startDate || ""}&end_date=${endDate || ""}` : `answers/?non_financial_portfolio_id=${portfolioId}&entity_id=${enitity_id}&category_id=${categoryId}&financial_year_id=${selectedFinancialYear?.value}&start_date=${startDate || ""}&end_date=${endDate || ""}`;

    } else {
      url = answer_id ? `answers/${answer_id}?financial_year_id=${selectedFinancialYear?.value}` : financial_portfolio_id_apicall ? `answers/?non_financial_portfolio_id=${portfolioId}&entity_id=${enitity_id}&category_id=${categoryId}&financial_year_id=${selectedFinancialYear?.value}&financial_entity_id=${financial_portfolio_id_apicall}` : `answers/?non_financial_portfolio_id=${portfolioId}&entity_id=${enitity_id}&category_id=${categoryId}&financial_year_id=${selectedFinancialYear?.value}`;
    }



    // console.log("URL", url);

    addUpdateAPI(method, url, formData).then((res) => {

      if (res.data.status) {

        Swal.fire({
          toast: true,
          position: 'top-end',
          icon: 'success',
          title: answer_id ? 'Updated!' : 'Added!',
          text: res?.data?.details || 'Success',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          background: ' #28a745',
          color: '  #ffff'
        });
        goback();
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
    }).catch(err => {
      console.log(err);
    })



  };

  // Function to get the current financial year object
  const getCurrentFinancialYear = (years) => {
    return years.find(({ start_date, end_date }) => {
      const startDate = new Date(start_date);
      const endDate = new Date(end_date);
      return currentDate >= startDate && currentDate <= endDate;
    }) || null;
  };

  const transformData = (formData) => {
    const transformed = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (typeof value === "string") {

        if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
          let date = new Date(value);
          date.setDate(date.getDate());
          transformed[key] = { answer: date.toISOString().split("T")[0] };
        }

        else if (/^\d{2}:\d{2}$/.test(value)) {
          let [hours, minutes] = value.split(":").map(Number);
          hours = (hours) % 24;
          transformed[key] = { answer: `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}` };
        }

        else if (!isNaN(value)) {
          transformed[key] = { answer: Number(value) };
        }
        // Handle Normal Strings
        else {
          transformed[key] = { answer: value };
        }
      }
      // Handle Single Choice
      else if (typeof value === "object" && value !== null && "value" in value) {
        transformed[key] = {
          answer: {
            label: value.label,
            value: Number(value.value) || value.value
          }
        }
      }
      // Handle Multi Choice
      // else if (Array.isArray(value)) {
      //   transformed[key] = { answer: value.map(v => Number(v.value) || v.value) };
      // }
      else if (Array.isArray(value)) {
        transformed[key] = {
          answer: value.map(v => ({
            label: v.label,
            value: Number(v.value) || v.value
          }))
        };
      }
      // Handle File Upload
      // else if (typeof value === "object" && value !== null && "path" in value) {

      //   let fileName = value.path.split("/").pop();
      //   let fileExtension = fileName.split(".").pop();
      //   transformed[key] = {
      //     file_extension: fileExtension,
      //     file_name: fileName
      //   };
      // }
      else if (typeof value === "object" && value !== null) {
        if ("path" in value) {
          // ✅ New file upload
          let fileName = value.path.split("/").pop();
          let fileExtension = fileName.split(".").pop();

          transformed[key] = {
            file_extension: fileExtension,
            file_name: fileName
          };
        } else if ("file_location" in value && "file_name" in value) {
          // ✅ File update (existing file)
          transformed[key] = {
            file_name: value.file_name,
            file_extension: value.file_extension,
            file_location: value.file_location,
            file_size: value.file_size || 0,
            version: value.version || 1
          };
        }
      }
    });

    return transformed;
  };

  // const getValidationRules = (question) => {

  //   let rules = {};

  //   if (question.required) {
  //     rules.required = "This field is required";
  //   }

  //   if (question.max_length) {
  //     rules.maxLength = { value: question.max_length, message: `Max length is ${question.max_length}` };
  //   }

  //   if (question.regex) {
  //     try {
  //       rules.pattern = {
  //         value: new RegExp(question.regex),
  //         message: question.regex_error_msg || "Invalid format."
  //       };
  //     } catch (error) {
  //       console.error(`Invalid regex: ${question.regex}`, error);
  //     }
  //   }

  //   if (question.data_type.name === "Number" && question.allow_decimal === false) {
  //     rules.validate = (value) => Number.isInteger(Number(value)) || "Only integers allowed";
  //   }

  //   if (question.data_type.name === "Date") {
  //     rules.validate = (value) => {
  //       const date = new Date(value);
  //       return isNaN(date.getTime()) ? "Invalid date" : true;
  //     };
  //   }

  //   if (question.data_type.name === "Time") {
  //     rules.validate = (value) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value) || "Invalid time format (HH:mm)";
  //   }

  //   if (question.data_type.name === "Single Choice" || question.data_type.name === "Multi Choice") {
  //     rules.validate = (value) => (value ? true : "Please select an option");
  //   }

  //   if (question.data_type.name === "Image" || question.data_type.name === "File Upload") {
  //     rules.validate = (file) => {
  //       if (!file) return "File is required";
  //       // Get allowed file extensions dynamically
  //       const allowedExtensions = question.category_form_file_type_map.map(ft => ft.file_type.name.toLowerCase());

  //       let fileName, fileSize, fileExtension;

  //       if (file instanceof File) {
  //         // Case 1: New File Upload
  //         fileName = file.name;
  //         fileSize = file.size;
  //         fileExtension = file.name.split('.').pop().toLowerCase();
  //       } else if (typeof file === "object" && file.file_name) {
  //         // Case 2: Previously Uploaded File (From Backend)
  //         fileName = file.file_name;
  //         fileSize = file.file_size;
  //         fileExtension = file.file_extension.toLowerCase();
  //       } else {
  //         return "Invalid file format";
  //       }

  //       // Check if file type is allowed
  //       if (!allowedExtensions.includes(fileExtension)) {
  //         return `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`;
  //       }

  //       // Check file size limit
  //       if (question.max_file_size && fileSize / 1024 / 1024 > question.max_file_size) {
  //         return `File size must be less than ${question.max_file_size}MB`;
  //       }

  //       return true;
  //     };
  //   }

  //   return rules;
  // };




  const getValidationRules = (question) => {
    const rules = {};

    // Required field rule
    if (question.required) {
      rules.required = "This field is required";
    }

    // Max length rule for text inputs
    if (question.max_length) {
      rules.maxLength = {
        value: question.max_length,
        message: `Max length is ${question.max_length}`
      };
    }

    // Regex validation
    if (question.regex) {
      try {
        const pattern = new RegExp(question.regex);
        const prevValidate = rules.validate;
        rules.validate = (value) => {
          if (!value) return true; // Allow empty if not required
          const custom = prevValidate ? prevValidate(value) : true;
          return custom === true
            ? (pattern.test(value) || question.regex_error_msg || "Invalid format.")
            : custom;
        };
      } catch (error) {
        console.error(`Invalid regex pattern: ${question.regex}`, error);
      }
    }

    // Integer only rule for Number fields
    if (question.data_type?.name === "Number" && question.allow_decimal === false) {
      const prevValidate = rules.validate;
      rules.validate = (value) => {
        if (!value) return true;
        const isValid = Number.isInteger(Number(value));
        const custom = prevValidate ? prevValidate(value) : true;
        return custom === true
          ? (isValid || "Only integers allowed")
          : custom;
      };
    }

    // Date validation
    if (question.data_type?.name === "Date") {
      const prevValidate = rules.validate;
      rules.validate = (value) => {
        if (!value) return true;
        const isValid = !isNaN(new Date(value).getTime());
        const custom = prevValidate ? prevValidate(value) : true;
        return custom === true
          ? (isValid || "Invalid date")
          : custom;
      };
    }

    // Time validation (HH:mm format)
    if (question.data_type?.name === "Time") {
      const prevValidate = rules.validate;
      rules.validate = (value) => {
        if (!value) return true;
        const isValid = /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
        const custom = prevValidate ? prevValidate(value) : true;
        return custom === true
          ? (isValid || "Invalid time format (HH:mm)")
          : custom;
      };
    }

    // Single and Multi Choice
    if (
      question.data_type?.name === "Single Choice" ||
      question.data_type?.name === "Multi Choice"
    ) {
      rules.validate = (value) => {
        const isEmpty = value === null || value === undefined || value.length === 0;
        if (!question.required && isEmpty) return true;
        return value ? true : "Please select an option";
      };
    }

    // Image or File Upload
    if (
      question.data_type?.name === "Image" ||
      question.data_type?.name === "File Upload"
    ) {
      rules.validate = (file) => {
        if (!file) return question.required ? "File is required" : true;

        // Handle allowed file types
        const allowedExtensions = question.category_form_file_type_map?.map((ft) =>
          ft.file_type.name.toLowerCase()
        ) || [];

        let fileName, fileSize, fileExtension;

        if (file instanceof File) {
          fileName = file.name;
          fileSize = file.size;
          fileExtension = file.name.split(".").pop().toLowerCase();
        } else if (typeof file === "object" && file.file_name) {
          fileName = file.file_name;
          fileSize = file.file_size;
          fileExtension = file.file_extension?.toLowerCase();
        } else {
          return "Invalid file format";
        }

        // Validate extension only if restriction is given
        if (allowedExtensions.length && !allowedExtensions.includes(fileExtension)) {
          return `Invalid file type. Allowed: ${allowedExtensions.join(", ")}`;
        }

        // Validate file size
        if (
          question.max_file_size &&
          fileSize / 1024 / 1024 > question.max_file_size
        ) {
          return `File size must be less than ${question.max_file_size}MB`;
        }

        return true;
      };
    }

    return rules;
  };



  useEffect(() => {
    if (location?.state?.category_id) {
      getPortfolioBasedForm(location.state.category_id);
    }
  }, [location?.state?.category_id]);

  useEffect(() => {
    let nav = sessionStorage.getItem('navState');
    try {
      const parsedNav = JSON.parse(nav);
      if (contextProp?.setNavState) { // Ensure function exists
        contextProp.setNavState(parsedNav);
      }
    } catch (error) {
      console.error("Error parsing navState:", error);
      navigate(-1);
    }
  }, []);

  return (
    <div className="">
      <div className="d-flex  align-items-center p-2 bg-white">
        <div className='row'>
          <div className='col p-0'>
            <div className='d-flex align-items-center gap-2'>
              <button className='btn pb-0' type='button' onClick={goback}>
                <i className='fa-solid fa-circle-left fs-5' />
              </button>
              <h5 className="fw-bold text-dark mb-0">{location?.state?.enitity_name}</h5>
              {
                location?.state?.financialPortfolio_name && (
                  <h6 className="fw-bold text-dark mb-0"> - {location?.state?.financialPortfolio_name}</h6>
                )
              }
              {
                location?.state?.catagory_name && (
                  <h6 className="fw-bold text-dark mb-0"> - {location?.state?.catagory_name}</h6>
                )
              }
              <div />
            </div>
          </div>
        </div>
      </div>

      <div className="card m-3 p-3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-md-6 mb-3">
              <div className="col-md-6 ">
                <label className="form-label">Year <span className="text-danger">*</span></label>
                <Select
                  options={financialYears.map((data) => ({ value: String(data.id), label: data.year }))}
                  value={selectedFinancialYear}
                  className="custom-react-select"
                  placeholder="Select Financial Year"
                  onChange={handleYearChange}
                // isClearable
                />
              </div>


            </div>
            <div className="col-md-6 mb-3">
              <div className="col-md-6">
                {
                  (iteration >= 1 && catagory_type.toLowerCase() === "month") && (
                    <>
                      <label className="form-label">Month</label>
                      <Select
                        options={months.map((data) => ({ value: data?.value, label: data.label }))}
                        value={selectedMonth}
                        className="custom-react-select"
                        placeholder="Select Month"
                        onChange={handleMonthChange}
                        isClearable
                      />
                    </>

                  )
                }

              </div>
            </div>

            {dynamicForms.map((question) => {
              // console.log("question", question);

              const validationRules = getValidationRules(question);
              return (
                <div key={question.id} className="col-md-6 mb-3">
                  <label className="form-label w-100">
                    {question.name}
                    {question.required && <span className="text-danger"> *</span>}
                  </label>
                  <Controller
                    name={String(question.id)}
                    control={control}
                    rules={validationRules}
                    render={({ field }) =>
                      question.data_type.name === "Text" ? (
                        <input type="text" className="form-control" placeholder={question.placeholder} {...field} />
                      ) : question.data_type.name === "Number" ? (
                        <input type="number" className="form-control" placeholder={question.placeholder} {...field} />
                      ) : // In your Controller render for Date fields
                        question.data_type.name === "Date" ? (
                          <DatePicker
                            placeholderText={"Select Date"}
                            className="form-control w-100 example-custom-input1"
                            wrapperClassName="w-100"
                            selected={field?.value ? new Date(field?.value) : null}
                            onChange={(date) => {
                              const formattedDate = date.toISOString().slice(0, 10);
                              field.onChange(formattedDate);
                            }}
                            minDate={question.allow_past_date === false ? new Date() : null}
                            maxDate={question.allow_future_date === false ? new Date() : null}
                            peekNextMonth
                            showMonthDropdown
                            showYearDropdown
                            yearDropdownItemNumber={15}
                            scrollableYearDropdown
                            dropdownMode="select"
                            autoComplete="off"
                            popperClassName="custom-calendar"
                          />
                        ) :
                          question.data_type.name === "Time" ? (
                            <DatePicker
                              className="form-control w-100" // <-- match Date input
                              wrapperClassName="w-100"
                              selected={field.value ? new Date(`1970-01-01T${field.value}:00`) : null}
                              onChange={(date) => field.onChange(date.toTimeString().slice(0, 5))}
                              showTimeSelect
                              showTimeSelectOnly
                              timeIntervals={5}
                              timeCaption="Time"
                              timeFormat={question.time_format_24 ? "HH:mm" : "hh:mm aa"}
                              dateFormat={question.time_format_24 ? "HH:mm" : "hh:mm aa"}
                              placeholderText="Select time"
                              popperClassName="custom-calendar"
                            />


                          ) : question.data_type.name === "Single Choice" ? (
                            <Select {...field} options={question.category_form_options.map(option => ({ value: option.id, label: option.value }))} placeholder={question.placeholder} />
                          ) : question.data_type.name === "Multi Choice" ? (
                            <Select {...field} options={question.category_form_options.map(option => ({ value: option.id, label: option.value }))} placeholder={question.placeholder} isMulti />
                          ) : question.data_type.name === "Image" || question.data_type.name === "File Upload" ? (
                            <Dropzone
                              onDrop={(acceptedFiles) => handleFileDrop(acceptedFiles, question)}
                              accept={question.category_form_file_type_map.map(ft => `.${ft.file_type.name}`).join(",")}
                            >
                              {({ getRootProps, getInputProps }) => (
                                <div {...getRootProps({ className: "dropzone-container" })}>
                                  <input {...getInputProps()} />
                                  <p className="text-muted">Drag & drop a file here, or click to select</p>
                                  <small className="text-secondary">
                                    Allowed: {question.category_form_file_type_map.map(ft => ft.file_type.name).join(", ")} | Max: {question.max_file_size}MB
                                  </small>
                                  {uploadedImages[question.id] && question.data_type.name === "Image" && (
                                    <p className="text-success mt-2">Uploaded: {uploadedImages[question.id]?.name || uploadedImages[question.id]?.file_name}</p>
                                  )}
                                  {uploadedFiles[question.id] && question.data_type.name === "File Upload" && (
                                    <p className="text-info mt-2">Uploaded: {uploadedFiles[question.id]?.name || uploadedFiles[question.id]?.file_name}</p>
                                  )}
                                </div>
                              )}
                            </Dropzone>
                          ) : null
                    }
                  />
                  {errors[String(question.id)] && (
                    <small className="text-danger">
                      {errors[String(question.id)].message}{" "}
                      {question.regex && (
                        <span className="text-muted">
                          (Expected format: <code>{question.regex}</code>)
                        </span>
                      )}
                    </small>
                  )}
                </div>
              );
            })}
          </div>

          <div className="d-flex justify-content-center text-center pt-3 gap-2">

            <button type="submit" className="btn w-20 px-4 adminBtn">Save</button>
            <button type="reset" className="btn w-20 px-4  btn-danger " onClick={() => { goback() }}>
              Cancel
            </button>

          </div>
        </form>
      </div>
      {
        loading && (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
            <Loader />
          </div>
        )
      }

    </div>
  );
};

export default DynamicForm;