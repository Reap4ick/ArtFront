import { useState, useEffect } from 'react';
import RegistrationModal from '../../../Modal';
import LoginModal from '../../LoginPage';
import RegisterModal from '../../RegisterPage';

const ArtSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const slides = [
    {
      title: "Платформа для натхнення",
      text: "Знаходьте українських митців, відкривайте для себе унікальні твори та підтримуйте культуру. Пориньте у світ мистецтва разом з нами!",
      images: [
        { width: 476.91, src: "https://raw.githubusercontent.com/Reap4ick/someimg/refs/heads/main/image.webp" }
      ]
    },
    {
      title: "Підтримуйте українське мистецтво",
      text: "Відкривайте для себе нові імена, купуйте унікальні твори та допомагайте митцям розвивати свій талант. Разом ми створюємо майбутнє мистецтва!",
      images: [
        { width: 423.18, src: "https://raw.githubusercontent.com/Reap4ick/someimg/refs/heads/main/image%20(1).webp" }
      ]
    },
    {
      title: "Відкрийте нові мистецькі горизонти",
      text: "Українські митці створюють шедеври, які варті вашої уваги. Пориньте у світ сучасного мистецтва та знайдіть своє натхнення!",
      images: [
        { width: 384.64, src: "https://raw.githubusercontent.com/Reap4ick/someimg/refs/heads/main/image%20(2).webp" }
      ]
    },
    {
      title: "Створюйте свою колекцію мистецтва",
      text: "Додавайте улюблені роботи до списку бажань, слідкуйте за новинками та будьте частиною мистецької спільноти.",
      images: [
        { width: 511.16, src: "https://raw.githubusercontent.com/Reap4ick/someimg/refs/heads/main/image%20(3).webp" }
      ]
    },
    {
      title: "Єдині у своєму роді твори",
      text: "Кожен витвір – це історія, розказана через фарби та форми. Оберіть картину, яка відгукнеться у вашому серці.",
      images: [
        { width: 275.36, src: "https://raw.githubusercontent.com/Reap4ick/someimg/refs/heads/main/image%20(4).webp" }
      ]
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const handleNext = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
  };

  const handlePrev = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);
  };

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

  const handleViewClick = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      openRegModal();
      return;
    }
    window.location.href = '/posts';
  };

  return (
    <div className="relative w-[1300px] h-[400px] overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-opacity duration-500 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="absolute w-[1300px] h-[400px] left-0 top-0 rounded-lg border border-[#e6dfe7]" />

          <div className="absolute w-[606px] left-[530px] top-[46px] inline-flex flex-col items-start gap-4">
            <h2 className="text-[#e6dfe7] text-[46px] font-medium font-['Skema_Pro_Omni'] leading-[40px] text-left">
              {slide.title}
            </h2>
            <p className="text-[#e6dfe7] text-[22px] font-normal font-['Gotham'] leading-[30px] text-left">
              {slide.text}
            </p>
          </div>

          <button
            className="absolute px-[15px] left-[530px] top-[262px] bg-[#eee6e3] rounded-lg outline outline-1 outline-[#eee6e3] h-10 inline-flex flex-col justify-center items-center gap-2 hover:bg-[#e0d8d5] focus:bg-[#e0d8d5] transition-colors duration-200"
            onClick={handleViewClick}
          >
            <span className="text-[#080217] text-base font-normal font-['Fixel_Display'] leading-normal">
              Переглянути
            </span>
          </button>

          <div className="absolute w-[495px] h-[390px] left-0 top-[5px] overflow-hidden flex justify-center items-center">
            <div className="inline-flex items-center gap-[35px]">
              {slide.images.map((img, imgIndex) => (
                <img
                  key={imgIndex}
                  src={img.src}
                  className="h-[370px]"
                  style={{ width: `${img.width}px` }}
                  alt={`Artwork ${imgIndex}`}
                />
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Кнопки навігації */}
      <div
        className="absolute w-6 h-6 left-[1216px] top-[361px] overflow-hidden cursor-pointer z-10"
        onClick={handlePrev}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6.56261 10.1514L12.3282 14.3233C12.4525 14.4124 12.6259 14.3233 12.6259 14.171V13.0717C12.6259 12.8327 12.5111 12.6053 12.3165 12.4647L8.90871 9.99908L12.3165 7.53345C12.5111 7.39283 12.6259 7.16783 12.6259 6.92642V5.8272C12.6259 5.67486 12.4525 5.58579 12.3282 5.67486L6.56261 9.84673C6.53864 9.86425 6.51914 9.88717 6.50569 9.91364C6.49225 9.94011 6.48524 9.96939 6.48524 9.99908C6.48524 10.0288 6.49225 10.058 6.50569 10.0845C6.51914 10.111 6.53864 10.1339 6.56261 10.1514Z" fill="#BC98C9"/>
          <path d="M18.625 0.625H1.375C0.960156 0.625 0.625 0.960156 0.625 1.375V18.625C0.625 19.0398 0.960156 19.375 1.375 19.375H18.625C19.0398 19.375 19.375 19.0398 19.375 18.625V1.375C19.375 0.960156 19.0398 0.625 18.625 0.625ZM17.6875 17.6875H2.3125V2.3125H17.6875V17.6875Z" fill="#BC98C9"/>
        </svg>
      </div>
      <div
        className="absolute w-6 h-6 left-[1256px] top-[361px] overflow-hidden cursor-pointer z-10"
        onClick={handleNext}
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M7.67266 14.3256L13.4383 10.1537C13.5414 10.0787 13.5414 9.92639 13.4383 9.85139L7.67266 5.6795C7.54844 5.59043 7.375 5.6795 7.375 5.83184V6.93106C7.375 7.17013 7.48984 7.39747 7.68438 7.5381L11.0922 10.0014L7.68438 12.467C7.48984 12.6076 7.375 12.8326 7.375 13.0741V14.1733C7.375 14.3256 7.54844 14.4147 7.67266 14.3256Z" fill="#BC98C9"/>
          <path d="M18.625 0.625H1.375C0.960156 0.625 0.625 0.960156 0.625 1.375V18.625C0.625 19.0398 0.960156 19.375 1.375 19.375H18.625C19.0398 19.375 19.375 19.0398 19.375 18.625V1.375C19.375 0.960156 19.0398 0.625 18.625 0.625ZM17.6875 17.6875H2.3125V2.3125H17.6875V17.6875Z" fill="#BC98C9"/>
        </svg>
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

export default ArtSlider;