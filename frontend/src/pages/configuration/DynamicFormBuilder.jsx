import React, { useEffect, useState } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { SortableContext, useSortable, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import AccordionSummary from "@mui/material/AccordionSummary";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Checkbox from "@mui/material/Checkbox";
import { useLocation, useNavigate } from "react-router-dom";

import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from "sweetalert2";
import { addUpdateAPI, deleteAPI, getAPI } from "../../constant/apiServices";
import Select from 'react-select';
import { FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup, Tooltip } from "@mui/material";


const SortableItem = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      {children(listeners, attributes)}
    </div>
  );
};

const questionTypes = {
  Text: ["Name", "Placeholder", "Validation"],
  Number: ["Number", "Placeholder", "Validation"],
  Date: ["Select Date", "Placeholder", "Validation"],
  Time: ["Select Time", "Placeholder", "Validation"],
  Image: ["Upload Image", "Placeholder", "Validation"],
  "Single Choice": ["Option 1", "Option 2"],
  "Multiple Choice": ["Option A", "Option B"],
  "File Upload": ["Upload File"]
};

const DynamicForm = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const id = location?.state?.id;

  const [formFields, setFormFields] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [questionExpanded, setQuestionExpanded] = useState();

  const [questionsTypeList, setQuestionsTypeList] = useState([])
  const [financialYearList, setFinancialYearList] = useState([])
  const [isEdit, setIsEdit] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(id)
  const [currentRecords, setCurrentRecords] = useState([])
  const [catFileTypes, setCatFileTypes] = useState([])
  const [selectedQIds, setSelectedQIds] = useState([]); // Track selected IDs
  // console.log("call");

  // Validation Schema
  const schema = yup.object().shape({
    name: yup.string().required("Name is required"),
    financial_year_id: "",
    // renewal_date: "",
    due_date: "",
    year: "",
    month: "",
    day: "",
    description: "",
    // renewal_period_type: yup.string().required("Renewal Period Type is required"),
    // Conditionally require renewal fields if is_renewal is true
    // renewal_period_iteration: yup
    //   .number()
    //   .typeError("Renewal Duration must be a number")
    //   .positive("Must be a positive number")
    //   .integer("Must be a whole number")
    //   .when("is_renewal", {
    //     is: true,
    //     then: yup.number().required("Renewal Duration is required"),
    //     otherwise: yup.number().notRequired(),
    //   }),

    // renewal_period_iteration: yup
    //   .string()
    //   .when("is_renewal", {
    //     is: true,
    //     then: (schema) => schema.required("Renewal Duration is required"),
    //     otherwise: (schema) => schema.notRequired(),
    //   }),

  });
  const { register, handleSubmit, setValue, reset, control, formState: { errors }, watch, } = useForm({ resolver: yupResolver(schema) });
  // Watch the checkbox value
  const isRenewalChecked = watch("is_renewal", false);
  const isDueChecked = watch("is_due", false);


  useEffect(() => {
    getCategoryOne();
    getQuestionsDTList();
    getFinancialYearList();
    getCategoryFilesType();
  }, [])

  useEffect(() => {
    if (location?.state?.id) {
      setCurrentRecordId(location?.state?.id)
      setIsEdit(true)
      getCategoryOne();
    }

  }, [currentRecordId, location?.state?.id])


  useEffect(() => {

    if (currentRecords?.length !== 0) {

      setValue("name", currentRecords?.name || "");
      setValue("description", currentRecords?.description || "")
      setValue("renewal_period_iteration", currentRecords?.renewal_iteration || null)

      setValue("is_due", currentRecords?.is_due || false)
      setValue("is_renewal", currentRecords?.is_renewal || false)

      if (currentRecords?.type === "month") {
        setValue("renewal_period_type", { value: "month", label: "Month" })
      } else {
        setValue("renewal_period_type", { value: "year", label: "Year" })
      }

      currentRecords?.category_financial_due_map?.map((item, index) => {

        setValue("financial_year_id", item?.financial_year_id)
        if (item?.financial_year_id) {
          const defaultOption = financeYearOptions?.find(
            (opt) => opt?.value === item?.financial_year_id
          );
          setValue("financial_year_id", defaultOption);
        }

        if (item?.due_month) {
          const defaultMonth = monthOptions.find((opt) => Number(opt?.value) === Number(item?.due_month));
          setValue("month", defaultMonth);
        }
        if (item?.due_day) {
          const defaultMonth = dayOptions.find((opt) => Number(opt?.value) === Number(item?.due_day));
          setValue("day", defaultMonth);
        }

      })
    }

  }, [currentRecords])

  const getCategoryOne = () => {
    if (currentRecordId) {
      getAPI('/category/' + currentRecordId).then((res) => {
        if (res?.status) {
          setCurrentRecords(res?.data?.data)
        }
      }).catch((err) => {
        console.log(err);
      })
    }

  }

  const getCategoryFilesType = () => {
    getAPI('/category/filetypes').then((res) => {
      if (res?.status) {
        setCatFileTypes(res?.data?.data)
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  const getQuestionsDTList = () => {
    getAPI('/category/datatypes?skip=0&limit=25').then((res) => {
      if (res?.status) {
        setQuestionsTypeList(res?.data?.data)
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  const getFinancialYearList = () => {
    getAPI('/category/financialyear?skip=0&limit=25').then((res) => {
      if (res?.status) {
        setFinancialYearList(res?.data?.data)
      }
    }).catch((err) => {
      console.log(err);
    })
  }

  const financeYearOptions = financialYearList.map((comm) => ({
    value: comm?.id,
    label: comm?.year,
  }));

  const optionsTYpe = [
    { value: "month", label: "Month" },
    { value: "year", label: "Year" }
  ];

  const month_itreations = [
    { value: "1", label: "One Month" },
    { value: "3", label: "Quarterly Year" },
    { value: "6", label: "Half Year" },
  ]

  const monthOptions = [
    { value: "1", label: "January", days: 31 },
    { value: "2", label: "February", days: 28 },  // Leap year not handled here
    { value: "3", label: "March", days: 31 },
    { value: "4", label: "April", days: 30 },
    { value: "5", label: "May", days: 31 },
    { value: "6", label: "June", days: 30 },
    { value: "7", label: "July", days: 31 },
    { value: "8", label: "August", days: 31 },
    { value: "9", label: "September", days: 30 },
    { value: "10", label: "October", days: 31 },
    { value: "11", label: "November", days: 30 },
    { value: "12", label: "December", days: 31 }
  ];

  const selectedMonth = watch("month");

  // Generate days dynamically based on the selected month
  const generateDays = (daysCount) => {
    return Array.from({ length: daysCount }, (_, i) => ({
      value: `${i + 1}`,
      label: `${i + 1}`
    }));
  };

  const [dayOptions, setDayOptions] = useState([]);

  useEffect(() => {
    const selectedMonthObj = monthOptions.find(
      (m) => m.value === selectedMonth?.value
    );
    if (selectedMonthObj) {
      setDayOptions(generateDays(selectedMonthObj.days));
    } else {
      setDayOptions([]);
    }
  }, [selectedMonth]);

  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  const onDragEnd = (event) => {

    const { active, over } = event;
    if (!over || active?.id === over?.id) return;

    const oldIndex = currentRecords?.category_form?.findIndex((field) => field?.id === active?.id);
    const newIndex = currentRecords?.category_form.findIndex((field) => field?.id === over?.id);

    const updated = moveItemToOrder(currentRecords?.category_form, active?.id, newIndex);

    let apiData = {
      "order": updated,
    };

    const method = "PUT"
    const url = `/category/order`;

    addUpdateAPI(method, url, apiData)
      .then((res) => {
        if (res?.data?.status) {
          getCategoryOne();
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
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
      });


    // const oldIndex = formFields.findIndex((field) => field.id === active.id);
    // const newIndex = formFields.findIndex((field) => field.id === over.id);
    // setFormFields(arrayMove(formFields, oldIndex, newIndex));
  };

  const moveItemToOrder = (items, movingId, newOrder) => {
    const movingItem = items?.find(item => item?.id === movingId);
    if (!movingItem) return items;

    // Remove the item to be moved
    const remaining = items?.filter(item => item?.id !== movingId);

    // Insert it into the new position
    const reordered = [
      ...remaining.slice(0, newOrder),
      { ...movingItem, order: newOrder },
      ...remaining.slice(newOrder)
    ];

    // Reassign order values based on new positions
    // return reordered.map((item, index) => ({
    //   ...item,
    //   order: index
    // }));
    // Reassign `order` values starting from 0
    return reordered.map((item, index) => ({
      id: item?.id,
      order: index,
    }));
  };

  const handleBackClick = () => {
    navigate("/config/category");
  };

  // questions update
  const handleAddQuestionType = (e) => {
  }
  const createQuestions = (categoryId, categoryName) => {
    setQuestionExpanded(false);

    let apiData = {
      "category_id": currentRecordId,
      "data_type_id": categoryId,
    };
    const method = "POST"
    const url = `/category/form/${currentRecordId}/`;

    addUpdateAPI(method, url, apiData)
      .then((res) => {
        if (res?.data?.status) {
          getCategoryOne();
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
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
      });
  }
  const handleDeleteQuestions = (questionsId, questionData) => {

    Swal.fire({
      toast: true,
      title: "Are you sure?",
      text: "You want to delete this question!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "grey",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const url = "/category/form?form_ids=" + questionsId
        deleteAPI(url)
          .then((res) => {
            if (res?.data?.status) {
              getCategoryOne();
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
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
          });
      } else {
      }
    });
  }

  const handleChangeQis = (id, event) => {
    setSelectedQIds((prev) => {
      let updatedList = [...prev];

      if (event.target.checked) {
        if (!updatedList.includes(id)) {
          updatedList.push(id); // Add ID if checked
        }
      } else {
        updatedList = updatedList.filter((item) => item !== id); // Remove ID if unchecked
      }

      return updatedList;
    });
  };
  const handleDeleteQuestionsMulti = (e) => {
    e.stopPropagation();

    Swal.fire({
      toast: true,
      title: "Are you sure?",
      text: `You want to delete this ${selectedQIds?.length > 1 ? "questions!" : "question!"}`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "grey",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        const url = "/category/form?form_ids=" + selectedQIds
        deleteAPI(url)
          .then((res) => {
            if (res?.data?.status) {
              getCategoryOne();
              setSelectedQIds([])
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
          .catch((err) => {
            console.log(err);
          })
          .finally(() => {
          });
      } else {
        // setSelectedQIds([])
      }
    });
  }

  // Handle checkbox change
  const handleChangeFileOimgs = (id, event, type, questionId, questionData) => {
    let selectedIds = [];
    if (event.target.checked) {
      selectedIds.push(id);
    } else {
      selectedIds = selectedIds.filter((item) => item !== id);
    }
    let updatedList = questionData?.category_form_file_type_map
      ? questionData?.category_form_file_type_map?.map(item => ({ file_type_id: item?.file_type_id })) // Ensure format
      : [];

    if (event.target.checked) {
      // Check if the ID is already in the list
      const alreadyExists = questionData?.category_form_file_type_map?.some((item) => Number(item?.file_type_id) === Number(id));

      if (!alreadyExists) {
        updatedList.push({ file_type_id: id }); // Add new ID
      }
    } else {
      // Remove unchecked ID
      updatedList = updatedList?.filter((item) => item?.file_type_id !== id);
    }

    let apiData = {
      "id": questionId,
      "category_id": currentRecordId,
      "data_type_id": questionData?.data_type_id,
      "order": questionData?.order,
      category_form_file_type_map: updatedList
    };

    const method = "PUT";
    const url = "/category/form/"

    addUpdateAPI(method, url, apiData)
      .then((res) => {
        if (res?.data?.status) {
          getCategoryOne();
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
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
      });
  };
  const handleQuestionCollapse = (panel) => (event, isExpanded) => {
    setQuestionExpanded(isExpanded ? panel : false);
    setExpanded(false);
  };

  const updateQuestionsType = (fieldName, value, questionId, questionData) => {

    let apiData = {}
    // let apiData = {
    //   "id": questionId,
    //   "name": value,
    //   "order": questionData?.order,
    // }

    if (fieldName === "fieldName") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "name": value,
        "order": questionData?.order,
      };
    }
    if (fieldName === "fieldPlace") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "placeholder": value,
        "order": questionData?.order,
      };
    }
    if (fieldName === "fieldMandatoryQ") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "required": value.currentTarget.checked,
        "order": questionData?.order,
      };
    }

    if (fieldName === "fieldAllowDecimal") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "order": questionData?.order,
        "allow_decimal": value.currentTarget.checked,
      };
    }
    if (fieldName === "fieldRegex") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "regex": value,
        "order": questionData?.order,
      };
    }
    if (fieldName === "fieldWar") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "regex_error_msg": value,
        "order": questionData?.order,
      };
    }
    if (fieldName === "char_length") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "max_length": value,
        "order": questionData?.order,
      };
    }
    if (fieldName === "dateFormat") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "date_format": value,
        "order": questionData?.order,
      };
    }
    if (fieldName === "timeFormat") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "time_format_24": value,
        "order": questionData?.order,
      };
    }
    if (fieldName === "file_size_limit") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "max_file_size": value,
        "order": questionData?.order,
      };
    }
    if (fieldName === "future_date") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "allow_future_date": value.currentTarget.checked,
        "order": questionData?.order,
      };
    }
    if (fieldName === "past_date") {
      apiData = {
        "id": questionId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "allow_past_date": value.currentTarget.checked,
        "order": questionData?.order,
      };
    }

    const method = "PUT";
    const url = "/category/form/"

    addUpdateAPI(method, url, apiData)
      .then((res) => {
        if (res?.data?.status) {
          getCategoryOne();

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
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // setLoading(false);
      });



  }
  const handleCreateOptionSet = (event, questionsId, seqData, questionData) => {
    let x;
    if (seqData?.length === 0) {
      x = 1
    } else {
      x = seqData[seqData?.length - 1]?.sequence + 1
    }
    if (event.target.value !== "") {
      let apiData = {
        "id": questionsId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "order": questionData?.order,
        category_form_options: [
          {
            value: event.target.value,
            default_select: false,
          }
        ],
      };

      const method = "PUT";
      const url = "/category/form/"

      addUpdateAPI(method, url, apiData)
        .then((res) => {
          if (res?.data?.status) {
            getCategoryOne();
            event.target.value = ""; // Clear input field after saving
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
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
        });
    }

  }
  const handleUpdateOptionSet = (value, questionsId, optionId, seqData, optionData, questionData) => {

    if (value !== undefined && value !== '') {
      let apiData = {
        "id": questionsId,
        "category_id": currentRecordId,
        "data_type_id": questionData?.data_type_id,
        "order": questionData?.order,
        category_form_options: [
          {
            "id": optionId,
            value: value,
            default_select: false,
            order: optionData?.order
          }
        ],
      };

      const method = "PUT";
      const url = "/category/form/"

      addUpdateAPI(method, url, apiData)
        .then((res) => {
          if (res?.data?.status) {
            getCategoryOne();

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
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
        });
    }
  }
  const callFunc = (data) => {
    let x = data?.filter(it => {
      return it?.status === "ACTIVE" && it?.showInQuestion === true
    })
    let sorting = x?.sort((a, b) => a?.sequence - b?.sequence);
    return sorting
  }

  const handleDeleteOption = (questionsId, optionId, optionData, questionData) => {

    const url = `/category/options/` + optionId;

    deleteAPI(url)
      .then((res) => {
        if (res?.data?.status) {
          getCategoryOne();

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
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
      });
  }
  const onSubmit = (data) => {
    let apiData = {
      "id": currentRecordId ? currentRecordId : null,
      "name": data?.name,
      "type": data?.renewal_period_type?.value,
      "is_renewal": data?.is_renewal,
      "is_due": data?.is_due,
      "renewal_iteration": data?.renewal_period_iteration,
      "description": data?.description,
      "category_financial_due_map": data?.is_due ? [
        {
          "due_day": data?.day?.value,
          "due_month": data?.month?.value,
          "financial_year_id": data?.financial_year_id?.value,
        }
      ] : [],
      // "category_form": []
    };

    const method = !isEdit ? "POST" : "PUT";
    const url = !isEdit
      ? "/category/"
      : `/category/${currentRecordId}/`;

    addUpdateAPI(method, url, apiData)
      .then((res) => {
        if (res?.data?.status) {
          Swal.fire({
            toast: true,
            position: 'top-end',
            icon: 'success',
            title: !isEdit ? 'Created!' : 'Updated!',
            text: res?.data?.details || 'Something went wrong!',
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            background: ' #28a745',
            color: '  #ffff'
          });


          setIsEdit(true)
          setCurrentRecordId(res?.data?.data.id)
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
      .catch((err) => {
        console.log(err);
      })
      .finally(() => {
        // setLoading(false);
      });
  };
  const renewal_period_type = watch("renewal_period_type");
  // console.log("renewal_period_type", renewal_period_type);
  const renewal_period_iteration = watch("renewal_period_iteration");
  // console.log("renewal_period_iteration", renewal_period_iteration);



  return (
    <div className="card p-4 pt-2 shadow">
      <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
        <button className="btn" type="button" onClick={handleBackClick}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h6 className="fw-bold text-dark mb-0">Portfolio Category - {id ? "Update" : "Add"}</h6>
        <div />
      </div>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label className="form-label">Name <span className='text-danger'>*</span></label>
            <input type="text" placeholder="Name" {...register("name")} className={`form-control ${errors.name ? "is-invalid" : ""}`} />
            <p className="text-danger mb-0">{errors.name?.message}</p>
          </div>

          <div className="col-md-4 mb-3 d-flex align-items-right mb-3">
            <div className="me-4 d-flex align-items-center">
              <input
                type="checkbox"
                className="form-check-input me-2 p-2"
                id="isDueCheckbox"
                {...register("is_due")}
              />
              <label className="form-check-label" htmlFor="isDueCheckbox">
                Is Due
              </label>
            </div>

            <div className="d-flex align-items-center">
              <input
                type="checkbox"
                className="form-check-input me-2 p-2"
                id="isRenewalCheckbox"
                {...register("is_renewal")}
              />
              <label className="form-check-label" htmlFor="isRenewalCheckbox">
                Is Renewal
              </label>
            </div>
          </div>

          {isDueChecked && (
            <>
              <div className="mb-3 col-md-4">
                <label className="form-label">
                  Financial Year <span className="text-danger">*</span>
                </label>
                <Controller
                  name="financial_year_id"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={financeYearOptions}
                      className="custom-react-select"
                      placeholder="Select financial year"
                      isClearable
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption);
                        setValue("month", "");
                        setValue("day", "");
                      }}
                    />
                  )}
                />
                <p className="text-danger">
                  {errors.financial_year_id?.message}
                </p>
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Month <span className="text-danger">*</span>
                </label>
                <Controller
                  name="month"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={monthOptions}
                      placeholder="Select Month"
                      onChange={(selectedOption) => {
                        field.onChange(selectedOption);
                        setValue("day", "");  // Reset day when changing month
                      }}
                    />
                  )}
                />
                <p className="text-danger">
                  {errors.month?.message}
                </p>
              </div>
              {/* ) */}
              {/* Day Dropdown */}
              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Day <span className="text-danger">*</span>
                </label>
                <Controller
                  name="day"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={dayOptions}
                      placeholder="Select Day"
                    />
                  )}
                />
                <p className="text-danger">
                  {errors.day?.message}
                </p>
              </div>
            </>
            // <div className="col-md-4 mb-1">
            //   <label className="form-label">Due Date <span className='text-danger'>*</span></label>
            //   <input type="date" {...register("due_date")} className={`form-control ${errors.due_date ? "is-invalid" : ""}`} />
            //   <p className="text-danger">{errors.due_date?.message}</p>
            // </div>
          )}

          {isRenewalChecked && (

            <>


              <div className="col-md-4 mb-3">
                <label className="form-label">
                  Type <span className="text-danger">*</span>
                </label>

                <Controller
                  name="renewal_period_type"
                  control={control}
                  // rules={{ required: "Renewal period is required" }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={optionsTYpe}
                      className="custom-react-select"
                      placeholder="Select type"
                      isClearable
                    />
                  )}
                />

                <p className="text-danger">
                  {errors.renewal_period_type?.message}
                </p>
              </div>
              <div className="col-md-4 mb-1">
                <label className="form-label">
                  Renewal Period Iteration <span className="text-danger">*</span>
                </label>

                <>
                  {
                    renewal_period_type?.value === "year" ? (
                      <input
                        {...register("renewal_period_iteration")}
                        type="text"
                        className={`form-control ${errors.renewal_period_iteration ? "is-invalid" : ""}`}
                        placeholder="Enter period"
                        onInput={(e) => e.target.value = e.target.value.replace(/\D/g, '')} // Allow only numbers
                      />
                    )
                      : renewal_period_type?.value === "month" && (

              

                        <Controller
                          name="renewal_period_iteration"
                          control={control}
                          render={({ field }) => (
                            <Select
                              {...field}
                              options={month_itreations}
                              className="custom-react-select"
                              placeholder="Select type"
                              isClearable
                              // Important: update the form state correctly
                              // value={month_itreations.find(option => option.value === field.value) || null}
                              value={
                                month_itreations.find(
                                  option => option.value === String(field.value) // Ensure comparison is between strings
                                ) || null
                              }
                              onChange={(selectedOption) => field.onChange(selectedOption ? selectedOption.value : '')}
                            />
                          )}
                        />
                      )
                  }
                </>



                <div className="invalid-feedback">{errors.renewal_period_iteration?.message}</div>
              </div>
            </>
            // </div>
          )}

          {/* Description Field */}
          <div className="mb-3 col-md-4">
            <label className="form-label">
              Description
            </label>
            <textarea
              {...register("description")}
              className={`form-control ${errors.description ? "is-invalid" : ""}`}
              placeholder="Enter description"
            />
            {errors.description && (
              <div className="invalid-feedback">{errors?.description?.message}</div>
            )}
          </div>
        </div>
        <div className="text-center">
          <button type="submit" className="btn btn-sm btn-primary w-20 px-4 adminBtn">{currentRecords?.length === 0 ? "Save" : "Update"}</button>
        </div>
      </form>
      <hr></hr>
      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <Grid container spacing={2}>

          <Grid item xs={12}>
            {

              currentRecords?.category_form?.length > 0 && (
                <SortableContext items={currentRecords?.category_form?.map((field) => field.id)}>
                  {currentRecords?.category_form?.map((field, index) => (
                    <SortableItem key={field?.id} id={field?.id}>
                      {(listeners, attributes) => (
                        <Accordion expanded={expanded === field.id} onChange={() => handleExpand(field.id)}>
                          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Grid container alignItems="center" spacing={2} style={{ backgroundColor: "#f5f5f5" }}>
                              <Grid item>
                                <IconButton {...listeners} {...attributes} style={{ cursor: "grab" }}>
                                  <DragIndicatorIcon />
                                </IconButton>
                              </Grid>
                              <Grid item>
                                <Checkbox
                                  onClick={(e) => e.stopPropagation()}
                                  onChange={(e) => handleChangeQis(field.id, e)}
                                />
                              </Grid>
                              <Grid item xs={9}>
                                <Typography>
                                  {index + 1}. {field?.name}
                                </Typography>
                              </Grid>
                              <Grid item>
                                <Typography color="primary">{field?.data_type?.name || "Select Type"}</Typography>
                              </Grid>
                            </Grid>
                          </AccordionSummary>
                          <AccordionDetails>
                            <Box mt={2}>
                              {
                                field?.data_type?.name && (
                                  <Grid container spacing={6} mb={2} alignItems="center">
                                    <Grid item xs={5}>
                                      <TextField
                                        className="text-center p-1"
                                        InputProps={{ sx: { height: 40 } }}
                                        label="Question Name"
                                        fullWidth
                                        margin="dense"
                                        placeholder="Enter Question Name"
                                        defaultValue={field?.name}
                                        onBlur={(e) => updateQuestionsType("fieldName", e.target.value, field?.id, field)}
                                      />
                                    </Grid>
                                    <Grid item xs={5}>
                                      <TextField
                                        className="text-center p-1"
                                        InputProps={{ sx: { height: 40 } }}
                                        label="Placeholder"
                                        fullWidth
                                        margin="dense"
                                        placeholder="Enter text here"
                                        defaultValue={field?.placeholder}
                                        onBlur={(e) => updateQuestionsType("fieldPlace", e.target.value, field?.id, field)}
                                      />
                                    </Grid>
                                  </Grid>
                                )}

                              {field?.data_type?.name === "File Upload" && (
                                <>
                                  {/* Upload limit input */}
                                  <Grid item xs={12} sm={4} mt={2}>
                                    <Box mt={2}>
                                      <TextField
                                        InputProps={{ sx: { height: 40 } }}
                                        label="File Size Limit (MB)"
                                        type="number"
                                        fullWidth
                                        placeholder="Enter max size"
                                        inputProps={{ min: 1 }}
                                        defaultValue={field?.max_file_size || ""}
                                        onChange={(e) =>
                                          updateQuestionsType("file_size_limit", e.target.value, field?.id, field)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                          }
                                        }}
                                      />
                                    </Box>
                                  </Grid>
                                  <Grid item xs={12} sm={6} mt={2} key={index} container alignItems="center">
                                    <div className="mb-1">
                                      <Box mt={1} p={1} border={1} borderColor="grey.300" borderRadius={1}>
                                        <Typography variant="body2" color="textSecondary">
                                          Allowed file types:
                                        </Typography>
                                        {catFileTypes?.file_upload?.map((type) => (
                                          <FormControlLabel
                                            key={type?.id}
                                            control={<Checkbox value={type?.id} />}
                                            label={type?.name}
                                            checked={field?.category_form_file_type_map?.some((item) => Number(item?.file_type_id) === Number(type?.id))}
                                            onChange={(e) => handleChangeFileOimgs(type?.id, e, type, field?.id, field)}
                                          />
                                        ))}
                                      </Box>
                                    </div>
                                  </Grid>
                                </>
                              )}
                              {
                                field?.data_type?.name === "Image" && (
                                  <>
                                    {/* Upload limit input */}
                                    <Grid item xs={12} sm={4} mt={2}>
                                      <Box mt={2}>
                                        <TextField
                                          InputProps={{ sx: { height: 40 } }}
                                          label="File Size Limit (MB)"
                                          type="number"
                                          fullWidth
                                          placeholder="Enter max size"
                                          inputProps={{ min: 1 }}
                                          defaultValue={field?.max_file_size || ""}
                                          onChange={(e) =>
                                            updateQuestionsType("file_size_limit", e.target.value, field?.id, field)
                                          }
                                          onKeyDown={(e) => {
                                            if (e.key === '-' || e.key === 'e') {
                                              e.preventDefault();
                                            }
                                          }}
                                        />
                                      </Box>
                                    </Grid>
                                    <Grid item xs={12} sm={6} mt={2} key={index} container alignItems="center">
                                      <div className="mb-1">
                                        <Box mt={1} p={1} border={1} borderColor="grey.300" borderRadius={1}>
                                          <Typography variant="body2" color="textSecondary">
                                            Allowed file types:
                                          </Typography>
                                          {catFileTypes?.image?.map((type) => (
                                            <FormControlLabel
                                              key={type?.id}
                                              control={<Checkbox value={type?.id} />}
                                              label={type?.name}
                                              checked={field?.category_form_file_type_map?.some((item) => Number(item?.file_type_id) === Number(type?.id))}
                                              onChange={(e) => handleChangeFileOimgs(type?.id, e, type, field?.id, field)}
                                            />
                                          ))}
                                        </Box>
                                      </div>
                                    </Grid>
                                  </>
                                )}{
                                field?.data_type?.name === "Single Choice" && (
                                  <>

                                    {field?.category_form_options?.length > 0 &&
                                      field?.category_form_options?.map((optionItem, index) => (
                                        <Grid item xs={12} mt={2} container spacing={2} alignItems="center" key={optionItem?.id} id={index}>
                                          <Grid item xs={6} container spacing={1} alignItems="center">
                                            <Grid item>
                                              <Box display="flex" alignItems="center" justifyContent="center" width={30} height={40} bgcolor="grey.500" borderRadius={1}>
                                                <i className="fas fa-ellipsis-v text-white" style={{ fontSize: '16px' }}></i>
                                              </Box>
                                            </Grid>
                                            <Grid item xs>
                                              <TextField
                                                fullWidth
                                                variant="outlined"
                                                placeholder="Update option"
                                                name="optionName"
                                                defaultValue={optionItem?.value}
                                                onBlur={(e) => handleUpdateOptionSet(e.currentTarget.value, field?.id, optionItem?.id, callFunc(field?.category_form_options), optionItem, field)}
                                              />
                                            </Grid>

                                          </Grid>
                                          <Grid item>
                                            <Tooltip title="Delete">
                                              <IconButton onClick={() => handleDeleteOption(field?.id, optionItem?.id, optionItem, field)} color="error">
                                                <DeleteIcon />
                                              </IconButton>
                                            </Tooltip>
                                          </Grid>
                                        </Grid>
                                      ))}

                                    <Grid item xs={12} mt={2} container spacing={2} alignItems="center">
                                      <Grid item xs={6} container spacing={1} alignItems="center">
                                        <Grid item>
                                          <Box display="flex" alignItems="center" justifyContent="center" width={30} height={40} bgcolor="grey.500" borderRadius={1}>
                                            <i className="fas fa-ellipsis-v text-white" style={{ fontSize: '16px' }}></i>
                                          </Box>
                                        </Grid>
                                        <Grid item xs>
                                          <TextField
                                            InputProps={{ sx: { height: 40 } }}
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Create new option"
                                            name="optionName"
                                            onBlur={(e) => handleCreateOptionSet(e, field?.id, callFunc(field?.category_form_options), field)}
                                          />
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>
                                )}
                              {
                                field?.data_type?.name === "Multi Choice" && (
                                  <>

                                    {field?.category_form_options?.length > 0 &&
                                      field?.category_form_options?.map((optionItem, index) => (
                                        <Grid item xs={12} mt={2} container spacing={2} alignItems="center" key={optionItem?.id} id={index}>
                                          <Grid item xs={6} container spacing={1} alignItems="center">
                                            <Grid item>
                                              <Box display="flex" alignItems="center" justifyContent="center" width={30} height={40} bgcolor="grey.500" borderRadius={1}>
                                                <i className="fas fa-ellipsis-v text-white" style={{ fontSize: '16px' }}></i>
                                              </Box>
                                            </Grid>
                                            <Grid item xs>
                                              <TextField
                                                fullWidth
                                                variant="outlined"
                                                placeholder="Update option"
                                                name="optionName"
                                                defaultValue={optionItem?.value}
                                                onBlur={(e) => handleUpdateOptionSet(e.currentTarget.value, field?.id, optionItem?.id, callFunc(field?.category_form_options), optionItem, field)}
                                              />
                                            </Grid>

                                          </Grid>
                                          <Grid item>
                                            <Tooltip title="Delete">
                                              <IconButton onClick={() => handleDeleteOption(field?.id, optionItem?.id, optionItem, field)} color="error">
                                                <DeleteIcon />
                                              </IconButton>
                                            </Tooltip>
                                          </Grid>
                                        </Grid>
                                      ))}

                                    <Grid item xs={12} mt={2} container spacing={2} alignItems="center">
                                      <Grid item xs={6} container spacing={1} alignItems="center">
                                        <Grid item>
                                          <Box display="flex" alignItems="center" justifyContent="center" width={30} height={40} bgcolor="grey.500" borderRadius={1}>
                                            <i className="fas fa-ellipsis-v text-white" style={{ fontSize: '16px' }}></i>
                                          </Box>
                                        </Grid>
                                        <Grid item xs>
                                          <TextField
                                            InputProps={{ sx: { height: 40 } }}
                                            fullWidth
                                            variant="outlined"
                                            placeholder="Create new option"
                                            name="optionName"
                                            onBlur={(e) => handleCreateOptionSet(e, field?.id, callFunc(field?.category_form_options), field)}
                                          />
                                        </Grid>
                                      </Grid>
                                    </Grid>
                                  </>
                                )}
                              {
                                field?.data_type?.name === "Text" && (
                                  <Grid container spacing={6} alignItems="center">
                                    <Grid item xs={5}>
                                      <TextField
                                        className="text-center p-1"
                                        InputProps={{ sx: { height: 40 } }}
                                        label="Regex"
                                        fullWidth
                                        margin="dense"
                                        placeholder="Enter regex"
                                        defaultValue={field?.regex}
                                        onBlur={(e) => updateQuestionsType("fieldRegex", e.target.value, field?.id, field)}
                                      />
                                    </Grid>
                                    <Grid item xs={5}>
                                      <TextField
                                        className="text-center p-1"
                                        InputProps={{ sx: { height: 40 } }}
                                        label="Warning Message"
                                        fullWidth
                                        margin="dense"
                                        placeholder="Enter warning message"
                                        defaultValue={field?.regex_error_msg}
                                        onBlur={(e) => updateQuestionsType("fieldWar", e.target.value, field?.id, field)}
                                      />
                                    </Grid>
                                    <Grid item xs={5} >
                                      <TextField
                                        InputProps={{ sx: { height: 40 } }}
                                        label="Character Limit"
                                        type="number"
                                        fullWidth
                                        margin="dense"
                                        placeholder="Enter character limit"
                                        defaultValue={field?.max_length}
                                        onBlur={(e) =>
                                          updateQuestionsType("char_length", e.target.value, field?.id, field)
                                        }
                                        onKeyDown={(e) => {
                                          if (e.key === '-' || e.key === 'e') {
                                            e.preventDefault();
                                          }
                                        }}
                                        inputProps={{ min: 0 }}
                                      />
                                    </Grid>
                                  </Grid>
                                )}
                              {field?.data_type?.name === "Number" && (
                                <Grid item xs={12} sm={6} mt={2}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={field?.allow_decimal}
                                        onChange={(e) => updateQuestionsType("fieldAllowDecimal", e, field?.id, field)}
                                      />
                                    }
                                    label="Allow Decimal Numbers"
                                  />
                                </Grid>
                              )}
                              {field?.data_type?.name === "Date" && (
                                <Grid container spacing={2} mt={2}>
                                  {/* Date Format */}
                                  <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset" fullWidth>
                                      <FormLabel component="legend">Date Format</FormLabel>
                                      <RadioGroup
                                        row
                                        name={`dateFormat${field?.id}`}
                                        value={field?.date_format}
                                        onChange={(e) =>
                                          updateQuestionsType("dateFormat", e.target.value, field?.id, field)
                                        }
                                      >
                                        <FormControlLabel
                                          value="DD/MM/YYYY"
                                          control={<Radio className="largerCheckbox" />}
                                          label="DD/MM/YYYY"
                                        />
                                        <FormControlLabel
                                          value="MM/DD/YYYY"
                                          control={<Radio className="largerCheckbox" />}
                                          label="MM/DD/YYYY"
                                        />
                                      </RadioGroup>
                                    </FormControl>
                                  </Grid>

                                  {/* Allow Dates */}
                                  <Grid item xs={12} sm={6}>
                                    <FormControl component="fieldset" fullWidth>
                                      <FormLabel component="legend">Allow Dates</FormLabel>
                                      <FormGroup row>
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              checked={field?.allow_future_date}
                                              onChange={(e) =>
                                                updateQuestionsType("future_date", e, field?.id, field)
                                              }
                                              className="largerCheckbox"
                                            />
                                          }
                                          label="Future date"
                                        />
                                        <FormControlLabel
                                          control={
                                            <Checkbox
                                              checked={field?.allow_past_date}
                                              onChange={(e) =>
                                                updateQuestionsType("past_date", e, field?.id, field)
                                              }
                                              className="largerCheckbox"
                                            />
                                          }
                                          label="Past date"
                                        />
                                      </FormGroup>
                                    </FormControl>
                                  </Grid>
                                </Grid>
                              )}
                              {
                                field?.data_type?.name === "Time" && (
                                  <Grid item xs={12} sm={6} mt={2}>
                                    <FormControl component="fieldset" fullWidth>
                                      <FormLabel component="legend">Time Format</FormLabel>
                                      <RadioGroup
                                        row
                                        name={`timeFormat${field?.id}`}
                                        // value={field?.time_format_24 ? "24" : "12"} // convert boolean to string
                                        onChange={(e) =>
                                          updateQuestionsType(
                                            "timeFormat",
                                            e.target.value === "24", // convert string to boolean
                                            field?.id,
                                            field
                                          )
                                        }
                                      >
                                        <FormControlLabel
                                          value="12"
                                          control={<Radio className="largerCheckbox" />}
                                          label="12 Hour"
                                        />
                                        <FormControlLabel
                                          value="24"
                                          control={<Radio className="largerCheckbox" />}
                                          label="24 Hour"
                                        />
                                      </RadioGroup>
                                    </FormControl>
                                  </Grid>
                                )}
                              {/* Mandotory */}
                              <Grid item xs={12} sm={6} mt={2}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      id={`Independantquestion${field?.id}`}
                                      checked={field?.required}
                                      onChange={(e) => updateQuestionsType("fieldMandatoryQ", e, field?.id, field)}
                                    />
                                  }
                                  label="Mandatory question"
                                />
                                <span className='text-danger'>*</span>
                              </Grid>
                            </Box>

                            <br></br><div className=''>
                              <hr />
                              <div className='d-flex justify-content-between '>
                                <button className='btn btn-light mr-auto'
                                  onClick={() => handleDeleteQuestions(field?.id, field)}
                                >
                                  <i className="fas fa-trash ml-2 text-danger"></i> Delete</button>

                              </div>
                              <div>
                              </div>
                            </div>
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </SortableItem>
                  ))}
                </SortableContext>
              )
            }
            {/* {
              currentRecords?.length === 0 && (
                <div className="text-center">
                  <p className="text-danger">No form fields found.</p>
                </div>
              )
            } */}

          </Grid>
        </Grid>
      </DndContext>

      {/* add question */}
      {
        currentRecordId !== undefined &&
        <Accordion expanded={questionExpanded === "panelOne"}
          onChange={handleQuestionCollapse("panelOne")}
        >

          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography component="span">
              <div className=" bg-light text-dark d-flex justify-content-center ">
                {/* {
                currentRecordId !== undefined && */}
                <button
                  className='btn btn-success'
                  type="button"
                  title="Add"
                  onClick={(e) => handleAddQuestionType()}
                ><i className="fas fa-plus-square text-white"></i> Add Question
                </button>
                {/* } */}
                &nbsp;&nbsp;
                {
                  selectedQIds?.length > 0 &&
                  <button
                    className='btn btn-danger'
                    type="button"
                    title="Delete"
                    onClick={(e) => handleDeleteQuestionsMulti(e)}
                  ><i className="fas fa-trash text-white"></i> Delete {selectedQIds?.length > 1 ? "Questions" : "Question"}
                  </button>}
              </div>
            </Typography>

          </AccordionSummary>

          <AccordionDetails>
            <Typography component="span">

              <Box mt={2}>
                <Typography>Select Question Type</Typography>
                <Grid container spacing={1}>
                  {questionsTypeList?.map((type, index) => (
                    <Grid item xs={3} key={type?.id || index}>
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() => {
                          createQuestions(type?.id, type?.name)
                          setExpanded(null)
                        }
                        }
                      >
                        {type?.name} {/* Display the "name" property */}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Typography>
          </AccordionDetails>

        </Accordion>
      }

    </div>
  );
};

export default DynamicForm;
