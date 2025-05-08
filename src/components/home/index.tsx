import { useState } from "react";
import "./style.css";
import InspirationPage from "./components/BestWorks";
import UCanSee from "./components/UCanSee";
import Famous from "./components/Famous";
import CardWrapper from "./slider";
import RegisterModal from "../RegisterPage"; // Adjust path as needed
import LoginModal from "../LoginPage"; // Adjust path as needed

const HomePage = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false); // Стан для логіну
  const token = localStorage.getItem("token");

  const handleOpenRegisterModal = () => {
    setIsLoginModalOpen(false); // Закриваємо логін, якщо відкритий
    setIsRegisterModalOpen(true); // Відкриваємо реєстрацію
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleOpenLoginModal = () => {
    setIsRegisterModalOpen(false); // Закриваємо реєстрацію
    setIsLoginModalOpen(true); // Відкриваємо логін
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleRegister = (token: string) => {
    console.log("Registered with token:", token);
    localStorage.setItem("token", token); // Зберігаємо токен
    setIsRegisterModalOpen(false);
  };

  const handleLogin = (token: string) => {
    console.log("Logged in with token:", token);
    localStorage.setItem("token", token); // Зберігаємо токен
    setIsLoginModalOpen(false);
  };

  return (
    <div className="relative">
      {/* Фон з вогниками */}
      <div className="animated-bg">
        <div className="firefly firefly-1"></div>
        <div className="firefly firefly-2"></div>
      </div>
      <CardWrapper />
      {/* Основний контент */}
      <main className="relative z-10">
        <InspirationPage />
        <UCanSee />
        <Famous />
        {/* CTA Блок (display only if not registered) */}
        {!token && (
          <div className="w-[1213px] h-[350px] relative mx-auto">
            <div className="w-[1213px] h-[350px] left-0 top-0 absolute bg-[#ff7086] rounded-lg" />
            <div className="left-[89px] top-[106px] absolute justify-start items-center gap-[30px] inline-flex">
              <div className="w-[772px] flex-col justify-start items-start gap-4 inline-flex">
                <div className="self-stretch text-[#080217] text-3xl font-medium font-['Skema Pro Omni'] leading-[38px]">
                  Підтримуй українське мистецтво!
                </div>
                <div className="self-stretch text-black text-xl font-normal font-['Gotham'] leading-7">
                  Наша платформа об'єднує творчих людей, які несуть українську культуру у світ. Підтримуйте українських митців та долучайтеся до нашої спільноти, щоб допомогти мистецтву розвиватися попри всі перешкоди.
                </div>
              </div>
              <button
                className="bg-[#080217] text-[#e6dfe7] px-[24px] py-[12px] rounded-[6px] text-[18px] font-normal hover:opacity-90 transition-opacity"
                onClick={handleOpenRegisterModal}
              >
                Приєднатися зараз
              </button>
            </div>
          </div>
        )}
      </main>

      {/* RegisterModal */}
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={handleCloseRegisterModal}
        onRegister={handleRegister}
        openLoginModal={handleOpenLoginModal}
      />

      {/* LoginModal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseLoginModal}
        onLogin={handleLogin}
        openRegisterModal={handleOpenRegisterModal}
      />
    </div>
  );
};

export default HomePage;