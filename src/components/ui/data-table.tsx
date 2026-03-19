'use client';

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import {
  Table,
  Pagination,
  Group,
  Select,
  Text,
  ScrollArea,
  ActionIcon,
  Stack,
  Skeleton,
} from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSelector } from '@tabler/icons-react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  loading?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  loading,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <Stack gap="md">
      <ScrollArea>
        <Table verticalSpacing="sm" highlightOnHover withTableBorder withColumnBorders>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Table.Th key={header.id}>
                      <Group justify="space-between" wrap="nowrap" gap={4}>
                        <Text fw={700} size="sm">
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())}
                        </Text>
                        {header.column.getCanSort() && (
                          <ActionIcon
                            variant="subtle"
                            color="gray"
                            onClick={header.column.getToggleSortingHandler()}
                            size="sm"
                          >
                            {header.column.getIsSorted() === 'asc' ? (
                              <IconChevronUp size={14} />
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <IconChevronDown size={14} />
                            ) : (
                              <IconSelector size={14} />
                            )}
                          </ActionIcon>
                        )}
                      </Group>
                    </Table.Th>
                  );
                })}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Table.Tr key={i}>
                  {columns.map((_, j) => (
                    <Table.Td key={j}>
                      <Skeleton height={20} radius="xl" />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={columns.length}>
                  <Text ta="center" py="xl" color="dimmed">
                    No records found
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Text size="sm">Rows per page</Text>
          <Select
            size="xs"
            w={70}
            data={['10', '20', '30', '50']}
            defaultValue={table.getState().pagination.pageSize.toString()}
            onChange={(val) => table.setPageSize(Number(val))}
          />
        </Group>

        <Group gap="xs">
          <Text size="sm" color="dimmed">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </Text>
          <Pagination
            total={table.getPageCount()}
            value={table.getState().pagination.pageIndex + 1}
            onChange={(page) => table.setPageIndex(page - 1)}
            size="sm"
            withEdges
          />
        </Group>
      </Group>
    </Stack>
  );
}

