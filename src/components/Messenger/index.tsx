import React, { useState, useEffect, FormEvent, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import { HubConnectionBuilder, HubConnection, HubConnectionState, HttpTransportType } from "@microsoft/signalr";

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

const ChatMessage: React.FC<{
  content: string;
  time: string;
  isOutgoing: boolean;
  status: string;
}> = ({ content, time, isOutgoing, status }) => {
  const formattedTime = new Date(time).toLocaleTimeString("uk-UA", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className={`flex ${isOutgoing ? "justify-end" : "justify-start"} mb-4`}>
      <div className={`max-w-[80%] ${isOutgoing ? "ml-auto" : ""}`}>
        <div className={`p-3 rounded-lg ${
          isOutgoing 
            ? "bg-[#410C55] text-white rounded-br-none"
            : "bg-[#E6DFE7] text-black rounded-bl-none"
        }`}>
          {content}
        </div>
        <div className={`flex items-center mt-1 text-xs ${
          isOutgoing ? "text-[#BC98C9] justify-end" : "text-[#666]"
        }`}>
          {!isOutgoing && <span className="mr-2">{status}</span>}
          <span>{formattedTime}</span>
          {isOutgoing && <span className="ml-2">{status}</span>}
        </div>
      </div>
    </div>
  );
};

const ChatInput: React.FC<{
  onSendMessage: (message: string) => void;
  disabled: boolean;
}> = ({ onSendMessage, disabled }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Напишіть повідомлення..."
            className="w-full bg-transparent border-2 border-[#BC98C9] rounded-xl py-3 px-4 text-white placeholder-[#BC98C9] focus:outline-none focus:border-[#E6DFE7] resize-none min-h-[50px] max-h-[150px]"
            disabled={disabled}
            autoFocus
          />
        </div>
        <button type="submit" className="p-2 hover:opacity-80 transition-opacity" disabled={disabled}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="w-[32px] h-[32px] cursor-pointer">
            <path d="M29.1068 15.589L2.96617 2.48277C2.85992 2.42964 2.73804 2.41714 2.62242 2.44527C2.35679 2.51089 2.19117 2.77964 2.25679 3.04839L4.95054 14.0546C4.99117 14.2203 5.11304 14.3546 5.27554 14.4078L9.89117 15.9921L5.27867 17.5765C5.11617 17.6328 4.99429 17.764 4.95679 17.9296L2.25679 28.9515C2.22867 29.0671 2.24117 29.189 2.29429 29.2921C2.41617 29.539 2.71617 29.639 2.96617 29.5171L29.1068 16.4859C29.2037 16.439 29.2818 16.3578 29.3318 16.264C29.4537 16.014 29.3537 15.714 29.1068 15.589ZM5.33804 25.8203L6.90992 19.3953L16.1349 16.2296C16.2068 16.2046 16.2662 16.1484 16.2912 16.0734C16.3349 15.9421 16.2662 15.8015 16.1349 15.7546L6.90992 12.5921L5.34429 6.19214L24.9693 16.0328L5.33804 25.8203Z" fill="#BC98C9"/>
          </svg>
        </button>
      </div>
    </form>
  );
};
const ChatWindow: React.FC<{ conversationId: number | null }> = ({ conversationId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [loading, setLoading] = useState(false);
  const [hubConnection, setHubConnection] = useState<HubConnection | null>(null);
  const token = localStorage.getItem("token") || "";
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getCurrentUser = (): User | null => {
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      return { 
        id: decoded.sub, 
        firstName: decoded.given_name, 
        lastName: decoded.family_name, 
        avatar: decoded.avatar 
      };
    } catch (error) {
      return null;
    }
  };

  useEffect(() => {
    const connectToHub = async () => {
      if (!token || !conversationId) return;

      const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/chatHub`, {
          accessTokenFactory: () => token,
          skipNegotiation: true,
          transport: HttpTransportType.WebSockets
        })
        .withAutomaticReconnect({
          nextRetryDelayInMilliseconds: (retryContext) => {
            if (retryContext.previousRetryCount < 3) return 2000;
            return 5000;
          }
        })
        .build();

      try {
        await connection.start();
        await connection.invoke("JoinConversation", conversationId);

        connection.on("ReceiveMessage", (newMessage: Message) => {
          setMessages(prev => [...prev, newMessage]);
        });

        connection.on("MessagesRead", (readIds: number[]) => {
          setMessages(prev => prev.map(msg => 
            readIds.includes(msg.id) ? {...msg, isRead: true} : msg
          ));
        });

        setHubConnection(connection);
      } catch (error) {
        console.error("Помилка підключення:", error);
      }
    };

    connectToHub();

    return () => {
      hubConnection?.stop();
    };
  }, [conversationId, token]);

  useEffect(() => {
    const loadData = async () => {
      if (!conversationId || !token) return;
      
      try {
        setLoading(true);
        
        const messagesRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, token })
        });
        const messagesData = await messagesRes.json();

        const convRes = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });
        const convData = await convRes.json();

        const conversation = convData.find((c: Conversation) => c.id === conversationId);
        if (conversation) {
          const currentUser = getCurrentUser();
          const otherParticipant = conversation.participants.find(
            (p: Participant) => p.id !== currentUser?.id
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

    loadData();
  }, [conversationId, token]);

  const handleSendMessage = async (content: string) => {
    if (!conversationId || !hubConnection) return;

    try {
      await hubConnection.invoke("SendMessage", conversationId, content);
    } catch (error) {
      console.error("Помилка відправки:", error);
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full text-[#E6DFE7] text-xl">
        Оберіть бесіду для початку спілкування
      </div>
    );
  }

  const currentUser = getCurrentUser();

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#BC98C9]">
        {participant && (
          <>
            <img
              src={`${import.meta.env.VITE_API_URL}/images/${participant.avatar}` || "https://placehold.co/65x65/410C55/410C55"}
              alt={participant.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  hubConnection?.state === HubConnectionState.Connected 
                    ? 'bg-green-500' 
                    : 'bg-red-500'
                }`} />
                <div className="text-[#E6DFE7] text-xl font-medium">
                  {participant.name}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto pr-2"
        style={{ maxHeight: 'calc(100vh - 300px)' }}
      >
        {loading ? (
          <div className="text-center text-[#E6DFE7]">Завантаження...</div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                time={message.sentAt}
                isOutgoing={message.senderId === currentUser?.id}
                status={message.isRead ? "Прочитано" : "Надіслано"}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput
        onSendMessage={handleSendMessage}
        disabled={!hubConnection || hubConnection.state !== HubConnectionState.Connected}
      />
    </div>
  );
};

const MessengerPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const loadConversations = async () => {
      try {
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat/conversations/list`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("token");
            window.location.href = "/";
          }
          throw new Error("HTTP error: " + response.status);
        }

        const data = await response.json();
        setConversations(data);
        setSelectedConv(data.length > 0 ? data[0].id : null);
      } catch (err) {
        setError("Не вдалося завантажити бесіди");
      } finally {
        setLoading(false);
      }
    };

    loadConversations();
  }, [token]);

  if (!token) return <div className="flex items-center justify-center h-screen text-[#E6DFE7] text-xl">Будь ласка, увійдіть в систему</div>;
  if (loading) return <div className="flex items-center justify-center h-screen text-[#E6DFE7]">Завантаження...</div>;
  if (error) return <div className="flex items-center justify-center h-screen text-red-500">{error}</div>;

  return (
    <div className="w-full min-h-screen bg-[#080217]">
      <div className="max-w-7xl mx-auto pt-20 px-4 sm:px-6 lg:px-8">
        <header className="mb-8 pb-6 border-b border-[#E6DFE7]">
          <h1 className="text-3xl font-bold text-[#E6DFE7]">Повідомлення</h1>
        </header>

        <main className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-96 flex flex-col gap-2 h-[calc(100vh-200px)] overflow-y-auto pr-2">
            {conversations.length > 0 ? conversations.map((conv) => (
              <div key={conv.id} onClick={() => setSelectedConv(conv.id)}
                   className={`p-4 rounded-xl cursor-pointer transition-all ${selectedConv === conv.id ? "bg-[#410C55]" : "bg-[#080217] hover:bg-[#1a0a2e]"}`}>
                <div className="flex items-center gap-4">
                  <img src={`${import.meta.env.VITE_API_URL}/images/${conv.participants[0]?.avatar}` || "https://placehold.co/75x75/410C55/410C55"} 
                       alt={conv.participants[0]?.name} 
                       className="w-16 h-16 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <h3 className="text-[#E6DFE7] text-lg font-medium">{conv.participants[0]?.name}</h3>
                      <span className="text-[#BC98C9] text-sm">
                        {conv.lastMessage?.sentAt ? new Date(conv.lastMessage.sentAt).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <p className="text-[#BC98C9] text-sm truncate">{conv.lastMessage?.content || "Немає повідомлень"}</p>
                    {conv.unreadCount > 0 && (
                      <div className="absolute top-3 right-3 bg-[#FF7086] text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )) : <div className="text-[#E6DFE7] text-center">Немає доступних бесід</div>}
          </div>

          <div className="flex-1 bg-[#11072B] rounded-xl p-6 shadow-lg">
            <ChatWindow conversationId={selectedConv} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MessengerPage;