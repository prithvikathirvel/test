import { Work_Sans } from "next/font/google"
import "@/app/globals.css"
import ReduxProvider from "@/components/providers/ReduxProvider"

const workSans = Work_Sans({ 
  subsets: ["latin"],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic']
})

export const metadata = {
  title: "Agent Studio",
  description: "AI Agent Development Platform",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={workSans.className}>
        <ReduxProvider>
          {children}
        </ReduxProvider>
      </body>
    </html>
  )
}
