﻿﻿﻿﻿﻿import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/components/auth-provider';
import { JudgeModeProvider } from '@/components/judge-mode-provider';
import { AppShell } from '@/components/app-shell';

export const metadata: Metadata = {
  title: '灵鉴 SentinelAI',
  description: '多模态 AIGC 内容治理智能体 MVP',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link
          rel="preconnect"
          href="https://fonts.googleapis.com"
        />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <JudgeModeProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
          </AuthProvider>
        </JudgeModeProvider>
      </body>
    </html>
  );
}

