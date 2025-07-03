import { GeistSans, GeistMono } from 'geist/font';
import './globals.css';
import Providers from '../components/Providers';

export const metadata = {
  title: "ChatApp",
  description: "A modern chat application",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}