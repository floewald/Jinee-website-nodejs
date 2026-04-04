"use client";

import { useState, useCallback } from "react";
import GallerySelection from "./GallerySelection";
import DownloadToolbar from "./DownloadToolbar";
import DownloadModal from "./DownloadModal";
import Lightbox from "@/components/gallery/Lightbox";
import Slideshow from "@/components/gallery/Slideshow";
import { useLightbox } from "@/hooks/useLightbox";
import type { GalleryImage } from "@/components/gallery/Lightbox";

interface GalleryWithDownloadProps {
  images: GalleryImage[];
  project: string;
  showSlideshow?: boolean;
}

function toDownloadFilename(src: string): string {
  return src.split("/").pop()!.replace(/\.webp$/i, ".jpg");
}

export default function GalleryWithDownload({
  images,
  project,
  showSlideshow = false,
}: GalleryWithDownloadProps) {
  const [selectionMode, setSelectionMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const lightbox = useLightbox(images);

  const handleSelectionChange = useCallback(
    (filename: string, checked: boolean) => {
      setSelected((prev) =>
        checked ? [...prev, filename] : prev.filter((f) => f !== filename)
      );
    },
    []
  );

  const handleSelectAll = useCallback(() => {
    setSelected(images.map((img) => toDownloadFilename(img.src)));
  }, [images]);

  const handleClearSelection = useCallback(() => setSelected([]), []);

  const handleToggleSelection = useCallback(() => {
    setSelectionMode((v) => {
      if (v) setSelected([]);
      return !v;
    });
  }, []);

  return (
    <>
      {showSlideshow && images.length > 0 && <Slideshow images={images} />}
      <DownloadToolbar
        selectionMode={selectionMode}
        selectedCount={selected.length}
        totalCount={images.length}
        onToggleSelection={handleToggleSelection}
        onSelectAll={handleSelectAll}
        onClearSelection={handleClearSelection}
        onDownload={() => setModalOpen(true)}
      />

      <GallerySelection
        images={images}
        selectionMode={selectionMode}
        selected={selected}
        onImageClick={lightbox.open}
        onSelectionChange={handleSelectionChange}
      />

      <Lightbox
        images={images}
        isOpen={lightbox.isOpen}
        currentIndex={lightbox.currentIndex}
        onClose={lightbox.close}
        onNext={lightbox.next}
        onPrev={lightbox.prev}
      />

      <DownloadModal
        isOpen={modalOpen}
        selectedFiles={selected}
        project={project}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
