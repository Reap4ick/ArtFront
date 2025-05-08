import { HomeOutlined, LeftOutlined, RightOutlined, HeartFilled, HeartOutlined, EyeFilled } from "@ant-design/icons";
import { Breadcrumb, Collapse } from "antd";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./style.css";
import Help from "../posts/components/Help";
import AuthorProductsCarousel from "./components/Cards";
import { HubConnectionBuilder, HubConnection, HubConnectionState, HttpTransportType } from "@microsoft/signalr";
import { jwtDecode } from "jwt-decode";

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
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar: string;
}

interface ProductData {
  id: number;
  name: string;
  price: number;
  description: string;
  size: string;
  format: string;
  technique: string;
  artisticDirection: string;
  color: string;
  categoryName: string;
  createdAt: string;
  yearCreated: number;
  images: string[];
  createdById: string;
  likesCount: number;
  viewsCount: number;
  isLikedByCurrentUser: boolean;
}

interface AuthorData {
  id: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  socialLinks: string[];
}

interface BreadcrumbsProps {
  productName: string;
}

function Breadcrumbs({ productName }: BreadcrumbsProps): JSX.Element {
  return (
    <>
      <style>
        {`
          /* Стилі для всіх посилань, іконок та роздільників */
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

          /* Стилі для назви картини через id і last-child */
          #product-name,
          .breadcrumb.ant-breadcrumb .ant-breadcrumb-item:last-child,
          .breadcrumb.ant-breadcrumb .ant-breadcrumb-item:last-child span,
          .breadcrumb.ant-breadcrumb .ant-breadcrumb-item:last-child * {
            color: rgb(255, 112, 134) !important;
          }
        `}
      </style>
      <Breadcrumb
        className="breadcrumb"
        items={[
          { href: "/", title: <HomeOutlined /> },
          { href: "/posts", title: "Список картин" },
          {
            title: (
              <span id="product-name" style={{ color: 'rgb(255, 112, 134) !important' }}>
                {productName}
              </span>
            ),
          },
        ]}
      />
    </>
  );
}

const MessagesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  preSelectedConversationId?: number | null;
}> = ({ isOpen, onClose, preSelectedConversationId }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<number | null>(preSelectedConversationId || null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState("");
  const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const connectionRef = useRef<HubConnection | null>(null);

  useEffect(() => {
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, []);

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

  useEffect(() => {
    setSelectedConv(preSelectedConversationId || null);
  }, [preSelectedConversationId]);

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

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/conversations/list`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

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
      if (connectionRef.current) {
        await connectionRef.current.stop();
      }
      const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`, {
          accessTokenFactory: () => token!,
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets,
        })
        .withAutomaticReconnect()
        .build();

      try {
        await connection.start();
        await connection.invoke("JoinConversation", selectedConv);

        connection.on("ReceiveMessage", (newMessage: Message) => {
          setMessages((prev) => [...prev, newMessage]);
        });

        connection.on("MessagesRead", (readIds: number[]) => {
          setMessages((prev) =>
            prev.map((msg) =>
              readIds.includes(msg.id) ? { ...msg, isRead: true } : msg
            )
          );
        });

        setHubConnection(connection);
      } catch (error) {
        console.error("Помилка підключення:", error);
      }
    };

    const loadConversationData = async () => {
      try {
        setLoading(true);

        const messagesRes = await fetch(
          `${import.meta.env.VITE_API_URL}/api/chat/conversations/messages`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ conversationId: selectedConv, token }),
          }
        );
        const messagesData = await messagesRes.json();

        const conversation = conversations.find((c) => c.id === selectedConv);
        if (conversation) {
          const currentUser = getCurrentUser();
          const otherParticipant = conversation.participants.find(
            (p) => p.id !== currentUser?.id
          );
          setParticipant(otherParticipant || null);
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
    if (!selectedConv || !hubConnection || !messageInput.trim() || isSending)
      return;

    setIsSending(true);
    try {
      if (hubConnection.state === HubConnectionState.Connected) {
        await hubConnection.invoke("SendMessage", selectedConv, messageInput);
        setMessageInput("");
      }
    } catch (error) {
      console.error("Помилка відправки:", error);
    } finally {
      setIsSending(false);
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
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
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
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        {selectedConv ? (
          <div className="h-full flex flex-col">
            {/* Chat Header */}
            <div className="w-full">
              <div className="flex items-start gap-3 p-4">
                <button
                  onClick={handleBackToConversations}
                  className="text-[#410C55] hover:text-[#080217]"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M15 18L9 12L15 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
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
                            hubConnection?.state === HubConnectionState.Connected
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        />
                        {hubConnection?.state === HubConnectionState.Connected
                          ? "Онлайн"
                          : "Офлайн"}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div className="w-full mt-1 border-t border-[#080217]" />
            </div>

            {/* Messages Container */}
            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-[rgba(65,12,85,0.15)] mx-[13px] rounded"
            >
              {loading ? (
                <div className="text-center text-[#410C55]">Завантаження...</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-4 ${
                      message.senderId === currentUser?.id
                        ? "text-right"
                        : "text-left"
                    }`}
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
                        message.senderId === currentUser?.id
                          ? "text-[#BC98C9]"
                          : "text-[#410C55]"
                      }`}
                    >
                      {new Date(message.sentAt).toLocaleTimeString("uk-UA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {message.senderId === currentUser?.id && (
                        <span className="ml-2">
                          {message.isRead ? "✓✓" : "✓"}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-4 border-t border-[#080217]"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Напишіть повідомлення..."
                  className="flex-1 p-2 border border-[#410C55] rounded-lg"
                  style={{ color: "black" }}
                  disabled={
                    !hubConnection ||
                    hubConnection.state !== HubConnectionState.Connected
                  }
                />
                <button
                  type="submit"
                  disabled={
                    isSending ||
                    !hubConnection ||
                    hubConnection.state !== HubConnectionState.Connected
                  }
                  className="p-2 bg-white text-[#080217] rounded-lg hover:bg-gray-100 border-2 border-[#410C55] transition-colors"
                >
                  {isSending ? "Відправка..." : "Надіслати"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Conversations List */
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-[#080217]">
              <h2 className="text-xl text-[#080217] font-medium">
                Повідомлення
              </h2>
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
                          <h3 className="text-[#080217] font-medium">
                            {conv.participants[0]?.name}
                          </h3>
                          <span className="text-sm text-[#410C55]">
                            {conv.lastMessage?.sentAt &&
                              new Date(conv.lastMessage.sentAt).toLocaleDateString()}
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

export default function CombinedComponent({
  className = "",
}: {
  className?: string;
}): JSX.Element {
  const { Panel } = Collapse;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [author, setAuthor] = useState<AuthorData | null>(null);
  const [userProfile, setUserProfile] = useState<ProfileData | null>(null);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [isMessageLoading, setIsMessageLoading] = useState(false);
  const [isMessagesModalOpen, setMessagesModalOpen] = useState(false);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | null
  >(null);

  const handleNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === product!.images.length - 1 ? 0 : prev + 1
    );
  };

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? product!.images.length - 1 : prev - 1
    );
  };

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/user/profile`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        }
      );

      if (!response.ok) throw new Error("Помилка отримання профілю");

      const data: ProfileData = await response.json();
      setUserProfile(data);
      return token;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Невідома помилка");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductData = async (token?: string): Promise<void> => {
    try {
      if (!id) return;

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      const requestBody = token ? { Token: token } : null;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/Products/${id}`,
        {
          method: "POST",
          headers,
          body: requestBody ? JSON.stringify(requestBody) : undefined,
        }
      );

      if (!response.ok) {
        console.error("Error fetching product data:", response.status);
        return;
      }

      const data: ProductData = await response.json();
      setProduct(data);
      setIsLiked(data.isLikedByCurrentUser);
      setLikesCount(data.likesCount);
      setViewsCount(data.viewsCount);

      if (data.createdById) {
        fetchAuthorData(data.createdById);
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
    }
  };

  const handleMessageClick = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      setIsMessageLoading(true);

      // Відкриваємо модалку одразу після початку запиту
      setMessagesModalOpen(true);

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/conversations`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            Token: token,
            ParticipantId: product?.createdById ?? "",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Не вдалося створити діалог");
      }

      const result = await response.json();
      setSelectedConversationId(result.conversationId || result.id);

      // Якщо бесіда вже існує, оновлюємо стан модалки
      if (result.Message === "Чат вже існує") {
        setSelectedConversationId(result.conversationId);
      }
    } catch (error) {
      console.error("Помилка при створенні діалогу:", error);
      alert("Сталася помилка. Спробуйте ще раз.");
    } finally {
      setIsMessageLoading(false);
    }
  };

  const fetchAuthorData = async (authorId: string): Promise<void> => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/Products/user/${authorId}`
      );

      if (!response.ok) {
        console.error("Error fetching author data:", response.status);
        return;
      }

      const data: AuthorData = await response.json();
      setAuthor({
        ...data,
        socialLinks: data.socialLinks || [],
      });
    } catch (error) {
      console.error("Error fetching author data:", error);
    }
  };

  const handleLikeClick = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ProductInteractions/like/${product?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ Token: token }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to like product");
      }

      const result = await response.json();
      setIsLiked(result.isLiked);
      setLikesCount(result.likesCount);
    } catch (error) {
      console.error("Error liking product:", error);
    }
  };

  const handleViewProduct = async () => {
    try {
      const token = localStorage.getItem("token");
      const tokenModel = token ? { Token: token } : null;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/ProductInteractions/view/${product?.id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: tokenModel ? JSON.stringify(tokenModel) : null,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to register view");
      }

      const result = await response.json();
      setViewsCount(result.viewsCount);
    } catch (error) {
      console.error("Error registering view:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const token = await fetchProfile();
      await fetchProductData(token || undefined);
    };

    loadData();
  }, [id]);

  useEffect(() => {
    if (product) {
      handleViewProduct();
    }
  }, [product]);

  const handleEditClick = () => {
    if (product) {
      navigate(`/update/${product.id}`);
    }
  };

  if (!product) {
    return <div>Завантаження даних про продукт...</div>;
  }

  const showEditButton = userProfile && product.createdById === userProfile.id;

  return (
    <div
      className={`font-gotham flex w-full flex-col gap-y-6 bg-slate-950 pt-9 tracking-[0px] ${className}`}
    >
      <div className="flex items-end pt-4">
        <Breadcrumbs productName={product.name} />
      </div>

      <div className="flex flex-wrap items-start justify-center gap-x-16 gap-y-16 min-[1430px]:flex-nowrap">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-6 min-[1430px]:flex-nowrap">
          <div className="relative group">
            <img
              className="h-[708px] w-[545px] flex-shrink-0 rounded-[4.3px] object-cover object-center"
              src={`${import.meta.env.VITE_API_URL}/images/${product.images[currentImageIndex]}`}
              alt={product.name}
              loading="lazy"
            />

            {/* Navigation Arrows */}
            {product.images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-0 top-1/2 -translate-y-1/2 bg-black/50 p-4 text-white hover:bg-black/75 transition-colors"
                >
                  <LeftOutlined className="text-2xl" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-0 top-1/2 -translate-y-1/2 bg-black/50 p-4 text-white hover:bg-black/75 transition-colors"
                >
                  <RightOutlined className="text-2xl" />
                </button>
              </>
            )}

            {/* Image Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {product.images.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full cursor-pointer transition-colors ${
                    index === currentImageIndex
                      ? "bg-rose-400"
                      : "bg-white/50 hover:bg-white/75"
                  }`}
                  onClick={() => setCurrentImageIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex w-[530px] flex-shrink-0 flex-col items-start gap-y-3">
          <div className="font-skema-pro-omni text-3xl font-medium leading-[38px] text-rose-400">
            {product.name}
          </div>
          <div className="text-xl leading-7 text-white">
            {author
              ? `Автор: ${author.firstName} ${author.lastName}`
              : `Автор ID: ${product.createdById}`}
          </div>

          <div className="flex gap-4 items-center">
            <button
              onClick={handleLikeClick}
              className="flex items-center gap-2 text-white hover:text-rose-400 transition-colors"
            >
              {isLiked ? (
                <HeartFilled className="text-rose-400 text-xl" />
              ) : (
                <HeartOutlined className="text-xl" />
              )}
              <span>{likesCount}</span>
            </button>

            <div className="flex items-center gap-2 text-white">
              <EyeFilled className="text-xl" />
              <span>{viewsCount}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-start gap-x-11 gap-y-11 self-stretch leading-[35px]">
            <div className="flex w-28 flex-shrink-0 flex-col items-start gap-y-6">
              <div className="self-stretch text-zinc-200">
                <span>
                  <p>Категорія</p>
                  <p>Розмір</p>
                  <p>Техніка</p>
                  <p>Формат</p>
                  <p>Рік створення</p>
                </span>
              </div>
              <div className="text-xl font-bold leading-7 text-rose-400">
                {product.price} грн
              </div>
            </div>
            <div className="w-[70px] flex-shrink-0 text-[plum]">
              <span>
                <p>{product.categoryName}</p>
                <p>{product.size}</p>
                <p>{product.technique}</p>
                <p>{product.format.split("x")[0]}</p>
                <p>{product.format.split("x")[1]}</p>
                <p>{product.yearCreated}</p>
              </span>
            </div>
          </div>

          {userProfile ? (
            showEditButton ? (
              <button
                onClick={handleEditClick}
                className="px-6 py-3 bg-white text-[#080217] rounded-lg border-2 border-[#410C55] hover:bg-gray-50 transition-colors duration-200 font-medium"
              >
                Редагувати
              </button>
            ) : (
              <button
                onClick={handleMessageClick}
                disabled={isMessageLoading}
                className="px-6 py-3 bg-white text-[#080217] rounded-lg border-2 border-[#410C55] hover:bg-gray-50 transition-colors duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isMessageLoading ? "Завантаження..." : "Написати"}
              </button>
            )
          ) : (
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-white text-[#080217] rounded-lg border-2 border-[#410C55] hover:bg-gray-50 transition-colors duration-200 font-medium"
            >
              Увійти, щоб написати
            </button>
          )}

          <Collapse
            defaultActiveKey={[]}
            ghost
            className="custom-accordion"
            accordion
          >
            <Panel header="Детальніше про картину" key="1">
              <p>{product.description}</p>
            </Panel>
            <Panel header="Автор" key="2">
              {author ? (
                <div className="flex flex-col gap-y-4">
                  <img
                    className="h-32 w-32 rounded-full object-cover"
                    src={`${import.meta.env.VITE_API_URL}/images/${author.avatar}`}
                    alt={`${author.firstName} ${author.lastName}`}
                  />
                  <p className="text-lg text-white">
                    {author.firstName} {author.lastName}
                  </p>
                  <p className="text-sm text-zinc-400">{author.bio}</p>
                  <div className="flex gap-x-4">
                    {author.socialLinks.length > 0 ? (
                      author.socialLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400"
                        >
                          {link}
                        </a>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">
                        Соціальні посилання відсутні
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p>Інформація про автора недоступна</p>
              )}
            </Panel>
            <Panel header="Правила та умови придбання" key="3">
              <p>
                Правила придбання: перерахування на рахунок, доставка в межах
                України тощо.
              </p>
            </Panel>
          </Collapse>
        </div>
      </div>

      <AuthorProductsCarousel authorId={product.createdById} />
      <Help />
      <MessagesModal
        isOpen={isMessagesModalOpen}
        onClose={() => {
          setMessagesModalOpen(false);
          setSelectedConversationId(null);
        }}
        preSelectedConversationId={selectedConversationId}
      />
    </div>
  );
}