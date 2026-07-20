export const metadata = {
  title: 'Arvilio CMS',
  description: 'Company marketing content admin',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
