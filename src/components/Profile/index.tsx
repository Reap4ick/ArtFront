import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HeartFilled, HeartOutlined, EyeFilled } from "@ant-design/icons";

interface Tab {
  id: string;
  label: string;
  isActive: boolean;
}

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  technique: string;
  artisticDirection: string;
  yearCreated: number;
  images: string[];
  likesCount: number;
  viewsCount: number;
  isLikedByCurrentUser: boolean;
  createdById: string;
}

interface ProfileData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
  myCountry: string;
}

const TABS = [
  { id: "works", label: "Мої роботи", isActive: false },
  { id: "favorites", label: "Улюблені", isActive: false },
  { id: "viewed", label: "Переглянуті", isActive: false },
];

// Компонент профілю
const ProfileSection = ({
  image,
  name,
  location,
  onAddWork,
}: {
  image: string;
  name: string;
  location: string;
  onAddWork: () => void;
}) => {
  return (
    <section className="flex mb-10">
      <div className="flex gap-[31px] max-sm:flex-col max-sm:items-center max-sm:text-center">
        <img
          src={image}
          alt={`${name}'s profile`}
          className="w-[150px] h-[150px] rounded-[50%] object-cover"
        />
        <div className="flex flex-col gap-5 px-0 py-[17px] max-sm:items-center">
          <h1 className="text-[#BC98C9] text-3xl leading-[38px]">{name}</h1>
          <div className="flex items-center gap-2 text-[#57F4AB] text-base leading-6 max-sm:justify-center">
            <i className="ti ti-map-pin text-[#57F4AB]" />
            <span>{location}</span>
          </div>
          <a href="AddWork">
            <button
              onClick={onAddWork}
              className="h-8 border rounded text-[#080217] text-sm leading-[22px] cursor-pointer bg-[#FF7086] px-[15px] py-0 border-solid border-[#E6DFE7]"
            >
              Додати роботу
            </button>
          </a>
        </div>
      </div>
    </section>
  );
};

// Компонент вкладок з виправленим розташуванням кружка
const NavigationTabs = ({
  tabs,
  onTabChange,
}: {
  tabs: Tab[];
  onTabChange: (tabId: string) => void;
}) => {
  return (
    <nav className="flex items-center gap-[7px] mb-10">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className="flex flex-col items-center gap-2 w-[180px] cursor-pointer"
        >
          <span
            className={`text-base leading-6 text-center ${
              tab.isActive ? "text-[#E6DFE7]" : "text-[#BC98C9]"
            }`}
          >
            {tab.label}
          </span>
          <div className="flex items-center justify-center w-full">
            {tab.isActive ? (
              <>
                <div className="h-[3px] flex-1 bg-[#FF7086]" />
                <div className="w-2 h-2 bg-[#FF7086] rounded-[50%]" />
                <div className="h-[3px] flex-1 bg-[#FF7086]" />
              </>
            ) : (
              <div className="w-2 h-2 bg-[#BC98C9] rounded-[50%]" />
            )}
          </div>
        </div>
      ))}
    </nav>
  );
};

// Компонент для "Улюблених"
const FavoriteItem = ({ product, onRemove }: { product: Product; onRemove: (id: number) => void }) => {
  const navigate = useNavigate();
  const [isMessageLoading, setIsMessageLoading] = useState(false);

  const handleMessageClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      setIsMessageLoading(true);
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Token: token,
            ParticipantId: product.createdById
          }),
        }
      );

      if (!response.ok) throw new Error("Не вдалося створити діалог");
      navigate(`/Messenger`);
    } catch (error) {
      console.error("Помилка при створенні діалогу:", error);
      alert("Сталася помилка. Спробуйте ще раз.");
    } finally {
      setIsMessageLoading(false);
    }
  };

  return (
    <div 
      className="self-stretch pb-3 border-b border-[#bc98c8] flex justify-start items-center cursor-pointer hover:bg-[#1a0933] transition-colors"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <img 
        className="w-[220px] h-[170px] object-cover" 
        src={
          product.images?.length > 0 
            ? `${import.meta.env.VITE_API_URL}/images/${product.images[0]}`
            : "https://placehold.co/220x170"
        } 
        alt={product.name}
      />
      <div className="w-[984.72px] flex justify-between items-center ml-4">
        <div className="w-[350px] flex flex-col justify-start items-start gap-[38px]">
          <div>
            <span className="text-[#ff7086] text-xl font-bold font-['Gotham'] leading-7">
              {product.name}
            </span>
            <div className="text-[#bc98c8] text-base font-light font-['Gotham'] leading-normal">
              {product.technique}<br />
              {product.yearCreated}р
            </div>
          </div>
        </div>
        <div className="flex justify-start items-center gap-4">
          <div className="text-[#e6dfe7] text-2xl font-bold font-['Gotham'] leading-loose">
            {product.price} грн
          </div>
          <button 
            onClick={handleMessageClick}
            disabled={isMessageLoading}
            className="px-[19.36px] bg-[#e6dfe7] rounded-[5.16px] shadow-[0px_2.581277847290039px_0px_0px_rgba(0,0,0,0.02)] outline outline-[1.29px] outline-offset-[-1.29px] outline-[#e6dfe7] h-[41.30px] hover:bg-[#bc98c8] transition-colors"
          >
            <span className="text-[#080217] text-lg font-normal font-['Fixel_Display'] leading-7">
              {isMessageLoading ? "Завантаження..." : "Написати"}
            </span>
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onRemove(product.id);
            }}
            className="w-8 h-8 text-[#bc98c8] hover:text-[#ff7086] transition-colors"
          >
            <i className="ti ti-trash text-xl" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Компонент для "Моїх робіт" та "Переглянутих"
const WorkItem = ({ product, showLikeButton = true }: { product: Product; showLikeButton?: boolean }) => {
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(product.isLikedByCurrentUser);
  const [likesCount, setLikesCount] = useState(product.likesCount);

  const handleLikeClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ProductInteractions/like/${product.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Token: token }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to like product");
      }

      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error("Error liking product:", error);
    }
  };

  return (
    <div
      className="w-[262px] h-[330px] flex-shrink-0 relative rounded border border-[#e6dfe7] cursor-pointer bg-[#020617] overflow-hidden"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div 
        className="w-full h-[189px] bg-cover bg-center"
        style={{
          backgroundImage: `url(${
            product.images && product.images.length > 0 
            ? `${import.meta.env.VITE_API_URL}/images/${product.images[0]}`
            : "https://placehold.co/247x189"
          })`
        }}
      />
      
      <div className="p-4">
        <h3 className="text-[#ff7086] text-base font-medium mb-1 truncate">
          {product.name}
        </h3>
        <p className="text-[#bc98c8] text-sm h-10 overflow-hidden text-ellipsis">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center mt-4">
          <span className="text-[#e6dfe7] text-base font-bold">
            {product.price} грн
          </span>
          
          <div className="flex items-center gap-2">
            {showLikeButton && (
              <button 
                onClick={handleLikeClick}
                className="flex items-center gap-1"
              >
                {isLiked ? (
                  <HeartFilled className="text-[#ff7086]" />
                ) : (
                  <HeartOutlined className="text-[#e6dfe7]" />
                )}
                <span className="text-[#e6dfe7] text-sm">
                  {likesCount}
                </span>
              </button>
            )}
            
            <div className="flex items-center gap-1">
              <EyeFilled className="text-[#e6dfe7]" />
              <span className="text-[#e6dfe7] text-sm">
                {product.viewsCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Компонент пагінації
const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void 
}) => {
  return (
    <div className="flex justify-center items-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded disabled:opacity-50"
      >
        <i className="ti ti-chevron-left text-[#e6dfe7]" />
      </button>
      
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }
        
        return (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum)}
            className={`w-8 h-8 flex items-center justify-center rounded ${
              currentPage === pageNum 
                ? 'bg-[#ff7086] text-[#080217]' 
                : 'text-[#e6dfe7] hover:bg-[#bc98c8] hover:text-[#080217]'
            }`}
          >
            {pageNum}
          </button>
        );
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded disabled:opacity-50"
      >
        <i className="ti ti-chevron-right text-[#e6dfe7]" />
      </button>
    </div>
  );
};

// Головний компонент Index
const Index = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("works");
  const [tabs, setTabs] = useState(TABS);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [viewed, setViewed] = useState<Product[]>([]);
  const [works, setWorks] = useState<Product[]>([]);
  const [favoritesPage, setFavoritesPage] = useState(1);
  const [viewedPage, setViewedPage] = useState(1);
  const [worksPage, setWorksPage] = useState(1);
  const [favoritesTotalPages, setFavoritesTotalPages] = useState(1);
  const [viewedTotalPages, setViewedTotalPages] = useState(1);
  const [worksTotalPages, setWorksTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tab = query.get("tab");
    if (tab && TABS.some(t => t.id === tab)) {
      setActiveTab(tab);
      setTabs(TABS.map(t => ({ ...t, isActive: t.id === tab })));
    }
  }, [location.search]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Токен не знайдено");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) throw new Error("Помилка отримання профілю");
        
        const data: ProfileData = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Невідома помилка");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    if (profileData?.id) {
      if (activeTab === "works") {
        fetchWorks();
      } else if (activeTab === "favorites") {
        fetchFavorites();
      } else if (activeTab === "viewed") {
        fetchViewed();
      }
    }
  }, [activeTab, worksPage, favoritesPage, viewedPage, profileData]);

  const fetchWorks = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/Products/filtered?authorId=${profileData?.id}&page=${worksPage}&pageSize=6`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Token: token }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch works");

      const data = await response.json();
      setWorks(data.items || []);
      setWorksTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching works:", err);
    }
  };

  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ProductInteractions/user-liked-products?page=${favoritesPage}&pageSize=4`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Token: token }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch favorites");

      const data = await response.json();
      setFavorites(data.items || []);
      setFavoritesTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching favorites:", err);
    }
  };

  const fetchViewed = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ProductInteractions/user-viewed-products?page=${viewedPage}&pageSize=6`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Token: token }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch viewed products");

      const data = await response.json();
      setViewed(data.items || []);
      setViewedTotalPages(data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching viewed products:", err);
    }
  };

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setTabs(tabs.map((tab) => ({
      ...tab,
      isActive: tab.id === tabId,
    })));
  };

  const handleAddWork = () => navigate("/add-work");

  const handleRemoveFavorite = async (productId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ProductInteractions/like/${productId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Token: token }),
        }
      );

      if (response.ok) fetchFavorites();
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  if (loading) return <div className="text-white p-8">Завантаження...</div>;
  if (error) return <div className="text-red-500 p-8">Помилка: {error}</div>;
  if (!profileData) return <div className="text-white p-8">Профіль не знайдено</div>;

  return (
    <main className="min-h-screen bg-[#080217] p-[70px] max-md:p-10">
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css"
      />

      <ProfileSection
        image={
          profileData.avatar 
            ? `${import.meta.env.VITE_API_URL}/images/${profileData.avatar}`
            : "https://cdn.builder.io/api/v1/image/assets/TEMP/8f2dbcadf727e83ef941a748fd02cc02cf5b4c7f"
        }
        name={`${profileData.firstName} ${profileData.lastName}`}
        location={profileData.myCountry}
        onAddWork={handleAddWork}
      />

      <NavigationTabs tabs={tabs} onTabChange={handleTabChange} />

      {activeTab === "works" && (
        <div className="w-[1300px] inline-flex flex-col justify-start items-start gap-2.5">
          <div className="text-[#e6dfe7] text-3xl font-medium font-['Skema_Pro_Omni'] leading-[38px]">
            Опубліковані роботи
          </div>
          <div className="w-[1300px] h-0 outline outline-1 outline-offset-[-0.50px] outline-[#e6dfe7]" />
          
          <div className="flex flex-wrap justify-start items-center gap-[47px] mt-5">
            {works.length > 0 ? (
              works.map((product) => (
                <WorkItem key={product.id} product={product} showLikeButton={false} />
              ))
            ) : (
              <div className="text-[#e6dfe7] text-xl py-8">
                У вас ще немає опублікованих робіт
              </div>
            )}
          </div>

          {worksTotalPages > 1 && (
            <Pagination
              currentPage={worksPage}
              totalPages={worksTotalPages}
              onPageChange={setWorksPage}
            />
          )}
        </div>
      )}

      {activeTab === "favorites" && (
        <div className="w-[1300px] inline-flex flex-col justify-start items-start gap-2.5">
          <div className="self-stretch">
            <span className="text-[#e6dfe7] text-3xl font-medium font-['Skema_Pro_Omni'] leading-[38px]">
              Улюблені роботи
            </span>
            <span className="text-[#bc98c8] text-3xl font-medium font-['Skema_Pro_Omni'] leading-[38px]">
              ({favorites.length})
            </span>
          </div>
          <div className="w-[1300px] h-0 outline outline-1 outline-offset-[-0.50px] outline-[#e6dfe7]" />
          
          <div className="w-[1209.72px] inline-flex flex-col justify-start items-start gap-3">
            {favorites.length > 0 ? (
              favorites.map((product) => (
                <FavoriteItem 
                  key={product.id} 
                  product={product} 
                  onRemove={handleRemoveFavorite} 
                />
              ))
            ) : (
              <div className="text-[#e6dfe7] text-xl py-8">
                У вас ще немає улюблених робіт
              </div>
            )}
          </div>

          {favoritesTotalPages > 1 && (
            <Pagination
              currentPage={favoritesPage}
              totalPages={favoritesTotalPages}
              onPageChange={setFavoritesPage}
            />
          )}
        </div>
      )}

      {activeTab === "viewed" && (
        <div className="w-[1300px] inline-flex flex-col justify-start items-start gap-2.5">
          <div className="text-[#e6dfe7] text-3xl font-medium font-['Skema_Pro_Omni'] leading-[38px]">
            Переглянуті роботи
          </div>
          <div className="w-[1300px] h-0 outline outline-1 outline-offset-[-0.50px] outline-[#e6dfe7]" />
          
          <div className="flex flex-wrap justify-start items-center gap-[47px] mt-5">
            {viewed.length > 0 ? (
              viewed.map((product) => (
                <WorkItem key={product.id} product={product} showLikeButton={true} />
              ))
            ) : (
              <div className="text-[#e6dfe7] text-xl py-8">
                У вас ще немає переглянутих робіт
              </div>
            )}
          </div>

          {viewedTotalPages > 1 && (
            <Pagination
              currentPage={viewedPage}
              totalPages={viewedTotalPages}
              onPageChange={setViewedPage}
            />
          )}
        </div>
      )}
    </main>
  );
};

export default Index;