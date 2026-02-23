import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';

// Inicializirame notifikaciite - vikame edin pyt pri startirane na prilojenieto
export const initializeNotifications = async () => {
    try { // Nai dobre e da se obgrne v try-catch blok, zashtoto requestPermission() mozhe da izhvyrli greshka
        let permissionGranted = await isPermissionGranted();
        if (!permissionGranted) {
            const permission = await requestPermission();
            permissionGranted = permission === 'granted';
        }
        return permissionGranted;
    }catch (error) {
        console.error('Error to initialize notifications', error);
        return false;
    }
};
// Funkciq za izprashtane na notifikaciq - moze da se vikne vseki pyt, kogato iskame da izprashtame notifikaciq
export const notifySongChange = async (song , isAppVisible)=> {
    console.log('notifySongChange called:', { song: song?.title, isAppVisible });
    
    if(!song || isAppVisible) {
        console.log('Skipping notification - no song or app visible');
        return;
    }

    try {
        const permissionGranted = await isPermissionGranted();
        console.log('Permission granted:', permissionGranted);

        if (permissionGranted) {
            // Izprashtame notifikaciqta s imeto na pesenta i izpulnitelq
            await sendNotification({
                title: 'Now Playing...',
                body: `${song.title || 'Unknown'} - ${song.artist || 'Unknown Artist'}`
            });
            console.log('Notification sent successfully');
        }

    }catch (error) {
        console.error('Failed to send notification', error);
    } 
};
// Funkciq za izprashtane na notifikaciq, kogato pesenta e svyrshila - moze da se vikne vseki pyt, kogato iskame da izprashtame notifikaciq
export const notifySongEnded = async (song, isAppVisible) => {
    if (!song || isAppVisible) return;
    
    try {
        const permissionGranted = await isPermissionGranted();
        
        if (permissionGranted) {
            await sendNotification({
                title: 'Song Ended',
                body: `${song.title || 'Unknown'} finished playing`
            });
        }
    } catch (error) {
        console.error('Failed to send notification', error);
    }
};
