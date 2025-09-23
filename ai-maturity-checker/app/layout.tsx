import '@/app/globals.css';

export const metadata = {
  title: 'AI CapDev tool',
  description: 'Level up your AI adaptation in business.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}