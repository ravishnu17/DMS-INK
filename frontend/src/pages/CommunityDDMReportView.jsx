import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
function CommunityDDMReportView() {
  const { type, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const reportRef = useRef();
  const [loading, setLoading] = useState(false);
  const [ddmReportData, setDDMReportData] = useState([]);

  const apiUrl = `/reports/communityWorkdoneReport?community_id=${id}`;

  const getDDMReportData = useCallback(() => {
    setLoading(true);
    getAPI(apiUrl)
      .then((res) => {
        if (res?.data?.status) {
          setDDMReportData(res?.data?.data);
        } else {
          setDDMReportData([]);
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    getDDMReportData();
  }, [getDDMReportData]);

  const handleBackClick = () => {
    window.history.back();
  };

  const downloadPDF = () => {
    if (ddmReportData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const element = reportRef.current;
    const opt = {
      margin: [10, 10, 10, 10], // top, left, bottom, right in mm
      filename: `Community_report_${type}_${new Date().getTime()}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        logging: true,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
      },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation: "portrait",
        compress: true,
      },
      pagebreak: {
        mode: ["css"],
        avoid: ["tr", "td", ".keep-together", ".avoid-break", ".category-header"],
      },
    };

    // Clone to prevent mutations
    const elementClone = element.cloneNode(true);
    document.body.appendChild(elementClone);

    // Add classes to help page break control
    elementClone.querySelectorAll("table").forEach((table) => {
      table.classList.add("keep-together", "avoid-break");
    });

    elementClone.querySelectorAll(".category-header").forEach((header) => {
      header.classList.add("keep-together");
    });

    html2pdf()
      .set(opt)
      .from(elementClone)
      .toPdf()
      .get("pdf")
      .then((pdf) => {
        const totalPages = pdf.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);
          pdf.setFontSize(10);
          pdf.setTextColor(150);
          pdf.text(
            `Page ${i} of ${totalPages}`,
            pdf.internal.pageSize.getWidth() - 30,
            pdf.internal.pageSize.getHeight() - 10
          );
        }
      })
      .save()
      .then(() => {
        document.body.removeChild(elementClone);
      });
  };
  
  const downloadExcel = async () => {
    try {
      setLoading(true);
      const workbook = new ExcelJS.Workbook();
      workbook.creator = 'Your Application Name';
      workbook.created = new Date();

      const headerStyle = {
        font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0070C0' } },
        alignment: { vertical: 'middle', horizontal: 'center' }
      };

      const subHeaderStyle = {
        font: { bold: true, size: 12, color: { argb: 'FF000000' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };

      const categoryHeaderStyle = {
        font: { bold: true, size: 11, color: { argb: 'FFFFFFFF' } },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } },
        alignment: { vertical: 'middle', horizontal: 'left' }
      };

      const tableHeaderStyle = {
        font: { bold: true, size: 10 },
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9D9D9' } },
        border: {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        }
      };

      const yesCellStyle = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } },
        font: { color: { argb: 'FF006100' } }
      };

      const noCellStyle = {
        fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } },
        font: { color: { argb: 'FF9C0006' } }
      };

      let firstCommunityName = null;

      for (const [index, entity] of ddmReportData.entries()) {
        let sheetName = (entity.entity_name || `Report_${index + 1}`)
          .replace(/[\\\/:*?"<>|]/g, "")
          .substring(0, 31);

        let counter = 1;
        const originalSheetName = sheetName;
        while (workbook.getWorksheet(sheetName)) {
          sheetName = `${originalSheetName.substring(0, 28)}_${counter++}`;
        }

        const sheet = workbook.addWorksheet(sheetName);
        sheet.properties.defaultColWidth = 15;

        // Construct community header title based on index
        let headerTitle;
        if (index === 0) {
          firstCommunityName = entity.community_name || "N/A";
          headerTitle = `Community: ${firstCommunityName}`;
        } else {
          headerTitle = `${firstCommunityName || "N/A"}:${entity.community_name || "N/A"}`;
        }

        const communityHeaderRow = sheet.addRow([
          headerTitle,
          `Type: ${entity?.community_type || "N/A"}`
        ]);

        communityHeaderRow.font = { bold: true, size: 14 };
        communityHeaderRow.height = 25;
        sheet.mergeCells(`A${communityHeaderRow.number}:E${communityHeaderRow.number}`);

        sheet.addRow([]).height = 10;

        for (const category of entity?.category_data || []) {
          const categoryRow = sheet.addRow([`Category: ${category?.category_name || "N/A"}`]);
          categoryRow.font = { bold: true, size: 11 };
          // categoryRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF70AD47' } };
          categoryRow.height = 20;
          sheet.mergeCells(`A${categoryRow.number}:E${categoryRow.number}`);

          const yearData = category.year_data || [];
          const periodType = category.period_type;

          let columns = [];
          if (periodType === "months" && yearData.length) {
            columns = Object.keys(yearData[0].months || {});
          } else if (periodType === "quarters" && yearData.length) {
            columns = Object.keys(yearData[0].quarters || {});
          } else if (periodType === "half_years" && yearData.length) {
            columns = Object.keys(yearData[0].half_years || {});
          } else if (periodType === "years" && category.years) {
            columns = ["Submitted"];
          }

          const headerRow = sheet.addRow(["Year", ...columns]);
          headerRow.eachCell((cell) => {
            cell.style = tableHeaderStyle;
          });
          headerRow.height = 20;

          if (periodType === "years") {
            for (const [year, submitted] of Object.entries(category.years || {})) {
              const dataRow = sheet.addRow([year, submitted ? "Yes" : "No"]);
              dataRow.getCell(2).style = submitted ? yesCellStyle : noCellStyle;
              dataRow.height = 18;
            }
          } else {
            for (const row of yearData) {
              const dataCells = [row.year];
              for (const col of columns) {
                const val =
                  periodType === "months"
                    ? row.months?.[col]
                    : periodType === "quarters"
                      ? row.quarters?.[col]
                      : row.half_years?.[col];
                dataCells.push(val ? "Yes" : "No");
              }
              const dataRow = sheet.addRow(dataCells);
              dataRow.height = 18;

              dataCells.slice(1).forEach((_, idx) => {
                const cell = dataRow.getCell(idx + 2);
                cell.style = cell.value === "Yes" ? yesCellStyle : noCellStyle;
              });
            }
          }

          sheet.addRow([]).height = 5;
        }

        sheet.columns.forEach(column => {
          let maxLength = 0;
          column.eachCell({ includeEmpty: true }, cell => {
            const columnLength = cell.value ? cell.value.toString().length : 0;
            if (columnLength > maxLength) {
              maxLength = columnLength;
            }
          });
          column.width = Math.min(Math.max(maxLength + 2, 10), 30);
        });

        // sheet.views = [{
        //   state: 'frozen',
        //   ySplit: 4
        // }];
        sheet.views = [];
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `Community_List_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Error generating Excel file:", error);
      alert("An error occurred while generating the Excel file. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        /* Base styles */
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
        }
        
        /* Container */
        .report-container {
          padding: 20px;
          max-width: 100%;
        }
        
        /* Entity container - keep section together */
        .entity-container {
          margin-bottom: 30px;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Category header - prevent break */
        .category-header {
          margin-top: 20px;
          margin-bottom: 10px;
          font-weight: 600;
          font-size: 14px;
          page-break-after: avoid;
          break-after: avoid;
          page-break-before: avoid;
          break-before: avoid;
          page-break-inside: avoid;
          break-inside: avoid;
        }
        
        /* Table styles */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 12px;
        }
        
        .data-table th, .data-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        
        .data-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        /* Status cell styles */
        .status-yes {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-no {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        /* Headers */
        .report-header {
          text-align: center;
          margin-bottom: 20px;
        }
        
        .report-header h4 {
          color: #2c3e50;
          margin-bottom: 5px;
        }
        
        .report-header p {
          color: #7f8c8d;
          margin: 0;
        }
        
        /* Print styles */
        @media print {
          body {
            padding: 0;
            margin: 0;
            font-size: 11pt;
            line-height: 1.3;
          }
          
          .entity-container {
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
            margin-bottom: 15pt;
          }
          
          .data-table {
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
            font-size: 10pt;
          }
          
          .keep-together {
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
          }
          
          .avoid-break {
            page-break-after: avoid !important;
            page-break-before: avoid !important;
          }
          
          .category-header {
            page-break-inside: avoid !important;
            break-inside: avoid-page !important;
          }
          
          tr, td, th {
            page-break-inside: avoid !important;
          }
          
          .no-print {
            display: none !important;
          }
        }
        
        /* Controls */
        .controls-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px;
          background-color: #f8f9fa;
          margin-bottom: 20px;
        }
        
        .back-button {
          background: none;
          border: none;
          cursor: pointer;
          color: #3498db;
          font-size: 16px;
        }
        
        .download-btn {
          background-color: #3498db;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        /* No data message */
        .no-data-message {
          text-align: center;
          padding: 40px;
          color: #7f8c8d;
          font-style: italic;
        }
      `}</style>

      <div className="controls-container no-print">
        <button className="back-button" onClick={handleBackClick}>
          <i className="fa-solid fa-circle-left"></i>
        </button>
        {ddmReportData.length > 0 && (
          <div className="download-buttons d-flex">
            <button className="download-btn" onClick={downloadPDF}>
              <i className="fa fa-download"></i> Download PDF
            </button>
            <button className="btn btn-success ms-2" type="button" style={{fontSize:"14px"}} onClick={downloadExcel}>
              <i className="fa fa-download"></i> Download Excel
            </button>
          </div>
        )}
      </div>

      <div ref={reportRef} className="report-container">
        {ddmReportData.length === 0 && !loading && (
          <div className="no-data-message">
            <p>No data available for this report.</p>
          </div>
        )}

        {ddmReportData.map((entity, index) => (
          <div className="entity-container keep-together" key={`entity-${index}`}>
            <div className="report-header">
              <h4>{entity?.community_name}</h4>
              <p>Type: {entity?.community_type}</p>
            </div>

            <h5 style={{ textAlign: "center" }}>{entity.entity_name}</h5>

            {entity?.category_data?.map((category, catIndex) => {
              const yearData = category?.year_data || [];
              const periodType = category?.period_type;
              let columns = [];

              if (periodType === "months" && yearData?.length) {
                columns = Object.keys(yearData[0]?.months);
              } else if (periodType === "quarters" && yearData?.length) {
                columns = Object.keys(yearData[0]?.quarters);
              } else if (periodType === "half_years" && yearData?.length) {
                columns = Object.keys(yearData[0]?.half_years);
              } else if (periodType === "years" && category.years) {
                columns = ["Submitted"];
              }

              return (
                <div key={`category-${catIndex}`} className="category-section avoid-break">
                  {/* Category header with class to prevent breaking */}
                  <h6 className="category-header">{category.category_name}</h6>
                  <table className="data-table keep-together">
                    <thead>
                      <tr>
                        <th>Year</th>
                        {columns.map((col) => (
                          <th key={`col-${col}`}>{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {periodType === "years"
                        ? Object.entries(category?.years || {}).map(([year, submitted]) => (
                          <tr key={`year-${year}`}>
                            <td>{year}</td>
                            <td className={submitted ? "status-yes" : "status-no"}>
                              {submitted ? "Yes" : "No"}
                            </td>
                          </tr>
                        ))
                        : yearData.map((row) => (
                          <tr key={`row-${row?.year}`} className="avoid-break">
                            <td>{row?.year}</td>
                            {columns.map((col) => {
                              const value =
                                periodType === "months"
                                  ? row?.months[col]
                                  : periodType === "quarters"
                                    ? row?.quarters[col]
                                    : row?.half_years?.[col];
                              return (
                                <td
                                  key={`cell-${col}`}
                                  className={value ? "status-yes" : "status-no"}
                                >
                                  {value ? "Yes" : "No"}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {loading && (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ height: "300px" }}
        >
          <Loader />
        </div>
      )}
    </>
  );
}

export default CommunityDDMReportView;


