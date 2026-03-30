# PrismGraph.ai

**A cinematic AI research command center powered by Neo4j and RocketRide AI.**

PrismGraph.ai transforms static research PDFs into a living, queryable knowledge graph. Instead of just "chatting with an AI," this platform semantically extracts entities, authors, methods, datasets, and claims, mapping them natively into Neo4j. The RocketRide AI agent then synthesizes answers by traversing this graph, backing up every claim with verifiable evidence and confidence scoring.

Built for the **Neo4j + RocketRide AI Hackathon**.

## 🎬 The Demo Story (Live Script)

To experience the full capability of PrismGraph.ai, follow this exact end-to-end demo path:

1. **The Grand Entrance**
   - Open `http://localhost:3000`. You'll see the animated graph particle background and the premium dark-mode cinematic hero section.
   - Click **"Launch Console"** to enter the main workspace.

2. **Graph Formation (The "Aha" Moment)**
   - The graph is currently empty.
   - Click **"Load Demo Data"** in the left sidebar (or the center empty state).
   - *Watch the magic:* An interactive, force-directed React Flow graph will animate into existence. You will see Papers (blue), Authors (green), Topics (purple), Methods (orange), and Claims (red) connect with glowing edges (`CITES`, `SUPPORTS`, `CONTRADICTS`).
   - Click around. Select a node. The **Right Panel** instantly shows details, properties, and DOI links.

3. **Intelligence, Not Just Search**
   - In the top search bar, type: *"What are the main methods in this field and where do papers disagree?"*
   - Press Enter. The **Assistant Panel** opens on the right.
   - You'll see RocketRide AI synthesizing an answer, citing specific papers.
   - Scroll down to see **Evidence Cards**. Notice the color-coded UI for claims that *Support* (Green) or *Contradict* (Red). You'll also see the exact **Graph Reasoning Path** the AI took to find this answer.

4. **The Verification Engine**
   - At the bottom of the Assistant panel, click **"Verify This Answer"**.
   - The **Verification Panel** slides in. 
   - Observe the giant **Confidence Score**. See the **Claims Checklist** validating each sentence of the AI's answer against the graph.
   - Check the **Contradictions** section to see where the literature fights itself (e.g., "BERT requires too much compute" ⚡ VS ⚡ "DistilBERT proves small models work").

5. **Upload & Extract (Graceful Fallback)**
   - Click the **"Upload PDFs"** button in the sidebar.
   - Drag and drop a sample PDF.
   - Watch the multi-stage ingestion UI: *Uploading -> RocketRide AI Extracting -> Neo4j Graph Building*. 
   - *(Note: For demo reliability, the extraction pipeline falls back to an intelligent mock if PDF parsing fails, ensuring the demo never breaks on stage).*

## 🚀 Tech Stack

- **Core Frontend:** Next.js 15 (App Router), React 18
- **Styling:** Tailwind CSS v4, Custom CSS Variables, Glass Morphism
- **Graph Visualization:** React Flow (Force-directed circular layout)
- **Database:** Neo4j (via `neo4j-driver`)
- **AI Engine:** RocketRide AI Abstraction (OpenAI SDK compatible)
- **Animations:** Framer Motion

## 🛠️ Local Setup Instructions

### Prerequisites
- Docker & Docker Compose (for Neo4j)
- Node.js 18+

### 1. Start the Neo4j Database
We use a Docker setup to ensure you have a clean Neo4j 5.x instance with the APOC plugin pre-installed.

```bash
# First, make sure you are in the project directory
cd ~/.gemini/antigravity/scratch/research-graph-ai

# Start Neo4j in the background (use `docker compose` or `docker-compose`)
docker compose up -d

# Wait ~15 seconds for the database to initialize.
```

*Note: The database is accessible at `http://localhost:7474` (username: `neo4j`, password: `password`).*

### 2. Configure Environment Variables
Copy the template to your local environment file:

```bash
cd ~/.gemini/antigravity/scratch/research-graph-ai
cp .env.example .env.local
```

Open `.env.local` and add your **AI API Key** (defaults to an OpenAI layer for RocketRide AI abstraction). *Note: If no key is provided, the app will gracefully use mocked intelligent responses to guarantee the demo works.*

### 3. Install and Run the App

```bash
cd ~/.gemini/antigravity/scratch/research-graph-ai
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) mechanically marvel at the graph!

## 🧠 Why Neo4j + RocketRide AI?

**The Problem:** Traditional RAG (Retrieval-Augmented Generation) uses vector databases that blindly pull chunks of text. This causes hallucinations because the AI loses the *context* and *relationships* between papers (e.g., Paper B contradicts Paper A, but traditional RAG doesn't know that).

**The Solution:** 
1. **Neo4j** acts as the deterministic source of truth. By structuring knowledge into a literal graph, we can perform advanced queries like: *"Find all claims that CONTRADICT this paper's core method."*
2. **RocketRide AI** acts as the synthesis and reasoning engine. It translates the user's question into a graph traversal strategy, reads the structured results, and formulates an evidence-backed answer.

**The result is verified research intelligence, not just a probabilistic chatbot.**
