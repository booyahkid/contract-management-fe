'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MessageCircle, Send, Bot, User, Loader2, Clock, DollarSign, FileText, Calendar, Search, TrendingUp } from 'lucide-react'
import { askQuestion } from '@/lib/api/rag'
import { toast } from 'sonner'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  sources?: Array<{
    contract_number?: string
    source?: string
    [key: string]: unknown
  }>
}

interface RAGPageProps {
  contractId?: number
}

// Function to format text with bold **text** support
const formatMessage = (text: string) => {
  return text.split(/(\*\*.*?\*\*)/).map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function RAGPage({ contractId }: RAGPageProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string>()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Quick action suggestions
  const quickActions = [
    { icon: Clock, label: "Kontrak berakhir bulan ini", query: "kontrak yang berakhir bulan ini" },
    { icon: DollarSign, label: "Kontrak nilai tertinggi", query: "kontrak dengan nilai tertinggi" },
    { icon: FileText, label: "Semua kontrak IT", query: "daftar semua kontrak kategori IT" },
    { icon: Calendar, label: "Kontrak tahun 2024", query: "kontrak yang dibuat tahun 2024" },
    { icon: Search, label: "Vendor PT Solusi", query: "kontrak dari vendor PT Solusi Digital Nusantara" },
    { icon: TrendingUp, label: "Statistik kontrak", query: "berapa total nilai semua kontrak aktif" },
  ]

  const handleQuickAction = (query: string) => {
    setInput(query)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await askQuestion({
        question: userMessage.content,
        session_id: sessionId,
        max_results: 5,
        contract_id: contractId
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources
      }

      setMessages(prev => [...prev, assistantMessage])
      if (response.session_id) {
        setSessionId(response.session_id)
      }
    } catch (error) {
      console.error('Error asking question:', error)
      toast.error('Gagal mengirim pertanyaan. Silakan coba lagi.')
    } finally {
      setIsLoading(false)
    }
  }

  const hasMessages = messages.length > 0

  return (
    <div className="h-[calc(100vh-4rem)] bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      {/* Header */}
      {/* <div className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">RAG Assistant</h1>
              <p className="text-sm text-gray-600">Tanyakan tentang kontrak Anda</p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!hasMessages ? (
          /* Welcome Screen - Centered */
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-md">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <MessageCircle className="h-10 w-10 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Selamat datang!</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Tanyakan apa saja tentang kontrak Anda. Saya akan membantu mencari informasi yang Anda butuhkan.
                </p>
              </div>
              <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg p-4 text-left">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">**Aksi Cepat:**</p>
                <div className="grid grid-cols-1 gap-2">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.query)}
                      className="flex items-center gap-3 p-3 bg-white/50 dark:bg-gray-700/50 hover:bg-white/80 dark:hover:bg-gray-700/80 rounded-lg transition-all duration-200 border border-gray-200/50 dark:border-gray-600/50 hover:border-blue-300 dark:hover:border-blue-500 group"
                    >
                      <action.icon className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" />
                      <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 text-left">
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-300/50 dark:border-gray-600/50">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">**Atau tanyakan langsung:**</p>
                  <ul className="text-xs text-gray-500 dark:text-gray-500 space-y-1">
                    <li>• &quot;Apa nama kontrak dengan nomor CN-2024-012?&quot;</li>
                    <li>• &quot;Kontrak mana yang akan berakhir bulan ini?&quot;</li>
                    <li>• &quot;Berapa nilai kontrak dari vendor PT ABC?&quot;</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <div className="flex-1 overflow-y-auto p-4">
            <div className="container mx-auto max-w-4xl space-y-4">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex gap-3 animate-fadeIn`}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-gray-600 dark:bg-gray-500' 
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4 text-white" />
                    ) : (
                      <Bot className="h-4 w-4 text-white" />
                    )}
                  </div>
                  <Card className="flex-1 shadow-sm dark:bg-gray-800/50 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="whitespace-pre-line text-gray-900 dark:text-gray-100">
                          {formatMessage(message.content)}
                        </div>
                      </div>
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex flex-wrap gap-1">
                            {message.sources.map((source, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                                {source.contract_number || source.source || `Source ${idx + 1}`}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 animate-pulse">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <Card className="flex-1 shadow-sm dark:bg-gray-800/50 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Sedang mencari jawaban...</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Input Form - Always at bottom */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="container mx-auto max-w-4xl">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tanyakan tentang kontrak..."
                disabled={isLoading}
                className="flex-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 dark:text-gray-100 dark:placeholder-gray-400"
                autoFocus
              />
              <Button 
                type="submit" 
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
