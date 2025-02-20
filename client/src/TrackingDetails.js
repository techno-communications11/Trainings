import React, { useState, useEffect } from "react";
import ExcelJS from "exceljs";
import "./Login.css";
import { RxUpdate } from "react-icons/rx";
import { IoMdDownload } from "react-icons/io";
import { Popover, OverlayTrigger, Container } from "react-bootstrap";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";
import Lottie from "react-lottie";
import animationData from "./Animation.json";

const TrackingDetails = () => {
  const [trackingDetails, setTrackingDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [markets, setMarkets] = useState([]);
  const [names, setNames] = useState([]);
  const [selectedMarkets, setSelectedMarkets] = useState([]);
  const [selectedName, setSelectedName] = useState([]);
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

  // Fetch data on component mount
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
        console.log(data.trackingDetails);

        // Extract unique dates and markets
        const dates = [
          ...new Set(data.trackingDetails.map((detail) => detail.Date)),
        ];
        setDate(dates.length > 0 ? dates[0] : null);

        const uniqueMarkets = [
          ...new Set(
            data.trackingDetails.map((detail) => detail.Market.toLowerCase())
          ),
        ].sort();
        const uniqueNames = [
          ...new Set(
            data.trackingDetails.map((detail) => detail.name.toLowerCase())
          ),
        ].sort();
        setMarkets(uniqueMarkets);
        setNames(uniqueNames);
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

  // Centralized filtering logic
  useEffect(() => {
    const filterData = () => {
      let filtered = trackingDetails.filter((detail) => {
        const duration = calculateDuration(detail.assignedDate);

        // Color filter
        const colorMatch = (() => {
          switch (filters.color) {
            case "Red":
              return duration >= 14;
            case "Yellow":
              return duration >= 7 && duration < 14;
            case "No Color":
              return duration < 7;
            case "All":
            default:
              return true;
          }
        })();

        // Market filter (case-insensitive)
        const marketMatch =
          selectedMarkets.length === 0 ||
          selectedMarkets.includes(detail.Market.toLowerCase());
          //name filter
          const nameMatch =
          selectedName.length === 0 ||
          selectedName.includes(detail.name.toLowerCase());

        // Status filter (case-insensitive)
        const statusMatch =
          !filters.status ||
          detail.status.toLowerCase().includes(filters.status.toLowerCase());

        // DM filter (case-insensitive)
        const dmMatch =
          !filters.dm ||
          detail.dm.toLowerCase().includes(filters.dm.toLowerCase());

        return colorMatch && marketMatch && statusMatch && dmMatch&&nameMatch;
      });

      setFilteredDetails(filtered);
    };

    if (trackingDetails.length > 0) {
      filterData();
    }
  }, [filters, selectedMarkets, trackingDetails,selectedName]);

  // Helper functions
  const getChicagoDate = () => {
    return new Date().toLocaleString("en-US", {
      timeZone: "America/Chicago",
    });
  };

  const calculateDuration = (assignedDate) => {
    const chicagoDate = new Date(getChicagoDate());
    const assignedDateObj = new Date(assignedDate);
    const differenceInMillis = chicagoDate - assignedDateObj;
    const totalSeconds = Math.floor(differenceInMillis / 1000);
    return Math.floor(totalSeconds / (24 * 60 * 60)); // Total days
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

  // Export to Excel
  const exportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Training Report");

    // Define headers
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
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "training_report.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Handle filter changes
  const handleFilterChange = (value, header) => {
    if (!header) return;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [header]: value,
    }));
  };

  // Handle market filter
  const handleMarketFilter = (market) => {
    const marketLower = market.toLowerCase();
    setSelectedMarkets((prevMarkets) => {
      const updatedMarkets = prevMarkets.includes(marketLower)
        ? prevMarkets.filter((m) => m !== marketLower)
        : [...prevMarkets, marketLower];
      return updatedMarkets;
    });
  };

  const handleNameFilter = (name) => {
    const nameLower = name.toLowerCase();
    console.log(nameLower,"sss");
    setSelectedName((prevName) => {
      const updatedName = prevName.includes(nameLower)
        ? prevName.filter((m) => m !== nameLower)
        : [...prevName, nameLower];
        console.log(updatedName,"kkk");
      return updatedName;
    });
  };

  const handleSortChange = (column, order) => {
    setFilteredDetails((prevDetails) => {
        // Sort based on the selected column first (status, assigneddate, etc.)
        const sortedData = [...prevDetails].sort((a, b) => {
            let result = 0;

            if (column === "assigneddate") {
                const dateA = new Date(a.assignedDate);
                const dateB = new Date(b.assignedDate);
                result = order === "asc" ? dateA - dateB : dateB - dateA;
            } else if (column === "duration") {
                const durationA = calculateDuration(a.assignedDate);
                const durationB = calculateDuration(b.assignedDate);
                result = order === "asc" ? durationA - durationB : durationB - durationA;
            } else if (column === "dm") {
                result = order === "asc" ? a.dm.localeCompare(b.dm) : b.dm.localeCompare(a.dm);
            } else if (column === "status") {
                result = order === "asc" ? a.status.localeCompare(b.status) : b.status.localeCompare(a.status);
            }

            return result;
        });

        // Group by 'dm' after sorting to ensure rows with the same 'dm' value are together
        const groupedData = sortedData.reduce((groups, row) => {
            if (!groups[row.dm]) {
                groups[row.dm] = [];
            }
            groups[row.dm].push(row);
            return groups;
        }, {});

        // Flatten the grouped data back into a single array
        const finalSortedData = Object.values(groupedData).flat();

        return finalSortedData;
    });

    setActivePopover(null);
};





  // Render popover for filters
  const renderPopover = (header) => (
    <Popover id={`popover-${header}`} className="shadow-sm ">
      <Popover.Body className="p-0 ">
        <div className="list-group list-group-flush ">
          {header === "Market" && (
            <>
              <button
                className="list-group-item list-group-item-action text-success"
                onClick={() => setSelectedMarkets([])}
              >
                All
              </button>
              {markets.map((market) => (
                <div
                  key={market}
                  className="list-group-item d-flex align-items-center text-success"
                >
                  <input
                    type="checkbox"
                    className="me-2"
                    checked={selectedMarkets.includes(market)}
                    onChange={() => handleMarketFilter(market)}
                    id={`market-${market}`}
                  />
                  
                  <label
                    htmlFor={`market-${market}`}
                    className="mb-0 flex-grow-1 cursor-pointer text-capitalize"
                    style={{ cursor: "pointer" }}
                  >
                    {market}
                  </label>
                </div>
              ))}
            </>
          )}
          {(
            header === "Name" &&
            (
              <>
              <button
                className="list-group-item list-group-item-action text-success"
                onClick={() => setSelectedMarkets([])}
              >
                All
              </button>
              {names.map((name) => (
                <div
                  key={name}
                  className="list-group-item d-flex align-items-center text-success"
                >
                  <input
                    type="checkbox"
                    className="me-2"
                    checked={selectedName.includes(name)}
                    onChange={() => handleNameFilter(name)}
                    id={`market-${name}`}
                  />
                  
                  <label
                    htmlFor={`market-${name}`}
                    className="mb-0 flex-grow-1 cursor-pointer text-capitalize"
                    style={{ cursor: "pointer" }}
                  >
                    {name}
                  </label>
                </div>
              ))}
            </>

            )
          )}
          {["Status", "DM"].includes(header) && (
            <>
              <button
                className="list-group-item list-group-item-action text-success"
                onClick={() => handleFilterChange("", header.toLowerCase())}
              >
                All
              </button>
              {["Status","DM"].includes(header)&&(<><button
                className="list-group-item list-group-item-action text-success"
                onClick={() => handleSortChange(header.toLowerCase(), "asc")}
              >
                ↑ Ascending
              </button>
              <button
                className="list-group-item list-group-item-action text-success"
                onClick={() => handleSortChange(header.toLowerCase(), "desc")}
              >
                ↓ Descending
              </button></>)}
              {[
                ...new Set(
                  filteredDetails.map((detail) => detail[header.toLowerCase()])
                ),
              ].map((value) => (
                <button
                  key={value}
                  className="list-group-item list-group-item-action text-success"
                  onClick={() =>
                    handleFilterChange(value, header.toLowerCase())
                  }
                >
                  {value}
                </button>
              ))}
            </>
          )}
          {["AssignedDate", "Duration"].includes(header) && (
            <>
              <button
                className="list-group-item list-group-item-action text-success"
                onClick={() => handleFilterChange("", header.toLowerCase())}
              >
                Clear Sort
              </button>
              <button
                className="list-group-item list-group-item-action text-success"
                onClick={() => handleSortChange(header.toLowerCase(), "asc")}
              >
                ↑ Ascending
              </button>
              <button
                className="list-group-item list-group-item-action text-success"
                onClick={() => handleSortChange(header.toLowerCase(), "desc")}
              >
                ↓ Descending
              </button>
            </>
          )}
        </div>
      </Popover.Body>
    </Popover>
  );

  // Table headers
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

  // Loading animation
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  if (error) {
    return <div className="alert alert-danger p-2 small">{error}</div>;
  }

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

  const getStatusClass = (status) => {
    switch (status) {
      case "RDM Approval":
        return "ms-2 shadow-lg bg-success text-white";

      default:
        return "";
    }
  };

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

          <div className="d-flex justify-content-center align-items-center mt-2">
            {["All", "Red", "Yellow", "No Color"].map((color) => (
              <div
                key={color}
                onClick={() => handleFilterChange(color, "color")}
                className="color-option mx-2 cursor-pointer"
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  backgroundColor:
                    color === "All"
                      ? "transparent"
                      : color === "Red"
                      ? "#dc3545"
                      : color === "Yellow"
                      ? "#ffc107"
                      : "rgba(108, 117, 125, 0.25)",
                  border:
                    filters.color === color
                      ? "2px solid #000"
                      : "1px solid #dee2e6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease-in-out",
                }}
              >
                {color === "All" && (
                  <span
                    className="text-white bg-dark p-2 rounded-circle"
                    style={{ fontSize: "12px" }}
                  >
                    All
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        <div
          className="table-responsive"
          style={{ maxHeight: "700px", overflowY: "auto" }}
        >
          <table className="table table-bordered table-hover table-sm">
            <thead className="text-center sticky-top bg-white">
              <tr>
                {tableHeaders.map((header, index) => (
                  <th key={index} className="position-relative">
                    <OverlayTrigger
                      trigger="click"
                      placement="bottom"
                      show={activePopover === header}
                      onToggle={(nextShow) =>
                        setActivePopover(nextShow ? header : null)
                      }
                      overlay={renderPopover(header)}
                      rootClose
                    >
                      <button
                        className="btn text-white btn-link text-dark text-decoration-none w-100 d-flex justify-content-center align-items-center p-1"
                        onClick={() =>
                          setActivePopover(
                            activePopover === header ? null : header
                          )
                        }
                      >
                        {header}
                        {[
                          "DM",
                          "Name",
                          "Market",
                          "Duration",
                          "AssignedDate",
                          "Status",
                        ].includes(header) && (
                          <MdOutlineKeyboardArrowDown
                            className={`transition-transform ${
                              activePopover === header ? "rotate-180" : ""
                            }`}
                          />
                        )}
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
                  <td className="text-center text-capitalize">
                    {detail.name?.toLowerCase()}
                  </td>
                  <td
                    className={`text-center ms-2 ${getStatusClass(
                      detail.status
                    )}`}
                  >
                    {detail.status}
                  </td>
                  <td className="text-center">
                    {detail.assignedDate.split(" ")[0]}
                  </td>
                  <td className="text-center">
                    {`${calculateDuration(detail.assignedDate)} ${
                      calculateDuration(detail.assignedDate) > 1
                        ? "days"
                        : "day"
                    }`}
                  </td>
                  <td className="text-center">
                    {getComment(detail.assignedDate)}
                  </td>
                  <td className="text-center">{detail.dm}</td>
                  <td className="text-center text-capitalize">
                    {detail.mainstore.toLowerCase()}
                  </td>
                  <td className="text-center">{detail.doorcode}</td>
                  <td className="text-center text-capitalize">
                    {detail.Market.toLowerCase()}
                  </td>
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
