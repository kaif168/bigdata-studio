# BigData Studio — Interactive SQL & Big Data Analytics Lab

**BigData Studio** is an enterprise-grade, in-browser Big Data Analytics laboratory and SQL playground built with React, TypeScript, Tailwind CSS, Monaco Editor, and genuine in-browser **DuckDB-Wasm** analytical execution.

Developed as an academic capstone platform for College Big Data Analytics courses.

---

## 🌟 Key Features

1. **Real In-Browser SQL Playground (DuckDB-Wasm)**
   - Monaco Editor with ANSI SQL syntax highlighting, line numbers, autocomplete, and query formatting.
   - Run queries via UI or `Ctrl + Enter` / `Cmd + Enter`.
   - Results workspace with multi-column sorting, pagination, cell copying, schema inspection, and CSV export.
   - Zero remote database servers, API keys, or paid services required.

2. **6 Realistic Synthetic Demonstrator Datasets**
   - `sales`: E-commerce orders with amounts, categories, and payment rails.
   - `students`: Academic performance, departments, semesters, attendance, and exam scores.
   - `web_events`: Clickstream telemetry events, sessions, page routes, and device types.
   - `sensor_readings`: Industrial IoT environmental telemetry with temperatures, humidity, and alert flags.
   - `retail_transactions`: Omnichannel store transactions, discounts, customer segments, and cities.
   - `employees`: Enterprise workforce analytics, salaries, roles, and performance ratings.

3. **Custom Data Ingestion**
   - In-browser parsing of user-uploaded **CSV** and **JSON** files directly into queryable DuckDB tables.
   - Automatic schema inference and local persistence via IndexedDB / LocalStorage.

4. **Curated Query Library (32 Examples)**
   - Organized across **Beginner**, **Intermediate**, and **Advanced** tiers.
   - Covers filters, aggregations, HAVING, multi-table joins, subqueries, Common Table Expressions (CTEs), and analytical Window functions (`DENSE_RANK`, `NTILE`, `LAG`, `ROW_NUMBER`).
   - One-click "Run Example in Playground" button.

5. **Dynamic Visual Analytics Studio**
   - Recharts-powered interactive chart builder supporting Bar, Horizontal Bar, Line, Area, Pie, and Scatter plots.
   - Generates live DuckDB analytical queries on demand.

6. **Interactive MapReduce Execution Simulator**
   - Dynamic 6-stage simulation: Input -> Input Splitting -> Map -> Shuffle & Sort -> Reduce -> Final Output.
   - Works on any custom input string (default: `"big data is big data"`).
   - Intermediate key-value tables and step-by-step animations.

7. **26 Practical SQL Challenges & Concept Quizzes**
   - Interactive SQL problem statements with starter code, reference solution evaluation, hints, and score tracking.
   - Automated evaluation compares student query results row-by-row and column-by-column against reference query outputs.

8. **Big Data Curriculum Hub (5 Modules)**
   - Module 1: Big Data Fundamentals (5 Vs, Data classification, Traditional vs Big Data)
   - Module 2: Hadoop Ecosystem (HDFS NameNode/DataNode, YARN, MapReduce)
   - Module 3: Apache Spark (In-Memory DAG, RDDs vs DataFrames, Lazy Evaluation)
   - Module 4: Data Storage & NoSQL (Hive, HBase, MongoDB, Cassandra, Graph)
   - Module 5: Big Data Engineering (ETL vs ELT, Streaming vs Batch, Parquet, ORC, Avro)
   - Built-in interactive knowledge-check quizzes with instant feedback.

9. **Audit Trail & Personalization**
   - Query execution history with latency tracking, status filtering, and query rerun.
   - Bookmarked saved queries repository with rename and metadata tagging.
   - Configurable themes (Dark Navy & Light Studio), editor font sizing, and student identity metadata.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons
- **SQL Analytical Engine**: `@duckdb/duckdb-wasm` (Self-hosted WebAssembly)
- **Code Editor**: `@monaco-editor/react` (Monaco Editor)
- **Data Visualizations**: Recharts
- **Routing**: React Router v7
- **Testing**: Vitest
- **Build System**: Vite

---

## 🚀 Setup & Execution Instructions

### Prerequisites
- Node.js v20+ or v22+
- npm v10+

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Test Suite
```bash
npm run test
```

### 4. Build Production Bundle
```bash
npm run build
```

---

## ⚖️ Academic Notice & Limitations

- **Client-Side Execution**: All SQL queries execute locally in your browser memory via WebAssembly. No data leaves your machine.
- **Memory Boundaries**: For optimal responsiveness, uploaded custom CSV/JSON files should stay under 15MB.
- **Simulations**: The MapReduce simulator is an educational visualization demonstrating cluster distributed logic locally in JavaScript; it does not claim to run an actual multi-node physical Hadoop cluster.
