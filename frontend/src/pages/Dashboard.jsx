import React, { useEffect, useRef, useState } from 'react';
import { getAPI } from '../constant/apiServices';
import Chart from "react-apexcharts";
import ApexCharts from "apexcharts";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { set } from 'react-hook-form';
import DataTable from 'react-data-table-component';
import { dashBoardTableStyle } from '../constant/Util';
import Loader from '../constant/loader';
import { data } from 'react-router-dom';

// import Loader from '../../constant/loader';
function Dashboard() {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  const [loading, setLoading] = useState(false);


  const [overAllData, setOverAllData] = useState([]);
  const [pendingData, setPendingData] = useState([]);
  const [renewalData, setRenewalData] = useState([]);
  const [renewalChartData, setRenewalChartData] = useState([]);

  // over all bar chart option
  const [series, setSeries] = useState([]);
  const [categories, setCategories] = useState([]);

  // pending chart option
  const [pendingSeries, setPendingSeries] = useState([]);
  const [pendingCategories, setPendingCategories] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getAPI(`toatl-count/province-stats?province=1`).then((res) => {
        if (res?.data?.status) {
          setOverAllData(res?.data);
          const data = res.data.nonFinancialCounts || [];
          setCategories(data.map(item => item.name));
          setSeries([{ name: "Count", data: data.map(item => parseInt(item.count)) }]);
        }
      }),
      getAPI(`toatl-count/dashboard/pending-documents?province_id=1`).then((res) => {
        if (res?.data?.status) {
          setPendingData(res?.data?.data);
          const data = res?.data?.data[0]?.portfolio_pending_data || [];
          if (data.length > 0) {
            const categories = data.map(item => item.portfolio || "");
            const seriesData = data.map(item => parseInt(item.pending_count || 0));
            setPendingCategories(categories);
            setPendingSeries([{
              name: "Pending Count",
              data: seriesData
            }]);
          }
        }
      }),
      getAPI(`toatl-count/dashboard/community-renewal-table?province_id=1`).then((res) => {
        if (res?.data?.status) {
          setRenewalData(res?.data?.data);
        }
      }),
      getAPI(`toatl-count/dashboard/upcoming-renewal-chart-data?province_id=1`).then((res) => {
        if (res?.data?.status) {
          setRenewalChartData(res?.data?.data);
        }
      }),
    ])
      .catch((err) => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);


  const categories1 = renewalChartData?.map(item => item.portfolio);
  const monthlyValues = renewalChartData?.map(item => item.monthly);
  const quarterlyValues = renewalChartData?.map(item => item.quarterly);
  const halfYearlyValues = renewalChartData?.map(item => item.half_yearly);
  const annualValues = renewalChartData?.map(item => item.annual);


  const handleDownload = async () => {
    try {
      const result = await ApexCharts.exec("non-financial-bar", "dataURI");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Non-Financial Renewal");

      // Setup header row
      worksheet.columns = [
        { header: "Portfolio", key: "portfolio", width: 30 },
        { header: "Monthly", key: "monthly", width: 15 },
        { header: "Quarterly", key: "quarterly", width: 15 },
        {header: "Half Yearly", key: "Half Yearly", width: 15 },
        { header: "Annual", key: "annual", width: 15 }
      ];

      // Add data rows
      renewalChartData?.forEach(item => {
        worksheet.addRow({
          portfolio: item.portfolio,
          monthly: item.monthly,
          quarterly: item.quarterly,
          annual: item.annual
        });
      });

      // Add chart image to Excel
      const imageId = workbook.addImage({
        base64: result.imgURI,
        extension: "png"
      });

      worksheet.addImage(imageId, {
        tl: { col: 5, row: 1 }, // Adjust position if needed
        ext: { width: 500, height: 300 }
      });

      // Generate Excel and trigger download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      saveAs(blob, "Non-Financial-Renewal-Status.xlsx");

    } catch (error) {
      console.error("Excel download failed:", error);
    }
  };

  const columns = [
    {
      name: '#',
      cell: (row, index) => <span >{index + 1}</span>,
      width: '40px',
    },
    {
      name: <span title="Community">Community</span>,
      cell: row => (
        <span title={row.community_name || 'N/A'}>
          {row.community_name || 'N/A'}
        </span>
      ),
      wrap: true,
      style: {
        justifyContent: 'start !important'   // <-- force left‐align
      }
    },
    {
      name: <span title="Total Renewals">Total Renewals</span>,
      cell: row => (
        <span title={row.total_renewal_count?.toString()}>
          {row.total_renewal_count}
        </span>
      ),
      width: '100px',
    },
    {
      name: <span title="Pending Count">Pending Count</span>,
      cell: row => (
        <span title={row.total_pending_count?.toString()}>
          {row.total_pending_count}
        </span>
      ),
      width: '90px',
    },
    {
      name: <span title="Pending Categories">Pending Categories</span>,
      cell: row => {
        const pendingNames = row.categories
          ?.filter(cat => cat.status === 'Pending')
          .map(cat => cat.category_name);
        const displayText = pendingNames?.length
          ? pendingNames.join(', ')
          : 'No Pending Categories';
        return <span title={displayText}>{displayText}</span>;
      },
      wrap: true,
      style: {
        justifyContent: 'start !important'   // <-- force left‐align
      }
    }

  ];
  
  // overall data Chart options
  const options = {
    chart: {
      id: "non-financial-chart",
      type: "bar",
      toolbar: { show: false },
      background: "#FFFFFF", // Default light mode background color
    },
    theme: {
      mode: "light", // You can change this to "dark" dynamically
      palette: "palette1", // This can be adjusted to fit your theme preferences
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "80%" }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: categories,
      labels: {
        show: true,
        rotate: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    title: {
      text: "Non-Financial Entity Count",
      align: "center"
    }
  };



  // pending chart options - Corrected version
  const pendingOptions = {
    chart: {
      id: "pending-chart",
      type: "bar",
      toolbar: { show: false },
      background: "#FFFFFF", // Default light mode background color
    },
    theme: {
      mode: "light", // You can change this to "dark" dynamically
      palette: "palette1", // This can be adjusted to fit your theme preferences
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "80%" }
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: pendingCategories,
      labels: {
        show: true,
        rotate: -45,
        style: {
          fontSize: '12px'
        }
      }
    },
    title: {
      text: "Pending Documents Uploads",
      align: "center"
    }
  };

  // stack chart renewal 
  const options1 = {
    chart: {
      id: 'non-financial-bar',
      type: "bar",
      height: 400,
      stacked: true, // Enable stacked bar chart
      toolbar: {
        show: false // Hide built-in toolbar for custom implementation
      },
      events: {
        mounted: function (chart) {
          setChartInstance(chart);
        }
      },
      background: "#FFFFFF", // Default light mode background color
    },
    theme: {
      mode: "light", // You can change this to "dark" dynamically
      palette: "palette1", // This can be adjusted to fit your theme preferences
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "80%",
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: categories1,
    },
    title: {
      text: "Non Financial Renewal status",
      align: "center"
    },
    colors: ['#008FFB', '#00E396', '#8b26ff','#f545f5'], // Colors for monthly, quarterly, and annual
  };

  const series1 = [
    {
      name: "Monthly",
      data: monthlyValues
    },
    {
      name: "Quarterly",
      data: quarterlyValues
    },
    { 
       name: "Half Yearly",
       data : halfYearlyValues},
       
    {
      name: "Annual",
      data: annualValues
    }
  ];


  const handleDownloadOverAllExcel = async () => {
    try {
      const result = await ApexCharts.exec("non-financial-chart", "dataURI");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      const nonFinancialCounts = overAllData?.nonFinancialCounts || [];
      worksheet.columns = [
        { header: "Entity", key: "name", width: 30 },
        { header: "Count", key: "count", width: 15 }
      ];

      nonFinancialCounts.forEach(item => {
        worksheet.addRow({ name: item.name, count: item.count });
      });

      const imageId = workbook.addImage({
        base64: result.imgURI,
        extension: "png"
      });

      worksheet.addImage(imageId, {
        tl: { col: 3, row: 1 },
        ext: { width: 500, height: 300 }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Non-Financial-Entities-Report.xlsx");
    } catch (error) {
      console.error("Excel download failed:", error);
    }
  };

  const handleDownloadPendingChartExcel = async () => {
    try {
      const result = await ApexCharts.exec("pending-chart", "dataURI");
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Pending Report");

      // Use pending data for the Excel export
      const pendingCounts = pendingData[0]?.portfolio_pending_data || [];
      worksheet.columns = [
        { header: "Portfolio", key: "portfolio", width: 30 },
        { header: "Pending Count", key: "count", width: 15 }
      ];

      pendingCounts.forEach(item => {
        worksheet.addRow({ portfolio: item.portfolio, count: item.pending_count });
      });

      const imageId = workbook.addImage({
        base64: result.imgURI,
        extension: "png"
      });

      worksheet.addImage(imageId, {
        tl: { col: 3, row: 1 },
        ext: { width: 500, height: 300 }
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), "Pending-Documents-Report.xlsx");
    } catch (error) {
      console.error("Excel download failed:", error);
    }
  };

  // Place this block just before your main return
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
        <Loader />
      </div>
    );
  }

  return (
    <div className='d-flex justify-content-center  p-2 flex-wrap '>
      <div className='row col-12 mb-2 justify-content-center'>
        <div className="row mb-3 flex ">
          <div className="col-6 col-sm-6 col-md-6 col-lg-3 mb-2">
            <div className="p-3 shadow-sm rounded text-center text-white" style={{ backgroundColor: "#198754" }}>
              <h6 className="mb-1">Communities</h6>
              <strong style={{ fontSize: "20px" }}>{overAllData?.no_of_communities}</strong>
            </div>
          </div>
          <div className="col-6 col-sm-6 col-md-6 col-lg-3 mb-2">
            <div className="p-3 shadow-sm rounded text-center text-white" style={{ backgroundColor: "#0d6efd" }}>
              <h6 className="mb-1">Societies</h6>
              <strong style={{ fontSize: "20px" }}>{overAllData?.no_of_societies}</strong>
            </div>
          </div>
          <div className="col-6 col-sm-6 col-md-6 col-lg-3 mb-2">
            <div className="p-3 shadow-sm rounded text-center text-white" style={{ backgroundColor: "#6f42c1" }}>
              <h6 className="mb-1">Portfolios</h6>
              <strong style={{ fontSize: "20px" }}>{overAllData?.no_of_portfolios}</strong>
            </div>
          </div>
          <div className="col-6 col-sm-6 col-md-6 col-lg-3 mb-2">
            <div className="p-3 shadow-sm rounded text-center text-white" style={{ backgroundColor: "#fd7e14" }}>
              <h6 className="mb-1">DDMs</h6>
              <strong style={{ fontSize: "20px" }}>{overAllData?.no_of_ddms}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className='row col-12 mb-2'>

        <div className="col-lg-6 col-md-6 col-12 mb-2">

          <div className="p-2 card_shadow position-relative bg-light overflow-wrapper shadow rounded border">
            <div
              className="position-absolute bg-primary border-none d-flex align-items-center justify-content-center rounded top-0 m-2 cursor-pointer download-excel"
              onClick={handleDownloadOverAllExcel}
              title="Download Chart"
              style={{
                zIndex: 10,
                height: '30px',
                width: '30px',
                top: '10px',
                right: '14px',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="white"
                className="bi bi-download" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
              </svg>
            </div>

            {/* Scrollable wrapper for chart */}
            <div className="chart-scroll-container" style={{  justifyContent: 'center', backgroundColor: 'white' }}>
              <div style={{ minWidth: '470px' }}>
                <Chart
                  options={options}
                  series={series}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          </div>

        </div>

        <div className="col-lg-6 col-md-6 col-12 mb-2">
          <div className="p-2 card_shadow shadow rounded border bg-white">
            <div className="d-flex justify-content-center align-items-center w-100  mb-2">
              <h6 className="fw-bold mb-0" style={{ fontSize: "14px" }}>Upcoming Renewals</h6>
            </div>
            <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
              <div style={{ minWidth: '600px', height: '340px', overflowY: 'auto' }}>
                <DataTable
                  columns={columns}
                  data={renewalData}
                  customStyles={dashBoardTableStyle}
                  pagination
                  paginationPerPage={4}
                  paginationRowsPerPageOptions={[4]}
                  highlightOnHover
                  pointerOnHover
                  responsive={false}
                  noDataComponent="No records found"
                />
              </div>
            </div>
          </div>
        </div>

      </div>



      <div className='row col-12 mb-2'>
        <div className="col-lg-6 col-md-6 col-12 mb-2">
          <div className="p-2 card_shadow position-relative  bg-light overflow-wrapper shadow rounded border">
            {/* Download icon */}
            <div
              className="position-absolute bg-primary border-none d-flex align-items-center justify-content-center rounded top-0 m-2 cursor-pointer download-excel"
              onClick={handleDownloadPendingChartExcel}
              title="Download Chart"
              style={{ zIndex: 10, height: '30px', width: '30px', right: '14px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                className="bi bi-download text-white" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
              </svg>
            </div>

            {/* Scrollable wrapper */}
            <div className="chart-scroll-container" style={{  justifyContent: 'center', backgroundColor: 'white' }}>
              <div style={{ minWidth: '470px' }}>
                <Chart
                  options={pendingOptions}
                  series={pendingSeries}
                  type="bar"
                  height={350}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-6 col-md-6 col-12 mb-2">

          <div className="p-2 card_shadow position-relative bg-light overflow-wrapper shadow rounded border">

            <div
              className="position-absolute bg-primary border-none d-flex align-items-center justify-content-center rounded top-0 m-2 cursor-pointer download-excel"
              onClick={handleDownload}
              title="Download Chart"
              style={{ zIndex: 10, height: '30px', width: '30px', right: '14px' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                className="bi bi-download text-white" viewBox="0 0 16 16">
                <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                <path d="M7.646 11.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 10.293V1.5a.5.5 0 0 0-1 0v8.793L5.354 8.146a.5.5 0 1 0-.708.708z" />
              </svg>
            </div>


            <div className="chart-scroll-container" style={{  justifyContent: 'center', backgroundColor: 'white' }}>
              <div style={{ minWidth: '470px' }} ref={chartRef}>
                <Chart options={options1} series={series1} type="bar" height={350} />
              </div>
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
  );
}

export default Dashboard;