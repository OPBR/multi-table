<script setup lang="ts">
import { computed } from 'vue'
import { extractColumns, type TableProps } from '@multi-table/shared'

const props = withDefaults(
  defineProps<{
    data: TableProps['data']
    columns?: TableProps['columns']
    bordered?: TableProps['bordered']
    striped?: TableProps['striped']
    hoverable?: TableProps['hoverable']
  }>(),
  {
    bordered: false,
    striped: false,
    hoverable: true,
  }
)

const displayColumns = computed(() => {
  return props.columns ?? extractColumns(props.data)
})

const tableClasses = computed(() => {
  return [
    props.bordered ? 'multi-table--bordered' : '',
    props.striped ? 'multi-table--striped' : '',
    props.hoverable ? 'multi-table--hoverable' : '',
  ]
    .filter(Boolean)
    .join(' ')
})
</script>

<template>
  <div class="multi-table">
    <table :class="tableClasses">
      <thead>
        <tr>
          <th v-for="col in displayColumns" :key="col">{{ col }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="(row as any).id ?? index">
          <td v-for="col in displayColumns" :key="col">
            {{ row[col] ?? '' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.multi-table table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.multi-table th,
.multi-table td {
  padding: 0.75rem 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.multi-table th {
  background: #f3f4f6;
  font-weight: 600;
}

.multi-table--bordered th,
.multi-table--bordered td {
  border: 1px solid #e5e7eb;
}

.multi-table--striped tr:nth-child(even) td {
  background: #f9fafb;
}

.multi-table--hoverable tr:hover td {
  background: #f3f4f6;
}
</style>
