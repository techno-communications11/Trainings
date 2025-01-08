import React, { useState, useEffect } from "react";
// import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import "./Login.css";
import { RxUpdate } from "react-icons/rx";
import { IoMdDownload } from "react-icons/io";
import { Popover, OverlayTrigger,Container   } from "react-bootstrap";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import Lottie from "react-lottie";
import animationData from "./Animation.json";

const TrackingDetails = () => {
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [date, setDate] = useState(null);
  const [activePopover, setActivePopover] = useState(null);
  const [filters, setFilters] = useState({
    ntid: "",
    name: "",
    status: "",
    assignedDate: "",
    duration: "",
    dm: "",
    doorcode: "",
    market: "All",
    color: "All",
  });

  useEffect(() => {
    const fetchTrackingDetails = async () => {
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/tracking-details`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTrackingDetails(data.trackingDetails);
        setFilteredDetails(data.trackingDetails);
        const dates = [
          ...new Set(data.trackingDetails.map((detail) => detail.Date)),
        ];
        setDate(dates.length > 0 ? dates[0] : null);
        const uniqueMarkets = [
          ...new Set(data.trackingDetails.map((detail) => detail.Market)),
        ].sort();
        setMarkets(uniqueMarkets);
      } catch (err) {
        setError(
          "Error fetching tracking details. Please check the server or network connection."
        );
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingDetails();
  }, []);

  const getChicagoDate = () => {
    return new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
    });
  };

  const calculateDuration = (assignedDate) => {
    const chicagoDate = new Date(getChicagoDate());
    const assignedDateObj = new Date(assignedDate);
    chicagoDate.setHours(0, 0, 0, 0);
    assignedDateObj.setHours(0, 0, 0, 0);
    return Math.ceil((chicagoDate - assignedDateObj) / (1000 * 60 * 60 * 24));
  };

  const getRowStyle = (assignedDate) => {
    const duration = calculateDuration(assignedDate);
    if (duration >= 14) return "table-danger";
    if (duration >= 7) return "table-warning";
    return "";
  };

  const getComment = (assignedDate) => {
    const duration = calculateDuration(assignedDate);
    return duration >= 14 ? "Past Due" : "";
  };

  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Training Report");
  
    // Define the headers
    worksheet.columns = [
      { header: "SI No", key: "siNo", width: 10 },
      { header: "NTID", key: "ntid", width: 15 },
      { header: "Name", key: "name", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "AssignedDate", key: "assignedDate", width: 15 },
      { header: "Duration", key: "duration", width: 15 },
      { header: "Comments", key: "comments", width: 20 },
      { header: "DM", key: "dm", width: 10 },
      { header: "Mainstore", key: "mainstore", width: 15 },
      { header: "Doorcode", key: "doorcode", width: 15 },
      { header: "Market", key: "market", width: 15 },
    ];
  
    // Add rows with conditional formatting
    filteredDetails.forEach((detail, index) => {
      const duration = calculateDuration(detail.assignedDate);
      const durationText = `${duration} ${duration > 1 ? "days" : "day"}`;
  
      const row = worksheet.addRow({
        siNo: index + 1,
        ntid: detail.ntid,
        name: detail.name,
        status: detail.status,
        assignedDate: detail.assignedDate.split(" ")[0],
        duration: durationText,
        comments: getComment(detail.assignedDate),
        dm: detail.dm,
        mainstore: detail.mainstore.toLowerCase(),
        doorcode: detail.doorcode,
        market: detail.Market.toLowerCase(),
      });
  
      // Apply color based on duration
      if (duration >= 14) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFF0000" }, // Red
          };
        });
      } else if (duration >= 7 && duration <= 13) {
        row.eachCell((cell) => {
          cell.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF00" }, // Yellow
          };
        });
      }
    });
  
    // Save the file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "training_report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFilterChange = (value, header) => {
    if (!header) return;

    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, [header]: value };
      filterData(newFilters);
      return newFilters;
    });
    setActivePopover(null);
  };

  const handleMarketFilter = (market) => {
    setSelectedMarket(market);
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters, market };
      filterData(newFilters);
      return newFilters;
    });
    setActivePopover(null);
  };

  const handleSortChange = (column, order) => {
    const sortedData = [...filteredDetails].sort((a, b) => {
      if (column === "assigneddate") {
        return order === "asc"
          ? new Date(a.assignedDate) - new Date(b.assignedDate)
          : new Date(b.assignedDate) - new Date(a.assignedDate);
      }
      if (column === "duration") {
        const durationA = calculateDuration(a.assignedDate);
        const durationB = calculateDuration(b.assignedDate);
        return order === "asc" ? durationA - durationB : durationB - durationA;
      }
      const valueA = (a[column] || "").toString().toLowerCase();
      const valueB = (b[column] || "").toString().toLowerCase();
      return order === "asc"
        ? valueA.localeCompare(valueB)
        : valueB.localeCompare(valueA);
    });
    setFilteredDetails(sortedData);
    setActivePopover(null);
  };

  const filterData = (currentFilters) => {
    const filtered = trackingDetails.filter((detail) => {
      const duration = calculateDuration(detail.assignedDate);
      const colorMatch =
        currentFilters.color === "All" ||
        (currentFilters.color === "Red" && duration >= 14) ||
        (currentFilters.color === "Yellow" && duration >= 7 && duration < 14) ||
        (currentFilters.color === "No Color" && duration < 7);

      return (
        (!currentFilters.status ||
          detail.status.toLowerCase().includes(currentFilters.status.toLowerCase())) &&
        (!currentFilters.assignedDate ||
          detail.assignedDate.includes(currentFilters.assignedDate)) &&
        (!currentFilters.duration || duration.toString().includes(currentFilters.duration)) &&
        (!currentFilters.dm ||
          detail.dm.toLowerCase().includes(currentFilters.dm.toLowerCase())) &&
        (currentFilters.market === "All" ||
          detail.Market.toLowerCase() === currentFilters.market.toLowerCase()) &&
        colorMatch
      );
    });
    setFilteredDetails(filtered);
  };

  const ColorFilter = ({ color, active, onClick }) => (
    <div
      onClick={onClick}
      className="color-option mx-2 cursor-pointer"
      style={{
        width: "30px",
        height: "30px",
        borderRadius: "50%",
        backgroundColor: color === "All" 
          ? "transparent"
          : color === "Red"
          ? "#dc3545"
          : color === "Yellow"
          ? "#ffc107"
          : "rgba(108, 117, 125, 0.25)",
        border: active ? "2px solid #000" : "1px solid #dee2e6",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s ease-in-out",
      }}
    >
      {color === "All" && (
        <span className="text-white bg-dark p-2 rounded-circle" style={{ fontSize: "12px" }}>
          All
        </span>
      )}
    </div>
  );

  const renderPopover = (header) => (
    <Popover id={`popover-${header}`} className="shadow-sm">
      <Popover.Body className="p-0">
        <div className="list-group list-group-flush">
          {header === "Market" && (
            <>
              <button
                className="list-group-item list-group-item-action"
                onClick={() => handleMarketFilter("All")}
              >
                All
              </button>
              {markets.map((market) => (
                <button
                  key={market}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleMarketFilter(market)}
                >
                  {market}
                </button>
              ))}
            </>
          )}
          {["Duration", "AssignedDate"].includes(header) && (
            <>
              <button
                className="list-group-item list-group-item-action"
                onClick={() => handleSortChange(header.toLowerCase(), "asc")}
              >
                ↑ Ascending
              </button>
              <button
                className="list-group-item list-group-item-action"
                onClick={() => handleSortChange(header.toLowerCase(), "desc")}
              >
                ↓ Descending
              </button>
            </>
          )}
          {["Status", "DM"].includes(header) && (
            <>
              <button
                className="list-group-item list-group-item-action"
                onClick={() => handleFilterChange("", header.toLowerCase())}
              >
                All
              </button>
              {[
                ...new Set(
                  trackingDetails.map((detail) => detail[header.toLowerCase()])
                ),
              ].map((value) => (
                <button
                  key={value}
                  className="list-group-item list-group-item-action"
                  onClick={() => handleFilterChange(value, header.toLowerCase())}
                >
                  {value}
                </button>
              ))}
            </>
          )}
        </div>
      </Popover.Body>
    </Popover>
  );

  const tableHeaders = [
    "SI No",
    "NTID",
    "Name",
    "Status",
    "AssignedDate",
    "Duration",
    "Comments",
    "DM",
    "Main Store",
    "Doorcode",
    "Market",
  ];

  if (error) return <div className="alert alert-danger p-2 small">{error}</div>;
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  if (loading) {
    return (
      <Container
        fluid
        className="d-flex justify-content-center align-items-center vh-100"
      >
        <Lottie options={defaultOptions} height={150} width={150} />
      </Container>
    );
  }

  return (
    <div className="card shadow-sm mt-2">
      <div className="card-body p-2">
        <div className="d-flex flex-column flex-md-row justify-content-around align-items-center mb-3">
          <div className="d-flex align-items-center mb-2 mb-md-0">
            <button 
              onClick={exportToExcel} 
              className="btn btn-primary btn-sm d-flex align-items-center gap-2"
            >
              <IoMdDownload className="fs-5" />
              Export Excel
            </button>
            {date && (
              <span className="text-success fw-bolder ms-3 d-flex align-items-center">
                <RxUpdate className="fs-3" />
                <span className="ms-1">
                  Uploaded On: {new Date(date).toLocaleDateString()}
                </span>
              </span>
            )}
          </div>

          <div className="text-center">
            <h4 className="small mb-0">
              Ready! Express - Self-Paced (NEW HIRE TRAINING)
              <span className="ms-2 text-muted">
                {new Date().toLocaleDateString()}
              </span>
            </h4>
          </div>

          <div className="d-flex justify-content-center align-items-center">
            {["All", "Red", "Yellow", "No Color"].map((color) => (
              <ColorFilter
                key={color}
                color={color}
                active={filters.color === color}
                onClick={() => {
                  setFilters((prevFilters) => {
                    const newFilters = { ...prevFilters, color };
                    filterData(newFilters);
                    return newFilters;
                  });
                }}
              />
            ))}
          </div>
        </div>

        <div className="table-responsive" style={{ maxHeight: "700px", overflowY: "auto" }}>
          <table className="table table-bordered table-hover table-sm">
            <thead className="text-center sticky-top bg-white">
              <tr>
                {tableHeaders.map((header, index) => (
                  <th key={index} className="position-relative">
                    <OverlayTrigger
                      trigger="click"
                      placement="bottom"
                      show={activePopover === header}
                      onToggle={(nextShow) => setActivePopover(nextShow ? header : null)}
                      overlay={renderPopover(header)}
                      rootClose
                    >
                      <button
                        className="btn  text-white btn-link text-dark text-decoration-none w-100 d-flex justify-content-center align-items-center p-1"
                        onClick={() => setActivePopover(activePopover === header ? null : header)}
                      >
                        {header}
                        {['DM','Market','Duration','AssignedDate','Status'].includes(header)&&<MdOutlineKeyboardArrowDown 
                          className={`transition-transform ${
                            activePopover === header ? 'rotate-180' : ''
                          }`}
                        />}
                      </button>
                    </OverlayTrigger>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="small">
              {filteredDetails.map((detail, index) => (
                <tr key={index} className={getRowStyle(detail.assignedDate)}>
                  <td className="text-center">{index + 1}</td>
                  <td className="text-center">{detail.ntid}</td>
                  <td className="text-center text-capitalize">{detail.name}</td>
                  <td className="text-center">{detail.status}</td>
                  <td className="text-center">{detail.assignedDate.split(" ")[0]}</td>
                  <td className="text-center">
                    {`${calculateDuration(detail.assignedDate)} ${
                      calculateDuration(detail.assignedDate) > 1 ? "days" : "day"
                    }`}
                  </td>
                  <td className="text-center">{getComment(detail.assignedDate)}</td>
                  <td className="text-center">{detail.dm}</td>
                  <td className="text-center text-capitalize">{detail.mainstore.toLowerCase()}</td>
                  <td className="text-center">{detail.doorcode}</td>
                  <td className="text-center text-capitalize">{detail.Market.toLowerCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TrackingDetails;