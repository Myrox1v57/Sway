import { useAudioPlayer } from "../contexts/AudioPlayerContext";
import { sendNotification, isPermissionGranted, requestPermission } from '@tauri-apps/plugin-notification';

// Request Permision za izprashtane na notifikacii
export const requestNotificationPermission = async () => {
    const { currentSong , isPlaying } = useAudioPlayer();

    if (!currentSong || !isPlaying) {
        return; // Ne izprashtame notifikaciq, ako nqma tekushta pesen ili ne se puskva
    }

    if (!isPermissionGranted()) {
        const permission = await requestPermission();
        permissionGranted = permission === 'granted';
    }
    if (permissionGranted) {
        await sendNotification({
            title: 'Sway',
            body: `Current song: ${currentSong.title} - ${currentSong.artist}`,
            icon: 'path/to/icon.png' // Opcionalno: Put do ikona za notifikaciite
        });
    }

};
