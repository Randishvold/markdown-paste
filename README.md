# Markdown Pastebin

> A modern, anonymous, and fast Markdown sharing service. Built with Next.js and Tailwind CSS v4.

This web application allows users to anonymously paste, upload, and share Markdown content. Each submission is rendered into a clean, readable HTML page with syntax highlighting, accessible via a unique URL.

## ✨ About This Project

This project was developed as a comprehensive exercise in building a full-stack web application using a modern technology stack. The primary goal was to create a high-performance, aesthetically pleasing, and functional "pastebin" service with a strong focus on user experience and developer best practices.

The core functionality includes server-side rendering of Markdown, a RESTful API for programmatic access, and a responsive, dark-themed user interface. The entire development process involved iterative refinement, debugging complex build issues, and implementing advanced performance optimization techniques like proactive cache warming.

## 🚀 Features

-   **Anonymous Pasting:** No accounts or API keys required. Create and share freely.
-   **File Upload & Direct Input:** Paste Markdown directly into a textarea or upload `.md` files from your device.
-   **Advanced Markdown Rendering:**
    -   Renders all standard Markdown elements, including tables (GFM).
    -   Beautiful syntax highlighting for dozens of languages via Shiki.
    -   Custom-styled inline code and code blocks.
-   **Public REST API:** A simple, unauthenticated API to create and retrieve pastes programmatically.
-   **High-Performance Architecture:**
    -   Built with Next.js App Router.
    -   Static Site Generation (SSG) with Incremental Static Regeneration (ISR) for paste pages.
    -   **Proactive Cache Warming:** New pastes are pre-rendered server-side, ensuring the first user view is always instantaneous.
-   **Modern Dark UI:**
    -   A sleek, responsive, dark-themed interface designed for readability and comfort.
    -   Multi-column layout on desktop that gracefully collapses on mobile devices.
-   **Enhanced UX:**
    -   "Copy to Clipboard" functionality for both paste URLs and code blocks.
    -   Language detection and labeling for code blocks.
    -   Client-side validation for file uploads.

## 🛠️ Tech Stack

-   **Framework:** Next.js (App Router)
-   **Styling:** Tailwind CSS v4 (CSS-first configuration)
-   **Database:** Supabase (Postgres)
-   **Deployment:** Vercel
-   **Markdown Processing:** `unified` with `remark` and `rehype`.
-   **Syntax Highlighting:** `Shiki`.

## 📝 API Usage

The API is public, free, and requires no authentication.

---

### Create a New Paste

-   **Endpoint:** `POST /api/paste`
-   **Method:** `POST`
-   **Headers:**
    -   `Content-Type: application/json`
-   **Request Body:**

    ```json
    {
      "content": "# Hello World\nThis is **Markdown**."
    }
    ```

-   **Success Response (200):**

    ```json
    {
      "id": "abc123xyz",
      "url": "https://your-domain.vercel.app/p/abc123xyz",
      "created_at": "2025-06-18T10:00:00.123Z"
    }
    ```

-   **Error Response (400):**
    ```json
    {
      "error": "Content is required."
    }
    ```

---

### Retrieve a Paste (Raw Content)

-   **Endpoint:** `GET /api/paste/:id`
-   **Method:** `GET`
-   **Success Response (200):**

    ```json
    {
      "id": "abc123xyz",
      "content": "# Hello World\nThis is **Markdown**.",
      "created_at": "2025-06-18T10:00:00.123Z"
    }
    ```

-   **Error Response (404):**
    ```json
    {
      "error": "Paste not found."
    }
    ```

---

### Get Latest Pastes

-   **Endpoint:** `GET /api/pastes`
-   **Method:** `GET`
-   **Query Parameters (Optional):**
    -   `limit`: Number of pastes to return. Defaults to `10`, with a maximum enforced limit of `50`.
    -   Example: `/api/pastes?limit=5`
-   **Success Response (200):** An array of paste objects.

    ```json
    [
      {
        "id": "def456",
        "content": "## Another Paste...",
        "created_at": "2025-06-18T10:05:00.456Z"
      },
      {
        "id": "abc123xyz",
        "content": "# Hello World...",
        "created_at": "2025-06-18T10:00:00.123Z"
      }
    ]
    ```

## 💻 API Examples

**Note:** Replace `https://markdownpasteit.vercel.app` with your own deployed application URL.

### cURL

```bash
# Create a new paste
PASTE_URL=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d '{"content": "# Hello from cURL\n\n- Item 1\n- Item 2"}' \
  https://markdownpasteit.vercel.app/api/paste | grep -o '"url":"[^"]*' | cut -d'"' -f4)

echo "Paste created at: $PASTE_URL"

# Retrieve the raw content
curl "${PASTE_URL/p/api/paste}"
```

### Python (requests)

```python
import requests

# Your application's domain
BASE_URL = "https://markdownpasteit.vercel.app"

try:
    # 1. Create a new paste
    markdown_content = "## Python Example\n\nThis paste was created using a Python script.\n\n```python\nprint('Hello, Pastebin!')\n```"
    response = requests.post(
        f"{BASE_URL}/api/paste", 
        json={"content": markdown_content}
    )
    response.raise_for_status()  # Raises an exception for bad status codes
    
    paste_data = response.json()
    print(f"✅ Paste created successfully!")
    print(f"   URL: {paste_data['url']}")

    # 2. Retrieve the raw content
    paste_id = paste_data['id']
    response_get = requests.get(f"{BASE_URL}/api/paste/{paste_id}")
    response_get.raise_for_status()
    
    retrieved_content = response_get.json()['content']
    print("\n✅ Content retrieved successfully:")
    print(retrieved_content)

except requests.exceptions.RequestException as e:
    print(f"❌ An error occurred: {e}")

```

### JavaScript (Node.js or Browser `fetch`)

```javascript
const BASE_URL = "https://markdownpasteit.vercel.app";

async function main() {
  try {
    // 1. Create a new paste
    const markdownContent = `
### JavaScript Fetch API Example

This content was sent from a JavaScript environment.

\`\`\`javascript
const greeting = 'Hello, world!';
console.log(greeting);
\`\`\`
    `;

    const createResponse = await fetch(`${BASE_URL}/api/paste`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content: markdownContent }),
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create paste: ${await createResponse.text()}`);
    }

    const newPaste = await createResponse.json();
    console.log(`✅ Paste created at: ${newPaste.url}`);

    // 2. Retrieve the content
    const getResponse = await fetch(`${BASE_URL}/api/paste/${newPaste.id}`);
    if (!getResponse.ok) {
      throw new Error(`Failed to retrieve paste: ${await getResponse.text()}`);
    }
    
    const retrievedPaste = await getResponse.json();
    console.log('\n✅ Retrieved Content:');
    console.log(retrievedPaste.content);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

main();
```

## ✅ Markdown Rendering Showcase

The following is a sample of Markdown that demonstrates the rendering capabilities of this application, including headings, lists, text formatting, tables, and code blocks with syntax highlighting.

---

# Heading 1: The World of Markdown

This document showcases the various elements rendered by our pastebin service.

## Heading 2: Text Formatting

You can use **bold text**, _italic text_, and even ***both***. Strikethrough is also supported with `~~strikethrough~~`.

Inline code, like `const variable = 'hello';`, is styled with a custom background and color for better visibility, and the surrounding backticks are hidden.

> This is a blockquote. It's great for highlighting important information or quoting sources. A wise person once said, "The only thing I know is that I know nothing."

## Heading 2: Lists

### Unordered List
-   Item 1: A simple list item.
-   Item 2: With some sub-items.
    -   Sub-item A
    -   Sub-item B
-   Item 3: The final item in the list.

### Ordered List
1.  First, prepare the environment.
2.  Second, write the code.
    1.  Write the HTML structure.
    2.  Add CSS for styling.
3.  Third, deploy the application.

## Heading 2: Tables

Tables are rendered cleanly, as supported by GitHub Flavored Markdown.

| Technique      | Potential Benefits                      | Potential Risks                                 |
|----------------|-----------------------------------------|-------------------------------------------------|
| Profile Scraping | Automated data extraction, efficiency.  | Violates ToS, ethical concerns, legal risks.    |
| No-Code Tools  | Ease of use, accessibility.             | Still subject to ethical/legal considerations.  |
| Discord API    | Direct access to data, controlled env.  | Restricted access, requires technical expertise.|

## Heading 2: Links and Images

You can link to external sites, like the [official Next.js documentation](https://nextjs.org/docs).

Images are also supported:
![A random placeholder image of a landscape](https://picsum.photos/seed/markdown/600/300)

## Heading 2: Code Blocks

Code blocks feature syntax highlighting via Shiki, a "Copy" button on hover, and an automatically detected language label.

```javascript
// Example of JavaScript code
function greet(name) {
  // Using template literals for easy string formatting
  const message = `Hello, ${name}! Welcome to our pastebin.`;
  console.log(message);
}

greet('Developer');
```

```python
# Example of Python code
class Paste:
    def __init__(self, content, language="text"):
        self.content = content
        self.language = language

    def display(self):
        """Prints the content of the paste."""
        print(f"--- Language: {self.language} ---")
        print(self.content)

my_paste = Paste("print('Syntax highlighting is working!')", "python")
my_paste.display()
```

```json
{
  "project": "Markdown Pastebin",
  "status": "Complete",
  "features": [
    "API",
    "File Upload",
    "Dark Mode"
  ],
  "isAwesome": true
}
```

---