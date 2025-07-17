/**
 * Servicio de gestión de sonidos
 * Proporciona una interfaz para precargar y reproducir sonidos de manera eficiente
 */

// Tipos de sonidos disponibles
export type SoundType = 'menu-change' | 'add-to-cart' | 'highlight' | 'error' | 'success';

// Mapeo de tipos de sonidos a rutas de archivos
const soundFiles: Record<SoundType, string> = {
  'menu-change': '/sounds/menu-change.mp3',
  'add-to-cart': '/sounds/add-to-cart.mp3',
  'highlight': '/sounds/highlight.mp3',
  'error': '/sounds/error.mp3',
  'success': '/sounds/success.mp3'
};

// Caché de sonidos precargados
const soundCache: Map<SoundType, HTMLAudioElement> = new Map();

// Estado de carga
let isPreloading = false;
let isPreloaded = false;

/**
 * Precarga todos los sonidos en memoria para reducir la latencia
 * @returns Promesa que se resuelve cuando todos los sonidos están cargados
 */
export function preloadSounds(): Promise<void> {
  if (isPreloaded) return Promise.resolve();
  if (isPreloading) return Promise.resolve(); // Ya está cargándose

  isPreloading = true;
  
  // Solo disponible en entorno de navegador
  if (typeof window === 'undefined') {
    isPreloading = false;
    return Promise.resolve();
  }
  
  const loadPromises: Promise<void>[] = [];
  
  Object.entries(soundFiles).forEach(([type, path]) => {
    if (soundCache.has(type as SoundType)) return; // Ya está en caché
    
    const audioElement = new Audio(path);
    audioElement.preload = 'auto';
    
    const loadPromise = new Promise<void>((resolve) => {
      const handleLoad = () => {
        soundCache.set(type as SoundType, audioElement);
        audioElement.removeEventListener('canplaythrough', handleLoad);
        resolve();
      };
      
      // Si ya está cargado
      if (audioElement.readyState >= 3) {
        soundCache.set(type as SoundType, audioElement);
        resolve();
        return;
      }
      
      // Carga asíncrona con evento
      audioElement.addEventListener('canplaythrough', handleLoad);
      
      // Si hay error, resolver de todas formas para no bloquear
      audioElement.addEventListener('error', () => {
        console.warn(`No se pudo cargar el sonido: ${path}`);
        resolve();
      });
    });
    
    loadPromises.push(loadPromise);
  });
  
  return Promise.all(loadPromises)
    .then(() => {
      isPreloaded = true;
      isPreloading = false;
      console.log('🔊 Todos los sonidos precargados correctamente');
    })
    .catch(error => {
      console.error('Error al precargar sonidos:', error);
      isPreloading = false;
    });
}

/**
 * Reproduce un sonido específico
 * @param soundType Tipo de sonido a reproducir
 * @param volume Volumen (0.0 a 1.0, por defecto 1.0)
 * @returns true si se reprodujo correctamente, false en caso contrario
 */
export function playSound(soundType: SoundType, volume: number = 1.0): boolean {
  // Solo disponible en entorno de navegador
  if (typeof window === 'undefined') return false;
  
  try {
    // Si el sonido no está en caché, intentar obtenerlo directamente
    let audio = soundCache.get(soundType);
    
    if (!audio) {
      // Si no está precargado, crear nuevo elemento
      const soundPath = soundFiles[soundType];
      if (!soundPath) {
        console.warn(`Tipo de sonido no válido: ${soundType}`);
        return false;
      }
      
      audio = new Audio(soundPath);
      soundCache.set(soundType, audio);
    }
    
    // Clonar para permitir reproducción simultánea
    const soundInstance = audio.cloneNode() as HTMLAudioElement;
    soundInstance.volume = Math.min(1.0, Math.max(0.0, volume));
    
    // Reproducir con manejo de errores
    const playPromise = soundInstance.play();
    
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn(`Error al reproducir sonido (${soundType}):`, error);
        // No hacer nada si el navegador bloquea la reproducción automática
      });
    }
    
    return true;
  } catch (error) {
    console.error(`Error al reproducir sonido (${soundType}):`, error);
    return false;
  }
}

/**
 * Obtiene el estado de carga de los sonidos
 * @returns true si todos los sonidos están precargados
 */
export function areSoundsPreloaded(): boolean {
  return isPreloaded;
}

// Iniciar precarga automáticamente en entorno de navegador
if (typeof window !== 'undefined') {
  // Esperar a que la página esté completamente cargada para no competir por recursos
  if (document.readyState === 'complete') {
    preloadSounds();
  } else {
    window.addEventListener('load', () => {
      // Retrasar la precarga para priorizar elementos visuales
      setTimeout(preloadSounds, 1000);
    });
  }
}

export default {
  preloadSounds,
  playSound,
  areSoundsPreloaded
}; 