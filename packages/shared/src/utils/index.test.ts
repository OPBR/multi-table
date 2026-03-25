import { describe, it, expect } from 'vitest'
import { generateId, getValueByPath, sortData, flattenData, extractColumns } from '../utils'

describe('generateId', () => {
  it('should generate a valid UUID', () => {
    const id = generateId()
    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)
  })

  it('should generate unique ids', () => {
    const ids = new Set<string>()
    for (let i = 0; i < 100; i++) {
      ids.add(generateId())
    }
    expect(ids.size).toBe(100)
  })
})

describe('getValueByPath', () => {
  it('should get value from simple path', () => {
    const obj = { name: 'test' }
    expect(getValueByPath(obj, 'name')).toBe('test')
  })

  it('should get value from nested path', () => {
    const obj = { user: { name: 'test' } }
    expect(getValueByPath(obj, 'user.name')).toBe('test')
  })

  it('should return undefined for non-existent path', () => {
    const obj = { name: 'test' }
    expect(getValueByPath(obj, 'age')).toBeUndefined()
  })

  it('should handle deeply nested paths', () => {
    const obj = { a: { b: { c: { d: 'value' } } } }
    expect(getValueByPath(obj, 'a.b.c.d')).toBe('value')
  })
})

describe('sortData', () => {
  const data = [
    { name: 'Charlie', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 35 },
  ]

  it('should sort ascending', () => {
    const sorted = sortData(data, 'name', 'asc')
    expect(sorted[0].name).toBe('Alice')
    expect(sorted[1].name).toBe('Bob')
    expect(sorted[2].name).toBe('Charlie')
  })

  it('should sort descending', () => {
    const sorted = sortData(data, 'age', 'desc')
    expect(sorted[0].age).toBe(35)
    expect(sorted[1].age).toBe(30)
    expect(sorted[2].age).toBe(25)
  })

  it('should return original data when direction is null', () => {
    const sorted = sortData(data, 'name', null)
    expect(sorted).toEqual(data)
  })

  it('should handle null values', () => {
    const dataWithNull = [{ name: 'Alice' }, { name: null }, { name: 'Bob' }]
    const sorted = sortData(dataWithNull, 'name', 'asc')
    expect(sorted[0].name).toBe('Alice')
    expect(sorted[2].name).toBeNull()
  })
})

describe('flattenData', () => {
  it('should flatten simple data', () => {
    const data = [{ id: 1, name: 'test' }]
    const result = flattenData(data)
    expect(result).toHaveLength(1)
    expect(result[0]._depth).toBe(0)
  })

  it('should flatten nested data', () => {
    const data = [
      {
        id: 1,
        name: 'parent',
        children: [{ id: 2, name: 'child' }],
      },
    ]
    const result = flattenData(data)
    expect(result).toHaveLength(2)
    expect(result[0]._depth).toBe(0)
    expect(result[1]._depth).toBe(1)
    expect(result[1]._parentKey).toBe('1')
  })

  it('should handle deeply nested data', () => {
    const data = [
      {
        id: 1,
        children: [
          {
            id: 2,
            children: [{ id: 3 }],
          },
        ],
      },
    ]
    const result = flattenData(data)
    expect(result).toHaveLength(3)
    expect(result[0]._depth).toBe(0)
    expect(result[1]._depth).toBe(1)
    expect(result[2]._depth).toBe(2)
  })
})

describe('extractColumns', () => {
  it('should extract columns from data', () => {
    const data = [
      { id: 1, name: 'Alice', age: 25 },
      { id: 2, name: 'Bob' },
    ]
    const columns = extractColumns(data)
    expect(columns).toContain('id')
    expect(columns).toContain('name')
    expect(columns).toContain('age')
  })

  it('should exclude children column', () => {
    const data = [{ id: 1, children: [] }]
    const columns = extractColumns(data)
    expect(columns).not.toContain('children')
  })

  it('should return empty array for empty data', () => {
    expect(extractColumns([])).toEqual([])
  })

  it('should return unique columns', () => {
    const data = [{ a: 1 }, { a: 2, b: 3 }, { a: 4, c: 5 }]
    const columns = extractColumns(data)
    expect(columns.sort()).toEqual(['a', 'b', 'c'])
  })
})
