import { useEffect, useState } from "react";
import axios from "axios";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://127.0.0.1:8000/api/products/");
        setProducts(res.data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <>
      <h2 className="text-2xl font-bold mb-4">Products</h2>

      {loading ? (
        <p className="text-center text-gray-400">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500">No product found</p>
      ) : (
        <ul className="space-y-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="bg-white p-4 rounded shadow"
            >
              <h3 className="font-bold text-lg">{product.name}</h3>

              <p className="text-sm text-gray-600">
                {product.description}
              </p>

              <p>Qty: {product.quantity}</p>
              <p>Price: ৳{product.price}</p>

              <p>Status ID: {product.status}</p>
              <p>Category ID: {product.category}</p>
              <p>Vendor ID: {product.vendor}</p>
              <p>Department ID: {product.current_department}</p>

              <p className="text-xs text-gray-400">
                Created:{" "}
                {new Date(product.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default Products;
