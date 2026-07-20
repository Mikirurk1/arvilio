import './globals.scss';
import {
  DEFAULT_RESOLVED_THEME_MODE,
  serializeInitialAppearanceScript,
} from '../lib/appearance';

export const metadata = {
  title: 'Arvilio Control Plane',
  description: 'Platform operator console',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme={DEFAULT_RESOLVED_THEME_MODE} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: serializeInitialAppearanceScript(),
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Lora:wght@600;700&family=Source+Sans+3:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
