'use client';
import { useState, useEffect } from 'react';
import CountryList from '@/components/app/admin/country-list';
import InfoDataTable from '@/components/app/admin/info-data-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppHeader from '@/components/app/app-header';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getReservations, fetchCountries } from '@/lib/firebase-actions';
import { Reservation, Country } from '@/lib/definitions';
import { useFirestore } from '@/firebase';
import { Skeleton } from '@/components/ui/skeleton';

function ReservationChart() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const firestore = useFirestore();

  useEffect(() => {
    if (!firestore) return;

    async function loadData() {
      setLoading(true);
      try {
        const [reservations, countries] = await Promise.all([
          getReservations(firestore),
          fetchCountries(firestore)
        ]);

        const countryMap = new Map(countries.map(c => [c.id, c.name]));
        
        const reservationsWithCountry = reservations.map(r => {
            const infoItem = r.itemName || '';
            const countryInfo = countries.find(c => r.itemName.toLowerCase().includes(c.slug.toLowerCase()));
            
            return {
                ...r,
                countryName: 'Bilinmir'
            }
        });
        
        const counts: { [key: string]: { name: string, reservations: number } } = {};

        reservations.forEach(reservation => {
          const countryId = reservation.itemId.split('-')[0];
          const countryName = "Test"//countryMap.get(countryId) || 'Unknown';
          if (!counts[countryName]) {
            counts[countryName] = { name: countryName, reservations: 0 };
          }
          counts[countryName].reservations++;
        });

        const chartData = Object.values(counts);
        setData(chartData);
      } catch (error) {
        console.error("Failed to load chart data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [firestore]);

  if (loading) {
    return <Skeleton className="h-[350px] w-full" />;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'hsl(var(--background))', 
            borderColor: 'hsl(var(--border))' 
          }}
        />
        <Legend />
        <Bar dataKey="reservations" fill="hsl(var(--primary))" name="Rezervasiyalar" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AdminDashboardPage() {
  return (
    <>
    <AppHeader isAdmin={true} />
    <main className="p-4 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">İdarəetmə Paneli</h1>
        <p className="text-muted-foreground">Rezervasiya statistikası və məzmun idarəetməsi.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ölkələr üzrə Rezervasiya Statistikası</CardTitle>
          <CardDescription>Hər bir ölkə üçün edilən ümumi rezervasiyaların sayı.</CardDescription>
        </CardHeader>
        <CardContent>
          <ReservationChart />
        </CardContent>
      </Card>
      
      <Tabs defaultValue="countries">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="countries">Ölkələr</TabsTrigger>
          <TabsTrigger value="info-items">Məlumatlar</TabsTrigger>
        </TabsList>
        <TabsContent value="countries">
          <Card>
            <CardHeader>
              <CardTitle>Ölkə İdarəetməsi</CardTitle>
              <CardDescription>
                Yeni ölkələr əlavə edin, mövcud olanları redaktə edin və ya silin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CountryList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="info-items">
          <Card>
             <CardHeader>
              <CardTitle>Məlumat İdarəetməsi</CardTitle>
              <CardDescription>
                Ölkələr üçün otel, restoran, mədəniyyət və s. kimi məlumatları idarə edin.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InfoDataTable />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
    </>
  );
}
