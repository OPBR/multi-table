import { useState } from 'react'
import { MultiTable, VERSION } from '@multi-table/core'

const sampleData = [
  { id: 1, name: 'Alice', age: 28, city: 'New York', role: 'Engineer' },
  { id: 2, name: 'Bob', age: 34, city: 'London', role: 'Designer' },
  { id: 3, name: 'Charlie', age: 22, city: 'Tokyo', role: 'Developer' },
  { id: 4, name: 'Diana', age: 29, city: 'Berlin', role: 'Manager' },
]

function App() {
  const [data] = useState(sampleData)

  return (
    <div className="app">
      <header className="header">
        <h1>Multi-Table</h1>
        <p className="version">v{VERSION}</p>
        <p className="description">A powerful multi-dimensional table component for React</p>
      </header>

      <main className="main">
        <section className="section">
          <h2>Basic Usage</h2>
          <div className="demo-container">
            <MultiTable data={data} />
          </div>
        </section>

        <section className="section">
          <h2>Custom Columns</h2>
          <div className="demo-container">
            <MultiTable data={data} columns={['name', 'role', 'city']} />
          </div>
        </section>

        <section className="section">
          <h2>Installation</h2>
          <pre className="code-block">
            <code>pnpm add @multi-table/core</code>
          </pre>
        </section>

        <section className="section">
          <h2>Quick Start</h2>
          <pre className="code-block">
            <code>{`import { MultiTable } from '@multi-table/core'

const data = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
]

function App() {
  return <MultiTable data={data} />
}`}</code>
          </pre>
        </section>
      </main>

      <footer className="footer">
        <p>MIT License</p>
      </footer>
    </div>
  )
}

export default App
