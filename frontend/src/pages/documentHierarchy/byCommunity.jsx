import React, { useCallback, useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import { getAPI } from "../../constant/apiServices";
import Loader from "../../constant/loader";

function byCommunity() {
  const [cummunityList, setCummunityList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const getUserList = useCallback(() => {
    getAPI(`/reports/community?skip=0&limit=0`)
      .then((res) => {
        if (res?.data?.status) {
          setCummunityList(res?.data?.data);
          setLoading(false);
          setDataLoading(false);
          // setTotalRows(res?.data?.total_count);
        } else {
          setCummunityList([]);
          setLoading(false);
          setDataLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
        setDataLoading(false);
      });
  }, []);

  useEffect(() => {
    getUserList();
  }, [getUserList]);

  const transformCompanyList = (companies) => {
    const rows = [];

    companies.forEach((company) => {
      // Group header
      rows.push({
        type: "group",
        label: `${company?.code || "No Code"} -- ${
          company?.name || "No Name"
        }, ${company?.place || "No Place"}`,
      });

      // CFP rows
      const cfpList = company?.cfp || [];
      cfpList.forEach((item) => {
        rows.push({
          type: "cfp",
          key: item?.portfolio?.name || "Unknown",
          value:
            item?.number ||
            item?.name ||
            (item?.type != "Registered" && item?.type) ||
            "",
        });
      });

      // Entity + LEFP rows
      const entityList = company?.legal_entity || [];
      entityList.forEach((entity) => {
        // Entity row
        rows.push({
          type: "entity",
          key: `${entity?.code || ""} -- ${entity?.name || "Unnamed Entity"}`,
          //   value: "",
          value: entity?.place || "",
        });

        const lefpList = entity?.lefp || [];
        lefpList.forEach((lefp) => {
          rows.push({
            type: "lefp",
            key: lefp?.portfolio?.name || "Unknown",
            value:
              lefp?.number ||
              lefp?.name ||
              (lefp?.type != "Registered" && lefp?.type) ||
              "",
          });
        });
      });
      //   Society + SFP rows
      const societyList = company?.society || [];
      societyList.forEach((society) => {
        // Society row
        rows.push({
          type: "society",
          key: `${society?.code || ""} -- ${
            society?.name || "Unnamed Society"
          }`,
          //   value: "",
          value: society?.place || "",
        });

        const sfpList = society?.sfp || [];
        sfpList.forEach((sfp) => {
          rows.push({
            type: "sfp",
            key: sfp?.portfolio?.name || "Unknown",
            value: sfp?.number || sfp?.name || "",
          });
        });
      });
    });

    return rows;
  };

  const rawData = transformCompanyList(cummunityList);

  const columns = [
    {
      name: "Details",
      cell: (row) => {
        let style = {
          textAlign: "left",
          width: "100%",
          padding: "8px 12px",
          fontWeight: "normal",
          fontSize: "15px",
        };

        if (row.type === "group") {
          style.fontWeight = "bold";
          //   style.backgroundColor = '#f0f0f0';
          return <div style={style}>{row.label}</div>;
        }

        if (row.type === "cfp") {
          style.paddingLeft = "38px";
          //   return <div style={style}>{row.key} -- {row.value}</div>;
          return (
            <div style={style}>
              {row.key} --{" "}
              {row.value ? row.value : <span style={{ color: "red" }}>—</span>}
            </div>
          );
        }

        if (row.type === "entity") {
          style.paddingLeft = "38px";
          //   style.color = '#3366cc';
          //   return <div style={style}>{row.key}</div>;
          return (
            <div style={style}>
              {row.key},{" "}
              {row.value ? row.value : <span style={{ color: "red" }}>—</span>}
            </div>
          );
        }

        if (row.type === "lefp") {
          style.paddingLeft = "58px";
          style.color = "#666";
          //   return <div style={style}>{row.key} -- {row.value}</div>;
          return (
            <div style={style}>
              {row.key} --{" "}
              {row.value ? row.value : <span style={{ color: "red" }}>—</span>}
            </div>
          );
        }

        if (row.type === "society") {
          style.paddingLeft = "38px";
          return (
            <div style={style}>
              {row.key},{" "}
              {row.value ? row.value : <span style={{ color: "red" }}>—</span>}
            </div>
          );
        }
        if (row.type === "sfp") {
          style.paddingLeft = "58px";
          style.color = "#666";
          return (
            <div style={style}>
              {row.key} --{" "}
              {row.value ? row.value : <span style={{ color: "red" }}>—</span>}
            </div>
          );
        }

        return (
          <div style={style}>
            {row.key} -- {row.value}
          </div>
        );
      },
    },
  ];

  const customStyles = {
    rows: {
      style: {
        padding: 0,
        // minHeight: '40px',
        borderBottom: "1px solid #ccc",
      },
    },
    table: {
      style: {
        // border: '1px solid #000',
      },
    },
    headRow: {
      style: {
        display: "none", // Hide header row
      },
    },
  };

  const customLoader = (
    <div style={{ padding: "20px", textAlign: "center", color: "#888" }}>
      <span className="loader" style={{ fontSize: "1.2rem" }}>
        Loading...
      </span>
    </div>
  );

  return (
    <>
      <div className="d-flex justify-content-between p-2 bg-white">
        <div className="p-2">
          <h6 className="fw-bold mb-0">Document Hierarchy By Community</h6>
        </div>
      </div>

      <div className="card" style={{ margin: "7px" }}>
        <DataTable
          columns={columns}
          data={rawData}
          customStyles={customStyles}
          highlightOnHover
          pointerOnHover
          responsive
          pagination
          paginationPerPage={25}
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          // progressPending={loading}
          noDataComponent={
            !dataLoading && (
              <div className="text-center  py-4">No data found</div>
            )
          }
          progressComponent={customLoader}
        />
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
}

export default byCommunity;
