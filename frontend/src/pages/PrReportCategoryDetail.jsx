import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { getAPI } from '../constant/apiServices';
import Select from 'react-select';
import DataTable from 'react-data-table-component';
import { tableStyle } from '../constant/Util';
import Loader from '../constant/loader';

function PrReportCategoryDetail() {
    const navigate = useNavigate();
    const location = useLocation();
    const category = location?.state?.category;
    const itemCategory = location?.state?.itemCategory;

    const [error, setError] = useState(false);
    const [yearError, setYearError] = useState(false);

    const [filterSubmitted, setFilterSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [prReportFliterList, setPrReportFilterList] = useState([]);
    const [prReportFliterData, setPrReportFilterData] = useState([]);
    const [financialYearList, setFinancialYearList] = useState([])

    const [filterValue, setFilterValue] = useState(null); // Changed to null for better handling
    const [selectedYear, setSelectedYear] = useState(null);

    const [viewAnswer, setViewAnswer] = useState([]);

    const getprReportFilterList = useCallback((selectedYear) => {
        setLoading(true);
        if (itemCategory?.category?.type?.toLowerCase() === "month") {
            getAPI(`/reports/periodicalFilter?financial_year_id=` + selectedYear + `&category_id=` + itemCategory?.category?.id).then((res) => {
                if (res?.data?.status) {
                    setPrReportFilterList(res?.data?.data)
                } else {
                    setPrReportFilterList([])
                }
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                setLoading(false)
            })
        } else {
            getAPI(`/reports/periodicalFilter?category_id=` + itemCategory?.category?.id).then((res) => {
                if (res?.data?.status) {
                    setPrReportFilterList(res?.data?.data)
                } else {
                    setPrReportFilterList([])
                }
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                setLoading(false)
            })
        }
    }, [itemCategory?.category?.id, itemCategory?.category?.type])

    const getprReportFilterByCategoryList = useCallback((search) => {
        setLoading(true);
        getAPI(`/reports/membersByCategory?portfolio_id=${category?.id}&category_id=${itemCategory?.category?.id}`).then((res) => {
            if (res?.data?.status) {
                setPrReportFilterData(res?.data?.data)
            } else {
                setPrReportFilterData([])
            }
        }).catch((err) => {
            console.log(err);
        }).finally(() => {
            setLoading(false)
        })
    }, [category?.id, itemCategory?.category?.id])

    const getFinancialYearList = () => {
        getAPI('/category/financialyear?skip=0&limit=0').then((res) => {
            if (res?.status) {
                setFinancialYearList(res?.data?.data)
            }
        }).catch((err) => {
            console.log(err);
        })
    }

    const handelOpenFile = (id) => {
        getAPI(`/answers/${id}`).then((res) => {
            if (res?.data?.status) {
                setViewAnswer(res?.data?.data.answer_data);
                // setAuditTrail(res?.data?.data);
            }
        })
    }

    useEffect(() => {
        getFinancialYearList();
        if (itemCategory?.category?.type.toLowerCase() !== "month") {
            getprReportFilterList();
        }
    }, [getprReportFilterList, itemCategory?.category?.type]);

    const financeYearOptions = financialYearList.map((comm) => ({
        value: comm?.id,
        label: comm?.year,
    }));

    const columns = [
        {
            name: '#',
            selector: (row, index) => index + 1,
            width: '60px',
            center: true,
        },
        {
            name: 'Entity Name',
            cell: (row) => <label className='text-truncate' title={row.name}>{row?.name}</label>,
            width: '250px'
        },
        {
            name: 'DDM Name',
            cell: (row) => <label className='text-truncate' title={row.ddm_user}>{row?.ddm_user}</label>,
            width: '200px'
        },
        // {
        //     name: 'Remarks',
        //     cell: (row) => <label className='text-truncate' title={row?.remarks}>{row?.remarks}</label>,
        //     width: '250px'
        // },
        {
            name: 'Date Entered in DMS',
            selector: (row) => row.date,
            cell: (row) => (
                <span style={{ color: row?.date === 'Pending Entry' ? 'red' : 'black' }}>
                    {row?.latest_version_date ? new Date(row?.latest_version_date).toLocaleString('default', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                </span>
            ),
            width: '250px'
        },
        {
            name: 'View Document',
            cell: (row) => {
                if (row?.type) {
                  // Type is present
                  if (row?.documents?.length > 0 && row?.type === "Registered") {
                    return (
                      <a
                        onClick={() => handelOpenFile(row?.documents?.[0]?.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "blue", textDecoration: "underline" }}
                      >
                        View Document
                      </a>
                    );
                  
                  } else {
                    return row?.type && row?.type !== "Registered" ? row?.type : <span style={{ color: "red" }}>No Document</span>;
                  }
                } else {
                  // Type is not present
                  if (row?.documents?.length > 0) {
                    return (
                      <a
                        onClick={() => handelOpenFile(row?.documents?.[0]?.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "blue", textDecoration: "underline" }}
                      >
                        View Document
                      </a>
                    );
                  } else {
                    return <span style={{ color: "red" }}>No Document</span>;
                  }
                }
              },
            ignoreRowClick: true,
            allowOverflow: true,
            button: true,
            width: '350px'
        }
    ];

    const handleBackClick = () => {
        navigate("/report/byPeriodicalReport");
    };

    const handleChange = (selectedOption) => {
        setFilterValue(selectedOption);
        setError(false);
        setFilterSubmitted(false);
    };

    const handleChangeFYear = (selectedOption) => {
        if (selectedOption) {
            setSelectedYear(selectedOption);
            getprReportFilterList(selectedOption?.value);
            // Clear the date range filter when year changes
            setFilterValue(null);
        } else {
            setSelectedYear(null);
            // Clear the date range options and value when year is deselected
            setPrReportFilterList([]);
            setFilterValue(null);
        }
        setYearError(false);
    };

    const handleFilterSubmit = () => {
        const isMonthCategory = itemCategory?.category?.type.toLowerCase() === 'month';
        const isMonthValid = !!filterValue?.value;
        const isYearValid = isMonthCategory ? !!selectedYear : true;

        setError(!isMonthValid);
        setYearError(isMonthCategory && !selectedYear);

        if (!isMonthValid || !isYearValid) return;

        setFilterSubmitted(true);

        if (filterValue?.value !== undefined) {
            setLoading(true);
            getAPI(`/reports/membersByCategory?portfolio_id=${category?.id}&category_id=${itemCategory?.category?.id}&date_range=${filterValue.value}`).then((res) => {
                if (res?.data?.status) {
                    setPrReportFilterData(res?.data?.data)
                } else {
                    setPrReportFilterData([])
                }
            }).catch((err) => {
                console.log(err);
            }).finally(() => {
                setLoading(false)
            })
        } else {
            getprReportFilterByCategoryList();
        }
    }


    useEffect(() => {
        if (viewAnswer && Object.keys(viewAnswer).length > 0) {
            // Open Bootstrap Modal Programmatically
            const modalElement = document.getElementById("detailsModal");
            if (modalElement) {
                const modalInstance = new bootstrap.Modal(modalElement);
                modalInstance.show();
            }
        }
    }, [viewAnswer]);


    return (
        <div className="card p-4 pt-2 shadow">
            <div className="d-flex align-items-center justify-content-between mb-3 border-bottom">
                <button className="btn" type="button" onClick={handleBackClick}>
                    <i className="fa-solid fa-circle-left fs-5" />
                </button>
                <div />
            </div>

            <div className='d-flex justify-content-between p-2 flex-wrap bg-white'>
                <div className='p-2 col-lg-5 col-12'>
                    <h6 className='fw-bold mb-0'>{category?.name}{" - "}{itemCategory?.category?.name}</h6>
                </div>
                <div className='d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1 mb-2'>
                    <div className='row col-12'>
                        <label className='col-form-label p-0'>Filter by {itemCategory?.category?.type}</label>
                        <div className="col-md-4 p-0 pe-2">
                            <Select
                                options={prReportFliterList.length ? prReportFliterList : [{ value: '', label: 'Select month' }]}
                                placeholder={"Filter by " + itemCategory?.category?.type}
                                isClearable
                                value={filterValue}
                                onChange={handleChange}
                                className="react-select-container"
                                classNamePrefix="react-select"
                                isDisabled={!selectedYear && itemCategory?.category?.type.toLowerCase() === 'month'}
                                styles={{
                                    control: (baseStyles, state) => ({
                                        ...baseStyles,
                                        borderColor: error ? 'red' : baseStyles.borderColor,
                                        boxShadow: error ? '0 0 0 1px red' : baseStyles.boxShadow,
                                        '&:hover': {
                                            borderColor: error ? 'red' : baseStyles.borderColor,
                                        },
                                    }),
                                }}
                            />
                            {error && <div className="text-danger mt-1">Please select a value.</div>}
                        </div>
                        {
                            itemCategory?.category?.type.toLowerCase() === 'month' &&
                            <div className="col-md-4 p-0 pe-2">
                                <Select
                                    options={financeYearOptions}
                                    className="custom-react-select"
                                    placeholder="Select financial year"
                                    isClearable
                                    value={selectedYear}
                                    onChange={handleChangeFYear}
                                    classNamePrefix="react-select"
                                    styles={{
                                        control: (baseStyles) => ({
                                            ...baseStyles,
                                            borderColor: yearError ? 'red' : baseStyles.borderColor,
                                            boxShadow: yearError ? '0 0 0 1px red' : baseStyles.boxShadow,
                                            zIndex: 5, // zIndex alone won't fix dropdown overlap
                                        }),
                                        menu: (baseStyles) => ({
                                            ...baseStyles,
                                            zIndex: 9999, // Make sure the dropdown menu appears above all
                                        }),
                                    }}
                                />
                                {yearError && <div className="text-danger mt-1">Please select a financial year.</div>}
                            </div>
                        }
                        <div className='col-md-4 p-0 pe-2'>
                            <div className='d-flex'>
                                <div className="me-2 d-flex align-items-center justify-content-center w-100">
                                    <button type="submit" className="btn btn-sm btn-primary px-4 p-2 adminBtn" onClick={handleFilterSubmit}>Proceed</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card" style={{ margin: "7px" }}>
                <DataTable
                    columns={columns}
                    data={prReportFliterData}
                    noHeader
                    striped
                    dense
                    customStyles={tableStyle}
                    paginationRowsPerPageOptions={[25, 50, 75, 100]}
                    pagination
                    paginationServer
                    highlightOnHover
                    pointerOnHover
                    responsive
                    noDataComponent={
                        filterSubmitted && prReportFliterData?.length === 0
                            ? <div className="p-3 text-center">No data found for the selected filter.</div>
                            : <div className="p-3 text-center">No data found — please apply a filter to view results.</div>
                    }
                    paginationPerPage={25}
                />
            </div>

            <div className="modal fade" id="detailsModal" tabIndex="-1" aria-labelledby="detailsModalLabel" aria-hidden="true">
                <div className="modal-dialog modal-xl">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">View Details</h5>
                            <button type="button" className="btn-sm btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div className="modal-body">

                            <div className="row">
                                {Object.entries(viewAnswer ?? {}).map(([key, item]) => {
                                    if (Array.isArray(item)) return null; // Skip file data initially

                                    let answerText = "";

                                    if (item?.question_type === "Multi Choice" && Array.isArray(item?.answer)) {
                                        // Extract labels from Multi Choice answers
                                        answerText = item?.answer.map(opt => opt.label).join(", ");
                                    } else if (typeof item?.answer === "object" && item?.answer !== null) {
                                        // Handle Single Choice answer
                                        answerText = item?.answer.label;
                                    } else {
                                        // Default case for Text, Number, Date, Time
                                        answerText = item?.answer;
                                    }

                                    return (
                                        <div key={key} className="col-md-4 mb-3">
                                            <label className="form-label">{item?.question_name}</label>
                                            <p className="ms-2 fw-bold">{answerText}</p>
                                        </div>
                                    );
                                })}
                            </div>


                            <div className="row">
                                {Object.entries(viewAnswer ?? {}).map(([key, files]) => {
                                    if (!Array.isArray(files)) return null;

                                    // Sort files by version in descending order and take the top 2
                                    const topTwoFiles = files
                                        .sort((a, b) => b?.version - a?.version) // Sort in descending order
                                        .slice(0, 2); // Get max two files

                                    return (
                                        <div key={key} className="col-md-6 mb-3">
                                            <label className="form-label">{topTwoFiles[0]?.question_name}</label>
                                            {topTwoFiles?.map((file, index) => (
                                                <div key={`${key}-${index}`} className="text-center">
                                                    {file?.file_extension === "jpg" || file?.file_extension === "png" ? (
                                                        <>
                                                            <img
                                                                src={file?.file_location}
                                                                alt={file?.file_name}
                                                                className="img-fluid rounded mb-1"
                                                                style={{ maxWidth: "100px", maxHeight: "100px" }} // Adjust size if needed
                                                            />
                                                            <p className="small text-muted">{file.file_name}</p>
                                                        </>
                                                    ) : (
                                                        <div className="mt-2">
                                                            <a
                                                                href={file?.file_location}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="btn btn-primary btn-sm"
                                                            >
                                                                Download {file.file_name}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    );
                                })}
                            </div>

                            {/* <div className="mt-2 border-top border-secondary">
                <h5 className="mb-3 text-primary text-center mt-2">Activity History</h5>
                <div className="border rounded shadow-sm p-3 bg-light">
                  <strong className='audit-strong'>Created by {auditTrail?.created_by} on  {formatISTDate(auditTrail?.created_at)}</strong><br />
                  <strong className='audit-strong'  >Changed by {auditTrail?.updated_by} on  {formatISTDate(auditTrail?.updated_at)}</strong><br />

                </div>


              </div> */}

                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-sm btn-secondary" data-bs-dismiss="modal">
                                Close
                            </button>
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
        </div>
    )
}

export default PrReportCategoryDetail