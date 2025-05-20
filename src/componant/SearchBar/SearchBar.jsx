import { useState } from "react";
import { InputGroup, Form, Button } from "react-bootstrap";
import { BiSearch } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { setSearchQuery } from "../../Store/Slices/filtersSlice"; // Adjust path
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./SearchBar.css"; // Adjust path

const SearchBar = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      console.log("Dispatching search query:", query.trim());
      dispatch(setSearchQuery(query.trim()));
      navigate("/search");
      setQuery("");
    } else {
      console.log("Empty query, no dispatch");
    }
  };

  return (
    <div className="search-bar-container">
      <InputGroup className="search-bar-group">
        <Form.Control
          type="text"
          placeholder={t("common.search")}
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
        />
        <Button variant="light" className="search-button" onClick={handleSearch}>
          <BiSearch size={20} color="#5cac94" />
        </Button>
      </InputGroup>
    </div>
  );
};

export default SearchBar;