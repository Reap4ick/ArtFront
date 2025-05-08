import { CloseOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Typography, message } from "antd";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (token: string) => void;
  openRegisterModal: () => void;
}

const ForgotPasswordModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  email: string;
}> = ({ isOpen, onClose, email }) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSendResetPassword = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Помилка при відправці запиту на скидання пароля");
      }

      message.success("Новий пароль відправлено на вашу пошту!");
      onClose();
    } catch (error) {
      console.error("Reset password error:", error);
      message.error(error instanceof Error ? error.message : "Помилка при скиданні пароля");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        animation: "fadeIn 0.3s ease-out",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 400,
          backgroundColor: "#E5E5E5",
          borderRadius: 8,
          padding: 24,
          maxHeight: "calc(100vh - 40px)",
          overflowY: "auto",
          transform: "translateY(-20px)",
          animation: "slideIn 0.3s ease-out forwards",
        }}
      >
        <CloseOutlined
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            fontSize: 20,
            cursor: "pointer",
            zIndex: 1,
          }}
          onClick={onClose}
        />

        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <Title level={4} style={{ marginTop: 8, color: "#080217" }}>
            Скидання пароля
          </Title>
          <Text style={{ color: "#410c55" }}>
            Чи хочете згенерувати новий пароль та отримати його у листі на вашу пошту ({email})?
          </Text>
        </div>

        <Row justify="center" style={{ marginTop: 16 }}>
          <Col span={24}>
            <Button
              type="primary"
              onClick={handleSendResetPassword}
              loading={loading}
              style={{
                width: "100%",
                height: 45,
                backgroundColor: "#000",
                borderColor: "#D8B4E2",
              }}
            >
              Відправити
            </Button>
          </Col>
        </Row>
      </div>
    </div>
  );
};

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, openRegisterModal }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLogin = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error("Невірний логін або пароль");
      }

      const data = await response.json();
      const token = data.token;

      if (token) {
        localStorage.setItem("token", token);
        const savedToken = localStorage.getItem("token");
        if (savedToken !== token) {
          throw new Error("Помилка збереження токена в localStorage");
        }
        console.log("Token saved:", savedToken);
        onLogin(token);
        message.success("Успішний вхід!");
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        throw new Error("Токен не отримано");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        message.error(error.message || "Помилка входу");
      } else {
        message.error("Помилка входу");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    document.body.style.overflow = "auto"; // Явне скидання overflow
    onClose();
  };

  const handleOpenForgotPassword = () => {
    if (!email) {
      message.error("Будь ласка, введіть email перед скиданням пароля");
      return;
    }
    setIsForgotPasswordOpen(true);
  };

  const handleCloseForgotPassword = () => {
    setIsForgotPasswordOpen(false);
  };

  return (
    <>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          animation: "fadeIn 0.3s ease-out",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: 544,
            backgroundColor: "#E5E5E5",
            borderRadius: 8,
            padding: 24,
            maxHeight: "calc(100vh - 40px)",
            overflowY: "auto",
            transform: "translateY(-20px)",
            animation: "slideIn 0.3s ease-out forwards",
          }}
        >
          <CloseOutlined
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              fontSize: 24,
              cursor: "pointer",
              zIndex: 1,
            }}
            onClick={handleClose}
          />

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <svg width="53" height="53" viewBox="0 0 53 53" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="18.3184" y="18.3188" width="15.2081" height="14.8624" fill="#410C55"/>
              <rect y="9.67798" width="4.49329" height="32.8356" fill="#BC98C9"/>
              <rect y="42.5132" width="4.49329" height="33.8725" transform="rotate(-90 0 42.5132)" fill="#BC98C9"/>
              <rect x="52.1919" y="42.5139" width="4.49329" height="32.8356" transform="rotate(180 52.1919 42.5139)" fill="#BC98C9"/>
              <rect x="52.1919" y="9.67871" width="4.49329" height="33.8725" transform="rotate(90 52.1919 9.67871)" fill="#BC98C9"/>
              <rect x="42.8584" width="4.49329" height="32.8356" transform="rotate(90 42.8584 0)" fill="#FF7086"/>
              <rect x="10.0229" width="4.49329" height="33.8725" fill="#FF7086"/>
              <rect x="10.0225" y="52.1919" width="4.49329" height="32.8356" transform="rotate(-90 10.0225 52.1919)" fill="#57F4AB"/>
              <rect x="42.8579" y="52.1919" width="4.49329" height="33.8725" transform="rotate(-180 42.8579 52.1919)" fill="#57F4AB"/>
            </svg>
          </div>

          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <Title level={2} style={{ marginTop: 16, color: "#080217" }}>
              Вітаємо на платформі ArtUA!
            </Title>
            <Text style={{ color: "#410c55" }}>
              Увійдіть в акаунт, щоб отримати доступ до ексклюзивних функцій та зберігати улюблені роботи.
            </Text>
          </div>

          <label htmlFor="email" style={{ display: "block", marginBottom: 8, color: "#000" }}>
            Email
          </label>
          <Row justify="center">
            <Col span={24} style={{ display: "flex", gap: "8px" }}>
              <Input
                id="email"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  paddingLeft: 10,
                  flexGrow: 1,
                  borderColor: "#5A189A",
                  height: 45,
                  color: "#000",
                }}
              />
            </Col>
          </Row>

          <label htmlFor="password" style={{ display: "block", marginBottom: 8, color: "#000", paddingTop: 10 }}>
            Пароль
          </label>
          <Row justify="center">
            <Col span={24} style={{ display: "flex", gap: "8px", width: "100%", position: "relative" }}>
              <Input.Password
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                visibilityToggle={{
                  visible: passwordVisible,
                  onVisibleChange: setPasswordVisible,
                }}
                iconRender={(visible) => (
                  <div
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 1,
                    }}
                  >
                    {visible ? <EyeOutlined /> : <EyeInvisibleOutlined />}
                  </div>
                )}
                style={{
                  paddingLeft: 10,
                  paddingRight: 40,
                  flexGrow: 1,
                  borderColor: "#5A189A",
                  height: 45,
                  color: "#000",
                  width: "100%",
                }}
                autoComplete="current-password"
              />
            </Col>
          </Row>
          <Row justify="center" style={{ marginTop: 8 }}>
            <Col span={24} style={{ textAlign: "center" }}>
              <Text
                style={{
                  color: "#410c55",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
                onClick={handleOpenForgotPassword}
              >
                Забули пароль?
              </Text>
            </Col>
          </Row>

          <Row justify="center" style={{ marginTop: 24 }}>
            <Col span={24}>
              <Button
                type="primary"
                onClick={handleLogin}
                loading={loading}
                style={{
                  width: "100%",
                  height: 45,
                  backgroundColor: "#000",
                  borderColor: "#D8B4E2",
                }}
              >
                Увійти
              </Button>
            </Col>
          </Row>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Text style={{ fontSize: 12, color: "#080217" }}>
              Натискаючи «Зареєструватися» або «Увійти за допомогою електронної пошти», ви погоджуєтеся з Правилами та умовами і Політикою конфіденційності сайту ArtUA, а також на отримання електронних листів від ArtUA.
            </Text>
          </div>

          <div data-svg-wrapper style={{ marginTop: 16 }}>
            <svg width="480" height="2" viewBox="0 0 480 2" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 1H480" stroke="#080217" />
            </svg>
          </div>

          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: 16 }}>
            <Text style={{ fontSize: 14, color: "#080217" }}>
              Ще не маєте акаунту?{" "}
              <span
                onClick={openRegisterModal}
                style={{
                  color: "#410C55",
                  fontWeight: "bold",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Зареєструйтесь!
              </span>
            </Text>
          </div>

          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              @keyframes slideIn {
                from { transform: translateY(-20px); }
                to { transform: translateY(0); }
              }
              div::-webkit-scrollbar {
                width: 8px;
              }
              div::-webkit-scrollbar-track {
                background: #f1f1f1;
                borderRadius: 4px;
              }
              div::-webkit-scrollbar-thumb {
                background: #888;
                borderRadius: 4px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: #555;
              }
            `}
          </style>
        </div>
      </div>

      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={handleCloseForgotPassword}
        email={email}
      />
    </>
  );
};

export default LoginModal;