import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '智能对话助手',
  description: '基于DeepSeek R1的智能对话助手',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
