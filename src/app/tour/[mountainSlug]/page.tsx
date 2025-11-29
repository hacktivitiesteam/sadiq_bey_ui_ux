'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth, useFirestore } from '@/firebase';
import { getMountainData, startTour, updateTour, endTour } from '@/lib/firebase-actions';
import { useToast } from '@/hooks/use-toast';
import { Mountain } from '@/lib/definitions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import AppHeader from '@/components/app/app-header';
import { Map, Camera, TrendingUp, Timer, Route, CheckCircle, AlertTriangle, XCircle, Play, Pause, StopCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDistance } from 'geolib';

type Lang = 'az' | 'en';
type TourStatus = 'pending' | 'starting' | 'active' | 'paused' | 'completed' | 'error';

const translations = {
  az: {
    tour_with: 'ilə Tur',
    permissions: 'İcazələr',
    permissions_desc: 'Tura başlamaq üçün kamera və məkan icazəsi tələb olunur.',
    camera_access_required: 'Kamera İcazəsi Tələb Olunur',
    camera_access_desc: 'Zəhmət olmasa, kamera istifadəsinə icazə verin.',
    location_access_required: 'Məkan İcazəsi Tələb Olunur',
    location_access_desc: 'Zəhmət olmasa, məkan məlumatlarının istifadəsinə icazə verin.',
    tour_dashboard: 'Tur Paneli',
    distance: 'Məsafə',
    speed: 'Sürət',
    duration: 'Müddət',
    start_tour: 'Tura Başla',
    starting_tour: 'Başladılır...',
    pause_tour: 'Fasilə ver',
    resume_tour: 'Davam et',
    end_tour: 'Turu Bitir',
    tour_completed: 'Tur Tamamlandı!',
    tour_completed_desc: 'Təbriklər! Siz {distance} km məsafə qət etdiniz.',
    error_title: 'Xəta',
    error_start_tour: 'Turu başlada bilmədik. İcazələri yoxlayın və ya problem davam edərsə yenidən cəhd edin.',
    error_location: 'Məkan məlumatı əldə edilə bilmədi.',
    back_to_mountain: 'Dağ Səhifəsinə Qayıt',
    checking_permissions: 'İcazələr yoxlanılır...',
    error_permissions_missing: 'Turu başlada bilmədik: Zəhmət olmasa, kamera və məkan icazələrini verin.',
  },
  en: {
    tour_with: 'Tour',
    permissions: 'Permissions',
    permissions_desc: 'Camera and location access are required to start the tour.',
    camera_access_required: 'Camera Access Required',
    camera_access_desc: 'Please allow camera access to use this feature.',
    location_access_required: 'Location Access Required',
    location_access_desc: 'Please allow location access.',
    tour_dashboard: 'Tour Dashboard',
    distance: 'Distance',
    speed: 'Speed',
    duration: 'Duration',
    start_tour: 'Start Tour',
    starting_tour: 'Starting...',
    pause_tour: 'Pause Tour',
    resume_tour: 'Resume Tour',
    end_tour: 'End Tour',
    tour_completed: 'Tour Completed!',
    tour_completed_desc: 'Congratulations! You have covered a distance of {distance} km.',
    error_title: 'Error',
    error_start_tour: 'Could not start tour. Check permissions or try again if the problem persists.',
    error_location: 'Could not get location data.',
    back_to_mountain: 'Back to Mountain Page',
    checking_permissions: 'Checking permissions...',
    error_permissions_missing: 'Could not start tour: Please grant camera and location permissions.',
  },
};

// --- Helper Functions ---
const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
  const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export default function TourPage() {
  const params = useParams();
  const router = useRouter();
  const firestore = useFirestore();
  const { user } = useAuth();
  const { toast } = useToast();

  const mountainSlug = params.mountainSlug as string;
  const [mountain, setMountain] = useState<Mountain | null>(null);
  const [lang, setLang] = useState<Lang>('az');
  const t = translations[lang];

  // --- Permissions State ---
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  
  // --- Tour State ---
  const [tourId, setTourId] = useState<string | null>(null);
  const [tourStatus, setTourStatus] = useState<TourStatus>('pending');
  const [distance, setDistance] = useState(0); // in meters
  const [duration, setDuration] = useState(0); // in seconds
  const [speed, setSpeed] = useState(0); // in km/h

  // --- Refs ---
  const videoRef = useRef<HTMLVideoElement>(null);
  const lastPosition = useRef<GeolocationCoordinates | null>(null);
  const watchId = useRef<number | null>(null);
  const timerId = useRef<NodeJS.Timeout | null>(null);
  
  // --- Effects ---
  useEffect(() => {
    const savedLang = localStorage.getItem('app-lang') as Lang;
    if (savedLang) setLang(savedLang);
  }, []);

  useEffect(() => {
    if (!mountainSlug || !firestore) return;
    getMountainData(firestore, mountainSlug).then(setMountain);
  }, [mountainSlug, firestore]);
  
  // Permission check effect
  useEffect(() => {
    const checkPermissions = async () => {
        // Camera
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) videoRef.current.srcObject = stream;
            setHasCameraPermission(true);
        } catch {
            setHasCameraPermission(false);
        }
        // Location
        try {
            await new Promise((resolve, reject) => 
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
            );
            setHasLocationPermission(true);
        } catch {
            setHasLocationPermission(false);
        }
    };
    checkPermissions();
  }, []);

  // Timer effect
  useEffect(() => {
    if (tourStatus === 'active') {
      timerId.current = setInterval(() => {
        setDuration(d => d + 1);
      }, 1000);
    } else if (timerId.current) {
      clearInterval(timerId.current);
    }
    return () => {
      if (timerId.current) clearInterval(timerId.current);
    };
  }, [tourStatus]);

  // Location tracking effect
  useEffect(() => {
      if (tourStatus !== 'active' || !tourId) {
          if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
          watchId.current = null;
          return;
      }
      
      watchId.current = navigator.geolocation.watchPosition(
          (position) => {
              if (lastPosition.current) {
                  const newDistance = getDistance(
                      { latitude: lastPosition.current.latitude, longitude: lastPosition.current.longitude },
                      { latitude: position.coords.latitude, longitude: position.coords.longitude }
                  );
                  setDistance(d => d + newDistance);
                  setSpeed(position.coords.speed ? position.coords.speed * 3.6 : 0); // m/s to km/h
                  
                  // Non-blocking Firestore update
                  if(firestore && tourId) {
                    updateTour(firestore, tourId, { 
                        distance: distance + newDistance,
                        lastPosition: {
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            timestamp: position.timestamp,
                        }
                    });
                  }
              }
              lastPosition.current = position.coords;
          },
          () => {
              toast({ variant: 'destructive', title: t.error_title, description: t.error_location });
              setTourStatus('error');
          },
          { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );

      return () => {
          if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
      };
  }, [tourStatus, firestore, toast, t, distance, tourId]);


  // --- Handlers ---
  const handleStart = async () => {
    // Show popup/toast if permissions are not granted on click
    if (!hasCameraPermission || !hasLocationPermission) {
        toast({
            variant: "destructive",
            title: t.error_title,
            description: t.error_permissions_missing
        });
        return;
    }

    if (!firestore || !user || !mountain) return;
    setTourStatus('starting');
    try {
        const newTourId = await startTour(firestore, user.uid, mountain.id, mountain.name, user.displayName);
        setTourId(newTourId);
        setTourStatus('active');
        lastPosition.current = null;
        setDistance(0);
        setDuration(0);
    } catch (error: any) {
        toast({ 
            variant: 'destructive', 
            title: t.error_title, 
            description: `${t.error_start_tour} (${error.message || 'Unknown error'})`
        });
        setTourStatus('pending'); // Reset status on failure
    }
  };

  const handlePause = () => {
      setTourStatus('paused');
      if (tourId && firestore) updateTour(firestore, tourId, { status: 'paused' });
  };
  const handleResume = () => {
      setTourStatus('active');
      if (tourId && firestore) updateTour(firestore, tourId, { status: 'active' });
  };
  
  const handleEnd = async () => {
    if (!firestore || !tourId) return;
    await endTour(firestore, tourId);
    setTourStatus('completed');
  };
  
  const permissionsLoading = hasCameraPermission === null || hasLocationPermission === null;
  const permissionsGranted = hasCameraPermission && hasLocationPermission;

  // --- Render Logic ---
  
  const renderDashboard = () => (
    <Card>
        <CardHeader>
            <CardTitle>{t.tour_dashboard}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    <CardDescription className="flex items-center justify-center gap-1"><TrendingUp className="h-4 w-4" /> {t.distance}</CardDescription>
                    <p className="text-2xl font-bold">{(distance / 1000).toFixed(2)} <span className="text-base font-normal">km</span></p>
                </div>
                <div>
                    <CardDescription className="flex items-center justify-center gap-1"><Timer className="h-4 w-4" /> {t.duration}</CardDescription>
                    <p className="text-2xl font-bold">{formatDuration(duration)}</p>
                </div>
                <div>
                    <CardDescription className="flex items-center justify-center gap-1"><Route className="h-4 w-4" /> {t.speed}</CardDescription>
                    <p className="text-2xl font-bold">{speed.toFixed(1)} <span className="text-base font-normal">km/h</span></p>
                </div>
            </div>
             <div className="flex gap-2">
                {tourStatus === 'active' && <Button onClick={handlePause} className="w-full"><Pause className="mr-2" /> {t.pause_tour}</Button>}
                {tourStatus === 'paused' && <Button onClick={handleResume} className="w-full"><Play className="mr-2" /> {t.resume_tour}</Button>}
                <Button onClick={handleEnd} variant="destructive" className="w-full"><StopCircle className="mr-2" /> {t.end_tour}</Button>
            </div>
        </CardContent>
    </Card>
  );

  const renderCompleted = () => (
      <Card className="text-center p-8">
          <CheckCircle className="h-16 w-16 mx-auto text-green-500" />
          <h2 className="text-2xl font-bold mt-4">{t.tour_completed}</h2>
          <p className="text-muted-foreground mt-2">{t.tour_completed_desc.replace('{distance}', (distance / 1000).toFixed(2))}</p>
          <Button onClick={() => router.push(`/${mountainSlug}`)} className="mt-6">{t.back_to_mountain}</Button>
      </Card>
  )

  const handleSetLang = (newLang: Lang) => {
    setLang(newLang);
    localStorage.setItem('app-lang', newLang);
  };

  const mountainName = (lang === 'en' && mountain?.name_en) ? mountain.name_en : mountain?.name;

  return (
    <>
      <AppHeader lang={lang} setLang={handleSetLang} />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-8">
          {mountainName} <span className="font-light text-muted-foreground">{t.tour_with}</span>
        </h1>
        
        <div className="grid md:grid-cols-2 gap-8">
            <div>
                <Card className="overflow-hidden">
                    <CardHeader><CardTitle>{t.camera_access_required}</CardTitle></CardHeader>
                    <CardContent>
                        <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <video ref={videoRef} className={cn("w-full h-full object-cover", !hasCameraPermission && "hidden")} autoPlay muted playsInline />
                            {hasCameraPermission === false && <div className="text-center text-muted-foreground p-4"><Camera className="h-12 w-12 mx-auto"/><p className='mt-2'>{t.camera_access_required}</p></div>}
                            {hasCameraPermission === null && <Skeleton className="h-full w-full" />}
                        </div>
                    </CardContent>
                </Card>
            </div>
            <div className="space-y-8">
                {tourStatus === 'completed' ? renderCompleted() 
                  : ['active', 'paused'].includes(tourStatus) ? renderDashboard()
                  : (
                    <Card>
                      <CardHeader>
                        <CardTitle>{t.permissions}</CardTitle>
                        <CardDescription>{t.permissions_desc}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {hasCameraPermission === false && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{t.camera_access_required}</AlertTitle>
                            <AlertDescription>{t.camera_access_desc}</AlertDescription>
                          </Alert>
                        )}
                        {hasLocationPermission === false && (
                          <Alert variant="destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>{t.location_access_required}</AlertTitle>
                            <AlertDescription>{t.location_access_desc}</AlertDescription>
                          </Alert>
                        )}
                        <Button onClick={handleStart} className="w-full" size="lg" disabled={tourStatus === 'starting'}>
                           {permissionsLoading ? (
                              <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {t.checking_permissions}
                              </>
                           ) : tourStatus === 'starting' ? (
                              <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  {t.starting_tour}
                              </>
                           ) : (
                              <>
                                  <Play className="mr-2" /> {t.start_tour}
                              </>
                           )}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                }
            </div>
        </div>
      </main>
    </>
  );
}
