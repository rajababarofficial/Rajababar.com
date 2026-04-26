"use client";

import React, { useState, useRef, useEffect } from "react";
import {
    Share2,
    Copy,
    Check,
    MessageCircle,
    Facebook,
    Twitter,
    Mail,
    ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/src/context/LanguageContext";
import { cn } from "@/src/utils/cn";

interface ShareButtonProps {
    title: string;
    text?: string;
    url: string;
    className?: string;
    variant?: "icon" | "full" | "outline";
    isPDF?: boolean;
    label?: string;
}

export default function ShareButton({
    title,
    text,
    url,
    className,
    variant = "icon",
    isPDF = false,
    label
}: ShareButtonProps) {
    const { isSindhi } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const absoluteUrl = url.startsWith('http') ? url : window.location.origin + url;

    const handleNativeShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text: text || title,
                    url: absoluteUrl,
                });
                return true;
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    return false; // Fallback to custom menu
                }
                return true; // Cancelled
            }
        }
        return false; // Fallback to custom menu
    };

    const handleToggle = async () => {
        const shared = await handleNativeShare();
        if (!shared) {
            setIsOpen(!isOpen);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(absoluteUrl);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
                setIsOpen(false);
            }, 2000);
        } catch (err) {
            console.error("Failed to copy:", err);
        }
    };

    const socialShares = [
        {
            name: "WhatsApp",
            icon: <MessageCircle className="w-4 h-4 text-[#25D366]" />,
            url: `https://wa.me/?text=${encodeURIComponent((text || title) + " " + absoluteUrl)}`,
            color: "hover:bg-[#25D366]/10"
        },
        {
            name: "Facebook",
            icon: <Facebook className="w-4 h-4 text-[#1877F2]" />,
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(absoluteUrl)}`,
            color: "hover:bg-[#1877F2]/10"
        },
        {
            name: "X (Twitter)",
            icon: <Twitter className="w-4 h-4 text-brand-primary" />,
            url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text || title)}&url=${encodeURIComponent(absoluteUrl)}`,
            color: "hover:bg-brand-primary/10"
        },
        {
            name: isSindhi ? "اي ميل" : "Email",
            icon: <Mail className="w-4 h-4 text-[#EA4335]" />,
            url: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent((text || title) + "\n\n" + absoluteUrl)}`,
            color: "hover:bg-[#EA4335]/10"
        }
    ];

    const buttonContent = (
        <>
            <Share2 className={cn("w-5 h-5", (variant === "full" || variant === "outline") && "w-4 h-4")} />
            {(variant === "full" || variant === "outline") && (
                <span className={isSindhi ? "font-sindhi text-lg" : ""}>
                    {label || (isPDF ? (isSindhi ? "PDF لنڪ" : "PDF Link") : (isSindhi ? "شيئر" : "Share"))}
                </span>
            )}
        </>
    );

    return (
        <div className="relative inline-block" ref={menuRef}>
            {variant === "icon" ? (
                <button
                    onClick={handleToggle}
                    className={cn(
                        "p-3 bg-brand-surface border border-brand-border hover:border-brand-accent rounded-2xl text-brand-secondary hover:text-brand-accent active:scale-95 transition-all",
                        className
                    )}
                >
                    {buttonContent}
                </button>
            ) : variant === "outline" ? (
                <button
                    onClick={handleToggle}
                    className={cn(
                        "flex items-center justify-center gap-2 h-14 bg-brand-surface border border-brand-border rounded-xl hover:border-brand-accent transition-all text-xs font-bold text-brand-primary active:scale-95",
                        className
                    )}
                >
                    {buttonContent}
                </button>
            ) : (
                <button
                    onClick={handleToggle}
                    className={cn(
                        "flex items-center justify-center gap-2 px-6 py-3 bg-brand-accent hover:bg-brand-accent/90 text-white rounded-2xl text-sm font-bold shadow-lg shadow-brand-accent/20 active:scale-95 transition-all uppercase tracking-wider",
                        isSindhi && "font-sindhi text-lg tracking-normal",
                        className
                    )}
                >
                    {buttonContent}
                </button>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className={cn(
                            "absolute bottom-full mb-4 z-[100] min-w-[200px] glass rounded-2xl overflow-hidden shadow-2xl p-2",
                            isSindhi ? "right-0 origin-bottom-right" : "left-0 origin-bottom-left"
                        )}
                    >
                        <div className="space-y-1">
                            <p className={cn(
                                "px-3 py-2 text-[10px] uppercase font-black text-brand-secondary/60 tracking-widest",
                                isSindhi && "font-sindhi text-xs tracking-normal"
                            )}>
                                {isSindhi ? "شيئر ڪريو" : "Share via"}
                            </p>

                            {socialShares.map((social) => (
                                <a
                                    key={social.name}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-primary transition-colors",
                                        social.color
                                    )}
                                    onClick={() => setIsOpen(false)}
                                >
                                    {social.icon}
                                    <span className={isSindhi ? "font-sindhi text-base" : ""}>{social.name}</span>
                                </a>
                            ))}

                            <div className="h-px bg-brand-border my-1 mx-2" />

                            <button
                                onClick={copyToClipboard}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-primary hover:bg-brand-accent/10 transition-colors"
                            >
                                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-brand-accent" />}
                                <span className={isSindhi ? "font-sindhi text-base" : ""}>
                                    {copied ? (isSindhi ? "ڪاپي ٿي ويو!" : "Copied!") : (isSindhi ? "لنڪ ڪاپي ڪريو" : "Copy Link")}
                                </span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
