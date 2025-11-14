"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Menu, X, Settings, Moon, LogOut, Plus, Upload, Trash2 } from "lucide-react"

interface ChatMessage {
  id: string
  text: string
  sender: "user" | "bot"
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
}

interface ChatbotPageProps {
  userInfo: any
  onLogout: () => void
}

export function ChatbotPage({ userInfo, onLogout }: ChatbotPageProps) {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    handleNewChat()
  }, [])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || !currentChatId) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    }

    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInputValue("")
    setIsLoading(true)

    // Update current chat session
    setChatSessions((prev) =>
      prev.map((chat) => (chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat)),
    )

    // Simulate API call to your backend
    setTimeout(() => {
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: `Thank you for your message: "${inputValue}". Our AI support team is analyzing your request and will provide a solution shortly. In the meantime, you can share any additional details or upload documents to help us assist you faster.`,
        sender: "bot",
        timestamp: new Date(),
      }

      const finalMessages = [...updatedMessages, botMessage]
      setMessages(finalMessages)

      // Update chat session with bot message
      setChatSessions((prev) =>
        prev.map((chat) => (chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat)),
      )

      setIsLoading(false)
    }, 1000)
  }

  const handleNewChat = () => {
    const newChatId = Date.now().toString()
    const newChat: ChatSession = {
      id: newChatId,
      title: `Chat ${chatSessions.length + 1}`,
      messages: [],
    }
    setChatSessions((prev) => [newChat, ...prev])
    setCurrentChatId(newChatId)
    setMessages([])
  }

  const handleSelectChat = (chatId: string) => {
    const selectedChat = chatSessions.find((chat) => chat.id === chatId)
    if (selectedChat) {
      setCurrentChatId(chatId)
      setMessages(selectedChat.messages)
    }
  }

  const handleDeleteChat = (chatId: string) => {
    setChatSessions((prev) => prev.filter((chat) => chat.id !== chatId))
    if (currentChatId === chatId) {
      const remaining = chatSessions.filter((chat) => chat.id !== chatId)
      if (remaining.length > 0) {
        handleSelectChat(remaining[0].id)
      } else {
        handleNewChat()
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        setUploadedFiles((prev) => [...prev, file.name])

        // Add file message to chat
        const fileMessage: ChatMessage = {
          id: Date.now().toString(),
          text: `📎 Document uploaded: ${file.name}`,
          sender: "user",
          timestamp: new Date(),
        }

        const updatedMessages = [...messages, fileMessage]
        setMessages(updatedMessages)

        // Update chat session
        setChatSessions((prev) =>
          prev.map((chat) => (chat.id === currentChatId ? { ...chat, messages: updatedMessages } : chat)),
        )
      })
    }
  }

  return (
    <div className={`flex h-screen ${darkMode ? "bg-gray-900" : "bg-white"}`}>
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ease-in-out ${
          darkMode ? "bg-gray-800" : "bg-gray-50"
        } border-r ${darkMode ? "border-gray-700" : "border-gray-200"} overflow-hidden flex flex-col`}
      >
        {/* New Chat Button */}
        <div className="p-4">
          <Button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg py-2"
          >
            <Plus className="w-4 h-4" />
            New chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2">
          {chatSessions.length > 0 && (
            <div className="text-xs text-gray-500 font-semibold mb-4 uppercase">Chat History</div>
          )}
          {chatSessions.map((chat) => (
            <div key={chat.id} className="flex items-center gap-2 group">
              <button
                onClick={() => handleSelectChat(chat.id)}
                className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  currentChatId === chat.id
                    ? darkMode
                      ? "bg-teal-700 text-white"
                      : "bg-teal-100 text-teal-900"
                    : darkMode
                      ? "hover:bg-gray-700 text-gray-300"
                      : "hover:bg-gray-200 text-gray-700"
                }`}
              >
                {chat.title}
              </button>
              <button
                onClick={() => handleDeleteChat(chat.id)}
                className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  darkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                }`}
              >
                <Trash2 className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>

        {/* Bottom Actions */}
        <div className={`p-4 border-t ${darkMode ? "border-gray-700" : "border-gray-200"} space-y-2`}>
          <Button
            variant="ghost"
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full justify-start gap-2 ${
              darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Moon className="w-4 h-4" />
            {darkMode ? "Light mode" : "Dark mode"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => setShowSettings(true)}
            className={`w-full justify-start gap-2 ${
              darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start gap-2 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg ${
                darkMode ? "hover:bg-gray-700 text-gray-300" : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className={`text-xl font-semibold ${darkMode ? "text-white" : "text-gray-900"}`}>
              Smart Customer Support
            </h1>
          </div>
          <div className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Welcome, {userInfo?.name}</div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center gap-4">
              <div className={`text-5xl ${darkMode ? "text-gray-600" : "text-gray-300"}`}>✈️</div>
              <h2 className={`text-2xl font-semibold ${darkMode ? "text-gray-200" : "text-gray-900"}`}>
                Start a conversation
              </h2>
              <p className={`text-center max-w-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                Ask our AI assistant anything about your issues and we'll help resolve them quickly with voice and text
                support. You can also upload documents for faster resolution.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === "user"
                        ? "bg-teal-600 text-white"
                        : darkMode
                          ? "bg-gray-700 text-gray-100"
                          : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        message.sender === "user" ? "text-teal-100" : darkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className={`px-4 py-2 rounded-lg ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
                    <div className="flex gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0.4s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className={`px-6 py-4 border-t ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"}`}>
          <form onSubmit={handleSendMessage} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm transition-colors"
              >
                <Upload className="w-4 h-4" />
                Upload document
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
              />
              {uploadedFiles.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs flex items-center gap-2"
                    >
                      📎 {file}
                      <button
                        type="button"
                        onClick={() => setUploadedFiles((prev) => prev.filter((_, i) => i !== idx))}
                        className="hover:text-teal-900"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Message our AI support assistant..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className={`flex-1 px-4 py-3 rounded-lg border ${
                  darkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-200 text-gray-900"
                } focus:outline-none focus:ring-2 focus:ring-teal-500`}
              />
              <Button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-lg px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-2xl p-8 max-w-md w-full mx-4`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? "text-white" : "text-gray-900"}`}>Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className={`p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Information */}
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                  Full Name
                </label>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {userInfo?.name || "N/A"}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                  Contact Number
                </label>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {userInfo?.contact || "N/A"}
                </div>
              </div>

              <div>
                <label className={`block text-sm font-semibold ${darkMode ? "text-gray-300" : "text-gray-700"} mb-2`}>
                  Email Address
                </label>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    darkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {userInfo?.email || "N/A"}
                </div>
              </div>
            </div>

            <Button
              onClick={() => setShowSettings(false)}
              className="w-full mt-6 bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
