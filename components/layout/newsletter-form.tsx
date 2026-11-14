"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function NewsletterForm() {
  const [email, setEmail] = useState("");

  return (
    <form
      className="mt-6 flex max-w-xs items-center gap-2 border-b border-foreground/30 focus-within:border-foreground"
      onSubmit={(e) => {
        e.preventDefault();
        if (!email) return;
        toast.success("Thank you — you're on the list.");
        setEmail("");
      }}
    >
      <Input
        type="email"
        required
        placeholder="Email for 10% off"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-9 rounded-none border-0 bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
      />
      <Button type="submit" size="icon" variant="ghost" className="shrink-0 rounded-none" aria-label="Subscribe">
        <ArrowRight className="size-4" />
      </Button>
    </form>
  );
}
