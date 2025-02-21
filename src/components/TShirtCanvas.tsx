
import { useEffect, useRef } from "react";
import { Canvas as FabricCanvas, Image as FabricImage, StaticCanvas } from "fabric";
import type { TShirtDesign } from "@/pages/Customizer";

interface TShirtCanvasProps {
  design: TShirtDesign;
}

export function TShirtCanvas({ design }: TShirtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<StaticCanvas | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    fabricRef.current = new StaticCanvas(canvasRef.current, {
      width: 400,
      height: 400,
      backgroundColor: design.color.toLowerCase(),
    });

    return () => {
      fabricRef.current?.dispose();
    };
  }, [design.color]);

  useEffect(() => {
    if (!design.designUrl || !fabricRef.current) return;

    fabricRef.current.clear();

    FabricImage.fromURL(design.designUrl, (img) => {
      if (!fabricRef.current) return;

      // Scale image to fit within boundaries while maintaining aspect ratio
      const maxDimension = 200;
      const scale = Math.min(
        maxDimension / img.width!,
        maxDimension / img.height!
      );

      img.scale(scale);

      // Center the image
      img.set({
        left: (fabricRef.current.width! - img.width! * scale) / 2,
        top: (fabricRef.current.height! - img.height! * scale) / 2,
      });

      fabricRef.current.add(img);
      fabricRef.current.renderAll();
    });
  }, [design.designUrl]);

  return (
    <div className="flex h-full items-center justify-center p-4">
      <canvas ref={canvasRef} className="max-w-full" />
    </div>
  );
}
