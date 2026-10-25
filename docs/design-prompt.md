# Website design prompt: Curriculum Explorer & Assessment

Build a single-page, responsive **interactive course catalog with built-in quizzes**, called **"Curriculum Explorer"**. The subtitle is *"Interactive module directory & knowledge assessment"*. It should feel clean, calm and modern, in a Google Material 3 style: soft neutral surfaces, thin 1px borders, rounded corners, plenty of white space and no decorative icons.

## Visual style

- **Fonts:** "Google Sans Flex" for all text and "Google Sans Code" (monospace) for small details. Use weight 540 for emphasis.
- **Light theme colors:** page `#fdfcfc`, cards `#ffffff`, recessed panels `#f2f0f0`, hover `#e6e6e6`, borders `#e3e3e3`, text `#000`, secondary text `rgba(0,0,0,0.55)`, primary/accent blue `#3186ff`.
- **Status colors:** green `#008052` on `#daf9d4` for correct, red `#de2d29` on `#ffdeec` for wrong.
- **Dark theme:** follows `prefers-color-scheme`. Use page `#0f0f0f`, panels `#141414`, cards `#1c1c1c`, with the same accent logic.
- **Spacing scale:** 4 / 8 / 12 / 16 / 20 / 24px. **Corner radius:** 8px for small items, 12px for cards, fully rounded (999px) for pills, chips and the search field.
- **Domain colors:** each domain gets a soft tinted pill badge (15% opacity background, solid text, uppercase, 12px, letter-spacing 0.5px):
  - Networking: blue `#2575fc`
  - Cloud: violet `#705ec2`
  - Security: magenta `#c84288`
- **Motion:** 0.15s background and border transitions. The chevron rotates 180° in 0.2s when a card opens.

## Layout (top to bottom, single column, full width)

1. **Header card** (white, bordered, 12px radius): the title "Curriculum Explorer" and the subtitle on the left. On the right, a rounded **progress pill** reading **"Mastery: 0/33 Passed"** that updates live. The two sides wrap on small screens.
2. **Filter panel** (recessed grey panel):
   - A row of toggle **chips**: *All Domains · Networking · Cloud · Security*. One is active at a time.
   - Below it, a pill-shaped **search field** ("Search module title or topic…", blue border on focus) that fills the row, next to a **difficulty dropdown**: *All Difficulties / Beginner / Intermediate / Advanced*.
3. **Module list:** a stack of **accordion cards** with 8px gaps.
   - **Collapsed:** the bold module title, then a row with the domain badge, the difficulty in small grey monospace, and an optional status ("Passed" in green or "Retry" in red). A ▼ chevron sits on the right. The card turns grey on hover.
   - **Expanded:** the border turns blue. Below a divider, show a short grey description, then a **quiz box** (recessed panel) with one question and **4 full-width answer buttons**. Clicking an answer locks all four. The correct one turns green with ✔ and a wrong pick turns red with ✘. Only one card is open at a time.
4. **Pagination bar:** a tonal "Previous" button on the left, "Page X of Y" in the center and "Next" on the right. Show 8 modules per page and disable the buttons at the ends.
5. **Empty state:** a centered grey panel saying "No modules match your current filters." with the hint "Try adjusting your domain, difficulty or search term."

## Behavior

- Domain, difficulty and search filters combine. Search matches the title and the description. Changing any filter resets to page 1.
- The mastery score counts correct answers across all modules.
- Plain HTML, CSS and vanilla JS in a single file, with all design values defined as CSS custom properties.

## Content (33 modules, each with a description and one 4-option question)

- **Networking (1–10):** OSI & TCP/IP Foundations, IPv4/IPv6 Subnetting, Ethernet Switching & VLANs, OSPF & BGP Routing, TCP vs UDP, DNS Architecture, DHCP, NAT/PAT, QoS Management, Wi-Fi 6
- **Cloud (11–20):** Cloud Fundamentals, Virtualization & Hypervisors, Docker & OCI, Kubernetes, Terraform IaC, Cloud Storage, Serverless, Load Balancing, High Availability & DR, FinOps
- **Security (21–33):** IAM, PKI & Cryptography, Zero Trust, OWASP Top 10, Firewalls & IDS/IPS, EDR, CSPM, SIEM & SOC, Vulnerability Management, Incident Response & Forensics, API Security & OAuth 2.0, Penetration Testing, Compliance (NIST/ISO/SOC2)
