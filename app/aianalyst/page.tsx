'use client'

import { useState, useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'
import { Send, Plus, Sparkles, MessageCircle, TrendingUp, BarChart3, Menu, X } from 'lucide-react'

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
      sendMessage()
    }
  }

  const examplePrompts = [
    {
      icon: TrendingUp,
      title: "Analyze trends",
      prompt: "What are the current betting trends in NBA?"
    },
    {
      icon: BarChart3,
      title: "Strategy advice",
      prompt: "Give me tips on improving my prediction accuracy"
    },
    {
      icon: MessageCircle,
      title: "Game analysis",
      prompt: "Help me analyze tonight's featured games"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      <div className="h-screen pt-16 flex overflow-hidden">
        {/* Sidebar */}
        <div
          className={`${
            sidebarOpen ? 'w-72' : 'w-0'
          } transition-all duration-300 ease-in-out bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0`}
        >
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewChat}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-4 py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus size={20} />
            <span>New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 scrollbar-hide">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            Recent Chats
          </div>
          {chats.length === 0 ? (
            <div className="px-3 py-8 text-center">
              <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-500">No conversations yet</p>
              <p className="text-xs text-gray-400 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <div className="space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setCurrentChatId(chat.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group ${
                    currentChatId === chat.id
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{chat.title}</p>
                  <p className="text-xs text-gray-500 mt-1">
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
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">AI Sports Analyst</h1>
                <p className="text-xs text-gray-500">Powered by advanced AI</p>
              </div>
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
              <div className="text-center max-w-2xl mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary-dark rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Sparkles className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  AI Sports Analyst
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  Get expert predictions, strategic insights, and personalized advice powered by AI
                </p>

                {!currentChatId && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    {examplePrompts.map((example, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!currentChatId) {
                            createNewChat().then(() => {
                              setInput(example.prompt)
                            })
                          } else {
                            setInput(example.prompt)
                          }
                        }}
                        className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-primary hover:shadow-md transition-all duration-200 text-left"
                      >
                        <example.icon className="w-6 h-6 text-primary mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-gray-900 mb-1">{example.title}</h3>
                        <p className="text-sm text-gray-600">{example.prompt}</p>
                      </button>
                    ))}
                  </div>
                )}

                {!currentChatId && (
                  <button
                    onClick={createNewChat}
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-medium px-6 py-3 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <Plus size={20} />
                    <span>Start New Conversation</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        {currentChatId && (
          <div className="border-t border-gray-200 bg-white">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="relative flex items-end gap-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about sports predictions, strategies, or analysis..."
                  className="flex-1 px-5 py-4 bg-transparent resize-none outline-none max-h-40 text-[15px]"
                  rows={1}
                  disabled={loading}
                />
                <button
                  onClick={sendMessage}
                  disabled={loading || !input.trim()}
                  className={`flex-shrink-0 m-2 p-3 rounded-xl transition-all duration-200 ${
                    loading || !input.trim()
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary-dark text-white shadow-sm hover:shadow-md'
                  }`}
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="text-xs text-gray-500 text-center mt-3">
                Press Enter to send, Shift + Enter for new line
              </p>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  )
}
