import React, { useState } from "react";
import RegisterModal from "../RegisterPage"; // Adjust path as needed
import LoginModal from "../LoginPage"; // Adjust path as needed

const SectionBlock: React.FC<{ title: string; content: string | string[] }> = ({ title, content }) => (
  <div className="w-full bg-[#080217] p-[32px] rounded-[12px] mb-[32px]">
    <h3 className="text-[#e6dfe7] text-[24px] font-normal font-['Gotham'] leading-[36px] mb-[16px]">
      {title}
    </h3>
    {Array.isArray(content) ? (
      <ul className="list-disc list-inside space-y-[12px]">
        {content.map((item, index) => (
          <li 
            key={index} 
            className="text-[#bc98c8] text-[18px] font-normal font-['Gotham'] leading-[28px]"
          >
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

const AdvantageListBlock: React.FC<{ title: string; items: string[] }> = ({ title, items }) => (
  <div className="w-full bg-[#080217] p-[32px] rounded-[12px] mb-[32px]">
    <h3 className="text-[#e6dfe7] text-[24px] font-normal font-['Gotham'] leading-[36px] mb-[16px]">
      {title}
    </h3>
    <ul className="space-y-[12px]">
      {items.map((item, index) => (
        <li 
          key={index} 
          className="flex items-start gap-[12px]"
        >
          <svg 
            width="16" 
            height="15" 
            viewBox="0 0 16 15" 
            className="flex-shrink-0 mt-[3px]"
          >
            <path 
              d="M8 14.9443C12.4183 14.9443 16 11.6369 16 7.5571C16 3.47727 12.4183 0.169922 8 0.169922C3.58172 0.169922 0 3.47727 0 7.5571C0 11.6369 3.58172 14.9443 8 14.9443Z" 
              fill="#FF7086" 
              fillOpacity="0.35"
            />
            <path 
              d="M4.5 6.63359L7.394 9.3059C7.42213 9.33184 7.46025 9.34641 7.5 9.34641C7.53975 9.34641 7.57787 9.33184 7.606 9.3059L15.5 2.0166" 
              stroke="#BC98C9" 
              strokeWidth="1.2"
            />
          </svg>
          <span className="text-[#bc98c8] text-[18px] font-normal font-['Gotham'] leading-[28px]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  </div>
);

const Customers: React.FC = () => {
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
            Покупцям
          </h1>
        </div>
        <div className="w-full h-[1px] bg-[#e6dfe7]" />
      </div>

      {/* Верхній блок з текстом та зображенням */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-[32px] mb-[64px]">
        {/* Текстова частина */}
        <div className="flex-1 flex items-center h-full">
          <div className="mb-[32px] lg:mb-[0]">
            <h2 className="text-[#e6dfe7] text-[42px] font-medium font-['Skema_Pro_Omni'] leading-[50px] mb-[16px]">
              Як зробити покупку на ArtUA?
            </h2>
            <p className="text-[#e6dfe7] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px]">
              Тут ви можете напряму зв'язатися з авторами, дізнатися більше про
              їхні роботи та домовитися про покупку без посередників.
            </p>
          </div>
        </div>

        {/* Зображення */}
        <img 
          src="https://cdn.builder.io/api/v1/image/assets/TEMP/5978ccd431d28d534a0bdef9fd6209159c30d222"
          alt="Процес покупки"
          className="lg:w-[624px] lg:h-[624px] w-full h-auto rounded-[8px] self-center"
        />
      </div>

      {/* Секції на всю ширину */}
      <div className="w-full max-w-screen-2xl mx-auto space-y-[0px]">
        <SectionBlock
          title="Процес покупки"
          content={[
            "Оберіть роботу - Перегляньте каталог картин та інших мистецьких творів. Ви можете скористатися фільтрами за жанром, технікою чи автором.",
            "Напишіть автору - Натисніть кнопку 'Зв'язатися з митцем' у картці роботи, щоб дізнатися більше про деталі твору, можливість перегляду та способи оплати.",
            "Обговоріть умови - Узгодьте з художником умови купівлі: ціну, спосіб передачі або доставки, а також можливість отримання сертифіката автентичності.",
            "Завершіть угоду - Оплата та передача твору відбуваються напряму між вами та митцем у зручний для обох спосіб."
          ]}
        />

        <AdvantageListBlock
          title="Переваги покупки на ArtUA"
          items={[
            "Прямий зв'язок з художниками – безпосередньо спілкуйтесь з авторами без комісій і посередників.",
            "Унікальні мистецькі твори – підтримайте сучасних українських митців і станьте власником ексклюзивних робіт.",
            "Гнучкі умови – домовляйтеся про зручний формат перегляду, оплати та доставки напряму з автором."
          ]}
        />

        <SectionBlock
          title="Маєте питання?"
          content="Не соромтеся звертатися до митця напряму — він з радістю відповість на ваші запитання щодо роботи, процесу купівлі та доставки. ArtUA лише допомагає вам знайти унікальні твори та налагодити контакт із їхніми авторами."
        />
      </div>

      {/* CTA Блок (display only if not registered) */}
      {!token && (
        <div className="w-full max-w-screen-2xl mx-auto bg-[#ff7086] rounded-[8px] p-[64px] mt-[64px]">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-[32px]">
            <div className="flex-1">
              <h3 className="text-[#080217] text-[30px

] font-medium font-['Skema_Pro_Omni'] leading-[38px] mb-[16px]">
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

export default Customers;