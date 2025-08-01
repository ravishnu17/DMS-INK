import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { getAPI } from '../constant/apiServices';
import Loader from '../constant/loader';

export default function PortfolioDocumentListPage() {
  const { category, id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { portfolio, entity, viewType, tableData } = location?.state || {};
  const [activeCategory, setActiveCategory] = useState(null);
  

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

  const portfolioName = location.state?.name || 'Portfolio';

  const handleBack = () => {
    navigate(-1); // go back to previous page
  };

  const handleViewDocument = (category_id) => {

    navigate(`/report/byPortfolioReport/portfolio-view/${viewType}/${portfolio?.portfolio_id}`, {
      state: { portfolio: portfolio, entity: entity, viewType: viewType, tableData: tableData,category_id:category_id }
    });
  };

  const handleViewByPeriod = (category_id) => {
    navigate(`/report/byPortfolioReport/portfolio-viewForOverPeriod/${viewType}/${portfolio?.portfolio_id}`, {
      state: { portfolio: portfolio, entity: entity, viewType: viewType, tableData: tableData,category_id:category_id }
    });
  };
  
  const handleViewOverview = (category_id) => {
    navigate(`/report/byPortfolioReport/portfolio-viewOverview/${viewType}/${portfolio?.portfolio_id}`, {
      state: { portfolio: portfolio, entity: entity, viewType: viewType, tableData: tableData,category_id:category_id }
    });
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

  return (
    <div className="container card p-4 shadow">
      <div className="d-flex align-items-center justify-content-between border-bottom mb-3">
        <button className="btn" type="button" onClick={handleBack}>
          <i className="fa-solid fa-circle-left fs-5" />
        </button>
        <h5>
          {displayText}{" -- "} {tableData?.name}
        </h5>
        <div />
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
          <Loader />
        </div>
      ) :
        ddmReportData?.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="fa-solid fa-folder-open fa-2x mb-3 d-block" />
            <div>No documents available.</div>
          </div>
        ) : (
          <div className="list-group">
            {ddmReportData.map((category, index) => (
              <div
                key={index}
                className="d-flex justify-content-between align-items-center border rounded p-3 mb-3 shadow-sm"
              >
                <div className="fw-semibold">
                  {category?.category_name}
                </div>
               <div style={{width: '180px'}} className="d-flex gap-2 ">
                  <button
                    className="btn btn-outline-primary btn-sm"
                    onClick={() => handleViewDocument(category?.category_id)}
                  >
                    View
                  </button>
                  {/* {category?.is_renewal && <button
                    className="btn  btn-outline-secondary btn-sm"
                    onClick={() => handleViewByPeriod(category?.category_id)}
                  >
                    View By Period
                  </button>} */}
                   {category?.is_renewal && <button
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => handleViewOverview(category?.category_id)}
                  >
                    Overview
                  </button>}
                </div>
                    
              </div>
            ))}
          </div>
        )}
    </div>
  );
}
