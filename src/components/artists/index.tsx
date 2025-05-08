import React, { useState } from "react";
import RegisterModal from "../RegisterPage"; // Adjust path as needed
import LoginModal from "../LoginPage"; // Adjust path as needed

const Artists = () => {
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
    <div className="bg-[#080217] min-h-screen w-full overflow-hidden px-[70px] py-[40px]">
      {/* Заголовок секції */}
      <div className="mb-[32px]">
        <div className="flex items-center gap-[8px] mb-[16px]">
          <h1 className="text-[#e6dfe7] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px]">
            Митцям
          </h1>
        </div>
        <div className="w-full h-[1px] bg-[#e6dfe7]" />
      </div>

      {/* Верхній блок з текстом та зображенням */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-[32px] mb-[64px]">
        {/* Текстова частина */}
        <div className="flex-1 flex items-center h-full">
          <div className="mb-[32px] lg:mb-[0px]">
            <h2 className="text-[#e6dfe7] text-[42px] font-medium font-['Skema_Pro_Omni'] leading-[50px] mb-[16px]">
              Ви створюєте мистецтво —
              <span className="block text-[30px] mt-[16px]">
                ArtUA допомагає знайти тих, хто його цінує
              </span>
            </h2>
            <p className="text-[#e6dfe7] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px]">
              Ніяких посередників, комісій чи складних схем. Просто ви, ваші роботи
              та прямий зв'язок із покупцями.
            </p>
          </div>
        </div>

        {/* Зображення */}
        <img 
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/315499bcc2f2dbce4a7a8b9811bbe6e4bbb8d97c" 
          alt="ArtUA" 
          className="lg:w-[624px] lg:h-[624px] w-full h-auto rounded-[8px] self-center" 
        />
      </div>

      {/* Секції на всю ширину */}
      <div className="w-full max-w-screen-2xl mx-auto space-y-[0px]">
        <SectionBlock 
          title="Як це працює?"
          content={[
            "Ви додаєте свої роботи — короткий опис, фото, розмір, техніка виконання",
            "Покупці знаходять вас — за стилем, жанром або просто закохуються у вашу картину",
            "Спілкуєтесь напряму — обговорюєте деталі продажу, оплату та передачу твору",
            "Творите далі — без обмежень, зайвих витрат і з підтримкою людей, які цінують ваше мистецтво"
          ]}
          icons={["🔹", "🔹", "🔹", "🔹"]}
        />

        <SectionBlock 
          title="Чому ArtUA?"
          content={[
            "Вільний простір для митців — ви самі вирішуєте, що та як продавати",
            "Жодних прихованих комісій — усі угоди напряму між вами та покупцем",
            "Ваша творчість у центрі уваги — більше шансів знайти свого поціновувача"
          ]}
          icons={["✨", "✨", "✨"]}
        />
      </div>

      {/* Фінальний блок */}
      <div className="w-full max-w-screen-2xl mx-auto my-[64px]">
        <p className="text-[#e6dfe7] text-[24px] font-normal font-['Gotham'] leading-[36px] mb-[32px]">
          Готові поділитися своїм мистецтвом зі світом?
        </p>
        <p className="text-[#e6dfe7] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px]">
          Долучайтеся до ArtUA та станьте частиною української арт-спільноти!
        </p>
      </div>

      {/* CTA Блок (display only if not registered) */}
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

// Допоміжний компонент для секцій з іконками
const SectionBlock: React.FC<{ 
  title: string; 
  content: string | string[];
  icons?: string[]; 
}> = ({ title, content, icons }) => (
  <div className="w-full bg-[#080217] p-[32px] rounded-[12px] mb-[32px]">
    <h3 className="text-[#e6dfe7] text-[24px] font-normal font-['Gotham'] leading-[36px] mb-[16px]">
      {title}
    </h3>
    {Array.isArray(content) ? (
      <ul className="space-y-[12px]">
        {content.map((item, index) => (
          <li 
            key={index} 
            className="text-[#bc98c8] text-[18px] font-normal font-['Gotham'] leading-[28px] flex items-start"
          >
            {icons && icons[index] && (
              <span className="mr-[8px] mt-[2px]">{icons[index]}</span>
            )}
            {item}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-[#bc98c8] text-[18px] font-normal font-['Gotham'] leading-[28px]">
        {content}
      </p>
    )}
  </div>
);

export default Artists;