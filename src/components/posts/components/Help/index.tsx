import { useState } from "react";
import RegisterModal from "../../../RegisterPage"; // Adjust path as needed
import LoginModal from "../../../LoginPage"; // Adjust path as needed

const App = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const handleOpenRegisterModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleOpenLoginModal = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleRegister = (token: string) => {
    console.log("Registered with token:", token);
    localStorage.setItem("token", token);
    setIsRegisterModalOpen(false);
    window.location.reload(); // Перезавантаження сторінки
  };

  const handleLogin = (token: string) => {
    console.log("Logged in with token:", token);
    localStorage.setItem("token", token);
    setIsLoginModalOpen(false);
  };

  return (
    <div>
      {/* CTA Block (display only if not registered) */}
      {!token && (
        <div className="w-full max-w-screen-2xl mx-auto bg-[#ff7086] rounded-[8px] p-[64px]">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-[32px]">
            <div className="flex-1">
              <h3 className="text-[#080217] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px] mb-[16px]">
                Підтримуй українське мистецтво!
              </h3>
              <p className="text-black text-[20px] font-normal font-['Gotham'] leading-[28px]">
                Наша платформа об'єднує творчих людей, які несуть українську культуру у світ.
                Підтримайте українських митців та долучайтеся до нашої спільноти, щоб допомогти
                мистецтву розвиватися попри всі перешкоди.
              </p>
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

export default App;