'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { Mail, Send, Calendar, History } from 'lucide-react'
import { Contract } from '@/types/contract'
import { sendDueReminder } from '@/lib/api/emails'
import { toast } from 'sonner'

interface EmailActionsProps {
  contract: Contract
  variant?: 'default' | 'outline' | 'secondary' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
}

export default function EmailActions({ contract, variant = 'outline', size = 'sm' }: EmailActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleComposeEmail = () => {
    router.push(`/emails/compose?contractId=${contract.id}`)
  }

  const handleSendDueReminder = async () => {
    setLoading(true)
    try {
      await sendDueReminder(contract.id)
      toast.success('Due reminder sent successfully!')
    } catch (error) {
      console.error('Failed to send reminder:', error)
      toast.error('Failed to send reminder')
    } finally {
      setLoading(false)
    }
  }

  const handleViewEmailHistory = () => {
    router.push(`/emails/history?contractId=${contract.id}`)
  }

  const isNearExpiry = () => {
    const endDate = new Date(contract.end_date)
    const now = new Date()
    const daysUntilExpiry = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={loading}>
          <Mail className="w-4 h-4 mr-2" />
          Email
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleComposeEmail}>
          <Send className="w-4 h-4 mr-2" />
          Compose Email
        </DropdownMenuItem>
        {isNearExpiry() && (
          <DropdownMenuItem onClick={handleSendDueReminder}>
            <Calendar className="w-4 h-4 mr-2" />
            Send Due Reminder
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleViewEmailHistory}>
          <History className="w-4 h-4 mr-2" />
          Email History
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
