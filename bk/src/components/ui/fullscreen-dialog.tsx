"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog@1.1.6";
import { XIcon } from "lucide-react@0.487.0";

import { cn } from "./utils";

function FullscreenDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="fullscreen-dialog" {...props} />;
}

const FullscreenDialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ ...props }, ref) => (
  <DialogPrimitive.Trigger ref={ref} data-slot="fullscreen-dialog-trigger" {...props} />
));
FullscreenDialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

function FullscreenDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="fullscreen-dialog-portal" {...props} />;
}

const FullscreenDialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Close>
>(({ ...props }, ref) => (
  <DialogPrimitive.Close ref={ref} data-slot="fullscreen-dialog-close" {...props} />
));
FullscreenDialogClose.displayName = DialogPrimitive.Close.displayName;

const FullscreenDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="fullscreen-dialog-overlay"
    className={cn(
      "fixed inset-0 z-50 bg-black/50",
      className,
    )}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9998
    }}
    {...props}
  />
))
FullscreenDialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const FullscreenDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <FullscreenDialogPortal data-slot="fullscreen-dialog-portal">
    <FullscreenDialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      data-slot="fullscreen-dialog-content"
      className={cn(
        "fixed inset-0 z-50 bg-background outline-none",
        className,
      )}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100vw',
        height: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        margin: 0,
        padding: 0,
        transform: 'none',
        zIndex: 9999,
        borderRadius: 0,
        border: 'none',
        inset: 0
      }}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </FullscreenDialogPortal>
))
FullscreenDialogContent.displayName = DialogPrimitive.Content.displayName

function FullscreenDialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fullscreen-dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function FullscreenDialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="fullscreen-dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

const FullscreenDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="fullscreen-dialog-title"
    className={cn("text-lg leading-none font-semibold", className)}
    {...props}
  />
));
FullscreenDialogTitle.displayName = DialogPrimitive.Title.displayName;

const FullscreenDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="fullscreen-dialog-description"
    className={cn("text-muted-foreground text-sm", className)}
    {...props}
  />
));
FullscreenDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  FullscreenDialog,
  FullscreenDialogClose,
  FullscreenDialogContent,
  FullscreenDialogDescription,
  FullscreenDialogFooter,
  FullscreenDialogHeader,
  FullscreenDialogOverlay,
  FullscreenDialogPortal,
  FullscreenDialogTitle,
  FullscreenDialogTrigger,
};