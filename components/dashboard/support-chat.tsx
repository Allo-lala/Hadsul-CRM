"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Send, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { apiRequest } from "@/lib/api"
import type { SupportMessage } from "@/app/api/support/route"

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })
}

interface SupportChatProps {
  open: boolean
  onClose: () => void
  staffName: string
}

export function SupportChat({ open, onClose, staffName }: SupportChatProps) {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [text, setText] = useState("")
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await apiRequest<SupportMessage[]>("/api/support")
    if (data) setMessages(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (open) load()
  }, [open, load])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function handleSend() {
    if (!text.trim() || sending) return
    setSending(true)
    const { data } = await apiRequest<SupportMessage>("/api/support", {
      method: "POST",
      body: JSON.stringify({ message: text.trim() }),
    })
    if (data) setMessages(prev => [...prev, data])
    setText("")
    setSending(false)
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <Sheet open={open} onOpenChange={o => { if (!o) onClose() }}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Help & Support
          </SheetTitle>
          <p className="text-xs text-muted-foreground">Send a message to your care home admin</p>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">No messages yet</p>
              <p className="text-xs text-muted-foreground/60 mt-1">Send a message to get help from your admin</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex", msg.is_from_staff ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm",
                    msg.is_from_staff
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-muted text-foreground rounded-bl-sm"
                  )}>
                    {!msg.is_from_staff && (
                      <p className="text-[10px] font-semibold mb-1 opacity-70">{msg.sender_name}</p>
                    )}
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className={cn("text-[10px] mt-1", msg.is_from_staff ? "text-primary-foreground/60 text-right" : "text-muted-foreground")}>
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </ScrollArea>

        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Type a message… (Enter to send)"
              rows={2}
              className="resize-none text-sm"
            />
            <Button size="icon" onClick={handleSend} disabled={!text.trim() || sending} className="shrink-0 self-end">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
