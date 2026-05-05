import "./globals.css";
import Header from "./components/Header";
import { AuthProvider } from "./context/AuthContext";

export const metadata = {
  title: "Memanshi",
  description: "Organize YouTube videos by subject",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
