import React, { useState } from "react";
import RegisterModal from "../RegisterPage"; // Adjust path as needed
import LoginModal from "../LoginPage"; // Adjust path as needed

const Index = () => {
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

  const artistRules = [
    "Розміщуйте лише власні роботи.",
    "Будьте відкритими до комунікації: відповідайте на запити та надавайте чесну інформацію.",
    "Вказуйте реальні ціни та не змінюйте умови після домовленості.",
    "Дбайте про якість зображень — хороше фото роботи допомагає її продати!",
  ];

  const buyerRules = [
    "Поважайте авторів і їхню працю.",
    "Запитуйте, якщо маєте питання про картину — митці завжди готові розповісти більше.",
    "Дотримуйтесь домовленостей щодо оплати та отримання твору.",
  ];

  const forbiddenRules = [
    "Використання ArtUA для продажу товарів, які не є мистецтвом.",
    "Порушення авторських прав.",
    "Образлива поведінка, шахрайство або обман.",
  ];

  return (
    <main className="bg-[#080217] min-h-screen w-full overflow-hidden px-[70px] py-[40px] md:px-[20px]">
      {/* Заголовок секції */}
      <div className="mb-[32px]">
        <div className="flex items-center gap-[8px] mb-[16px]">
          <h1 className="text-[#e6dfe7] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px]">
            Митцям
          </h1>
        </div>
        <div className="w-full h-[1px] bg-[#e6dfe7]" />
      </div>

      <div className="max-w-[1300px] mx-auto my-0">
        <section className="text-[20px] leading-[28px] font-['Gotham'] mb-[32px]">
          <p>
            Мистецтво — це свобода, але навіть у творчому просторі потрібні
            правила. ArtUA прагне бути комфортним майданчиком для митців і
            покупців, тому є кілька важливих принципів, яких варто
            дотримуватися.
          </p>
        </section>

        <SectionBlock title="Головне про платформу">
          <div className="text-[#BC98C9] text-[16px] leading-[24px] font-['Gotham']">
            <p className="mb-[12px]">
              ArtUA — це місце для продажу оригінальних мистецьких творів.
              Плагіат, копії відомих робіт чи несанкціоноване використання чужих
              ідей тут не вітаються.
            </p>
            <p className="mb-[12px]">
              Всі угоди укладаються напряму між митцем і покупцем. Платформа не
              втручається у процес переговорів, ціноутворення чи доставку.
            </p>
          </div>
        </SectionBlock>

        <SectionBlock title="🖼 Для митців" icons={["✔", "✔", "✔", "✔"]} content={artistRules} />
        <SectionBlock title="🛍 Для покупців" icons={["✔", "✔", "✔"]} content={buyerRules} />
        <SectionBlock title="🚫 Що заборонено?" icons={["❌", "❌", "❌"]} content={forbiddenRules} />

        <section className="text-[20px] leading-[28px] font-['Gotham'] my-[40px]">
          <p>
            Ми створюємо простір, де мистецтво знаходить своїх людей.
            Дотримуйтесь правил — і тоді ArtUA стане зручним місцем як для
            митців, так і для поціновувачів мистецтва.
          </p>
        </section>
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
                Наша платформа об'єднує творчих людей, які несуть українську культуру
                у світ. Підтримайте українських митців та долучайтеся до нашої
                спільноти, щоб допомогти мистецтву розвиватися попри всі перешкоди.
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
    </main>
  );
};

// Допоміжний компонент для секцій
const SectionBlock: React.FC<{ 
  title: string; 
  content?: string[];
  icons?: string[];
  children?: React.ReactNode;
}> = ({ title, content, icons, children }) => (
  <div className="w-full bg-[#080217] p-[32px] rounded-[12px] mb-[32px]">
    <h2 className="text-[#e6dfe7] text-[24px] font-normal font-['Gotham'] leading-[36px] mb-[16px]">
      {title}
    </h2>
    
    {children || (Array.isArray(content) && (
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
    ))}
  </div>
);

export default Index;