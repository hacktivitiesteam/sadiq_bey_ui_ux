'use client';

import * as React from 'react';
import { getFeedback } from '@/lib/firebase-actions';
import { Feedback } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AppHeader from '@/components/app/app-header';
import { format } from 'date-fns';
import { useFirestore } from '@/firebase';
import { Download } from 'lucide-react';
import Papa from 'papaparse';
import { Input } from '@/components/ui/input';

const columns: ColumnDef<Feedback>[] = [
  {
    accessorKey: 'name',
    header: 'Ad',
  },
  {
    accessorKey: 'surname',
    header: 'Soyad',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'message',
    header: 'Mesaj',
    cell: ({ row }) => {
      const message = row.getValue('message') as string;
      return <div className="max-w-[300px] whitespace-pre-wrap truncate" title={message}>{message}</div>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Göndərilmə Tarixi',
    cell: ({ row }) => {
      const date = row.getValue('createdAt');
      return date ? format(new Date(date as string), 'dd/MM/yyyy HH:mm') : 'N/A';
    },
  },
];

export default function FeedbackPage() {
  const [data, setData] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const firestore = useFirestore();

  React.useEffect(() => {
    if(!firestore) return;
    async function loadFeedback() {
      setLoading(true);
      try {
        const feedbackData = await getFeedback(firestore);
        setData(feedbackData);
      } catch (error) {
        toast({
          variant: 'destructive',
          title: 'Xəta',
          description: 'Müraciətləri yükləmək mümkün olmadı.',
        });
      } finally {
        setLoading(false);
      }
    }
    loadFeedback();
  }, [firestore, toast]);
  
  const exportToCSV = () => {
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const dateStr = format(new Date(), 'yyyy-MM-dd_HH-mm');
    link.setAttribute('download', `Muracietler-${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
        const item = row.original;
        const search = filterValue.toLowerCase();
        
        return item.name?.toLowerCase().includes(search) ||
               item.surname?.toLowerCase().includes(search) ||
               item.email?.toLowerCase().includes(search) ||
               item.message?.toLowerCase().includes(search);
    },
    state: {
      sorting,
      globalFilter,
    },
  });
  
  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-2">
            <Skeleton className="h-96 w-full" />
            <div className="flex justify-end gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-24" />
            </div>
        </div>
      );
    }
    
    return (
        <>
            <div className="rounded-md border">
                <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                        <TableHead key={header.id}>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                        ))}
                    </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                        ))}
                        </TableRow>
                    ))
                    ) : (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center">
                        Heç bir müraciət tapılmadı.
                        </TableCell>
                    </TableRow>
                    )}
                </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                >
                Əvvəlki
                </Button>
                <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                >
                Növbəti
                </Button>
            </div>
        </>
    );
  }

  return (
    <>
      <AppHeader isAdmin={true} />
      <main className="p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Bütün Müraciətlər</h1>
            <Button onClick={exportToCSV} disabled={data.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                CSV olaraq xaric et
            </Button>
        </div>
         <div className="py-4">
            <Input
            placeholder="Axtarış..."
            value={globalFilter ?? ''}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
            />
        </div>
        {renderContent()}
      </main>
    </>
  );
}
