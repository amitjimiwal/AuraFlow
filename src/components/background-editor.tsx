"use client";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Download, Upload, X } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";
interface BackgroundEditorProps {
  defaultText?: string;
}

export function BackgroundEditor({
  defaultText = "everything is god's plan",
}: BackgroundEditorProps) {
  const [backgroundType, setBackgroundType] = useState<"gradient" | "image">(
    "gradient"
  );
  const [text, setText] = useState(defaultText);
  const [textColor, setTextColor] = useState("#ffffff");
  const [textOpacity, setTextOpacity] = useState(100);
  const [backgroundColor, setBackgroundColor] = useState("#000000");
  const [backgroundGradientAngle, setBackgroundGradientAngle] = useState(337);
  const [customBackgroundGradient, setCustomBackgroundGradient] = useState({
    from: "#1d1b1b",
    via: "#2a3232",
    to: "#ccd5d7",
  });
  const [useBackgroundGradient, setUseBackgroundGradient] = useState(true);

  const [backgroundImage, setBackgroundImage] = useState<string | null>(
    "./peter.png"
  );
  const [imagePosition, setImagePosition] = useState({ x: 75, y: 35 }); // percentage
  const [imageScale, setImageScale] = useState(61); // percentage
  const fileInputRef = useRef<HTMLInputElement>(null);

  const backgroundRef = useRef<HTMLDivElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
        setBackgroundType("image");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setBackgroundImage(null);
    setBackgroundType("gradient");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const backgroundStyle =
    backgroundType === "gradient"
      ? useBackgroundGradient
        ? {
            backgroundImage: `linear-gradient(${backgroundGradientAngle}deg, ${customBackgroundGradient.from}, ${customBackgroundGradient.via}, ${customBackgroundGradient.to})`,
            backgroundSize: "cover",
          }
        : {
            backgroundColor: backgroundColor,
          }
      : backgroundImage
      ? {
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
          backgroundSize: `${imageScale}%`,
          backgroundColor: backgroundColor,
        }
      : {};

  const handleDownload = async () => {
    if (!backgroundRef.current) return;

    try {
      const canvas = await html2canvas(backgroundRef.current, {
        scale: 2,
        backgroundColor: null,
      });

      const link = document.createElement("a");
      link.download = "background.png";
      link.href = canvas.toDataURL("image/png");
      posthog.capture("image_downloaded_btn_clicked", {
        property: "image_download",
      });
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <div className="flex gap-2 items-center">
              <Image
                src="/favicon.ico"
                alt="AuraFlow Logo"
                width={40}
                height={40}
                className="rounded-full inline"
              />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                AuraFlow
              </h1>
            </div>
            <p className="mt-2 text-slate-400">
              Create desktop images for your screen with your personalized
              masterpiece maxim
            </p>
          </div>
          <div className="flex items-center gap-4">
            <p>
              <small className="text-xs text-slate-400">
                X &nbsp;
                <Link
                  href="https://x.com/notamitwts"
                  target="_blank"
                  className="text-blue-400 hover:underline"
                >
                  @notamitwts
                </Link>
              </small>
            </p>
            <button
              onClick={handleDownload}
              className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-6 py-3 text-white shadow-lg transition-all hover:shadow-blue-500/25 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              <Download
                size={20}
                className="transition-transform group-hover:-translate-y-0.5"
              />
              Download
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {/* Preview */}
          <div className="overflow-hidden rounded-2xl bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm ring-1 ring-white/10">
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
              <div
                ref={backgroundRef}
                className="flex h-full w-full items-center justify-center p-8 transition-all duration-300"
                style={{
                  ...backgroundStyle,
                  position: "relative",
                }}
              >
                {backgroundType === "image" && backgroundImage && (
                  <div
                    className="absolute inset-0 transition-opacity duration-300"
                    style={{
                      backgroundImage: `url(${backgroundImage})`,
                      backgroundPosition: `${imagePosition.x}% ${imagePosition.y}%`,
                      backgroundSize: `${imageScale}%`,
                    }}
                  />
                )}
                <div className="relative">
                  <p
                    className="text-center leading-relaxed text-4xl font-medium tracking-wide transition-all duration-300"
                    style={{
                      color: textColor,
                      opacity: textOpacity / 100,
                      position: "relative",
                      zIndex: 1,
                      textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    {text}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="grid gap-8 md:grid-cols-2">
            {/* Text Controls */}
            <div className="space-y-6 rounded-2xl bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">Text</h2>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Text
                  </label>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-2.5 text-white placeholder-slate-400 transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    placeholder="Enter your text..."
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Text Color
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="h-10 w-20 cursor-pointer rounded-lg border border-slate-600 bg-slate-700/50 p-1 transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                    <input
                      type="text"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Text Opacity
                  </label>
                  <div className="flex items-center gap-4">
                    <Slider.Root
                      className="relative flex h-5 w-full touch-none select-none items-center"
                      value={[textOpacity]}
                      onValueChange={([value]) => setTextOpacity(value)}
                      max={100}
                      step={1}
                    >
                      <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-700">
                        <Slider.Range className="absolute h-full bg-gradient-to-r from-blue-400 to-teal-400" />
                      </Slider.Track>
                      <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-lg ring-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 hover:bg-blue-50" />
                    </Slider.Root>
                    <span className="w-12 text-right text-sm text-slate-400">
                      {textOpacity}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Background Controls */}
            <div className="space-y-6 rounded-2xl bg-slate-800/50 p-6 shadow-xl backdrop-blur-sm ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-white">Background</h2>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={backgroundType === "gradient"}
                      onChange={() => setBackgroundType("gradient")}
                      className="h-4 w-4 border-slate-600 bg-slate-700/50 text-blue-400 transition-colors focus:ring-blue-400"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      Gradient
                    </span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={backgroundType === "image"}
                      onChange={() => {
                        setBackgroundType("image");
                        setText("competition is for losers");
                      }}
                      className="h-4 w-4 border-slate-600 bg-slate-700/50 text-blue-400 transition-colors focus:ring-blue-400"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      Image
                    </span>
                  </label>
                </div>

                {backgroundType === "gradient" ? (
                  <>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="useBackgroundGradient"
                        checked={useBackgroundGradient}
                        onChange={(e) =>
                          setUseBackgroundGradient(e.target.checked)
                        }
                        className="h-4 w-4 rounded border-slate-600 bg-slate-700/50 text-blue-400 transition-colors focus:ring-blue-400"
                      />
                      <label
                        htmlFor="useBackgroundGradient"
                        className="text-sm font-medium text-slate-300"
                      >
                        Use Gradient
                      </label>
                    </div>

                    {useBackgroundGradient ? (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Gradient Colors
                          </label>
                          <div className="grid gap-4">
                            <div className="flex items-center gap-4">
                              <input
                                type="color"
                                value={customBackgroundGradient.from}
                                onChange={(e) =>
                                  setCustomBackgroundGradient((prev) => ({
                                    ...prev,
                                    from: e.target.value,
                                  }))
                                }
                                className="h-10 w-20 cursor-pointer rounded-lg border border-slate-600 bg-slate-700/50 p-1 transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                              <input
                                type="text"
                                value={customBackgroundGradient.from}
                                onChange={(e) =>
                                  setCustomBackgroundGradient((prev) => ({
                                    ...prev,
                                    from: e.target.value,
                                  }))
                                }
                                className="w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                              <span className="text-sm text-slate-400">
                                From
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <input
                                type="color"
                                value={customBackgroundGradient.via}
                                onChange={(e) =>
                                  setCustomBackgroundGradient((prev) => ({
                                    ...prev,
                                    via: e.target.value,
                                  }))
                                }
                                className="h-10 w-20 cursor-pointer rounded-lg border border-slate-600 bg-slate-700/50 p-1 transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                              <input
                                type="text"
                                value={customBackgroundGradient.via}
                                onChange={(e) =>
                                  setCustomBackgroundGradient((prev) => ({
                                    ...prev,
                                    via: e.target.value,
                                  }))
                                }
                                className="w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                              <span className="text-sm text-slate-400">
                                Via
                              </span>
                            </div>

                            <div className="flex items-center gap-4">
                              <input
                                type="color"
                                value={customBackgroundGradient.to}
                                onChange={(e) =>
                                  setCustomBackgroundGradient((prev) => ({
                                    ...prev,
                                    to: e.target.value,
                                  }))
                                }
                                className="h-10 w-20 cursor-pointer rounded-lg border border-slate-600 bg-slate-700/50 p-1 transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                              <input
                                type="text"
                                value={customBackgroundGradient.to}
                                onChange={(e) =>
                                  setCustomBackgroundGradient((prev) => ({
                                    ...prev,
                                    to: e.target.value,
                                  }))
                                }
                                className="w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                              <span className="text-sm text-slate-400">To</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Gradient Angle
                          </label>
                          <div className="flex items-center gap-4">
                            <Slider.Root
                              className="relative flex h-5 w-full touch-none select-none items-center"
                              value={[backgroundGradientAngle]}
                              onValueChange={([value]) =>
                                setBackgroundGradientAngle(value)
                              }
                              max={360}
                              step={1}
                            >
                              <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-700">
                                <Slider.Range className="absolute h-full bg-gradient-to-r from-blue-400 to-teal-400" />
                              </Slider.Track>
                              <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-lg ring-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 hover:bg-blue-50" />
                            </Slider.Root>
                            <span className="w-12 text-right text-sm text-slate-400">
                              {backgroundGradientAngle}°
                            </span>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="mb-2 block text-sm font-medium text-slate-300">
                          Background Color
                        </label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="h-10 w-20 cursor-pointer rounded-lg border border-slate-600 bg-slate-700/50 p-1 transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                          <input
                            type="text"
                            value={backgroundColor}
                            onChange={(e) => setBackgroundColor(e.target.value)}
                            className="w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Background Image
                      </label>
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
                        >
                          <Upload size={18} />
                          Upload Image
                        </button>
                        {backgroundImage && (
                          <button
                            onClick={handleRemoveImage}
                            className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-red-400 transition-colors hover:bg-red-500/20"
                          >
                            <X size={18} />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>

                    {backgroundImage && (
                      <>
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Image Scale
                          </label>
                          <div className="flex items-center gap-4">
                            <Slider.Root
                              className="relative flex h-5 w-full touch-none select-none items-center"
                              value={[imageScale]}
                              onValueChange={([value]) => setImageScale(value)}
                              min={50}
                              max={200}
                              step={1}
                            >
                              <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-700">
                                <Slider.Range className="absolute h-full bg-gradient-to-r from-blue-400 to-teal-400" />
                              </Slider.Track>
                              <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-lg ring-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 hover:bg-blue-50" />
                            </Slider.Root>
                            <span className="w-12 text-right text-sm text-slate-400">
                              {imageScale}%
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                              Position X
                            </label>
                            <Slider.Root
                              className="relative flex h-5 w-full touch-none select-none items-center"
                              value={[imagePosition.x]}
                              onValueChange={([value]) =>
                                setImagePosition((prev) => ({
                                  ...prev,
                                  x: value,
                                }))
                              }
                              max={100}
                              step={1}
                            >
                              <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-700">
                                <Slider.Range className="absolute h-full bg-gradient-to-r from-blue-400 to-teal-400" />
                              </Slider.Track>
                              <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-lg ring-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 hover:bg-blue-50" />
                            </Slider.Root>
                          </div>
                          <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                              Position Y
                            </label>
                            <Slider.Root
                              className="relative flex h-5 w-full touch-none select-none items-center"
                              value={[imagePosition.y]}
                              onValueChange={([value]) =>
                                setImagePosition((prev) => ({
                                  ...prev,
                                  y: value,
                                }))
                              }
                              max={100}
                              step={1}
                            >
                              <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-700">
                                <Slider.Range className="absolute h-full bg-gradient-to-r from-blue-400 to-teal-400" />
                              </Slider.Track>
                              <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-lg ring-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 hover:bg-blue-50" />
                            </Slider.Root>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-6xl mt-12 text-center">
        <p>
          <small className="text-xs text-slate-400">
            Made with ❤️ by{" "}
            <Link
              href="https://x.com/notamitwts"
              target="_blank"
              className="text-blue-400 hover:underline"
            >
              @notamitwts
            </Link>
          </small>
        </p>
        <p className="mt-4 text-xs text-slate-500">
          © {new Date().getFullYear()} AuraFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
