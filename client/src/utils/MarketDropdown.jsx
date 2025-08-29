import { useState } from "react";
import { OverlayTrigger, Popover, Dropdown } from "react-bootstrap";
import { MdOutlineKeyboardArrowDown } from "react-icons/md";

export function MarketDropdown({ markets, selected, onSelect }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (market) => {
    onSelect(market);
    setOpen(false);
  };

  return (
    <OverlayTrigger
      trigger="click"
      placement="bottom"
      show={open}
      overlay={
        <Popover id="popover-market">
          <Popover.Header as="h3">Select Market</Popover.Header>
          <Popover.Body>
            <Dropdown.Item
              onClick={() => handleSelect("All")}
              style={{ color: "gray" }} // Optional: set a specific color for "All"
            >
              All
            </Dropdown.Item>
            {markets.map((m, i) => (
              <Dropdown.Item
                key={i}
                onClick={() => handleSelect(m)}
                style={{ color: "black" }}
              >
                {m}
              </Dropdown.Item>
            ))}
          </Popover.Body>
        </Popover>
      }
    >
      <button
        className="custom-dropdown1 border-0 bg-transparent text-gray fw-bolder shadow-none"
        onClick={() => setOpen(!open)}
      >
        Markets: {selected} <MdOutlineKeyboardArrowDown className="fs-3" />
      </button>
    </OverlayTrigger>
  );
}
