"use client";

import { Button } from "@/components/ui/button";

/** Botão de submit (para usar dentro de <form action={serverAction}>) que pede
 *  confirmação antes de enviar. Usado em ações destrutivas (apagar). */
export function ConfirmSubmitButton({
  confirmText,
  children,
  variant = "outline",
  size = "sm",
  className,
}: {
  confirmText: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "destructive" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}) {
  return (
    <Button
      type="submit"
      variant={variant}
      size={size}
      className={className}
      onClick={(e) => {
        if (!window.confirm(confirmText)) e.preventDefault();
      }}
    >
      {children}
    </Button>
  );
}
