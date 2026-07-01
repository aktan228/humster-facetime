// Opens the default webcam and pipes it into a hidden <video> element.

export async function startCamera(videoEl) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480, facingMode: 'user' },
    audio: false
  })
  videoEl.srcObject = stream
  await videoEl.play()
  return stream
}
