import React, { useEffect, useState, useCallback } from "react";
import ProductFilter from "../Filter";
import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
import "./index.css";

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  size: string[];
  format: string;
  technique: string;
  artisticDirection: string;
  color: string[];
  categoryName: string;
  createdAt: string;
  createdById: string;
  yearCreated: number;
  likesCount: number;
  viewsCount: number;
  isLikedByCurrentUser: boolean;
  images: string[];
}

interface ApiResponse {
  items: Product[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const Cards: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 12;
  const token = localStorage.getItem("token");

  const handleCardClick = (productId: number) => {
    navigate(`/product/${productId}`);
  };

  const handleLike = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!token) {
      navigate("/");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ProductInteractions/like/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify({ Token: token }),
        }
      );

      if (response.ok) {
        setProducts((prevProducts) =>
          prevProducts.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  isLikedByCurrentUser: !product.isLikedByCurrentUser,
                  likesCount: product.isLikedByCurrentUser
                    ? product.likesCount - 1
                    : product.likesCount + 1,
                }
              : product
          )
        );
      }
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    setProducts([]);

    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sortBy: "дата (за зростанням)",
        ...(filters.category && { category: filters.category }),
        ...(filters.sortBy && { sortBy: filters.sortBy }),
        ...(filters.priceFrom && { priceFrom: filters.priceFrom }),
        ...(filters.priceTo && { priceTo: filters.priceTo }),
        ...(filters.authorId && { authorId: filters.authorId }),
      });

      if (filters.sizes) {
        filters.sizes.forEach((size: string) => queryParams.append("sizes", size));
      }
      if (filters.formats) {
        filters.formats.forEach((format: string) =>
          queryParams.append("formats", format)
        );
      }
      if (filters.techniques) {
        filters.techniques.forEach((tech: string) =>
          queryParams.append("techniques", tech)
        );
      }
      if (filters.artisticDirections) {
        filters.artisticDirections.forEach((dir: string) =>
          queryParams.append("artisticDirections", dir)
        );
      }
      if (filters.colors) {
        filters.colors.forEach((color: string) =>
          queryParams.append("colors", color)
        );
      }

      const requestOptions: RequestInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ Token: token }),
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/Products/filtered?${queryParams.toString()}`,
        requestOptions
      );

      if (!response.ok) throw new Error("Не вдалося отримати продукти");

      const data: ApiResponse = await response.json();
      setProducts(data.items);
      setTotalPages(data.totalPages);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters, currentPage, token]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (values: Record<string, any>) => {
    setFilters(values);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div>
      <div className="cards-container">
  <div className="filter-container">
    <ProductFilter onFilter={handleFilterChange} />
  </div>

  <div className="cards-list">
    {loading && <div className="loading-overlay">Завантаження...</div>}

    {error && <div className="error-message">Помилка: {error}</div>}

    {!loading && !error && (
      products.length === 0 ? (
        <div className="empty-message">Немає доступних продуктів</div>
      ) : (
        products.map((product) => (
          <div
            className="card"
            key={product.id}
            onClick={() => handleCardClick(product.id)}
          >
            <div
              className="card-image"
              style={{
                backgroundImage: `url(${
                  product.images[0]
                    ? `${import.meta.env.VITE_API_URL}/images/${product.images[0]}`
                    : "https://placehold.co/250x160"
                })`,
              }}
            />

            <div className="card-content">
              <div className="card-info">
                <h3 className="card-title">{product.name}</h3>
                <p className="card-description">{product.description}</p>
              </div>

              <div className="card-footer">
                <span className="card-price">{product.price} грн</span>
              </div>

              <div
                className="like-container"
                onClick={(e) => handleLike(product.id, e)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    className="heart-stroke"
                    d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                    stroke="#E6DFE7"
                    strokeWidth="0.5"
                    fill="transparent"
                  />
                  <path
                    className="heart-fill"
                    d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3z"
                    fill={product.isLikedByCurrentUser ? "#FF7086" : "transparent"}
                  />
                </svg>
                <span className="likes-count">{product.likesCount}</span>
              </div>
            </div>
          </div>
        ))
      )
    )}
  </div>
</div>

      <div className="pagination-container">
        <Pagination
          current={currentPage}
          total={totalPages * pageSize}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          itemRender={(_page, type, element) => {
            if (type === "prev")
              return <button className="pagination-arrow">{"<"}</button>;
            if (type === "next")
              return <button className="pagination-arrow">{">"}</button>;
            return element;
          }}
        />
      </div>
    </div>
  );
};

export default Cards;