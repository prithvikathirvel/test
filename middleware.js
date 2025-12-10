import { NextResponse } from "next/server"

export function middleware(request) {
    // Get the pathname from the request URL
    const { pathname } = request.nextUrl
    console.log(pathname,'PATHNAME')
    
    // Get the base path from environment or use default
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '/agent-studio'
    
    // Check if the request is for the studio path
    const isStudioPath = pathname.startsWith(`${basePath}/studio`)
    
    if (isStudioPath) {
        // Get the user from cookies or session (you'll need to implement this part)
        // For now, using a simple check
        const user = true // Replace with actual user check
        
        if (!user) {
            // Redirect to login page with the full URL including base path
            const loginUrl = new URL(`${basePath}/`, request.url)
            return NextResponse.redirect(loginUrl)
        }
    }
    
    return NextResponse.next()
}

export const config = {
    matcher: ['/studio/:path*'] // The matcher should be relative to the base path
}