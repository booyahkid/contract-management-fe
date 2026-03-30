'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { MessageCircle, Send, FileText, Bot, User } from 'lucide-react'
import { askQuestion } from '@/lib/api/rag'
import { ChatMessage } from '@/types/rag'
import { toast } from 'sonner'

interface RAGChatProps {
  contractId?: number
  sessionId?: string
}

export function RAGChat({ contractId, sessionId: initialSessionId }: RAGChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(initialSessionId)
  const messagesEndRef = useRef<HTMLDivElement>(null)

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
        question: input.trim(),
        session_id: sessionId,
        max_results: 5,
        contract_id: contractId
      })

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.answer,
        timestamp: new Date(),
        sources: response.sources,
        confidence: response.confidence
      }

      setMessages(prev => [...prev, assistantMessage])
      
      if (response.session_id) {
        setSessionId(response.session_id)
      }
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Gagal mengirim pesan. Silakan coba lagi.')
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: 'Maaf, terjadi kesalahan saat memproses pertanyaan Anda. Silakan coba lagi.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const formatConfidence = (confidence?: number) => {
    if (!confidence) return null
    const percentage = Math.round(confidence * 100)
    const color = percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
    return (
      <Badge variant="outline" className={`${color} text-white`}>
        Confidence: {percentage}%
      </Badge>
    )
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          RAG Chat Assistant
          {contractId && (
            <Badge variant="secondary">Contract #{contractId}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 px-4 overflow-y-auto">
          <div className="space-y-4 pb-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Mulai percakapan dengan menanyakan tentang kontrak...</p>
                <p className="text-sm mt-2">Contoh: &quot;Berapa total nilai kontrak dengan vendor ABC?&quot;</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      message.type === 'user' ? 'bg-blue-500' : 'bg-gray-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`space-y-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                      <div className={`p-3 rounded-lg ${
                        message.type === 'user' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                        {message.confidence && formatConfidence(message.confidence)}
                      </div>
                      
                      {message.sources && message.sources.length > 0 && (
                        <div className="space-y-2">
                          <Separator />
                          <p className="text-sm font-medium text-muted-foreground">Sumber:</p>
                          {message.sources.map((source, index) => (
                            <Card key={index} className="bg-blue-50 border-blue-200">
                              <CardContent className="p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-blue-600" />
                                    <span className="text-sm font-medium text-blue-900">
                                      {source.source}
                                    </span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    Score: {Math.round(source.relevance_score * 100)}%
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">
                                  {source.text}
                                </p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-gray-100 p-3 rounded-lg">
                  <div className="flex items-center gap-2">
                    <div className="animate-pulse flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                    <span className="text-sm text-gray-500">Sedang mencari jawaban...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanyakan tentang kontrak..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
