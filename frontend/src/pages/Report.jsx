import React, { useState } from "react";
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import writeXlsxFile from "write-excel-file";

const ReportPage = () => {
  const [category, setCategory] = useState({ society: '' });
  const [reportData, setReportData] = useState([]);

  // Sample Report Data
  const sampleData = {
    society: [
      {
        sNo: 1,
        'id': 'SOC0001',
        name: "Don Bosco Sagai Society",
        accountant: "Fr. Thomas Savari",
        parish:
          [
            { sNo: 1, 'id': 'PAR0001', name: "St. Joseph’s Church", place: "Andaman, Ferrargunj", ddm: 'Fr. Grace Charles' },
            { sNo: 2, 'id': 'PAR0002', name: "Mary Help of Christians Church", place: "Bagalur", ddm: 'Mr. S. Amala Dass' },
          ],
      },
      {
        sNo: 2,
        'id': 'SOC0002',
        name: "Ayanavaram Salesian Society",
        accountant: "Ms. Mary Chitra",
        parish:
          [
            { sNo: 1, 'id': 'PAR0003', name: "Don Bosco Shrine", place: "Chennai, Ayanavaram", ddm: 'Ms. Mary Chitra' },
          ],
      },

    ]
  };

  // Fetch Report Data
  const handleGetReport = () => {
    if (category.society) {
      let report_data = sampleData.society[sampleData.society.findIndex((item) => item.id === category.society)];
      setReportData(report_data?.parish?.map((item) => ({ societyId: category.society, societyName: report_data.name, ...item })));
    } else {
      setReportData([]);
    }
  };

  // Export to PDF
  const exportToPDF = () => {
    const doc = new jsPDF()

    autoTable(doc, { html: '#my-table' })

    // Or use javascript directly:
    autoTable(doc, {
      head: [['S.No', 'Society ID', 'Society Name', 'Parish ID', 'Parish Name', 'Place', 'DDM']],
      body: reportData.map((item) => [item?.sNo, item.societyId, item.societyName, item.id, item.name, item.place, item.ddm]),
    })
    doc.save(`Report.pdf`)
  };
  
  // Export to Excel using write-excel-file
  const exportToExcel = async () => {
    const schema = [
      {
        column: "S.No",
        type: Number,
        value: (data) => data.sNo,
        borderStyle: "thin",
        height: "18%",
      },
      {
        column: "Society ID",
        type: String,
        value: (data) => data.societyId,
        borderStyle: "thin",
        height: "18%",
        width: "15%"
      },
      {
        column: "Society Name",
        type: String,
        value: (data) => data.societyName,
        borderStyle: "thin",
        height: "18%",
        width: "15%"
      },
      {
        column: "Parish ID",
        type: String,
        value: (data) => data.id,
        borderStyle: "thin",
        height: "18%",
        width: "15%"
      },
      {
        column: "Parish Name",
        type: String,
        value: (data) => data.name,
        borderStyle: "thin",
        height: "18%",
        width: "15%"
      },
      {
        column: "Place",
        type: String,
        value: (data) => data.place,
        borderStyle: "thin",
        height: "18%",
        width: "15%"
      },
      {
        column: "DDM",
        type: String,
        value: (data) => data.ddm,
        borderStyle: "thin",
        height: "18%",
        width: "15%"
      }
    ]
    writeXlsxFile(reportData, {
      schema,
      headerStyle: {
        // backgroundColor: '#4fcfe0',
        fontWeight: 'bold',
        align: 'center',
        borderStyle: 'thin',
        height: '20%',
        alignVertical: 'center'
      },
      fontFamily: 'Arial',
      fileName: `Report.xlsx`
    });
  }

  return (
    <div className="d-flex justify-content-between p-2 flex-wrap bg-white">
      <div className='p-2 col-lg-5 col-12'>
                    <h6 className="fw-bold mb-0">Report</h6>
                    </div>

      {/* Report Filters */}
      <div className='d-flex justify-content-end col-lg-7 col-12 flex-wrap gap-1'>
      <div className="me-2 d-flex align-items-center gap-1">
        <div className="">
          <select
            className="form-select form-select-sm"
            value={category.society}
            onChange={(e) => setCategory(pre => ({ ...pre, society: e.target.value }))}
          >
            <option value="">Select Society</option>
            {
              sampleData.society.map((item) => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))
            }
          </select>
        </div>
        <div className="">
          <button className="btn btn-sm btn-primary px-4 adminBtn" onClick={handleGetReport}>
            Get Report
          </button>
        </div>
      </div>
      </div>

      {/* Report Table */}
      {reportData?.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-dark">
                <tr>
                  <th>S.No</th>
                  <th>Society ID</th>
                  <th>Society Name</th>
                  <th>Parish ID</th>
                  <th>Parish Name</th>
                  <th>Place</th>
                  <th>DDM</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{index +1}</td>
                    <td>{item.societyId}</td>
                    <td>{item.societyName}</td>
                    <td>{item.id}</td>
                    <td>{item.name}</td>
                    <td>{item.place}</td>
                    <td>{item.ddm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Export Buttons */}
          <div className="mt-3">
            <button className="btn btn-sm btn-danger me-2" onClick={exportToPDF}>
              Export as PDF
            </button>
            <button className="btn btn-sm btn-success" onClick={exportToExcel}>
              Export as Excel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportPage;
