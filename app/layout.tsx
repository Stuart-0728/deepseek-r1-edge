import * as React from 'react';
import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '智能对话助手 - 基于 DeepSeek R1',
  description: '免费体验 DeepSeek R1 智能对话，支持多模型切换，流畅中文体验。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={
          outfit.className +
          ' min-h-screen bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-violet-50/80 dark:from-gray-900 dark:via-indigo-950/30 dark:to-blue-950/30 text-gray-800 dark:text-gray-100 antialiased overflow-hidden'
        }
      >
        <div className="fixed inset-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(99,102,241,0.1),transparent_50%)] pointer-events-none"></div>
        <main className="relative z-10 w-full max-w-5xl mx-auto min-h-screen p-0 md:p-6 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
