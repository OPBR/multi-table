import { useState, useEffect } from 'react'
import { MultiTable, VERSION, type ThemeMode } from '@multi-table/core'
import type { TableData, Column, Row } from '@multi-table/shared'

const createSampleData = (): TableData => {
  const columns: Column[] = [
    { key: 'name', type: 'text', title: 'Name', width: 150 },
    { key: 'age', type: 'number', title: 'Age', width: 80 },
    { key: 'city', type: 'text', title: 'City', width: 120 },
    { key: 'role', type: 'select', title: 'Role', width: 120 },
    { key: 'email', type: 'email', title: 'Email', width: 200 },
    { key: 'active', type: 'checkbox', title: 'Active', width: 80 },
  ]

  const rows: Row[] = [
    {
      id: '1',
      cells: {
        name: { value: 'Alice Johnson' },
        age: { value: 28 },
        city: { value: 'New York' },
        role: { value: [{ label: 'Engineer', value: 'engineer', color: '#dbeafe' }] },
        email: { value: 'alice@example.com' },
        active: { value: true },
      },
    },
    {
      id: '2',
      cells: {
        name: { value: 'Bob Smith' },
        age: { value: 34 },
        city: { value: 'London' },
        role: { value: [{ label: 'Designer', value: 'designer', color: '#fce7f3' }] },
        email: { value: 'bob@example.com' },
        active: { value: true },
      },
    },
    {
      id: '3',
      cells: {
        name: { value: 'Charlie Brown' },
        age: { value: 22 },
        city: { value: 'Tokyo' },
        role: { value: [{ label: 'Developer', value: 'developer', color: '#d1fae5' }] },
        email: { value: 'charlie@example.com' },
        active: { value: false },
      },
    },
    {
      id: '4',
      cells: {
        name: { value: 'Diana Ross' },
        age: { value: 29 },
        city: { value: 'Berlin' },
        role: { value: [{ label: 'Manager', value: 'manager', color: '#fef3c7' }] },
        email: { value: 'diana@example.com' },
        active: { value: true },
      },
    },
    {
      id: '5',
      cells: {
        name: { value: 'Eve Williams' },
        age: { value: 31 },
        city: { value: 'Sydney' },
        role: { value: [{ label: 'Architect', value: 'architect', color: '#e0e7ff' }] },
        email: { value: 'eve@example.com' },
        active: { value: true },
      },
    },
    {
      id: '6',
      cells: {
        name: { value: 'Frank Miller' },
        age: { value: 45 },
        city: { value: 'Toronto' },
        role: { value: [{ label: 'Director', value: 'director', color: '#fae8ff' }] },
        email: { value: 'frank@example.com' },
        active: { value: false },
      },
    },
  ]

  return {
    id: 'sample-table',
    name: 'Team Members',
    columns,
    rows,
  }
}

const createLargeData = (count: number): TableData => {
  const columns: Column[] = [
    { key: 'id', type: 'autoNumber', title: 'ID', width: 80 },
    { key: 'name', type: 'text', title: 'Name', width: 150 },
    { key: 'score', type: 'number', title: 'Score', width: 100 },
    { key: 'status', type: 'select', title: 'Status', width: 120 },
    { key: 'website', type: 'url', title: 'Website', width: 180 },
  ]

  const statuses = [
    { label: 'Active', value: 'active', color: '#d1fae5' },
    { label: 'Pending', value: 'pending', color: '#fef3c7' },
    { label: 'Inactive', value: 'inactive', color: '#fee2e2' },
  ]

  const rows: Row[] = Array.from({ length: count }, (_, i) => ({
    id: `row-${i}`,
    cells: {
      id: { value: i + 1 },
      name: { value: `User ${i + 1}` },
      score: { value: Math.floor(Math.random() * 1000) },
      status: { value: [statuses[i % 3]] },
      website: { value: `https://user${i + 1}.example.com` },
    },
  }))

  return {
    id: 'large-table',
    name: 'Large Dataset',
    columns,
    rows,
  }
}

function App() {
  const [sampleData] = useState(() => createSampleData())
  const [largeData] = useState(() => createLargeData(50))
  const [theme, setTheme] = useState<ThemeMode>('system')

  useEffect(() => {
    const html = document.documentElement
    if (theme === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="app">
      <header className="header">
        <h1>Multi-Table</h1>
        <p className="version">v{VERSION}</p>
        <p className="description">
          A powerful multi-dimensional table component for React and Vue
        </p>
      </header>

      <main className="main">
        <section className="section">
          <div className="section-header">
            <h2>Theme</h2>
            <div className="theme-selector">
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
              >
                Light
              </button>
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
              >
                Dark
              </button>
              <button
                className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                onClick={() => setTheme('system')}
              >
                System
              </button>
            </div>
          </div>
          <p className="section-desc">Choose between light, dark, or system color scheme.</p>
        </section>

        <section className="section">
          <h2>Basic Table</h2>
          <p className="section-desc">
            A simple table with various column types including text, number, select, email, and
            checkbox.
          </p>
          <div className="demo-container">
            <MultiTable data={sampleData} theme={theme} />
          </div>
        </section>

        <section className="section">
          <h2>Large Dataset</h2>
          <p className="section-desc">Table with 50 rows demonstrating scrollable content.</p>
          <div className="demo-container">
            <MultiTable data={largeData} theme={theme} />
          </div>
        </section>

        <section className="section">
          <h2>Custom Options</h2>
          <p className="section-desc">Table with row numbers disabled and no stripes.</p>
          <div className="demo-container">
            <MultiTable data={sampleData} theme={theme} showRowNumber={false} striped={false} />
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
import type { TableData } from '@multi-table/shared'

const data: TableData = {
  id: 'my-table',
  name: 'My Table',
  columns: [
    { key: 'name', type: 'text', title: 'Name' },
    { key: 'age', type: 'number', title: 'Age' },
  ],
  rows: [
    {
      id: '1',
      cells: {
        name: { value: 'Alice' },
        age: { value: 25 },
      },
    },
  ],
}

function App() {
  return <MultiTable data={data} theme="light" />
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
