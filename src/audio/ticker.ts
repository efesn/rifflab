// Arka plana alınan sekmelerde setInterval yavaşlatılır; Web Worker içindeki zamanlayıcı
// bundan etkilenmez. Zamanlayıcı yalnızca "uyandırır", gerçek zamanlama AudioContext saatiyle yapılır.

export interface Ticker {
  stop(): void;
}

export function createTicker(intervalMs: number, onTick: () => void): Ticker {
  try {
    const code = `let id=null;onmessage=e=>{if(e.data==='start'){clearInterval(id);id=setInterval(()=>postMessage(0),${intervalMs});}else{clearInterval(id);}}`;
    const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
    const worker = new Worker(url);
    worker.onmessage = () => onTick();
    worker.postMessage('start');
    return {
      stop() {
        worker.postMessage('stop');
        worker.terminate();
        URL.revokeObjectURL(url);
      },
    };
  } catch {
    const id = window.setInterval(onTick, intervalMs);
    return { stop: () => window.clearInterval(id) };
  }
}
