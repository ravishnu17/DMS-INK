import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { getAPI } from "../constant/apiServices";
// import { Loader } from "../constant/Util";
import html2pdf from "html2pdf.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { set } from 'react-hook-form';

import Loader from '../constant/loader';
const months = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];
const quarters = ["Apr-Jun", "Jul-Sep", "Oct-Dec", "Jan-Mar"];

const DDMsReportView = () => {
  const { type, id } = useParams();
  const location = useLocation();
  const category = location?.state?.category;

  const [loading, setLoading] = useState(false);
  const [ddmReportData, setDDMReportData] = useState([]);
  const reportRef = useRef();

  const queryParams = new URLSearchParams({
    ddmUserId: id.toString(),
    monthly: type === "monthly" ? "true" : "false",
    quarterly: type === "quarterly" ? "true" : "false",
    half_yearly: type === "halfyearly" ? "true" : "false",
    yearly: type === "annual" ? "true" : "false",
  });

  const apiUrl = `/reports/ddmWorkDoneReport?${queryParams.toString()}`;

  const getDDMReportData = useCallback(() => {
    setLoading(true);
    getAPI(apiUrl)
      .then((res) => {
        if (res?.data?.status) {
          let temp = [];
          res.data.data.forEach((item) => {
            item?.entities?.forEach((entity) => temp.push(entity));
          });
          setDDMReportData(temp);
        } else {
          setDDMReportData([]);
        }
      })
      .catch(() => {
        setDDMReportData([]);
      })
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    getDDMReportData();
  }, [getDDMReportData]);

  // Use async/await and better options for html2pdf
  const downloadPDF = async () => {
    if (ddmReportData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const element = reportRef.current;
    if (!element) return;

    const opt = {
      margin: [0.3, 0.3, 0.3, 0.3], // top, left, bottom, right (inches)
      filename: `DDM_Report_${new Date().getTime()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2, // increase for better quality
        useCORS: true,
        logging: false,
        scrollY: -window.scrollY, // fix for fixed header if any
      },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
      pagebreak: { mode: ["css", "legacy"] }, // better page break handling
    };

    try {
      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Failed to generate PDF. Please try again.");
    }
  };



const downloadExcel = async () => {
  if (!ddmReportData || ddmReportData.length === 0) {
    alert("No data available to download.");
    return;
  }

  try {
    setLoading(true);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Your App';
    workbook.created = new Date();
    const worksheet = workbook.addWorksheet("DDM Report");

    const headerStyle = {
      font: { bold: true, size: 12 },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    const yesStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } },
      font: { color: { argb: 'FF006100' } }
    };

    const noStyle = {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } },
      font: { color: { argb: 'FF9C0006' } }
    };

    ddmReportData.forEach((entity, entityIndex) => {
      worksheet.addRow([]);
      const titleRow = worksheet.addRow([entity.entity_name || "Unnamed Entity"]);
      titleRow.font = { bold: true, size: 14 };
      worksheet.mergeCells(`A${titleRow.number}:H${titleRow.number}`);

      (entity.category_data || []).forEach(cat => {
        worksheet.addRow([]);
        const catRow = worksheet.addRow([cat.category_name || "Unnamed Category"]);
        catRow.font = { bold: true, size: 12 };

        let periodKeys = [];
        const yearData = cat.year_data || [];

        if (type === "monthly") {
          periodKeys = Object.keys(yearData?.[0]?.months || {});
        } else if (type === "quarterly") {
          periodKeys = Object.keys(yearData?.[0]?.quarters || {});
        } else if (type === "halfyearly") {
          periodKeys = Object.keys(yearData?.[0]?.half_years || {});
        } else if (type === "annual") {
          periodKeys = ["Status"];
        }

        const headers = ["Year", ...periodKeys];
        const headerRow = worksheet.addRow(headers);
        headerRow.eachCell(cell => { cell.style = headerStyle; });

        yearData.forEach(yearRow => {
          const row = [yearRow.year];
          periodKeys.forEach(key => {
            let value;
            if (type === "monthly") value = yearRow.months?.[key];
            else if (type === "quarterly") value = yearRow.quarters?.[key];
            else if (type === "halfyearly") value = yearRow.half_years?.[key];
            else if (type === "annual") value = yearRow.status;
            row.push(value ? "Yes" : "No");
          });

          const dataRow = worksheet.addRow(row);
          dataRow.eachCell((cell, colNumber) => {
            if (colNumber > 1) {
              cell.style = cell.value === "Yes" ? yesStyle : noStyle;
            }
          });
        });
      });

      // Spacing after each entity
      if (entityIndex < ddmReportData.length - 1) {
        worksheet.addRow([]);
      }
    });

    worksheet.columns.forEach(col => {
      let maxLength = 0;
      col.eachCell({ includeEmpty: true }, cell => {
        const val = cell.value ? cell.value.toString() : "";
        maxLength = Math.max(maxLength, val.length);
      });
      col.width = Math.min(Math.max(maxLength + 2, 10), 30);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `DDM_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
    saveAs(blob, fileName);
  } catch (err) {
    console.error("Excel generation failed:", err);
    alert("Error while generating Excel. Please try again.");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <style>
        {`
          @media print {
            .monthly-docs-view {
              page-break-inside: avoid;
            }
            .entity-box, .monthly-status-table, .monthly-status-table tr, .monthly-status-table td, .monthly-status-table th {
              page-break-inside: avoid !important;
              page-break-after: auto;
              break-inside: avoid;
            }
            .status-cell {
              word-break: break-word;
              white-space: normal;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              padding: 6px;
              text-align: center;
              border: 1px solid #ccc;
            }
          }

          /* Additional styles to make PDF look better */
         .monthly-docs-view {
  background: none;
  margin-bottom:10px;
  margin-top: 10px;
  padding: 0;
  border: none;
  border-radius: 0;
  page-break-inside: avoid;
}

          .monthly-status-table th {
            background-color: #f0f0f0;
          }

          .status-cell.yes {
            background-color: #d4edda;
            color: #155724;
            font-weight: 600;
          }

          .status-cell.no {
            background-color: #f8d7da;
            color: #721c24;
            font-weight: 600;
          }
        `}
      </style>

      <div className="d-flex justify-content-between align-items-center p-2 bg-white flex-wrap">
        {/* Left side: Back button + Category name */}
        <div className="d-flex align-items-center gap-2">
          <button
            className="btn pb-0"
            onClick={() => window.history.back()}
            title="Go Back"
          >
            <i className="fa-solid fa-circle-left fs-5" />
          </button>
          <h6 className="fw-bold text-dark mb-0">{category?.name}</h6>
        </div>

        {/* Right side: Download PDF button (only if data exists) */}
        {!loading && ddmReportData.length > 0 && (
          <div className="d-flex align-items-center gap-2">
            <button className="btn" title="Download PDF" style={{ backgroundColor: "#3498db", color: "white", fontSize: "14px" }} onClick={downloadPDF}>
              <i className="fa fa-download me-1"></i> Download PDF
            </button>
            <button className="btn btn-success" title="Download Excel" style={{ fontSize: "14px" }} onClick={downloadExcel}>
              <i className="fa fa-file-excel me-1"></i> Download Excel
            </button>

          </div>
        )}
      </div>


      <div ref={reportRef}
      //  style={{ backgroundColor: "white", padding: "15px" }}
      >
        {ddmReportData.length === 0 && !loading && (
          <div className="no-data-msg p-4 text-center">
            <p>No data available for this report.</p>
          </div>
        )}

        {ddmReportData.map((entity) => (
          <div className="monthly-docs-view" key={entity.entity_name}>
            <h6 className="text-center mb-3 fw-bold">{entity.entity_name}</h6>

            {/* Monthly */}
            {type === "monthly" &&
              entity.category_data.map((cat) => {
                const months = Object.keys(cat.year_data?.[0]?.months || {});
                return (
                  <div key={cat.category_id} className="mb-4">
                    <p className="fw-bold">{cat.category_name}</p>
                    <table className="monthly-status-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          {months.map((month) => (
                            <th key={month}>{month}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.year_data.map((row) => (
                          <tr key={row.year}>
                            <td>{row.year}</td>
                            {months.map((month) => (
                              <td
                                key={month}
                                className={
                                  row.months[month]
                                    ? "status-cell yes"
                                    : "status-cell no"
                                }
                              >
                                {row.months[month] ? "Yes" : "No"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

            {/* Quarterly */}
            {type === "quarterly" &&
              entity.category_data.map((cat) => {
                const quarters = Object.keys(cat.year_data?.[0]?.quarters || {});
                return (
                  <div key={cat.category_id} className="mb-4">
                    <p className="fw-bold">{cat.category_name}</p>
                    <table className="monthly-status-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          {quarters.map((q) => (
                            <th key={q}>{q}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.year_data.map((row) => (
                          <tr key={row.year}>
                            <td>{row.year}</td>
                            {quarters.map((q) => (
                              <td
                                key={q}
                                className={
                                  row.quarters[q]
                                    ? "status-cell yes"
                                    : "status-cell no"
                                }
                              >
                                {row.quarters[q] ? "Yes" : "No"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

            {/* Half-Yearly */}
            {type === "halfyearly" &&
              entity.category_data.map((cat) => {
                const halves = Object.keys(cat.year_data?.[0]?.half_years || {});
                return (
                  <div key={cat.category_id} className="mb-4">
                    <p className="fw-bold">{cat.category_name}</p>
                    <table className="monthly-status-table">
                      <thead>
                        <tr>
                          <th>Year</th>
                          {halves.map((half) => (
                            <th key={half}>{half}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {cat.year_data.map((row) => (
                          <tr key={row.year}>
                            <td>{row.year}</td>
                            {halves.map((half) => (
                              <td
                                key={half}
                                className={
                                  row.half_years[half]
                                    ? "status-cell yes"
                                    : "status-cell no"
                                }
                              >
                                {row.half_years[half] ? "Yes" : "No"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}

            {/* Annual */}
            {type === "annual" &&
              entity.category_data.map((cat) => (
                <div key={cat.category_id} className="mb-4">
                  <p className="fw-bold">{cat.category_name}</p>
                  <table className="monthly-status-table">
                    <thead>
                      <tr>
                        <th>Year</th>
                        <th>Submitted</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(cat.years || {}).map(([year, submitted]) => (
                        <tr key={year}>
                          <td>{year}</td>
                          <td
                            className={
                              submitted ? "status-cell yes" : "status-cell no"
                            }
                          >
                            {submitted ? "Yes" : "No"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
          </div>
        ))}
      </div>

      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "500px" }}
        >
          <Loader />
        </div>
      )}


    </>
  );
};

export default DDMsReportView;



