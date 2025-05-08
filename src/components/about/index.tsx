import React, { useState } from "react";
import RegisterModal from "../RegisterPage"; // Adjust path as needed
import LoginModal from "../LoginPage"; // Adjust path as needed

const AboutArtUA = () => {
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const token = localStorage.getItem("token");

  const handleOpenRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  const handleCloseRegisterModal = () => {
    setIsRegisterModalOpen(false);
  };

  const handleOpenLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const handleCloseLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const handleRegister = (token: string) => {
    console.log("Registered with token:", token);
    setIsRegisterModalOpen(false);
  };

  const handleLogin = (token: string) => {
    console.log("Logged in with token:", token);
    setIsLoginModalOpen(false);
  };

  return (
    <div className="bg-[#080217] min-h-screen w-full overflow-hidden px-[70px] py-[40px]">
      {/* Заголовок секції */}
      <div className="mb-[32px]">
        <div className="flex items-center gap-[8px] mb-[16px]">
          <h1 className="text-[#e6dfe7] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px]">
            Про ArtUA
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
              ArtUA –
            </h2>
            <p className="text-[#e6dfe7] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px]">
              це онлайн-платформа, створена для підтримки українських митців, які прагнуть ділитися своєю творчістю, 
              розвиватися професійно та знаходити нові можливості для реалізації своїх талантів.
            </p>
          </div>
        </div>

        {/* Зображення */}
        <img 
          src="https://raw.githubusercontent.com/Reap4ick/someimg/refs/heads/main/image%20(5).webp" 
          alt="ArtUA" 
          className="lg:w-[624px] lg:h-[624px] w-full h-auto rounded-[8px] self-center" 
        />
      </div>

      {/* Секції на всю ширину */}
      <div className="w-full max-w-screen-2xl mx-auto space-y-[0px]">
        <SectionBlock 
          title="Місія"
          content="Ми прагнемо об'єднати митців різних напрямків: від живопису та графіки до музики й цифрового мистецтва, 
          створюючи простір, де кожен може знайти свою аудиторію, колег для співпраці або навіть перших клієнтів."
        />

        <SectionBlock 
          title="Що ми пропонуємо?"
          content={[
            "Галерея творчості – публікуйте свої роботи та отримуйте відгуки від поціновувачів мистецтва.",
            "Ком'юніті митців – долучайтеся до обговорень, знайомтеся з іншими авторами та створюйте спільні проєкти.",
            "Професійний розвиток – отримуйте доступ до майстер-класів, статей, воркшопів і корисних матеріалів для вдосконалення навичок.",
            "Маркетплейс – продавайте свої роботи або знаходьте замовлення, залишаючись у зручному творчому середовищі."
          ]}
        />

        <SectionBlock 
          title="Для кого створено?"
          content={[
            "Для початківців, які хочуть зробити перші кроки у творчій кар'єрі.",
            "Для професійних митців, які шукають нові шляхи розвитку та підтримки.",
            "Для поціновувачів мистецтва, які прагнуть відкрити нові таланти й підтримати творчість."
          ]}
        />

        <SectionBlock 
          title="Чому обирають нас?"
          content={[
            "Ми ставимо митця в центр уваги, пропонуючи інструменти для його зростання.",
            "Платформа адаптована для зручного використання як митцями, так і їхньою аудиторією.",
            "Кожна взаємодія тут спрямована на підтримку української культури та її збереження."
          ]}
        />
      </div>

      {/* Фінальний блок */}
      <div className="w-full max-w-screen-2xl mx-auto my-[64px]">
        <p className="text-[#e6dfe7] text-[24px] font-normal font-['Gotham'] leading-[36px] mb-[32px]">
          ArtUA – це не просто платформа, це спільнота, яка цінує та підтримує вашу унікальність. 
          Ми створюємо умови, де творчість може процвітати, а кожна робота знайде свого поціновувача.
        </p>
        <p className="text-[#e6dfe7] text-[30px] font-medium font-['Skema_Pro_Omni'] leading-[38px]">
          📌 Підтримай українське мистецтво. Створи свою історію разом з ArtUA!
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

// Допоміжний компонент для секцій
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

export default AboutArtUA;