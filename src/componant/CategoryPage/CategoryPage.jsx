
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { fetchProductsByCategory } from "../../Store/Slices/productsSlice";
import { Spinner } from "react-bootstrap";
import CategorySidebarFilter from "../CategorySiedbar/CategorySiedbar";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const dispatch = useDispatch();

  const { items, loading, error } = useSelector((state) => state.products);
  const filter = useSelector((state) => state.filter); 

  useEffect(() => {
    dispatch(fetchProductsByCategory(categoryId));
  }, [categoryId, dispatch]);

  if (loading) return <Spinner animation="border" />;
  if (error) return <div>Error: {error}</div>;

  const filteredProducts = items.filter((product) => {
    const matchesSubcategory = filter.subcategory
      ? product.subCategoryId?.subcategoryId === filter.subcategory
      : true;

    const matchesPrice =
      product.price >= filter.priceRange[0] &&
      product.price <= filter.priceRange[1];

    const matchesTags =
      filter.tags.length === 0 ||
      (product.tags && filter.tags.every((tag) => product.tags.includes(tag)));

    return matchesSubcategory && matchesPrice && matchesTags;
  });

  return (
    <div className="category-page d-flex">
      <div className="sidebar" style={{ width: "300px" }}>
        <CategorySidebarFilter categoryId={categoryId} products={items} />
      </div>

      <div className="products-list" style={{ flex: 1, padding: "1rem" }}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <img src={product.imageUrl} alt={product.title.en} />
              <h4>{product.title.en}</h4>
              <p>Price: ${product.price}</p>
              <button>Add to Cart</button>
            </div>
          ))
        ) : (
          <div>No products found in this category with selected filters.</div>
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
