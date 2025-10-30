'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Plus, Sparkles, MessageCircle, Menu, X } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface Chat {
  id: string
  title: string
  createdAt: string
}

export default function AIAnalystPage() {
  const { data: session } = useSession()
  const [chats, setChats] = useState<Chat[]>([])
  const [currentChatId, setCurrentChatId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (currentChatId) {
      fetchMessages(currentChatId)
    }
  }, [currentChatId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [input])

  const fetchChats = async () => {
    try {
      const response = await fetch('/api/chats')
      if (response.ok) {
        const data = await response.json()
        setChats(data)
      }
    } catch (error) {
      console.error('Error fetching chats:', error)
    }
  }

  const fetchMessages = async (chatId: string) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data)
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const createNewChat = async () => {
    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      if (response.ok) {
        const newChat = await response.json()
        setChats([newChat, ...chats])
        setCurrentChatId(newChat.id)
        setMessages([])
      }
    } catch (error) {
      console.error('Error creating chat:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    setLoading(true)

    // Add user message to UI
    const newUserMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
    }
    setMessages((prev) => [...prev, newUserMessage])

    try {
      const response = await fetch(`/api/chats/${currentChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: userMessage }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessages((prev) => [...prev, data.assistantMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!currentChatId) {
        createNewChat().then(() => {
          setTimeout(sendMessage, 100)
        })
      } else {
        sendMessage()
      }
    }
  }

  const [selectedModel, setSelectedModel] = useState('GPT-5')

  const examplePrompts = [
    "Who won the last World Cup?",
    "Compare LeBron James and Michael Jordan",
    "What are the current NFL playoff standings?",
    "Explain the Premier League relegation system"
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0`}
        >
        <div className="p-3 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-2.5 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md text-[15px]"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">
            Recent Chats
          </div>
          {chats.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-[13px] text-gray-500">No conversations yet</p>
              <p className="text-[11px] text-gray-400 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setCurrentChatId(chat.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                    currentChatId === chat.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="text-[14px] font-medium truncate">{chat.title}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {new Date(chat.createdAt).toLocaleDateString()}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
        </div>

        {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-50 rounded-lg transition-colors text-gray-700"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <h1 className="text-[17px] font-semibold text-gray-900">GameLens.AI</h1>
            </div>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto">
          {currentChatId && messages.length > 0 ? (
            <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-4 animate-fadeIn ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      message.role === 'user'
                        ? 'bg-primary text-white'
                        : 'bg-gradient-to-br from-primary to-primary-dark text-white'
                    }`}
                  >
                    {message.role === 'user' ? (
                      <span className="text-sm font-semibold">
                        {session?.user?.name?.[0]?.toUpperCase() || 'U'}
                      </span>
                    ) : (
                      <Sparkles size={20} />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 ${message.role === 'user' ? 'flex justify-end' : ''}`}>
                    <div
                      className={`inline-block max-w-[85%] rounded-2xl px-5 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-white'
                          : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                      }`}
                    >
                      <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-4 animate-fadeIn">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white">
                    <Sparkles size={20} />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3 shadow-sm">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            // Empty State
            <div className="h-full flex items-center justify-center px-6">
              <div className="text-center max-w-4xl mx-auto -mt-20">
                <h2 className="text-[42px] font-bold text-gray-900 mb-3 tracking-tight">
                  Welcome to GameLens.AI!
                </h2>
                <p className="text-gray-600 mb-16 text-[22px] font-normal">
                  Your AI Sports Analyst
                </p>

                {!currentChatId && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto px-4">
                    {examplePrompts.map((prompt, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!currentChatId) {
                            createNewChat().then(() => {
                              setInput(prompt)
                            })
                          } else {
                            setInput(prompt)
                          }
                        }}
                        className="p-4 bg-white border border-gray-200 rounded-[14px] hover:border-gray-300 hover:shadow-sm transition-all duration-150 text-left text-[15px] text-gray-700 hover:text-gray-900 font-normal"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white">
          <div className="max-w-4xl mx-auto px-6 py-5">
            <div className="relative flex items-center gap-0 bg-white border border-gray-300 rounded-[16px] shadow-sm hover:shadow-md focus-within:border-gray-400 transition-all">
              <div className="flex items-center gap-2 px-4 py-3 border-r border-gray-200">
                <Sparkles size={16} className="text-gray-500" />
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="bg-transparent text-[14px] font-medium text-gray-700 outline-none cursor-pointer pr-1"
                >
                  <option value="GPT-5">GPT-5</option>
                  <option value="GPT-4">GPT-4</option>
                  <option value="GPT-3.5">GPT-3.5</option>
                </select>
              </div>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Send a message..."
                className="flex-1 px-4 py-3 bg-transparent resize-none outline-none max-h-32 text-[15px] text-gray-900 placeholder:text-gray-400"
                rows={1}
                disabled={loading}
              />
              <button
                onClick={() => {
                  if (!currentChatId) {
                    createNewChat().then(() => {
                      setTimeout(sendMessage, 100)
                    })
                  } else {
                    sendMessage()
                  }
                }}
                disabled={loading || !input.trim()}
                className={`flex-shrink-0 mr-2 p-2 rounded-lg transition-all duration-200 ${
                  loading || !input.trim()
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-primary hover:bg-primary/5'
                }`}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
