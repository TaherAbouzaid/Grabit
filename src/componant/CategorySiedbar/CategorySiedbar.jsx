
import React from "react";
import { Accordion, Badge, Form } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setSubcategory, setPriceRange, toggleTag } from "../../Store/Slices/filtersSlice";

const CategorySidebarFilter = ({ products }) => {
  const dispatch = useDispatch();
  const filter = useSelector((state) => state.filter);

  const subcategoriesMap = new Map();
  products.forEach((p) => {
    const sub = p.subCategoryId;
    if (sub?.subcategoryId && !subcategoriesMap.has(sub.subcategoryId)) {
      subcategoriesMap.set(sub.subcategoryId, sub);
    }
  });
  const subcategories = Array.from(subcategoriesMap.values());

  const prices = products.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const tags = [...new Set(
    products.flatMap(p => p.tags || [])
  )];

  return (
    <div className="sidebar-filter p-2 mt-4">
      <h4>Filter</h4>

      {/* Subcategories */}
      <Accordion  alwaysOpen>
        <Accordion.Item eventKey="0" >
          <Accordion.Header>Subcategories</Accordion.Header>
          <Accordion.Body>
            {subcategories.map((sub) => (
              <Form.Check
                key={sub.subcategoryId}
                type="radio"
                name="subcategory"
                label={sub.name?.en || sub.subcategoryId}
                value={sub.subcategoryId}
                checked={filter.subcategory === sub.subcategoryId}
                onChange={() => dispatch(setSubcategory(sub.subcategoryId))}
              />
            ))}
          </Accordion.Body>
        </Accordion.Item>

        {/* Price */}
        <Accordion.Item eventKey="1">
          <Accordion.Header>Price</Accordion.Header>
          <Accordion.Body>
            <Form.Label>From: {filter.priceRange[0]} - To: {filter.priceRange[1]}</Form.Label>
            <Form.Range
              min={minPrice}
              max={maxPrice}
              value={filter.priceRange[1]}
              onChange={(e) =>
                dispatch(setPriceRange([minPrice, Number(e.target.value)]))
              }
            />
          </Accordion.Body>
        </Accordion.Item>

        {/* Tags */}
      
        <Accordion.Item eventKey="2">
  <Accordion.Header>Tags</Accordion.Header>
  <Accordion.Body>
    <div className="d-flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Badge
          key={tag}
          pill
          bg={filter.tags.includes(tag) ? 'success' : 'light'}
          text={filter.tags.includes(tag) ? 'light' : 'dark'}
          style={{
            cursor: 'pointer',
            padding: '0.6em 1em',
            border: '1px solid #ced4da',
            userSelect: 'none',
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
    </div>
  );
};

export default CategorySidebarFilter;
