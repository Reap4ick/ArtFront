import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HomeOutlined } from '@ant-design/icons';
import { Breadcrumb } from 'antd';
import './style.css'; // Стилі для компонента
import Cards from './components/Cards';
import LastViewedWorks from './components/Last/indexLast'; // Новий компонент
import Help from "./components/Help";

const App = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  // Перевірка токена і перенаправлення
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  // Якщо токена немає, не рендеримо сторінку
  if (!token) {
    return null; // Або можна додати повідомлення типу "Перенаправлення на логін..."
  }

  return (
    <div>
      <div className="app-container">
        <style>
          {`
            /* Стилі для іконки Home та роздільника */
            .breadcrumb.ant-breadcrumb a,
            .breadcrumb.ant-breadcrumb .ant-breadcrumb-link,
            .breadcrumb.ant-breadcrumb .ant-breadcrumb-link a,
            .breadcrumb.ant-breadcrumb .ant-breadcrumb-link span,
            .breadcrumb.ant-breadcrumb .ant-breadcrumb-separator {
              color: rgb(188, 152, 201) !important;
            }

            /* Hover ефект для посилань */
            .breadcrumb.ant-breadcrumb a:hover,
            .breadcrumb.ant-breadcrumb .ant-breadcrumb-link a:hover {
              color: rgb(188, 152, 201) !important;
              opacity: 0.8;
            }

            /* Стилі для "Список картин" */
            #posts-list,
            .breadcrumb.ant-breadcrumb .ant-breadcrumb-item:last-child,
            .breadcrumb.ant-breadcrumb .ant-breadcrumb-item:last-child span {
              color: rgb(255, 112, 134) !important;
            }
          `}
        </style>
        <Breadcrumb className="breadcrumb">
          <Breadcrumb.Item href="/">
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <span id="posts-list">Список картин</span>
          </Breadcrumb.Item>
        </Breadcrumb>
        <h1 className="whtnew">Що нового?</h1>

        {/* Wrapper для фільтра і вертикальної лінії */}
        <div className="filter-wrapper">
          <div className="filter-container">
            {/* <Filterr onFilter={(values) => console.log(values)} /> */}
          </div>
          <div className="vertical-line" /> {/* Вертикальна лінія справа */}
        </div>
      </div>
      <Cards />
      <LastViewedWorks />
      <Help />
    </div>
  );
};

export default App;