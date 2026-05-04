import "./globals.css";

export const metadata = {
  title: "Memanshi",
  description: "Organize YouTube videos by subject",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
