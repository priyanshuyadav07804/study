import "./globals.css";
import Header from "./components/Header";
import ServiceWorkerRegistration from "./components/ServiceWorkerRegistration";

export const metadata = {
  title: "Memanshi",
  description: "Organize YouTube videos by subject",
  manifest: "/manifest.webmanifest",
  applicationName: "Memanshi",
  appleWebApp: {
    capable: true,
    title: "Memanshi",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport = {
  themeColor: "#111827",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ServiceWorkerRegistration />
        <Header />
        {children}
      </body>
    </html>
  );
}
