import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAPI } from "../constant/apiServices";
import html2pdf from "html2pdf.js";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import Loader from '../constant/loader';

function PortfolioDocumentViewOverview() {
  const location = useLocation();
  const navigate = useNavigate();
  const { portfolio, entity, viewType, tableData, category_id } =
    location?.state || {};

  const [loading, setLoading] = useState(false);
  const [ansData, setAnsData] = useState([]);
  const reportRef = useRef();

  const queryParams = new URLSearchParams({
    entity_id: entity?.entity_id,
    category_id: category_id,
    portfolio_id: portfolio?.portfolio_id,
    model: entity?.model,
    view_overview: true,
  });

  const periodType = ansData?.periods?.[0]
    ? ansData.periods[0].months
      ? "monthly"
      : ansData.periods[0].quarters
        ? "quarterly"
        : ansData.periods[0].half_years
          ? "half_yearly"
          : ansData.periods[0].has_data !== undefined
            ? "yearly"
            : null
    : null;

  const apiUrl = `/reports/answerViewByCategory?${queryParams.toString()}`;

  const getAnsData = useCallback(() => {
    setLoading(true);
    getAPI(apiUrl)
      .then((res) => {
        if (res?.data?.status) {
          setAnsData(res?.data?.data);
        } else {
          setAnsData([]);
        }
      })
      .catch(console.log)
      .finally(() => setLoading(false));
  }, [apiUrl]);

  useEffect(() => {
    getAnsData();
  }, [getAnsData]);

  const handleBack = () => {
    navigate(-1);
  };

  const fields = [
    entity?.name,
    entity?.entity_address,
    entity?.entity_place,
    entity?.region,
  ];

  const nonEmptyFields = fields.filter(
    (val) => val !== null && val !== undefined && val.toString().trim() !== ""
  );

  const displayText =
    nonEmptyFields?.length > 0 ? nonEmptyFields.join(", ") : "NA";

  const downloadPDF = () => {
    if (!ansData?.periods || ansData.periods.length === 0) {
      alert("No data available to download.");
      return;
    }

    const element = reportRef.current;
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Portfolio_Report_${new Date().getTime()}.pdf`,
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

    const elementClone = element.cloneNode(true);

    // Create a header element with displayText
    const header = document.createElement("h2");
    header.textContent = displayText;
    header.style.textAlign = "center";
    header.style.marginBottom = "20px";

    // Insert the header at the top of the cloned content
    elementClone.insertBefore(header, elementClone.firstChild);

    // Ensure tables are kept together in PDF rendering
    elementClone.querySelectorAll("table").forEach((table) => {
      table.classList.add("keep-together", "avoid-break");
    });

    // const elementClone = element.cloneNode(true);
    // document.body.appendChild(elementClone);

    // elementClone.querySelectorAll("table").forEach((table) => {
    //   table.classList.add("keep-together", "avoid-break");
    // });

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

      const sheet = workbook.addWorksheet('Portfolio Report');
      sheet.properties.defaultColWidth = 15;

      // Add headers
      // sheet.addRow([`Entity: ${displayText}`]).font = { bold: true, size: 14 };
      // sheet.addRow([`Category: ${ansData?.category_name || "N/A"}`]).font = { bold: true, size: 12 };
      // sheet.addRow([]);
      // Add Entity row and merge cells across columns A to E (or dynamically later)
      // Add Entity row and merge cells
      const entityRow = sheet.addRow([`${displayText}`]);
      entityRow.font = { bold: true, size: 14 };
      sheet.mergeCells(`A${entityRow.number}:E${entityRow.number}`);

      // Add a blank row (gap)
      sheet.addRow([]);

      // Add Category row and merge cells
      const categoryRow = sheet.addRow([`${ansData?.category_name || "N/A"}`]);
      categoryRow.font = { bold: true, size: 12 };
      sheet.mergeCells(`A${categoryRow.number}:E${categoryRow.number}`);

      // Add another blank row before the table (optional)
      sheet.addRow([]);


      if (periodType === "monthly") {
        const headerRow = sheet.addRow(["Year", ...Object.keys(ansData.periods[0].months)]);
        headerRow.eachCell((cell) => {
          cell.style = tableHeaderStyle;
        });

        ansData.periods.forEach((row) => {
          const dataCells = [row.year];
          Object.values(row.months).forEach(val => {
            dataCells.push(val ? "Yes" : "No");
          });
          const dataRow = sheet.addRow(dataCells);

          dataCells.slice(1).forEach((_, idx) => {
            const cell = dataRow.getCell(idx + 2);
            cell.style = cell.value === "Yes" ? yesCellStyle : noCellStyle;
          });
        });
      }
      else if (periodType === "quarterly") {
        const headerRow = sheet.addRow(["Year", ...Object.keys(ansData.periods[0].quarters)]);
        headerRow.eachCell((cell) => {
          cell.style = tableHeaderStyle;
        });

        ansData.periods.forEach((row) => {
          const dataCells = [row.year];
          Object.values(row.quarters).forEach(val => {
            dataCells.push(val ? "Yes" : "No");
          });
          const dataRow = sheet.addRow(dataCells);

          dataCells.slice(1).forEach((_, idx) => {
            const cell = dataRow.getCell(idx + 2);
            cell.style = cell.value === "Yes" ? yesCellStyle : noCellStyle;
          });
        });
      }
      else if (periodType === "half_yearly") {
        const headerRow = sheet.addRow(["Year", ...Object.keys(ansData.periods[0].half_years)]);
        headerRow.eachCell((cell) => {
          cell.style = tableHeaderStyle;
        });

        ansData.periods.forEach((row) => {
          const dataCells = [row.year];
          Object.values(row.half_years).forEach(val => {
            dataCells.push(val ? "Yes" : "No");
          });
          const dataRow = sheet.addRow(dataCells);

          dataCells.slice(1).forEach((_, idx) => {
            const cell = dataRow.getCell(idx + 2);
            cell.style = cell.value === "Yes" ? yesCellStyle : noCellStyle;
          });
        });
      }
      else if (periodType === "yearly") {
        const headerRow = sheet.addRow(["Year", "Submitted"]);
        headerRow.eachCell((cell) => {
          cell.style = tableHeaderStyle;
        });

        ansData.periods.forEach((row) => {
          const dataRow = sheet.addRow([row.years, row.has_data ? "Yes" : "No"]);
          dataRow.getCell(2).style = row.has_data ? yesCellStyle : noCellStyle;
        });
      }

      // Auto-size columns
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

      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(blob, `Portfolio_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
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

        /* Status table styles */
        .monthly-status-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .monthly-status-table th, 
        .monthly-status-table td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: center;
        }
        
        .monthly-status-table th {
          background-color: #f2f2f2;
          font-weight: bold;
        }
        
        .status-cell.yes {
          background-color: #d4edda;
          color: #155724;
        }
        
        .status-cell.no {
          background-color: #f8d7da;
          color: #721c24;
        }
      `}</style>

      <div className="container card p-4 shadow">
      
        <div className="d-flex align-items-center justify-content-between border-bottom mb-3">
          <div className="flex-shrink-0">
            <button className="btn" type="button" onClick={handleBack}>
              <i className="fa-solid fa-circle-left fs-5" />
            </button>
          </div>
         
          <div className="flex-grow-1 px-2 text-center">
            <h5 className="m-0 text-break">
              {displayText} {" -- "} {tableData?.name}
            </h5>
          </div>

          <div className="d-flex gap-2 flex-shrink-0">
            <button
              className="btn"
              title="Download PDF"
              style={{ backgroundColor: "#3498db", color: "white", fontSize: "14px" }}
              onClick={downloadPDF}
              disabled={!ansData?.periods || ansData.periods.length === 0}
            >
              <i className="fa fa-download me-1"></i> Download PDF
            </button>
            <button
              className="btn btn-success"
              title="Download Excel"
              style={{ fontSize: "14px" }}
              onClick={downloadExcel}
              disabled={!ansData?.periods || ansData.periods.length === 0}
            >
              <i className="fa fa-file-excel me-1"></i> Download Excel
            </button>
          </div>
        </div>

        <div ref={reportRef} className="report-container">
          <p style={{ fontWeight: "bold" }}>{ansData?.category_name}</p>

          {ansData?.periods?.length > 0 && (
            <div className="entity-container keep-together">
              {periodType === "monthly" && (
                <table className="monthly-status-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      {Object.keys(ansData.periods[0].months).map((month) => (
                        <th key={month}>{month}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ansData.periods.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        {Object.keys(row.months).map((month) => (
                          <td
                            key={month}
                            className={row.months[month] ? "status-cell yes" : "status-cell no"}
                          >
                            {row.months[month] ? "Yes" : "No"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {periodType === "quarterly" && (
                <table className="monthly-status-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      {Object.keys(ansData.periods[0].quarters).map((q) => (
                        <th key={q}>{q}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ansData.periods.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        {Object.keys(row.quarters).map((q) => (
                          <td
                            key={q}
                            className={row.quarters[q] ? "status-cell yes" : "status-cell no"}
                          >
                            {row.quarters[q] ? "Yes" : "No"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {periodType === "half_yearly" && (
                <table className="monthly-status-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      {Object.keys(ansData.periods[0].half_years).map((half) => (
                        <th key={half}>{half}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ansData.periods.map((row) => (
                      <tr key={row.year}>
                        <td>{row.year}</td>
                        {Object.keys(row.half_years).map((half) => (
                          <td
                            key={half}
                            className={row.half_years[half] ? "status-cell yes" : "status-cell no"}
                          >
                            {row.half_years[half] ? "Yes" : "No"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {periodType === "yearly" && (
                <table className="monthly-status-table">
                  <thead>
                    <tr>
                      <th>Year</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ansData.periods.map((row) => (
                      <tr key={row.years}>
                        <td>{row.years}</td>
                        <td className={row.has_data ? "status-cell yes" : "status-cell no"}>
                          {row.has_data ? "Yes" : "No"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {(!ansData?.periods || ansData.periods.length === 0) && !loading && (
            <div className="no-data-message">
              <p>No data available for this report.</p>
            </div>
          )}
        </div>

        {loading && (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: "500px" }}
          >
            <Loader />
          </div>
        )}
      </div>
    </>
  );
}

export default PortfolioDocumentViewOverview;