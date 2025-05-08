import { CloseOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { Button, Col, Input, Row, Typography, message } from "antd";
import { useState, useEffect } from "react";

const { Title, Text } = Typography;

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (token: string) => void;
  openLoginModal: () => void;
}

const RegisterModal = ({ isOpen, onClose, onRegister, openLoginModal }: RegisterModalProps) => {
  if (!isOpen) return null;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

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

  const validatePassword = (password: string) => {
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);

    if (!hasSpecialChar) {
      return "Пароль повинен містити принаймні один спеціальний символ (!@#$%^&*(),.?\":{}|<>)";
    }
    if (!hasUpperCase) {
      return "Пароль повинен містити принаймні одну велику літеру";
    }
    return "";
  };

  const handleRegister = async () => {
    const passwordError = validatePassword(password);
    if (passwordError) {
      message.error(passwordError);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();

      const avatarPath = 'https://raw.githubusercontent.com/Reap4ick/someimg/refs/heads/main/Sample_User_Icon.png';
      const avatarResponse = await fetch(avatarPath);
      if (!avatarResponse.ok) {
        throw new Error("Не вдалося завантажити аватар");
      }
      const avatarBlob = await avatarResponse.blob();
      const avatarFile = new File([avatarBlob], 'avatar.png', { type: avatarBlob.type });

      formData.append("FirstName", firstName);
      formData.append("LastName", lastName);
      formData.append("Email", email);
      formData.append("Password", password);
      formData.append("Role", "Author");
      formData.append("Avatar", avatarFile);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        let errorMessages: any[] = [];

        if (errorData.errors) {
          errorMessages = Object.values(errorData.errors)
            .flat()
            .map((errorMessage) => translateError(errorMessage));
        }

        if (errorData.message) {
          const messageErrors = errorData.message
            .split(",")
            .map((msg: any) => translateError(msg));
          errorMessages = [...errorMessages, ...messageErrors];
        }

        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join("; "));
        }

        throw new Error("Помилка реєстрації");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      const savedToken = localStorage.getItem("token");
      if (savedToken !== data.token) {
        throw new Error("Помилка збереження токена в localStorage");
      }
      console.log("Token saved:", savedToken);
      onRegister(data.token);
      message.success("Успішна реєстрація!");
      onClose();
      setTimeout(() => {
        window.location.reload();
      }, 300);
    } catch (error) {
      console.error("Register error:", error);
      if (error instanceof Error) {
        message.error(error.message || "Помилка реєстрації");
      } else {
        message.error("Помилка реєстрації");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    document.body.style.overflow = "auto"; // Явне скидання overflow
    onClose();
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

        <label htmlFor="firstName" style={{ display: "block", marginBottom: 8, color: "#000" }}>
          Ім’я
        </label>
        <Row justify="center">
          <Col span={24} style={{ display: "flex", gap: "8px" }}>
            <Input
              id="firstName"
              placeholder="Ім’я"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
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

        <label htmlFor="lastName" style={{ display: "block", marginBottom: 8, color: "#000", paddingTop: 10 }}>
          Прізвище
        </label>
        <Row justify="center">
          <Col span={24} style={{ display: "flex", gap: "8px" }}>
            <Input
              id="lastName"
              placeholder="Прізвище"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
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

        <label htmlFor="email" style={{ display: "block", marginBottom: 8, color: "#000", paddingTop: 10 }}>
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
            />
          </Col>
        </Row>

        <Row justify="center" style={{ marginTop: 24 }}>
          <Col span={24}>
            <Button
              type="primary"
              onClick={handleRegister}
              loading={loading}
              style={{
                width: "100%",
                height: 45,
                backgroundColor: "#000",
                borderColor: "#D8B4E2",
              }}
            >
              Зареєструватись
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
            Уже маєте акаунт?{" "}
            <span
              onClick={openLoginModal}
              style={{
                color: "#410C55",
                fontWeight: "bold",
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Увійти!
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
  );
};

export default RegisterModal;

function translateError(_arg0: unknown) {
  throw new Error("Function not implemented.");
}