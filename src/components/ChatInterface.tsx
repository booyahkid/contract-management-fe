'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Send } from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatInterfaceProps {
  contractId: string
}

export default function ChatInterface({ contractId }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Call the RAG API
      const response = await fetch('http://localhost:8001/api/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input.trim(),
          contract_id: parseInt(contractId),
          context: `Contract ID: ${contractId}`
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.answer || 'Sorry, I could not process your question.',
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Chat error:', error)
      toast.error('Failed to send message')
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, there was an error processing your question. Please try again.',
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          AI Chat - Contract Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Messages */}
        <div className="h-96 overflow-y-auto space-y-3 p-3 border rounded-lg bg-muted/50">
          {messages.length > 0 ? (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Ask questions about this contract</p>
              <p className="text-sm">Examples: &quot;What is the contract duration?&quot;, &quot;Who are the parties?&quot;, &quot;What are the key terms?&quot;</p>
            </div>
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-background border p-3 rounded-lg">
                <p className="text-sm">AI is thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about this contract..."
            disabled={loading}
            className="flex-1"
          />
          <Button 
            onClick={sendMessage} 
            disabled={!input.trim() || loading}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          This AI assistant can answer questions about the uploaded contract documents using RAG technology.
        </p>
      </CardContent>
    </Card>
  )
}
