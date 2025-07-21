import { Camera, Check, RefreshCw, Settings, SwitchCamera } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "./Button";
import Modal from "./Modal";

const CAMERA_ERRORS = {
  NotAllowedError: "Please enable camera permissions",
  NotFoundError: "No camera device found",
  OverconstrainedError: "Camera configuration not supported",
  default: "Camera initialization failed",
};

const RESOLUTION_OPTIONS = [
  { label: "HD (720p)", value: { width: 1280, height: 720 } },
  { label: "Full HD (1080p)", value: { width: 1920, height: 1080 } },
  { label: "4K (UHD)", value: { width: 3840, height: 2160 } },
  { label: "Max Available", value: null },
];

export const CameraCaptureModal = ({ isOpen, onClose, onCaptureComplete }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturedFile, setCapturedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null); // FIX: Separate preview URL state
  const [cameraDevices, setCameraDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState(null);
  const [status, setStatus] = useState("idle");
  const [showSettings, setShowSettings] = useState(false);
  const [selectedResolution, setSelectedResolution] = useState(RESOLUTION_OPTIONS[0]);
  const [isFrontCamera, setIsFrontCamera] = useState(false);

  // Device utilities
  const hasMultipleCameras = useMemo(() => cameraDevices.length > 1, [cameraDevices]);
  const currentDeviceIndex = useMemo(
    () => cameraDevices.findIndex((d) => d.deviceId === currentDeviceId),
    [cameraDevices, currentDeviceId]
  );

  // Camera initialization with resolution
  const startCamera = useCallback(async () => {
    setStatus("loading");

    // Cleanup previous stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    try {
      const constraints = {
        video: {
          deviceId: currentDeviceId ? { exact: currentDeviceId } : undefined,
          ...(selectedResolution.value
            ? {
                width: { ideal: selectedResolution.value.width },
                height: { ideal: selectedResolution.value.height },
              }
            : {}),
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Detect if front camera
      const track = stream.getVideoTracks()[0];
      const settings = track.getSettings();
      setIsFrontCamera(settings.facingMode === "user");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setStatus("ready");
        };
      }
    } catch (err) {
      handleCameraError(err);
    }
  }, [currentDeviceId, selectedResolution]);

  // Device enumeration
  const enumerateCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === "videoinput");

      setCameraDevices(videoDevices);
      if (videoDevices.length > 0 && !currentDeviceId) {
        setCurrentDeviceId(videoDevices[0].deviceId);
      }
    } catch (err) {
      console.warn("Camera enumeration failed:", err);
    }
  }, [currentDeviceId]);

  // Error handler
  const handleCameraError = useCallback(
    (err) => {
      console.error("Camera error:", err);

      if (err.name === "OverconstrainedError") {
        toast("Switching to available camera");
        setSelectedResolution(RESOLUTION_OPTIONS[0]); // Reset resolution
        setTimeout(() => startCamera(), 500);
        return;
      }

      toast.error(CAMERA_ERRORS[err.name] || CAMERA_ERRORS.default);
      onClose();
    },
    [onClose, startCamera]
  );

  // Lifecycle management
  useEffect(() => {
    if (!isOpen) return;

    enumerateCameras();
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      // Clean up preview URLs
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, startCamera]);

  // FIXED: Capture function with proper preview handling
  const handleCapture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || status !== "ready") return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // For front camera: mirror the image
    if (isFrontCamera) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Create blob and preview URL
    canvas.toBlob(
      (blob) => {
        if (!blob) return;

        const file = new File([blob], `capture-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        // Create preview URL
        const url = URL.createObjectURL(blob);

        setCapturedFile(file);
        setPreviewUrl(url); // FIX: Set preview URL separately
        setStatus("captured");

        // Cleanup stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      },
      "image/jpeg",
      0.85
    );
  };

  const handleRetake = () => {
    // Clean up previous preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    setCapturedFile(null);
    startCamera();
  };

  const handleUsePhoto = () => {
    if (capturedFile) {
      onCaptureComplete(capturedFile);
      onClose();
    }
  };

  // FIXED: Camera switching function
  const switchCamera = () => {
    if (cameraDevices.length < 2) return;

    // Find next available camera
    let newIndex = currentDeviceIndex + 1;
    if (newIndex >= cameraDevices.length) newIndex = 0;

    setCurrentDeviceId(cameraDevices[newIndex].deviceId);
  };

  // Touch support
  const handleTouchCapture = (e) => {
    e.preventDefault();
    handleCapture();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Take a Picture"
      size="lg"
      onBackdropClick={() => setShowSettings(false)}
    >
      {/* Camera Preview Area */}
      <div className="bg-black rounded-lg overflow-hidden relative aspect-video flex items-center justify-center">
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {status === "captured" && previewUrl ? (
          <img src={previewUrl} alt="Captured" className="w-full h-full object-contain" />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover ${status !== "ready" ? "invisible" : ""} ${isFrontCamera ? "scale-x-[-1]" : ""}`}
          />
        )}

        <canvas ref={canvasRef} className="hidden" />

        {/* Camera Unavailable Fallback */}
        {status === "idle" && !streamRef.current && (
          <div className="text-white text-center p-4">
            <Camera className="mx-auto h-12 w-12 mb-2" />
            <p>Camera initialization failed</p>
          </div>
        )}
      </div>

      {/* Control Panel */}
      <div className="mt-4 flex justify-center items-center gap-4 relative">
        {status === "captured" ? (
          <>
            <Button variant="outline" onClick={handleRetake}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retake
            </Button>
            <Button onClick={handleUsePhoto}>
              <Check className="h-4 w-4 mr-2" />
              Use This Photo
            </Button>
          </>
        ) : (
          <>
            {/* Camera Switch Button */}
            {hasMultipleCameras && (
              <Button
                variant="ghost"
                size="icon"
                onClick={switchCamera}
                disabled={status !== "ready"}
                aria-label="Switch Camera"
                className="bg-slate-800 hover:bg-slate-700"
              >
                <SwitchCamera className="text-white" />
              </Button>
            )}

            {/* Capture Button */}
            <Button
              onClick={handleCapture}
              onTouchEnd={handleTouchCapture}
              className="rounded-full w-16 h-16 flex items-center justify-center bg-blue-600 hover:bg-blue-700"
              disabled={status !== "ready"}
              aria-label="Take picture"
            >
              <Camera className="h-8 w-8 text-white" />
            </Button>

            {/* Settings */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Camera settings"
                className="bg-slate-800 hover:bg-slate-700"
              >
                <Settings className="text-white" />
              </Button>

              {/* DARK THEME DROPDOWN */}
              {showSettings && (
                <div className="absolute right-0 bottom-full mb-2 w-48 bg-slate-800 border border-slate-700 rounded-lg shadow-lg p-2 z-10">
                  <div className="text-sm font-medium px-2 py-1 text-white">Resolution</div>
                  {RESOLUTION_OPTIONS.map((option) => (
                    <button
                      key={option.label}
                      className={`block w-full text-left px-3 py-1 text-sm rounded hover:bg-slate-700 ${
                        selectedResolution.label === option.label
                          ? "bg-slate-700 text-blue-400"
                          : "text-slate-200"
                      }`}
                      onClick={() => {
                        setSelectedResolution(option);
                        setShowSettings(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Modal>
  );
};
