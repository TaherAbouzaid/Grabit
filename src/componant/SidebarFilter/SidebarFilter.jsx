import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Accordion, Badge, Form, Button } from "react-bootstrap";
import {
  setCategory,
  setSubcategory,
  setPriceRange,
  toggleTag,
} from "../../Store/Slices/filtersSlice";
import { useTranslation } from "react-i18next";
import "./SidebarFilter.css";
import { useLanguage } from "../../context/LanguageContext";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const SidebarFilter = ({ allProducts, minPrice = 0, maxPrice = 1000 }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const filter = useSelector((state) => state.filter);
  const { currentLanguage } = useLanguage();
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [localRange, setLocalRange] = useState([minPrice, maxPrice]);

  // Fetch categories from database
  useEffect(() => {
    const fetchCategories = async () => {
      const snapshot = await getDocs(collection(db, "categories"));
      setCategories(
        snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    };
    fetchCategories();
  }, []);
  
  useEffect(() => {
    setLocalRange(filter.priceRange || [minPrice, maxPrice]);
  }, [filter.priceRange, minPrice, maxPrice]);

  // Fetch subcategories when main category changes
  useEffect(() => {
    if (filter.category) {
      const fetchSubcategories = async () => {
        const q = query(
          collection(db, "subcategories"),
          where("parentCategoryId", "==", filter.category)
        );
        const snapshot = await getDocs(q);
        setSubcategories(
          snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      };
      fetchSubcategories();
    } else {
      setSubcategories([]);
    }
  }, [filter.category]);

  useEffect(() => {
    if (filter.priceRange) {
      setLocalRange(filter.priceRange);
    }
  }, [filter.priceRange]);

  // Extract all tags from products
  const allTags = [
    ...new Set(
      (Array.isArray(allProducts) ? allProducts : []).flatMap(
        (product) => product.tags || []
      )
    ),
  ];

  // Reset all filters
  const handleReset = () => {
    dispatch(setCategory(null));
    dispatch(setSubcategory(null));
    dispatch(setPriceRange([minPrice, maxPrice]));
  };

  const handleSliderChange = (value) => {
    setLocalRange(value);
    dispatch(setPriceRange(value));
  };

  return (
    <div className="sidebar-filter p-3">
      <h5>{t('sidebarFilter.filterTitle')}</h5>
      <Accordion alwaysOpen>
        {/* Main Category */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>{t('sidebarFilter.category')}</Accordion.Header>
          <Accordion.Body>
            {categories.map((cat) => (
              <Form.Check
                key={cat.id}
                type="radio"
                label={cat.name?.[currentLanguage] || cat.name?.en || cat.id}
                checked={filter.category === cat.id}
                onChange={() => {
                  dispatch(setCategory(cat.id));
                  dispatch(setSubcategory(null));
                }}
              />
            ))}
            <Form.Check
              type="radio"
              label={t('sidebarFilter.all')}
              checked={filter.category === null}
              onChange={() => handleReset()}
            />
          </Accordion.Body>
        </Accordion.Item>

        {/* Subcategory */}
        {subcategories.length > 0 && (
          <Accordion.Item eventKey="1">
            <Accordion.Header>{t('sidebarFilter.subcategory')}</Accordion.Header>
            <Accordion.Body>
              {subcategories.map((sub) => (
                <Form.Check
                  key={sub.id}
                  type="radio"
                  label={sub.name?.[currentLanguage] || sub.name?.en || sub.id}
                  checked={filter.subcategory === sub.id}
                  onChange={() => dispatch(setSubcategory(sub.id))}
                />
              ))}
              <Form.Check
                type="radio"
                label={t('sidebarFilter.all')}
                checked={filter.subcategory === null}
                onChange={() => dispatch(setSubcategory(null))}
              />
            </Accordion.Body>
          </Accordion.Item>
        )}

        {/* Price */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            {t('sidebarFilter.price', { maxPrice })}
          </Accordion.Header>
          <Accordion.Body>
            <Slider
              key={`${minPrice}-${maxPrice}-${localRange[0]}-${localRange[1]}`}
              range
              min={minPrice}
              max={maxPrice}
              value={localRange}
              onChange={handleSliderChange}
              disabled={minPrice === maxPrice}
            />
            {minPrice === maxPrice && (
              <div className="text-muted" style={{ fontSize: 13 }}>
                {currentLanguage === 'ar' 
                  ? `كل المنتجات بنفس السعر: ${minPrice}` 
                  : `All products have the same price: ${minPrice}`}
              </div>
            )}
            <div>
              <span>{currentLanguage === 'ar' ? 'من:' : 'From:'} {localRange[0]}</span> -{" "}
              <span>{currentLanguage === 'ar' ? 'إلى:' : 'To:'} {localRange[1]}</span>
            </div>
          </Accordion.Body>
        </Accordion.Item>

        {/* Tags */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>{t('sidebarFilter.tags')}</Accordion.Header>
          <Accordion.Body>
            <div className="d-flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  pill
                  bg={filter.tags.includes(tag) ? "success" : "light"}
                  text={filter.tags.includes(tag) ? "light" : "dark"}
                  style={{
                    cursor: "pointer",
                    padding: "0.6em 1em",
                    border: "1px solid #ced4da",
                    userSelect: "none",
                  }}
                  onClick={() => dispatch(toggleTag(tag))}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <Button
        variant="outline-danger"
        className="mt-3 w-100"
        onClick={handleReset}
      >
        {currentLanguage === 'ar' ? 'إعادة تعيين الفلاتر' : 'Reset Filters'}
      </Button>
    </div>
  );
};

export default SidebarFilter;
