import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface VoiceSearchButtonProps {
  onResult: (transcript: string) => void;
  className?: string;
}

export function VoiceSearchButton({ onResult, className }: VoiceSearchButtonProps) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const isSupported = typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);

  const toggle = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    if (!isSupported) {
      toast.error("Voice search not supported in this browser");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };

    recognition.onerror = (event: any) => {
      if (event.error !== "aborted") {
        toast.error(`Voice error: ${event.error}`);
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    toast.info("Listening... speak a product name");
  }, [listening, isSupported, onResult]);

  if (!isSupported) return null;

  return (
    <Button
      type="button"
      variant={listening ? "destructive" : "ghost"}
      size="icon"
      onClick={toggle}
      className={`h-9 w-9 shrink-0 ${className}`}
      aria-label={listening ? "Stop listening" : "Voice search"}
    >
      {listening ? (
        <div className="relative">
          <MicOff className="h-4 w-4 animate-pulse" />
          <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive animate-ping" />
        </div>
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
