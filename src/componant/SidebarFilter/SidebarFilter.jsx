import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Accordion, Badge, Form } from 'react-bootstrap';
import { setCategory, setPriceRange, toggleTag } from '../../Store/Slices/filtersSlice';

const SidebarFilter = () => {
  const dispatch = useDispatch();

  const { category, priceRange, tags } = useSelector((state) => state.filter);
  const products = useSelector((state) => state.products.items);

  const categories = [...new Map(products.map(p => [p.categoryId.categoryId, {
    id: p.categoryId.categoryId,
    name: p.categoryId.name?.en || "Unknown"
  }])).values()];



  const allTags = [...new Set(products.flatMap((product) => product.tags || []))];

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
      <h4>Filter</h4>
    <Accordion alwaysOpen>
      {/* Category Filter */}
      <Accordion.Item eventKey="0">
        <Accordion.Header>Category</Accordion.Header>
        <Accordion.Body>
          {categories.map((cat) => (
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
            label="All"
            checked={category === null}
            onChange={() => handleCategoryChange(null)}
          />
        </Accordion.Body>
      </Accordion.Item>

     

      {/* Price Filter */}
      <Accordion.Item eventKey="2">
        <Accordion.Header>Price (Max: ${priceRange[1]})</Accordion.Header>
        <Accordion.Body>
          <Form.Range
            min={0}
            max={1000}
            value={priceRange[1]}
            onChange={handlePriceChange}
          />
        </Accordion.Body>
      </Accordion.Item>

      {/* Tags Filter */}

      <Accordion.Item eventKey="3">
  <Accordion.Header>Tags</Accordion.Header>
  <Accordion.Body>
    <div className="d-flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <Badge
          key={tag}
          pill
          bg={tags.includes(tag) ? 'success' : 'light'}
          text={tags.includes(tag) ? 'light' : 'dark'}
          style={{
            cursor: 'pointer',
            padding: '0.6em 1em',
            border: '1px solid #ced4da',
            userSelect: 'none',
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
