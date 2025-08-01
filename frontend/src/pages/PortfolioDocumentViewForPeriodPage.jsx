import React, { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom';
import { getAPI } from '../constant/apiServices';
import { tableStyle } from '../constant/Util';
import DataTable from 'react-data-table-component';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';

function PortfolioDocumentViewForPeriodPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { portfolio, entity, viewType, tableData } = location?.state || {};
    const [activeCategory, setActiveCategory] = useState(null);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [ddmReportData, setDDMReportData] = useState([]);

    const queryParams = new URLSearchParams({
        entity_id: entity?.entity_id,
        portfolio_id: portfolio?.portfolio_id,
        model: entity?.model
    });

    const apiUrl = `/reports/categoryListByEntity?${queryParams.toString()}`;

    const getDDMReportData = useCallback((search) => {
        setLoading(true);
        getAPI(apiUrl)
            .then((res) => {
                if (res?.data?.status) {
                    setDDMReportData(res?.data?.data);
                } else {
                    setDDMReportData([]);
                }
            })
            .catch((err) => {
                console.log(err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        getDDMReportData();
    }, [getDDMReportData]);

    const financialData = [
        {
            tan: 'CHEA24665F',
            purpose: 'New TDS Entry',
            pan: 'AAJFJ3981E',
            amount: 460.0,
            paidDate: '11-Mar-2021',
            bankDetails: '0001853-2021-03-11-00008',
        },
        {
            tan: 'CHEA24665F',
            purpose: 'New TDS Entry',
            pan: 'AAJFJ3981E',
            amount: 460.0,
            paidDate: '09-Feb-2021',
            bankDetails: '0001853-2021-02-06-00002',
        },
        {
            tan: 'CHEA24665F',
            purpose: 'New TDS Entry',
            pan: 'AJMPD5381C',
            amount: 1000.0,
            paidDate: '05-Feb-2021',
            bankDetails: '0001853-2021-02-05-00001',
        },
        {
            tan: 'CHEA24665F',
            purpose: 'New TDS Entry',
            pan: 'BOQPS8242D',
            amount: 1200.0,
            paidDate: '08-Jan-2021',
            bankDetails: '0001853-2021-01-08-00006',
        },
        {
            tan: 'CHEA24665F',
            purpose: 'New TDS Entry',
            pan: 'AAJFJ3981E',
            amount: 460.0,
            paidDate: '02-Jan-2021',
            bankDetails: '0001853-2021-01-08-00005',
        },
        {
            tan: 'CHEA24665F',
            purpose: 'New TDS Entry',
            pan: 'AJMPD5381C',
            amount: 2000.0,
            paidDate: '24-Dec-2020',
            bankDetails: '0001853-2020-12-24-00003',
        },
    ];


    const columns = [
        { name: 'TAN No.', selector: row => row.tan, sortable: true },
        { name: 'Purpose', selector: row => row.purpose },
        { name: 'Deductee PAN', selector: row => row.pan },
        { name: 'Amount', selector: row => row.amount, right: true },
        { name: 'Amount Paid Date', selector: row => row.paidDate },
        { name: 'Bank Details', selector: row => row.bankDetails },
    ];

    const handleFilter = () => {
        if (!fromDate || !toDate) return;

        const filtered = tdsData.filter(row => {
            const rowDate = new Date(row.paidDate);
            return rowDate >= fromDate && rowDate <= toDate;
        });

        setFilteredData(filtered);
    };

    const handleBack = () => {
        navigate(-1); // go back to previous page
    };

    const fields = [
        entity?.name,
        entity?.entity_address,
        entity?.entity_place,
        entity?.region
    ];

    const nonEmptyFields = fields.filter(
        (val) => val !== null && val !== undefined && val.toString().trim() !== ""
    );

    const displayText = nonEmptyFields?.length > 0
        ? nonEmptyFields.join(", ")
        : "NA";


    const handleProceedClick = () => {
        if (!fromDate || !toDate) {
            Swal.fire({
                icon: 'warning',
                title: 'Missing Dates',
                text: 'Please select both start and end dates before proceeding.',
                confirmButtonColor: '#600099'
            });
            return;
        }
        // handleProceed(); // your existing function
    };

    return (
        <div className="container card p-4 shadow">
            {/* header */}
            <div className="d-flex align-items-center justify-content-between border-bottom mb-3">
                <button className="btn" type="button" onClick={handleBack}>
                    <i className="fa-solid fa-circle-left fs-5" />
                </button>
                <h5>
                    {displayText}{" -- "} {tableData?.name}
                </h5>
                <div />
            </div>

            {/* filter row: CENTER everything */}
            <div className="d-flex justify-content-center p-2 flex-wrap bg-white mb-3">
                <div className="row w-100 justify-content-center align-items-end gx-3">

                    {/* Enter Date From */}
                    <div className="col-auto mb-2">
                        <label className="form-label fw-semibold text-dark">
                            Enter Date From:
                        </label>
                        <DatePicker
                            selected={fromDate}
                            onChange={(date) => setFromDate(date)}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="Select start date"
                            className="form-control example-custom-input1"
                        />
                    </div>

                    {/* Enter Date To */}
                    <div className="col-auto mb-2">
                        <label className="form-label fw-semibold text-dark">
                            Enter Date To:
                        </label>
                        <DatePicker
                            selected={toDate}
                            onChange={(date) => setToDate(date)}
                            dateFormat="MM/dd/yyyy"
                            placeholderText="Select end date"
                            className="form-control example-custom-input1"
                        />
                    </div>

                    {/* Proceed Button */}
                    <div className="col-auto mb-2 d-flex">
                        <button
                            type="submit"
                            className="btn btn-sm px-4 py-2"
                            style={{ backgroundColor: '#600099', color: 'white' }}
                            disabled={!fromDate || !toDate}
                            onClick={handleProceedClick}
                        >
                            Proceed
                        </button>
                    </div>

                </div>
            </div>


            <div className="card" style={{ margin: "7px" }}>
                <DataTable
                    columns={columns}
                    data={financialData}
                    customStyles={tableStyle}
                    paginationRowsPerPageOptions={[25, 50, 75, 100]}
                    pagination
                    paginationServer
                    // paginationTotalRows={totalRows}
                    // paginationDefaultPage={pagination?.currentPage}
                    // onChangePage={handlePageChange}
                    // onChangeRowsPerPage={handlePerRowsChange}
                    highlightOnHover
                    pointerOnHover
                    responsive
                    noDataComponent={null}
                    paginationPerPage={25}
                />
            </div>
        </div>
    )
}

export default PortfolioDocumentViewForPeriodPage