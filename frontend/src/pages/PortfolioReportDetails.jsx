import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { getAPI } from '../constant/apiServices';
import Loader from '../constant/loader';
const portfolioData = {
  TDS: [{ id: 'CH2466F', name: 'Ayanavaram Salesian Society, Chennai' }],
  ITR: [{ id: 'AAFAA4567Q', name: 'Ayanavaram Salesian Society, Chennai' }],
  EPF: [{ id: 'TNMAS1646980000', name: 'Don Bosco Matric Hr. Sec. School' }],
  // Add more categories as needed...
};

export default function PortfolioReportDetails() {
  // const { category, id } = useParams();
  const location = useLocation();
  const { tableData, viewType } = location.state || {};
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState(null);

  const [loading, setLoading] = useState(false);
  const [ddmReportData, setDDMReportData] = useState([]);

  const queryParams = new URLSearchParams({
    id: tableData?.id,
    ddm: viewType === "ddm" ? "true" : "false",
    community: viewType === "community" ? "true" : "false",
    society: viewType === "society" ? "true" : "false"
  });

  const apiUrl = `/reports/ddmWisePortfolioList?${queryParams.toString()}`;

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

  const toggleCategory = (category) => {
    setActiveCategory(activeCategory === category ? null : category);
  };

  const handleBackClick = () => {
    navigate("/report/byPortfolioReport");
  };

  const handleListDocuments = (portfolio, entity) => {
    navigate(`/report/byPortfolioReport/portfolio-doc/${viewType}/${portfolio?.portfolio_id}`, {
      state: { portfolio: portfolio, entity: entity, viewType: viewType, tableData: tableData }
    });
  };


  return (
    <div className="container card p-4 shadow">
      <div className="d-flex align-items-center justify-content-between border-bottom">
        <button className="btn" type="button" onClick={handleBackClick}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h5>
          Portfolios of {tableData?.name}
          {/* <span className="text-warning">(DDM0016)</span> */}
        </h5>
        <div />
      </div>

      <div className="accordion" id="portfolioAccordion">
        {ddmReportData.map((portfolio, idx) => (
          <div className="accordion-item mb-3" key={portfolio?.portfolio_id}>
            <h2 className="accordion-header" id={`heading-${idx}`}>
              <button
                className={`accordion-button ${activeCategory === portfolio?.portfolio_name ? '' : 'collapsed'}`}
                type="button"
                onClick={() => toggleCategory(portfolio?.portfolio_name)}
              >
                <span className="fw-bold">{portfolio?.portfolio_name}</span>
              </button>
            </h2>
            <div
              className={`accordion-collapse collapse ${activeCategory === portfolio?.portfolio_name ? 'show' : ''}`}
            >
               <div className="accordion-body">
                {portfolio?.portfolio_entities?.length > 0 ? (
                  portfolio?.portfolio_entities?.map((entity, index) => {
                    const fields = [
                      entity?.name,
                      entity?.entity_address,
                      entity?.entity_place,
                      entity?.region
                    ];

                    const nonEmptyFields = fields.filter(
                      (val) => val !== null && val !== undefined && val.toString().trim() !== ""
                    );

                    const displayText = nonEmptyFields.length > 0
                      ? nonEmptyFields.join(", ")
                      : "NA";

                    return (
                      <div
                        key={entity?.entity_id}
                        className="d-flex justify-content-between align-items-center border p-3 mb-2 rounded shadow-sm"
                      >
                        <div>
                          <div className="fw-semibold">
                            {entity?.entity_code ?? ""}
                          </div>
                          <div className="text-muted small">{displayText}</div>
                        </div>
                        {entity?.type === "Registered" || entity?.type === null ? (<button
                          className="btn btn-outline-primary btn-sm"
                          onClick={() => handleListDocuments(portfolio, entity)}
                        >
                          📄 List Documents
                        </button>) : (
                          <p style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', border: '1px solid #dc3545', borderRadius: '0.25rem', padding: '0.25rem' }}>{entity?.type}</p>)}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center p-2">
                    <p className="text-muted">No entities found in this portfolio</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        ))}
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
