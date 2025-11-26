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
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AppHeader from '@/components/app/app-header';
import { format, isWithinInterval, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import { useFirestore } from '@/firebase';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [allData, setAllData] = React.useState<Feedback[]>([]);
  const [filteredData, setFilteredData] = React.useState<Feedback[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();
  const [sorting, setSorting] = React.useState<SortingState>([{ id: 'createdAt', desc: true }]);
  const [filter, setFilter] = React.useState('all');
  const [globalFilter, setGlobalFilter] = React.useState('');
  const firestore = useFirestore();

  React.useEffect(() => {
    if(!firestore) return;
    async function loadFeedback() {
      setLoading(true);
      try {
        const feedbackData = await getFeedback(firestore);
        setAllData(feedbackData);
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
  
  React.useEffect(() => {
    let baseData = allData;
    
    // Global search filter
    if (globalFilter) {
      const lowercasedFilter = globalFilter.toLowerCase();
      baseData = baseData.filter(item => {
        const searchableString = Object.values(item).join(' ').toLowerCase();
        return searchableString.includes(lowercasedFilter);
      });
    }
    
    // Date range filter
    const now = new Date();
    let dateFilteredData = baseData;

    if (filter === 'today') {
      const interval = { start: startOfDay(now), end: endOfDay(now) };
      dateFilteredData = baseData.filter(r => isWithinInterval(new Date(r.createdAt), interval));
    } else if (filter === 'this_week') {
      const interval = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
      dateFilteredData = baseData.filter(r => isWithinInterval(new Date(r.createdAt), interval));
    } else if (filter === 'this_month') {
      const interval = { start: startOfMonth(now), end: endOfMonth(now) };
      dateFilteredData = baseData.filter(r => isWithinInterval(new Date(r.createdAt), interval));
    } else if (filter === 'this_year') {
        const interval = { start: startOfYear(now), end: endOfYear(now) };
        dateFilteredData = baseData.filter(r => isWithinInterval(new Date(r.createdAt), interval));
    }
    
    setFilteredData(dateFilteredData);
  }, [filter, allData, globalFilter]);

  const exportToCSV = () => {
    const csv = Papa.unparse(allData);
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
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
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
            <div className='flex items-center gap-4'>
                <Select value={filter} onValueChange={setFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filterlə" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Hamısı</SelectItem>
                        <SelectItem value="today">Bu gün</SelectItem>
                        <SelectItem value="this_week">Bu həftə</SelectItem>
                        <SelectItem value="this_month">Bu ay</SelectItem>
                        <SelectItem value="this_year">Bu il</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={exportToCSV} disabled={allData.length === 0}>
                    <Download className="mr-2 h-4 w-4" />
                    CSV olaraq xaric et
                </Button>
            </div>
        </div>
         <div className="py-4">
            <Input
            placeholder="Axtarış..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="max-w-sm"
            />
        </div>
        {renderContent()}
      </main>
    </>
  );
}
