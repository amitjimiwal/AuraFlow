"use client";
import { useState, useRef } from "react";
import html2canvas from "html2canvas";
import { Download, Upload, X, Plus, Trash } from "lucide-react";
import * as Slider from "@radix-ui/react-slider";
import Link from "next/link";
import Image from "next/image";
import posthog from "posthog-js";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lobster,
  Pacifico,
  Caveat,
  Bebas_Neue,
  Anton,
  Righteous,
  VT323,
} from "next/font/google";

const lobster = Lobster({ subsets: ["latin"], weight: "400" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400" });
const caveat = Caveat({ subsets: ["latin"], weight: "400" });
const bebasNeue = Bebas_Neue({ subsets: ["latin"], weight: "400" });
const anton = Anton({ subsets: ["latin"], weight: "400" });
const righteous = Righteous({ subsets: ["latin"], weight: "400" });
const vt323 = VT323({ subsets: ["latin"], weight: "400" });

const fontOptions = [
  { name: "Default", className: "" },
  { name: "Lobster", className: lobster.className },
  { name: "Pacifico", className: pacifico.className },
  { name: "Caveat", className: caveat.className },
  { name: "Bebas Neue", className: bebasNeue.className },
  { name: "Anton", className: anton.className },
  { name: "Righteous", className: righteous.className },
  { name: "VT323", className: vt323.className },
];

interface BackgroundEditorProps {
  defaultText?: string;
}

interface TextElement {
  id: string;
  text: string;
  color: string;
  opacity: number;
  size: number;
  x: number;
  y: number;
  fontClass: string;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
    },
  },
};

export function BackgroundEditor({
  defaultText = "cheat on everything..",
}: BackgroundEditorProps) {
  const [backgroundType, setBackgroundType] = useState<"gradient" | "image">(
    "image"
  );
  const [texts, setTexts] = useState<TextElement[]>([
    {
      id: `text-${Date.now()}`,
      text: defaultText,
      color: "#ffffff",
      opacity: 100,
      size: 30,
      x: 0,
      y: 0,
      fontClass: fontOptions[1].className,
    },
  ]);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(
    texts[0]?.id ?? null
  );
  const [showText, setShowText] = useState(true);
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
  const [imageScale, setImageScale] = useState(100); // percentage
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

  const handleAddText = () => {
    const newId = `text-${Date.now()}`;
    setTexts([
      ...texts,
      {
        id: newId,
        text: "New Text",
        color: "#ffffff",
        opacity: 100,
        size: 30,
        x: 0,
        y: 0,
        fontClass: fontOptions[0].className,
      },
    ]);
    setSelectedTextId(newId);
  };

  const handleRemoveText = () => {
    if (!selectedTextId) return;
    setTexts(texts.filter((t) => t.id !== selectedTextId));
    setSelectedTextId(null);
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
      // Temporarily remove transform from draggable element for accurate capture
      const draggableElements = backgroundRef.current.querySelectorAll(
        ".draggable-text"
      ) as NodeListOf<HTMLElement>;
      const originalTransforms = Array.from(draggableElements).map(
        (el) => el.style.transform
      );
      draggableElements.forEach((el) => (el.style.transform = "none"));

      const canvas = await html2canvas(backgroundRef.current, {
        scale: 2,
        backgroundColor: null,
        onclone: (document) => {
          const clonedDraggables = document.querySelectorAll(
            ".draggable-text"
          ) as NodeListOf<HTMLElement>;
          if (clonedDraggables.length > 0) {
            clonedDraggables.forEach((clonedEl, index) => {
              clonedEl.style.transform = originalTransforms[index];
            });
          }
        },
      });

      // Restore transform
      draggableElements.forEach(
        (el, index) => (el.style.transform = originalTransforms[index])
      );

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

  const selectedText = texts.find((t) => t.id === selectedTextId);

  const updateSelectedText = (props: Partial<TextElement>) => {
    if (!selectedTextId) return;
    setTexts(
      texts.map((t) => (t.id === selectedTextId ? { ...t, ...props } : t))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-8">
      <motion.div
        className="mx-auto max-w-6xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div
          className="mb-8 sm:mb-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <div className="flex gap-2 items-center">
              <Image
                src="/favicon.ico"
                alt="AuraFlow Logo"
                width={32}
                height={32}
                className="rounded-full inline sm:w-10 sm:h-10"
              />
              <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-blue-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                AuraFlow
              </h1>
            </div>
            <p className="mt-2 text-sm sm:text-base text-slate-400">
              Create desktop images for your screen with your personalized
              masterpiece maxim
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            <motion.button
              onClick={handleDownload}
              className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base text-white shadow-lg transition-all hover:shadow-blue-500/25 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 w-full sm:w-auto justify-center"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download
                size={18}
                className="transition-transform group-hover:-translate-y-0.5 sm:w-5 sm:h-5"
              />
              Download
            </motion.button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:gap-8">
          {/* Preview */}
          <motion.div
            className="overflow-hidden rounded-2xl bg-slate-800/50 p-4 sm:p-6 shadow-xl backdrop-blur-sm ring-1 ring-white/10"
            variants={itemVariants}
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-xl shadow-2xl ring-1 ring-white/10">
              <div
                ref={backgroundRef}
                className="flex h-full w-full items-center justify-center p-4 sm:p-8 transition-all duration-300"
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
                <AnimatePresence>
                  {showText &&
                    texts.map((textItem) => (
                      <motion.div
                        key={textItem.id}
                        drag
                        dragConstraints={backgroundRef}
                        dragMomentum={false}
                        className="draggable-text cursor-grab active:cursor-grabbing p-2"
                        onTap={() => setSelectedTextId(textItem.id)}
                        onDragEnd={(event, info) => {
                          setTexts((prevTexts) =>
                            prevTexts.map((t) =>
                              t.id === textItem.id
                                ? {
                                    ...t,
                                    x: t.x + info.offset.x,
                                    y: t.y + info.offset.y,
                                  }
                                : t
                            )
                          );
                        }}
                        initial={{
                          x: textItem.x,
                          y: textItem.y,
                          opacity: 0,
                          scale: 0.9,
                        }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: "absolute",
                          x: textItem.x,
                          y: textItem.y,
                          outline:
                            selectedTextId === textItem.id
                              ? "2px solid #38bdf8"
                              : "none",
                          outlineOffset: "4px",
                          borderRadius: "4px",
                        }}
                      >
                        <p
                          className={`text-center leading-relaxed font-medium tracking-wide transition-all duration-300 ${textItem.fontClass}`}
                          style={{
                            color: textItem.color,
                            opacity: textItem.opacity / 100,
                            fontSize: `${textItem.size}px`,
                            zIndex: 1,
                            textShadow: "0 2px 4px rgba(0,0,0,0.1)",
                          }}
                        >
                          {textItem.text}
                        </p>
                      </motion.div>
                    ))}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            className="grid gap-6 sm:gap-8 md:grid-cols-2"
            variants={itemVariants}
          >
            {/* Text Controls */}
            <div className="space-y-4 sm:space-y-6 rounded-2xl bg-slate-800/50 p-4 sm:p-6 shadow-xl backdrop-blur-sm ring-1 ring-white/10">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Text
                </h2>
                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleAddText}
                    className="flex items-center gap-1 rounded-md bg-slate-700 p-1.5 text-slate-300 transition-colors hover:bg-slate-600 hover:text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Add new text"
                  >
                    <Plus size={16} />
                  </motion.button>
                  {selectedTextId && (
                    <motion.button
                      onClick={handleRemoveText}
                      className="flex items-center gap-1 rounded-md bg-red-500/10 p-1.5 text-red-400 transition-colors hover:bg-red-500/20"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      title="Remove selected text"
                    >
                      <Trash size={16} />
                    </motion.button>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors">
                    <input
                      type="checkbox"
                      checked={showText}
                      onChange={(e) => setShowText(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-700/50 text-blue-400 focus:ring-blue-400 focus:ring-offset-0"
                    />
                    <span className="text-sm font-medium">Show text</span>
                  </label>
                </div>
              </div>
              <AnimatePresence>
                {showText && selectedText && (
                  <motion.div
                    className="space-y-4 sm:space-y-6"
                    key={selectedTextId}
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{
                      opacity: 1,
                      height: "auto",
                      y: 0,
                      transition: { duration: 0.3, y: { delay: 0.1 } },
                    }}
                    exit={{
                      opacity: 0,
                      y: -10,
                      height: 0,
                      transition: { duration: 0.2, y: { duration: 0.1 } },
                    }}
                  >
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Text
                      </label>
                      <input
                        type="text"
                        value={selectedText.text}
                        onChange={(e) =>
                          updateSelectedText({ text: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-slate-400 transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        placeholder="Enter your text..."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Font
                      </label>
                      <select
                        value={selectedText.fontClass}
                        onChange={(e) =>
                          updateSelectedText({ fontClass: e.target.value })
                        }
                        className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.name} value={font.className}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Text Color
                      </label>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                        <input
                          type="color"
                          value={selectedText.color}
                          onChange={(e) =>
                            updateSelectedText({ color: e.target.value })
                          }
                          className="h-10 w-20 cursor-pointer rounded-lg border border-slate-600 bg-slate-700/50 p-1 transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                        <input
                          type="text"
                          value={selectedText.color}
                          onChange={(e) =>
                            updateSelectedText({ color: e.target.value })
                          }
                          className="w-full sm:w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Text Opacity
                      </label>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Slider.Root
                          className="relative flex h-5 w-full touch-none select-none items-center"
                          value={[selectedText.opacity]}
                          onValueChange={([value]) =>
                            updateSelectedText({ opacity: value })
                          }
                          max={100}
                          step={1}
                        >
                          <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-700">
                            <Slider.Range className="absolute h-full bg-gradient-to-r from-blue-400 to-teal-400" />
                          </Slider.Track>
                          <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-lg ring-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 hover:bg-blue-50" />
                        </Slider.Root>
                        <span className="w-12 text-right text-sm text-slate-400">
                          {selectedText.opacity}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-300">
                        Text Size
                      </label>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <Slider.Root
                          className="relative flex h-5 w-full touch-none select-none items-center"
                          value={[selectedText.size]}
                          onValueChange={([value]) =>
                            updateSelectedText({ size: value })
                          }
                          min={12}
                          max={100}
                          step={1}
                        >
                          <Slider.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-slate-700">
                            <Slider.Range className="absolute h-full bg-gradient-to-r from-blue-400 to-teal-400" />
                          </Slider.Track>
                          <Slider.Thumb className="block h-5 w-5 rounded-full border-2 border-blue-400 bg-white shadow-lg ring-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-slate-800 hover:bg-blue-50" />
                        </Slider.Root>
                        <span className="w-16 text-right text-sm text-slate-400">
                          {selectedText.size}px
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Background Controls */}
            <div className="space-y-4 sm:space-y-6 rounded-2xl bg-slate-800/50 p-4 sm:p-6 shadow-xl backdrop-blur-sm ring-1 ring-white/10">
              <div className="flex items-center gap-3">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Background
                </h2>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
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
                        if (selectedTextId) {
                          updateSelectedText({
                            text: "cheat on everything..",
                          });
                        }
                      }}
                      className="h-4 w-4 border-slate-600 bg-slate-700/50 text-blue-400 transition-colors focus:ring-blue-400"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      Image
                    </span>
                  </label>
                </div>

                <AnimatePresence mode="wait">
                  {backgroundType === "gradient" ? (
                    <motion.div
                      key="gradient"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4 sm:space-y-6">
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
                              <div className="grid gap-3 sm:gap-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
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
                                    className="w-full sm:w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <span className="text-sm text-slate-400">
                                    From
                                  </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
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
                                    className="w-full sm:w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <span className="text-sm text-slate-400">
                                    Via
                                  </span>
                                </div>

                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
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
                                    className="w-full sm:w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                                  />
                                  <span className="text-sm text-slate-400">
                                    To
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-300">
                                Gradient Angle
                              </label>
                              <div className="flex items-center gap-3 sm:gap-4">
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
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                              <input
                                type="color"
                                value={backgroundColor}
                                onChange={(e) =>
                                  setBackgroundColor(e.target.value)
                                }
                                className="h-10 w-20 cursor-pointer rounded-lg border border-slate-600 bg-slate-700/50 p-1 transition-colors hover:border-blue-400 focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                              <input
                                type="text"
                                value={backgroundColor}
                                onChange={(e) =>
                                  setBackgroundColor(e.target.value)
                                }
                                className="w-full sm:w-32 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white transition-colors focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="image"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="space-y-4 sm:space-y-6">
                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-300">
                            Background Image
                          </label>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                            <input
                              type="file"
                              ref={fileInputRef}
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <motion.button
                              onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-sm sm:text-base text-slate-300 transition-colors hover:bg-slate-600 hover:text-white w-full sm:w-auto justify-center"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Upload size={18} />
                              Upload Image
                            </motion.button>
                            {backgroundImage && (
                              <motion.button
                                onClick={handleRemoveImage}
                                className="flex items-center gap-2 rounded-lg bg-red-500/10 px-4 py-2 text-sm sm:text-base text-red-400 transition-colors hover:bg-red-500/20 w-full sm:w-auto justify-center"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <X size={18} />
                                Remove
                              </motion.button>
                            )}
                          </div>
                        </div>

                        {backgroundImage && (
                          <>
                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-300">
                                Image Scale
                              </label>
                              <div className="flex items-center gap-3 sm:gap-4">
                                <Slider.Root
                                  className="relative flex h-5 w-full touch-none select-none items-center"
                                  value={[imageScale]}
                                  onValueChange={([value]) =>
                                    setImageScale(value)
                                  }
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

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <motion.div
        className="mx-auto max-w-6xl mt-8 sm:mt-12 text-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
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
        <p className="mt-2 sm:mt-4 text-xs text-slate-500">
          © {new Date().getFullYear()} AuraFlow. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}
