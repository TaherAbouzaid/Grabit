import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Accordion, Badge, Form } from "react-bootstrap";
import {
  setCategory,
  setPriceRange,
  toggleTag,
} from "../../Store/Slices/filtersSlice";
import { useTranslation } from "react-i18next";
import "./SidebarFilter.css";
import { useLanguage } from "../../context/LanguageContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";

const SidebarFilter = () => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { category, priceRange, tags } = useSelector((state) => state.filter);
  const products = useSelector((state) => state.products.items);
  const { currentLanguage } = useLanguage();
  const [categories, setCategories] = useState([]);

  // استرجاع الفئات من قاعدة البيانات
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // استرجاع الفئات من قاعدة البيانات
        const categoriesSnapshot = await getDocs(collection(db, "categories"));
        const categoriesData = categoriesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // تحويل البيانات إلى التنسيق المطلوب
        const formattedCategories = categoriesData.map((cat) => ({
          id: cat.id,
          name:
            cat.name?.[currentLanguage] ||
            cat.name?.en ||
            t("sidebarFilter.uncategorized"),
        }));

        setCategories(formattedCategories);
        console.log("Categories from database:", formattedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [currentLanguage, t]);

  // استخدام الفئات من قاعدة البيانات بدلاً من استخراجها من المنتجات
  const displayCategories = categories.length > 0 ? categories : [];

  const allTags = [
    ...new Set(products.flatMap((product) => product.tags || [])),
  ];

  // Calculate max price based on selected category
  const filteredProducts = category
    ? products.filter((p) => p.categoryId?.categoryId === category)
    : products;
  const maxPrice =
    filteredProducts.length > 0
      ? Math.max(...filteredProducts.map((p) => p.price || 0))
      : 1000;

  // Update priceRange if it exceeds maxPrice when category changes
  useEffect(() => {
    if (priceRange[1] > maxPrice) {
      dispatch(setPriceRange([0, maxPrice]));
    }
  }, [category, maxPrice, priceRange, dispatch]);

  const handleCategoryChange = (categoryId) => {
    dispatch(setCategory(categoryId));
  };

  const handlePriceChange = (e) => {
    dispatch(setPriceRange([0, parseInt(e.target.value)]));
  };

  const handleTagChange = (tag) => {
    dispatch(toggleTag(tag));
  };

  return (
    <div className="Catsidebar-filter p-2 mt-4">
      <h4>{t("sidebarFilter.filterTitle")}</h4>
      <Accordion alwaysOpen>
        {/* Category Filter */}
        <Accordion.Item eventKey="0">
          <Accordion.Header>{t("sidebarFilter.category")}</Accordion.Header>
          <Accordion.Body>
            {displayCategories.map((cat) => (
              <Form.Check
                key={cat.id}
                type="radio"
                label={cat.name}
                checked={category === cat.id}
                onChange={() => handleCategoryChange(cat.id)}
              />
            ))}
            <Form.Check
              type="radio"
              label={t("sidebarFilter.all")}
              checked={category === null}
              onChange={() => handleCategoryChange(null)}
            />
          </Accordion.Body>
        </Accordion.Item>

        {/* Price Filter */}
        <Accordion.Item eventKey="2">
          <Accordion.Header>
            {t("sidebarFilter.price", { maxPrice })}
          </Accordion.Header>
          <Accordion.Body>
            <Form.Range
              min={0}
              max={maxPrice}
              value={priceRange[1]}
              onChange={handlePriceChange}
            />
          </Accordion.Body>
        </Accordion.Item>

        {/* Tags Filter */}
        <Accordion.Item eventKey="3">
          <Accordion.Header>{t("sidebarFilter.tags")}</Accordion.Header>
          <Accordion.Body>
            <div className="d-flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  pill
                  bg={tags.includes(tag) ? "success" : "light"}
                  text={tags.includes(tag) ? "light" : "dark"}
                  style={{
                    cursor: "pointer",
                    padding: "0.6em 1em",
                    border: "1px solid #ced4da",
                    userSelect: "none",
                  }}
                  onClick={() => handleTagChange(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default SidebarFilter;
