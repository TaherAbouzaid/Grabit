import React from "react";
import { Dropdown } from "react-bootstrap";
import { FiGrid, FiList } from "react-icons/fi";

const ProductToolbar = ({ onSortChange, onViewChange, viewType }) => {
  return (
    <div className="d-flex align-items-center justify-content-between mb-3">
      <div>
        <button
          className={`btn btn-light me-2 ${viewType === "grid" ? "active" : ""}`}
          onClick={() => onViewChange("grid")}
        >
          <FiGrid size={22} />
        </button>
        <button
          className={`btn btn-light ${viewType === "list" ? "active" : ""}`}
          onClick={() => onViewChange("list")}
        >
          <FiList size={22} />
        </button>
      </div>
      <Dropdown onSelect={onSortChange}>
        <Dropdown.Toggle variant="light" id="dropdown-sort">
          Sort by
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Item eventKey="latest">Latest</Dropdown.Item>
          <Dropdown.Item eventKey="price-asc">Price: Low to High</Dropdown.Item>
          <Dropdown.Item eventKey="price-desc">Price: High to Low</Dropdown.Item>
          <Dropdown.Item eventKey="name-asc">Name: A-Z</Dropdown.Item>
          <Dropdown.Item eventKey="name-desc">Name: Z-A</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};

export default ProductToolbar;