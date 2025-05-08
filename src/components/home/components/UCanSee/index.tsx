import React from "react";
import "./style.css";

const GalleryComponent: React.FC = () => {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.style.backgroundColor = ""; // Видалено білий напівпрозорий фон
    target.style.border = ""; // Видалено бордер
    target.src = ""; // Скидання src, якщо потрібно
  };

  return (
    <div>
      {/* Галерея */}
      <div className="gallery">
        <div className="gallery-item large" style={{ marginTop: "0px", marginBottom: "0px", marginLeft: "0px", marginRight: "0px", height: "400px",width:"420px" }}>
          <img src="https://raw.githubusercontent.com/Reap4ick/someimg/fc0d8eaa808b64ec53282748b6bb8cbff2882a94/image1.svg" alt="Image 1" onError={handleImageError} />
        </div>
        <div className="gallery-item medium" style={{ marginTop: "0px", marginBottom: "0px", marginLeft: "-42px", marginRight: "0px", height: "180px",width:"232px" }}>
          <img src="https://raw.githubusercontent.com/Reap4ick/someimg/fc0d8eaa808b64ec53282748b6bb8cbff2882a94/portret.svg" alt="Image 2" onError={handleImageError} />
        </div>
        <div className="gallery-item wide" style={{ marginTop: "0px", marginBottom: "0px", marginLeft: "-9px", marginRight: "0px", height: "180px",width:"592px" }}>
          <img src="https://raw.githubusercontent.com/Reap4ick/someimg/fc0d8eaa808b64ec53282748b6bb8cbff2882a94/image3.svg" alt="Image 3" onError={handleImageError} />
        </div>
        <div className="gallery-item small" style={{ marginTop: "-28px", marginBottom: "0px", marginLeft: "-5px", marginRight: "0px", height: "210px",width:"270.67px" }}>
          <img src="https://raw.githubusercontent.com/Reap4ick/someimg/fc0d8eaa808b64ec53282748b6bb8cbff2882a94/image4.svg" alt="Image 4" onError={handleImageError} />
        </div>
        <div className="gallery-item medium" style={{ marginTop: "0px", marginBottom: "0px", marginLeft: "67.33px", marginRight: "0px", height: "180px",width:"232px" }}>
          <img src="https://raw.githubusercontent.com/Reap4ick/someimg/fc0d8eaa808b64ec53282748b6bb8cbff2882a94/image5.svg" alt="Image 5" onError={handleImageError} />
        </div>
        <div className="gallery-item medium" style={{ marginTop: "0px", marginBottom: "0px", marginLeft: "111px", marginRight: "0px", height: "180px",width:"232px" }}>
          <img src="https://raw.githubusercontent.com/Reap4ick/someimg/fc0d8eaa808b64ec53282748b6bb8cbff2882a94/image6.svg" alt="Image 6" onError={handleImageError} />
        </div>
      </div>

      {/* Контейнер для тексту "Місія" та "Візія" */}
      <div className="original-image-container">
        <div className="mission-text">
          <h2>Місія</h2>
          <p>
            Місія цієї платформи полягає в підтримці українських митців шляхом створення доступного і прозорого простору для
            демонстрації їхньої творчості, взаємодії з шанувальниками та можливостей монетизації, що сприяє розвитку української
            культури та мистецтва в глобальному масштабі.
          </p>
        </div>
        <img src="https://raw.githubusercontent.com/Reap4ick/someimg/fc0d8eaa808b64ec53282748b6bb8cbff2882a94/lines.svg" alt="Original" className="lines-image" onError={handleImageError} />
        <div className="vision-text">
          <h2>Візія</h2>
          <p>
            Візія цієї платформи полягає в тому, щоб стати провідною глобальною платформою для українських митців, що об'єднує
            творчість, культуру та технології, сприяє розвитку мистецтва та підтримує таланти, створюючи динамічну спільноту, де
            кожен може вільно виражати себе, знаходити натхнення та реалізовувати свої мрії.
          </p>
        </div>
      </div>

      {/* Секція статистики */}
      <div className="statistics">
        <div className="stat-card">
          <h2>+1200</h2>
          <p>Опублікованих робіт</p>
        </div>
        <div className="stat-card">
          <h2>+978</h2>
          <p>Користувачів</p>
        </div>
        <div className="stat-card">
          <h2>+592</h2>
          <p>Проданих робіт</p>
        </div>
        <div className="stat-card">
          <h2>+2908</h2>
          <p>Підтриманих проєктів</p>
        </div>
      </div>
    </div>
  );
};

export default GalleryComponent;
