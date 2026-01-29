# Coherence AI | Client Scraper

A premium Next.js application designed to monitor and manage the consistency (coherence) between client web pages and official company product offerings. Powered by AI agents to automate scraping, transcription, and discrepancy detection.

![Dashboard Preview](https://via.placeholder.com/800x450?text=Dashboard+Preview)

## 🚀 Features

- **Insights Dashboard**: High-level overview of compliance across all monitored pages.
- **Automated Web Scraping**: Uses Playwright to capture text content from client URLs.
- **AI-Powered Analysis**: Leverages OpenAI to compare live web content against the official product catalog.
- **Airtable Integration**: Full two-way sync with Airtable as the primary database.
- **Smart Product Loader**: Automatically extract product details from websites or brochures using AI.

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Vanilla CSS (Premium Dark Theme)
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Automation**: Playwright
- **AI**: OpenAI API
- **Database**: Airtable API

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- Airtable Account (with Personal Access Token)
- OpenAI API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/clientscraper.git
   cd clientscraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   # Airtable
   AIRTABLE_API_KEY=your_token
   AIRTABLE_BASE_ID=your_base_id

   # OpenAI
   OPENAI_API_KEY=your_key
   ```
   Refer to `.env.example` for the full list of variables.

4. Run the development server:
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📄 License

MIT
