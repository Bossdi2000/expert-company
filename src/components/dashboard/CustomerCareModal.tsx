import { useState, useRef, useEffect } from "react";
import { X, Send, User, Headset, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function CustomerCareModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<{ id: string; text: string; sender: "user" | "agent" }[]>([
    { id: "1", text: "Hello! Welcome to Gold Empire Support. How can we help you today?", sender: "agent" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { id: Date.now().toString(), text: input, sender: "user" }]);
    setInput("");
    setTyping(true);
    
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { id: Date.now().toString(), text: "Thank you for reaching out. One of our specialists will be with you shortly.", sender: "agent" }]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, y: 50 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: 50 }}
        className="w-full max-w-sm rounded-[2rem] border border-border bg-card shadow-2xl overflow-hidden flex flex-col h-[500px]"
      >
        <div className="bg-gradient-gold p-4 flex items-center justify-between text-primary-foreground shadow-gold">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-full"><Headset size={20} /></div>
            <div>
              <h3 className="font-semibold">Live Support</h3>
              <p className="text-[10px] text-white/80">Typically replies in a few minutes</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/40">
          <AnimatePresence>
            {messages.map(m => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] rounded-2xl p-3 text-sm ${m.sender === "user" ? "bg-primary text-primary-foreground rounded-tr-sm" : "bg-card border border-border rounded-tl-sm"}`}>
                  {m.text}
                </div>
              </motion.div>
            ))}
            {typing && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm p-3 flex gap-1">
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  <div className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        <div className="p-3 border-t border-border bg-card">
          <form onSubmit={sendMessage} className="relative">
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Type your message..." 
              className="w-full bg-background border border-border rounded-full pl-4 pr-12 py-3 text-sm outline-none focus:border-primary"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground w-8 h-8 rounded-full grid place-items-center disabled:opacity-50"
            >
              <Send size={14} className="ml-0.5" />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
