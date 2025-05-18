import { useState, useEffect } from "react";
import { fetchProducts } from "../../services/productService";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Stack from "react-bootstrap/Stack";

const MegaMenuProduct = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const data = await fetchProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    getProducts();
  }, []);

  // دالة لجلب عنوان المنتج بأمان
  const getTitle = (product) => {
    if (product && product.title) {
      return typeof product.title === "object"
        ? product.title.en || product.title.ar || "  Product not found "
        : product.title;
    }
    return "  product not found ";
  };

  if (loading) return <p className="text-center p-4"> Loading...</p>;

  if (products.length === 0) return <p className="text-center p-4">no product now   .</p>;

  return (
    <>
      <div className="grid grid-cols-3 gap-4 p-8">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded shadow">
            <img
              src={product.mainImage || "/placeholder-image.jpg"} 
              alt={getTitle(product)}
              className="w-full h-40 object-cover"
            />
            <h2 className="font-bold text-lg">{getTitle(product)}</h2>
            <p className="text-gray-600">Price: ${product.price || " not found "}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-2 p-8 sm:flex-row sm:items-center sm:gap-6 sm:py-4">
        <img
          className="mx-auto block h-24 rounded-full sm:mx-0 sm:shrink-0"
          src="/img/erin-lindford.jpg"
          alt="Erin Lindford"
        />
        <div className="space-y-2 text-center sm:text-left">
          <div className="space-y-0.5">
            <p className="text-lg font-semibold text-black">Erin Lindford</p>
            <p className="font-medium text-gray-500">Product Engineer</p>
          </div>
          <button className="border-purple-200 text-purple-600 hover:border-transparent hover:bg-purple-600 hover:text-white active:bg-purple-700">
            Message
          </button>
        </div>
      </div>
      {/* <Stack direction="horizontal" gap={3}>
        <Form.Control className="me-auto" placeholder="أضف عنصرك هنا..." />
        <Button variant="secondary">Send</Button>
        <div className="vr" />
        <Button variant="outline-danger">إعادة تعيين</Button>
      </Stack> */}
    </>
  );
};

export default MegaMenuProduct;