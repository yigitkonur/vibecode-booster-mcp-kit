# 🔍 Deep Research Bug Fix MCP

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![CI](https://github.com/yigitkonur/deep-research-bug-fix-mcp/workflows/CI/badge.svg)](https://github.com/yigitkonur/deep-research-bug-fix-mcp/actions)

> **Your debugging sherlock holmes on steroids** 🕵️‍♂️
> When bugs get weird and your Stack Overflow fu fails you, this AI research beast has your back.

## 🤔 What the heck is this?

You know that feeling when you're staring at a bug for 3 hours, and all you can think is *"this should work, why doesn't it work, WHAT IS HAPPENING?"* 😭

Well, meet your new debugging buddy. This isn't just another "search the internet" tool. This is a **structured problem-solving machine** that transforms your frustrated "it's broken!!!1!" into a coherent investigation that actually gets results.

Think of it as having a senior developer peer over your shoulder, except this one:
- Never judges your code 😌
- Actually reads the error messages 📖
- Knows about that weird edge case from 2019 🧠
- Won't steal your snacks 🍪

## 🚀 Quick Setup (5 minutes, I promise)

```bash
# The usual dance
npm install && npm run build

# Drop your API key like it's hot
cp .env.example .env
echo "JINA_API_KEY=your_shiny_api_key" >> .env

# Test that it's breathing
npm test
```

## 🔌 Claude Code Integration

Chuck this into your `.mcp.json`:

```json
{
  "mcpServers": {
    "debug-wizard": {
      "command": "node",
      "args": ["/absolute/path/to/deep-research-bug-fix-mcp/dist/index.js"],
      "env": {
        "JINA_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

*Pro tip: Use absolute paths unless you enjoy mysterious "command not found" errors* 🙃

## 🧙‍♂️ The Magic Behind `deep_research`

Here's where it gets spicy. Instead of throwing random search terms at Google and praying, this tool makes you think like a detective:

### 🎯 The Secret Sauce: Structure

```
BACKGROUND: [What were you building? What changed? Set the scene!]
CURRENT ISSUE: [What's actually broken? Be specific, my friend]
EVIDENCE: [Error messages, logs, versions, code snippets - ALL OF IT]
GOAL: [What does victory look like? What are your constraints?]
QUESTIONS:
1. [What's the root cause of this madness?]
2. [How do I configure X without breaking Y?]
3. [What would a senior dev do here?]
4. [What are my escape routes if this doesn't work?]
5. [What should I debug next?]
```

### 💡 Why This Template Absolutely Slaps

**Traditional debugging:**
- Google error message 🔍
- Copy random Stack Overflow answer 📋
- Try it, break something else 💥
- Repeat until deadline 😅

**With this tool:**
- Force yourself to explain the full context 🧠
- Get research that actually understands your situation 🎯
- Multiple solution paths (because one size never fits all) 🛤️
- Learn the *why* behind the fix 🤓

## 🎪 Real-World Bug Slaying Examples

### 🚨 TypeScript Having a Meltdown

```typescript
deep_research_question: `
BACKGROUND: Working on a React project, everything was smooth sailing until I updated some dependencies. Now TypeScript is throwing a tantrum about string methods.

CURRENT ISSUE: Getting "Property 'replaceAll' does not exist on type 'string'" but like... it totally should exist in 2024, right?

EVIDENCE:
- Error: src/utils/formatter.ts(23,34): error TS2339: Property 'replaceAll' does not exist on type 'string'
- TypeScript version: 4.9.5 (maybe this is the problem?)
- tsconfig.json target: "ES2020"
- Node version: 18.17.0
- The offending line: const cleaned = text.replaceAll(/[^\w\s]/g, '');

GOAL: Make this build work so I can deploy before my manager starts asking questions. Need the cleanest solution that won't break in production.

QUESTIONS:
1. Why is TypeScript being so dramatic about replaceAll?
2. Should I update TypeScript or change my approach?
3. What's the most bulletproof way to handle string replacement?
4. How do I prevent this from happening again?
5. Is there a polyfill I should know about?
`
```

### 🔐 OAuth Decided to Take a Break

```typescript
deep_research_question: `
BACKGROUND: Building a Next.js app with GitHub OAuth. Login works perfectly on my machine (of course), but users are getting randomly logged out. Some stay logged in forever, others can't stay logged in for 5 minutes.

CURRENT ISSUE: Session persistence is playing hard to get. Mostly happens on mobile browsers and incognito mode, because of course it does.

EVIDENCE:
- next-auth v4.24.5 with GitHub provider
- Cookie settings: secure: true, httpOnly: true, sameSite: 'lax'
- Random error: "JWT session token signature verification failed"
- DevTools shows cookies are there, but session.user is undefined
- Middleware runs but req.nextauth.token randomly becomes null

GOAL: Sessions that actually persist across all browsers and devices. Users should stay logged in until they explicitly log out (or the heat death of the universe).

QUESTIONS:
1. Why do JWT signatures randomly fail?
2. What cookie settings work best for cross-browser compatibility?
3. How do I debug this without losing my sanity?
4. Should I switch to a different session strategy?
5. What mobile browser quirks am I missing?
`
```

### 🐌 Mobile Performance Goes BRRRR (But Slowly)

```typescript
deep_research_question: `
BACKGROUND: React app that screams on desktop but crawls on mobile. Users are complaining about 5-8 second load times, and my Lighthouse scores are making me cry.

CURRENT ISSUE: Mobile Lighthouse says "Largest Contentful Paint: 4.2s" which is basically saying "your users have time to make coffee while waiting."

EVIDENCE:
- Mobile Lighthouse: 67/100 (ouch)
- Desktop Lighthouse: 94/100 (why can't you both be this good?)
- Bundle size: 234KB gzipped (seems reasonable?)
- React Router chunk: 45KB (suspicious...)
- Testing on iPhone 12 and Pixel 6
- Network waterfall shows delays I can't explain

GOAL: Mobile Lighthouse >90 and load times <2 seconds. I want my app to feel snappy, not like it's running through molasses.

QUESTIONS:
1. What makes mobile performance so different from desktop?
2. Is React Router secretly a performance vampire?
3. What's the mobile optimization playbook for React apps?
4. Should I split my bundles differently?
5. What tools will help me debug mobile-specific issues?
`
```

## ⚙️ Configuration That Actually Matters

### 🎛️ Essential Knobs to Turn

- **`deep_research_question`** (required): Your beautifully structured problem story
- **`reasoning_effort`**:
  - `"high"` (default): Maximum detective mode, best for complex bugs 🔍
  - `"medium"`: Good balance for most scenarios ⚖️
  - `"low"`: Quick answers for simple stuff 🏃‍♂️

### 🔧 Advanced Settings for Power Users

- **`team_size`**: 1-5 parallel AI agents (default: 5) — scale down if your wallet is crying 💸
- **`budget_tokens`**: Token limit (default: 10000) — bump it up for really gnarly problems 🧮
- **`boost_hostnames`**: Prioritize the good stuff (e.g., `["stackoverflow.com", "docs.microsoft.com"]`) 📚
- **`exclude_hostnames`**: Block the sketchy sites that always have malware in their code examples 🚫

## 🎨 Why Claude Code Devs Love This Thing

### 🧠 It Changes How You Think About Bugs

Instead of the usual "poke it with a stick until it works" approach:

1. **You're forced to articulate the problem clearly** — no more "it's broken"
2. **You get comprehensive research** — not just the first Stack Overflow result
3. **Multiple solution paths** — because Plan B is always good to have
4. **Actual understanding** — learn why the fix works, not just what to copy-paste

### 🔄 The New Debugging Flow

```mermaid
graph LR
    A[Hit Bug 🐛] --> B[Use Structured Template 📝]
    B --> C[Get Deep Research 🔍]
    C --> D[Multiple Solutions 💡]
    D --> E[Apply with Confidence ✅]
    E --> F[Actually Understand Why 🧠]
```

## 🚀 What Makes This Different from "Just Google It"

### 😤 The Old Way:
- Panic and search error message
- Try 47 different Stack Overflow answers
- Break 3 other things
- Eventually find solution buried in GitHub issue #2847
- Still don't understand why it works

### 😎 The New Way:
- **Context Collection**: Full story with all the gory details
- **Systematic Research**: Multiple sources, cross-referenced, fact-checked
- **Solution Synthesis**: Not just fixes, but *good* fixes with explanations
- **Best Practices**: Learn the right way, not just the working way
- **Backup Plans**: Multiple approaches in case Murphy's Law strikes

## 🛠 Development Commands

```bash
npm run dev       # Development mode with hot reload
npm test          # Run the test suite
npm run check     # Lint and format (make it pretty)
npm run check:fix # Auto-fix what can be fixed
npm run build     # Production build that actually works
```

## 📊 Performance Stats (Because We Measure Everything)

- **Startup**: <1 second (faster than your coffee machine)
- **Memory**: ~40MB RSS (lighter than your Node.js project)
- **Response Time**: ~1-2 seconds (patience, grasshopper)
- **Cost Control**: Token budgets so you don't accidentally spend your salary

## 🤝 Contributing (Join the Bug-Slaying Squad)

1. Fork this bad boy
2. Create a feature branch with a descriptive name
3. Add tests (yes, really)
4. Make sure CI is happy (green builds only)
5. Submit a PR with a story about what you fixed

## 🎯 Pro Tips for Maximum Bug-Slaying Efficiency

1. **Use the template religiously** — I know it seems like a lot, but it works 📝
2. **Include actual code snippets** — "somewhere in my auth file" isn't helpful 💻
3. **Copy-paste those error messages** — every character matters 🔍
4. **Mention versions** — dependency hell is real 📦
5. **Define victory conditions** — know when you're done ✅

## 📄 License

MIT License - go wild, build cool stuff, just don't blame me if your code becomes sentient.

## 👨‍💻 Author

Built with ❤️ (and lots of coffee ☕) by [Yiğit Konur](https://github.com/yigitkonur)

---

*"The best debugger was the AI we made along the way"* — Ancient Developer Proverb (probably)

### 🎪 P.S.

Still reading? You're either really thorough or really bored. Either way, go forth and squash those bugs! 🐛✨