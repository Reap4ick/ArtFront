import "./style.css";
import { Disclosure } from "@headlessui/react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { HubConnectionBuilder, HubConnection, HubConnectionState, HttpTransportType } from "@microsoft/signalr";
import LoginModal from "../../LoginPage";
import RegisterModal from "../../RegisterPage";
import AccessModal from "../../../Modal";

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

interface Message {
  id: number;
  content: string;
  sentAt: string;
  senderId: string;
  isRead: boolean;
}

interface Participant {
  id: string;
  name: string;
  avatar?: string;
}

interface Conversation {
  id: number;
  participants: Participant[];
  lastMessage: Message | null;
  unreadCount: number;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

interface Product {
  id: number;
  name: string;
  images: string[];
}

// Navigation
const navigation = [
  { name: "Головна", href: "/", current: true },
  { name: "Що нового?", href: "/posts", current: false },
];

// Utility function to combine classes
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

// MessagesModal Component
const MessagesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  unreadMessagesCount: number;
  setUnreadMessagesCount: React.Dispatch<React.SetStateAction<number>>;
}> = ({ isOpen, onClose, setUnreadMessagesCount }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");
  const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const getCurrentUser = (): User | null => {
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return {
        id: decoded.sub,
        firstName: decoded.given_name,
        lastName: decoded.family_name,
        avatar: decoded.avatar,
      };
    } catch (error) {
      return null;
    }
  };

  const fetchUnreadMessagesCount = async () => {
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error("Не вдалося отримати бесіди");

      const conversations = await response.json();
      const totalUnread = conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
      setUnreadMessagesCount(totalUnread);
    } catch (error) {
      console.error("Помилка при отриманні непрочитаних повідомлень:", error);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedConv(null);
      if (hubConnection) {
        hubConnection.stop();
        setHubConnection(null);
      }
      return;
    }

    const loadConversations = async () => {
      try {
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) throw new Error("HTTP error: " + response.status);

        const data = await response.json();
        setConversations(data);
      } catch (err) {
        setError("Не вдалося завантажити бесіди");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [isOpen, token]);

  useEffect(() => {
    if (!selectedConv || !token) return;
  
    const connectToHub = async () => {
      const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build();
  
      try {
        await connection.start();
        await connection.invoke("JoinConversation", selectedConv);
  
        connection.on("ReceiveMessage", (newMessage: Message) => {
          setMessages((prev) => {
            if (prev.some((msg) => msg.id === newMessage.id)) {
              return prev;
            }
            return [...prev, newMessage];
          });
        });
  
        connection.on("MessagesRead", (readIds: number[]) => {
          setMessages((prev) =>
            prev.map((msg) => (readIds.includes(msg.id) ? { ...msg, isRead: true } : msg))
          );
          fetchUnreadMessagesCount();
        });
  
        setHubConnection(connection);
      } catch (error) {
        console.error("Помилка підключення:", error);
      }
    };
  
    const loadConversationData = async () => {
      try {
        setLoading(true);
  
        const messagesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId: selectedConv, token }),
        });
        const messagesData = await messagesRes.json();
  
        const conversation = conversations.find((c) => c.id === selectedConv);
        if (conversation) {
          const currentUser = getCurrentUser();
          const otherParticipant = conversation.participants.find((p) => p.id !== currentUser?.id);
          setParticipant(otherParticipant || null);
  
          if (conversation.unreadCount > 0) {
            setUnreadMessagesCount((prev) => Math.max(0, prev - conversation.unreadCount));
            setConversations((prev) =>
              prev.map((conv) =>
                conv.id === selectedConv ? { ...conv, unreadCount: 0 } : conv
              )
            );
          }
        }
  
        setMessages(messagesData);
      } catch (error) {
        console.error("Помилка завантаження:", error);
      } finally {
        setLoading(false);
      }
    };
  
    connectToHub();
    loadConversationData();
  
    return () => {
      if (hubConnection) {
        hubConnection.stop();
      }
    };
  }, [selectedConv, token, conversations]);

  const handleSendMessage = async () => {
    if (!selectedConv || !hubConnection || !messageInput.trim()) return;

    try {
      await hubConnection.invoke("SendMessage", selectedConv, messageInput);
      setMessageInput("");
    } catch (error) {
      console.error("Помилка відправки:", error);
    }
  };

  const handleBackToConversations = () => {
    setSelectedConv(null);
    setMessages([]);
    setParticipant(null);
    if (hubConnection) {
      hubConnection.stop();
      setHubConnection(null);
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const currentUser = getCurrentUser();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="w-[520px] h-[630px] bg-[#E6DFE7] rounded-lg relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#410C55] hover:text-[#080217] transition-colors z-10"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {selectedConv ? (
          <div className="h-full flex flex-col">
            <div className="w-full">
              <div className="flex items-start gap-3 p-4">
                <button onClick={handleBackToConversations} className="text-[#410C55] hover:text-[#080217]">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {participant && (
                  <>
                    <img
                      src={`${import.meta.env.VITE_API_URL}/images/${participant.avatar}`}
                      alt={participant.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="text-xl text-[#080217] mt-[5px]">
                      {participant.name}
                      <div className="flex items-center gap-2 text-sm">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            hubConnection?.state === HubConnectionState.Connected ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {hubConnection?.state === HubConnectionState.Connected ? "Онлайн" : "Офлайн"}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="w-full mt-1 border-t border-[#080217]" />
            </div>
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-[rgba(65,12,85,0.15)] mx-[13px] rounded">
              {loading ? (
                <div className="text-center text-[#410C55]">Завантаження...</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${message.senderId === currentUser?.id ? "text-right" : "text-left"}`}
                  >
                    <div
                      className={`inline-block p-2 rounded-lg ${
                        message.senderId === currentUser?.id
                          ? "bg-[#410C55] text-white rounded-br-none"
                          : "bg-[#BC98C9] text-[#080217] rounded-bl-none"
                      }`}
                    >
                      {message.content}
                    </div>
                    <div
                      className={`text-xs mt-1 ${
                        message.senderId === currentUser?.id ? "text-[#BC98C9]" : "text-[#410C55]"
                      }`}
                    >
                      {new Date(message.sentAt).toLocaleTimeString("uk-UA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {message.senderId === currentUser?.id && (
                        <span className="ml-2">{message.isRead ? "✓✓" : "✓"}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-[#080217]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Напишіть повідомлення..."
                  className="flex-1 p-2 border border-[#410C55] rounded-lg"
                  style={{ color: "black" }}
                  disabled={!hubConnection || hubConnection.state !== HubConnectionState.Connected}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!hubConnection || hubConnection.state !== HubConnectionState.Connected}
                  className="p-2 bg-[#410C55] text-white rounded-lg hover:bg-[#2D0A3A]"
                >
                  Надіслати
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-[#080217]">
              <h2 className="text-xl text-[#080217] font-medium">Повідомлення</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center text-[#410C55]">Завантаження...</div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => setSelectedConv(conv.id)}
                    className="p-4 hover:bg-[#d8c3dd] cursor-pointer border-b border-[#e6dfe7]"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={`${import.meta.env.VITE_API_URL}/images/${conv.participants[0]?.avatar}`}
                        className="w-12 h-12 rounded-full object-cover"
                        alt={conv.participants[0]?.name}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <h3 className="text-[#080217] font-medium">{conv.participants[0]?.name}</h3>
                          <span className="text-sm text-[#410C55]">
                            {conv.lastMessage?.sentAt && new Date(conv.lastMessage.sentAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[#410C55] text-sm truncate">
                          {conv.lastMessage?.content || "Немає повідомлень"}
                        </p>
                      </div>
                      {conv.unreadCount > 0 && (
                        <div className="bg-[#FF7086] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          {conv.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// DropdownMenu Component
const DropdownMenu: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Токен не знайдено");

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error("Помилка отримання профілю: " + errorData.message);
        }

        const data: ProfileData = await response.json();
        setProfileData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Невідома помилка");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  if (loading) return <div>Завантаження...</div>;
  if (error) return <div>Помилка: {error}</div>;

  return (
    <nav className="profile-dropdown">
      <div className="bg-white rounded-lg w-52">
        <div className="p-2">
          {profileData && (
            <Link to="/profile" className="flex flex-row flex-wrap items-center gap-2">
              <img
                src={`${import.meta.env.VITE_API_URL}/images/${profileData.avatar}`}
                alt={`${profileData.firstName} ${profileData.lastName}`}
                className="w-14 h-14 rounded-full object-cover flex-shrink-0"
              />
              <div className="flex flex-col min-w-[100px]">
                <div className="text-[#BC98C9] font-medium break-words">
                  {profileData.firstName} {profileData.lastName}
                </div>
                <div className="text-[#080217] text-sm hidden xs:block">Мій акаунт</div>
              </div>
            </Link>
          )}
          <div className="border-t my-2 border-[#FF7086]" />
          <Link to="/Messenger" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded" onClick={onClose}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M6.25009 7C6.25009 7.19891 6.32911 7.38968 6.46976 7.53033C6.61041 7.67098 6.80118 7.75 7.00009 7.75C7.199 7.75 7.38977 7.67098 7.53042 7.53033C7.67107 7.38968 7.75009 7.19891 7.75009 7C7.75009 6.80109 7.67107 6.61032 7.53042 6.46967C7.38977 6.32902 7.199 6.25 7.00009 6.25C6.80118 6.25 6.61041 6.32902 6.46976 6.46967C6.32911 6.61032 6.25009 6.80109 6.25009 7ZM9.37509 7C9.37509 7.19891 9.45411 7.38968 9.59476 7.53033C9.73541 7.67098 9.92618 7.75 10.1251 7.75C10.324 7.75 10.5148 7.67098 10.6554 7.53033C10.7961 7.38968 10.8751 7.19891 10.8751 7C10.8751 6.80109 10.7961 6.61032 10.6554 6.46967C10.5148 6.32902 10.324 6.25 10.1251 6.25C9.92618 6.25 9.73541 6.32902 9.59476 6.46967C9.45411 6.61032 9.37509 6.80109 9.37509 7ZM3.12509 7C3.12509 7.19891 3.20411 7.38968 3.34476 7.53033C3.48541 7.67098 3.67618 7.75 3.87509 7.75C4.074 7.75 4.26477 7.67098 4.40542 7.53033C4.54607 7.38968 4.62509 7.19891 4.62509 7C4.62509 6.80109 4.54607 6.61032 4.40542 6.46967C4.26477 6.32902 4.074 6.25 3.87509 6.25C3.67618 6.25 3.48541 6.32902 3.34476 6.46967C3.20411 6.61032 3.12509 6.80109 3.12509 7ZM13.4563 4.2875C13.1032 3.44844 12.597 2.69531 11.9517 2.04844C11.3109 1.40531 10.5501 0.894096 9.71259 0.54375C8.85321 0.182813 7.94071 0 7.00009 0H6.96884C6.02196 0.0046875 5.10478 0.192188 4.24228 0.560938C3.4119 0.914877 2.65831 1.427 2.02353 2.06875C1.38446 2.71406 0.882901 3.46406 0.536026 4.3C0.176651 5.16563 -0.00459886 6.08594 8.86448e-05 7.03281C0.0053906 8.11792 0.262107 9.18704 0.750089 10.1562V12.5312C0.750089 12.7219 0.825814 12.9047 0.960606 13.0395C1.0954 13.1743 1.27821 13.25 1.46884 13.25H3.8454C4.81461 13.738 5.88373 13.9947 6.96884 14H7.00165C7.93759 14 8.8454 13.8188 9.70009 13.4641C10.5334 13.1179 11.2913 12.6126 11.9313 11.9766C12.5767 11.3375 13.0845 10.5906 13.4392 9.75781C13.8079 8.89531 13.9954 7.97813 14.0001 7.03125C14.0048 6.07969 13.8204 5.15625 13.4563 4.2875ZM11.0954 11.1313C10.0001 12.2156 8.54696 12.8125 7.00009 12.8125H6.97353C6.03134 12.8078 5.0954 12.5734 4.26884 12.1328L4.13759 12.0625H1.93759V9.8625L1.86728 9.73125C1.42665 8.90469 1.19228 7.96875 1.18759 7.02656C1.18134 5.46875 1.77665 4.00625 2.86884 2.90469C3.95946 1.80312 5.41728 1.19375 6.97509 1.1875H7.00165C7.7829 1.1875 8.54071 1.33906 9.25478 1.63906C9.95165 1.93125 10.5767 2.35156 11.1142 2.88906C11.6501 3.425 12.072 4.05156 12.3642 4.74844C12.6673 5.47031 12.8188 6.23594 12.8157 7.02656C12.8063 8.58281 12.1954 10.0406 11.0954 11.1313Z"
                fill="#BC98C9"
              />
            </svg>
            <span className="text-[#BC98C9] font-medium">Мої чати</span>
          </Link>
          <Link to="/Setting" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded" onClick={onClose}>
            <img
              src="https://cdn.builder.io/api/v1/image/assets/c30e2b7059da48629502fd3deaf9307c/d0f4561a8e6aed36fbda79512873dffa87664f558c3db59cfe015dae088a39ae"
              alt="Settings"
              className="w-4 h-4"
            />
            <span className="text-[#BC98C9] font-medium">Налаштування</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 p-2 hover:bg-gray-100 rounded text-[#080217]"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets/c30e2b7059da48629502fd3deaf9307c/4600a26852b60d9f8c60e33fb6852e92cff36aeab848f8753701b3aa843d1a4d"
              alt="Logout"
              className="w-4 h-4"
            />
            <span>Вийти</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

// MobileNotSupported Component
const MobileNotSupported: React.FC = () => {
  return (
    <div className="relative min-h-screen flex items-center justify-center">
      <div className="animated-bg">
        <div className="firefly firefly-1"></div>
        <div className="firefly firefly-2"></div>
      </div>
      <div className="relative z-10 text-center p-4">
        <h1 className="text-3xl font-bold text-[#e6dfe7] mb-4">Вибачте!</h1>
        <p className="text-lg text-[#e6dfe7] mb-6">
          Цей сайт тимчасово недоступний на мобільних пристроях. Будь ласка, використовуйте комп'ютерну версію.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-2 bg-[#ff7086] text-white rounded-md hover:bg-[#e65c73]"
        >
          Повернутися на головну
        </Link>
      </div>
    </div>
  );
};

// SearchInput Component
const SearchInput: React.FC<{
  onSearch: (query: string) => void;
  setIsRegisterModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsAccessModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLoggedIn: boolean;
}> = ({ onSearch, setIsRegisterModalOpen, setIsAccessModalOpen, isLoggedIn }) => {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchResults = async () => {
      if (query.trim() === "") {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/products/search?query=${encodeURIComponent(query)}&page=1&pageSize=5`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          }
        );

        if (!response.ok) throw new Error("Не вдалося отримати результати пошуку");

        const data = await response.json();
        setResults(data.items);
      } catch (err) {
        setError("Помилка при пошуку");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, token]);

  const handleSelectProduct = (productId: number) => {
    if (!token) {
      setIsRegisterModalOpen(true);
    } else {
      navigate(`/product/${productId}`);
    }
    setIsFocused(false);
  };

  const handleFocus = () => {
    if (!isLoggedIn) {
      setIsAccessModalOpen(true);
    } else {
      setIsFocused(true);
    }
  };

  return (
    <div className="relative">
      <input
        style={{ color: "white" }}
        type="text"
        placeholder="Пошук..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          onSearch(e.target.value);
        }}
        onFocus={handleFocus}
        onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        className="w-full px-4 py-2 border-2 border-[#bc98c9] rounded-md bg-transparent text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#bc98c9]"
      />
      {isFocused && query.trim() !== "" && (
        <div className="absolute top-full left-0 w-full bg-white shadow-lg rounded-md mt-1 z-50 max-h-[300px] overflow-y-auto">
          {loading && <div className="p-2 text-center text-[#410C55]">Завантаження...</div>}
          {error && <div className="p-2 text-red-500">{error}</div>}
          {!loading && !error && results.length === 0 && (
            <div className="p-2 text-center text-[#410C55]">Нічого не знайдено</div>
          )}
          {!loading && !error && results.length > 0 && (
            <ul className="divide-y divide-gray-200">
              {results.map((product) => (
                <li
                  key={product.id}
                  onClick={() => handleSelectProduct(product.id)}
                  className="flex items-center p-2 hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  {product.images.length > 0 && (
                    <img
                      src={`${import.meta.env.VITE_API_URL}/images/${product.images[0]}`}
                      alt={product.name}
                      className="w-10 h-10 object-cover rounded-md mr-3"
                    />
                  )}
                  <span className="text-gray-700 text-sm">{product.name}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

// MainLayout Component
const MainLayout: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMessagesModalOpen, setMessagesModalOpen] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const [likedCount, setLikedCount] = useState(0);
  const [, setHubConnection] = useState<HubConnection | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
    setIsAccessModalOpen(false);
    setMessagesModalOpen(false);
  };
  
  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
    setIsAccessModalOpen(false);
    setMessagesModalOpen(false);
  };

  const checkProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsLoggedIn(false);
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/user/profile`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Invalid token");
      }

      setIsLoggedIn(true);
    } catch (error) {
      console.error("Помилка перевірки профілю:", error);
      localStorage.removeItem("token");
      setIsLoggedIn(false);
      setIsRegisterModalOpen(true);
    }
  };

  const fetchUnreadMessagesCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations/list`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error("Не вдалося отримати бесіди");

      const conversations = await response.json();
      const totalUnread = conversations.reduce((sum: number, conv: Conversation) => sum + conv.unreadCount, 0);
      setUnreadMessagesCount(totalUnread);
    } catch (error) {
      console.error("Помилка при отриманні непрочитаних повідомлень:", error);
    }
  };

  const fetchLikedCount = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ProductInteractions/user-liked-products?page=1&pageSize=1`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Token: token }),
        }
      );

      if (!response.ok) throw new Error("Не вдалося отримати кількість лайкнутих робіт");

      const data = await response.json();
      setLikedCount(data.totalItems || 0);
    } catch (error) {
      console.error("Помилка при отриманні кількості лайкнутих робіт:", error);
    }
  };

  useEffect(() => {
    checkProfile();
    if (isLoggedIn) {
      fetchUnreadMessagesCount();
      fetchLikedCount();
    }

    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor;
      const isMobileDevice = /android|iphone|ipad|ipod|windows phone/i.test(userAgent);
      const isSmallScreen = window.innerWidth <= 768;
      setIsMobile(isMobileDevice || isSmallScreen);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, [isLoggedIn]);

  // SignalR for real-time updates
  useEffect(() => {
    if (!isLoggedIn) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const connection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`, {
        accessTokenFactory: () => token,
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => {
        console.log("SignalR Connected");
      })
      .catch((err) => console.error("SignalR Connection Error:", err));

    connection.on("NewMessageNotification", (conversationId: number) => {
      console.log(`New message in conversation ${conversationId}`);
      fetchUnreadMessagesCount();
    });

    connection.on("LikeUpdateNotification", (productId: number, isLiked: boolean) => {
      console.log(`Like updated for product ${productId}: ${isLiked}`);
      fetchLikedCount();
    });

    connection.on("MessagesRead", (messageIds: number[]) => {
      console.log(`Messages marked as read: ${messageIds}`);
    });

    setHubConnection(connection);

    return () => {
      connection.stop();
    };
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleProfileDropdown = () => {
    setProfileDropdownOpen(!isProfileDropdownOpen);
  };

  const handlePostsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setIsAccessModalOpen(true);
    }
  };

  const handleWorksClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setIsAccessModalOpen(true);
    }
  };

  if (isMobile) {
    return <MobileNotSupported />;
  }

  return (
    <div className="min-h-full">
      <Disclosure as="nav" className="bg-transparent">
        {({ }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between space-x-4">
                <div className="flex-shrink-0">
                  <Link to="/">
                  <svg width="82" height="94" viewBox="0 0 82 94" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10.8484 78.9785V78.5308C10.8895 78.5102 11.0027 78.4587 11.188 78.3764C11.3835 78.2941 11.5482 78.222 11.682 78.1603C11.8261 78.0882 11.929 78.0213 11.9907 77.9596L16.0971 68.1722H17.3321L21.4385 78.0213C21.5105 78.0831 21.6186 78.1448 21.7626 78.2066C21.9067 78.2683 22.0662 78.3301 22.2412 78.3918C22.4265 78.4536 22.5551 78.4999 22.6271 78.5308V78.9785H18.2738V78.5308C18.3355 78.4999 18.5362 78.4381 18.8758 78.3455C19.2155 78.2426 19.4316 78.1551 19.5242 78.0831L18.598 75.8447H13.766L12.8552 78.0213C12.917 78.0831 13.0251 78.1448 13.1794 78.2066C13.3338 78.2683 13.5036 78.3301 13.6889 78.3918C13.8844 78.4536 14.0182 78.4999 14.0902 78.5308V78.9785H10.8484ZM18.2738 75.0728L16.1897 70.0247L14.0902 75.0728H18.2738ZM23.2058 78.9785V78.5308C23.247 78.5102 23.4477 78.4433 23.8079 78.3301C24.1681 78.2066 24.3945 78.1037 24.4871 78.0213V69.1294C24.3945 69.047 24.1681 68.9493 23.8079 68.8361C23.4477 68.7126 23.247 68.6405 23.2058 68.6199V68.1722H28.2693C29.4117 68.1722 30.3173 68.4347 30.9863 68.9596C31.6655 69.4844 32.0051 70.1637 32.0051 70.9973C32.0051 71.6148 31.8147 72.1654 31.434 72.6491C31.0635 73.1225 30.5437 73.4827 29.8748 73.7297L32.1441 78.0368C32.2367 78.1191 32.4734 78.2169 32.8542 78.3301C33.235 78.433 33.4511 78.4999 33.5026 78.5308V78.9785H30.801L30.3842 78.5616L27.9914 74.0539H26.3087V77.9905C26.3911 78.0728 26.6381 78.1809 27.0497 78.3146C27.4614 78.4381 27.693 78.5102 27.7444 78.5308V78.9785H23.2058ZM30.1527 71.2289C30.1527 70.5599 29.9365 70.0144 29.5043 69.5925C29.0823 69.1705 28.5523 68.9596 27.9142 68.9596H26.3087V73.2666H28.0995C28.6861 73.2666 29.1749 73.0865 29.566 72.7263C29.9571 72.3558 30.1527 71.8566 30.1527 71.2289ZM36.1433 78.9785V78.5308C36.1845 78.5102 36.3852 78.4433 36.7454 78.3301C37.1056 78.2066 37.332 78.1037 37.4247 78.0213V68.9596H35.0318C34.7437 69.7623 34.4452 70.4055 34.1365 70.8892H33.7351C33.6836 70.8892 33.6322 70.6525 33.5807 70.1791C33.5396 69.7057 33.519 69.2992 33.519 68.9596V68.1722H43.1519V68.9596C43.1519 69.2992 43.1262 69.7057 43.0748 70.1791C43.0336 70.6525 42.9873 70.8892 42.9358 70.8892H42.519C42.2617 70.4776 41.9633 69.8343 41.6236 68.9596H39.2463V78.0213C39.3286 78.1037 39.5499 78.2066 39.9101 78.3301C40.2703 78.4433 40.471 78.5102 40.5121 78.5308V78.9785H36.1433ZM58.8764 68.1722V68.6199C58.8044 68.6508 58.6706 68.7023 58.4751 68.7743C58.2795 68.8361 58.0994 68.903 57.9347 68.975C57.7804 69.0367 57.6672 69.0985 57.5951 69.1602V75.1654C57.5951 76.2975 57.1937 77.2392 56.391 77.9905C55.5882 78.7315 54.5334 79.102 53.2263 79.102C51.9399 79.102 50.9056 78.7366 50.1234 78.0059C49.3515 77.2752 48.9656 76.3541 48.9656 75.2426V69.1294C48.8833 69.047 48.662 68.9493 48.3018 68.8361C47.9416 68.7126 47.7409 68.6405 47.6997 68.6199V68.1722H52.0685V68.6199C52.0273 68.6405 51.8267 68.7126 51.4665 68.8361C51.1062 68.9493 50.8798 69.047 50.7872 69.1294V74.9493C50.7872 75.9167 51.0651 76.6783 51.6208 77.234C52.1869 77.7795 52.9021 78.0522 53.7666 78.0522C54.6208 78.0522 55.3207 77.7898 55.8661 77.2649C56.4116 76.7297 56.6843 76.035 56.6843 75.1808V69.1602C56.602 69.0779 56.3756 68.9698 56.0051 68.8361C55.6449 68.7023 55.4493 68.6302 55.4184 68.6199V68.1722H58.8764ZM58.2914 78.9785V78.5308C58.3325 78.5102 58.4457 78.4587 58.631 78.3764C58.8265 78.2941 58.9912 78.222 59.125 78.1603C59.2691 78.0882 59.372 78.0213 59.4337 77.9596L63.5401 68.1722H64.7751L68.8815 78.0213C68.9535 78.0831 69.0616 78.1448 69.2056 78.2066C69.3497 78.2683 69.5092 78.3301 69.6842 78.3918C69.8694 78.4536 69.9981 78.4999 70.0701 78.5308V78.9785H65.7168V78.5308C65.7785 78.4999 65.9792 78.4381 66.3188 78.3455C66.6585 78.2426 66.8746 78.1551 66.9672 78.0831L66.041 75.8447H61.209L60.2982 78.0213C60.36 78.0831 60.468 78.1448 60.6224 78.2066C60.7768 78.2683 60.9466 78.3301 61.1319 78.3918C61.3274 78.4536 61.4612 78.4999 61.5332 78.5308V78.9785H58.2914ZM65.7168 75.0728L63.6327 70.0247L61.5332 75.0728H65.7168Z" fill="#E6DFE7"/>
                  <rect x="32.6562" y="27.7762" width="14.151" height="13.8294" fill="#410C55"/>
                  <rect x="15.6111" y="19.7359" width="4.18097" height="30.5533" fill="#BC98C9"/>
                  <rect x="15.6111" y="50.2889" width="4.18097" height="31.5181" transform="rotate(-90 15.6111 50.2889)" fill="#BC98C9"/>
                  <rect x="64.1753" y="50.2895" width="4.18097" height="30.5533" transform="rotate(180 64.1753 50.2895)" fill="#BC98C9"/>
                  <rect x="64.1753" y="19.7366" width="4.18097" height="31.5181" transform="rotate(90 64.1753 19.7366)" fill="#BC98C9"/>
                  <rect x="55.4905" y="10.7306" width="4.18097" height="30.5533" transform="rotate(90 55.4905 10.7306)" fill="#FF7086"/>
                  <rect x="24.9375" y="10.7306" width="4.18097" height="31.5181" fill="#FF7086"/>
                  <rect x="24.9368" y="59.2948" width="4.18097" height="30.5533" transform="rotate(-90 24.9368 59.2948)" fill="#57F4AB"/>
                  <rect x="55.4897" y="59.2948" width="4.18097" height="31.5181" transform="rotate(-180 55.4897 59.2948)" fill="#57F4AB"/>
                  </svg>

                  </Link>
                </div>
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={item.name === "Що нового?" ? handlePostsClick : undefined}
                        className={classNames(
                          item.current ? "text-[#bc98c9] font-semibold" : "text-gray-700 hover:text-[#bc98c9]",
                          "px-3 py-2 text-sm font-medium"
                        )}
                        aria-current={item.current ? "page" : undefined}
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
                <div className="flex-grow max-w-[300px] mx-4">
                  <SearchInput
                    onSearch={(query) => console.log("Пошук:", query)}
                    setIsRegisterModalOpen={setIsRegisterModalOpen}
                    setIsAccessModalOpen={setIsAccessModalOpen}
                    isLoggedIn={isLoggedIn}
                  />
                </div>
                <div className="relative">
                  <button
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-[#bc98c9] focus:outline-none"
                    onClick={toggleDropdown}
                  >
                    Інформація ▼
                  </button>
                  {isDropdownOpen && (
                    <div
                      ref={dropdownRef}
                      className="absolute right-0 mt-2 bg-white border border-[#bc98c9] rounded-md shadow-lg w-48 z-50"
                    >
                      <ul className="py-1 text-sm text-gray-700">
                        <li>
                          <Link to="/AboutArtUA" className="block px-4 py-2 hover:bg-[#ff7086] hover:text-white">
                            Про ArtUA
                          </Link>
                        </li>
                        <li>
                          <Link to="/customers" className="block px-4 py-2 hover:bg-[#ff7086] hover:text-white">
                            Покупцям
                          </Link>
                        </li>
                        <li>
                          <Link to="/artists" className="block px-4 py-2 hover:bg-[#ff7086] hover:text-white">
                            Митцям
                          </Link>
                        </li>
                        <li>
                          <Link to="/Policies" className="block px-4 py-2 hover:bg-[#ff7086] hover:text-white">
                            Політика
                          </Link>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                {!isLoggedIn ? (
                  <div className="flex space-x-4 items-center">
                    <button
                      className="text-white bg-[#ff7086] px-4 py-2 rounded-md"
                      onClick={() => openRegisterModal()}
                    >
                      Зареєструватись
                    </button>
                    <span className="text-gray-500">або</span>
                    <button
                      className="border border-gray-500 text-gray-500 px-4 py-2 rounded-md hover:text-white hover:bg-gray-500"
                      onClick={() => openLoginModal()}
                    >
                      Увійти
                    </button>
                  </div>
                ) : (
                  <div className="relative flex items-center gap-2" ref={profileDropdownRef}>
                    <button
                      onClick={() => setMessagesModalOpen(true)}
                      className="p-2 hover:bg-gray-100 rounded-full relative"
                    >
                      <svg width="29" height="23" viewBox="0 0 29 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M27.125 0.854492H1.125C0.571875 0.854492 0.125 1.30137 0.125 1.85449V21.8545C0.125 22.4076 0.571875 22.8545 1.125 22.8545H27.125C27.6781 22.8545 28.125 22.4076 28.125 21.8545V1.85449C28.125 1.30137 27.6781 0.854492 27.125 0.854492ZM25.875 4.31699V20.6045H2.375V4.31699L1.5125 3.64512L2.74062 2.06699L4.07812 3.10762H24.175L25.5125 2.06699L26.7406 3.64512L25.875 4.31699ZM24.175 3.10449L14.125 10.917L4.075 3.10449L2.7375 2.06387L1.50938 3.64199L2.37187 4.31387L13.0469 12.6139C13.3539 12.8524 13.7316 12.9818 14.1203 12.9818C14.5091 12.9818 14.8868 12.8524 15.1938 12.6139L25.875 4.31699L26.7375 3.64512L25.5094 2.06699L24.175 3.10449Z"
                          fill="#E6DFE7"
                        />
                      </svg>
                      {unreadMessagesCount > 0 && (
                        <div className="notification-badge">{unreadMessagesCount}</div>
                      )}
                    </button>
                    <button
                      onClick={() => navigate("/profile?tab=favorites")}
                      className="p-2 hover:bg-gray-100 rounded-full relative"
                    >
                      <svg width="28" height="25" viewBox="0 0 28 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M26.9688 5.71604C26.5499 4.74615 25.9459 3.86725 25.1906 3.12854C24.4348 2.38762 23.5436 1.79882 22.5656 1.39416C21.5515 0.972891 20.4638 0.75726 19.3656 0.759788C17.825 0.759788 16.3219 1.18166 15.0156 1.97854C14.7031 2.16916 14.4062 2.37854 14.125 2.60666C13.8438 2.37854 13.5469 2.16916 13.2344 1.97854C11.9281 1.18166 10.425 0.759788 8.88437 0.759788C7.775 0.759788 6.7 0.972288 5.68437 1.39416C4.70312 1.80041 3.81875 2.38479 3.05937 3.12854C2.30311 3.86642 1.69899 4.74553 1.28125 5.71604C0.846875 6.72541 0.625 7.79729 0.625 8.90041C0.625 9.94104 0.8375 11.0254 1.25938 12.1285C1.6125 13.0504 2.11875 14.0067 2.76562 14.9723C3.79063 16.5004 5.2 18.0942 6.95 19.7098C9.85 22.3879 12.7219 24.2379 12.8438 24.3129L13.5844 24.7879C13.9125 24.9973 14.3344 24.9973 14.6625 24.7879L15.4031 24.3129C15.525 24.2348 18.3937 22.3879 21.2969 19.7098C23.0469 18.0942 24.4563 16.5004 25.4813 14.9723C26.1281 14.0067 26.6375 13.0504 26.9875 12.1285C27.4094 11.0254 27.6219 9.94104 27.6219 8.90041C27.625 7.79729 27.4031 6.72541 26.9688 5.71604ZM14.125 22.316C14.125 22.316 3 15.1879 3 8.90041C3 5.71604 5.63437 3.13479 8.88437 3.13479C11.1687 3.13479 13.15 4.40979 14.125 6.27229C15.1 4.40979 17.0813 3.13479 19.3656 3.13479C22.6156 3.13479 25.25 5.71604 25.25 8.90041C25.25 15.1879 14.125 22.316 14.125 22.316Z"
                          fill="#E6DFE7"
                        />
                      </svg>
                      {likedCount > 0 && (
                        <div className="notification-badge">{likedCount > 10 ? "9+" : likedCount}</div>
                      )}
                    </button>
                    <button
                      onClick={toggleProfileDropdown}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <svg width="33" height="33" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M26.9522 24.717C26.3627 23.3207 25.5073 22.0523 24.4335 20.9826C23.363 19.9098 22.0948 19.0545 20.6991 18.4639C20.6866 18.4576 20.6741 18.4545 20.6616 18.4482C22.6085 17.042 23.8741 14.7514 23.8741 12.167C23.8741 7.88574 20.4054 4.41699 16.1241 4.41699C11.8429 4.41699 8.3741 7.88574 8.3741 12.167C8.3741 14.7514 9.63973 17.042 11.5866 18.4514C11.5741 18.4576 11.5616 18.4607 11.5491 18.467C10.1491 19.0576 8.89285 19.9045 7.81473 20.9857C6.74194 22.0563 5.88662 23.3244 5.29598 24.7201C4.71573 26.0865 4.4028 27.5515 4.3741 29.0357C4.37327 29.0691 4.37912 29.1023 4.39131 29.1333C4.4035 29.1644 4.42178 29.1927 4.44508 29.2166C4.46838 29.2405 4.49622 29.2594 4.52696 29.2724C4.55771 29.2853 4.59074 29.292 4.6241 29.292H6.4991C6.6366 29.292 6.74598 29.1826 6.7491 29.0482C6.8116 26.6357 7.78035 24.3764 9.49285 22.6639C11.2647 20.892 13.6179 19.917 16.1241 19.917C18.6304 19.917 20.9835 20.892 22.7554 22.6639C24.4679 24.3764 25.4366 26.6357 25.4991 29.0482C25.5022 29.1857 25.6116 29.292 25.7491 29.292H27.6241C27.6575 29.292 27.6905 29.2853 27.7212 29.2724C27.752 29.2594 27.7798 29.2405 27.8031 29.2166C27.8264 29.1927 27.8447 29.1644 27.8569 29.1333C27.8691 29.1023 27.8749 29.0691 27.8741 29.0357C27.8429 27.542 27.5335 26.0889 26.9522 24.717ZM16.1241 17.542C14.6897 17.542 13.3397 16.9826 12.3241 15.967C11.3085 14.9514 10.7491 13.6014 10.7491 12.167C10.7491 10.7326 11.3085 9.38262 12.3241 8.36699C13.3397 7.35137 14.6897 6.79199 16.1241 6.79199C17.5585 6.79199 18.9085 7.35137 19.9241 8.36699C20.9397 9.38262 21.4991 10.7326 21.4991 12.167C21.4991 13.6014 20.9397 14.9514 19.9241 15.967C18.9085 16.9826 17.5585 17.542 16.1241 17.542Z"
                          fill="#E6DFE7"
                        />
                      </svg>
                    </button>
                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 z-50">
                        <DropdownMenu onClose={() => setProfileDropdownOpen(false)} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="border-b-2 border-[#bc98c9] mt-0"></div>
          </>
        )}
      </Disclosure>

      <main>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-4">
          <Outlet />
        </div>
      </main>

            {/* Footer */}
            <footer className="footer bg-transparent z-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row justify-between gap-12">
              <div className="flex flex-col sm:flex-row gap-12 sm:gap-24">
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#bc98c8] text-xl font-normal font-['Gotham'] leading-7">Покупцям</h3>
                  <Link to="/customers" className="text-[#e6dfe7] text-base font-normal font-['Gotham'] leading-normal hover:underline">
                    Як зробити покупку?
                  </Link>
                  <Link to="/customers" className="text-[#e6dfe7] text-base font-normal font-['Gotham'] leading-normal hover:underline">
                    Які правила покупки?
                  </Link>
                  <Link to="/customers" className="text-[#e6dfe7] text-base font-normal font-['Gotham'] leading-normal hover:underline">
                    Повернення
                  </Link>
                  <Link to="/customers" className="text-[#e6dfe7] text-base font-normal font-['Gotham'] leading-normal hover:underline">
                    Інші питання..
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#bc98c8] text-xl font-normal font-['Gotham'] leading-7">Художникам</h3>
                  <Link to="/artists" className="text-[#e6dfe7] text-base font-normal font-['Gotham'] leading-normal hover:underline">
                    Умови співпраці
                  </Link>
                </div>
                <div className="flex flex-col gap-4">
                  <h3 className="text-[#bc98c8] text-xl font-normal font-['Gotham'] leading-7">Інформація</h3>
                  <Link to="/Policies" className="text-[#e6dfe7] text-base font-normal font-['Gotham'] leading-normal hover:underline">
                    Політика конфіденційності...
                  </Link>
                  <Link to="/Policies" className="text-[#e6dfe7] text-base font-normal font-['Gotham'] leading-normal hover:underline">
                    Умови використання сайту...
                  </Link>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Link to="/AboutArtUA" className="text-[#bc98c8] text-xl font-normal font-['Gotham'] underline leading-7">
                  Про нас
                </Link>
                <Link to="/posts" onClick={handleWorksClick} className="text-[#bc98c8] text-xl font-normal font-['Gotham'] underline leading-7">
                Роботи
              </Link>
              </div>
            </div>
            <div className="mt-12 flex flex-col lg:flex-row justify-between items-center gap-6 border-t border-[#bc98c8] pt-6">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-[60px] h-[72.25px]">
                  <svg width="82" height="95" viewBox="0 0 82 95" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="32.6562" y="28.4243" width="14.151" height="13.8294" fill="#410C55" />
                    <rect x="15.6108" y="20.3843" width="4.18097" height="30.5533" fill="#BC98C9" />
                    <rect x="15.6108" y="50.9375" width="4.18097" height="31.5181" transform="rotate(-90 15.6108 50.9375)" fill="#BC98C9" />
                    <rect x="64.1753" y="50.9375" width="4.18097" height="30.5533" transform="rotate(180 64.1753 50.9375)" fill="#BC98C9" />
                    <rect x="64.1753" y="20.3848" width="4.18097" height="31.5181" transform="rotate(90 64.1753 20.3848)" fill="#BC98C9" />
                    <rect x="55.4902" y="11.3789" width="4.18097" height="30.5533" transform="rotate(90 55.4902 11.3789)" fill="#FF7086" />
                    <rect x="24.937" y="11.3789" width="4.18097" height="31.5181" fill="#FF7086" />
                    <rect x="24.937" y="59.9429" width="4.18097" height="30.5533" transform="rotate(-90 24.937 59.9429)" fill="#57F4AB" />
                    <rect x="55.4897" y="59.9429" width="4.18097" height="31.5181" transform="rotate(-180 55.4897 59.9429)" fill="#57F4AB" />
                  </svg>
                </div>
                <div className="w-[377px] text-[#e6dfe7] text-base font-medium font-['Gotham'] leading-normal text-center sm:text-left">
                  Місце сили для українських митців, де культура знаходить підтримку і натхнення.
                </div>
              </div>
              <div className="max-w-lg text-[#bc98c8] text-sm font-normal font-['Gotham'] leading-snug text-center mx-auto">
                © 2024 ArtUA. Усі права захищені.
                <br />
                Використання матеріалів сайту можливе лише з письмової згоди адміністрації.
              </div>
              <div className="flex items-center gap-4">
                <div className="w-[53px] h-[53px] relative">
                  <div className="w-[53px] h-[53px] left-0 top-0 absolute bg-[#410c55] rounded-full" />
                  <div data-svg-wrapper className="left-[11px] top-[11px] absolute">
                    <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M21.5656 11.9299C21.75 11.9299 21.9344 11.9361 22.1156 11.9455C21.3531 7.92363 17.1688 4.84863 12.1188 4.84863C6.53125 4.84863 2 8.61738 2 13.2674C2 15.8018 3.3625 18.0861 5.49688 19.6299C5.58491 19.692 5.6567 19.7744 5.7062 19.8702C5.75569 19.9659 5.78143 20.0721 5.78125 20.1799C5.78125 20.2549 5.76563 20.3236 5.74688 20.3955C5.575 21.0299 5.30313 22.0455 5.29063 22.0924C5.26875 22.1736 5.2375 22.2549 5.2375 22.3393C5.2375 22.5236 5.3875 22.6768 5.575 22.6768C5.64688 22.6768 5.70625 22.6486 5.76875 22.6143L7.98438 21.3361C8.15 21.2393 8.32813 21.1799 8.52188 21.1799C8.62188 21.1799 8.72188 21.1955 8.81875 21.2236C9.85313 21.5205 10.9688 21.6861 12.1219 21.6861C12.3094 21.6861 12.4938 21.683 12.6781 21.6736C12.4563 21.0174 12.3375 20.3268 12.3375 19.6111C12.3375 15.3674 16.4688 11.9299 21.5656 11.9299ZM15.4938 9.22676C16.2375 9.22676 16.8438 9.82988 16.8438 10.5736C16.8438 11.3174 16.2406 11.9205 15.4938 11.9205C14.75 11.9205 14.1438 11.3174 14.1438 10.5736C14.1438 9.82988 14.75 9.22676 15.4938 9.22676ZM8.74688 11.9205C8.00313 11.9205 7.39688 11.3174 7.39688 10.5736C7.39688 9.82988 8 9.22676 8.74688 9.22676C9.49375 9.22676 10.0969 9.82988 10.0969 10.5736C10.0969 11.3174 9.49063 11.9205 8.74688 11.9205ZM27.0844 24.908C28.8625 23.6205 29.9969 21.7205 29.9969 19.6049C29.9969 15.7299 26.2219 12.5893 21.5625 12.5893C16.9063 12.5893 13.1281 15.7299 13.1281 19.6049C13.1281 23.4799 16.9031 26.6205 21.5625 26.6205C22.525 26.6205 23.4563 26.483 24.3156 26.2361C24.3969 26.2111 24.4781 26.1986 24.5625 26.1986C24.725 26.1986 24.8719 26.2486 25.0094 26.3268L26.8563 27.3893C26.9094 27.4205 26.9594 27.4424 27.0188 27.4424C27.0558 27.4427 27.0925 27.4357 27.1269 27.4217C27.1612 27.4078 27.1924 27.3872 27.2188 27.3611C27.2448 27.3348 27.2654 27.3036 27.2793 27.2692C27.2933 27.2349 27.3003 27.1982 27.3 27.1611C27.3 27.0924 27.2719 27.0236 27.2563 26.9549C27.2469 26.9174 27.0188 26.0705 26.875 25.5393C26.8594 25.4799 26.8469 25.4205 26.8469 25.3611C26.85 25.1768 26.9438 25.0111 27.0844 24.908ZM18.7563 18.4861C18.1344 18.4861 17.6313 17.983 17.6313 17.3643C17.6313 16.7455 18.1344 16.2424 18.7563 16.2424C19.3781 16.2424 19.8813 16.7455 19.8813 17.3643C19.8813 17.983 19.375 18.4861 18.7563 18.4861ZM24.3781 18.4861C23.7563 18.4861 23.2531 17.983 23.2531 17.3643C23.2531 16.7455 23.7563 16.2424 24.3781 16.2424C25 16.2424 25.5031 16.7455 25.5031 17.3643C25.5016 17.6619 25.3825 17.9468 25.1718 18.157C24.9611 18.3672 24.6758 18.4855 24.3781 18.4861Z"
                        fill="#E6DFE7"
                      />
                    </svg>
                  </div>
                </div>
                <div className="w-[53px] h-[53px] relative">
                  <div className="w-[53px] h-[53px] left-0 top-0 absolute bg-[#410c55] rounded-full" />
                  <div data-svg-wrapper className="left-[11px] top-[9px] absolute">
                    <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M27.8117 6.28965L27.8308 6.28229L27.8494 6.27386C28.1858 6.12166 28.3819 6.20783 28.4659 6.28907C28.5596 6.37962 28.7329 6.67605 28.5634 7.35564L28.5603 7.36798L28.5577 7.38042L24.5323 26.3511L24.5318 26.3536C24.4112 26.9322 24.2201 27.0742 24.1476 27.1068C24.073 27.1404 23.8553 27.18 23.3999 26.9381L17.3084 22.4387L16.8168 22.0756L16.3787 22.5017L13.5068 25.2943L13.8223 20.5795L24.9786 10.511C24.9795 10.5102 24.9803 10.5095 24.9811 10.5088C25.1466 10.3614 25.389 10.0936 25.4033 9.71608C25.4114 9.50083 25.3407 9.29277 25.2021 9.1276C25.073 8.9738 24.9141 8.89057 24.7844 8.84605C24.5334 8.75988 24.2694 8.77408 24.0534 8.81883C23.8237 8.86644 23.5847 8.96133 23.3544 9.10144L23.3544 9.10136L23.3445 9.10761L9.58299 17.7902L3.83106 15.9959L3.83106 15.9959L3.82785 15.9949C3.63807 15.9366 3.5164 15.8752 3.44383 15.8273C3.45394 15.8173 3.46552 15.8065 3.47878 15.7948C3.6022 15.6856 3.82275 15.5463 4.17648 15.4038L27.8117 6.28965ZM24.388 10.2232C24.388 10.2232 24.3869 10.2233 24.3848 10.2232C24.387 10.2231 24.3881 10.2231 24.388 10.2232Z"
                        stroke="#E6DFE7"
                        strokeWidth="1.44"
                      />
                    </svg>
                  </div>
                </div>
                <div className="w-[53px] h-[53px] relative">
                  <div className="w-[53px] h-[53px] left-0 top-0 absolute bg-[#410c55] rounded-full" />
                  <div data-svg-wrapper className="left-[11px] top-[11px] absolute">
                    <svg width="32" height="33" viewBox="0 0 32 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M27.5323 13.9622H16.2417V18.6028H22.6917C22.4136 20.1028 21.5698 21.3716 20.2979 22.2216C19.2229 22.9403 17.8511 23.3653 16.2386 23.3653C13.1167 23.3653 10.4761 21.256 9.53232 18.4216C9.29482 17.7028 9.15732 16.9341 9.15732 16.1435C9.15732 15.3528 9.29482 14.5841 9.53232 13.8653C10.4792 11.0341 13.1198 8.92471 16.2417 8.92471C18.0011 8.92471 19.5792 9.53096 20.8229 10.7185L24.2604 7.27783C22.1823 5.34033 19.4729 4.15283 16.2417 4.15283C11.5573 4.15283 7.5042 6.84033 5.53232 10.7591C4.71982 12.3778 4.25732 14.2091 4.25732 16.1466C4.25732 18.0841 4.71982 19.9122 5.53232 21.531C7.5042 25.4497 11.5573 28.1372 16.2417 28.1372C19.4792 28.1372 22.1917 27.0622 24.1729 25.231C26.4386 23.1435 27.7479 20.0685 27.7479 16.4153C27.7479 15.5653 27.6729 14.7497 27.5323 13.9622Z"
                        fill="#E6DFE7"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>

      {/* Modals */}
      {/* Модальні вікна */}
      {/* Модальні вікна */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLogin={(token: string) => {
          console.log("Увійшли з токеном:", token);
        }}
        openRegisterModal={openRegisterModal}
      />
      <RegisterModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegister={(token: string) => {
          console.log("Зареєструвались з токеном:", token);
        }}
        openLoginModal={openLoginModal}
      />
      <AccessModal
        isOpen={isAccessModalOpen}
        onClose={() => setIsAccessModalOpen(false)}
        onLogin={openLoginModal}
        onRegister={openRegisterModal}
      />
      <MessagesModal
        isOpen={isMessagesModalOpen}
        onClose={() => setMessagesModalOpen(false)}
        unreadMessagesCount={unreadMessagesCount}
        setUnreadMessagesCount={setUnreadMessagesCount}
      />
    </div>
  );
};

export default MainLayout;