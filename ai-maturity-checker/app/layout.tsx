import '../styles/globals.css';
import Drawer from '../components/Drawer';

export const metadata = {
  title: 'AI status checker',
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
        <Drawer />
      </body>
    </html>
  );
}