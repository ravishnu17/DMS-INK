import React, { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAPI } from "../constant/apiServices";
import { tableStyle } from "../constant/Util";
import DataTable from "react-data-table-component";

function PortfolioDocumentViewPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { portfolio, entity, viewType, tableData,category_id} = location?.state || {};

  const [loading, setLoading] = useState(false);
  const [ddmReportData, setDDMReportData] = useState([]);

  const [viewAnswer, setViewAnswer] = useState([]);
  const [answers, setAnswers] = useState(null);

  const queryParams = new URLSearchParams({
    entity_id: entity?.entity_id,
    category_id: category_id,
    portfolio_id: portfolio?.portfolio_id,
    model: entity?.model,
    view: true,
  });

  const apiUrl = `/reports/answerViewByCategory?${queryParams.toString()}`;

  const viewAnswers = (id) => {
   
    getAPI(`/answers/${id}`).then((res) => {
      if (res?.data?.status) {
        setViewAnswer(res?.data?.data.answer_data);
        // setAuditTrail(res?.data?.data);
      }
    })

  }



const convertToTableData = (data) => {
  if (!data) return [];

  const { periods, answers } = data.data || {};
  const tableRows = [];

  if (periods?.length > 0) {
    for (const period of periods) {
      const year = period.years || period.year || "Unknown";

      // Check for monthly data
      if (period.months) {
        for (const [month, value] of Object.entries(period.months)) {
          tableRows.push({
            period: `${month} ${year}`,
            status: value ? "View Document" : "Not Uploaded",
            link: value?.link || null,
            answer_id: value?.id || null
          });
        }

      // Check for quarterly data
      } else if (period.quarters) {
        for (const [quarter, quarterData] of Object.entries(period.quarters)) {
          const allAnswers = Object.values(quarterData || {});
          const hasAnswer = allAnswers.length > 0 && allAnswers.some(val => val && typeof val === "object");

          tableRows.push({
            period: `${quarter} ${year}`,
            status: hasAnswer ? "View Document" : "Not Uploaded",
            link: hasAnswer ? "https://example.com/mock.pdf" : null,
            answer_id: quarterData?.id || null
          });
        }

      // Check for half-year data
      } else if (period.half_years) {
        for (const [half, value] of Object.entries(period.half_years)) {
          tableRows.push({
            period: `${half} ${year}`,
            status: value ? "View Document" : "Not Uploaded",
            link: value?.link || null,
            answer_id: value?.id || null
          });
        }

      // Check for annual data
      } else if (period.years || period.year) {
        const hasData = period.data && Object.keys(period.data).length > 0;

        tableRows.push({
          period: year,
          status: hasData ? "View Document" : "Not Uploaded",
          link: hasData ? "https://example.com/mock.pdf" : null,
          answer_id: period.data?.id || null
        });
      }
    }
  } 
  
  // Handle non-renewal answers (when no period data is present)
  else if (answers?.length > 0) {
    for (const answerGroup of answers) {
      if (Array.isArray(answerGroup)) {
        for (const answer of answerGroup) {
          const hasAnswer = answer?.answer_data && Object.keys(answer.answer_data).length > 0;

          tableRows.push({
            period: "Non-Renewal",
            status: hasAnswer ? "View Document" : "Not Uploaded",
            link: hasAnswer ? "https://example.com/mock.pdf" : null,
            answer_id: answer?.answer_id || null,
            version: answer?.version
          });
        }
      }
    }
  }

  return tableRows;
};



  const getDDMReportData = useCallback(() => {
    setLoading(true);
    getAPI(apiUrl)
      .then((res) => {
        if (res?.data?.status) {
          const normalizedData = convertToTableData(res.data);
          setDDMReportData(normalizedData);
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
  }, [apiUrl]);

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



  useEffect(() => {
    getDDMReportData();
  }, [getDDMReportData]);

  const columns = [
    {
      name: "Period",
      selector: (row) => row.period,
      sortable: true,
    },
    {
      name: "Document Status",
      cell: (row) =>
        row.status === "View Document" ? (
          <a
            onClick={()=>viewAnswers(row.answer_id)}
            
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {row.status}
          </a>
        ) : (
          <span className="text-gray-400 italic">Not Uploaded</span>
        ),
    },
  ];

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

  return (
    <div className="container card p-4 shadow">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-3">
        <button className="btn" type="button" onClick={handleBack}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h5>
          {displayText}
          {" -- "} {tableData?.name}
        </h5>
        <div />
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

      <div className="card" style={{ margin: "7px" }}>
        <DataTable
          columns={columns}
          data={ddmReportData}
          customStyles={tableStyle}
          paginationRowsPerPageOptions={[25, 50, 75, 100]}
          pagination
          highlightOnHover
          pointerOnHover
          responsive
          noDataComponent={
            <span className="text-muted">No data available</span>
          }
          paginationPerPage={25}
        />
      </div>
    </div>
  );
}

export default PortfolioDocumentViewPage;
