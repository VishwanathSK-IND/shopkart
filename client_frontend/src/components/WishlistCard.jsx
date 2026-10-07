import { Link } from "react-router-dom";

export default function WishlistCard({ product, removing, error, onRemove }) {
  const inStock = product.stock > 0;

  return (
    <div className="rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition flex flex-col">
      <div className="aspect-square bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "https://placehold.co/500x500?text=No+Image";
          }}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs uppercase tracking-wide text-gray-400 mb-1">
          {product.category}
        </p>
        <h3 className="text-sm font-medium text-gray-900 truncate">
          {product.name}
        </h3>
        <p className="text-sm font-semibold text-teal-600 mt-1">
          ₹{product.price.toLocaleString("en-IN")}
        </p>
        <p
          className={`text-xs mt-1 ${
            inStock ? "text-gray-400" : "text-red-500"
          }`}
        >
          {inStock ? `${product.stock} units left` : "Out of stock"}
        </p>
        <div className="mt-auto pt-3 flex flex-col gap-2">
          <Link
            to={`/products/${product._id}`}
            className="inline-flex items-center justify-center rounded-full bg-teal-600 text-white text-sm font-medium py-2 hover:bg-teal-700 transition"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onRemove(product._id)}
            disabled={removing}
            className="rounded-full border border-red-200 bg-red-50 text-red-500 text-sm font-medium py-2 hover:bg-red-100 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {removing ? "⏳ Removing..." : "Remove ♥"}
          </button>
          {error && (
            <p className="text-xs text-red-500 text-center" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
