import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './style.css';

import RegistrationModal from '../../../../Modal';
import LoginModal from '../../../LoginPage';
import RegisterModal from '../../../RegisterPage';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  images: string[];
  likesCount: number;
  viewsCount: number;
  isLikedByCurrentUser?: boolean;
}

interface WorkItemProps {
  product: Product;
  onOpenModal: () => void;
}

const WorkItem: React.FC<WorkItemProps> = ({ product, onOpenModal }) => {
  const navigate = useNavigate();
  const imageBaseUrl = `${import.meta.env.VITE_API_URL}/images/`;

  const handleCardClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      onOpenModal();
      return;
    }
    navigate(`/product/${product.id}`);
  };

  return (
    <div
      className="card"
      style={{
        flex: '0 0 262px',
        height: '330px',
      }}
      onClick={handleCardClick}
    >
      <div
        className="card-image"
        style={{
          backgroundImage: `url(${
            product.images?.length
              ? `${imageBaseUrl}${product.images[0]}`
              : 'https://placehold.co/262x189'
          })`,
        }}
      />
      <div className="card-info">
        <p className="card-title">
          <span className="card-name">{product.name}</span>
        </p>
        <p className="card-description">{product.description}</p>
        <p className="card-price">{product.price} грн</p>
      </div>
    </div>
  );
};

const BestWorks: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/Products/top-liked`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) throw new Error('Не вдалося завантажити продукти');
        const data = await response.json();

        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Невідома помилка');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const debounce = (func: () => void, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(func, delay);
    };
  };

  const openRegModal = debounce(() => {
    setIsRegModalOpen(true);
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  }, 100);

  const openLoginModal = debounce(() => {
    setIsLoginModalOpen(true);
    setIsRegModalOpen(false);
    setIsRegisterModalOpen(false);
  }, 100);

  const openRegisterModal = debounce(() => {
    setIsRegisterModalOpen(true);
    setIsRegModalOpen(false);
    setIsLoginModalOpen(false);
  }, 100);

  const handleLoginSuccess = (token: string) => {
    console.log('Увійшли з токеном:', token);
    setIsLoginModalOpen(false);
  };

  const handleRegisterSuccess = (token: string) => {
    console.log('Зареєструвались з токеном:', token);
    setIsRegisterModalOpen(false);
  };

  if (loading) return <div className="text-white p-8">Завантаження...</div>;
  if (error) return <div className="text-red-500 p-8">Помилка: {error}</div>;

  return (
    <div className="best-works-container">
      <div className="w-[1300px] h-[38px] justify-between items-end inline-flex">
        <div className="justify-start items-center gap-[18px] flex">
          <div className="text-[#e6dfe7] text-3xl font-medium font-['Skema Pro Omni'] leading-[38px]">
            Кращі роботи
          </div>
        </div>
      </div>

      <div
        className="cards-container"
        style={{
          display: 'flex',
          gap: '24px',
          overflowX: 'auto',
          paddingBottom: '20px',
        }}
      >
        {products.map((product) => (
          <WorkItem key={product.id} product={product} onOpenModal={openRegModal} />
        ))}
      </div>

      <div style={{ zIndex: 1000 }}>
        {isRegModalOpen && (
          <RegistrationModal
            isOpen={isRegModalOpen}
            onClose={() => setIsRegModalOpen(false)}
            onLogin={openLoginModal}
            onRegister={openRegisterModal}
          />
        )}
        {isLoginModalOpen && (
          <LoginModal
            isOpen={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={handleLoginSuccess}
            openRegisterModal={openRegisterModal}
          />
        )}
        {isRegisterModalOpen && (
          <RegisterModal
            isOpen={isRegisterModalOpen}
            onClose={() => setIsRegisterModalOpen(false)}
            onRegister={handleRegisterSuccess}
            openLoginModal={openLoginModal}
          />
        )}
      </div>
    </div>
  );
};

export default BestWorks;