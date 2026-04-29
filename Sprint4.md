## TEAM4-08: Final Public Flow Demo Script

### Demo Purpose
This section supports the final project video by explaining how to demonstrate the public share and download flow from a recipient’s perspective.

### Public Flow Demo Order
1. Open the ShareX landing page.
2. Navigate to the public download flow.
3. Open a token-based public download route such as `/download/:token`.
4. Show the file metadata section.
5. Explain the filename, size, upload time, token, and expiration information.
6. Show the download button for an active file.
7. Show the invalid-token route to demonstrate user-friendly error handling.
8. Mention that Cypress smoke tests verify the public download route and invalid-token handling.

### Suggested Narration
“Hi, I worked on the public-facing share and download experience for ShareX. This part of the application is designed for recipients who receive a shared file link.

First, I open the public download route. The recipient can view file details before downloading, including filename, size, upload information, token, and expiration status.

If the link is active, the download action is available. If the link is expired, revoked, or invalid, the frontend shows a clear message instead of failing silently.

This makes the recipient experience easier to understand and more reliable during real usage.

I also verified this public flow through frontend unit tests and Cypress smoke tests, including the public download route and invalid-token behavior.”

### Demo Readiness Notes
- Route order is clear for final video narration.
- Public download page is presentable.
- Invalid-link handling is easy to demonstrate.
- Unit and Cypress tests support the public flow.