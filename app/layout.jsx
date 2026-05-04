import "./globals.css";

export const metadata = {
  title: "Subject Videos",
  description: "Organize YouTube videos by subject",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
